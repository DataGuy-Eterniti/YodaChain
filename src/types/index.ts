export type POICategory =
  | 'lecture_theatre'
  | 'faculty'
  | 'department'
  | 'admin'
  | 'hostel'
  | 'cafeteria'
  | 'bank'
  | 'health'
  | 'library'
  | 'student_affairs'
  | 'ict'
  | 'bus_stop'
  | 'sports'
  | 'other';

export interface POI {
  id: string;
  name: string;
  description: string;
  category: POICategory;
  lat: number;
  lng: number;
  emoji: string;
  color: string;
  building?: string;
  floors?: number;
}

export interface UserLocation {
  lat: number;
  lng: number;
}

export type TabId = 'home' | 'map' | 'saved' | 'updates' | 'profile';

export const CATEGORY_LABELS: Record<POICategory, string> = {
  lecture_theatre: 'Lecture Theatre',
  faculty: 'Faculty',
  department: 'Department',
  admin: 'Administration',
  hostel: 'Hostel',
  cafeteria: 'Cafeteria',
  bank: 'Bank',
  health: 'Health Centre',
  library: 'Library',
  student_affairs: 'Student Affairs',
  ict: 'ICT Centre',
  bus_stop: 'Bus Stop',
  sports: 'Sports Complex',
  other: 'Other',
};

export const CATEGORY_COLORS: Record<POICategory, string> = {
  lecture_theatre: '#10b981',
  faculty: '#06b6d4',
  department: '#6366f1',
  admin: '#8b5cf6',
  hostel: '#f43f5e',
  cafeteria: '#f59e0b',
  bank: '#eab308',
  health: '#ef4444',
  library: '#3b82f6',
  student_affairs: '#a855f7',
  ict: '#14b8a6',
  bus_stop: '#f97316',
  sports: '#22c55e',
  other: '#6b7280',
};

export const CATEGORY_EMOJIS: Record<POICategory, string> = {
  lecture_theatre: '🎓',
  faculty: '🏛️',
  department: '📚',
  admin: '🏢',
  hostel: '🏠',
  cafeteria: '🍽️',
  bank: '💰',
  health: '🏥',
  library: '📖',
  student_affairs: '👥',
  ict: '💻',
  bus_stop: '🚌',
  sports: '⚽',
  other: '📍',
};

export const FILTER_GROUPS: { label: string; categories: POICategory[] }[] = [
  { label: 'All', categories: [] },
  { label: 'Lecture Theatres', categories: ['lecture_theatre'] },
  { label: 'Faculties & Depts', categories: ['faculty', 'department'] },
  { label: 'Admin', categories: ['admin'] },
  { label: 'Hostels', categories: ['hostel'] },
  { label: 'Food & Bank', categories: ['cafeteria', 'bank'] },
  { label: 'Health & Sports', categories: ['health', 'sports'] },
  { label: 'Facilities', categories: ['library', 'student_affairs', 'ict', 'other'] },
  { label: 'Transport', categories: ['bus_stop'] },
];