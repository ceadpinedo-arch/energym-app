import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useAppTheme, useAppearance } from '../theme/ThemeContext';

const MODOS = [
  { key: 'auto', label: 'Auto (sistema)' },
  { key: 'claro', label: 'Claro' },
  { key: 'oscuro', label: 'Oscuro' },
];

export default function AparienciaScreen() {
  const t = useAppTheme();
  const { modo, setModo, accentKey, setAccentKey, accents, isDark } = useAppearance();

  return (
    <ScrollView style={[styles.container, { backgroundColor: t.bg }]} contentContainerStyle={{ padding: 20 }}>
      <Text style={[styles.titulo, { color: t.textPrimary }]}>Apariencia</Text>

      <Text style={[styles.seccion, { color: t.textSecondary }]}>Modo</Text>
      <View style={styles.filaModos}>
        {MODOS.map((m) => {
          const activo = modo === m.key;
          return (
            <Pressable
              key={m.key}
              onPress={() => setModo(m.key)}
              style={[
                styles.chip,
                { borderColor: t.border, backgroundColor: activo ? t.primaryBg : t.surface },
              ]}
            >
              <Text style={{ color: activo ? t.primary : t.textPrimary, fontWeight: activo ? '700' : '400' }}>
                {m.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.seccion, { color: t.textSecondary, marginTop: 28 }]}>Color de acento</Text>
      <View style={styles.filaAcentos}>
        {Object.keys(accents).map((key) => {
          const color = isDark ? accents[key].dark : accents[key].light;
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  titulo: { fontSize: 24, fontWeight: '800', marginBottom: 20 },
  seccion: { fontSize: 14, fontWeight: '600', marginBottom: 10, textTransform: 'uppercase' },
  filaModos: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1 },
  filaAcentos: { flexDirection: 'row', gap: 14 },
  swatch: { width: 44, height: 44, borderRadius: 22, borderWidth: 3 },
});
