// Ritual preferences (Morning Alignment + Evening Wind Down). Persisted in
// localStorage on web, in-memory on native.

const KEY = 'essly:ritual-prefs';

export type RitualKind = 'morning' | 'evening';

export type RitualConfig = {
  enabled: boolean;
  time: string; // "HH:MM" 24-hour
  push: boolean;
  lastSentDate: string | null; // YYYY-MM-DD
};

export type RitualPrefs = {
  morning: RitualConfig;
  evening: RitualConfig;
};

const DEFAULTS: RitualPrefs = {
  morning: { enabled: false, time: '08:00', push: false, lastSentDate: null },
  evening: { enabled: false, time: '21:00', push: false, lastSentDate: null },
};

let memory: RitualPrefs = JSON.parse(JSON.stringify(DEFAULTS));
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
      memory = {
        morning: { ...DEFAULTS.morning, ...(parsed.morning ?? {}) },
        evening: { ...DEFAULTS.evening, ...(parsed.evening ?? {}) },
      };
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

export function getRitualPrefs(): RitualPrefs {
  hydrate();
  return memory;
}

function update(kind: RitualKind, patch: Partial<RitualConfig>) {
  hydrate();
  memory = { ...memory, [kind]: { ...memory[kind], ...patch } };
  persist();
  notify();
}

export function setRitualEnabled(kind: RitualKind, enabled: boolean) {
  update(kind, { enabled });
}
export function setRitualTime(kind: RitualKind, time: string) {
  update(kind, { time });
}
export function setRitualPush(kind: RitualKind, push: boolean) {
  update(kind, { push });
}
export function markRitualSent(kind: RitualKind, dateISO: string) {
  update(kind, { lastSentDate: dateISO });
}

export function subscribeRitualPrefs(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
