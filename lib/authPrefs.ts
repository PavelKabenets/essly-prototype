// Tiny in-memory store for authentication preferences.
// Survives navigation within a session; resets on full refresh (which is fine
// for a click-through prototype — the demo can be re-walked from scratch).

export type AuthPrefs = {
  password: true; // always enabled (acceptance criteria: cannot be disabled)
  biometric: boolean;
};

let state: AuthPrefs = { password: true, biometric: false };
const listeners = new Set<() => void>();

export function getAuthPrefs(): AuthPrefs {
  return state;
}

export function setBiometric(enabled: boolean) {
  state = { ...state, biometric: enabled };
  listeners.forEach((l) => l());
}

export function subscribeAuthPrefs(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
