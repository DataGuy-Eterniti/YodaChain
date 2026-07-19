import { useState, useRef, useEffect, useCallback } from 'react';
import { POI, CATEGORY_LABELS } from '../types';

interface BottomSheetProps {
  poi: POI | null;
  onClose: () => void;
  onDirections: (poi: POI) => void;
  onSave?: (poi: POI) => void;
  isSaved?: boolean;
}

export default function BottomSheet({ poi, onClose, onDirections, onSave, isSaved }: BottomSheetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Animate in when poi is set
  useEffect(() => {
    if (poi) {
      setIsVisible(true);
      setTranslateY(0);
    } else {
      setIsVisible(false);
    }
  }, [poi]);

  // Drag handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartY.current = e.clientY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const delta = e.clientY - dragStartY.current;
    if (delta > 0) {
      setTranslateY(delta);
    }
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    // If dragged more than 120px, close
    if (translateY > 120) {
      closeSheet();
    } else {
      setTranslateY(0);
    }
  }, [isDragging, translateY]);

  const closeSheet = useCallback(() => {
    setTranslateY(300);
    setTimeout(() => {
      setIsVisible(false);
      setTranslateY(0);
      onClose();
    }, 250);
  }, [onClose]);

  // Backdrop press to close
  const handleBackdropClick = useCallback(() => {
    closeSheet();
  }, [closeSheet]);

  if (!poi && !isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      {isVisible && poi && (
        <div
          className="absolute inset-0 z-[2000] bg-black/30 backdrop-blur-sm transition-opacity duration-300"
          style={{ opacity: isVisible && !isDragging ? 1 : 0.5 }}
          onClick={handleBackdropClick}
        />
      )}

      {/* Sheet — centered card */}
      <div
        ref={sheetRef}
        className={`
          fixed inset-0 z-[2001] flex items-center justify-center
          pointer-events-none
          transition-opacity duration-300
          ${isVisible && poi ? 'opacity-100' : 'opacity-0'}
        `}
        style={{
          transition: isDragging ? 'none' : 'opacity 0.3s ease-out',
        }}
      >
        <div
          className="
            glass-strong rounded-2xl overflow-hidden shadow-elevated w-80 max-h-[70vh]
            animate-fade-in-up pointer-events-auto
          "
          style={{
            transform: isVisible ? `translateY(${translateY}px)` : 'translateY(20px)',
            transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
          }}
        >
        {/* Drag handle */}
        <div
          className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div className="w-10 h-1 rounded-full bg-text-dim/50" />
        </div>

        {/* Content */}
        {poi && (
          <div className="px-5 pb-6 overflow-y-auto" style={{ maxHeight: 'calc(70vh - 40px)' }}>
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <span
                className="flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-2xl text-2xl"
                style={{ background: `${poi.color}20`, border: `1px solid ${poi.color}40` }}
              >
                {poi.emoji}
              </span>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-text">{poi.name}</h2>
                <span
                  className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-medium"
                  style={{ background: `${poi.color}20`, color: poi.color }}
                >
                  {CATEGORY_LABELS[poi.category]}
                </span>
              </div>
              <button
                onClick={closeSheet}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full glass text-text-muted hover:text-text transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Description */}
            <p className="text-sm text-text-muted leading-relaxed mb-5">{poi.description}</p>

            {/* Details */}
            <div className="flex gap-3 mb-5">
              {poi.floors && (
                <div className="flex-1 glass rounded-xl p-3 text-center">
                  <p className="text-xs text-text-dim">Floors</p>
                  <p className="text-lg font-semibold text-text mt-1">{poi.floors}</p>
                </div>
              )}
              <div className="flex-1 glass rounded-xl p-3 text-center">
                <p className="text-xs text-text-dim">Category</p>
                <p className="text-sm font-medium text-text mt-1 truncate">{CATEGORY_LABELS[poi.category]}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => onDirections(poi)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-bg font-medium text-sm hover:bg-primary-dark transition-all duration-200 active:scale-[0.97]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Directions
              </button>
              {onSave && (
                <button
                  onClick={() => onSave(poi)}
                  className={`
                    flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-medium text-sm
                    transition-all duration-200 active:scale-[0.97]
                    ${isSaved
                      ? 'bg-error/20 text-error'
                      : 'glass text-text-muted hover:text-text hover:bg-surface-hover'
                    }
                  `}
                >
                  <svg
                    className="w-4 h-4"
                    fill={isSaved ? 'currentColor' : 'none'}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {isSaved ? 'Saved' : 'Save'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
}