import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useAppTheme, useAppearance } from '../theme/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { getTheme, estilos } from '../theme/colors';

const MODOS = [
  { key: 'auto', label: 'Auto (sistema)' },
  { key: 'claro', label: 'Claro' },
  { key: 'oscuro', label: 'Oscuro' },
];

export default function AparienciaScreen() {
  const t = useAppTheme();
  const { modo, setModo, accentKey, setAccentKey, accents, isDark, estiloKey, setEstiloKey } = useAppearance();

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
      <Text style={[styles.seccion, { color: t.textSecondary, marginTop: 28 }]}>Estilo de pantalla principal</Text>
      <View style={styles.filaEstilos}>
        {Object.keys(estilos).map((key) => {
          const m = getTheme(key === 'oscuro' ? true : isDark, accentKey, key);
          const activo = estiloKey === key;
          return (
            <Pressable key={key} onPress={() => setEstiloKey(key)} style={styles.estiloItem}>
              <LinearGradient colors={m.gradient} style={[styles.mini, { borderColor: activo ? t.primary : t.border, borderWidth: activo ? 3 : 1 }]}>
                <View style={{ width: '45%', height: 8, borderRadius: 4, backgroundColor: m.textPrimary, opacity: 0.8 }} />
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                  <View style={{ width: 34, height: 34, borderRadius: 17, borderWidth: 5, borderColor: m.primary }} />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <View style={{ height: 6, borderRadius: 3, backgroundColor: m.textSecondary, opacity: 0.5 }} />
                    <View style={{ height: 6, width: '60%', borderRadius: 3, backgroundColor: m.textSecondary, opacity: 0.5, marginTop: 5 }} />
                  </View>
                </View>
                <View style={{ marginTop: 10, height: 30, borderRadius: 8, backgroundColor: m.surface, borderWidth: 1, borderColor: m.border }} />
                <View style={{ marginTop: 8, height: 22, borderRadius: 8, backgroundColor: m.primary }} />
              </LinearGradient>
              <Text style={{ color: activo ? t.primary : t.textPrimary, fontWeight: activo ? '800' : '500', marginTop: 6, textAlign: 'center' }}>{estilos[key].label}</Text>
            </Pressable>
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
  filaEstilos: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  estiloItem: { width: '47%' },
  mini: { borderRadius: 16, padding: 12, height: 170 },
});
