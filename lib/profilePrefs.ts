// User profile preferences (Personal Information Management).
// Persisted in localStorage so the data survives logout/login per PDF spec
// "Updated information must persist after logout/login."

const KEY = 'essly:profile';

export type Profile = {
  firstName: string;
  lastName: string;
  email: string;
  bio: string; // optional personal context — used by the AI
};

const DEFAULTS: Profile = {
  firstName: 'Demo',
  lastName: 'User',
  email: 'demo@essly.app',
  bio: '',
};

let memory: Profile = { ...DEFAULTS };
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

export function getProfile(): Profile {
  hydrate();
  return memory;
}

export function setProfile(patch: Partial<Profile>) {
  hydrate();
  memory = { ...memory, ...patch };
  persist();
  listeners.forEach((l) => l());
}

export function subscribeProfile(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Derived helpers
export function getInitials(p: Profile = getProfile()): string {
  const f = p.firstName?.trim()?.[0] ?? '';
  const l = p.lastName?.trim()?.[0] ?? '';
  const init = (f + l).toUpperCase();
  return init || 'U';
}

export function getDisplayName(p: Profile = getProfile()): string {
  const full = `${p.firstName} ${p.lastName}`.trim();
  return full || 'User';
}
