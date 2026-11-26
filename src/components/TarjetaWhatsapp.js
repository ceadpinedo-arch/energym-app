import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { API_URL } from '../config';

// Se pregunta una vez por apertura de la app; si el socio ya tiene numero, no aparece nunca
let descartadoEnEstaSesion = false;

export default function TarjetaWhatsapp({ token }) {
  const [visible, setVisible] = useState(false);
  const [valor, setValor] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    if (!token || descartadoEnEstaSesion) return undefined;
    let activo = true;
    fetch(API_URL + '/api/gimnasio/mi-telefono', { headers: { Authorization: 'Bearer ' + token } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (activo && d && d.rol === 'SOCIO' && !d.telefono) setVisible(true); })
      .catch(() => {});
    return () => { activo = false; };
  }, [token]);

  const ahoraNo = () => {
    descartadoEnEstaSesion = true;
    setVisible(false);
  };

  const guardar = async () => {
    setError('');
    const n = valor.replace(/\D/g, '');
    if (n.length < 8) {
      setError('Escribí tu número con código de área, sin 0 ni 15. Ejemplo: 3731456789');
      return;
    }
    setGuardando(true);
    try {
      const r = await fetch(API_URL + '/api/gimnasio/mi-telefono', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ telefono: valor }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(d.error || 'No se pudo guardar. Probá de nuevo.');
      } else {
        descartadoEnEstaSesion = true;
        setListo(true);
        setTimeout(() => setVisible(false), 1300);
      }
    } catch (e) {
      setError('Sin conexión. Probá de nuevo.');
    }
    setGuardando(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={ahoraNo}>
      <View style={{ flex: 1, backgroundColor: 'rgba(2, 6, 23, 0.78)', justifyContent: 'flex-start', paddingTop: 110, paddingHorizontal: 22 }}>
        <View style={{ backgroundColor: '#0F172A', borderRadius: 20, borderWidth: 1, borderColor: '#334155', padding: 20 }}>
          {listo ? (
            <Text style={{ color: '#4ADE80', fontSize: 16, fontWeight: '800', textAlign: 'center' }}>¡Listo! Guardamos tu WhatsApp ✅</Text>
          ) : (
            <>
              <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '900' }}>📱 ¿Cuál es tu WhatsApp?</Text>
              <Text style={{ color: '#94A3B8', fontSize: 13, marginTop: 6, lineHeight: 19 }}>
                Lo usa tu gimnasio para avisarte de tu cuota y de las promociones. Solo lo ve el gimnasio.
              </Text>
              <TextInput
                value={valor}
                onChangeText={setValor}
                keyboardType="phone-pad"
                placeholder="Ej: 3731456789"
                placeholderTextColor="#64748B"
                maxLength={20}
                style={{ marginTop: 14, color: '#F8FAFC', backgroundColor: '#1E293B', borderRadius: 12, borderWidth: 1, borderColor: '#475569', paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 }}
              />
              <Text style={{ color: '#64748B', fontSize: 11, marginTop: 6 }}>Con código de área, sin 0 ni 15.</Text>
              {error ? <Text style={{ color: '#F87171', fontSize: 12, marginTop: 8 }}>{error}</Text> : null}
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                <Pressable onPress={ahoraNo} style={{ flex: 1, paddingVertical: 13, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#475569' }}>
                  <Text style={{ color: '#CBD5E1', fontWeight: '800' }}>Ahora no</Text>
                </Pressable>
                <Pressable onPress={guardar} disabled={guardando} style={{ flex: 1.4, paddingVertical: 13, borderRadius: 14, alignItems: 'center', backgroundColor: '#7C3AED', borderWidth: 1, borderColor: '#C084FC' }}>
                  {guardando ? <ActivityIndicator color="#FFFFFF" /> : <Text style={{ color: '#FFFFFF', fontWeight: '900' }}>Guardar</Text>}
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
