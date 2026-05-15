import { useSyncExternalStore } from 'react';
import { getAuthPrefs, subscribeAuthPrefs } from '@/lib/authPrefs';

export function useAuthPrefs() {
  return useSyncExternalStore(subscribeAuthPrefs, getAuthPrefs, getAuthPrefs);
}
