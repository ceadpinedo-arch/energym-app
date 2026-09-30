import React, { useState } from 'react';
import useTeclado from '../components/useTeclado';
import { View, Text, TextInput, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { getTheme } from '../theme/colors';
import { API_URL } from '../config';
import { useAppTheme } from '../theme/ThemeContext';

export default function AltaSocioScreen({ navigation, route }) {
  const [verPassword, setVerPassword] = useState(false);
  const teclado = useTeclado();
  const { token, onCreated } = route.params;
  const t = useAppTheme();

  const [dni, setDni] = useState('');
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [listo, setListo] = useState(false);

  async function crear() {
    if (!dni.trim() || !nombre.trim() || password.length < 4) {
      setError('Completá DNI, nombre y una contraseña de al menos 4 caracteres.');
      return;
    }
    setError('');
    setGuardando(true);
    try {
      const res = await fetch(`${API_URL}/api/socios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ dni, nombre, password, email: email || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo crear el socio');
      setListo(true);
      onCreated?.();
      setTimeout(() => navigation.goBack(), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, paddingBottom: teclado > 0 ? teclado + 8 : 0 }}>
    <View style={{ flex: 1, backgroundColor: t.bg, padding: 16, justifyContent: 'center' }}>
      <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
        <Text style={{ color: t.textPrimary, fontSize: 19, fontWeight: '700', marginBottom: 20 }}>
          Dar de alta un socio
        </Text>

        <Text style={[styles.label, { color: t.textSecondary }]}>DNI</Text>
        <TextInput
          value={dni}
          onChangeText={setDni}
          keyboardType="number-pad"
          placeholder="30123456"
          placeholderTextColor={t.textSecondary}
          style={[styles.input, { borderColor: t.border, color: t.textPrimary }]}
        />

        <Text style={[styles.label, { color: t.textSecondary }]}>Nombre completo</Text>
        <TextInput
          value={nombre}
          onChangeText={setNombre}
          placeholder="Marcos Gómez"
          placeholderTextColor={t.textSecondary}
          style={[styles.input, { borderColor: t.border, color: t.textPrimary }]}
        />

        <Text style={[styles.label, { color: t.textSecondary }]}>Email (opcional)</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="marcos@ejemplo.com"
          placeholderTextColor={t.textSecondary}
          style={[styles.input, { borderColor: t.border, color: t.textPrimary }]}
        />

        <Text style={[styles.label, { color: t.textSecondary }]}>Contraseña inicial</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!verPassword}
          placeholder="••••••••"
          placeholderTextColor={t.textSecondary}
          style={[styles.input, { borderColor: t.border, color: t.textPrimary }]}
        />
      <Pressable onPress={() => setVerPassword((v) => !v)} hitSlop={8} style={{ alignSelf: 'flex-end', marginTop: 6 }}>
        <Text style={{ color: t.primary, fontSize: 13, fontWeight: '600' }}>
          {verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        </Text>
      </Pressable>

        {error ? <Text style={{ color: t.danger, fontSize: 13, marginTop: 8 }}>{error}</Text> : null}
        {listo ? <Text style={{ color: t.success, fontSize: 13, marginTop: 8 }}>Socio creado ✓</Text> : null}

        <Pressable
          onPress={crear}
          disabled={guardando}
          style={[styles.btn, { backgroundColor: t.primary }]}
        >
          <Text style={{ color: t.onPrimary, fontWeight: '600' }}>
            {guardando ? 'Creando…' : 'Dar de alta'}
          </Text>
        </Pressable>
      </View>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 0.5, padding: 24 },
  label: { fontSize: 13, marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 0.5, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  btn: { marginTop: 20, borderRadius: 14, paddingVertical: 13, alignItems: 'center' },
});
