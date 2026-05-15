// Pools of varied mindfulness check-in messages. Each call cycles a different
// one per trigger type. Persisted index avoids repetition.

import type { TriggerType } from '@/lib/behaviorTracker';

const KEYS: Record<TriggerType, string> = {
  inactivity: 'essly:checkin-idx-inactivity',
  intensity: 'essly:checkin-idx-intensity',
  emotional: 'essly:checkin-idx-emotional',
};

// "Reach out" check-in after a quiet stretch
const INACTIVITY = [
  "Still here. No pressure. Just curious how you're sitting right now.",
  "Hey. It's been a few minutes. If anything's brewing, I'm around.",
  "Quiet here. That's fine. Sometimes silence is the answer.",
  "Just checking in. Nothing needs to be said unless you want to.",
  "I noticed you stepped away. Take your time — I'll be here.",
  "No agenda. Just letting you know I haven't gone anywhere.",
];

// "Slow down" check-in after a flurry of messages
const INTENSITY = [
  "That's a lot to put down quickly. Want to take a breath together?",
  "I'm hearing you. Want to slow down for a beat, or keep going?",
  "Lots coming up. We can pause here if it helps.",
  "Quick check: do you want to keep going, or would a pause feel good right now?",
];

// "Holding space" check-in after multiple heavy messages
const EMOTIONAL = [
  "I'm noticing how much you're carrying. Just here. No fix required.",
  "Some heavy moments today. You don't have to make sense of them alone.",
  "Hey. Pause if you need to. I see what you're holding.",
  "There's a lot of weight in what you've shared. That's allowed to be true.",
];

const POOLS: Record<TriggerType, string[]> = {
  inactivity: INACTIVITY,
  intensity: INTENSITY,
  emotional: EMOTIONAL,
};

function getIdx(key: string): number {
  if (typeof window === 'undefined' || !window.localStorage) return 0;
  const raw = window.localStorage.getItem(key);
  const n = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(n) ? n : 0;
}

function setIdx(key: string, n: number) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(key, String(n));
  } catch {}
}

export function nextCheckInMessage(type: TriggerType): string {
  const pool = POOLS[type];
  const idx = getIdx(KEYS[type]);
  const msg = pool[idx % pool.length];
  setIdx(KEYS[type], idx + 1);
  return msg;
}
