import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useFund } from '../../src/hooks/useFunds';
import { useMovements, useCreateMovement, useDeleteMovement } from '../../src/hooks/useMovements';
import { MovementItem } from '../../src/components/MovementItem';
import { Card } from '../../src/components/ui/Card';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { colors, spacing, typography, borderRadius } from '../../src/theme';
import { formatCOP } from '../../src/utils/formatCOP';

export default function MovementsScreen() {
  const { fondoId } = useLocalSearchParams<{ fondoId: string }>();
  const { data: fund } = useFund(fondoId);
  const { data: movements, isLoading } = useMovements(fondoId);
  const createMovement = useCreateMovement();
  const deleteMovement = useDeleteMovement();

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState<'deposit' | 'adjustment'>('deposit');

  const handleAdd = async () => {
    const amountNum = parseInt(amount, 10);
    if (!amountNum || amountNum <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido');
      return;
    }

    try {
      await createMovement.mutateAsync({
        fundId: fondoId,
        amount: amountNum,
        type,
        note: note.trim() || undefined,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setAmount('');
      setNote('');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Eliminar movimiento',
      '¿Estás seguro? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMovement.mutateAsync(id);
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ]
    );
  };

  const percentage = fund && fund.target > 0 ? (fund.saved / fund.target) * 100 : 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <FlatList
        data={movements}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Fund summary */}
            {fund && (
              <Card variant="elevated" style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                  <View style={[styles.dot, { backgroundColor: fund.color }]} />
                  <Text style={typography.h3}>{fund.name}</Text>
                </View>
                <Text style={typography.amount}>{formatCOP(fund.saved)}</Text>
                <Text style={styles.targetText}>de {formatCOP(fund.target)}</Text>
                <ProgressBar progress={percentage} color={fund.color} height={8} />
              </Card>
            )}

            {/* Add form */}
            <Card style={styles.formCard}>
              <Text style={[typography.label, { marginBottom: spacing.sm }]}>Nuevo movimiento</Text>

              <View style={styles.typeRow}>
                {(['deposit', 'adjustment'] as const).map((t) => (
                  <Button
                    key={t}
                    title={t === 'deposit' ? 'Abono' : 'Ajuste'}
                    variant={type === t ? 'primary' : 'secondary'}
                    size="sm"
                    onPress={() => setType(t)}
                    style={styles.typeBtn}
                  />
                ))}
              </View>

              <Input
                label="Monto (COP)"
                value={amount}
                onChangeText={setAmount}
                placeholder="500000"
                keyboardType="numeric"
              />
              <Input
                label="Nota (opcional)"
                value={note}
                onChangeText={setNote}
                placeholder="Ej: Quincena mayo"
              />
              <Button
                title="Agregar"
                onPress={handleAdd}
                loading={createMovement.isPending}
              />
            </Card>

            <Text style={[typography.h3, styles.historyTitle]}>Historial</Text>
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity onLongPress={() => handleDelete(item._id)} activeOpacity={0.7}>
            <MovementItem
              amount={item.amount}
              type={item.type}
              note={item.note}
              date={item.date ?? item.createdAt}
              userName={(item as any).userId?.displayName}
            />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={styles.emptyText}>Aún no hay movimientos</Text>
          ) : null
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: spacing.base, paddingBottom: spacing['4xl'] },
  summaryCard: { marginBottom: spacing.base },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  dot: { width: 12, height: 12, borderRadius: 6 },
  targetText: { fontSize: 14, color: colors.textMuted, marginBottom: spacing.md },
  formCard: { marginBottom: spacing.xl },
  typeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  typeBtn: { flex: 1 },
  historyTitle: { marginBottom: spacing.md },
  emptyText: { fontSize: 14, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.xl },
});
