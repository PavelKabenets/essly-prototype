import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAiPrefs } from '@/hooks/useAiPrefs';
import { useScreenInsets } from '@/hooks/useScreenInsets';
import { setAiMode, type AiMode } from '@/lib/aiPrefs';
import { colors, radius, spacing, typography } from '@/theme';

type ModeOption = {
  id: AiMode;
  title: string;
  short: string;
  long: string;
  icon: any;
};

const MODES: ModeOption[] = [
  {
    id: 'active',
    title: 'Active',
    short: 'Energetic and forward-moving',
    long: "The AI nudges, suggests, and asks 'what’s next.' Best when you want momentum or a thinking partner.",
    icon: 'flash-outline',
  },
  {
    id: 'balanced',
    title: 'Balanced',
    short: 'A mix of reflection and direction',
    long: 'The default. Asks open questions, sits with the heavy stuff, and occasionally nudges. Works in most moments.',
    icon: 'pulse-outline',
  },
  {
    id: 'introspective',
    title: 'Introspective',
    short: 'Quiet, slow, reflective',
    long: 'Holds space. Rarely prompts or directs. Choose this when you want company without commentary.',
    icon: 'moon-outline',
  },
];

export default function AiPersonalization() {
  const insets = useScreenInsets();
  const { mode } = useAiPrefs();
  const [toast, setToast] = useState<string | null>(null);

  const select = (next: AiMode) => {
    if (next === mode) return;
    setAiMode(next);
    setToast(`AI mode set to ${MODES.find((m) => m.id === next)?.title}.`);
    setTimeout(() => setToast(null), 2200);
  };

  return (
    <View style={styles.root}>
      <ScreenHeader title="AI Personalization" />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xxxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Choose how the AI shows up in conversations. You can change this any
          time — it affects all future replies, including responses to rituals
          and check-ins.
        </Text>

        <Text style={styles.sectionTitle}>COMMUNICATION STYLE</Text>
        <View style={styles.list}>
          {MODES.map((opt) => {
            const active = opt.id === mode;
            return (
              <Pressable
                key={opt.id}
                onPress={() => select(opt.id)}
                style={({ pressed }) => [
                  styles.card,
                  active && styles.cardActive,
                  pressed && { opacity: 0.85 },
                ]}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
              >
                <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
                  <Ionicons
                    name={opt.icon}
                    size={22}
                    color={active ? colors.pink : colors.textSecondary}
                  />
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.titleRow}>
                    <Text
                      style={[
                        styles.cardTitle,
                        active && styles.cardTitleActive,
                      ]}
                    >
                      {opt.title}
                    </Text>
                    <View
                      style={[styles.radio, active && styles.radioActive]}
                    >
                      {active && <View style={styles.radioInner} />}
                    </View>
                  </View>
                  <Text style={styles.short}>{opt.short}</Text>
                  <Text style={styles.long}>{opt.long}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.hint}>
          Saved automatically. AI replies update instantly — try a message in
          chat to feel the difference.
        </Text>

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
    gap: spacing.md,
  },
  intro: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginLeft: spacing.md,
  },
  list: {
    gap: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceGlass,
  },
  cardActive: {
    borderColor: colors.pink,
    backgroundColor: 'rgba(235,59,118,0.08)',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  iconWrapActive: {
    backgroundColor: 'rgba(235,59,118,0.18)',
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardTitle: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    fontFamily: 'DMSans_500Medium',
  },
  cardTitleActive: {
    color: colors.text,
  },
  short: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  long: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: colors.pink,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.pink,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  openChat: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
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
