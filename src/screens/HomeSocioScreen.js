import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { API_URL } from '../config';
import { useAppTheme } from '../theme/ThemeContext';

const SPOTIFY_URL = 'https://open.spotify.com/playlist/6ypUvnU30JFjyfzTzG5VBM';
const META_VISITAS = 12;
const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

function Anillo({ t, valor, meta }) {
  const size = 96;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(valor / meta, 1);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={t.primaryBg} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={t.primary}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={c * (1 - pct)}
        />
      </Svg>
      <Text style={{ color: t.textPrimary, fontSize: 22, fontWeight: '800' }}>{Math.round(pct * 100)}%</Text>
    </View>
  );
}

function diasMarcados(stats) {
  const hoy = (new Date().getDay() + 6) % 7;
  const ultimo = stats.entroHoy ? hoy : hoy - 1;
  const marcados = [];
  for (let i = 0; i < stats.racha; i++) {
    const d = ultimo - i;
    if (d >= 0) marcados.push(d);
  }
  return { hoy, marcados };
}

function Atajo({ t, emoji, label, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.atajo,
        { backgroundColor: t.surface, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <Text style={{ fontSize: 26 }}>{emoji}</Text>
      <Text style={{ color: t.textPrimary, fontSize: 13, fontWeight: '600', marginTop: 6, textAlign: 'center' }}>{label}</Text>
    </Pressable>
  );
}

function FilaCopiar({ t, label, valor }) {
  return (
    <Pressable
      onPress={async () => { await Clipboard.setStringAsync(valor); alert('Copiado: ' + valor); }}
      style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: t.bg, borderRadius: 14, padding: 12, marginBottom: 8 }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ color: t.textSecondary, fontSize: 12 }}>{label}</Text>
        <Text style={{ color: t.textPrimary, fontSize: 15, fontWeight: '700' }}>{valor}</Text>
      </View>
      <Text style={{ color: t.primary, fontWeight: '700' }}>Copiar</Text>
    </Pressable>
  );
}

