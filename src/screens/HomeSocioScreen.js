import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, useColorScheme, Linking } from 'react-native';
import { getTheme } from '../theme/colors';
import { API_URL } from '../config';

export default function HomeSocioScreen({ navigation, route }) {
  const { usuario, token } = route.params;
  const isDark = useColorScheme() === 'dark';
  const t = getTheme(isDark);

  const [estado, setEstado] = useState(usuario);

  const [stats, setStats] = useState({ visitasMes: 0, racha: 0, entroHoy: false });

  useEffect(() => {
    fetch(`${API_URL}/api/asistencia/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((d) => { if (d && typeof d.visitasMes === 'number') setStats(d); })
      .catch(() => {});
  }, []);

  const registrarHoy = async () => {
    try {
      const res = await fetch(`${API_URL}/api/asistencia/hoy`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      if (d && typeof d.visitasMes === 'number') setStats(d);
    } catch (e) {}
  };

  useEffect(() => {
    fetch(`${API_URL}/api/socios/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setEstado)
      .catch(() => {});
  }, []);

  const alDia = estado.estadoPago === 'AL_DIA';
  const vencimiento = estado.vencimiento
    ? new Date(estado.vencimiento).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })
    : '—';

  const iniciales = estado.nombre
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={styles.wrap}>
      <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
        <View style={[styles.headerRow, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
          <View style={styles.userRow}>
            <View style={[styles.avatar, { backgroundColor: t.primaryBg }]}>
              <Text style={{ color: t.primary, fontWeight: '700' }}>{iniciales}</Text>
            </View>
            <View>
              <Text style={[styles.hello, { color: t.textPrimary }]}>Hola, {estado.nombre.split(' ')[0]}</Text>
              <Text style={{ color: t.textSecondary, fontSize: 12 }}>DNI {estado.dni}</Text>
            </View>
          </View>
        <Pressable style={styles.spotifyBtn} onPress={() => Linking.openURL(SPOTIFY_URL)}>
          <Text style={styles.spotifyText}>♪ Spotify</Text>
        </Pressable>
      </View>

        <View
          style={[
            styles.banner,
            { backgroundColor: alDia ? t.successBg : t.dangerBg },
          ]}
        >
          <Text style={{ color: alDia ? t.success : t.danger, fontWeight: '600' }}>
            {alDia ? 'Cuota al día' : 'Cuota vencida'}
          </Text>
          <Text style={{ color: alDia ? t.success : t.danger, fontSize: 12, marginTop: 2 }}>
            {alDia ? `Próximo vencimiento: ${vencimiento}` : 'Regularizá tu pago para seguir accediendo.'}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: t.warningBg }]}>
            <Text style={{ color: t.warning, fontSize: 12 }}>Visitas este mes</Text>
            <Text style={{ color: t.warning, fontSize: 22, fontWeight: '700' }}>{stats.visitasMes}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: t.primaryBg }]}>
            <Text style={{ color: t.primary, fontSize: 12 }}>Racha actual</Text>
            <Text style={{ color: t.primary, fontSize: 22, fontWeight: '700' }}>{stats.racha} {stats.racha === 1 ? 'día' : 'días'}</Text>
          </View>
        </View>

        <Pressable
          onPress={registrarHoy}
          disabled={stats.entroHoy}
          style={{ backgroundColor: stats.entroHoy ? t.successBg : t.primary, borderRadius: 14, padding: 14, alignItems: 'center', marginBottom: 20 }}
        >
          <Text style={{ color: stats.entroHoy ? t.success : '#FFFFFF', fontWeight: '700' }}>
            {stats.entroHoy ? '✓ Asistencia registrada hoy' : 'Entré hoy'}
          </Text>
        </Pressable>

        <Text style={{ color: t.textSecondary, fontSize: 13, marginBottom: 10 }}>Accesos rápidos</Text>

        <QuickLink
          t={t}
          label="Mi rutina de hoy"
          onPress={() => navigation.navigate('Biblioteca', { token })}
        />
        <QuickLink
          t={t}
          label="Preguntarle al asistente"
          onPress={() => navigation.navigate('AsistenteIA', { token })}
        />
        <QuickLink
          t={t}
          label="Historial de pagos"
          onPress={() => navigation.navigate('HistorialPagos', { token })}
        />
      </View>
    </ScrollView>
  );
}

function QuickLink({ t, label, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.quickLink, { backgroundColor: t.bg }]}
    >
      <Text style={{ color: t.textPrimary, fontSize: 14, flex: 1 }}>{label}</Text>
      <Text style={{ color: t.textSecondary }}>›</Text>
    </Pressable>
  );
}

const SPOTIFY_URL = 'https://open.spotify.com/playlist/6ypUvnU30JFjyfzTzG5VBM';

const styles = StyleSheet.create({
  spotifyBtn: { backgroundColor: '#1DB954', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },
  spotifyText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  wrap: { padding: 16, flexGrow: 1 },
  card: { borderRadius: 20, borderWidth: 0.5, padding: 24 },
  headerRow: { marginBottom: 24 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  hello: { fontSize: 15, fontWeight: '600' },
  banner: { borderRadius: 16, padding: 16, marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: { flex: 1, borderRadius: 16, padding: 14 },
  quickLink: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 12, marginBottom: 8 },
});
