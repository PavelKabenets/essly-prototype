import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useCheckInPrefs } from '@/hooks/useCheckInPrefs';
import { useScreenInsets } from '@/hooks/useScreenInsets';
import {
  clearAllCooldowns,
  clearDeliveries,
  getEngagement,
  type TriggerType,
} from '@/lib/behaviorTracker';
import {
  setCheckInEnabled,
  setCheckInMute,
  setCheckInPush,
} from '@/lib/checkInPrefs';
import { loadChat, saveChat } from '@/lib/chatStore';
import {
  getNotificationPermission,
  requestNotificationPermission,
} from '@/lib/notifications';
import { AI_WELCOME } from '@/mock/chat';
import { nextCheckInMessage } from '@/mock/checkInMessages';
import { colors, radius, spacing, typography } from '@/theme';

const MUTE_OPTIONS = [
  { label: '1 hour', ms: 60 * 60 * 1000 },
  { label: '4 hours', ms: 4 * 60 * 60 * 1000 },
  { label: 'Until tomorrow', ms: 12 * 60 * 60 * 1000 },
];

const TRIGGER_OPTIONS: { id: TriggerType; title: string; sub: string; icon: any }[] = [
  {
    id: 'inactivity',
    title: 'Inactivity',
    sub: 'After ~5 min without a message',
    icon: 'time-outline',
  },
  {
    id: 'intensity',
    title: 'High activity',
    sub: 'Many messages in a short window',
    icon: 'flash-outline',
  },
  {
    id: 'emotional',
    title: 'Emotional weight',
    sub: 'Several heavy messages in a row',
    icon: 'heart-outline',
  },
];

