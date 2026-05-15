import { StyleSheet, View } from 'react-native';
import { IconButton } from '@/components/ui/IconButton';
import { StarLogo } from '@/components/ui/StarLogo';
import { useScreenInsets } from '@/hooks/useScreenInsets';
import { spacing } from '@/theme';

type Props = {
  onMenuPress?: () => void;
  onAvatarPress?: () => void;
};

export function ChatHeader({ onMenuPress, onAvatarPress }: Props) {
  const insets = useScreenInsets();
  return (
    <View style={[styles.row, { paddingTop: insets.top + spacing.sm }]}>
      <IconButton
        source={require('@/assets/images/btn-menu.png')}
        width={44}
        height={44}
        onPress={onMenuPress}
        accessibilityLabel="Open menu"
      />

      <StarLogo size={44} glow />

      <IconButton
        source={require('@/assets/images/btn-avatar.png')}
        width={44}
        height={44}
        onPress={onAvatarPress}
        accessibilityLabel="Open profile"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
});
