// Mock microphone-permission flag, persisted across refreshes.
const KEY = 'essly:mic-permission';

export function hasMicPermission(): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  return window.localStorage.getItem(KEY) === 'granted';
}

export function grantMicPermission() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(KEY, 'granted');
  } catch {}
}

export function denyMicPermission() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(KEY, 'denied');
  } catch {}
}
