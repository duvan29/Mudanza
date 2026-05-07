import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Linking, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useVersions, useCreateVersion, useChooseVersion } from '../../src/hooks/useProducts';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { colors, spacing, typography, borderRadius } from '../../src/theme';
import { formatCOP } from '../../src/utils/formatCOP';
import { ExternalLink, Trophy } from 'lucide-react-native';

export default function ProductDetailScreen() {
  const { metaId } = useLocalSearchParams<{ metaId: string }>();
  const { data: versions, isLoading } = useVersions(metaId);
  const createVersion = useCreateVersion(metaId);
  const chooseVersion = useChooseVersion(metaId);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [store, setStore] = useState('');
  const [link, setLink] = useState('');
  const [notes, setNotes] = useState('');

  const handleCreate = async () => {
    if (!name.trim() || !price || !store.trim()) {
      Alert.alert('Error', 'Nombre, precio y tienda son requeridos');
      return;
    }
    try {
      await createVersion.mutateAsync({
        name: name.trim(),
        price: parseInt(price, 10),
        store: store.trim(),
        link: link.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setName('');
      setPrice('');
      setStore('');
      setLink('');
      setNotes('');
      setShowForm(false);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleChoose = async (versionId: string) => {
    try {
      await chooseVersion.mutateAsync(versionId);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  // Find cheapest
  const cheapest = versions?.length
    ? versions.reduce((min, v) => (v.price < min.price ? v : min), versions[0])
    : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={typography.h2}>Comparar versiones</Text>
        <Button
          title={showForm ? 'Cancelar' : '+ Agregar'}
          variant={showForm ? 'ghost' : 'secondary'}
          size="sm"
          onPress={() => setShowForm(!showForm)}
        />
      </View>

      {showForm && (
        <Card style={styles.formCard}>
          <Input label="Producto" value={name} onChangeText={setName} placeholder="Samsung RT29K5710S8" />
          <Input label="Precio (COP)" value={price} onChangeText={setPrice} placeholder="1850000" keyboardType="numeric" />
          <Input label="Tienda" value={store} onChangeText={setStore} placeholder="Alkosto" />
          <Input label="Link (opcional)" value={link} onChangeText={setLink} placeholder="https://..." keyboardType="url" />
          <Input label="Notas (opcional)" value={notes} onChangeText={setNotes} placeholder="Inverter, 300L..." multiline />
          <Button title="Agregar versión" onPress={handleCreate} loading={createVersion.isPending} />
        </Card>
      )}

      {/* Versions */}
      {versions?.map((v) => (
        <Card
          key={v._id}
          variant="elevated"
          style={[
            styles.versionCard,
            v.chosen && styles.versionChosen,
          ]}
        >
          {v.chosen && (
            <View style={styles.trophyRow}>
              <Trophy size={16} color="#D4A017" />
              <Text style={styles.chosenText}>Elegida</Text>
            </View>
          )}
          {cheapest && cheapest._id === v._id && !v.chosen && (
            <Badge text="Más barato" variant="success" />
          )}

          <Text style={styles.versionName}>{v.name}</Text>
          <Text style={typography.amount}>{formatCOP(v.price)}</Text>
          <Text style={styles.storeText}>{v.store}</Text>

          {v.notes && <Text style={styles.notesText}>{v.notes}</Text>}

          <View style={styles.actions}>
            {v.link && (
              <TouchableOpacity
                style={styles.linkBtn}
                onPress={() => Linking.openURL(v.link!)}
              >
                <ExternalLink size={16} color={colors.primary} />
                <Text style={styles.linkText}>Ver en tienda</Text>
              </TouchableOpacity>
            )}
            {!v.chosen && (
              <Button
                title="Elegir esta"
                variant="secondary"
                size="sm"
                onPress={() => handleChoose(v._id)}
              />
            )}
          </View>
        </Card>
      ))}

      {versions?.length === 0 && !isLoading && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Aún no hay versiones</Text>
          <Text style={styles.emptyHint}>Agrega la primera para comparar</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.base, paddingBottom: spacing['4xl'] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  formCard: { marginBottom: spacing.xl },
  versionCard: { marginBottom: spacing.md },
  versionChosen: {
    borderColor: '#D4A017',
    borderWidth: 1.5,
    backgroundColor: '#FFFDF5',
  },
  trophyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  chosenText: { fontSize: 13, fontWeight: '600', color: '#D4A017' },
  versionName: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginTop: spacing.xs },
  storeText: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  notesText: { fontSize: 13, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 18 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  linkBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  linkText: { fontSize: 14, color: colors.primary, fontWeight: '500' },
  empty: { alignItems: 'center', paddingVertical: spacing['4xl'] },
  emptyText: { fontSize: 16, fontWeight: '500', color: colors.textSecondary },
  emptyHint: { fontSize: 14, color: colors.textMuted, marginTop: spacing.xs },
});
