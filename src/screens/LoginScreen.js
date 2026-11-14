import React, { useState } from 'react';
import useTeclado from '../components/useTeclado';
import { View, Text, TextInput, Pressable, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getTheme } from '../theme/colors';
import { API_URL } from '../config';

(async () => {
  try {
    const Notifications = await import('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
    });
  } catch (e) {}
})();

async function registrarPush(token, apiUrl) {
  try {
    const Device = await import('expo-device');
    const Notifications = await import('expo-notifications');
    if (!Device.isDevice) return;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Avisos del gimnasio', importance: Notifications.AndroidImportance.MAX, vibrationPattern: [0, 250, 250, 250],
      });
    }
    const { status: existente } = await Notifications.getPermissionsAsync();
    let status = existente;
    if (status !== 'granted') {
      const req = (Platform.OS === 'web' ? { status: 'denied', granted: false } : await Notifications.requestPermissionsAsync());
      status = req.status;
    }
    if (status !== 'granted') return;
    const pushToken = (await Notifications.getExpoPushTokenAsync()).data;
    await fetch(apiUrl + '/api/push/registrar', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ token: pushToken }),
    });
  } catch (e) {}
}

export default function LoginScreen({ navigation }) {
  const teclado = useTeclado();
  const [isDark, setIsDark] = useState(true);
  const t = getTheme(isDark, 'violeta', isDark ? 'oscuro' : 'menta');
  const [modo, setModo] = useState('SOCIO');
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [verPassword, setVerPassword] = useState(false);

  async function handleLogin() {
    if (!dni.trim()) { setError('Ingresá tu DNI para continuar.'); return; }
    setError(''); setCargando(true);
    try {
      const res = await fetch(API_URL + '/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dni, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo iniciar sesión');
      if (data.usuario.rol !== 'ADMIN') { registrarPush(data.token, API_URL); }
      navigation.replace(data.usuario.rol === 'ADMIN' ? 'PanelAdmin' : 'HomeSocio', { usuario: data.usuario, token: data.token });
    } catch (err) { setError(err.message); } finally { setCargando(false); }
  }

  return (
    <LinearGradient colors={t.gradient} style={{ flex: 1, paddingBottom: teclado > 0 ? teclado + 8 : 0 }}>
      <View style={styles.wrap}>
        <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.cardBorder || t.border }]}>
          <View style={styles.headerRow}>
            <View style={styles.logoRow}>
              <LinearGradient colors={['#22D3EE', '#8B5CF6']} style={styles.logoBadge}>
                <Text style={{ fontSize: 22 }}>⚡</Text>
              </LinearGradient>
              <View>
                <Text style={[styles.logoText, { color: t.textPrimary }]}>TuAccesoGym</Text>
                <Text style={[styles.tagline, { color: t.textSecondary }]}>Sumá energía a tu rutina</Text>
              </View>
            </View>
            <Pressable onPress={() => setIsDark((v) => !v)} style={[styles.themeToggle, { backgroundColor: t.innerBg || t.bg, borderColor: t.border }]}>
              <Text>{isDark ? '🌙' : '☀️'}</Text>
            </Pressable>
          </View>
          <View style={[styles.segment, { backgroundColor: t.innerBg || t.bg, borderColor: t.border }]}>
            {['SOCIO', 'ADMIN'].map((op) => (
              <Pressable key={op} onPress={() => setModo(op)} style={[styles.segmentBtn, modo === op && { backgroundColor: t.primary }]}>
                <Text style={{ color: modo === op ? '#FFFFFF' : t.textSecondary, fontWeight: '800' }}>{op === 'SOCIO' ? 'Socio' : 'Admin'}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={[styles.label, { color: t.textSecondary }]}>{modo === 'SOCIO' ? 'DNI' : 'Usuario'}</Text>
          <TextInput value={dni} onChangeText={setDni} placeholder={modo === 'SOCIO' ? '30123456' : 'usuario admin'} placeholderTextColor={t.textSecondary} style={[styles.input, { backgroundColor: t.innerBg || t.bg, borderColor: t.border, color: t.textPrimary }]} keyboardType={modo === 'SOCIO' ? 'number-pad' : 'default'} />
          <Text style={[styles.label, { color: t.textSecondary }]}>Contraseña</Text>
          <View style={{ position: 'relative', justifyContent: 'center' }}>
            <TextInput value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor={t.textSecondary} secureTextEntry={!verPassword} style={[styles.input, { backgroundColor: t.innerBg || t.bg, borderColor: t.border, color: t.textPrimary, paddingRight: 44 }]} />
            <Pressable onPress={() => setVerPassword((v) => !v)} style={{ position: 'absolute', right: 12, padding: 4 }}>
              <Text style={{ fontSize: 18 }}>{verPassword ? '🙈' : '👁'}</Text>
            </Pressable>
          </View>
          {error ? <Text style={{ color: t.danger, fontSize: 13, marginTop: 8 }}>{error}</Text> : null}
          <Pressable onPress={handleLogin} disabled={cargando} style={styles.submitWrap}>
            <LinearGradient colors={t.buttonGradient || ['#7C3AED', '#4F46E5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitBtn}>
              <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 15 }}>{cargando ? 'Ingresando…' : 'Ingresar como ' + (modo === 'SOCIO' ? 'socio' : 'admin')}</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', padding: 18 },
  card: { borderRadius: 28, borderWidth: 1.5, padding: 24, elevation: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoBadge: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 22, fontWeight: '900' },
  tagline: { fontSize: 12, marginTop: 2 },
  themeToggle: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  segment: { flexDirection: 'row', borderRadius: 999, padding: 4, marginBottom: 20, borderWidth: 1 },
  segmentBtn: { flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: 'center' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  submitWrap: { marginTop: 22, borderRadius: 20, borderWidth: 1.5, borderColor: '#C084FC', overflow: 'hidden', elevation: 8 },
  submitBtn: { paddingVertical: 15, alignItems: 'center' },
});
