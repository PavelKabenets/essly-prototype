import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useScreenInsets } from '@/hooks/useScreenInsets';
import { denyMicPermission, grantMicPermission, hasMicPermission } from '@/lib/voicePerms';
import { nextTranscript } from '@/mock/chat';
import { StarLogo } from '@/components/ui/StarLogo';
import { colors, gradients, radius, spacing, typography } from '@/theme';

type Props = {
  onCancel: () => void;
  onComplete: (transcript: string) => void;
};

type Step = 'permission' | 'recording' | 'processing' | 'review';

const RECORDING_AUTO_FINISH_MS = 5000;
const PROCESSING_MS = 1100;

export function VoiceOverlay({ onCancel, onComplete }: Props) {
  const insets = useScreenInsets();
  const [step, setStep] = useState<Step>(
    hasMicPermission() ? 'recording' : 'permission',
  );
  const [transcript, setTranscript] = useState('');
  const [paused, setPaused] = useState(false);
  // appending = true means the next recording APPENDS to existing transcript
  const [appending, setAppending] = useState(false);

  return (
    <View style={styles.overlay}>
      {step === 'permission' && (
        <PermissionDialog
          onAllow={() => {
            grantMicPermission();
            setStep('recording');
          }}
          onDeny={() => {
            denyMicPermission();
            onCancel();
          }}
        />
      )}

      {step === 'recording' && (
        <RecordingView
          paused={paused}
          onTogglePause={() => setPaused((p) => !p)}
          onStop={() => setStep('processing')}
          onCancel={() => {
            if (appending) {
              // Cancelling an "add more" returns to review with existing text
              setAppending(false);
              setStep('review');
            } else {
              onCancel();
            }
          }}
          insetTop={insets.top}
          insetBottom={insets.bottom}
        />
      )}

      {step === 'processing' && (
        <ProcessingView
          onDone={() => {
            const fresh = nextTranscript();
            setTranscript((prev) => (appending && prev ? `${prev} ${fresh}` : fresh));
            setAppending(false);
            setStep('review');
          }}
        />
      )}

      {step === 'review' && (
        <ReviewView
          value={transcript}
          onChange={setTranscript}
          onDiscard={() => {
            setTranscript('');
            onCancel();
          }}
          onReRecord={() => {
            setTranscript('');
            setAppending(false);
            setStep('recording');
          }}
          onAddMore={() => {
            setAppending(true);
            setStep('recording');
          }}
          onSend={() => {
            const text = transcript.trim();
            if (!text) {
              onCancel();
              return;
            }
            onComplete(text);
          }}
          insetTop={insets.top}
          insetBottom={insets.bottom}
        />
      )}
    </View>
  );
}

// ─── Permission dialog ─────────────────────────────────────────────────────

