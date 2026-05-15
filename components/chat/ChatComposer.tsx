import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { IconButton } from '@/components/ui/IconButton';
import { useScreenInsets } from '@/hooks/useScreenInsets';
import { colors, gradients, radius, spacing, typography } from '@/theme';

type Props = {
  onSend: (text: string) => void;
  onVoicePress: () => void;
  onAttachPress?: () => void;
};

export function ChatComposer({ onSend, onVoicePress, onAttachPress }: Props) {
  const [value, setValue] = useState('');
  const insets = useScreenInsets();

  const send = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
  };

  return (
    <View
      style={[
        styles.bar,
        { paddingBottom: Math.max(insets.bottom, spacing.md) },
      ]}
    >
      <IconButton
        source={require('@/assets/images/btn-attach.png')}
        width={44}
        height={44}
        onPress={onAttachPress}
        accessibilityLabel="Attach"
      />

      <View style={styles.inputWrap}>
        <LinearGradient
          colors={gradients.bubble}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.inputBg}
        >
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder="Whenever you're ready…"
            placeholderTextColor={colors.textPlaceholder}
            style={styles.input}
            onSubmitEditing={send}
            returnKeyType="send"
            blurOnSubmit={false}
            selectionColor={colors.cursorBlue}
          />
          <Pressable
            onPress={onVoicePress}
            accessibilityLabel="Record voice message"
            hitSlop={8}
            style={styles.mic}
          >
            <Ionicons name="mic-outline" size={18} color={colors.iconStroke} />
          </Pressable>
        </LinearGradient>
      </View>

      <IconButton
        source={require('@/assets/images/btn-send.png')}
        width={61}
        height={44}
        onPress={send}
        accessibilityLabel="Send message"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
    backgroundColor: 'transparent',
  },
  inputWrap: {
    flex: 1,
    borderRadius: radius.composer,
    overflow: 'hidden',
  },
  inputBg: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.lg,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: spacing.sm,
    ...(typeof window !== 'undefined' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  mic: {
    marginLeft: spacing.sm,
    padding: 4,
  },
});
