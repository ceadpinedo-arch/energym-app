import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { API_URL } from '../config';
import { useAppearance } from '../theme/ThemeContext';

export default function CambiarClaveScreen({ navigation, route }) {
  const { token } = route.params;
  const { t, isDark } = useAppearance();
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [repetir, setRepetir] = useState('');
  const [guardando, setGuardando] = useState(false);

  const texto = isDark ? '#FFFFFF' : '#111111';
  const suave = isDark ? '#A0A0A0' : '#666666';
  const fondoInput = isDark ? '#1E1E1E' : '#F2F2F2';
  const borde = isDark ? '#333333' : '#DDDDDD';

  const guardar = async () => {
    if (!actual || !nueva) {
      Alert.alert('Faltan datos', 'Completá tu contraseña actual y la nueva.');
      return;
    }
    if (nueva.length < 8) {
      Alert.alert('Contraseña corta', 'La contraseña nueva tiene que tener al menos 8 caracteres.');
      return;
    }
    if (nueva !== repetir) {
      Alert.alert('No coinciden', 'La contraseña nueva y su repetición no son iguales.');
      return;
    }
    setGuardando(true);
    try {
      const res = await fetch(API_URL + '/api/claves/mia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ actual: actual, nueva: nueva }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        Alert.alert('No se pudo cambiar', data.error || 'Probá de nuevo.');
      } else {
        Alert.alert('Listo', 'Tu contraseña se cambió.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      }
    } catch (e) {
      Alert.alert('Sin conexión', 'Revisá tu internet y probá de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  const campo = {
    backgroundColor: fondoInput,
    borderColor: borde,
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    color: texto,
    fontSize: 16,
    marginBottom: 12,
  };

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={{ padding: 20, paddingTop: 60 }} keyboardShouldPersistTaps="handled">
      <Text style={{ color: texto, fontSize: 24, fontWeight: '700', marginBottom: 6 }}>Cambiar contraseña</Text>
      <Text style={{ color: suave, marginBottom: 20 }}>Usá al menos 8 caracteres.</Text>
      <TextInput style={campo} placeholder="Contraseña actual" placeholderTextColor={suave} secureTextEntry autoCapitalize="none" value={actual} onChangeText={setActual} />
      <TextInput style={campo} placeholder="Contraseña nueva" placeholderTextColor={suave} secureTextEntry autoCapitalize="none" value={nueva} onChangeText={setNueva} />
      <TextInput style={campo} placeholder="Repetir contraseña nueva" placeholderTextColor={suave} secureTextEntry autoCapitalize="none" value={repetir} onChangeText={setRepetir} />
      <Pressable onPress={guardar} disabled={guardando} style={{ backgroundColor: t.primary, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 6, opacity: guardando ? 0.6 : 1 }}>
        {guardando ? <ActivityIndicator color="#FFFFFF" /> : <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>Guardar</Text>}
      </Pressable>
      <Pressable onPress={() => navigation.goBack()} style={{ padding: 15, alignItems: 'center' }}>
        <Text style={{ color: suave }}>Volver</Text>
      </Pressable>
    </ScrollView>
  );
}
