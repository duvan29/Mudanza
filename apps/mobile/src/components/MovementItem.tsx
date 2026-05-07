import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';
import { formatCOP } from '../utils/formatCOP';
import { timeAgo } from '../utils/dates';

interface MovementItemProps {
  amount: number;
  type: 'deposit' | 'adjustment';
  note: string | null;
  date: string;
  userName?: string;
}

export function MovementItem({ amount, type, note, date, userName }: MovementItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={[styles.dot, type === 'deposit' ? styles.dotDeposit : styles.dotAdjustment]} />
        <View style={styles.info}>
          <Text style={styles.amount}>
            {type === 'deposit' ? '+' : ''}{formatCOP(amount)}
          </Text>
          {note && <Text style={styles.note} numberOfLines={1}>{note}</Text>}
        </View>
      </View>
      <View style={styles.right}>
        {userName && <Text style={styles.user}>{userName}</Text>}
        <Text style={styles.date}>{timeAgo(date)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: spacing.md },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotDeposit: { backgroundColor: colors.successDark },
  dotAdjustment: { backgroundColor: colors.warningDark },
  info: { flex: 1 },
  amount: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  note: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  user: { fontSize: 12, fontWeight: '500', color: colors.textSecondary },
  date: { fontSize: 12, color: colors.textMuted },
});
