import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useProducts, useCreateProduct } from '../../src/hooks/useProducts';
import { useFunds } from '../../src/hooks/useFunds';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { colors, spacing, typography, borderRadius } from '../../src/theme';
import { formatCOP } from '../../src/utils/formatCOP';
import { Plus } from 'lucide-react-native';

export default function ProductsScreen() {
  const router = useRouter();
  const { data: products, isLoading, refetch } = useProducts();
  const { data: funds } = useFunds();
  const createProduct = useCreateProduct();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [fundId, setFundId] = useState('');

  const handleCreate = async () => {
    if (!name.trim() || !budget || !fundId) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    try {
      await createProduct.mutateAsync({
        name: name.trim(),
        budget: parseInt(budget, 10),
        fundId,
      });
      setName('');
      setBudget('');
      setShowForm(false);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={typography.h2}>Productos</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(!showForm)}>
            <Plus size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Compara precios y elige el mejor</Text>

        {showForm && (
          <Card style={styles.formCard}>
            <Input label="Nombre del producto" value={name} onChangeText={setName} placeholder="Ej: Nevera" />
            <Input label="Presupuesto (COP)" value={budget} onChangeText={setBudget} placeholder="1500000" keyboardType="numeric" />
            <Text style={styles.fundLabel}>Fondo asociado:</Text>
            <View style={styles.fundOptions}>
              {funds?.map((f) => (
                <TouchableOpacity
                  key={f._id}
                  style={[styles.fundChip, fundId === f._id && { backgroundColor: f.color }]}
                  onPress={() => setFundId(f._id)}
                >
                  <Text style={[styles.fundChipText, fundId === f._id && styles.fundChipActive]}>
                    {f.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Button title="Crear producto" onPress={handleCreate} loading={createProduct.isPending} />
          </Card>
        )}

        {products?.map((product) => (
          <TouchableOpacity key={product._id} onPress={() => router.push(`/metas/${product._id}`)} activeOpacity={0.7}>
            <Card variant="elevated" style={styles.productCard}>
              <View style={styles.productHeader}>
                <Text style={typography.h3}>{product.name}</Text>
                {product.purchased && <Badge text="Comprado" variant="success" />}
              </View>
              <Text style={styles.productBudget}>Presupuesto: {formatCOP(product.budget)}</Text>
              <Text style={styles.productHint}>Toca para ver versiones →</Text>
            </Card>
          </TouchableOpacity>
        ))}

        {products?.length === 0 && !isLoading && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aún no hay productos</Text>
            <Text style={styles.emptyHint}>Agrega el primero con el botón +</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: spacing['4xl'] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  subtitle: { fontSize: 15, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.xl },
  formCard: { marginBottom: spacing.xl },
  fundLabel: { fontSize: 14, fontWeight: '500', color: colors.textSecondary, marginBottom: spacing.sm },
  fundOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.base },
  fundChip: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md, borderRadius: borderRadius.full, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  fundChipText: { fontSize: 13, color: colors.textSecondary },
  fundChipActive: { color: colors.textPrimary, fontWeight: '600' },
  productCard: { marginBottom: spacing.md },
  productHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  productBudget: { fontSize: 14, color: colors.textSecondary },
  productHint: { fontSize: 12, color: colors.textMuted, marginTop: spacing.sm },
  empty: { alignItems: 'center', paddingVertical: spacing['4xl'] },
  emptyText: { fontSize: 16, fontWeight: '500', color: colors.textSecondary },
  emptyHint: { fontSize: 14, color: colors.textMuted, marginTop: spacing.xs },
});
