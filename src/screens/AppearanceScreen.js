import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useAppearance } from '../theme/ThemeContext';

const MODOS = [
  { key: 'auto', label: 'Automático' },
  { key: 'claro', label: 'Claro' },
  { key: 'oscuro', label: 'Oscuro' },
];

export default function AppearanceScreen({ navigation }) {
  const { t, modo, setModo, accentKey, setAccentKey, accents, isDark } = useAppearance();

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={{ padding: 16 }}>
      <Pressable onPress={() => navigation.goBack()} style={{ marginBottom: 16 }}>
        <Text style={{ color: t.primary, fontWeight: '700' }}>‹ Volver</Text>
      </Pressable>

      <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
        <Text style={[styles.titulo, { color: t.textPrimary }]}>Apariencia</Text>

        <Text style={[styles.label, { color: t.textSecondary }]}>Modo</Text>
        <View style={styles.row}>
          {MODOS.map((m) => {
            const activo = modo === m.key;
            return (
              <Pressable
                key={m.key}
                onPress={() => setModo(m.key)}
                style={[
                  styles.chip,
                  { backgroundColor: activo ? t.primary : t.primaryBg, borderColor: t.border },
                ]}
              >
                <Text style={{ color: activo ? t.onPrimary : t.textPrimary, fontWeight: '600' }}>
                  {m.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { color: t.textSecondary, marginTop: 24 }]}>Color</Text>
        <View style={styles.swatchRow}>
          {Object.entries(accents).map(([key, valores]) => {
            const color = isDark ? valores.dark : valores.light;
            const activo = accentKey === key;
            return (
              <Pressable
                key={key}
                onPress={() => setAccentKey(key)}
                style={[
                  styles.swatch,
                  { backgroundColor: color, borderColor: activo ? t.textPrimary : 'transparent' },
                ]}
              />
            );
          })}
        </View>

        <Text style={{ color: t.textSecondary, fontSize: 12, marginTop: 16 }}>
          Los cambios se guardan en este celular y afectan a toda la app.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 0.5, padding: 24 },
  titulo: { fontSize: 19, fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 13, marginBottom: 10 },
  row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  chip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 14, borderWidth: 0.5 },
  swatchRow: { flexDirection: 'row', gap: 14 },
  swatch: { width: 40, height: 40, borderRadius: 20, borderWidth: 3 },
});