export default function HomeSocioScreen({ navigation, route }) {
  const { usuario, token } = route.params;
  const t = useAppTheme();
  const insets = useSafeAreaInsets();

  const [estado, setEstado] = useState(usuario);
  const [stats, setStats] = useState({ visitasMes: 0, racha: 0, entroHoy: false });
  const [pagando, setPagando] = useState(false);
  const [mpListo, setMpListo] = useState(false);
  const [contacto, setContacto] = useState({ whatsapp: '', instagram: '', alias: '', cbu: '' });

  useEffect(() => {
    fetch(`${API_URL}/api/asistencia/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((d) => { if (d && typeof d.visitasMes === 'number') setStats(d); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/gimnasio/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((g) => setContacto({ whatsapp: g.whatsapp || '', instagram: g.instagram || '', alias: g.alias || '', cbu: g.cbu || '' }))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(API_URL + '/api/mp/disponible', { headers: { Authorization: 'Bearer ' + token } })
      .then((res) => res.json())
      .then((d) => setMpListo(!!(d && d.conectado)))
      .catch(() => {});
  }, []);

  const pagarCuota = async () => {
    setPagando(true);
    try {
      const res = await fetch(`${API_URL}/api/pagos/crear-preferencia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ usuarioId: estado.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.initPoint) throw new Error('No se pudo generar el link de pago');
      Linking.openURL(data.initPoint);
    } catch (e) {
      alert('No se pudo iniciar el pago. Probá de nuevo en un momento.');
    } finally {
      setPagando(false);
    }
  };

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
  const { hoy, marcados } = diasMarcados(stats);

  return (
    <LinearGradient colors={t.gradient} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={[styles.wrap, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32 }]}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.hello, { color: t.textPrimary }]}>Hola, {estado.nombre.split(' ')[0]} 👋</Text>
            <Text style={{ color: t.textSecondary, fontSize: 13 }}>Listo para entrenar</Text>
          </View>
          <View style={[styles.avatar, { backgroundColor: t.surface }]}>
            <Text style={{ color: t.primary, fontWeight: '800' }}>{iniciales}</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: t.surface }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Anillo t={t} valor={stats.visitasMes} meta={META_VISITAS} />
            <View style={{ flex: 1, marginLeft: 18 }}>
              <Text style={{ color: t.textPrimary, fontSize: 16, fontWeight: '700' }}>Tu mes</Text>
              <Text style={{ color: t.textSecondary, fontSize: 13, marginTop: 4 }}>
                {stats.visitasMes} de {META_VISITAS} visitas
              </Text>
              <Text style={{ color: t.primary, fontSize: 13, fontWeight: '600', marginTop: 4 }}>
                Racha: {stats.racha} {stats.racha === 1 ? 'día' : 'días'}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: t.surface }]}>
          <Text style={{ color: t.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 12 }}>Esta semana</Text>
          <View style={styles.semana}>
            {DIAS.map((d, i) => {
              const activo = marcados.includes(i);
              return (
                <View key={d + i} style={{ alignItems: 'center', flex: 1 }}>
                  <View
                    style={{
                      width: 10,
                      height: activo ? 48 : 16,
                      borderRadius: 6,
                      backgroundColor: activo ? t.primary : t.border,
                    }}
                  />
                  <Text
                    style={{
                      marginTop: 6,
                      fontSize: 12,
                      fontWeight: i === hoy ? '800' : '400',
                      color: i === hoy ? t.primary : t.textSecondary,
                    }}
                  >
                    {d}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={[styles.banner, { backgroundColor: alDia ? t.successBg : t.dangerBg }]}>
          <Text style={{ color: alDia ? t.success : t.danger, fontWeight: '700' }}>
            {alDia ? 'Cuota al día' : 'Cuota vencida'}
          </Text>
          <Text style={{ color: alDia ? t.success : t.danger, fontSize: 12, marginTop: 2 }}>
            {alDia ? `Próximo vencimiento: ${vencimiento}` : 'Regularizá tu pago para seguir accediendo.'}
          </Text>
        </View>

        <Pressable
          onPress={registrarHoy}
          disabled={stats.entroHoy}
          style={[styles.boton, { backgroundColor: stats.entroHoy ? t.successBg : t.primary }]}
        >
          <Text style={{ color: stats.entroHoy ? t.success : t.onPrimary, fontWeight: '800' }}>
            {stats.entroHoy ? '✓ Asistencia registrada hoy' : 'Entré hoy'}
          </Text>
        </Pressable>

        {mpListo ? (
        <Pressable
          onPress={pagarCuota}
          disabled={pagando}
          style={[styles.boton, { backgroundColor: t.coral }]}
        >
          <Text style={{ color: '#2B1710', fontWeight: '800' }}>
            {pagando ? 'Generando link…' : 'Pagar cuota'}
          </Text>
        </Pressable>
        ) : null}

        {(contacto.alias || contacto.cbu) ? (
          <View style={[styles.card, { backgroundColor: t.surface }]}>
            <Text style={{ color: t.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 10 }}>Pagar por transferencia</Text>
            {contacto.alias ? <FilaCopiar t={t} label="Alias" valor={contacto.alias} /> : null}
            {contacto.cbu ? <FilaCopiar t={t} label="CBU" valor={contacto.cbu} /> : null}
            <Text style={{ color: t.textSecondary, fontSize: 12, marginTop: 4 }}>Después de transferir, avisale al gimnasio para que registre tu pago.</Text>
          </View>
        ) : null}

        <Text style={{ color: t.textSecondary, fontSize: 13, fontWeight: '600', marginVertical: 8 }}>Accesos rápidos</Text>
        <View style={styles.grid}>
          <Atajo t={t} emoji="🏋️" label="Mi rutina de hoy" onPress={() => navigation.navigate('Biblioteca', { token })} />
          <Atajo t={t} emoji="📷" label="Escanear QR" onPress={() => navigation.navigate('QRAcceso', { token })} />
          <Atajo t={t} emoji="🤖" label="Asistente IA" onPress={() => navigation.navigate('AsistenteIA', { token })} />
          <Atajo t={t} emoji="🧾" label="Historial de pagos" onPress={() => navigation.navigate('HistorialPagos', { token })} />
          <Atajo t={t} emoji="🎵" label="Spotify" onPress={() => Linking.openURL(SPOTIFY_URL)} />
          {contacto.whatsapp ? <Atajo t={t} emoji="💬" label="WhatsApp" onPress={() => Linking.openURL(`https://wa.me/${contacto.whatsapp}?text=Hola!`)} /> : null}
          {contacto.instagram ? <Atajo t={t} emoji="📸" label="Instagram" onPress={() => Linking.openURL(`https://instagram.com/${contacto.instagram}`)} /> : null}
          <Atajo t={t} emoji="🎨" label="Apariencia" onPress={() => navigation.navigate('Apariencia', { token })} />
          <Atajo t={t} emoji="🔑" label="Cambiar contraseña" onPress={() => navigation.navigate('CambiarClave', { token })} />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  hello: { fontSize: 22, fontWeight: '800' },
  avatar: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  card: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  semana: { flexDirection: 'row', alignItems: 'flex-end', height: 72 },
  banner: { borderRadius: 18, padding: 16, marginBottom: 14 },
  boton: { borderRadius: 18, padding: 15, alignItems: 'center', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  atajo: {
    width: '31%',
    flexGrow: 1,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
});
