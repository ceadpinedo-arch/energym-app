import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { getTheme } from '../theme/colors';
import { API_URL } from '../config';
import { useAppTheme } from '../theme/ThemeContext';

export default function ListaSociosScreen({ navigation, route }) {
  const { token } = route.params;
  const t = useAppTheme();

  const [socios, setSocios] = useState(route.params.socios || []);
  const [cargando, setCargando] = useState(true);

  function cargar() {
    setCargando(true);
    fetch(`${API_URL}/api/socios`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setSocios(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargar();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, padding: 16 }}>
      <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border, flex: 1 }]}>
        <View style={styles.headerRow}>
          <Text style={{ color: t.textPrimary, fontSize: 19, fontWeight: '700' }}>Socios y cuotas</Text>
          <Pressable
            onPress={() => navigation.navigate('AltaSocio', { token, onCreated: cargar })}
            style={[styles.addBtn, { backgroundColor: t.primary }]}
          >
            <Text style={{ color: t.onPrimary, fontSize: 13, fontWeight: '600' }}>+ Alta</Text>
          </Pressable>
        </View>

        <FlatList
          data={socios}
          keyExtractor={(item) => item.id}
          refreshing={cargando}
          onRefresh={cargar}
          renderItem={({ item }) => {
            const alDia = item.estadoPago === 'AL_DIA';
            return (
          <Pressable
            onPress={() => navigation.navigate('DetalleSocio', { token, socioId: item.id })}
            style={[styles.row, { backgroundColor: t.bg }]}
          >
                <View style={{ flex: 1 }}>
                  <Text style={{ color: t.textPrimary, fontSize: 14, fontWeight: '600' }}>{item.nombre}</Text>
                  <Text style={{ color: t.textSecondary, fontSize: 12, marginTop: 2 }}>DNI {item.dni}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: alDia ? t.successBg : t.dangerBg }]}>
                  <Text style={{ color: alDia ? t.success : t.danger, fontSize: 12, fontWeight: '600' }}>
                    {alDia ? 'Al día' : 'Vencido'}
                  </Text>
                </View>
                {!alDia && (
                  <Pressable
                    onPress={() =>
                      navigation.navigate('PagoEfectivo', { token, socio: item, onPaid: cargar })
                    }
                    style={[styles.payBtn, { backgroundColor: t.primary }]}
                  >
                    <Text style={{ color: t.onPrimary, fontSize: 12, fontWeight: '600' }}>Cobrar</Text>
                  </Pressable>
                )}
              </Pressable>
            );
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 0.5, padding: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  addBtn: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 16, padding: 12, marginBottom: 10 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  payBtn: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
});
