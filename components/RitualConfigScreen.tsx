// Shared configuration UI for any ritual (morning, evening, etc.).
// Differs by kind, icon, time presets, copy.

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
import { useRitualPrefs } from '@/hooks/useRitualPrefs';
import { useScreenInsets } from '@/hooks/useScreenInsets';
import { loadChat, saveChat } from '@/lib/chatStore';
import {
  getNotificationPermission,
  requestNotificationPermission,
} from '@/lib/notifications';
import {
  setRitualEnabled,
  setRitualPush,
  setRitualTime,
  type RitualKind,
} from '@/lib/ritualPrefs';
import { AI_WELCOME } from '@/mock/chat';
import { nextRitualMessage } from '@/mock/ritualMessages';
import { colors, radius, spacing, typography } from '@/theme';

type Props = {
  kind: RitualKind;
  title: string;
  intro: string;
  toggleLabel: string;
  enabledHintOn: (time: string) => string;
  enabledHintOff: string;
  icon: any;
  timePresets: string[];
  pushHint: string;
  scheduleTestLabel: string;
};

export function RitualConfigScreen({
  kind,
  title,
  intro,
  toggleLabel,
  enabledHintOn,
  enabledHintOff,
  icon,
  timePresets,
  pushHint,
  scheduleTestLabel,
}: Props) {
  const insets = useScreenInsets();
  const prefs = useRitualPrefs()[kind];
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const sendSample = () => {
    const text = nextRitualMessage(kind);
    const stored = loadChat();
    const existing = stored && stored.length > 0 ? stored : [AI_WELCOME];
    saveChat([
      ...existing,
      { id: `ritual-${Date.now()}`, from: 'ai', text },
    ]);
    showToast('Sample sent — open the chat to see it.');
  };

  const onTogglePush = async (next: boolean) => {
    if (!next) {
      setRitualPush(kind, false);
      showToast('Push off — message appears in chat');
      return;
    }
    const current = getNotificationPermission();
    if (current === 'unsupported') {
      setRitualPush(kind, true);
      showToast("This device doesn't support push — message will appear in chat.");
      return;
    }
    if (current === 'granted') {
      setRitualPush(kind, true);
      showToast('Push notifications enabled');
      return;
    }
    if (current === 'denied') {
      showToast('Push is blocked. Enable it in your browser site settings.');
      return;
    }
    // 'default' → ask the user
    const result = await requestNotificationPermission();
    if (result === 'granted') {
      setRitualPush(kind, true);
      showToast('Push notifications enabled');
    } else {
      showToast('Push declined — message will still appear in chat.');
    }
  };

  const scheduleInOneMinute = () => {
    const d = new Date();
    const next = new Date(d.getTime() + 60_000);
    const hhmm = `${String(next.getHours()).padStart(2, '0')}:${String(next.getMinutes()).padStart(2, '0')}`;
    setRitualTime(kind, hhmm);
    setRitualEnabled(kind, true);
    showToast(`Scheduled for ${hhmm} — open chat & wait ~1 min.`);
  };

  return (
    <View style={styles.root}>
      <ScreenHeader title={title} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xxxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>{intro}</Text>

        <View style={styles.row}>
          <Ionicons name={icon} size={20} color={colors.pink} />
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>{toggleLabel}</Text>
            <Text style={styles.rowSub}>
              {prefs.enabled ? enabledHintOn(prefs.time) : enabledHintOff}
            </Text>
          </View>
          <Switch
            value={prefs.enabled}
            onValueChange={(v) => {
              setRitualEnabled(kind, v);
              showToast(v ? `${title} enabled` : `${title} disabled`);
            }}
            trackColor={{ true: colors.pink, false: '#3A3A3C' }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#3A3A3C"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DELIVERY TIME</Text>
          <View style={styles.chips}>
            {timePresets.map((t) => {
              const active = t === prefs.time;
              return (
                <Pressable
                  key={t}
                  onPress={() => {
                    setRitualTime(kind, t);
                    if (!prefs.enabled) setRitualEnabled(kind, true);
                  }}
                  style={({ pressed }) => [
                    styles.chip,
                    active && styles.chipActive,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                    {t}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable
            onPress={scheduleInOneMinute}
            style={({ pressed }) => [
              styles.testTime,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="time-outline" size={14} color={colors.pink} />
            <Text style={styles.testTimeLabel}>{scheduleTestLabel}</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
          <View style={styles.sectionBody}>
            <View style={styles.row2}>
              <Ionicons name="notifications-outline" size={20} color={colors.textSecondary} />
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Send as push notification</Text>
                <Text style={styles.rowSub}>{pushHint}</Text>
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
          <Text style={styles.hint}>
            Notifications respect your device permissions and timezone. Messages
            always appear in chat history regardless of push setting.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PREVIEW</Text>
          <Pressable
            onPress={sendSample}
            style={({ pressed }) => [
              styles.sampleBtn,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Ionicons name="send-outline" size={18} color={colors.text} />
            <Text style={styles.sampleLabel}>Send me a sample now</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/(app)/chat')}
            style={({ pressed }) => [
              styles.openChat,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.openChatLabel}>Open chat</Text>
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
  rowText: { flex: 1, gap: 2 },
  rowLabel: { ...typography.body, color: colors.text },
  rowSub: { ...typography.caption, color: colors.textMuted },

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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceGlass,
    minWidth: 64,
    alignItems: 'center',
  },
  chipActive: {
    borderColor: colors.pink,
    backgroundColor: 'rgba(235,59,118,0.18)',
  },
  chipLabel: { ...typography.body, color: colors.text, fontVariant: ['tabular-nums'] },
  chipLabelActive: { color: colors.text, fontFamily: 'DMSans_500Medium' },

  testTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginLeft: spacing.md,
    marginTop: spacing.xs,
  },
  testTimeLabel: { ...typography.caption, color: colors.pink },

  sampleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    backgroundColor: 'rgba(235,59,118,0.10)',
  },
  sampleLabel: { ...typography.button, color: colors.text },
  openChat: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  openChatLabel: { ...typography.bodySm, color: colors.pink },

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
