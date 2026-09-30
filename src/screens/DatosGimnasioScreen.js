import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, Image, ActivityIndicator, StyleSheet, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAppTheme } from '../theme/ThemeContext';
import { API_URL } from '../config';

export default function DatosGimnasioScreen({ route }) {
  const { token } = route.params;
  const t = useAppTheme();

  const [nombre, setNombre] = useState('');
  const [logoUrl, setLogoUrl] = useState(null);
  const [logoBase64, setLogoBase64] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [cuota, setCuota] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [alias, setAlias] = useState('');
  const [cbu, setCbu] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/gimnasio/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        setNombre(data.nombre || '');
        setCuota(data.cuota ? String(data.cuota) : '');
    setWhatsapp(data.whatsapp || '');
    setInstagram(data.instagram || '');
    setAlias(data.alias || '');
    setCbu(data.cbu || '');
        setLogoUrl(data.logoUrl || null);
      })
      .catch((err) => console.error('Error gimnasio:', err))
      .finally(() => setCargando(false));
  }, []);

  const elegirLogo = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso necesario', 'Necesitamos acceso a tus fotos para elegir el logo.');
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      base64: true,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!resultado.canceled && resultado.assets?.[0]) {
      const asset = resultado.assets[0];
      const dataUri = `data:image/jpeg;base64,${asset.base64}`;
      setLogoUrl(dataUri);
      setLogoBase64(dataUri);
    }
  };

  const guardar = async () => {
    if (!nombre.trim()) {
      Alert.alert('Falta el nombre', 'El nombre del gimnasio no puede estar vacío.');
      return;
    }
    setGuardando(true);
    try {
      const body = { nombre: nombre.trim() };
      const cuotaNum = Number(String(cuota).replace(/\D/g, ''));
      if (!cuotaNum) { Alert.alert('Cuota inválida', 'Ingresá un monto mayor a 0.'); return; }
      body.cuota = cuotaNum;
  body.whatsapp = whatsapp;
  body.instagram = instagram;
  const cbuLimpio = String(cbu).replace(/\D/g, '');
  if (cbuLimpio && cbuLimpio.length !== 22) { Alert.alert('CBU inválido', 'El CBU debe tener 22 dígitos.'); return; }
  body.alias = alias;
  body.cbu = cbu;
      if (logoBase64) body.logoBase64 = logoBase64;

      const res = await fetch(`${API_URL}/api/gimnasio/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Error al guardar');
  const guardado = await res.json();
  setWhatsapp(guardado.whatsapp || '');
  setInstagram(guardado.instagram || '');
  setAlias(guardado.alias || '');
  setCbu(guardado.cbu || '');
      Alert.alert('Listo', 'Los datos del gimnasio se guardaron correctamente.');
      setLogoBase64(null);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudo guardar. Probá de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <View style={[styles.container, styles.centrado, { backgroundColor: t.bg }]}>
        <ActivityIndicator color={t.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ padding: 20, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
      <Text style={[styles.titulo, { color: t.textPrimary }]}>Datos del gimnasio</Text>

      <Pressable onPress={elegirLogo} style={styles.logoWrap}>
        {logoUrl ? (
          <Image source={{ uri: logoUrl }} style={[styles.logo, { borderColor: t.border }]} />
        ) : (
          <View style={[styles.logo, styles.logoVacio, { borderColor: t.border, backgroundColor: t.surface }]}>
            <Text style={{ color: t.textSecondary }}>Sin logo</Text>
          </View>
        )}
        <Text style={{ color: t.primary, marginTop: 8, fontWeight: '600' }}>Cambiar logo</Text>
      </Pressable>

      <Text style={[styles.label, { color: t.textSecondary }]}>Nombre del gimnasio</Text>
      <TextInput
        value={nombre}
        onChangeText={setNombre}
        placeholder="Nombre del gimnasio"
        placeholderTextColor={t.textSecondary}
        style={[styles.input, { color: t.textPrimary, borderColor: t.border, backgroundColor: t.surface }]}
      />

      <Text style={[styles.label, { color: t.textSecondary }]}>WhatsApp (con código de país)</Text>
  <TextInput
    value={whatsapp}
    onChangeText={setWhatsapp}
    keyboardType="phone-pad"
    placeholder="5493511234567"
    placeholderTextColor={t.textSecondary}
    style={[styles.input, { color: t.textPrimary, borderColor: t.border, backgroundColor: t.surface }]}
  />

  <Text style={[styles.label, { color: t.textSecondary }]}>Instagram (usuario o link)</Text>
  <TextInput
    value={instagram}
    onChangeText={setInstagram}
    autoCapitalize="none"
    autoCorrect={false}
    placeholder="energym.com.ar"
    placeholderTextColor={t.textSecondary}
    style={[styles.input, { color: t.textPrimary, borderColor: t.border, backgroundColor: t.surface }]}
  />

  <Text style={[styles.label, { color: t.textSecondary }]}>Alias para transferencias</Text>
  <TextInput
    value={alias}
    onChangeText={setAlias}
    autoCapitalize="none"
    autoCorrect={false}
    placeholder="mi.gimnasio.mp"
    placeholderTextColor={t.textSecondary}
    style={[styles.input, { color: t.textPrimary, borderColor: t.border, backgroundColor: t.surface }]}
  />

  <Text style={[styles.label, { color: t.textSecondary }]}>CBU (22 dígitos)</Text>
  <TextInput
    value={cbu}
    onChangeText={setCbu}
    keyboardType="numeric"
    placeholder="0000000000000000000000"
    placeholderTextColor={t.textSecondary}
    style={[styles.input, { color: t.textPrimary, borderColor: t.border, backgroundColor: t.surface }]}
  />

  <Text style={[styles.label, { color: t.textSecondary }]}>Cuota mensual ($)</Text>
        <TextInput
          value={cuota}
          onChangeText={setCuota}
          keyboardType="numeric"
          placeholder="15000"
          placeholderTextColor={t.textSecondary}
          style={[styles.input, { color: t.textPrimary, borderColor: t.border, backgroundColor: t.surface }]}
        />

        <Pressable
        onPress={guardar}
        disabled={guardando}
        style={[styles.boton, { backgroundColor: t.primary, opacity: guardando ? 0.6 : 1 }]}
      >
        {guardando ? (
          <ActivityIndicator color={t.onPrimary} />
        ) : (
          <Text style={{ color: t.onPrimary, fontWeight: '700' }}>Guardar cambios</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  centrado: { justifyContent: 'center', alignItems: 'center' },
  titulo: { fontSize: 22, fontWeight: '800', marginBottom: 24 },
  logoWrap: { alignItems: 'center', marginBottom: 24 },
  logo: { width: 100, height: 100, borderRadius: 50, borderWidth: 1 },
  logoVacio: { justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase' },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 24 },
  boton: { borderRadius: 14, padding: 16, alignItems: 'center' },
});
