import { useEffect, useRef } from 'react';
import { Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { POI, POICategory } from '../types';
import { POIS } from '../data/pois';

interface POIMarkersProps {
  activeCategories: POICategory[];
  onPOIClick: (poi: POI) => void;
  selectedPOI: POI | null;
}

function createPOIIcon(poi: POI): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `
      <div class="poi-marker-root">
        <div class="poi-marker-circle" style="border-color:${poi.color}; box-shadow:0 0 10px ${poi.color}30, 0 2px 8px rgba(0,0,0,0.4);">
          ${poi.emoji}
        </div>
        <div class="poi-marker-label" style="border-color:${poi.color}40;">
          ${poi.name}
        </div>
      </div>
    `,
    iconSize: [28, 52],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

function createSelectedPOIIcon(poi: POI): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `
      <div class="poi-marker-root poi-marker-selected">
        <div class="poi-marker-circle poi-selected-circle" style="border-color:${poi.color}; box-shadow:0 0 20px ${poi.color}60, 0 0 40px ${poi.color}30, 0 4px 16px rgba(0,0,0,0.5);">
          ${poi.emoji}
        </div>
        <div class="poi-marker-label poi-selected-label" style="background:${poi.color}; border-color:${poi.color}; color:#0a0a1a; box-shadow:0 0 12px ${poi.color}60;">
          ${poi.name}
        </div>
      </div>
    `,
    iconSize: [36, 62],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

function SinglePOIMarker({ poi, onPOIClick }: { poi: POI; onPOIClick: (poi: POI) => void }) {
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    const el = marker.getElement();
    if (!el) return;

    // Add bounce-in animation on mount
    el.style.animation = 'poi-bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    el.style.animationDelay = `${Math.random() * 0.3}s`;
  }, []);

  return (
    <Marker
      ref={markerRef}
      position={[poi.lat, poi.lng]}
      icon={createPOIIcon(poi)}
      eventHandlers={{
        click: () => onPOIClick(poi),
      }}
    />
  );
}

/** Highlighted marker for the currently selected POI (from search or tap) */
function SelectedPOIMarker({ poi }: { poi: POI }) {
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    const el = marker.getElement();
    if (!el) return;

    // Animate in
    el.style.animation = 'poi-bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';

    // Pulse glow on the circle
    const circle = el.querySelector('.poi-selected-circle') as HTMLElement;
    if (circle) {
      circle.style.animation = 'poi-pulse-glow 2s ease-in-out infinite';
    }
  }, []);

  return (
    <Marker
      ref={markerRef}
      position={[poi.lat, poi.lng]}
      icon={createSelectedPOIIcon(poi)}
    />
  );
}

export default function POIMarkers({ activeCategories, onPOIClick, selectedPOI }: POIMarkersProps) {
  const showAll = activeCategories.length === 0;

  const filtered = showAll
    ? POIS
    : POIS.filter((poi) => activeCategories.includes(poi.category));

  return (
    <>
      {filtered.map((poi) => (
        <SinglePOIMarker key={poi.id} poi={poi} onPOIClick={onPOIClick} />
      ))}
      {selectedPOI && <SelectedPOIMarker poi={selectedPOI} />}
    </>
  );
}

/** Fly the map to a specific POI */
export function FlyToPOI({ poi }: { poi: POI | null }) {
  const map = useMap();

  useEffect(() => {
    if (!poi) return;
    map.flyTo([poi.lat, poi.lng], 17, {
      duration: 0.8,
      easeLinearity: 0.25,
    });
  }, [map, poi]);

  return null;
}