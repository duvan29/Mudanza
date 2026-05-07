import React from 'react';
import { Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFunds } from '../../src/hooks/useFunds';
import { FundCard } from '../../src/components/FundCard';
import { colors, spacing, typography } from '../../src/theme';
import { formatCOP } from '../../src/utils/formatCOP';
import { TOTAL_TARGET } from '@mudanza/types';

export default function FundsScreen() {
  const router = useRouter();
  const { data: funds, isLoading, refetch } = useFunds();

  const totalSaved = funds?.reduce((sum, f) => sum + f.saved, 0) ?? 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        showsVerticalScrollIndicator={false}
      >
        <Text style={typography.h2}>Fondos de ahorro</Text>
        <Text style={styles.summary}>
          {formatCOP(totalSaved)} de {formatCOP(TOTAL_TARGET)}
        </Text>

        {funds?.map((fund) => (
          <FundCard
            key={fund._id}
            fund={fund}
            onPress={() => router.push(`/movimientos/${fund._id}`)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: spacing['4xl'] },
  summary: { fontSize: 15, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.xl },
});
