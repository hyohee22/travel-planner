import React from 'react';
import { Calendar, Map, CheckSquare, DollarSign } from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'planner', label: '일정', icon: Calendar },
    { id: 'map', label: '지도', icon: Map },
    { id: 'checklist', label: '준비물', icon: CheckSquare },
    { id: 'budget', label: '예산', icon: DollarSign }
  ];

  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      height: '80px',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid var(--color-border)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom, 20px)'
    }}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
              transition: 'color 0.2s ease',
              width: '60px'
            }}
          >
            <div style={{
              padding: '8px',
              borderRadius: '16px',
              backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '4px',
              transition: 'background-color 0.2s ease'
            }}>
              <Icon size={24} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: isActive ? '600' : '400' }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
