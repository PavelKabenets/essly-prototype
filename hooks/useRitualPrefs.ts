import { useSyncExternalStore } from 'react';
import { getRitualPrefs, subscribeRitualPrefs } from '@/lib/ritualPrefs';

export function useRitualPrefs() {
  return useSyncExternalStore(subscribeRitualPrefs, getRitualPrefs, getRitualPrefs);
}