export default function MindfulnessCheckIns() {
  const insets = useScreenInsets();
  const prefs = useCheckInPrefs();
  // Re-render every 30 s so the engagement / "muted for X min" labels stay fresh.
  const [, setTick] = useState(0);
  useState(() => {
    if (typeof window === 'undefined') return 0;
    const id = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  });
  const engagement = getEngagement();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const onTogglePush = async (next: boolean) => {
    if (!next) {
      setCheckInPush(false);
      showToast('Push off — check-ins appear in chat');
      return;
    }
    const current = getNotificationPermission();
    if (current === 'unsupported') {
      setCheckInPush(true);
      showToast("This device doesn't support push — check-ins will appear in chat.");
      return;
    }
    if (current === 'granted') {
      setCheckInPush(true);
      showToast('Push notifications enabled');
      return;
    }
    if (current === 'denied') {
      showToast('Push is blocked. Enable it in your browser site settings.');
      return;
    }
    const result = await requestNotificationPermission();
    if (result === 'granted') {
      setCheckInPush(true);
      showToast('Push notifications enabled');
    } else {
      showToast('Push declined — check-ins will still appear in chat.');
    }
  };

  const muteFor = (ms: number, label: string) => {
    setCheckInMute(Date.now() + ms);
    showToast(`Muted for ${label.toLowerCase()}`);
  };
  const unmute = () => {
    setCheckInMute(null);
    showToast('Mute cleared');
  };

  const sendSample = (type: TriggerType) => {
    const text = nextCheckInMessage(type);
    const stored = loadChat();
    const existing = stored && stored.length > 0 ? stored : [AI_WELCOME];
    saveChat([
      ...existing,
      { id: `checkin-${Date.now()}`, from: 'ai', text },
    ]);
    showToast('Check-in sample sent — open the chat to see it.');
  };

  const muted =
    prefs.muteUntil !== null && prefs.muteUntil > Date.now();
  const muteMinsLeft = muted
    ? Math.ceil(((prefs.muteUntil ?? 0) - Date.now()) / 60000)
    : 0;

  return (
    <View style={styles.root}>
      <ScreenHeader title="Mindfulness Check-ins" />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xxxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Occasional, conversational nudges from your companion when your
          interaction pattern suggests it might help — never to interrupt, just
          to make space.
        </Text>

        {/* Master toggle */}
        <View style={styles.row}>
          <Ionicons name="leaf-outline" size={20} color={colors.pink} />
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>Mindfulness Check-ins</Text>
            <Text style={styles.rowSub}>
              {prefs.enabled
                ? muted
                  ? `Muted · resumes in ~${muteMinsLeft} min`
                  : 'Listening for moments to gently reach out.'
                : 'Turn on to allow occasional check-ins.'}
            </Text>
          </View>
          <Switch
            value={prefs.enabled}
            onValueChange={(v) => {
              setCheckInEnabled(v);
              showToast(v ? 'Check-ins enabled' : 'Check-ins disabled');
            }}
            trackColor={{ true: colors.pink, false: '#3A3A3C' }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#3A3A3C"
          />
        </View>

        {/* Trigger types (read-only — explains what is detected) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WHAT TRIGGERS A CHECK-IN</Text>
          <View style={styles.sectionBody}>
            {TRIGGER_OPTIONS.map((opt, i) => (
              <View
                key={opt.id}
                style={[
                  styles.row2,
                  i < TRIGGER_OPTIONS.length - 1 && styles.rowBorder,
                ]}
              >
                <Ionicons name={opt.icon} size={20} color={colors.textSecondary} />
                <View style={styles.rowText}>
                  <Text style={styles.rowLabel}>{opt.title}</Text>
                  <Text style={styles.rowSub}>{opt.sub}</Text>
                </View>
                <Pressable
                  onPress={() => sendSample(opt.id)}
                  style={({ pressed }) => [
                    styles.testBtn,
                    pressed && { opacity: 0.7 },
                  ]}
                  accessibilityLabel={`Preview ${opt.title} check-in`}
                >
                  <Text style={styles.testBtnLabel}>Preview</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
          <View style={styles.sectionBody}>
            <View style={styles.row2}>
              <Ionicons
                name="notifications-outline"
                size={20}
                color={colors.textSecondary}
              />
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Send as push notification</Text>
                <Text style={styles.rowSub}>
                  {`Quietly notify even when you're elsewhere.`}
                </Text>
              </View>
              <Switch
                value={prefs.push}
                onValueChange={onTogglePush}
                trackColor={{ true: colors.pink, false: '#3A3A3C' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#3A3A3C"
                disabled={!prefs.enabled}
              />
            </View>
          </View>
        </View>

        {/* Mute / pause */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PAUSE</Text>
          <View style={styles.chips}>
            {MUTE_OPTIONS.map((m) => (
              <Pressable
                key={m.label}
                onPress={() => muteFor(m.ms, m.label)}
                disabled={!prefs.enabled}
                style={({ pressed }) => [
                  styles.chip,
                  pressed && { opacity: 0.85 },
                  !prefs.enabled && { opacity: 0.4 },
                ]}
              >
                <Text style={styles.chipLabel}>{m.label}</Text>
              </Pressable>
            ))}
            {muted && (
              <Pressable
                onPress={unmute}
                style={({ pressed }) => [
                  styles.chip,
                  styles.chipActive,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Ionicons name="close" size={14} color={colors.text} />
                <Text style={styles.chipLabel}>Cancel mute</Text>
              </Pressable>
            )}
          </View>
          <Text style={styles.hint}>
            Pausing stops all check-ins during the chosen window. Scheduled
            morning/evening rituals are unaffected.
          </Text>
        </View>

        {/* Adaptive frequency status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ADAPTIVE FREQUENCY</Text>
          <View style={styles.sectionBody}>
            <View style={styles.row2}>
              <Ionicons name="pulse-outline" size={20} color={colors.textSecondary} />
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>{engagement.label}</Text>
                <Text style={styles.rowSub}>
                  {engagement.ignoreStreak === 0
                    ? 'Check-ins fire at the standard cooldown.'
                    : `${engagement.ignoreStreak} recent check-in${engagement.ignoreStreak === 1 ? '' : 's'} ignored. Cooldowns now ${engagement.multiplier.toFixed(1)}× longer.`}
                </Text>
              </View>
            </View>
          </View>
          <Text style={styles.hint}>
            If you reply to a check-in within 2 minutes, the AI keeps the
            normal frequency. Repeated ignores slow it down automatically.
          </Text>
        </View>

        {/* Reset cooldowns (handy for testing) */}
        <View style={styles.section}>
          <Pressable
            onPress={() => {
              clearAllCooldowns();
              showToast('Cooldowns reset — next eligible check-in can fire now.');
            }}
            style={({ pressed }) => [
              styles.linkRow,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="refresh" size={14} color={colors.pink} />
            <Text style={styles.linkLabel}>Reset check-in cooldowns</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              clearDeliveries();
              showToast('Engagement history cleared.');
            }}
            style={({ pressed }) => [
              styles.linkRow,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="trash-outline" size={14} color={colors.pink} />
            <Text style={styles.linkLabel}>Clear engagement history</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/(app)/chat')}
            style={({ pressed }) => [
              styles.linkRow,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.linkLabel}>Open chat</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.pink} />
          </Pressable>
        </View>

        {toast && (
          <View style={styles.toast} pointerEvents="none">
            <Text style={styles.toastText}>{toast}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  intro: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    backgroundColor: 'rgba(235,59,118,0.06)',
  },
  row2: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowText: { flex: 1, gap: 2 },
  rowLabel: { ...typography.body, color: colors.text },
  rowSub: { ...typography.caption, color: colors.textMuted },
  testBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceGlass,
  },
  testBtnLabel: { ...typography.caption, color: colors.text },

  section: { gap: spacing.sm },
  sectionTitle: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginLeft: spacing.md,
  },
  sectionBody: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceGlass,
    overflow: 'hidden',
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    marginHorizontal: spacing.md,
  },

  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceGlass,
  },
  chipActive: {
    borderColor: colors.pink,
    backgroundColor: 'rgba(235,59,118,0.18)',
  },
  chipLabel: { ...typography.body, color: colors.text },

  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  linkLabel: { ...typography.bodySm, color: colors.pink },

  toast: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.xl,
    backgroundColor: 'rgba(20,20,24,0.95)',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  toastText: { ...typography.bodySm, color: colors.text, textAlign: 'center' },
});
