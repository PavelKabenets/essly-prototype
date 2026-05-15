import { useSyncExternalStore } from 'react';
import { getProfile, subscribeProfile } from '@/lib/profilePrefs';

export function useProfile() {
  return useSyncExternalStore(subscribeProfile, getProfile, getProfile);
}
