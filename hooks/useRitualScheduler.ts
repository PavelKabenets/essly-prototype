import { useEffect, useRef } from 'react';
import { useRitualPrefs } from '@/hooks/useRitualPrefs';
import { fireBrowserNotification } from '@/lib/notifications';
import { markRitualSent, type RitualConfig, type RitualKind } from '@/lib/ritualPrefs';
import { nextRitualMessage } from '@/mock/ritualMessages';

const TITLE: Record<RitualKind, string> = {
  morning: 'Essly · Morning Alignment',
  evening: 'Essly · Evening Wind Down',
};

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isPastScheduled(scheduled: string): boolean {
  const [h, m] = scheduled.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return false;
  const now = new Date();
  const target = new Date(now);
  target.setHours(h, m, 0, 0);
  return now.getTime() >= target.getTime();
}

// Polls every 30 s while the chat screen is mounted. Fires the relevant
// ritual message if (a) enabled, (b) hasn't been sent today, AND (c)
// scheduled time has passed today. Both morning and evening tracks are
// checked independently with their own per-day guards.
export function useRitualScheduler(onDeliver: (text: string) => void) {
  const prefs = useRitualPrefs();
  const prefsRef = useRef(prefs);
  const onDeliverRef = useRef(onDeliver);

  prefsRef.current = prefs;
  onDeliverRef.current = onDeliver;

  useEffect(() => {
    const checkOne = (kind: RitualKind, cfg: RitualConfig) => {
      if (!cfg.enabled) return;
      const today = todayISO();
      if (cfg.lastSentDate === today) return;
      if (!isPastScheduled(cfg.time)) return;
      const msg = nextRitualMessage(kind);
      markRitualSent(kind, today);
      // Respect the user's push-notification preference + browser permission
      if (cfg.push) {
        fireBrowserNotification(TITLE[kind], msg);
      }
      onDeliverRef.current(msg);
    };
    const check = () => {
      const p = prefsRef.current;
      checkOne('morning', p.morning);
      checkOne('evening', p.evening);
    };
    check();
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, []);
}
