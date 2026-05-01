import React, { useState, useRef, useEffect } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, X, Camera, Plane, Hotel, Cloud, Sun, CloudRain, Image as ImageIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import ScheduleItem from '../components/ScheduleItem';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { differenceInDays, parseISO, isValid } from 'date-fns';

const WEATHER_ICONS = { sunny: Sun, cloudy: Cloud, rainy: CloudRain };

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
    { id: '1', day: 1, time: '09:00', place: '에펠탑', notes: '온라인으로 티켓 구매', mapLink: 'https://maps.google.com', image: '' },
    { id: '2', day: 1, time: '12:30', place: '카페 드 플로르', notes: '점심 예약', mapLink: 'https://maps.google.com', image: '' },
    { id: '3', day: 1, time: '15:00', place: '루브르 박물관', notes: '피라미드 앞 가이드 미팅', mapLink: 'https://maps.google.com', image: '' },
    { id: '4', day: 2, time: '10:00', place: '몽마르뜨 언덕', notes: '사크레쾨르 대성당', mapLink: 'https://maps.google.com', image: '' },
  ]);

  const [activeDay, setActiveDay] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [newItem, setNewItem] = useState({ time: '', place: '', notes: '', mapLink: '', image: '' });
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [weatherInfo] = useState({ temp: '18°C', condition: 'sunny', desc: '맑음' });
  const fileInputRef = useRef(null);
  const itemImageRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  let calculatedDays = manualDaysCount;
  if (startDate && endDate) {
    const s = parseISO(startDate), e = parseISO(endDate);
    if (isValid(s) && isValid(e)) {
      const diff = differenceInDays(e, s) + 1;
      if (diff > 0 && diff > manualDaysCount) calculatedDays = diff;
    }
  }

  const activeSchedule = schedule.filter(i => i.day === activeDay).sort((a, b) => a.time.localeCompare(b.time));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSchedule((items) => {
        const oldIdx = items.findIndex(i => i.id === active.id);
        const newIdx = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIdx, newIdx);
      });
    }
  };

  const handleOpenEdit = (item) => {
    setEditingItemId(item.id);
    setNewItem({ time: item.time, place: item.place, notes: item.notes || '', mapLink: item.mapLink || '', image: item.image || '' });
    setIsModalOpen(true);
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.time || !newItem.place) return;
    if (editingItemId) {
      setSchedule(schedule.map(i => i.id === editingItemId ? { ...i, ...newItem } : i));
    } else {
      setSchedule([...schedule, { ...newItem, id: uuidv4(), day: activeDay }]);
    }
    setNewItem({ time: '', place: '', notes: '', mapLink: '', image: '' });
    setEditingItemId(null);
    setIsModalOpen(false);
  };

  const handleDeleteItem = () => {
    if (editingItemId) {
      setSchedule(schedule.filter(i => i.id !== editingItemId));
      setNewItem({ time: '', place: '', notes: '', mapLink: '', image: '' });
      setEditingItemId(null);
      setIsModalOpen(false);
    }
  };

  const compressImage = (file, callback) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 600;
        const scale = MAX / Math.max(img.width, img.height);
        canvas.width = img.width * Math.min(scale, 1);
        canvas.height = img.height * Math.min(scale, 1);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        callback(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleCoverUpload = (e) => {
    if (e.target.files[0]) compressImage(e.target.files[0], setCoverImage);
  };

  const handleItemImageUpload = (e) => {
    if (e.target.files[0]) compressImage(e.target.files[0], (url) => setNewItem({ ...newItem, image: url }));
  };

  const daysArray = Array.from({ length: calculatedDays }, (_, i) => i + 1);
  const WeatherIcon = WEATHER_ICONS[weatherInfo.condition] || Sun;

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      {/* Cover */}
      <div style={{ position: 'relative' }}>
        <img src={coverImage} alt="Cover" className="header-image" style={{ display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)', borderRadius: '0 0 var(--radius-xl) var(--radius-xl)' }} />
        <button onClick={() => fileInputRef.current.click()} style={{
          position: 'absolute', bottom: '50px', right: '16px', background: 'rgba(255,255,255,0.25)', color: 'white',
          border: '1px solid rgba(255,255,255,0.4)', borderRadius: '20px', padding: '8px 14px',
          display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', backdropFilter: 'blur(8px)',
          fontSize: '13px', fontWeight: '500',
        }}>
          <Camera size={14} /> 변경
        </button>
        <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleCoverUpload} />
      </div>

      <div style={{ padding: '0 20px 20px', marginTop: '-44px', position: 'relative', zIndex: 2 }}>
        {/* Destination Card */}
        <motion.div className="card glass-panel" style={{ marginBottom: '14px', padding: '20px' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)}
            style={{ background: 'transparent', border: 'none', fontSize: '26px', fontWeight: '700', color: 'var(--color-text)', width: '100%', outline: 'none', fontFamily: 'Outfit', padding: 0, marginBottom: '12px', letterSpacing: '-0.02em' }}
            placeholder="여행지를 입력하세요..." />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input type="date" className="input-field" style={{ padding: '10px', fontSize: '13px' }} value={startDate} onChange={e => setStartDate(e.target.value)} />
            <span style={{ color: 'var(--color-text-muted)', fontWeight: '300' }}>~</span>
            <input type="date" className="input-field" style={{ padding: '10px', fontSize: '13px' }} value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </motion.div>

        {/* Weather Widget */}
        <motion.div className="weather-widget" style={{ marginBottom: '14px' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div>
            <p style={{ fontSize: '13px', opacity: 0.85, marginBottom: '4px' }}>{destination} 날씨</p>
            <p style={{ fontSize: '28px', fontWeight: '700' }}>{weatherInfo.temp}</p>
            <p style={{ fontSize: '14px', opacity: 0.9 }}>{weatherInfo.desc}</p>
          </div>
          <WeatherIcon size={48} strokeWidth={1.5} style={{ opacity: 0.9 }} />
        </motion.div>

        {/* Booking Info */}
        <motion.div className="card" style={{ marginBottom: '20px', cursor: 'pointer' }} onClick={() => setIsBookingModalOpen(true)} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600' }}>예약 정보</h3>
            <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: '500' }}>수정하기 &gt;</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '12px', background: 'var(--color-primary-ultralight)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}><Plane size={16} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'var(--color-text)', fontSize: '14px' }}>{bookingInfo.flightOut || '가는 편 항공권 정보 없음'}</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>{bookingInfo.flightIn || '오는 편 항공권 정보 없음'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '12px', background: 'var(--color-primary-ultralight)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}><Hotel size={16} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'var(--color-text)', fontSize: '14px' }}>{bookingInfo.hotel || '숙소 정보 없음'}</div>
                {(bookingInfo.hotelCheckIn || bookingInfo.hotelCheckOut) && (
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>{bookingInfo.hotelCheckIn} ~ {bookingInfo.hotelCheckOut}</div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Day Tabs */}
        <div className="day-selector" style={{ marginBottom: '12px' }}>
          {daysArray.map(day => (
            <button key={day} onClick={() => setActiveDay(day)} className={`day-pill ${activeDay === day ? 'day-pill--active' : 'day-pill--inactive'}`}>
              {day}일차
            </button>
          ))}
          <button onClick={() => setManualDaysCount(p => p + 1)} className="day-pill day-pill--add">+ 추가</button>
          {manualDaysCount > 1 && (
            <button onClick={() => { setManualDaysCount(p => Math.max(1, p - 1)); if (activeDay > manualDaysCount - 1) setActiveDay(Math.max(1, manualDaysCount - 1)); }} className="day-pill day-pill--remove">- 삭제</button>
          )}
        </div>

        {/* Timeline */}
        <div className="timeline" style={{ paddingBottom: '100px' }}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={activeSchedule.map(s => s.id)} strategy={verticalListSortingStrategy}>
              {activeSchedule.map((item, idx) => (
                <ScheduleItem key={item.id} item={item} onEdit={handleOpenEdit} index={idx} />
              ))}
            </SortableContext>
          </DndContext>
          {activeSchedule.length === 0 && (
            <div className="empty-state">
              <Plus size={40} className="empty-state-icon" />
              <p>{activeDay}일차 일정이 없습니다.<br />아래 + 버튼을 눌러 추가해보세요!</p>
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <motion.button className="floating-button" onClick={() => { setEditingItemId(null); setNewItem({ time: '', place: '', notes: '', mapLink: '', image: '' }); setIsModalOpen(true); }}
        whileTap={{ scale: 0.88 }} whileHover={{ scale: 1.08 }}>
        <Plus size={24} />
      </motion.button>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)}>
            <motion.div className="modal-content" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }} onClick={e => e.stopPropagation()}>
              <div className="modal-handle" />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.02em' }}>{activeDay}일차 일정 {editingItemId ? '수정' : '추가'}</h2>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'var(--color-primary-ultralight)', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', borderRadius: '10px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
              </div>
              <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--color-text-muted)', fontWeight: '500' }}>시간</label>
                  <input type="time" className="input-field" value={newItem.time} onChange={(e) => setNewItem({ ...newItem, time: e.target.value })} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--color-text-muted)', fontWeight: '500' }}>장소</label>
                  <input type="text" className="input-field" placeholder="장소 이름" value={newItem.place} onChange={(e) => setNewItem({ ...newItem, place: e.target.value })} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--color-text-muted)', fontWeight: '500' }}>메모</label>
                  <input type="text" className="input-field" placeholder="메모 (선택사항)" value={newItem.notes} onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--color-text-muted)', fontWeight: '500' }}>지도 링크</label>
                  <input type="url" className="input-field" placeholder="구글 지도 링크 (선택사항)" value={newItem.mapLink} onChange={(e) => setNewItem({ ...newItem, mapLink: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--color-text-muted)', fontWeight: '500' }}>사진</label>
                  <button type="button" onClick={() => itemImageRef.current.click()} style={{
                    width: '100%', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1.5px dashed var(--color-border)',
                    background: 'var(--color-primary-ultralight)', color: 'var(--color-primary)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'Outfit', fontSize: '14px', fontWeight: '500',
                  }}>
                    <ImageIcon size={18} /> {newItem.image ? '사진 변경' : '사진 추가'}
                  </button>
                  <input type="file" accept="image/*" ref={itemImageRef} style={{ display: 'none' }} onChange={handleItemImageUpload} />
                  {newItem.image && <img src={newItem.image} alt="preview" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginTop: '8px' }} />}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  {editingItemId && (
                    <button type="button" onClick={handleDeleteItem} className="button-danger" style={{ flex: 1 }}>삭제</button>
                  )}
                  <button type="submit" className="button-primary" style={{ flex: 2 }}>{editingItemId ? '수정 완료' : '일정에 추가'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Modal */}
      <AnimatePresence>
        {isBookingModalOpen && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsBookingModalOpen(false)}>
            <motion.div className="modal-content" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }} onClick={e => e.stopPropagation()}>
              <div className="modal-handle" />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700' }}>예약 정보 수정</h2>
                <button onClick={() => setIsBookingModalOpen(false)} style={{ background: 'var(--color-primary-ultralight)', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', borderRadius: '10px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="card" style={{ padding: '14px' }}>
                  <h3 style={{ fontSize: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', fontWeight: '600' }}><Plane size={14} /> 항공편</h3>
                  <input type="text" className="input-field" placeholder="가는 편 (예: 5/1 KE091 10:00)" value={bookingInfo.flightOut} onChange={e => setBookingInfo({ ...bookingInfo, flightOut: e.target.value })} style={{ marginBottom: '8px' }} />
                  <input type="text" className="input-field" placeholder="오는 편 (예: 5/5 KE092 14:00)" value={bookingInfo.flightIn} onChange={e => setBookingInfo({ ...bookingInfo, flightIn: e.target.value })} />
                </div>
                <div className="card" style={{ padding: '14px' }}>
                  <h3 style={{ fontSize: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', fontWeight: '600' }}><Hotel size={14} /> 숙소</h3>
                  <input type="text" className="input-field" placeholder="숙소 이름" value={bookingInfo.hotel} onChange={e => setBookingInfo({ ...bookingInfo, hotel: e.target.value })} style={{ marginBottom: '8px' }} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="date" className="input-field" value={bookingInfo.hotelCheckIn} onChange={e => setBookingInfo({ ...bookingInfo, hotelCheckIn: e.target.value })} />
                    <input type="date" className="input-field" value={bookingInfo.hotelCheckOut} onChange={e => setBookingInfo({ ...bookingInfo, hotelCheckOut: e.target.value })} />
                  </div>
                </div>
                <button onClick={() => setIsBookingModalOpen(false)} className="button-primary">저장</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
