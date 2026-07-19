import { useEffect, useState } from 'react';
import { Polyline } from 'react-leaflet';
import { POI } from '../types';

interface WalkingPathProps {
  destination: POI | null;
  onClear: () => void;
  userLocation?: { lat: number; lng: number } | null;
}

/** Generate a natural-looking campus walking path between two points */
function generatePath(from: [number, number], to: [number, number]): [number, number][] {
  const [fromLat, fromLng] = from;
  const [toLat, toLng] = to;

  const midLat = (fromLat + toLat) / 2;
  const midLng = (fromLng + toLng) / 2;

  // Add slight offsets for a natural walking route
  return [
    from,
    [fromLat + (toLat - fromLat) * 0.15 + 0.0003, fromLng + (toLng - fromLng) * 0.15 + 0.0004],
    [midLat + 0.0002, midLng - 0.0003],
    [midLat - 0.0001, midLng + 0.0004],
    [toLat - (toLat - fromLat) * 0.15 - 0.0003, toLng - (toLng - fromLng) * 0.15 - 0.0002],
    to,
  ];
}

export default function WalkingPath({ destination, onClear, userLocation }: WalkingPathProps) {
  const [path, setPath] = useState<[number, number][]>([]);
  const [visible, setVisible] = useState(false);
  const [distance, setDistance] = useState<string>('');

  useEffect(() => {
    if (destination) {
      // Use user location if available, otherwise fall back to a default campus start
      const start: [number, number] = userLocation
        ? [userLocation.lat, userLocation.lng]
        : [8.4840, 4.6680]; // Fallback to main gate area

      setPath(generatePath(start, [destination.lat, destination.lng]));

      // Calculate approximate distance (Haversine)
      const R = 6371; // Earth radius in km
      const dLat = ((destination.lat - start[0]) * Math.PI) / 180;
      const dLng = ((destination.lng - start[1]) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((start[0] * Math.PI) / 180) *
          Math.cos((destination.lat * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distKm = R * c;
      setDistance(distKm < 1 ? `${Math.round(distKm * 1000)}m` : `${distKm.toFixed(1)}km`);

      setVisible(true);
    } else {
      setPath([]);
      setVisible(false);
      setDistance('');
    }
  }, [destination, userLocation]);

  if (!visible || path.length === 0) return null;

  return (
    <>
      <Polyline
        positions={path}
        pathOptions={{
          color: '#00f5a0',
          weight: 4,
          opacity: 0.8,
          dashArray: '10, 6',
        }}
      />
      {/* Clear path button with distance info */}
      <div className="absolute bottom-36 left-1/2 -translate-x-1/2 z-[1500]">
        <div className="flex items-center gap-2">
          {distance && (
            <div className="glass-strong rounded-2xl px-3 py-2 text-xs text-primary font-medium shadow-glass animate-fade-in-up">
              {distance}
            </div>
          )}
          <button
            onClick={onClear}
            className="glass-strong rounded-2xl px-4 py-2 text-xs text-text-muted hover:text-text transition-all duration-200 flex items-center gap-2 shadow-glass animate-fade-in-up"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear path
          </button>
        </div>
      </div>
    </>
  );
}