function PermissionDialog({ onAllow, onDeny }: { onAllow: () => void; onDeny: () => void }) {
  return (
    <View style={styles.permWrap}>
      <View style={styles.permBackdrop} />
      <View style={styles.permPanel}>
        <Text style={styles.permTitle}>
          {'"Eesly" Would Like to Access the Microphone'}
        </Text>
        <Text style={styles.permBody}>
          Eesly uses your microphone so you can record voice messages.
          Recordings are transcribed to text before sending.
        </Text>
        <View style={styles.permDivider} />
        <View style={styles.permButtons}>
          <Pressable
            onPress={onDeny}
            style={({ pressed }) => [styles.permBtn, pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.permBtnLabel}>{"Don't Allow"}</Text>
          </Pressable>
          <View style={styles.permBtnDivider} />
          <Pressable
            onPress={onAllow}
            style={({ pressed }) => [styles.permBtn, pressed && { opacity: 0.6 }]}
          >
            <Text style={[styles.permBtnLabel, styles.permBtnPrimary]}>OK</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ─── Recording state ───────────────────────────────────────────────────────

function RecordingView({
  paused,
  onTogglePause,
  onStop,
  onCancel,
  insetTop,
  insetBottom,
}: {
  paused: boolean;
  onTogglePause: () => void;
  onStop: () => void;
  onCancel: () => void;
  insetTop: number;
  insetBottom: number;
}) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    );
    if (!paused) loop.start();
    return () => loop.stop();
  }, [pulse, paused]);

  // Auto-finish after a max recording time (unless paused / already stopped)
  useEffect(() => {
    if (paused) return;
    const auto = setTimeout(onStop, RECORDING_AUTO_FINISH_MS);
    return () => clearTimeout(auto);
  }, [paused, onStop]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const haloOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1] });

  return (
    <View style={styles.recRoot}>
      {/* Soft radial pink glow at bottom-center (matches Figma) */}
      <View style={styles.recGlowWrap} pointerEvents="none">
        <View style={styles.recGlow} />
      </View>

      <View style={[styles.recContent, { paddingTop: insetTop + spacing.xxxl }]}>
        <Animated.View style={{ transform: [{ scale }], marginTop: spacing.xl }}>
          <StarLogo size={64} glow />
        </Animated.View>

        <View style={styles.lyricWrap}>
          <Text style={styles.lyric}>
            {`You don't talk to it,\nyou talk to yourself through it.`}
          </Text>
        </View>

        <View style={styles.spacer} />

        {/* Thin separator line above the mic pill */}
        <View style={styles.separator} />

        {/* Glassy mic pill with pink halo behind */}
        <Pressable
          onPress={onStop}
          accessibilityLabel="Stop recording"
          style={({ pressed }) => [styles.micWrap, pressed && { opacity: 0.85 }]}
        >
          <Animated.View style={[styles.micHalo, { opacity: haloOpacity }]} />
          <View style={styles.micPill}>
            <Ionicons name="mic" size={22} color={colors.text} />
          </View>
        </Pressable>

        {/* Bottom corners: cancel + pause/resume */}
        <View
          style={[
            styles.recCorners,
            { paddingBottom: insetBottom + spacing.md },
          ]}
        >
          <Pressable
            onPress={onCancel}
            accessibilityLabel="Cancel recording"
            hitSlop={12}
            style={styles.cornerBtn}
          >
            <Ionicons name="close" size={22} color={colors.iconStroke} />
          </Pressable>
          <Pressable
            onPress={onTogglePause}
            accessibilityLabel={paused ? 'Resume' : 'Pause'}
            hitSlop={12}
            style={styles.cornerBtn}
          >
            <Ionicons
              name={paused ? 'play' : 'pause'}
              size={22}
              color={colors.iconStroke}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ─── Processing state ─────────────────────────────────────────────────────

function ProcessingView({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, PROCESSING_MS);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <View style={[styles.content, styles.centerAll]}>
      <ActivityIndicator size="large" color={colors.pink} />
      <Text style={styles.processingText}>Transcribing…</Text>
    </View>
  );
}

// ─── Review state ─────────────────────────────────────────────────────────

