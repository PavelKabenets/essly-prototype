import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AuthSheet } from './AuthSheet';

type Account = {
  id: string;
  name: string;
  email: string;
  initials: string;
  existing: boolean;
};

const MOCK_ACCOUNTS: Account[] = [
  {
    id: '1',
    name: 'Alex Demo',
    email: 'alex.demo@gmail.com',
    initials: 'AD',
    existing: false,
  },
  {
    id: '2',
    name: 'Demo User',
    email: 'demo@eesly.app',
    initials: 'DU',
    existing: true,
  },
];

type Step = 'pick' | 'allow' | 'loading';

type Props = {
  visible: boolean;
  onClose: () => void;
  onAuthenticated: (existingUser: boolean) => void;
};

export function GoogleAuthSheet({ visible, onClose, onAuthenticated }: Props) {
  const [step, setStep] = useState<Step>('pick');
  const [selected, setSelected] = useState<Account | null>(null);

  // Reset state every time the sheet (re)opens
  useEffect(() => {
    if (visible) {
      setStep('pick');
      setSelected(null);
    }
  }, [visible]);

  useEffect(() => {
    if (step !== 'loading') return;
    const t = setTimeout(() => {
      if (selected) onAuthenticated(selected.existing);
    }, 900);
    return () => clearTimeout(t);
  }, [step, selected, onAuthenticated]);

  return (
    <AuthSheet visible={visible} onClose={onClose}>
      <View style={styles.panel}>
        {/* Top branded bar */}
        <View style={styles.topBar}>
          <View style={styles.googleLogo}>
            <GoogleG />
          </View>
          <Text style={styles.topBarText}>accounts.google.com</Text>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            accessibilityLabel="Cancel Google sign-in"
          >
            <Ionicons name="close" size={20} color="#5F6368" />
          </Pressable>
        </View>

        {step === 'pick' && (
          <View style={styles.body}>
            <Text style={styles.title}>Choose an account</Text>
            <Text style={styles.subtitle}>to continue to Eesly</Text>

            {MOCK_ACCOUNTS.map((acc) => (
              <Pressable
                key={acc.id}
                style={({ pressed }) => [
                  styles.accountRow,
                  pressed && styles.accountRowPressed,
                ]}
                onPress={() => {
                  setSelected(acc);
                  setStep('allow');
                }}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{acc.initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.accountName}>{acc.name}</Text>
                  <Text style={styles.accountEmail}>{acc.email}</Text>
                </View>
              </Pressable>
            ))}

            <Pressable style={styles.accountRow}>
              <View style={[styles.avatar, styles.avatarPlus]}>
                <Ionicons name="person-add" size={18} color="#5F6368" />
              </View>
              <Text style={styles.accountName}>Use another account</Text>
            </Pressable>
          </View>
        )}

        {step === 'allow' && selected && (
          <View style={styles.body}>
            <View style={styles.allowAvatar}>
              <Text style={styles.allowAvatarText}>{selected.initials}</Text>
            </View>
            <Text style={styles.title}>Continue as {selected.name.split(' ')[0]}?</Text>
            <Text style={styles.permissionSub}>
              Eesly wants access to your name, email address, language preference, and profile picture.
            </Text>

            <View style={styles.permissionList}>
              <PermissionRow icon="person-circle-outline" label="Profile info" />
              <PermissionRow icon="mail-outline" label={selected.email} />
            </View>

            <View style={styles.actions}>
              <Pressable
                style={({ pressed }) => [
                  styles.btnSecondary,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={onClose}
              >
                <Text style={styles.btnSecondaryLabel}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.btnPrimary,
                  pressed && { opacity: 0.85 },
                ]}
                onPress={() => setStep('loading')}
              >
                <Text style={styles.btnPrimaryLabel}>Continue</Text>
              </Pressable>
            </View>
          </View>
        )}

        {step === 'loading' && (
          <View style={[styles.body, styles.loadingBody]}>
            <ActivityIndicator size="large" color="#4285F4" />
            <Text style={styles.loadingText}>Signing you in…</Text>
          </View>
        )}
      </View>
    </AuthSheet>
  );
}

function PermissionRow({ icon, label }: { icon: any; label: string }) {
  return (
    <View style={styles.permRow}>
      <Ionicons name={icon} size={18} color="#5F6368" />
      <Text style={styles.permLabel}>{label}</Text>
    </View>
  );
}

function GoogleG() {
  return (
    <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#4285F4', fontSize: 22, fontWeight: '700' }}>G</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 32,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAED',
    gap: 12,
  },
  googleLogo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F3F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarText: {
    flex: 1,
    fontSize: 13,
    color: '#5F6368',
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 22,
    color: '#202124',
    fontWeight: '500',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#5F6368',
    marginBottom: 24,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 16,
  },
  accountRowPressed: {
    backgroundColor: '#F1F3F4',
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A73E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlus: {
    backgroundColor: '#F1F3F4',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  accountName: {
    fontSize: 14,
    color: '#202124',
    fontWeight: '500',
  },
  accountEmail: {
    fontSize: 13,
    color: '#5F6368',
    marginTop: 2,
  },
  allowAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1A73E8',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  allowAvatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
  permissionSub: {
    fontSize: 14,
    color: '#5F6368',
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  permissionList: {
    gap: 12,
    marginBottom: 24,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
  },
  permRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  permLabel: {
    fontSize: 14,
    color: '#202124',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  btnSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  btnSecondaryLabel: {
    fontSize: 14,
    color: '#1A73E8',
    fontWeight: '500',
  },
  btnPrimary: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    backgroundColor: '#1A73E8',
    borderRadius: 4,
  },
  btnPrimaryLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  loadingBody: {
    alignItems: 'center',
    paddingVertical: 64,
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    color: '#5F6368',
  },
});
