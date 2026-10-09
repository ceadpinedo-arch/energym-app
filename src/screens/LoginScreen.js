import React, { useState } from 'react';
import useTeclado from '../components/useTeclado';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  useColorScheme,
  Platform,
} from 'react-native';
import { getTheme } from '../theme/colors';
import { API_URL } from '../config';


(async () => {
  try {
    const Notifications = await import('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
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
        name: 'Avisos del gimnasio',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }
    const { status: existente } = await Notifications.getPermissionsAsync();
    let status = existente;
    if (status !== 'granted') {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    if (status !== 'granted') return;
    const pushToken = (await Notifications.getExpoPushTokenAsync()).data;
    await fetch(`${apiUrl}/api/push/registrar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ token: pushToken }),
    });
  } catch (e) {}
}

export default function LoginScreen({ navigation }) {
  const teclado = useTeclado();
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === 'dark');
  const t = getTheme(isDark);

  const [modo, setModo] = useState('SOCIO'); // 'SOCIO' | 'ADMIN'
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [verPassword, setVerPassword] = useState(false);

  async function handleLogin() {
    if (!dni.trim()) {
      setError('Ingresá tu DNI para continuar.');
      return;
    }
    setError('');
    setCargando(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo iniciar sesión');

      if (data.usuario.rol !== 'ADMIN') { registrarPush(data.token, API_URL); }
      navigation.replace(data.usuario.rol === 'ADMIN' ? 'PanelAdmin' : 'HomeSocio', {
        usuario: data.usuario,
        token: data.token,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, paddingBottom: teclado > 0 ? teclado + 8 : 0 }}>
    <View style={[styles.wrap, { backgroundColor: t.bg }]}>
      <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
        <View style={styles.headerRow}>
          <View style={styles.logoRow}>
            <View style={[styles.logoBadge, { backgroundColor: t.primaryBg }]}>
              <Text style={{ color: t.primary, fontSize: 20 }}>⚡</Text>
            </View>
            <View>
              <Text style={[styles.logoText, { color: t.textPrimary }]}>TuAccesoGym</Text>
              <Text style={[styles.tagline, { color: t.textSecondary }]}>
                Sumá energía a tu rutina
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => setIsDark((v) => !v)}
            style={[styles.themeToggle, { backgroundColor: t.border }]}
          >
            <Text>{isDark ? '🌙' : '☀️'}</Text>
          </Pressable>
        </View>

        <View style={[styles.segment, { backgroundColor: t.bg }]}>
          {['SOCIO', 'ADMIN'].map((opcion) => (
            <Pressable
              key={opcion}
              onPress={() => setModo(opcion)}
              style={[
                styles.segmentBtn,
                modo === opcion && { backgroundColor: t.primary },
              ]}
            >
              <Text
                style={{
                  color: modo === opcion ? t.onPrimary : t.textSecondary,
                  fontWeight: '600',
                }}
              >
                {opcion === 'SOCIO' ? 'Socio' : 'Admin'}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { color: t.textSecondary }]}>
          {modo === 'SOCIO' ? 'DNI' : 'Usuario'}
        </Text>
        <TextInput
          value={dni}
          onChangeText={setDni}
          placeholder={modo === 'SOCIO' ? '30123456' : 'usuario admin'}
          placeholderTextColor={t.textSecondary}
          style={[styles.input, { borderColor: t.border, color: t.textPrimary }]}
          keyboardType={modo === 'SOCIO' ? 'number-pad' : 'default'}
        />

        <Text style={[styles.label, { color: t.textSecondary }]}>Contraseña</Text>
        <View style={{ position: 'relative', justifyContent: 'center' }}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="........"
            placeholderTextColor={t.textSecondary}
            secureTextEntry={!verPassword}
            style={[styles.input, { borderColor: t.border, color: t.textPrimary, paddingRight: 44 }]}
          />
          <Pressable
            onPress={() => setVerPassword((v) => !v)}
            style={{ position: 'absolute', right: 12, padding: 4 }}
          >
            <Text style={{ fontSize: 18 }}>{verPassword ? '🙈' : '👁'}</Text>
          </Pressable>
        </View>

        {error ? <Text style={{ color: t.danger, fontSize: 13 }}>{error}</Text> : null}

        <Pressable
          onPress={handleLogin}
          disabled={cargando}
          style={[styles.submitBtn, { backgroundColor: t.primary }]}
        >
          <Text style={{ color: t.onPrimary, fontWeight: '600' }}>
            {cargando ? 'Ingresando…' : `Ingresar como ${modo === 'SOCIO' ? 'socio' : 'admin'}`}
          </Text>
        </Pressable>
      </View>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', padding: 16 },
  card: { borderRadius: 20, borderWidth: 0.5, padding: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoBadge: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 22, fontWeight: '700' },
  tagline: { fontSize: 12 },
  themeToggle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  segment: { flexDirection: 'row', borderRadius: 999, padding: 4, marginBottom: 20 },
  segmentBtn: { flex: 1, paddingVertical: 9, borderRadius: 999, alignItems: 'center' },
  label: { fontSize: 13, marginBottom: 6, marginTop: 10 },
  input: { borderWidth: 0.5, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  submitBtn: { marginTop: 16, borderRadius: 14, paddingVertical: 13, alignItems: 'center' },
});
