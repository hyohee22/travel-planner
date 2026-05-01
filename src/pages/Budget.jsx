import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const CURRENCIES = [
  { code: 'KRW', symbol: '₩', rate: 1, label: '원화 (KRW)' },
  { code: 'JPY', symbol: '¥', rate: 9, label: '엔화 (JPY)' },
  { code: 'USD', symbol: '$', rate: 1350, label: '달러 (USD)' },
  { code: 'EUR', symbol: '€', rate: 1450, label: '유로 (EUR)' },
];

export default function Budget() {
  const [expenses, setExpenses] = useLocalStorage('travel-budget-kr-v2', []);
  const [selectedCurrency, setSelectedCurrency] = useLocalStorage('travel-currency-code', 'JPY');

  const activeCurrency = CURRENCIES.find(c => c.code === selectedCurrency) || CURRENCIES[1];

  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: '식비' });

  const categories = ['식비', '교통비', '숙박비', '활동/관광', '쇼핑', '기타'];

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount) return;
    
    setExpenses([...expenses, { 
      id: uuidv4(), 
      description: newExpense.description, 
      amount: parseFloat(newExpense.amount),
      category: newExpense.category
    }]);
    setNewExpense({ description: '', amount: '', category: '식비' });
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(item => item.id !== id));
  };

  // Total in foreign currency
  const totalForeign = expenses.reduce((sum, item) => sum + item.amount, 0);
  // Total in KRW
  const totalKRW = totalForeign * activeCurrency.rate;
  // Live KRW for new expense
  const liveKRW = (parseFloat(newExpense.amount) || 0) * activeCurrency.rate;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>예산 관리</h1>
        
        {/* Currency Selector Dropdown */}
        <select 
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value)}
          style={{ 
            padding: '8px 12px', 
            borderRadius: 'var(--radius-sm)', 
            border: '1px solid var(--color-border)', 
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-primary)',
            fontWeight: '600',
            fontFamily: 'Outfit',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          {CURRENCIES.map(c => (
            <option key={c.code} value={c.code}>{c.label}</option>
          ))}
        </select>
      </div>
      
      {/* Total Card */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
        color: 'white',
        marginBottom: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '32px 16px',
        position: 'relative'
      }}>
        <span style={{ fontSize: '16px', opacity: 0.9, marginBottom: '8px' }}>총 지출 (원화 환산)</span>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: '36px', fontWeight: '700', marginBottom: '4px' }}>
          <span>₩{Math.round(totalKRW).toLocaleString()}</span>
        </div>
        <div style={{ fontSize: '14px', opacity: 0.8 }}>
          외화 합계: {activeCurrency.symbol}{totalForeign.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
        </div>
      </div>

      <form onSubmit={handleAddExpense} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>지출 추가 ({activeCurrency.symbol})</h3>
        
        <input 
          type="text" 
          className="input-field" 
          placeholder="내역" 
          value={newExpense.description}
          onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
          required
        />
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <span style={{ position: 'absolute', left: '12px', top: '24px', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>{activeCurrency.symbol}</span>
            <input 
              type="number" 
              className="input-field" 
              placeholder="금액" 
              value={newExpense.amount}
              onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
              required
              min="0"
              step="any"
              style={{ paddingLeft: '28px', width: '100%' }}
            />
            {newExpense.amount && (
              <span style={{ fontSize: '12px', color: 'var(--color-primary)', marginTop: '4px', fontWeight: '600' }}>
                약 ₩{Math.round(liveKRW).toLocaleString()} 원
              </span>
            )}
          </div>
          <select 
            className="input-field" 
            value={newExpense.category}
            onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
            style={{ flex: 1, backgroundColor: 'var(--color-surface)', height: '45.6px' }}
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        
        <button type="submit" className="button-primary" style={{ marginTop: '8px' }}>
          지출 추가
        </button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>지출 내역</h3>
        {expenses.map(item => (
          <div key={item.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
            <div>
              <div style={{ fontWeight: '600', color: 'var(--color-text)', marginBottom: '4px' }}>{item.description}</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-background)', padding: '2px 8px', borderRadius: '12px', display: 'inline-block' }}>
                {item.category}
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '600', color: 'var(--color-text)' }}>
                  {activeCurrency.symbol}{item.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  ₩{Math.round(item.amount * activeCurrency.rate).toLocaleString()}
                </div>
              </div>
              <button 
                onClick={() => deleteExpense(item.id)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {expenses.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '20px' }}>
            아직 지출 내역이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}
