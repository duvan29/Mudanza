import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMetrics } from '../../src/hooks/useMetrics';
import { useFunds } from '../../src/hooks/useFunds';
import { useMovements } from '../../src/hooks/useMovements';
import { useAuthStore } from '../../src/store/auth.store';
import { FundCard } from '../../src/components/FundCard';
import { ProgressRing } from '../../src/components/ProgressRing';
import { MovementItem } from '../../src/components/MovementItem';
import { CardSkeleton } from '../../src/components/LoadingSkeleton';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { colors, spacing, typography } from '../../src/theme';
import { formatCOP } from '../../src/utils/formatCOP';
import { LogOut } from 'lucide-react-native';

export default function DashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { data: metrics, isLoading: loadingMetrics, refetch: refetchMetrics } = useMetrics();
  const { data: funds, isLoading: loadingFunds, refetch: refetchFunds } = useFunds();
  const { data: movements } = useMovements();

  const isLoading = loadingMetrics || loadingFunds;
  const recentMovements = movements?.slice(0, 5) ?? [];

  const onRefresh = () => {
    refetchMetrics();
    refetchFunds();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={typography.h2}>Hola, {user?.displayName ?? 'amigo'} 👋</Text>
            <Text style={styles.subtitle}>Tu mudanza está en camino</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <LogOut size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Loading state */}
        {isLoading && !metrics && (
          <>
            <CardSkeleton />
            <CardSkeleton />
          </>
        )}

        {/* Total Progress */}
        {metrics && (
          <Card variant="elevated" style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Ahorro total</Text>
              <Badge
                text={metrics.onTrack ? 'A tiempo ✓' : 'Ajustar ritmo'}
                variant={metrics.onTrack ? 'success' : 'warning'}
              />
            </View>

            <View style={styles.ringRow}>
              <ProgressRing
                progress={metrics.percentage}
                size={110}
                strokeWidth={10}
                color={colors.primary}
                label="completado"
              />
              <View style={styles.ringStats}>
                <Text style={typography.amount}>{formatCOP(metrics.totalSaved)}</Text>
                <Text style={styles.targetText}>de {formatCOP(metrics.totalTarget)}</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{formatCOP(metrics.remaining)}</Text>
                <Text style={styles.statLabel}>Faltante</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{formatCOP(metrics.currentVelocity)}</Text>
                <Text style={styles.statLabel}>Velocidad/mes</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>
                  {metrics.projectedMonths ? `${metrics.projectedMonths} meses` : '—'}
                </Text>
                <Text style={styles.statLabel}>Proyección</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Funds */}
        <Text style={[typography.h3, styles.sectionTitle]}>Fondos</Text>
        {funds?.map((fund) => (
          <FundCard
            key={fund._id}
            fund={fund}
            onPress={() => router.push(`/movimientos/${fund._id}`)}
          />
        ))}

        {/* Recent movements */}
        {recentMovements.length > 0 && (
          <>
            <Text style={[typography.h3, styles.sectionTitle]}>Últimos movimientos</Text>
            <Card>
              {recentMovements.map((mov) => (
                <MovementItem
                  key={mov._id}
                  amount={mov.amount}
                  type={mov.type}
                  note={mov.note}
                  date={mov.date ?? mov.createdAt}
                  userName={(mov as any).userId?.displayName}
                />
              ))}
            </Card>
          </>
        )}

        {/* Per-user contributions */}
        {metrics && metrics.contributionsByUser.length > 0 && (
          <>
            <Text style={[typography.h3, styles.sectionTitle]}>Aportes</Text>
            <Card variant="elevated">
              {metrics.contributionsByUser.map((entry) => (
                <View key={entry.userId} style={styles.contributionRow}>
                  <Text style={styles.contributionName}>{entry.displayName}</Text>
                  <View style={styles.contributionRight}>
                    <Text style={typography.amountSmall}>{formatCOP(entry.totalContributed)}</Text>
                    <Text style={styles.contributionPercent}>{entry.percentageOfTotal}%</Text>
                  </View>
                </View>
              ))}
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: spacing['4xl'] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xl },
  logoutBtn: { padding: spacing.sm, marginTop: spacing.xs },
  subtitle: { fontSize: 15, color: colors.textMuted, marginTop: spacing.xs },
  progressCard: { marginBottom: spacing.xl },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.base },
  progressLabel: { fontSize: 14, fontWeight: '500', color: colors.textSecondary },
  ringRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl, marginBottom: spacing.md },
  ringStats: { flex: 1 },
  targetText: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.base, paddingTop: spacing.base, borderTopWidth: 1, borderTopColor: colors.borderLight },
  stat: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  sectionTitle: { marginBottom: spacing.md, marginTop: spacing.lg },
  contributionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  contributionName: { fontSize: 16, fontWeight: '500', color: colors.textPrimary },
  contributionRight: { alignItems: 'flex-end' },
  contributionPercent: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