function ReviewView({
  value,
  onChange,
  onDiscard,
  onReRecord,
  onAddMore,
  onSend,
  insetTop,
  insetBottom,
}: {
  value: string;
  onChange: (s: string) => void;
  onDiscard: () => void;
  onReRecord: () => void;
  onAddMore: () => void;
  onSend: () => void;
  insetTop: number;
  insetBottom: number;
}) {
  return (
    <View style={[styles.content, { paddingTop: insetTop + spacing.lg }]}>
      <View style={styles.reviewHeader}>
        <Pressable
          onPress={onDiscard}
          accessibilityLabel="Discard recording"
          hitSlop={12}
          style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.6 }]}
        >
          <Ionicons name="close" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.reviewTitle}>Review your message</Text>
        <View style={styles.headerBtn} />
      </View>

      <Text style={styles.reviewHint}>
        Edit the text below, record more, or send as-is.
      </Text>

      <View style={styles.transcriptCard}>
        <LinearGradient
          colors={gradients.bubble}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.transcriptBg}
        >
          <TextInput
            value={value}
            onChangeText={onChange}
            multiline
            placeholder="Your message will appear here…"
            placeholderTextColor={colors.textPlaceholder}
            style={styles.transcriptInput}
            selectionColor={colors.cursorBlue}
            autoFocus
          />
        </LinearGradient>
      </View>

      <View style={styles.secondaryRow}>
        <SmallAction icon="refresh" label="Re-record" onPress={onReRecord} />
        <SmallAction icon="mic-outline" label="Add more" onPress={onAddMore} />
      </View>

      <View style={styles.spacer} />

      <View style={[styles.sendBar, { paddingBottom: insetBottom + spacing.lg }]}>
        <Pressable
          onPress={onSend}
          disabled={value.trim().length === 0}
          accessibilityLabel="Send message"
          style={({ pressed }) => [
            styles.sendBtn,
            value.trim().length === 0 && { opacity: 0.4 },
            pressed && { opacity: 0.85 },
          ]}
        >
          <LinearGradient
            colors={['#FF4A8E', '#FF1B6B', '#C7155A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sendBtnGradient}
          >
            <Text style={styles.sendBtnLabel}>Send message</Text>
            <Ionicons name="arrow-up" size={18} color={colors.text} />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

function SmallAction({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.smallAction, pressed && { opacity: 0.75 }]}
    >
      <Ionicons name={icon} size={16} color={colors.text} />
      <Text style={styles.smallActionLabel}>{label}</Text>
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    zIndex: 100,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  centerAll: {
    justifyContent: 'center',
    gap: spacing.lg,
  },
  spacer: { flex: 1 },

  // Permission dialog
  permWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  permBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    ...(Platform.OS === 'web' ? ({ backdropFilter: 'blur(8px)' } as any) : {}),
  },
  permPanel: {
    width: 270,
    backgroundColor: 'rgba(40,40,42,0.95)',
    borderRadius: 14,
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? ({ backdropFilter: 'blur(20px) saturate(180%)' } as any) : {}),
  },
  permTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    paddingTop: 18,
    paddingHorizontal: 16,
  },
  permBody: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 18,
  },
  permDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  permButtons: {
    flexDirection: 'row',
  },
  permBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  permBtnDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  permBtnLabel: {
    color: '#0A84FF',
    fontSize: 17,
  },
  permBtnPrimary: {
    fontWeight: '600',
  },

  // Recording — Figma layout
  recRoot: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  recContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  recGlowWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  recGlow: {
    width: 520,
    height: 360,
    borderRadius: 9999,
    backgroundColor: '#EB3B76',
    opacity: 0.45,
    marginBottom: -160,
    ...(Platform.OS === 'web' ? ({ filter: 'blur(80px)' } as any) : {}),
  },
  lyricWrap: { marginTop: spacing.xxl, alignItems: 'center' },
  lyric: {
    ...typography.lyric,
    color: '#DFC5CD',
    textAlign: 'center',
    ...(Platform.OS === 'web'
      ? ({
          backgroundImage:
            'linear-gradient(90deg, #6B5C8A 0%, #FFE4EA 50%, #6B5C8A 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        } as any)
      : {}),
  },
  separator: {
    width: 280,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginBottom: spacing.md,
  },
  micWrap: {
    width: 140,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  micHalo: {
    position: 'absolute',
    width: 140,
    height: 36,
    borderRadius: 9999,
    backgroundColor: '#EB3B76',
    ...(Platform.OS === 'web' ? ({ filter: 'blur(14px)' } as any) : {}),
  },
  micPill: {
    width: 92,
    height: 52,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
    backgroundColor: 'rgba(70, 20, 38, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        } as any)
      : {}),
  },
  recCorners: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
  },
  cornerBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Processing
  processingText: {
    ...typography.body,
    color: colors.textSecondary,
  },

  // Review
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.sm,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewTitle: {
    ...typography.h3,
    color: colors.text,
  },
  reviewHint: {
    ...typography.bodySm,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  transcriptCard: {
    width: '100%',
    borderRadius: radius.lg,
    overflow: 'hidden',
    minHeight: 140,
  },
  transcriptBg: {
    flex: 1,
    padding: spacing.md,
    minHeight: 140,
  },
  transcriptInput: {
    flex: 1,
    color: colors.text,
    ...typography.body,
    textAlignVertical: 'top',
    minHeight: 120,
    ...(typeof window !== 'undefined' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  smallAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceGlass,
  },
  smallActionLabel: {
    ...typography.label,
    color: colors.text,
  },
  sendBar: {
    width: '100%',
    paddingTop: spacing.md,
  },
  sendBtn: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  sendBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  sendBtnLabel: {
    ...typography.button,
    color: colors.text,
  },
});
