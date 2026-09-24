import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet, useColorScheme } from 'react-native';
import { getTheme } from '../theme/colors';
import { API_URL } from '../config';

function periodoActual() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function PagoEfectivoScreen({ navigation, route }) {
  const { token, socio: socioParam, onPaid } = route.params;
  const isDark = useColorScheme() === 'dark';
  const t = getTheme(isDark);

  const [socio, setSocio] = useState(socioParam || null);
  const [socios, setSocios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargandoSocios, setCargandoSocios] = useState(false);

  const [monto, setMonto] = useState('15000');
  const [periodo, setPeriodo] = useState(periodoActual());
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    if (socio) return;
    setCargandoSocios(true);
    fetch(`${API_URL}/api/socios`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setSocios(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setCargandoSocios(false));
  }, [socio]);

  async function registrar() {
    if (!socio) {
      setError('Elegí un socio de la lista para registrar el pago.');
      return;
    }
    setError('');
    setGuardando(true);
    try {
      const res = await fetch(`${API_URL}/api/pagos/efectivo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ usuarioId: socio.id, monto: Number(monto), periodo }),
      });
      if (!res.ok) throw new Error('No se pudo registrar el pago');
      setListo(true);
      onPaid?.();
      setTimeout(() => navigation.goBack(), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  if (!socio) {
    const filtrados = socios.filter((s) => {
      const q = busqueda.trim().toLowerCase();
      if (!q) return true;
      return s.nombre.toLowerCase().includes(q) || s.dni.includes(q);
    });

    return (
      <View style={{ flex: 1, backgroundColor: t.bg, padding: 16 }}>
        <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border, flex: 1 }]}>
          <Text style={{ color: t.textPrimary, fontSize: 19, fontWeight: '700', marginBottom: 4 }}>
            Registrar pago en efectivo
          </Text>
          <Text style={{ color: t.textSecondary, fontSize: 13, marginBottom: 16 }}>
            Elegí el socio
          </Text>

          <TextInput
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar por nombre o DNI"
            placeholderTextColor={t.textSecondary}
            style={[styles.input, { borderColor: t.border, color: t.textPrimary, marginBottom: 12 }]}
          />

          {cargandoSocios ? (
            <Text style={{ color: t.textSecondary, fontSize: 13 }}>Cargando socios...</Text>
          ) : (
            <FlatList
              data={filtrados}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => setSocio(item)}
                  style={[styles.socioRow, { borderBottomColor: t.border }]}
                >
                  <Text style={{ color: t.textPrimary, fontSize: 14, fontWeight: '600' }}>{item.nombre}</Text>
                  <Text style={{ color: t.textSecondary, fontSize: 12 }}>DNI {item.dni}</Text>
                </Pressable>
              )}
              ListEmptyComponent={
                <Text style={{ color: t.textSecondary, fontSize: 13 }}>No se encontraron socios.</Text>
              }
            />
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, padding: 16, justifyContent: 'center' }}>
      <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
        <Text style={{ color: t.textPrimary, fontSize: 19, fontWeight: '700', marginBottom: 4 }}>
          Registrar pago en efectivo
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 8 }}>
          <Text style={{ color: t.textSecondary, fontSize: 13, flex: 1 }}>
            {`${socio.nombre} · DNI ${socio.dni}`}
          </Text>
          {!socioParam && (
            <Pressable onPress={() => setSocio(null)}>
              <Text style={{ color: t.primary, fontSize: 12, fontWeight: '600' }}>Cambiar</Text>
            </Pressable>
          )}
        </View>

        <Text style={[styles.label, { color: t.textSecondary }]}>Monto</Text>
        <TextInput
          value={monto}
          onChangeText={setMonto}
          keyboardType="numeric"
          style={[styles.input, { borderColor: t.border, color: t.textPrimary }]}
        />

        <Text style={[styles.label, { color: t.textSecondary }]}>Período (AAAA-MM)</Text>
        <TextInput
          value={periodo}
          onChangeText={setPeriodo}
          style={[styles.input, { borderColor: t.border, color: t.textPrimary }]}
        />

        {error ? <Text style={{ color: t.danger, fontSize: 13, marginTop: 8 }}>{error}</Text> : null}
        {listo ? <Text style={{ color: t.success, fontSize: 13, marginTop: 8 }}>Pago registrado ✓</Text> : null}

        <Pressable
          onPress={registrar}
          disabled={guardando}
          style={[styles.btn, { backgroundColor: t.primary }]}
        >
          <Text style={{ color: t.onPrimary, fontWeight: '600' }}>
            {guardando ? 'Guardando...' : 'Confirmar pago'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 0.5, padding: 24 },
  label: { fontSize: 13, marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 0.5, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  btn: { marginTop: 20, borderRadius: 14, paddingVertical: 13, alignItems: 'center' },
  socioRow: { paddingVertical: 12, borderBottomWidth: 0.5 },
});
