import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useCheckInPrefs } from '@/hooks/useCheckInPrefs';
import { useRitualPrefs } from '@/hooks/useRitualPrefs';
import { useScreenInsets } from '@/hooks/useScreenInsets';
import type { RitualConfig } from '@/lib/ritualPrefs';
import { colors, radius, spacing, typography } from '@/theme';

export default function RitualModes() {
  const insets = useScreenInsets();
  const prefs = useRitualPrefs();
  const checkInPrefs = useCheckInPrefs();
  const checkInMuted =
    checkInPrefs.muteUntil !== null && checkInPrefs.muteUntil > Date.now();

  return (
    <View style={styles.root}>
      <ScreenHeader title="Ritual Modes" />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xxxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Gentle daily check-ins from your companion. Pick the moments where a
          soft prompt would feel helpful.
        </Text>

        <RitualCard
          icon="sunny-outline"
          title="Morning Alignment"
          desc="A short reflection or open prompt arrives each morning to help you ease into the day."
          config={prefs.morning}
          onPress={() => router.push('/(app)/morning-alignment')}
        />

        <RitualCard
          icon="moon-outline"
          title="Evening Wind Down"
          desc="An emotional decompression prompt before sleep. A safe space to release the day."
          config={prefs.evening}
          onPress={() => router.push('/(app)/evening-wind-down')}
        />

        <Pressable
          onPress={() => router.push('/(app)/mindfulness-checkins')}
          style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
        >
          <View style={styles.iconWrap}>
            <Ionicons name="leaf-outline" size={22} color={colors.pink} />
          </View>
          <View style={styles.body}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Mindfulness Check-ins</Text>
              <View
                style={[
                  styles.statusPill,
                  checkInPrefs.enabled && styles.statusPillOn,
                ]}
              >
                <Text
                  style={[
                    styles.statusLabel,
                    checkInPrefs.enabled && styles.statusLabelOn,
                  ]}
                >
                  {!checkInPrefs.enabled
                    ? 'Off'
                    : checkInMuted
                      ? 'Muted'
                      : 'On'}
                </Text>
              </View>
            </View>
            <Text style={styles.desc}>
              Occasional reach-outs based on your interaction patterns — not
              scheduled, just felt.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

function RitualCard({
  icon,
  title,
  desc,
  config,
  onPress,
}: {
  icon: any;
  title: string;
  desc: string;
  config: RitualConfig;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={22} color={colors.pink} />
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          <View
            style={[
              styles.statusPill,
              config.enabled && styles.statusPillOn,
            ]}
          >
            <Text
              style={[
                styles.statusLabel,
                config.enabled && styles.statusLabelOn,
              ]}
            >
              {config.enabled ? `On · ${config.time}` : 'Off'}
            </Text>
          </View>
        </View>
        <Text style={styles.desc}>{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
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
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    backgroundColor: 'rgba(235,59,118,0.06)',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(235,59,118,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  body: { flex: 1, gap: 4 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    fontFamily: 'DMSans_500Medium',
  },
  desc: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceGlass,
  },
  statusPillOn: {
    borderColor: colors.borderAccent,
    backgroundColor: 'rgba(235,59,118,0.15)',
  },
  statusLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  statusLabelOn: {
    color: colors.pink,
  },
});
