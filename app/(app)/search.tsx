import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useScreenInsets } from '@/hooks/useScreenInsets';
import { searchConversations, type SearchResult } from '@/lib/conversations';
import { colors, radius, spacing, typography } from '@/theme';

export default function Search() {
  const insets = useScreenInsets();
  const [query, setQuery] = useState('');

  const results: SearchResult[] = useMemo(
    () => (query.trim().length === 0 ? [] : searchConversations(query)),
    [query],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, { title: string; matches: SearchResult[] }>();
    for (const r of results) {
      if (!map.has(r.conversationId)) {
        map.set(r.conversationId, { title: r.conversationTitle, matches: [] });
      }
      map.get(r.conversationId)!.matches.push(r);
    }
    return Array.from(map.entries());
  }, [results]);

  return (
    <View style={styles.root}>
      <ScreenHeader title="Search" />
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search across all conversations"
            placeholderTextColor={colors.textPlaceholder}
            style={styles.searchInput}
            autoFocus
            selectionColor={colors.cursorBlue}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={12}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xxxl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {query.trim().length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={28} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Search your history</Text>
            <Text style={styles.emptySub}>
              Find anything you or the AI said — across every conversation.
            </Text>
          </View>
        )}

        {query.trim().length > 0 && results.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="leaf-outline" size={28} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No matches</Text>
            <Text style={styles.emptySub}>
              {`Nothing in your history mentions "${query.trim()}". Try a shorter word.`}
            </Text>
          </View>
        )}

        {grouped.length > 0 && (
          <Text style={styles.summary}>
            {results.length} result{results.length === 1 ? '' : 's'} across{' '}
            {grouped.length} conversation{grouped.length === 1 ? '' : 's'}
          </Text>
        )}

        {grouped.map(([convId, group]) => (
          <View key={convId} style={styles.group}>
            <Text style={styles.groupTitle} numberOfLines={1}>
              {group.title}
            </Text>
            <View style={styles.matches}>
              {group.matches.map((r, i) => (
                <Pressable
                  key={`${r.message.id}-${i}`}
                  onPress={() =>
                    router.push({
                      pathname: '/(app)/chat',
                      params: { convId, messageId: r.message.id },
                    })
                  }
                  style={({ pressed }) => [
                    styles.match,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <View style={styles.matchHeader}>
                    <View
                      style={[
                        styles.fromBadge,
                        r.message.from === 'user'
                          ? styles.fromBadgeUser
                          : styles.fromBadgeAi,
                      ]}
                    >
                      <Text style={styles.fromBadgeLabel}>
                        {r.message.from === 'user' ? 'You' : 'Eesly'}
                      </Text>
                    </View>
                    <Ionicons
                      name="arrow-forward"
                      size={14}
                      color={colors.textMuted}
                    />
                  </View>
                  <Text style={styles.snippet}>
                    {r.snippet.slice(0, r.matchStart)}
                    <Text style={styles.highlight}>
                      {r.snippet.slice(r.matchStart, r.matchEnd)}
                    </Text>
                    {r.snippet.slice(r.matchEnd)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  searchWrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceGlass,
    minHeight: 44,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: 4,
    ...((typeof window !== 'undefined') ? ({ outlineStyle: 'none' } as any) : {}),
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  summary: {
    ...typography.caption,
    color: colors.textMuted,
    marginLeft: spacing.md,
  },
  empty: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
  },
  emptySub: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Grouped results
  group: { gap: spacing.sm },
  groupTitle: {
    ...typography.label,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginLeft: spacing.md,
  },
  matches: { gap: spacing.sm },
  match: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceGlass,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  fromBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
  },
  fromBadgeUser: {
    borderColor: colors.borderStrong,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  fromBadgeAi: {
    borderColor: colors.borderAccent,
    backgroundColor: 'rgba(235,59,118,0.10)',
  },
  fromBadgeLabel: {
    ...typography.caption,
    color: colors.text,
    fontFamily: 'DMSans_500Medium',
  },
  snippet: {
    ...typography.body,
    color: colors.textBubble,
  },
  highlight: {
    backgroundColor: 'rgba(235,59,118,0.35)',
    color: colors.text,
    fontFamily: 'DMSans_700Bold',
  },
});
