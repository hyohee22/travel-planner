import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, MapPin, AlignLeft, ExternalLink, Pencil, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ScheduleItem({ item, onEdit, index }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <motion.div 
      className="timeline-item" 
      ref={setNodeRef} 
      style={style}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: (index || 0) * 0.06, duration: 0.35 }}
    >
      <div className="timeline-dot" />
      <div className="card" style={{ 
        display: 'flex', 
        gap: '12px', 
        padding: '16px',
        borderLeft: `3px solid var(--color-primary-light)`,
      }}>
        <div 
          {...attributes} 
          {...listeners} 
          style={{ 
            cursor: 'grab', 
            display: 'flex', 
            alignItems: 'center', 
            color: 'var(--color-text-muted)',
            opacity: 0.5,
            touchAction: 'none',
          }}
        >
          <GripVertical size={18} />
        </div>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            marginBottom: '6px',
          }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <span style={{ 
                fontSize: '13px', 
                fontWeight: '600', 
                color: 'var(--color-primary)', 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: 'var(--color-primary-ultralight)',
                padding: '3px 10px',
                borderRadius: '20px',
                marginBottom: '6px',
              }}>
                {item.time}
              </span>
              <h3 style={{ 
                fontSize: '17px', 
                fontWeight: '600', 
                color: 'var(--color-text)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                marginTop: '6px',
                letterSpacing: '-0.01em',
              }}>
                <MapPin size={15} color="var(--color-primary)" />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.place}
                </span>
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0, marginLeft: '8px' }}>
              {item.mapLink && (
                <a 
                  href={item.mapLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: 'var(--color-primary)', 
                    display: 'flex', 
                    alignItems: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--color-primary-ultralight)',
                    justifyContent: 'center',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  <ExternalLink size={15} />
                </a>
              )}
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                style={{ 
                  background: 'var(--color-primary-ultralight)', 
                  border: 'none', 
                  color: 'var(--color-primary)', 
                  cursor: 'pointer', 
                  padding: 0, 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  transition: 'transform 0.2s ease',
                }}
              >
                <Pencil size={15} />
              </button>
            </div>
          </div>
          
          {item.notes && (
            <p style={{ 
              fontSize: '14px', 
              color: 'var(--color-text-muted)', 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '6px', 
              marginTop: '8px',
              lineHeight: '1.5',
            }}>
              <AlignLeft size={14} style={{ marginTop: '3px', flexShrink: 0, opacity: 0.6 }} />
              <span>{item.notes}</span>
            </p>
          )}

          {item.image && (
            <img 
              src={item.image} 
              alt={item.place} 
              className="schedule-image-thumb"
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
