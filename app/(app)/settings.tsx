import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useProfile } from '@/hooks/useProfile';
import { useScreenInsets } from '@/hooks/useScreenInsets';
import { getDisplayName, getInitials } from '@/lib/profilePrefs';
import { colors, radius, spacing, typography } from '@/theme';

export default function Settings() {
  const insets = useScreenInsets();
  const profile = useProfile();
  const logout = () => router.replace('/(auth)/sign-in');

  return (
    <View style={styles.root}>
      <ScreenHeader title="Settings" />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xxxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card — tappable, opens Profile editor */}
        <Pressable
          onPress={() => router.push('/(app)/profile')}
          style={({ pressed }) => [
            styles.profile,
            pressed && { opacity: 0.85 },
          ]}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(profile)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{getDisplayName(profile)}</Text>
            <Text style={styles.profileEmail}>{profile.email}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>

        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        <Section>
          <Row
            icon="lock-closed-outline"
            label="Security & Authentication"
            onPress={() => router.push('/(app)/security')}
          />
          <Row icon="notifications-outline" label="Notifications" disabled />
          <Row icon="language-outline" label="Language" value="English" disabled last />
        </Section>

        <Text style={styles.sectionTitle}>AI</Text>
        <Section>
          <Row
            icon="sparkles-outline"
            label="AI Personalization"
            onPress={() => router.push('/(app)/ai-personalization')}
          />
          <Row
            icon="sunny-outline"
            label="Ritual Modes"
            onPress={() => router.push('/(app)/ritual-modes')}
            last
          />
        </Section>

        <Section>
          <Row icon="document-text-outline" label="Privacy policy" disabled />
          <Row icon="document-text-outline" label="Terms of service" disabled />
          <Row icon="information-circle-outline" label="Version" value="1.0.0" disabled noChevron last />
        </Section>

        <Pressable
          onPress={logout}
          style={({ pressed }) => [
            styles.logoutBtn,
            pressed && { opacity: 0.85 },
          ]}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.pink} />
          <Text style={styles.logoutLabel}>Log out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return <View style={styles.section}>{children}</View>;
}

type RowProps = {
  icon: any;
  label: string;
  value?: string;
  onPress?: () => void;
  disabled?: boolean;
  last?: boolean;
  noChevron?: boolean;
};

function Row({ icon, label, value, onPress, disabled, last, noChevron }: RowProps) {
  const showChevron = !noChevron && !disabled;
  const rowStyle = [styles.row, !last && styles.rowBorder];

  if (disabled) {
    return (
      <View style={rowStyle}>
        <RowInner icon={icon} label={label} value={value} showChevron={showChevron} muted />
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [rowStyle, pressed && styles.rowPressed]}
    >
      <RowInner icon={icon} label={label} value={value} showChevron={showChevron} />
    </Pressable>
  );
}

function RowInner({
  icon,
  label,
  value,
  showChevron,
  muted,
}: {
  icon: any;
  label: string;
  value?: string;
  showChevron: boolean;
  muted?: boolean;
}) {
  return (
    <>
      <Ionicons
        name={icon}
        size={18}
        color={muted ? colors.textMuted : colors.textSecondary}
      />
      <Text style={[styles.rowLabel, muted && { color: colors.textSecondary }]} numberOfLines={1}>
        {label}
      </Text>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      {showChevron && (
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginLeft: spacing.md,
    marginTop: spacing.sm,
  },

  // Profile
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceGlass,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(235,59,118,0.15)',
    borderWidth: 1,
    borderColor: colors.borderAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.initials,
    color: colors.text,
  },
  profileName: {
    ...typography.body,
    color: colors.text,
    fontFamily: 'DMSans_500Medium',
  },
  profileEmail: {
    ...typography.bodySm,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Sections / Rows
  section: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceGlass,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    gap: spacing.md,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowPressed: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  rowLabel: {
    flex: 1,
    ...typography.body,
    color: colors.text,
  },
  rowValue: {
    ...typography.bodySm,
    color: colors.textMuted,
  },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    backgroundColor: 'rgba(235,59,118,0.06)',
    marginTop: spacing.sm,
  },
  logoutLabel: {
    ...typography.button,
    color: colors.pink,
  },
});
