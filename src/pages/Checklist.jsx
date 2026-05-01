import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Plus, Trash2, Check, ShoppingBag, Briefcase } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function Checklist() {
  const [packingItems, setPackingItems] = useLocalStorage('travel-checklist-kr', [
    { id: '1', text: '여권 및 신분증', completed: false },
    { id: '2', text: '핸드폰 충전기', completed: false },
    { id: '3', text: '멀티 어댑터', completed: false },
  ]);

  const [shoppingItems, setShoppingItems] = useLocalStorage('travel-shopping-list-kr', [
    { id: '1', text: '기념 마그넷', completed: false },
    { id: '2', text: '가족 선물', completed: false },
  ]);
  
  const [activeTab, setActiveTab] = useState('packing'); // 'packing' or 'shopping'
  const [newItemText, setNewItemText] = useState('');

  const items = activeTab === 'packing' ? packingItems : shoppingItems;
  const setItems = activeTab === 'packing' ? setPackingItems : setShoppingItems;

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    
    setItems([...items, { id: uuidv4(), text: newItemText, completed: false }]);
    setNewItemText('');
  };

  const toggleItem = (id) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const deleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const completedCount = items.filter(i => i.completed).length;
  const progress = items.length === 0 ? 0 : (completedCount / items.length) * 100;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>
          {activeTab === 'packing' ? '준비물 체크리스트' : '쇼핑 리스트'}
        </h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', backgroundColor: 'var(--color-surface)', padding: '4px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
        <button 
          onClick={() => setActiveTab('packing')}
          style={{ 
            flex: 1, 
            padding: '10px', 
            borderRadius: '8px', 
            border: 'none', 
            backgroundColor: activeTab === 'packing' ? 'var(--color-primary-light)' : 'transparent',
            color: activeTab === 'packing' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <Briefcase size={18} />
          준비물
        </button>
        <button 
          onClick={() => setActiveTab('shopping')}
          style={{ 
            flex: 1, 
            padding: '10px', 
            borderRadius: '8px', 
            border: 'none', 
            backgroundColor: activeTab === 'shopping' ? 'var(--color-primary-light)' : 'transparent',
            color: activeTab === 'shopping' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <ShoppingBag size={18} />
          쇼핑 리스트
        </button>
      </div>

      <p className="page-subtitle" style={{ marginBottom: '16px' }}>
        {items.length}개 중 {completedCount}개 {activeTab === 'packing' ? '챙김' : '구매완료'}
      </p>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-border)', borderRadius: '4px', marginBottom: '32px', overflow: 'hidden' }}>
        <div style={{ 
          height: '100%', 
          width: `${progress}%`, 
          backgroundColor: 'var(--color-primary)',
          transition: 'width 0.3s ease'
        }} />
      </div>

      <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <input 
          type="text" 
          className="input-field" 
          placeholder={activeTab === 'packing' ? '새 준비물 추가...' : '새 쇼핑 아이템 추가...'}
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
        />
        <button type="submit" className="button-primary" style={{ width: 'auto', padding: '12px 16px' }}>
          <Plus size={20} />
        </button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map(item => (
          <div key={item.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1 }} onClick={() => toggleItem(item.id)}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                border: item.completed ? 'none' : '2px solid var(--color-border)',
                backgroundColor: item.completed ? 'var(--color-primary)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                transition: 'all 0.2s ease'
              }}>
                {item.completed && <Check size={16} />}
              </div>
              <span style={{ 
                fontSize: '16px', 
                color: item.completed ? 'var(--color-text-muted)' : 'var(--color-text)',
                textDecoration: item.completed ? 'line-through' : 'none',
                transition: 'all 0.2s ease'
              }}>
                {item.text}
              </span>
            </div>
            
            <button 
              onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '4px' }}
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '20px' }}>
            {activeTab === 'packing' ? '준비물 체크리스트가 비어 있습니다.' : '쇼핑 리스트가 비어 있습니다.'}
          </p>
        )}
      </div>
    </div>
  );
}
