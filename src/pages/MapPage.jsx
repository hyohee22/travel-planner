import React, { useState, useEffect, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { MapPin, Navigation as NavIcon, Map as MapIcon, LogIn, LogOut, ExternalLink, User } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon paths in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to dynamically fit bounds of markers
function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions && positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, positions]);
  return null;
}

export default function MapPage() {
  const [schedule] = useLocalStorage('travel-schedule-kr-v3', []);
  const [user, setUser] = useLocalStorage('guest-user', null);
  const [geocodeCache, setGeocodeCache] = useLocalStorage('travel-geocode-cache', {});
  
  const days = [...new Set(schedule.map(item => item.day))].sort((a, b) => a - b);
  const [activeDayMap, setActiveDayMap] = useState(days.length > 0 ? days[0] : 1);
  const activeDayLocations = schedule.filter(item => item.day === activeDayMap && item.place).sort((a, b) => a.time.localeCompare(b.time));

  const [geocodedLocations, setGeocodedLocations] = useState([]);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Geocode places to get lat/lng using free Nominatim API
  useEffect(() => {
    const geocodeLocations = async () => {
      setIsGeocoding(true);
      const newGeocoded = [];
      const newCache = { ...geocodeCache };
      let cacheUpdated = false;
      
      for (const item of activeDayLocations) {
        try {
          if (newCache[item.place]) {
            newGeocoded.push({ ...item, location: newCache[item.place] });
          } else {
            // Free Nominatim API (1 request per second recommended)
            await new Promise(r => setTimeout(r, 1000)); 
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(item.place)}&limit=1`);
            const data = await res.json();
            
            if (data && data.length > 0) {
              const location = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
              newGeocoded.push({ ...item, location });
              newCache[item.place] = location;
              cacheUpdated = true;
            }
          }
        } catch (error) {
          console.error("Geocoding failed for", item.place, error);
        }
      }
      
      setGeocodedLocations(newGeocoded);
      if (cacheUpdated) {
        setGeocodeCache(newCache);
      }
      setIsGeocoding(false);
    };

    if (activeDayLocations.length > 0) {
      geocodeLocations();
    } else {
      setGeocodedLocations([]);
    }
  }, [activeDayMap, schedule]); // Depend on activeDayMap to re-trigger when day changes

  const polylinePositions = useMemo(() => {
    return geocodedLocations.map(loc => [loc.location.lat, loc.location.lng]);
  }, [geocodedLocations]);

  const createNumberedIcon = (number) => {
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: var(--color-primary); color: white; width: 32px; height: 32px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-size: 14px;">${number}</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
  };

  const login = () => {
    // Mock Guest Login
    setUser({ name: '사용자', loggedIn: true });
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', backgroundColor: 'var(--color-primary-light)', borderRadius: '12px', color: 'var(--color-primary)' }}>
            <MapIcon size={28} />
          </div>
          <div>
            <h1 className="page-title" style={{ marginBottom: '0' }}>장소 목록</h1>
            <p className="page-subtitle">지도에서 일차별 동선을 확인하세요</p>
          </div>
        </div>
        
        {/* Mock Login Section */}
        <div>
          {user ? (
            <button onClick={handleLogout} className="card" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', cursor: 'pointer', border: 'none', background: 'var(--color-surface)' }}>
              <LogOut size={16} color="var(--color-text-muted)" />
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text)' }}>로그아웃</span>
            </button>
          ) : (
            <button onClick={login} className="button-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', width: 'auto' }}>
              <User size={16} />
              <span style={{ fontSize: '14px' }}>로그인</span>
            </button>
          )}
        </div>
      </div>

      {/* Day Selector */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '24px', paddingBottom: '8px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {days.map(day => (
          <button 
            key={day}
            onClick={() => setActiveDayMap(day)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              backgroundColor: activeDayMap === day ? 'var(--color-primary)' : 'var(--color-surface)',
              color: activeDayMap === day ? 'white' : 'var(--color-text-muted)',
              fontWeight: activeDayMap === day ? '600' : '400',
              cursor: 'pointer',
              boxShadow: activeDayMap === day ? 'var(--shadow-sm)' : '0 2px 4px rgba(0,0,0,0.05)',
              whiteSpace: 'nowrap'
            }}
          >
            {day}일차
          </button>
        ))}
      </div>

      {/* Leaflet Map */}
      <div style={{ position: 'relative', marginBottom: '24px', height: '400px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
        {isGeocoding && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ padding: '8px 16px', backgroundColor: 'var(--color-surface)', borderRadius: '20px', boxShadow: 'var(--shadow-sm)', fontWeight: '600', color: 'var(--color-primary)' }}>위치 불러오는 중...</span>
          </div>
        )}
        
        <MapContainer 
          center={[37.5665, 126.9780]} // Default Seoul
          zoom={2} 
          style={{ height: '100%', width: '100%', zIndex: 1 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {geocodedLocations.map((loc, index) => (
            <Marker 
              key={loc.id} 
              position={[loc.location.lat, loc.location.lng]}
              icon={createNumberedIcon(index + 1)}
            >
              <Popup>
                <strong>{index + 1}. {loc.place}</strong><br />
                {loc.time}
              </Popup>
            </Marker>
          ))}

          {polylinePositions.length > 1 && (
            <Polyline 
              positions={polylinePositions} 
              pathOptions={{ color: 'var(--color-primary)', weight: 4, opacity: 0.8, dashArray: '8, 8' }} 
            />
          )}

          {polylinePositions.length > 0 && <FitBounds positions={polylinePositions} />}
        </MapContainer>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {activeDayLocations.map((item, index) => (
          <div key={item.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', position: 'relative' }}>
            {index < activeDayLocations.length - 1 && (
              <div style={{ position: 'absolute', left: '32px', top: '48px', bottom: '-16px', width: '2px', backgroundColor: 'var(--color-border)', zIndex: 0 }} />
            )}
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '16px', 
              backgroundColor: 'var(--color-primary)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: '600',
              color: 'white',
              zIndex: 1
            }}>
              {index + 1}
            </div>
            
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-text)', marginBottom: '4px' }}>
                {item.place}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                {item.time}
              </p>
            </div>
            
            <a 
              href={item.mapLink || `https://maps.google.com/?q=${encodeURIComponent(item.place)}`}
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '20px', 
                backgroundColor: 'var(--color-surface)', 
                color: 'var(--color-primary)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform 0.2s ease',
                border: '1px solid var(--color-border)'
              }}
            >
              <ExternalLink size={18} />
            </a>
          </div>
        ))}

        {activeDayLocations.length === 0 && days.length > 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted)' }}>
            <MapPin size={48} style={{ opacity: 0.2, margin: '0 auto 16px auto' }} />
            <p>{activeDayMap}일차에 등록된 장소가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
