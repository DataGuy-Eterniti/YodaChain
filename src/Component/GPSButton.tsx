import { useState, useCallback, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface GPSButtonProps {
  onLocationFound?: (lat: number, lng: number) => void;
}

export default function GPSButton({ onLocationFound }: GPSButtonProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsLocating(true);
    setError(null);

    // Phase 1: Fast WiFi/cell location (low accuracy, works indoors)
    let aborted = false;

    const onSuccess = (position: GeolocationPosition) => {
      if (aborted) return;
      const { latitude, longitude, accuracy } = position.coords;

      // If accuracy is already good (< 50m), stop here
      if (accuracy < 50) {
        onLocationFound?.(latitude, longitude);
        setIsLocating(false);
        return;
      }

      // Phase 2: Accuracy is rough — try GPS for a better fix
      navigator.geolocation.getCurrentPosition(
        (gpsPos) => {
          if (aborted) return;
          onLocationFound?.(gpsPos.coords.latitude, gpsPos.coords.longitude);
          setIsLocating(false);
        },
        () => {
          // GPS failed — use the rough location we already have
          if (aborted) return;
          onLocationFound?.(latitude, longitude);
          setIsLocating(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 25000,
          maximumAge: 60000,
        }
      );
    };

    const onError = (err: GeolocationPositionError) => {
      if (aborted) return;

      // If timeout on low accuracy, try GPS directly with longer timeout
      if (err.code === err.TIMEOUT) {
        navigator.geolocation.getCurrentPosition(
          (gpsPos) => {
            if (aborted) return;
            onLocationFound?.(gpsPos.coords.latitude, gpsPos.coords.longitude);
            setIsLocating(false);
          },
          (gpsErr) => {
            if (aborted) return;
            setIsLocating(false);
            switch (gpsErr.code) {
              case gpsErr.PERMISSION_DENIED:
                setError('Location permission denied');
                break;
              case gpsErr.POSITION_UNAVAILABLE:
                setError('Location unavailable');
                break;
              case gpsErr.TIMEOUT:
                setError('Could not find GPS signal. Try moving to an open area.');
                break;
              default:
                setError('Could not get location');
            }
            setTimeout(() => setError(null), 4000);
          },
          {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 120000,
          }
        );
        return;
      }

      setIsLocating(false);
      switch (err.code) {
        case err.PERMISSION_DENIED:
          setError('Location permission denied');
          break;
        case err.POSITION_UNAVAILABLE:
          setError('Location unavailable');
          break;
        default:
          setError('Could not get location');
      }
      setTimeout(() => setError(null), 3000);
    };

    // Start with fast, low-accuracy fix
    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: false,
      timeout: 7000,
      maximumAge: 300000, // 5 min — reuse cached position
    });

    return () => { aborted = true; };
  }, [onLocationFound]);

  return (
    <>
      {/* GPS Button */}
      <button
        onClick={handleLocate}
        disabled={isLocating}
        className={`
          absolute bottom-36 right-5 z-[1500] w-12 h-12
          rounded-full flex items-center justify-center
          transition-all duration-200 active:scale-[0.92]
          ${isLocating
            ? 'bg-primary/50 cursor-wait'
            : 'bg-primary text-bg hover:bg-primary-dark cursor-pointer animate-pulse-glow'
          }
          shadow-glow shadow-lg
        `}
        aria-label="Find my location"
      >
        {isLocating ? (
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </button>

      {/* Error toast */}
      {error && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-[1500] animate-fade-in-up">
          <div className="glass-strong rounded-2xl px-5 py-3 text-sm text-error shadow-glass">
            {error}
          </div>
        </div>
      )}
    </>
  );
}

/** Blue dot marker component for user location */
export function UserLocationMarker({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  // Fly to user location
  useEffect(() => {
    map.flyTo([lat, lng], 17, { duration: 0.8, easeLinearity: 0.25 });
  }, [map, lat, lng]);

  // Create a blue dot circle marker with "You" label
  useEffect(() => {
    const marker = L.circleMarker([lat, lng], {
      radius: 8,
      color: '#00d4ff',
      fillColor: '#00d4ff',
      fillOpacity: 0.8,
      weight: 2,
      opacity: 1,
    }).addTo(map);

    // "You" label
    const label = L.tooltip({
      permanent: true,
      direction: 'top',
      offset: L.point(0, -18),
      className: 'user-location-tooltip',
    }).setContent('You').setLatLng([lat, lng]).addTo(map);

    // Pulsing ring effect
    const ring = L.circleMarker([lat, lng], {
      radius: 16,
      color: '#00d4ff',
      fillColor: '#00d4ff',
      fillOpacity: 0.15,
      weight: 2,
      opacity: 0.5,
    }).addTo(map);

    // Animate ring
    let growing = true;
    const interval = setInterval(() => {
      const currentRadius = ring.getRadius();
      if (growing) {
        ring.setRadius(currentRadius + 0.5);
        ring.setStyle({ opacity: Math.max(0, 0.5 - (currentRadius - 16) / 20) });
        if (currentRadius >= 30) growing = false;
      } else {
        ring.setRadius(currentRadius - 0.5);
        ring.setStyle({ opacity: Math.min(0.5, 0.5 - (currentRadius - 16) / 20) });
        if (currentRadius <= 16) growing = true;
      }
    }, 30);

    return () => {
      map.removeLayer(marker);
      map.removeLayer(label);
      map.removeLayer(ring);
      clearInterval(interval);
    };
  }, [map, lat, lng]);

  return null;
}