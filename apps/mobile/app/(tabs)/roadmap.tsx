import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoadmap, useUpdateRoadmap } from '../../src/hooks/useRoadmap';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { colors, spacing, typography } from '../../src/theme';
import { Check, Circle, Play } from 'lucide-react-native';

const statusConfig = {
  pending: { badge: 'neutral' as const, label: 'Pendiente', icon: Circle },
  active: { badge: 'info' as const, label: 'En curso', icon: Play },
  done: { badge: 'success' as const, label: 'Completado', icon: Check },
};

export default function RoadmapScreen() {
  const { data: months, isLoading, refetch } = useRoadmap();
  const updateRoadmap = useUpdateRoadmap();

  const cycleStatus = (id: string, current: string) => {
    const next = current === 'pending' ? 'active' : current === 'active' ? 'done' : 'pending';
    updateRoadmap.mutate({ id, status: next });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        showsVerticalScrollIndicator={false}
      >
        <Text style={typography.h2}>Roadmap 2026</Text>
        <Text style={styles.subtitle}>Enero → Octubre</Text>

        {months?.map((entry, index) => {
          const config = statusConfig[entry.status];
          const Icon = config.icon;
          const isLast = index === (months?.length ?? 0) - 1;

          return (
            <View key={entry._id} style={styles.timelineItem}>
              {/* Timeline connector */}
              <View style={styles.timelineLine}>
                <TouchableOpacity
                  style={[
                    styles.timelineDot,
                    entry.status === 'done' && styles.dotDone,
                    entry.status === 'active' && styles.dotActive,
                  ]}
                  onPress={() => cycleStatus(entry._id, entry.status)}
                >
                  <Icon
                    size={14}
                    color={
                      entry.status === 'done' ? '#fff' :
                      entry.status === 'active' ? '#fff' :
                      colors.textMuted
                    }
                  />
                </TouchableOpacity>
                {!isLast && (
                  <View style={[styles.connector, entry.status === 'done' && styles.connectorDone]} />
                )}
              </View>

              {/* Month card */}
              <Card style={[styles.timelineCard, entry.status === 'active' && styles.activeCard]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.monthLabel}>{entry.month} 2026</Text>
                  <Badge text={config.label} variant={config.badge} />
                </View>
                <Text style={styles.actionText}>{entry.action}</Text>
                {entry.note && <Text style={styles.noteText}>{entry.note}</Text>}
              </Card>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: spacing['4xl'] },
  subtitle: { fontSize: 15, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.xl },
  timelineItem: { flexDirection: 'row', marginBottom: 0 },
  timelineLine: { alignItems: 'center', width: 32, marginRight: spacing.md },
  timelineDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.surfaceAlt, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  dotDone: { backgroundColor: colors.successDark, borderColor: colors.successDark },
  dotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  connector: { width: 2, flex: 1, backgroundColor: colors.border, marginVertical: -2 },
  connectorDone: { backgroundColor: colors.successDark },
  timelineCard: { flex: 1, marginBottom: spacing.md },
  activeCard: { borderColor: colors.primary, borderWidth: 1.5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  monthLabel: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  actionText: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  noteText: { fontSize: 13, color: colors.textMuted, marginTop: spacing.sm, fontStyle: 'italic' },
});
