import React, { useState, useEffect, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { MapPin, Map as MapIcon, ExternalLink } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { motion } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions?.length > 0) {
      map.fitBounds(L.latLngBounds(positions), { padding: [50, 50] });
    }
  }, [map, positions]);
  return null;
}

export default function MapPage() {
  const [schedule] = useLocalStorage('travel-schedule-kr-v3', []);
  const [geocodeCache, setGeocodeCache] = useLocalStorage('travel-geocode-cache', {});
  const days = [...new Set(schedule.map(i => i.day))].sort((a, b) => a - b);
  const [activeDayMap, setActiveDayMap] = useState(days.length > 0 ? days[0] : 1);
  const activeDayLocations = schedule.filter(i => i.day === activeDayMap && i.place).sort((a, b) => a.time.localeCompare(b.time));

  const [geocodedLocations, setGeocodedLocations] = useState([]);
  const [isGeocoding, setIsGeocoding] = useState(false);

  useEffect(() => {
    const geocode = async () => {
      setIsGeocoding(true);
      const results = [];
      const newCache = { ...geocodeCache };
      let updated = false;
      for (const item of activeDayLocations) {
        try {
          if (newCache[item.place]) {
            results.push({ ...item, location: newCache[item.place] });
          } else {
            await new Promise(r => setTimeout(r, 1000));
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(item.place)}&limit=1`);
            const data = await res.json();
            if (data?.length > 0) {
              const loc = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
              results.push({ ...item, location: loc });
              newCache[item.place] = loc;
              updated = true;
            }
          }
        } catch (err) { console.error("Geocode error:", item.place, err); }
      }
      setGeocodedLocations(results);
      if (updated) setGeocodeCache(newCache);
      setIsGeocoding(false);
    };
    activeDayLocations.length > 0 ? geocode() : setGeocodedLocations([]);
  }, [activeDayMap, schedule]);

  const polyline = useMemo(() => geocodedLocations.map(l => [l.location.lat, l.location.lng]), [geocodedLocations]);

  const numberedIcon = (n) => L.divIcon({
    className: '', iconSize: [32, 32], iconAnchor: [16, 16],
    html: `<div style="background:linear-gradient(135deg,#FF9A8B,#FECFEF);color:#fff;width:32px;height:32px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-weight:700;border:2.5px solid #fff;box-shadow:0 2px 8px rgba(255,154,139,0.4);font-size:13px;font-family:Outfit,sans-serif">${n}</div>`,
  });

  return (
    <div style={{ padding: '24px' }}>
      <div className="section-header">
        <div className="section-icon"><MapIcon size={24} /></div>
        <div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>장소 목록</h1>
          <p className="page-subtitle">지도에서 일차별 동선을 확인하세요</p>
        </div>
      </div>

      {/* Day Selector */}
      <div className="day-selector" style={{ marginBottom: '20px' }}>
        {days.map(day => (
          <button key={day} onClick={() => setActiveDayMap(day)} className={`day-pill ${activeDayMap === day ? 'day-pill--active' : 'day-pill--inactive'}`}>
            {day}일차
          </button>
        ))}
      </div>

      {/* Map */}
      <div style={{ position: 'relative', marginBottom: '20px', height: '360px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}>
        {isGeocoding && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(255,248,246,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ padding: '10px 20px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-full)', boxShadow: 'var(--shadow-md)', fontWeight: '600', color: 'var(--color-primary)', fontSize: '14px' }}>위치 불러오는 중...</span>
          </div>
        )}
        <MapContainer center={[37.5665, 126.9780]} zoom={2} style={{ height: '100%', width: '100%', zIndex: 1 }}>
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {geocodedLocations.map((loc, i) => (
            <Marker key={loc.id} position={[loc.location.lat, loc.location.lng]} icon={numberedIcon(i + 1)}>
              <Popup><strong>{i + 1}. {loc.place}</strong><br />{loc.time}</Popup>
            </Marker>
          ))}
          {polyline.length > 1 && <Polyline positions={polyline} pathOptions={{ color: '#FF9A8B', weight: 3, opacity: 0.7, dashArray: '8, 8' }} />}
          {polyline.length > 0 && <FitBounds positions={polyline} />}
        </MapContainer>
      </div>

      {/* Location Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '40px' }}>
        {activeDayLocations.map((item, i) => (
          <motion.div key={item.id} className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', position: 'relative' }}>
            {i < activeDayLocations.length - 1 && (
              <div style={{ position: 'absolute', left: '35px', top: '52px', bottom: '-12px', width: '2px', background: 'linear-gradient(180deg, var(--color-primary-light), transparent)', zIndex: 0 }} />
            )}
            <div style={{
              width: '34px', height: '34px', borderRadius: '12px', background: 'var(--gradient-warm)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: 'white', fontSize: '14px', zIndex: 1, flexShrink: 0,
            }}>{i + 1}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-text)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.place}</h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{item.time}</p>
            </div>
            <a href={item.mapLink || `https://maps.google.com/?q=${encodeURIComponent(item.place)}`} target="_blank" rel="noopener noreferrer"
              style={{ width: '38px', height: '38px', borderRadius: '12px', backgroundColor: 'var(--color-primary-ultralight)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'transform 0.2s' }}>
              <ExternalLink size={16} />
            </a>
          </motion.div>
        ))}
        {activeDayLocations.length === 0 && days.length > 0 && (
          <div className="empty-state">
            <MapPin size={40} className="empty-state-icon" />
            <p>{activeDayMap}일차에 등록된 장소가 없습니다.</p>
          </div>
        )}
        {days.length === 0 && (
          <div className="empty-state">
            <MapPin size={40} className="empty-state-icon" />
            <p>일정 탭에서 먼저 장소를 추가해주세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
