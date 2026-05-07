import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { IFund } from '@mudanza/types';
import { Card } from './ui/Card';
import { ProgressBar } from './ui/ProgressBar';
import { colors, spacing, typography } from '../theme';
import { formatCOP } from '../utils/formatCOP';

interface FundCardProps {
  fund: IFund;
  onPress?: () => void;
}

export function FundCard({ fund, onPress }: FundCardProps) {
  const percentage = fund.target > 0 ? (fund.saved / fund.target) * 100 : 0;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card variant="elevated" style={styles.card}>
        <View style={styles.header}>
          <View style={[styles.iconDot, { backgroundColor: fund.color }]} />
          <Text style={typography.h3} numberOfLines={1}>
            {fund.name}
          </Text>
        </View>

        <View style={styles.amounts}>
          <Text style={typography.amountSmall}>{formatCOP(fund.saved)}</Text>
          <Text style={styles.target}>de {formatCOP(fund.target)}</Text>
        </View>

        <ProgressBar progress={percentage} color={fund.color} />

        <Text style={styles.percent}>{percentage.toFixed(1)}%</Text>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  iconDot: { width: 12, height: 12, borderRadius: 6 },
  amounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  target: { fontSize: 14, color: colors.textMuted },
  percent: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
});
