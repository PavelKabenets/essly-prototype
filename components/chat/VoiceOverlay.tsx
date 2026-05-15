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
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1200,
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
    const tick = setInterval(() => setElapsed((e) => e + 100), 100);
    const auto = setTimeout(onStop, RECORDING_AUTO_FINISH_MS);
    return () => {
      clearInterval(tick);
      clearTimeout(auto);
    };
  }, [paused, onStop]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const seconds = Math.floor(elapsed / 1000);
  const ms = Math.floor((elapsed % 1000) / 100);

  return (
    <View style={[styles.content, { paddingTop: insetTop + spacing.xxxl }]}>
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <LinearGradient
          colors={['rgba(11,12,16,0)', 'rgba(11,12,16,0)', '#ED3E77']}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </View>

      <Animated.View style={{ transform: [{ scale }] }}>
        <StarLogo size={64} glow />
      </Animated.View>

      <View style={styles.lyricWrap}>
        <Text style={styles.lyric}>
          {`You don't talk to it,\nyou talk to yourself through it.`}
        </Text>
      </View>

      <View style={styles.timer}>
        <Text style={styles.timerText}>
          {seconds < 10 ? `0${seconds}` : seconds}.{ms}s
        </Text>
      </View>

      <View style={styles.spacer} />

      <View style={[styles.bottomBar, { paddingBottom: insetBottom + spacing.lg }]}>
        <View style={styles.bottomRow}>
          <Pressable
            onPress={onCancel}
            accessibilityLabel="Cancel recording"
            hitSlop={12}
            style={styles.smallBtn}
          >
            <Ionicons name="close" size={22} color={colors.iconStroke} />
          </Pressable>

          <Pressable
            onPress={onStop}
            accessibilityLabel="Stop recording"
            style={({ pressed }) => [styles.stopBtn, pressed && { opacity: 0.85 }]}
          >
            <View style={styles.stopInner}>
              <Ionicons name="stop" size={22} color={colors.text} />
            </View>
          </Pressable>

          <Pressable
            onPress={onTogglePause}
            accessibilityLabel={paused ? 'Resume' : 'Pause'}
            hitSlop={12}
            style={styles.smallBtn}
          >
            <Ionicons name={paused ? 'play' : 'pause'} size={22} color={colors.iconStroke} />
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

  // Recording
  lyricWrap: { marginTop: spacing.xxl, alignItems: 'center' },
  lyric: {
    ...typography.lyric,
    color: colors.lavenderText,
    textAlign: 'center',
  },
  timer: {
    marginTop: spacing.xl,
  },
  timerText: {
    ...typography.h3,
    color: colors.pink,
    fontVariant: ['tabular-nums'],
  },
  bottomBar: {
    width: '100%',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  smallBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.pink,
    shadowOpacity: 0.6,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    ...(Platform.OS === 'web' ? ({ boxShadow: '0 0 32px rgba(235,59,118,0.5)' } as any) : {}),
  },
  stopInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)',
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
