import React, { useState, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, X, Camera, Plane, Hotel } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import ScheduleItem from '../components/ScheduleItem';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { differenceInDays, parseISO, isValid } from 'date-fns';

export default function Planner() {
  const [destination, setDestination] = useLocalStorage('travel-destination-kr', '프랑스, 파리');
  const [startDate, setStartDate] = useLocalStorage('travel-start-date', '');
  const [endDate, setEndDate] = useLocalStorage('travel-end-date', '');
  const [manualDaysCount, setManualDaysCount] = useLocalStorage('travel-days-count', 3);
  
  const [coverImage, setCoverImage] = useLocalStorage('travel-cover-image', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80');
  const [bookingInfo, setBookingInfo] = useLocalStorage('travel-booking-info', {
    flightOut: '', flightIn: '', hotel: '', hotelCheckIn: '', hotelCheckOut: ''
  });

  const [schedule, setSchedule] = useLocalStorage('travel-schedule-kr-v3', [
    { id: '1', day: 1, time: '09:00', place: '에펠탑', notes: '온라인으로 티켓 구매', mapLink: 'https://maps.google.com' },
    { id: '2', day: 1, time: '12:30', place: '카페 드 플로르', notes: '점심 예약', mapLink: 'https://maps.google.com' },
    { id: '3', day: 1, time: '15:00', place: '루브르 박물관', notes: '피라미드 앞 가이드 미팅', mapLink: 'https://maps.google.com' },
    { id: '4', day: 2, time: '10:00', place: '몽마르뜨 언덕', notes: '사크레쾨르 대성당', mapLink: 'https://maps.google.com' },
  ]);

  const [activeDay, setActiveDay] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [newItem, setNewItem] = useState({ time: '', place: '', notes: '', mapLink: '' });
  
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  let calculatedDays = manualDaysCount;
  if (startDate && endDate) {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    if (isValid(start) && isValid(end)) {
      const diff = differenceInDays(end, start) + 1;
      if (diff > 0 && diff > manualDaysCount) {
        calculatedDays = diff;
      }
    }
  }

  const activeSchedule = schedule.filter(item => item.day === activeDay).sort((a, b) => a.time.localeCompare(b.time));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSchedule((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleOpenEdit = (item) => {
    setEditingItemId(item.id);
    setNewItem({ time: item.time, place: item.place, notes: item.notes || '', mapLink: item.mapLink || '' });
    setIsModalOpen(true);
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.time || !newItem.place) return;
    
    if (editingItemId) {
      setSchedule(schedule.map(item => item.id === editingItemId ? { ...item, ...newItem } : item));
    } else {
      setSchedule([...schedule, { ...newItem, id: uuidv4(), day: activeDay }]);
    }
    
    setNewItem({ time: '', place: '', notes: '', mapLink: '' });
    setEditingItemId(null);
    setIsModalOpen(false);
  };

  const handleDeleteItem = () => {
    if (editingItemId) {
      setSchedule(schedule.filter(item => item.id !== editingItemId));
      setNewItem({ time: '', place: '', notes: '', mapLink: '' });
      setEditingItemId(null);
      setIsModalOpen(false);
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setCoverImage(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const daysArray = Array.from({ length: calculatedDays }, (_, i) => i + 1);

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      {/* Cover Image */}
      <div style={{ position: 'relative' }}>
        <img 
          src={coverImage} 
          alt="Destination Cover" 
          className="header-image"
          style={{ display: 'block' }}
        />
        <button 
          onClick={() => fileInputRef.current.click()}
          style={{
            position: 'absolute',
            bottom: '50px',
            right: '20px',
            background: 'rgba(0,0,0,0.5)',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            backdropFilter: 'blur(4px)'
          }}
        >
          <Camera size={16} /> 변경
        </button>
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleImageUpload} 
        />
      </div>
      
      <div style={{ padding: '20px', marginTop: '-40px', position: 'relative', zIndex: 2 }}>
        {/* Destination & Dates Card */}
        <div className="card glass-panel" style={{ marginBottom: '16px' }}>
          <input 
            type="text" 
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '28px',
              fontWeight: '700',
              color: 'var(--color-text)',
              width: '100%',
              outline: 'none',
              fontFamily: 'Outfit',
              padding: '0',
              marginBottom: '12px'
            }}
            placeholder="여행지를 입력하세요..."
          />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input 
              type="date" 
              className="input-field" 
              style={{ padding: '8px', fontSize: '14px' }}
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
            <span style={{ color: 'var(--color-text-muted)' }}>~</span>
            <input 
              type="date" 
              className="input-field" 
              style={{ padding: '8px', fontSize: '14px' }}
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Booking Info Card */}
        <div className="card" style={{ marginBottom: '24px', cursor: 'pointer' }} onClick={() => setIsBookingModalOpen(true)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
              예약 정보
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--color-primary)' }}>수정하기 &gt;</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '16px', backgroundColor: 'var(--color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                <Plane size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'var(--color-text)' }}>{bookingInfo.flightOut || '가는 편 항공권 정보 없음'}</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>{bookingInfo.flightIn || '오는 편 항공권 정보 없음'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '16px', backgroundColor: 'var(--color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                <Hotel size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'var(--color-text)' }}>{bookingInfo.hotel || '숙소 정보 없음'}</div>
                {(bookingInfo.hotelCheckIn || bookingInfo.hotelCheckOut) && (
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
                    {bookingInfo.hotelCheckIn} ~ {bookingInfo.hotelCheckOut}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Day Selector Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '8px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {daysArray.map(day => (
            <button 
              key={day}
              onClick={() => setActiveDay(day)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                backgroundColor: activeDay === day ? 'var(--color-primary)' : 'var(--color-surface)',
                color: activeDay === day ? 'white' : 'var(--color-text-muted)',
                fontWeight: activeDay === day ? '600' : '400',
                cursor: 'pointer',
                boxShadow: activeDay === day ? 'var(--shadow-sm)' : '0 2px 4px rgba(0,0,0,0.05)',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              {day}일차
            </button>
          ))}
          <button 
            onClick={() => setManualDaysCount(prev => prev + 1)}
            style={{ padding: '8px 16px', borderRadius: '20px', border: '1px dashed var(--color-border)', backgroundColor: 'transparent', color: 'var(--color-text-muted)', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            + 일차 추가
          </button>
          {manualDaysCount > 1 && (
            <button 
              onClick={() => {
                setManualDaysCount(prev => Math.max(1, prev - 1));
                if (activeDay > manualDaysCount - 1) setActiveDay(Math.max(1, manualDaysCount - 1));
              }}
              style={{ padding: '8px 16px', borderRadius: '20px', border: '1px dashed var(--color-danger)', backgroundColor: 'transparent', color: 'var(--color-danger)', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              - 일차 삭제
            </button>
          )}
        </div>

        <div className="timeline" style={{ paddingBottom: '120px' }}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={activeSchedule.map(s => s.id)} strategy={verticalListSortingStrategy}>
              {activeSchedule.map(item => (
                <ScheduleItem key={item.id} item={item} onEdit={handleOpenEdit} />
              ))}
            </SortableContext>
          </DndContext>
          {activeSchedule.length === 0 && (
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '20px' }}>
              {activeDay}일차 일정이 없습니다. 하단의 + 버튼을 눌러 추가해보세요!
            </p>
          )}
        </div>
      </div>

      <button className="floating-button" onClick={() => { setEditingItemId(null); setNewItem({ time: '', place: '', notes: '', mapLink: '' }); setIsModalOpen(true); }}>
        <Plus size={24} />
      </button>

      {/* Add/Edit Schedule Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600' }}>{activeDay}일차 일정 {editingItemId ? '수정' : '추가'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', color: 'var(--color-text-muted)' }}>시간</label>
                <input 
                  type="time" 
                  className="input-field" 
                  value={newItem.time}
                  onChange={(e) => setNewItem({...newItem, time: e.target.value})}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', color: 'var(--color-text-muted)' }}>장소</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="장소 이름" 
                  value={newItem.place}
                  onChange={(e) => setNewItem({...newItem, place: e.target.value})}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', color: 'var(--color-text-muted)' }}>메모</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="메모 (선택사항)" 
                  value={newItem.notes}
                  onChange={(e) => setNewItem({...newItem, notes: e.target.value})}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', color: 'var(--color-text-muted)' }}>지도 링크</label>
                <input 
                  type="url" 
                  className="input-field" 
                  placeholder="구글 지도 링크 (선택사항)" 
                  value={newItem.mapLink}
                  onChange={(e) => setNewItem({...newItem, mapLink: e.target.value})}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                {editingItemId && (
                  <button type="button" onClick={handleDeleteItem} className="button-secondary" style={{ backgroundColor: 'var(--color-danger)', color: 'white', flex: 1 }}>
                    삭제
                  </button>
                )}
                <button type="submit" className="button-primary" style={{ flex: 2 }}>
                  {editingItemId ? '수정 완료' : '일정에 추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Info Modal */}
      {isBookingModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600' }}>예약 정보 수정</h2>
              <button onClick={() => setIsBookingModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                <X size={24} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="card" style={{ padding: '12px' }}>
                <h3 style={{ fontSize: '14px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><Plane size={14}/> 항공편</h3>
                <input type="text" className="input-field" placeholder="가는 편 (예: 5/1 KE091 10:00)" value={bookingInfo.flightOut} onChange={e => setBookingInfo({...bookingInfo, flightOut: e.target.value})} style={{ marginBottom: '8px' }} />
                <input type="text" className="input-field" placeholder="오는 편 (예: 5/5 KE092 14:00)" value={bookingInfo.flightIn} onChange={e => setBookingInfo({...bookingInfo, flightIn: e.target.value})} />
              </div>
              <div className="card" style={{ padding: '12px' }}>
                <h3 style={{ fontSize: '14px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><Hotel size={14}/> 숙소</h3>
                <input type="text" className="input-field" placeholder="숙소 이름" value={bookingInfo.hotel} onChange={e => setBookingInfo({...bookingInfo, hotel: e.target.value})} style={{ marginBottom: '8px' }} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="date" className="input-field" value={bookingInfo.hotelCheckIn} onChange={e => setBookingInfo({...bookingInfo, hotelCheckIn: e.target.value})} />
                  <input type="date" className="input-field" value={bookingInfo.hotelCheckOut} onChange={e => setBookingInfo({...bookingInfo, hotelCheckOut: e.target.value})} />
                </div>
              </div>
              <button onClick={() => setIsBookingModalOpen(false)} className="button-primary">저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
