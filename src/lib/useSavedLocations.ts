import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import { useAuth } from './AuthContext';
import type { POI } from '../types';

export function useSavedLocations() {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savedPOIs, setSavedPOIs] = useState<POI[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch saved location IDs
  useEffect(() => {
    if (!user || !supabase) {
      setSavedIds(new Set());
      setSavedPOIs([]);
      return;
    }

    let cancelled = false;

    const fetchSaved = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('saved_locations')
        .select('poi_id')
        .eq('user_id', user.id);

      if (!cancelled && !error && data) {
        const ids = new Set(data.map((r) => r.poi_id));
        setSavedIds(ids);
      }
      if (!cancelled) setLoading(false);
    };

    fetchSaved();

    return () => { cancelled = true; };
  }, [user]);

  // Load full POI data for saved locations
  const loadSavedPOIs = useCallback(async (allPOIs: POI[]) => {
    const pois = allPOIs.filter((p) => savedIds.has(p.id));
    setSavedPOIs(pois);
    return pois;
  }, [savedIds]);

  // Toggle save/unsave a location
  const toggleSave = useCallback(async (poiId: string) => {
    if (!user || !supabase) return false;

    const isSaved = savedIds.has(poiId);

    if (isSaved) {
      const { error } = await supabase
        .from('saved_locations')
        .delete()
        .eq('user_id', user.id)
        .eq('poi_id', poiId);

      if (!error) {
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(poiId);
          return next;
        });
        setSavedPOIs((prev) => prev.filter((p) => p.id !== poiId));
        return true;
      }
    } else {
      const { error } = await supabase
        .from('saved_locations')
        .insert({ user_id: user.id, poi_id: poiId });

      if (!error) {
        setSavedIds((prev) => new Set(prev).add(poiId));
        return true;
      }
    }

    return false;
  }, [user, savedIds]);

  // Check if a specific POI is saved
  const isSaved = useCallback((poiId: string) => savedIds.has(poiId), [savedIds]);

  return { savedIds, savedPOIs, loading, toggleSave, isSaved, loadSavedPOIs };
}