// Mindfulness check-in preferences. Persisted in localStorage.

const KEY = 'essly:checkin-prefs';

export type CheckInPrefs = {
  enabled: boolean;
  push: boolean;
  muteUntil: number | null; // ms timestamp; null = not muted
};

const DEFAULTS: CheckInPrefs = {
  enabled: false,
  push: false,
  muteUntil: null,
};

let memory: CheckInPrefs = { ...DEFAULTS };
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated) return;
  hydrated = true;
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      memory = { ...DEFAULTS, ...parsed };
    }
  } catch {}
}

function persist() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(memory));
  } catch {}
}

function notify() {
  listeners.forEach((l) => l());
}

export function getCheckInPrefs(): CheckInPrefs {
  hydrate();
  return memory;
}

function update(patch: Partial<CheckInPrefs>) {
  hydrate();
  memory = { ...memory, ...patch };
  persist();
  notify();
}

export function setCheckInEnabled(enabled: boolean) {
  update({ enabled });
}
export function setCheckInPush(push: boolean) {
  update({ push });
}
export function setCheckInMute(untilTs: number | null) {
  update({ muteUntil: untilTs });
}

export function subscribeCheckInPrefs(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
