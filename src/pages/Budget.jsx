import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Trash2, Wallet, TrendingUp, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';

const CURRENCIES = [
  { code: 'KRW', symbol: '₩', rate: 1, label: '원화 (KRW)' },
  { code: 'JPY', symbol: '¥', rate: 9, label: '엔화 (JPY)' },
  { code: 'USD', symbol: '$', rate: 1350, label: '달러 (USD)' },
  { code: 'EUR', symbol: '€', rate: 1450, label: '유로 (EUR)' },
];

const CATEGORY_COLORS = {
  '식비': { bg: '#FFF0ED', color: '#FF9A8B' },
  '교통비': { bg: '#E8F8F0', color: '#8ED1B5' },
  '숙박비': { bg: '#F0EDFF', color: '#A18CD1' },
  '활동/관광': { bg: '#FFF8EB', color: '#FFB84D' },
  '쇼핑': { bg: '#FFDEE9', color: '#E8857A' },
  '기타': { bg: '#F5F0EB', color: '#A89193' },
};

export default function Budget() {
  const [expenses, setExpenses] = useLocalStorage('travel-budget-kr-v2', []);
  const [selectedCurrency, setSelectedCurrency] = useLocalStorage('travel-currency-code', 'JPY');
  const activeCurrency = CURRENCIES.find(c => c.code === selectedCurrency) || CURRENCIES[1];
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: '식비' });
  const categories = ['식비', '교통비', '숙박비', '활동/관광', '쇼핑', '기타'];

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount) return;
    setExpenses([...expenses, { id: uuidv4(), description: newExpense.description, amount: parseFloat(newExpense.amount), category: newExpense.category }]);
    setNewExpense({ description: '', amount: '', category: '식비' });
  };

  const deleteExpense = (id) => setExpenses(expenses.filter(i => i.id !== id));

  const totalForeign = expenses.reduce((s, i) => s + i.amount, 0);
  const totalKRW = totalForeign * activeCurrency.rate;
  const liveKRW = (parseFloat(newExpense.amount) || 0) * activeCurrency.rate;

  const categoryBreakdown = useMemo(() => {
    const map = {};
    expenses.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div className="section-header" style={{ marginBottom: 0 }}>
          <div className="section-icon"><Wallet size={24} /></div>
          <div>
            <h1 className="page-title" style={{ marginBottom: 0 }}>예산 관리</h1>
            <p className="page-subtitle">지출을 기록하고 관리하세요</p>
          </div>
        </div>
        <select value={selectedCurrency} onChange={(e) => setSelectedCurrency(e.target.value)} style={{
          padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)', color: 'var(--color-primary)', fontWeight: '600',
          fontFamily: 'Outfit', cursor: 'pointer', outline: 'none', fontSize: '13px',
        }}>
          {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
        </select>
      </div>

      {/* Total Card */}
      <motion.div className="card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{
        background: 'var(--gradient-primary)', color: 'white', marginBottom: '20px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 16px',
        border: 'none',
      }}>
        <span style={{ fontSize: '14px', opacity: 0.85, marginBottom: '6px' }}>총 지출 (원화 환산)</span>
        <div style={{ fontSize: '34px', fontWeight: '700', letterSpacing: '-0.03em', marginBottom: '4px' }}>
          ₩{Math.round(totalKRW).toLocaleString()}
        </div>
        <div style={{ fontSize: '14px', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <TrendingUp size={14} /> 외화: {activeCurrency.symbol}{totalForeign.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
        </div>
      </motion.div>

      {/* Category Breakdown */}
      {categoryBreakdown.length > 0 && (
        <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '14px' }}>카테고리별 지출</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {categoryBreakdown.map(([cat, amount]) => {
              const pct = totalForeign > 0 ? (amount / totalForeign) * 100 : 0;
              const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS['기타'];
              return (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                    <span style={{ fontWeight: '500', color: colors.color }}>{cat}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>{activeCurrency.symbol}{amount.toLocaleString()} ({Math.round(pct)}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: colors.bg, borderRadius: '3px', overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: 0.1 }}
                      style={{ height: '100%', backgroundColor: colors.color, borderRadius: '3px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Expense Form */}
      <form onSubmit={handleAddExpense} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600' }}>지출 추가 ({activeCurrency.symbol})</h3>
        <input type="text" className="input-field" placeholder="내역" value={newExpense.description} onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })} required />
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: '14px' }}>{activeCurrency.symbol}</span>
              <input type="number" className="input-field" placeholder="금액" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} required min="0" step="any" style={{ paddingLeft: '30px' }} />
            </div>
            {newExpense.amount && (
              <span style={{ fontSize: '12px', color: 'var(--color-primary)', marginTop: '4px', fontWeight: '600' }}>
                약 ₩{Math.round(liveKRW).toLocaleString()} 원
              </span>
            )}
          </div>
          <select className="input-field" value={newExpense.category} onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })} style={{ flex: 1, backgroundColor: 'var(--color-surface)' }}>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <motion.button type="submit" className="button-primary" style={{ marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} whileTap={{ scale: 0.97 }}>
          <Plus size={18} /> 지출 추가
        </motion.button>
      </form>

      {/* Expenses List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '40px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>지출 내역</h3>
        <AnimatePresence>
          {expenses.map(item => {
            const colors = CATEGORY_COLORS[item.category] || CATEGORY_COLORS['기타'];
            return (
              <motion.div key={item.id} className="card" layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -60 }} transition={{ duration: 0.25 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: '600', color: 'var(--color-text)', marginBottom: '4px', fontSize: '15px' }}>{item.description}</div>
                  <span className="category-badge" style={{ backgroundColor: colors.bg, color: colors.color }}>{item.category}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '600', color: 'var(--color-text)', fontSize: '15px' }}>
                      {activeCurrency.symbol}{item.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      ₩{Math.round(item.amount * activeCurrency.rate).toLocaleString()}
                    </div>
                  </div>
                  <button onClick={() => deleteExpense(item.id)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', opacity: 0.5 }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {expenses.length === 0 && (
          <div className="empty-state"><p>아직 지출 내역이 없습니다.</p></div>
        )}
      </div>
    </div>
  );
}
