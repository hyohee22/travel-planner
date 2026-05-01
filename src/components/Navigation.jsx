import React from 'react';
import { Calendar, Map, CheckSquare, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { id: 'planner', label: '일정', icon: Calendar },
  { id: 'map', label: '지도', icon: Map },
  { id: 'checklist', label: '준비물', icon: CheckSquare },
  { id: 'budget', label: '예산', icon: Wallet },
];

export default function Navigation({ activeTab, setActiveTab }) {
  return (
    <nav style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 'var(--nav-height)',
      background: 'rgba(255, 255, 255, 0.92)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      borderTop: '1px solid rgba(245, 230, 224, 0.6)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingBottom: 'env(safe-area-inset-bottom, 4px)',
      paddingTop: '4px',
      zIndex: 100,
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
              transition: 'color 0.25s ease',
              width: '64px',
              position: 'relative',
              padding: '4px 0',
            }}
          >
            <motion.div
              animate={{
                scale: isActive ? 1 : 0.9,
                y: isActive ? -2 : 0,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              style={{
                padding: '8px 14px',
                borderRadius: '14px',
                background: isActive 
                  ? 'linear-gradient(135deg, rgba(255, 154, 139, 0.15), rgba(255, 209, 201, 0.15))' 
                  : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '2px',
              }}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </motion.div>
            <span style={{ 
              fontSize: '11px', 
              fontWeight: isActive ? '600' : '400',
              letterSpacing: '-0.01em',
            }}>
              {item.label}
            </span>
            {isActive && (
              <motion.div
                layoutId="nav-indicator"
                style={{
                  position: 'absolute',
                  top: 0,
                  width: '20px',
                  height: '3px',
                  borderRadius: '2px',
                  background: 'var(--gradient-warm)',
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
