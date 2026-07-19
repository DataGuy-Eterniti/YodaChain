import { useState, useRef, useEffect, useId } from 'react';
import { POI, CATEGORY_LABELS } from '../types';
import { POIS } from '../data/pois';

interface SearchBarProps {
  onPOISelect: (poi: POI) => void;
}

export default function SearchBar({ onPOISelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  const listboxId = `search-results-${uid}`;

  const results = query.trim()
    ? POIS.filter((poi) =>
        poi.name.toLowerCase().includes(query.toLowerCase()) ||
        poi.description.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  const handleSelect = (poi: POI) => {
    setQuery('');
    setIsOpen(false);
    setFocusedIndex(-1);
    onPOISelect(poi);
  };

  const handleClose = () => {
    setIsOpen(false);
    setFocusedIndex(-1);
    inputRef.current?.blur();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < results.length) {
          handleSelect(results[focusedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        handleClose();
        break;
    }
  };

  // Trap focus inside the listbox when open
  useEffect(() => {
    if (!isOpen || results.length === 0) return;
    const handleTab = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        // Cycle focus between input and listbox
        if (document.activeElement === inputRef.current) {
          listboxRef.current?.querySelector<HTMLButtonElement>('[role="option"]')?.focus();
        } else {
          inputRef.current?.focus();
        }
      }
    };
    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen, results.length]);

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex < 0 || !listboxRef.current) return;
    const option = listboxRef.current.querySelector<HTMLButtonElement>(
      `[role="option"]:nth-child(${focusedIndex + 1})`
    );
    option?.scrollIntoView({ block: 'nearest' });
  }, [focusedIndex]);

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      handleClose();
    }
  };

  // Close on Escape via global listener (for when input isn't focused)
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleGlobalKey);
    return () => document.removeEventListener('keydown', handleGlobalKey);
  }, [isOpen]);

  return (
    <>
      {/* Search bar — anchored at the bottom */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
        <div className="relative pointer-events-auto">
          <div className="glass rounded-2xl flex items-center gap-2.5 px-3.5 py-2.5 shadow-glass w-64 md:w-72">
            <svg
              className="w-4 h-4 text-text-muted flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <label htmlFor={uid} className="sr-only">Search buildings</label>
            <input
              ref={inputRef}
              id={uid}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
                setFocusedIndex(-1);
              }}
              onFocus={() => query.trim() && setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search buildings..."
              role="combobox"
              aria-expanded={isOpen}
              aria-controls={listboxId}
              aria-activedescendant={focusedIndex >= 0 ? `${listboxId}-${focusedIndex}` : undefined}
              autoComplete="off"
              className="flex-1 bg-transparent text-text placeholder-text-dim outline-none text-sm min-w-0"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setIsOpen(false);
                  setFocusedIndex(-1);
                  inputRef.current?.focus();
                }}
                className="text-text-muted hover:text-text transition-colors flex-shrink-0"
                aria-label="Clear search"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Overlay + results — centered in the middle of the page */}
      {isOpen && query.trim() && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[2000] flex items-center justify-center pointer-events-auto"
          style={{ background: 'rgba(0,0,0,0.35)' }}
          onClick={handleOverlayClick}
          role="presentation"
        >
          <div
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            aria-label="Search results"
            className="glass-strong rounded-2xl overflow-hidden shadow-elevated w-72 max-h-[60vh] overflow-y-auto animate-fade-in-up pointer-events-auto"
            style={{ transform: 'translateY(0)' }}
          >
            {/* Results count */}
            <div className="px-4 pt-3 pb-1.5 text-xs text-text-muted" aria-live="polite" aria-atomic="true">
              {results.length} {results.length === 1 ? 'result' : 'results'} found
            </div>

            {results.map((poi, index) => (
              <button
                key={poi.id}
                id={`${listboxId}-${index}`}
                role="option"
                aria-selected={index === focusedIndex}
                onClick={() => handleSelect(poi)}
                onMouseEnter={() => setFocusedIndex(index)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150 cursor-pointer
                  ${index === focusedIndex ? 'bg-surface-hover' : ''}
                  ${index !== results.length - 1 ? 'border-b border-glass-border' : ''}
                `}
              >
                <span
                  className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-base"
                  style={{ background: `${poi.color}20`, border: `1px solid ${poi.color}40` }}
                >
                  {poi.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">{poi.name}</p>
                  <p className="text-xs text-text-muted truncate">{CATEGORY_LABELS[poi.category]}</p>
                </div>
                <svg
                  className="w-4 h-4 text-text-muted flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No results overlay */}
      {isOpen && query.trim() && results.length === 0 && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[2000] flex items-center justify-center pointer-events-auto"
          style={{ background: 'rgba(0,0,0,0.35)' }}
          onClick={handleOverlayClick}
          role="presentation"
        >
          <div className="glass-strong rounded-2xl p-6 text-center shadow-elevated w-72 animate-fade-in-up pointer-events-auto">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-surface-hover flex items-center justify-center">
              <svg className="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-text-muted text-sm">No results for "<span className="font-medium">{query}</span>"</p>
            <p className="text-text-dim text-xs mt-1">Try a different search term</p>
          </div>
        </div>
      )}
    </>
  );
}