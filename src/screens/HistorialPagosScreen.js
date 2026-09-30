import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, useColorScheme } from 'react-native';
import { getTheme } from '../theme/colors';
import { API_URL } from '../config';
import { useAppTheme } from '../theme/ThemeContext';

export default function HistorialPagosScreen({ route }) {
  const { token } = route.params;
  const t = useAppTheme();

  const [pagos, setPagos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/pagos/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setPagos(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, padding: 16 }}>
      <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border, flex: 1 }]}>
        <Text style={{ color: t.textPrimary, fontSize: 19, fontWeight: '700', marginBottom: 16 }}>
          Historial de pagos
        </Text>

        {!cargando && pagos.length === 0 && (
          <Text style={{ color: t.textSecondary, fontSize: 14 }}>Todavía no hay pagos registrados.</Text>
        )}

        <FlatList
          data={pagos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.row, { backgroundColor: t.bg }]}>
              <View style={[styles.icon, { backgroundColor: item.metodo === 'EFECTIVO' ? t.warningBg : t.primaryBg }]}>
                <Text style={{ color: item.metodo === 'EFECTIVO' ? t.warning : t.primary }}>
                  {item.metodo === 'EFECTIVO' ? '$' : '↻'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.textPrimary, fontSize: 14, fontWeight: '600' }}>
                  Cuota {item.periodo}
                </Text>
                <Text style={{ color: t.textSecondary, fontSize: 12, marginTop: 2 }}>
                  {item.metodo === 'EFECTIVO' ? 'Pago en efectivo' : 'Mercado Pago'} ·{' '}
                  {new Date(item.pagadoEn).toLocaleDateString('es-AR')}
                </Text>
              </View>
              <Text style={{ color: t.textPrimary, fontSize: 14, fontWeight: '600' }}>
                ${Number(item.monto).toLocaleString('es-AR')}
              </Text>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 0.5, padding: 24 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, padding: 12, marginBottom: 10 },
  icon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
