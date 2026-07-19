import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { UNILORIN_CENTER } from '../data/pois';
import { POI, POICategory } from '../types';
import POIMarkers, { FlyToPOI } from './POIMarkers';
import WalkingPath from './WalkingPath';
import { UserLocationMarker } from './GPSButton';

// Fix default marker icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/** Component that sets the map view once loaded */
function MapController() {
  const map = useMap();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      map.setView(UNILORIN_CENTER, 15);
      initialized.current = true;
    }
  }, [map]);

  return null;
}

interface MapViewProps {
  activeCategories: POICategory[];
  onPOIClick: (poi: POI) => void;
  selectedPOI: POI | null;
  destPOI: POI | null;
  onClearPath: () => void;
  userLocation: { lat: number; lng: number } | null;
}

export default function MapView({
  activeCategories,
  onPOIClick,
  selectedPOI,
  destPOI,
  onClearPath,
  userLocation,
}: MapViewProps) {
  return (
    <div className="absolute inset-0 w-full h-full">
      <MapContainer
        center={UNILORIN_CENTER}
        zoom={15}
        zoomControl={false}
        attributionControl={false}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <MapController />
        <POIMarkers activeCategories={activeCategories} onPOIClick={onPOIClick} selectedPOI={selectedPOI} />
        <FlyToPOI poi={selectedPOI} />
        <WalkingPath destination={destPOI} onClear={onClearPath} userLocation={userLocation} />
        {userLocation && <UserLocationMarker lat={userLocation.lat} lng={userLocation.lng} />}
      </MapContainer>
    </div>
  );
}