import { useSyncExternalStore } from 'react';
import { getCheckInPrefs, subscribeCheckInPrefs } from '@/lib/checkInPrefs';

export function useCheckInPrefs() {
  return useSyncExternalStore(subscribeCheckInPrefs, getCheckInPrefs, getCheckInPrefs);
}
