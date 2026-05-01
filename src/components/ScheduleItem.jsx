import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, MapPin, AlignLeft, ExternalLink, Pencil } from 'lucide-react';

export default function ScheduleItem({ item, onEdit }) {
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
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div className="timeline-item" ref={setNodeRef} style={style}>
      <div className="timeline-dot" />
      <div className="card" style={{ display: 'flex', gap: '12px', padding: '16px' }}>
        <div 
          {...attributes} 
          {...listeners} 
          style={{ cursor: 'grab', display: 'flex', alignItems: 'center', color: 'var(--color-text-muted)' }}
        >
          <GripVertical size={20} />
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-primary)', display: 'block', marginBottom: '4px' }}>
                {item.time}
              </span>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} />
                {item.place}
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {item.mapLink && (
                <a 
                  href={item.mapLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}
                >
                  <ExternalLink size={18} />
                </a>
              )}
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
              >
                <Pencil size={18} />
              </button>
            </div>
          </div>
          
          {item.notes && (
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '8px' }}>
              <AlignLeft size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>{item.notes}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
