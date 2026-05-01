import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Plus, Trash2, DollarSign, Settings, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function Budget() {
  const [expenses, setExpenses] = useLocalStorage('travel-budget-kr-v2', [
    { id: '1', description: '항공권', amount: 350, category: '교통비' },
    { id: '2', description: '호텔 (3박)', amount: 200, category: '숙박비' },
  ]);
  
  const [exchangeRate, setExchangeRate] = useLocalStorage('travel-exchange-rate', 1350); // KRW per 1 unit of foreign currency
  const [currencySymbol, setCurrencySymbol] = useLocalStorage('travel-currency-symbol', '$');

  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: '식비' });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
  const totalKRW = totalForeign * exchangeRate;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>예산 관리</h1>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
        >
          <Settings size={24} />
        </button>
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
          외화 합계: {currencySymbol}{totalForeign.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
        </div>
      </div>

      <form onSubmit={handleAddExpense} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>지출 추가 ({currencySymbol})</h3>
        
        <input 
          type="text" 
          className="input-field" 
          placeholder="내역" 
          value={newExpense.description}
          onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
          required
        />
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>{currencySymbol}</span>
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
          </div>
          <select 
            className="input-field" 
            value={newExpense.category}
            onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
            style={{ flex: 1, backgroundColor: 'var(--color-surface)' }}
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
                  {currencySymbol}{item.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  ₩{Math.round(item.amount * exchangeRate).toLocaleString()}
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

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600' }}>환율 설정</h2>
              <button onClick={() => setIsSettingsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                <X size={24} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', color: 'var(--color-text-muted)' }}>통화 기호 (예: $, ¥, €)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={currencySymbol}
                  onChange={e => setCurrencySymbol(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', color: 'var(--color-text-muted)' }}>환율 (1 {currencySymbol} 당 원화)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={exchangeRate}
                  onChange={e => setExchangeRate(parseFloat(e.target.value) || 0)}
                  step="any"
                />
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="button-primary" style={{ marginTop: '8px' }}>
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
