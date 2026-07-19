import { useState, useCallback, useEffect, useRef } from 'react';
import { POI, POICategory, TabId } from './types';
import { POIS } from './data/pois';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { useSavedLocations } from './lib/useSavedLocations';
import MapView from './components/MapView';
import QuickChips from './components/QuickChips';
import SearchBar from './components/SearchBar';
import BottomSheet from './components/BottomSheet';
import GPSButton from './components/GPSButton';
import BottomNav from './components/BottomNav';
import AuthModal from './components/AuthModal';
import CommunityUpdate from './components/CommunityUpdate';

/** UNILORIN-inspired shield logo SVG */
function UnilorinLogo({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 140"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shield outline */}
      <path
        d="M60 4L8 28v36c0 28.5 17.8 55.2 52 72 34.2-16.8 52-43.5 52-72V28L60 4z"
        fill="url(#shieldGrad)"
        stroke="url(#shieldStroke)"
        strokeWidth="2.5"
      />
      {/* Inner shield border */}
      <path
        d="M60 12L16 32v32c0 24.5 15.3 47.5 44 61.5 28.7-14 44-37 44-61.5V32L60 12z"
        fill="rgba(0,245,160,0.05)"
        stroke="rgba(0,245,160,0.3)"
        strokeWidth="1"
      />
      {/* Open book */}
      <path
        d="M38 55c0-2 1-4 3-5l19-9 19 9c2 1 3 3 3 5v18c0 2-1 4-3 5l-19 9-19-9c-2-1-3-3-3-5V55z"
        fill="rgba(0,212,255,0.15)"
        stroke="#00d4ff"
        strokeWidth="1.5"
      />
      {/* Book spine */}
      <line
        x1="60"
        y1="46"
        x2="60"
        y2="78"
        stroke="#00d4ff"
        strokeWidth="1.5"
        opacity="0.5"
      />
      {/* Book pages (left) */}
      <line x1="42" y1="58" x2="58" y2="58" stroke="#00d4ff" strokeWidth="0.8" opacity="0.4" />
      <line x1="42" y1="63" x2="58" y2="63" stroke="#00d4ff" strokeWidth="0.8" opacity="0.4" />
      <line x1="42" y1="68" x2="58" y2="68" stroke="#00d4ff" strokeWidth="0.8" opacity="0.4" />
      {/* Book pages (right) */}
      <line x1="62" y1="58" x2="78" y2="58" stroke="#00d4ff" strokeWidth="0.8" opacity="0.4" />
      <line x1="62" y1="63" x2="78" y2="63" stroke="#00d4ff" strokeWidth="0.8" opacity="0.4" />
      <line x1="62" y1="68" x2="78" y2="68" stroke="#00d4ff" strokeWidth="0.8" opacity="0.4" />
      {/* Torch / Flame */}
      <path
        d="M60 36c-2 0-4-2-4-5 0-4 4-9 4-9s4 5 4 9c0 3-2 5-4 5z"
        fill="#f59e0b"
        opacity="0.9"
      />
      <path
        d="M60 34c-1 0-2-1.5-2-3.5 0-3 2-6.5 2-6.5s2 3.5 2 6.5c0 2-1 3.5-2 3.5z"
        fill="#fbbf24"
      />
      {/* Torch stem */}
      <rect x="58" y="37" width="4" height="6" rx="1" fill="#00f5a0" opacity="0.7" />
      {/* "Better by Far" ribbon */}
      <rect x="25" y="88" width="70" height="16" rx="8" fill="rgba(0,245,160,0.15)" />
      <text
        x="60"
        y="99"
        textAnchor="middle"
        fill="#00f5a0"
        fontSize="8"
        fontFamily="Inter, sans-serif"
        fontWeight="600"
        letterSpacing="1"
      >
        BETTER BY FAR
      </text>
      {/* Decorative dots */}
      <circle cx="60" cy="110" r="2" fill="rgba(0,245,160,0.3)" />
      <circle cx="50" cy="110" r="1.5" fill="rgba(0,212,255,0.3)" />
      <circle cx="70" cy="110" r="1.5" fill="rgba(0,212,255,0.3)" />
      {/* Gradients */}
      <defs>
        <linearGradient id="shieldGrad" x1="60" y1="4" x2="60" y2="136">
          <stop offset="0%" stopColor="rgba(0,245,160,0.08)" />
          <stop offset="100%" stopColor="rgba(0,10,30,0.3)" />
        </linearGradient>
        <linearGradient id="shieldStroke" x1="60" y1="4" x2="60" y2="136">
          <stop offset="0%" stopColor="#00f5a0" />
          <stop offset="100%" stopColor="#00d4ff" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Home tab view — engaging UNILORIN-themed landing */
function HomeView() {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg px-6 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-secondary/5 blur-3xl" />

      {/* Logo */}
      <div className={`transition-all duration-700 ease-out ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <UnilorinLogo className="w-28 h-32 mx-auto drop-shadow-glow" />
      </div>

      {/* Title */}
      <div className={`mt-4 text-center transition-all duration-700 delay-150 ease-out ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <h1 className="text-3xl font-bold text-text tracking-tight">
          Yoda<span className="text-primary">Chain</span>
        </h1>
        <p className="text-sm text-text-muted mt-1.5 font-medium tracking-wide">
          UNILORIN Smart Campus Navigation
        </p>
      </div>

      {/* Tagline */}
      <div className={`mt-6 text-center transition-all duration-700 delay-300 ease-out ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <p className="text-xs text-text-dim leading-relaxed max-w-xs mx-auto">
          Find your way around the University of Ilorin. Discover lecture halls, faculties, hostels, and more — {" "}
          <span className="text-primary">Better by Far</span>.
        </p>
      </div>

      {/* Quick stats */}
      <div className={`mt-8 w-full max-w-sm grid grid-cols-3 gap-3 transition-all duration-700 delay-500 ease-out ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {[
          { label: 'Buildings', value: `${POIS.length}`, icon: '🏛️', color: '#00f5a0' },
          { label: 'Faculties', value: POIS.filter(p => p.category === 'faculty').length.toString(), icon: '📚', color: '#00d4ff' },
          { label: 'Hostels', value: POIS.filter(p => p.category === 'hostel').length.toString(), icon: '🏠', color: '#f43f5e' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="glass rounded-2xl p-3.5 text-center hover:bg-surface-hover transition-all duration-200"
          >
            <span className="text-lg">{stat.icon}</span>
            <p className="text-lg font-bold text-text mt-1" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-[10px] text-text-muted font-medium mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick action buttons */}
      <div className={`mt-5 w-full max-w-sm flex gap-3 transition-all duration-700 delay-700 ease-out ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <button
          onClick={() => {
            // Navigate to map tab — this is handled by the parent via tab state
            const event = new CustomEvent('yodachain-navigate', { detail: { tab: 'map' } });
            window.dispatchEvent(event);
          }}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-bg font-semibold text-sm
            hover:brightness-110 active:scale-[0.97] transition-all duration-150 ease-out shadow-glow"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Explore Campus
        </button>
        <button
          onClick={() => {
            const event = new CustomEvent('yodachain-navigate', { detail: { tab: 'saved' } });
            window.dispatchEvent(event);
          }}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl glass text-text-muted hover:text-text hover:bg-surface-hover font-medium text-sm
            active:scale-[0.97] transition-all duration-150 ease-out"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Saved Spots
        </button>
      </div>

      {/* Footer */}
      <p className={`absolute bottom-24 text-[10px] text-text-dim transition-all duration-700 delay-1000 ease-out ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        Tap Explore to start navigating
      </p>
    </div>
  );
}

/** Saved tab view */
function SavedView({ savedPOIs, toggleSave, onSelectPOI }: {
  savedPOIs: POI[];
  toggleSave: (poiId: string) => void;
  onSelectPOI: (poi: POI) => void;
}) {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg px-6">
        <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-text mb-2">Saved Locations</h2>
        <p className="text-sm text-text-muted text-center max-w-xs">
          Sign in to save your favourite spots and access them anytime.
        </p>
      </div>
    );
  }

  if (savedPOIs.length === 0) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg px-6">
        <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-text mb-2">No saved spots yet</h2>
        <p className="text-sm text-text-muted text-center max-w-xs">
          Tap the heart icon on any location to save it here for quick access.
        </p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-bg overflow-y-auto">
      <div className="px-4 pt-14 pb-24">
        <h2 className="text-lg font-semibold text-text mb-4">Saved Locations</h2>
        <div className="space-y-2">
          {savedPOIs.map((poi) => (
            <button
              key={poi.id}
              onClick={() => onSelectPOI(poi)}
              className="w-full flex items-center gap-3 p-3 rounded-xl glass hover:bg-surface-hover transition-all duration-200 active:scale-[0.98] text-left"
            >
              <span
                className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl text-lg"
                style={{ background: `${poi.color}20`, border: `1px solid ${poi.color}30` }}
              >
                {poi.emoji}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">{poi.name}</p>
                <p className="text-xs text-text-muted truncate">{poi.description}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); toggleSave(poi.id); }}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-error/10 text-error hover:bg-error/20 transition-all duration-200 active:scale-90"
                aria-label={`Remove ${poi.name} from saved`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Profile tab content */
function ProfileView({ onSignIn }: { onSignIn: () => void }) {
  const { user, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-bg">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg px-6">
        <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-text mb-2">Profile</h2>
        <p className="text-sm text-text-muted text-center max-w-xs mb-6">
          Sign in to save your favourite spots and access them offline.
        </p>
        <button
          onClick={onSignIn}
          className="px-6 py-2.5 rounded-xl bg-primary text-bg font-semibold text-sm
            hover:brightness-110 active:scale-[0.97] transition-all duration-150 ease-out"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg px-6">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-text mb-1">
        {user.email?.split('@')[0]}
      </h2>
      <p className="text-sm text-text-muted mb-6">{user.email}</p>
      <button
        onClick={signOut}
        className="px-6 py-2.5 rounded-xl border border-glass-border text-text-muted text-sm font-medium
          hover:bg-surface-hover hover:text-text active:scale-[0.97] transition-all duration-150 ease-out"
      >
        Sign Out
      </button>
    </div>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [activeCategories, setActiveCategories] = useState<POICategory[]>([]);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [destPOI, setDestPOI] = useState<POI | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user } = useAuth();
  const { savedIds, savedPOIs, toggleSave, isSaved, loadSavedPOIs } = useSavedLocations();
  const gpsRequestedRef = useRef(false);

  // Listen for custom navigation events from HomeView
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.tab) {
        setActiveTab(detail.tab);
      }
    };
    window.addEventListener('yodachain-navigate', handler);
    return () => window.removeEventListener('yodachain-navigate', handler);
  }, []);

  // Auto-request GPS when map tab becomes active (fast, low-accuracy first)
  useEffect(() => {
    if (activeTab === 'map' && !gpsRequestedRef.current && navigator.geolocation) {
      gpsRequestedRef.current = true;
      // Phase 1: Fast WiFi/cell location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          // If good enough, use it
          if (accuracy < 50) {
            setUserLocation({ lat: latitude, lng: longitude });
            return;
          }
          // Phase 2: Upgrade to GPS for better accuracy
          navigator.geolocation.getCurrentPosition(
            (gpsPos) => {
              setUserLocation({ lat: gpsPos.coords.latitude, lng: gpsPos.coords.longitude });
            },
            () => {
              // Use the rough location we already have
              setUserLocation({ lat: latitude, lng: longitude });
            },
            { enableHighAccuracy: true, timeout: 25000, maximumAge: 60000 }
          );
        },
        () => {
          // Silently fail — user can tap GPS button manually
        },
        { enableHighAccuracy: false, timeout: 7000, maximumAge: 300000 }
      );
    }
  }, [activeTab]);

  // Load saved POIs whenever savedIds change
  useEffect(() => {
    if (savedIds.size > 0) {
      loadSavedPOIs(POIS);
    }
  }, [savedIds, loadSavedPOIs]);

  const handlePOIClick = useCallback((poi: POI) => {
    setSelectedPOI(poi);
  }, []);

  // When user selects a POI from saved tab, switch to map and show it
  const handleSavedPOISelect = useCallback((poi: POI) => {
    setActiveTab('map');
    setSelectedPOI(poi);
  }, []);

  const handlePOISelect = useCallback((poi: POI) => {
    setSelectedPOI(poi);
  }, []);

  const handleFilterChange = useCallback((categories: POICategory[]) => {
    setActiveCategories(categories);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSelectedPOI(null);
  }, []);

  const handleDirections = useCallback((poi: POI) => {
    setDestPOI(poi);
    setSelectedPOI(null);
  }, []);

  const handleClearPath = useCallback(() => {
    setDestPOI(null);
  }, []);

  const handleLocationFound = useCallback((lat: number, lng: number) => {
    setUserLocation({ lat, lng });
  }, []);

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab);
    if (tab !== 'map') {
      setSelectedPOI(null);
      setDestPOI(null);
    }
  }, []);

  const handleSaveToggle = useCallback((poi: POI) => {
    toggleSave(poi.id);
  }, [toggleSave]);

  const isMapVisible = activeTab === 'map';
  const savedCount = savedIds.size;

  return (
    <div className="w-full h-full relative overflow-hidden bg-bg">
      {/* Map View */}
      <div className={`absolute inset-0 transition-opacity duration-300 ${isMapVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <MapView
          activeCategories={activeCategories}
          onPOIClick={handlePOIClick}
          selectedPOI={selectedPOI}
          destPOI={destPOI}
          onClearPath={handleClearPath}
          userLocation={userLocation}
        />

        {/* Map UI Overlays — positioned below the top bar */}
        <QuickChips
          activeCategories={activeCategories}
          onFilterChange={handleFilterChange}
        />
        <SearchBar onPOISelect={handlePOISelect} />

        <GPSButton onLocationFound={handleLocationFound} />

        {/* Bottom Sheet */}
        <BottomSheet
          poi={selectedPOI}
          onClose={handleCloseSheet}
          onDirections={handleDirections}
          onSave={handleSaveToggle}
          isSaved={selectedPOI ? isSaved(selectedPOI.id) : false}
        />
      </div>

      {/* Other Tab Views */}
      {activeTab === 'home' && <HomeView />}
      {activeTab === 'saved' && (
        <SavedView
          savedPOIs={savedPOIs}
          toggleSave={toggleSave}
          onSelectPOI={handleSavedPOISelect}
        />
      )}
      {activeTab === 'updates' && <CommunityUpdate />}
      {activeTab === 'profile' && (
        <ProfileView onSignIn={() => setAuthModalOpen(true)} />
      )}

      {/* Top Bar — always visible with minimal footprint */}
      <div className="fixed top-0 left-0 right-0 z-[2500] safe-top pointer-events-none">
        <div className="flex justify-end items-center gap-2 px-4 pt-3 pointer-events-auto">
          {/* Notification button */}
          <button
            className="w-10 h-10 rounded-full glass flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-hover transition-all duration-200 active:scale-90"
            aria-label="Notifications"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          {/* Profile button */}
          <button
            onClick={() => setAuthModalOpen(true)}
            className="w-10 h-10 rounded-full glass flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-hover transition-all duration-200 active:scale-90"
            aria-label="Profile"
          >
            {user ? (
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-bg">
                {user.email?.[0].toUpperCase() ?? '?'}
              </div>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        savedCount={savedCount}
      />

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}