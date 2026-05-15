import { useEffect, useRef } from 'react';
import { useCheckInPrefs } from '@/hooks/useCheckInPrefs';
import {
  getCooldowns,
  getEngagement,
  getEvents,
  recordCheckInDelivery,
  setCooldown,
  type TriggerType,
} from '@/lib/behaviorTracker';
import { fireBrowserNotification } from '@/lib/notifications';
import { nextCheckInMessage } from '@/mock/checkInMessages';

// Trigger thresholds
const INACTIVITY_MS = 5 * 60 * 1000;   // 5 minutes since last user message
const INTENSITY_WINDOW = 2 * 60 * 1000; // 2 minutes
const INTENSITY_COUNT = 5;              // 5+ messages
const EMOTIONAL_WINDOW = 10 * 60 * 1000; // 10 minutes
const EMOTIONAL_COUNT = 3;              // 3+ heavy events

// Per-trigger cooldowns
const COOLDOWN_MS: Record<TriggerType, number> = {
  inactivity: 60 * 60 * 1000, // 1 hour
  intensity: 30 * 60 * 1000,  // 30 minutes
  emotional: 20 * 60 * 1000,  // 20 minutes
};

function detectTrigger(): TriggerType | null {
  const now = Date.now();
  const events = getEvents();
  if (events.length === 0) return null;
  const cooldowns = getCooldowns();

  // 1) Intensity (highest priority — most acute)
  const recentMsgs = events.filter((e) => now - e.ts < INTENSITY_WINDOW);
  if (
    recentMsgs.length >= INTENSITY_COUNT &&
    (cooldowns.intensity ?? 0) < now
  ) {
    return 'intensity';
  }

  // 2) Emotional clustering
  const heavyRecent = events.filter(
    (e) => now - e.ts < EMOTIONAL_WINDOW && e.tag === 'heavy',
  );
  if (
    heavyRecent.length >= EMOTIONAL_COUNT &&
    (cooldowns.emotional ?? 0) < now
  ) {
    return 'emotional';
  }

  // 3) Inactivity (only if user has been here at all)
  const last = events[events.length - 1];
  if (
    now - last.ts > INACTIVITY_MS &&
    (cooldowns.inactivity ?? 0) < now
  ) {
    return 'inactivity';
  }

  return null;
}

// Polls every 30 s while chat is mounted. When a trigger fires, calls
// `onDeliver` with a contextual check-in message (and a browser notification
// if push is on). Cooldown prevents re-firing immediately.
export function useCheckInTrigger(onDeliver: (text: string) => void) {
  const prefs = useCheckInPrefs();
  const prefsRef = useRef(prefs);
  const onDeliverRef = useRef(onDeliver);
  prefsRef.current = prefs;
  onDeliverRef.current = onDeliver;

  useEffect(() => {
    const check = () => {
      const p = prefsRef.current;
      if (!p.enabled) return;
      const now = Date.now();
      if (p.muteUntil && p.muteUntil > now) return;

      const trigger = detectTrigger();
      if (!trigger) return;

      const msg = nextCheckInMessage(trigger);
      // Adapt cooldown by engagement — if the user keeps ignoring, back off.
      const { multiplier } = getEngagement();
      setCooldown(trigger, now + COOLDOWN_MS[trigger] * multiplier);
      recordCheckInDelivery(trigger);
      if (p.push) {
        fireBrowserNotification('Eesly · Mindful check-in', msg);
      }
      onDeliverRef.current(msg);
    };
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, []);
}
