import { useSyncExternalStore } from 'react';
import { getAiPrefs, subscribeAiPrefs } from '@/lib/aiPrefs';

export function useAiPrefs() {
  return useSyncExternalStore(subscribeAiPrefs, getAiPrefs, getAiPrefs);
}
