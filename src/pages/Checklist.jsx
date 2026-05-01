import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Plus, Trash2, Check, ShoppingBag, Briefcase } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [activeTab, setActiveTab] = useState('packing');
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
    setItems(items.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const deleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const completedCount = items.filter(i => i.completed).length;
  const progress = items.length === 0 ? 0 : (completedCount / items.length) * 100;

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div className="section-icon">
          {activeTab === 'packing' ? <Briefcase size={24} /> : <ShoppingBag size={24} />}
        </div>
        <div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>
            {activeTab === 'packing' ? '준비물 체크리스트' : '쇼핑 리스트'}
          </h1>
          <p className="page-subtitle">{items.length}개 중 {completedCount}개 {activeTab === 'packing' ? '챙김' : '구매완료'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', backgroundColor: 'var(--color-primary-ultralight)', padding: '4px', borderRadius: 'var(--radius-sm)' }}>
        {[
          { key: 'packing', label: '준비물', icon: <Briefcase size={16} /> },
          { key: 'shopping', label: '쇼핑 리스트', icon: <ShoppingBag size={16} /> },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
            background: activeTab === tab.key ? 'var(--color-surface)' : 'transparent',
            color: activeTab === tab.key ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '6px', transition: 'all 0.25s ease', fontSize: '14px',
            boxShadow: activeTab === tab.key ? 'var(--shadow-sm)' : 'none', fontFamily: 'Outfit',
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>진행률</span>
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-primary)' }}>{Math.round(progress)}%</span>
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Add Form */}
      <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <input type="text" className="input-field" placeholder={activeTab === 'packing' ? '새 준비물 추가...' : '새 쇼핑 아이템 추가...'} value={newItemText} onChange={(e) => setNewItemText(e.target.value)} />
        <motion.button type="submit" className="button-primary" style={{ width: 'auto', padding: '12px 16px', borderRadius: 'var(--radius-sm)' }} whileTap={{ scale: 0.92 }}>
          <Plus size={20} />
        </motion.button>
      </form>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '40px' }}>
        <AnimatePresence>
          {items.map(item => (
            <motion.div key={item.id} className="card" layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -60, height: 0, marginBottom: 0, padding: 0 }} transition={{ duration: 0.25 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', flex: 1, minWidth: 0 }} onClick={() => toggleItem(item.id)}>
                <motion.div className={`checkbox ${item.completed ? 'checkbox--checked' : ''}`} whileTap={{ scale: 0.85 }}>
                  {item.completed && <Check size={14} strokeWidth={3} />}
                </motion.div>
                <span style={{
                  fontSize: '15px', color: item.completed ? 'var(--color-text-muted)' : 'var(--color-text)',
                  textDecoration: item.completed ? 'line-through' : 'none', transition: 'all 0.2s ease',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {item.text}
                </span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '4px', opacity: 0.5, transition: 'opacity 0.2s' }}>
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {items.length === 0 && (
          <div className="empty-state">
            <p>{activeTab === 'packing' ? '준비물 체크리스트가 비어 있습니다.' : '쇼핑 리스트가 비어 있습니다.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
