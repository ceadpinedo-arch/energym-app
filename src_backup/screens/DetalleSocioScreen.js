import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, useColorScheme } from 'react-native';
import { getTheme } from '../theme/colors';
import { API_URL } from '../config';
import { useAppTheme } from '../theme/ThemeContext';

export default function DetalleSocioScreen({ route }) {
  const { token, socioId } = route.params;
  const t = useAppTheme();

  const [socio, setSocio] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/socios/${socioId}/detalle`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setSocio(data))
      .catch((err) => console.error('Error detalle socio:', err))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) {
    return (
      <View style={[styles.center, { backgroundColor: t.bg }]}>
        <ActivityIndicator color={t.primary} />
      </View>
    );
  }

  if (!socio) {
    return (
      <View style={[styles.center, { backgroundColor: t.bg }]}>
        <Text style={{ color: t.textPrimary }}>No se pudo cargar el socio.</Text>
      </View>
    );
  }

  const alDia = socio.estadoPago === 'AL_DIA';

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={styles.wrap}>
      <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
        <Text style={{ color: t.textPrimary, fontSize: 20, fontWeight: '700' }}>{socio.nombre}</Text>
        <Text style={{ color: t.textSecondary, fontSize: 13, marginTop: 2 }}>DNI {socio.dni}</Text>
        {socio.email ? (
          <Text style={{ color: t.textSecondary, fontSize: 13 }}>{socio.email}</Text>
        ) : null}

        <View style={[styles.badge, { backgroundColor: alDia ? t.successBg : t.dangerBg, marginTop: 12 }]}>
          <Text style={{ color: alDia ? t.success : t.danger, fontSize: 12, fontWeight: '600' }}>
            {alDia ? 'Al día' : 'Vencido'}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: t.primaryBg }]}>
            <Text style={{ color: t.primary, fontSize: 12 }}>Asistencias totales</Text>
            <Text style={{ color: t.primary, fontSize: 20, fontWeight: '700' }}>{socio.totalAsistencias}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
        <Text style={{ color: t.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 10 }}>
          Historial de pagos
        </Text>
        {socio.pagos.length === 0 ? (
          <Text style={{ color: t.textSecondary, fontSize: 13 }}>Sin pagos registrados.</Text>
        ) : (
          socio.pagos.map((p) => (
            <View key={p.id} style={styles.pagoRow}>
              <Text style={{ color: t.textPrimary, fontSize: 13 }}>{p.periodo}</Text>
              <Text style={{ color: t.textSecondary, fontSize: 12 }}>{p.metodo}</Text>
              <Text style={{ color: t.textPrimary, fontSize: 13, fontWeight: '600' }}>
                ${p.monto.toLocaleString('es-AR')}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
        <Text style={{ color: t.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 10 }}>
          Rutina
        </Text>
        {!socio.rutina || socio.rutina.ejercicios.length === 0 ? (
          <Text style={{ color: t.textSecondary, fontSize: 13 }}>Sin rutina asignada.</Text>
        ) : (
          socio.rutina.ejercicios.map((re) => (
            <View key={re.id} style={styles.ejercicioRow}>
              <Text style={{ color: t.textPrimary, fontSize: 13, flex: 1 }}>{re.ejercicio.nombre}</Text>
              <Text style={{ color: t.textSecondary, fontSize: 12 }}>
                {re.series}x{re.repeticiones}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, gap: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { borderRadius: 20, borderWidth: 0.5, padding: 20 },
  badge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  statCard: { flex: 1, borderRadius: 16, padding: 14 },
  pagoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#00000010',
  },
  ejercicioRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#00000010',
  },
});
