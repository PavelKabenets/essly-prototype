// Pools of varied ritual messages. Each call cycles a different one and
// persists the per-kind index so days don't repeat.

import type { RitualKind } from '@/lib/ritualPrefs';

const KEYS: Record<RitualKind, string> = {
  morning: 'essly:ritual-idx-morning',
  evening: 'essly:ritual-idx-evening',
};

const MORNING = [
  "Good morning. Before the day starts pulling at you — what's one small thing you want to carry into it?",
  'Morning. No rush. If anything is sitting on your chest already, it can come here first.',
  'Hey. Soft start. Name one thing that already feels okay this morning.',
  "Good morning. I've been thinking about what you said last time. How does it sit today?",
  'Morning. Five seconds: how would you describe the weather inside you right now?',
  "Hi. There's no goal for today's check-in. Just here if you want to begin out loud.",
  "Morning. Some days the answer is 'fine' and that's a full answer. How are you?",
  'Good morning. What would gentle look like for you today?',
  'Hey. If you had to guess what your body is asking for today — what would it be?',
  "Morning. I'll start: I'm glad you came back. What's been on your mind since we last spoke?",
];

const EVENING = [
  "Hi. Whatever today gave you, you don't have to carry it past this conversation.",
  "Evening. What's one thing you noticed in yourself today?",
  "Hey. Slow exhale. What's worth putting down before sleep?",
  "What's the smallest good thing today gave you?",
  'Tell me about one moment from today — any moment, not the big ones.',
  'Where in your body do you feel today right now? Just notice, no fixing.',
  'What conversation lived rent-free in your head today?',
  'If today were a weather report inside you — what would it say?',
  'Anything you want to say out loud before tomorrow starts?',
  'You showed up today. That counts. What would gentle look like for tomorrow?',
];

const POOLS: Record<RitualKind, string[]> = { morning: MORNING, evening: EVENING };

function getIdx(kind: RitualKind): number {
  if (typeof window === 'undefined' || !window.localStorage) return 0;
  const raw = window.localStorage.getItem(KEYS[kind]);
  const n = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(n) ? n : 0;
}

function setIdx(kind: RitualKind, n: number) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(KEYS[kind], String(n));
  } catch {}
}

export function nextRitualMessage(kind: RitualKind): string {
  const pool = POOLS[kind];
  const idx = getIdx(kind);
  const msg = pool[idx % pool.length];
  setIdx(kind, idx + 1);
  return msg;
}
