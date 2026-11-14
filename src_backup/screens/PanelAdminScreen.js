import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { getTheme } from '../theme/colors';
import { API_URL } from '../config';
import { useAppTheme } from '../theme/ThemeContext';

export default function PanelAdminScreen({ navigation, route }) {
  const { token } = route.params;
  const t = useAppTheme();

  const [socios, setSocios] = useState([]);
  const [resumen, setResumen] = useState({ totalMes: 0, cantidadPagos: 0 });

  useEffect(() => {
    fetch(`${API_URL}/api/socios`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setSocios(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Error socios:', err));

    fetch(`${API_URL}/api/pagos/resumen`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setResumen(data))
      .catch((err) => console.error('Error resumen:', err));
  }, []);

  const activos = socios.length;
  const vencidos = socios.filter((s) => s.estadoPago === 'VENCIDO').length;

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={styles.wrap}>
      <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
        <View style={styles.headerRow}>
          <Text style={{ color: t.textPrimary, fontSize: 19, fontWeight: '700' }}>Panel admin</Text>
          <Text style={{ color: t.textSecondary, fontSize: 12 }}>TuAccesoGym</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: t.primaryBg }]}>
            <Text style={{ color: t.primary, fontSize: 12 }}>Socios activos</Text>
            <Text style={{ color: t.primary, fontSize: 22, fontWeight: '700' }}>{activos}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: t.successBg }]}>
            <Text style={{ color: t.success, fontSize: 12 }}>Ingresos del mes</Text>
            <Text style={{ color: t.success, fontSize: 22, fontWeight: '700' }}>${resumen.totalMes.toLocaleString('es-AR')}</Text>
          </View>
        </View>

        {vencidos > 0 && (
          <View style={[styles.warningBanner, { backgroundColor: t.warningBg }]}>
            <Text style={{ color: t.warning, fontWeight: '600' }}>{vencidos} cuotas vencidas</Text>
            <Text style={{ color: t.warning, fontSize: 12, marginTop: 2 }}>
              Tocá "Socios y cuotas" para ver el detalle y registrar pagos.
            </Text>
          </View>
        )}

        <Text style={{ color: t.textSecondary, fontSize: 13, marginBottom: 10 }}>Gestión</Text>

        <QuickLink t={t} label="Socios y cuotas" onPress={() => navigation.navigate('ListaSocios', { token, socios })} />
        <QuickLink t={t} label="Registrar pago en efectivo" onPress={() => navigation.navigate('PagoEfectivo', { token })} />
        <QuickLink t={t} label="Biblioteca de ejercicios" onPress={() => navigation.navigate('Biblioteca', { token, admin: true })} />
        <QuickLink t={t} label="Dar de alta un socio" onPress={() => navigation.navigate('AltaSocio', { token })} />
      <QuickLink t={t} label="Datos del gimnasio" onPress={() => navigation.navigate('DatosGimnasio', { token })} />
      <QuickLink t={t} label="Cambiar mi contraseña" onPress={() => navigation.navigate('CambiarClave', { token })} />
      </View>
    </ScrollView>
  );
}

function QuickLink({ t, label, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.quickLink, { backgroundColor: t.bg }]}>
      <Text style={{ color: t.textPrimary, fontSize: 14, flex: 1 }}>{label}</Text>
      <Text style={{ color: t.textSecondary }}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, flexGrow: 1 },
  card: { borderRadius: 20, borderWidth: 0.5, padding: 24 },
  headerRow: { marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 16, padding: 14 },
  warningBanner: { borderRadius: 16, padding: 16, marginBottom: 20 },
  quickLink: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 12, marginBottom: 8 },
});
