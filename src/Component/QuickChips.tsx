import { useRef, useEffect } from 'react';
import { POICategory, FILTER_GROUPS } from '../types';

interface QuickChipsProps {
  activeCategories: POICategory[];
  onFilterChange: (categories: POICategory[]) => void;
}

export default function QuickChips({ activeCategories, onFilterChange }: QuickChipsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Scroll active chip into view
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeCategories]);

  const isActive = (group: typeof FILTER_GROUPS[0]) => {
    if (group.label === 'All') return activeCategories.length === 0;
    return group.categories.every((c) => activeCategories.includes(c)) && group.categories.length > 0;
  };

  const handleClick = (group: typeof FILTER_GROUPS[0]) => {
    if (group.label === 'All') {
      onFilterChange([]);
    } else {
      onFilterChange(group.categories);
    }
  };

  return (
    <div className="absolute top-14 left-0 right-0 z-[1000] px-4 pointer-events-none">
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-2 pointer-events-auto scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {FILTER_GROUPS.map((group) => {
          const active = isActive(group);
          return (
            <button
              key={group.label}
              ref={active ? activeRef : undefined}
              onClick={() => handleClick(group)}
              className={`
                relative flex-shrink-0 px-4 py-2 rounded-2xl text-sm font-medium
                transition-all duration-200 ease-out select-none
                ${active
                  ? 'bg-primary text-bg shadow-glow scale-105'
                  : 'glass text-text-muted hover:text-text hover:bg-surface-hover'
                }
              `}
              style={{
                transform: active ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              {group.label}
              {active && (
                <span className="absolute inset-0 rounded-2xl bg-primary/10 animate-pulse-glow" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}