// Tracks user behavior in the chat for the mindfulness check-in trigger.
// Records each outgoing user message with timestamp + a light emotional tag
// derived from keywords. Persisted to localStorage so behavior across
// refreshes still matters.

const EVENTS_KEY = 'essly:behavior-events';
const COOLDOWN_KEY = 'essly:checkin-cooldowns';
const DELIVERY_KEY = 'essly:checkin-deliveries';
const RESPONSE_WINDOW_MS = 2 * 60 * 1000; // user must reply within 2 min

export type Emotion = 'heavy' | 'positive';

export type UserEvent = {
  ts: number;
  tag?: Emotion;
};

export type TriggerType = 'inactivity' | 'intensity' | 'emotional';

const HEAVY = [
  'sad', 'tired', 'anxious', 'stressed', 'lost', 'lonely', 'hurt', 'heavy',
  'overwhelm', 'broken', 'cry', 'numb', 'stuck', 'tough', 'rough', 'awful',
  'scared', 'afraid', 'exhausted',
];
const POSITIVE = [
  'happy', 'good', 'great', 'better', 'love', 'excited', 'grateful',
  'calm', 'proud', 'peace', 'wonderful',
];

export function classifyEmotion(text: string): Emotion | undefined {
  const t = text.toLowerCase();
  if (HEAVY.some((w) => t.includes(w))) return 'heavy';
  if (POSITIVE.some((w) => t.includes(w))) return 'positive';
  return undefined;
}

// ── Events ────────────────────────────────────────────────────────────────

let eventsCache: UserEvent[] | null = null;

function loadEvents(): UserEvent[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(EVENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveEvents(events: UserEvent[]) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  } catch {}
}

export function getEvents(): UserEvent[] {
  if (eventsCache === null) eventsCache = loadEvents();
  return eventsCache;
}

export function recordUserEvent(text: string) {
  if (eventsCache === null) eventsCache = loadEvents();
  const now = Date.now();
  eventsCache.push({ ts: now, tag: classifyEmotion(text) });
  // Trim to last 24h
  const cutoff = now - 24 * 60 * 60 * 1000;
  eventsCache = eventsCache.filter((e) => e.ts > cutoff);
  saveEvents(eventsCache);
  // Mark any recent unresponded check-in as engaged
  markRecentDeliveryResponded();
}

// ── Cooldowns ─────────────────────────────────────────────────────────────

type Cooldowns = Partial<Record<TriggerType, number>>;
let cooldownCache: Cooldowns | null = null;

function loadCooldowns(): Cooldowns {
  if (typeof window === 'undefined' || !window.localStorage) return {};
  try {
    const raw = window.localStorage.getItem(COOLDOWN_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveCooldowns(c: Cooldowns) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(COOLDOWN_KEY, JSON.stringify(c));
  } catch {}
}

export function getCooldowns(): Cooldowns {
  if (cooldownCache === null) cooldownCache = loadCooldowns();
  return cooldownCache;
}

export function setCooldown(type: TriggerType, untilTs: number) {
  if (cooldownCache === null) cooldownCache = loadCooldowns();
  cooldownCache[type] = untilTs;
  saveCooldowns(cooldownCache);
}

export function clearAllCooldowns() {
  cooldownCache = {};
  saveCooldowns({});
}

// ── Check-in deliveries & adaptive frequency ──────────────────────────────

export type CheckInDelivery = {
  ts: number;
  type: TriggerType;
  responded: boolean;
};

let deliveriesCache: CheckInDelivery[] | null = null;

function loadDeliveries(): CheckInDelivery[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(DELIVERY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveDeliveries(d: CheckInDelivery[]) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(DELIVERY_KEY, JSON.stringify(d));
  } catch {}
}

export function getDeliveries(): CheckInDelivery[] {
  if (deliveriesCache === null) deliveriesCache = loadDeliveries();
  return deliveriesCache;
}

export function recordCheckInDelivery(type: TriggerType) {
  if (deliveriesCache === null) deliveriesCache = loadDeliveries();
  const now = Date.now();
  deliveriesCache.push({ ts: now, type, responded: false });
  // Keep last 20 deliveries only
  if (deliveriesCache.length > 20) {
    deliveriesCache = deliveriesCache.slice(-20);
  }
  saveDeliveries(deliveriesCache);
}

export function markRecentDeliveryResponded() {
  if (deliveriesCache === null) deliveriesCache = loadDeliveries();
  const cutoff = Date.now() - RESPONSE_WINDOW_MS;
  let changed = false;
  deliveriesCache = deliveriesCache.map((d) => {
    if (d.ts > cutoff && !d.responded) {
      changed = true;
      return { ...d, responded: true };
    }
    return d;
  });
  if (changed) saveDeliveries(deliveriesCache);
}

// Engagement stats — drives adaptive frequency multiplier.
// Looks at the last 5 deliveries and counts consecutive ignores starting
// from the most recent. The more recent ignores in a row, the longer the
// cooldown becomes (up to 3x). A single response resets the streak.
export type Engagement = {
  recentDeliveries: number;
  ignoreStreak: number;
  multiplier: number;
  label: 'Active' | 'Steady' | 'Reduced' | 'Quiet';
};

export function getEngagement(): Engagement {
  const all = getDeliveries();
  const recent = all.slice(-5);
  let streak = 0;
  for (let i = recent.length - 1; i >= 0; i--) {
    // Only count ignores from deliveries old enough that the response window
    // has fully elapsed (otherwise user might still respond).
    if (Date.now() - recent[i].ts < RESPONSE_WINDOW_MS) continue;
    if (recent[i].responded) break;
    streak += 1;
  }
  const multiplier = 1 + Math.min(streak, 4) * 0.5; // 1 → 3
  let label: Engagement['label'] = 'Active';
  if (streak >= 4) label = 'Quiet';
  else if (streak >= 2) label = 'Reduced';
  else if (streak >= 1) label = 'Steady';
  return {
    recentDeliveries: recent.length,
    ignoreStreak: streak,
    multiplier,
    label,
  };
}

export function clearDeliveries() {
  deliveriesCache = [];
  saveDeliveries([]);
}
