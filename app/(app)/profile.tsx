import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { useProfile } from '@/hooks/useProfile';
import { useScreenInsets } from '@/hooks/useScreenInsets';
import { loadChat, saveChat } from '@/lib/chatStore';
import { getInitials, setProfile } from '@/lib/profilePrefs';
import { AI_WELCOME, type Message } from '@/mock/chat';
import { colors, radius, spacing, typography } from '@/theme';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BIO_MAX = 500;

export default function Profile() {
  const insets = useScreenInsets();
  const stored = useProfile();
  const [firstName, setFirstName] = useState(stored.firstName);
  const [lastName, setLastName] = useState(stored.lastName);
  const [email, setEmail] = useState(stored.email);
  const [bio, setBio] = useState(stored.bio);
  const [emailError, setEmailError] = useState<string | undefined>();
  const [nameError, setNameError] = useState<string | undefined>();
  const [toast, setToast] = useState<string | null>(null);

  // Re-sync local form state when the store changes (e.g. after returning here)
  useEffect(() => {
    setFirstName(stored.firstName);
    setLastName(stored.lastName);
    setEmail(stored.email);
    setBio(stored.bio);
  }, [stored.firstName, stored.lastName, stored.email, stored.bio]);

  const dirty =
    firstName.trim() !== stored.firstName ||
    lastName.trim() !== stored.lastName ||
    email.trim() !== stored.email ||
    bio !== stored.bio;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  const acknowledgeBioInChat = (newBio: string) => {
    if (!newBio.trim()) return;
    const existing = loadChat() ?? [AI_WELCOME];
    const ack: Message = {
      id: `bio-ack-${Date.now()}`,
      from: 'ai',
      text: "Thanks for sharing a bit about yourself. I'll keep that in mind as we talk.",
    };
    saveChat([...existing, ack]);
  };

  const onSave = () => {
    setNameError(undefined);
    setEmailError(undefined);
    if (!firstName.trim() || !lastName.trim()) {
      setNameError('First and last name are required.');
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    const bioChanged = bio.trim() !== stored.bio.trim();
    const bioAdded = bioChanged && bio.trim().length > 0;
    setProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      bio: bio.trim(),
    });
    if (bioAdded) acknowledgeBioInChat(bio.trim());
    showToast('Profile updated.');
  };

  const initials = getInitials({
    firstName,
    lastName,
    email,
    bio,
  });

  return (
    <View style={styles.root}>
      <ScreenHeader title="Profile" />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xxxl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarBlock}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.avatarHint}>Avatar uses your initials</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BASICS</Text>
          <View style={styles.fieldGroup}>
            <Field label="First name">
              <TextInput
                value={firstName}
                onChangeText={(t) => {
                  setFirstName(t);
                  if (nameError) setNameError(undefined);
                }}
                style={styles.input}
                autoCapitalize="words"
                placeholder="Alex"
                placeholderTextColor={colors.textPlaceholder}
              />
            </Field>
            <Field label="Last name">
              <TextInput
                value={lastName}
                onChangeText={(t) => {
                  setLastName(t);
                  if (nameError) setNameError(undefined);
                }}
                style={styles.input}
                autoCapitalize="words"
                placeholder="Doe"
                placeholderTextColor={colors.textPlaceholder}
              />
            </Field>
            {nameError && <Text style={styles.error}>{nameError}</Text>}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EMAIL</Text>
          <View style={styles.fieldGroup}>
            <Field>
              <TextInput
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (emailError) setEmailError(undefined);
                }}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
                placeholder="you@example.com"
                placeholderTextColor={colors.textPlaceholder}
              />
            </Field>
            {emailError && <Text style={styles.error}>{emailError}</Text>}
            <Pressable
              onPress={() => router.push('/(auth)/forgot-password')}
              style={({ pressed }) => [styles.linkRow, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name="key-outline" size={14} color={colors.pink} />
              <Text style={styles.linkLabel}>Reset password</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.pink} />
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT YOU · OPTIONAL</Text>
          <View style={styles.fieldGroup}>
            <Field>
              <TextInput
                value={bio}
                onChangeText={(t) => setBio(t.slice(0, BIO_MAX))}
                style={[styles.input, styles.inputMulti]}
                multiline
                numberOfLines={5}
                placeholder="What would you want a thoughtful companion to know about you? Your name, work, what's been heavy or good lately, things you're tender about, what gentle looks like for you…"
                placeholderTextColor={colors.textPlaceholder}
              />
            </Field>
            <View style={styles.bioFooter}>
              <Text style={styles.bioHint}>
                Stored privately. The AI uses this to personalize future
                conversations.
              </Text>
              <Text style={styles.bioCount}>
                {bio.length}/{BIO_MAX}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.saveBlock}>
          <Button
            label="Save changes"
            onPress={onSave}
            disabled={!dirty}
          />
          {!dirty && (
            <Text style={styles.savedHint}>All changes are saved.</Text>
          )}
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

function Field({
  label,
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      {label && <Text style={styles.fieldLabel}>{label}</Text>}
      <View style={styles.fieldShell}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },

  // Avatar
  avatarBlock: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(235,59,118,0.15)',
    borderWidth: 1,
    borderColor: colors.borderAccent,
    alignItems: 'center',
    justifyContent: 'center',
    ...((typeof window !== 'undefined') as any)
      ? ({} as any)
      : {},
  },
  avatarText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 32,
    color: colors.text,
    letterSpacing: 2,
  },
  avatarHint: {
    ...typography.caption,
    color: colors.textMuted,
  },

  // Sections
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginLeft: spacing.md,
  },
  fieldGroup: {
    gap: spacing.md,
  },

  // Field
  field: { gap: 4 },
  fieldLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginLeft: spacing.md,
  },
  fieldShell: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceGlass,
    paddingHorizontal: spacing.xl,
    minHeight: 54,
    justifyContent: 'center',
  },
  input: {
    ...typography.body,
    color: colors.text,
    paddingVertical: spacing.md,
    ...((typeof window !== 'undefined') ? ({ outlineStyle: 'none' } as any) : {}),
  },
  inputMulti: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  bioFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.md,
  },
  bioHint: {
    flex: 1,
    ...typography.caption,
    color: colors.textMuted,
  },
  bioCount: {
    ...typography.caption,
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  error: {
    ...typography.caption,
    color: colors.error,
    marginLeft: spacing.md,
  },

  // Link row
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    marginLeft: spacing.md,
  },
  linkLabel: {
    ...typography.bodySm,
    color: colors.pink,
    fontFamily: 'DMSans_500Medium',
  },

  // Save block
  saveBlock: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  savedHint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },

  // Toast
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
