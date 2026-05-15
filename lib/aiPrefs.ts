// AI Personalization preferences. Per PDF, these are kept separate from
// account/profile settings.

const KEY = 'essly:ai-prefs';

export type AiMode = 'active' | 'balanced' | 'introspective';

export type AiPrefs = {
  mode: AiMode;
};

const DEFAULTS: AiPrefs = {
  mode: 'balanced',
};

let memory: AiPrefs = { ...DEFAULTS };
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

export function getAiPrefs(): AiPrefs {
  hydrate();
  return memory;
}

export function setAiMode(mode: AiMode) {
  hydrate();
  memory = { ...memory, mode };
  persist();
  listeners.forEach((l) => l());
}

export function subscribeAiPrefs(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
