import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMetrics } from '../../src/hooks/useMetrics';
import { Card } from '../../src/components/ui/Card';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Badge } from '../../src/components/ui/Badge';
import { colors, spacing, typography } from '../../src/theme';
import { formatCOP } from '../../src/utils/formatCOP';

export default function MetricsScreen() {
  const { data: metrics, isLoading, refetch } = useMetrics();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        showsVerticalScrollIndicator={false}
      >
        <Text style={typography.h2}>Métricas</Text>
        <Text style={styles.subtitle}>Análisis de tu progreso</Text>

        {metrics && (
          <>
            {/* Overview card */}
            <Card variant="elevated" style={styles.overviewCard}>
              <View style={styles.overviewRow}>
                <View style={styles.overviewItem}>
                  <Text style={styles.overviewValue}>{metrics.percentage}%</Text>
                  <Text style={styles.overviewLabel}>Completado</Text>
                </View>
                <View style={styles.overviewItem}>
                  <Text style={styles.overviewValue}>{formatCOP(metrics.currentVelocity)}</Text>
                  <Text style={styles.overviewLabel}>Velocidad/mes</Text>
                </View>
              </View>
              <View style={styles.overviewRow}>
                <View style={styles.overviewItem}>
                  <Text style={styles.overviewValue}>{formatCOP(metrics.monthlyRequired)}</Text>
                  <Text style={styles.overviewLabel}>Necesario/mes</Text>
                </View>
                <View style={styles.overviewItem}>
                  <Badge
                    text={metrics.onTrack ? 'A tiempo ✓' : 'Ajustar ritmo'}
                    variant={metrics.onTrack ? 'success' : 'warning'}
                  />
                  <Text style={styles.overviewLabel}>Proyección</Text>
                </View>
              </View>
            </Card>

            {/* Fund breakdown */}
            <Text style={[typography.h3, styles.sectionTitle]}>Por fondo</Text>
            {metrics.funds.map((fund) => (
              <Card key={fund.fundId} style={styles.fundRow}>
                <View style={styles.fundHeader}>
                  <Text style={styles.fundName}>{fund.name}</Text>
                  <Text style={styles.fundPercent}>{fund.percentage}%</Text>
                </View>
                <ProgressBar progress={fund.percentage} height={6} />
                <Text style={styles.fundAmounts}>
                  {formatCOP(fund.saved)} / {formatCOP(fund.target)}
                </Text>
              </Card>
            ))}

            {/* Per-user contributions */}
            <Text style={[typography.h3, styles.sectionTitle]}>Aportes por persona</Text>
            <Card variant="elevated">
              {metrics.contributionsByUser.map((entry) => (
                <View key={entry.userId} style={styles.contributionRow}>
                  <View>
                    <Text style={styles.contributionName}>{entry.displayName}</Text>
                    <Text style={styles.contributionAmount}>{formatCOP(entry.totalContributed)}</Text>
                  </View>
                  <View style={styles.contributionBar}>
                    <View style={[styles.contributionBarFill, { width: `${entry.percentageOfTotal}%` }]} />
                  </View>
                  <Text style={styles.contributionPercent}>{entry.percentageOfTotal}%</Text>
                </View>
              ))}
            </Card>

            {/* Monthly history */}
            <Text style={[typography.h3, styles.sectionTitle]}>Historial mensual</Text>
            {metrics.monthlyHistory.map((entry) => (
              <Card key={entry.month} style={styles.monthCard}>
                <View style={styles.monthHeader}>
                  <Text style={styles.monthName}>{entry.month}</Text>
                  <Text style={typography.amountSmall}>{formatCOP(entry.totalDeposited)}</Text>
                </View>
              </Card>
            ))}

            {metrics.monthlyHistory.length === 0 && (
              <Text style={styles.emptyText}>Aún no hay movimientos registrados</Text>
            )}
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
  subtitle: { fontSize: 15, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.xl },
  overviewCard: { marginBottom: spacing.xl },
  overviewRow: { flexDirection: 'row', marginBottom: spacing.base },
  overviewItem: { flex: 1, alignItems: 'center' },
  overviewValue: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  overviewLabel: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  sectionTitle: { marginBottom: spacing.md, marginTop: spacing.lg },
  fundRow: { marginBottom: spacing.sm },
  fundHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  fundName: { fontSize: 15, fontWeight: '500', color: colors.textPrimary },
  fundPercent: { fontSize: 14, fontWeight: '600', color: colors.primary },
  fundAmounts: { fontSize: 12, color: colors.textMuted, marginTop: spacing.xs },
  contributionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight, gap: spacing.md },
  contributionName: { fontSize: 15, fontWeight: '500', color: colors.textPrimary },
  contributionAmount: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  contributionBar: { flex: 1, height: 8, backgroundColor: colors.surfaceAlt, borderRadius: 4, overflow: 'hidden' },
  contributionBarFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },
  contributionPercent: { fontSize: 12, color: colors.textMuted, width: 40, textAlign: 'right' },
  monthCard: { marginBottom: spacing.sm },
  monthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  monthName: { fontSize: 15, fontWeight: '500', color: colors.textPrimary },
  emptyText: { fontSize: 14, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.xl },
});
