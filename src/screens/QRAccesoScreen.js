import React, { useState, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { getTheme } from '../theme/colors';
import { API_URL } from '../config';
import { useAppTheme } from '../theme/ThemeContext';

const CODIGO_PUERTA = 'ENERGYM-PUERTA-ACCESO';

export default function QRAccesoScreen({ navigation, route }) {
  const { token } = route.params;
  const t = useAppTheme();

  const [permission, requestPermission] = useCameraPermissions();
  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const escaneadoRef = useRef(false);

  async function marcarEntrada(valorEscaneado) {
    if (valorEscaneado !== CODIGO_PUERTA) {
      setResultado({ ok: false, mensaje: 'Ese QR no es válido para entrar.' });
      return;
    }

    setProcesando(true);
    try {
      const res = await fetch(`${API_URL}/api/asistencia/hoy`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('No se pudo registrar la entrada');
      setResultado({ ok: true, mensaje: '¡Entrada registrada! Disfrutá tu entrenamiento.' });
    } catch (e) {
      setResultado({ ok: false, mensaje: 'No se pudo registrar. Probá de nuevo.' });
    } finally {
      setProcesando(false);
    }
  }

  function onBarcodeScanned({ data }) {
    if (escaneadoRef.current || procesando) return;
    escaneadoRef.current = true;
    marcarEntrada(data);
  }

  function escanearDeNuevo() {
    escaneadoRef.current = false;
    setResultado(null);
  }

  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: t.bg }} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.center, { backgroundColor: t.bg, padding: 24 }]}>
        <Text style={{ color: t.textPrimary, fontSize: 16, textAlign: 'center', marginBottom: 16 }}>
          Necesitamos permiso de cámara para escanear el QR de la puerta.
        </Text>
        <Pressable
          onPress={requestPermission}
          style={{ backgroundColor: t.primary, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 24 }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Dar permiso</Text>
        </Pressable>
      </View>
    );
  }

  if (resultado) {
    return (
      <View style={[styles.center, { backgroundColor: t.bg, padding: 24 }]}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: 12,
            color: resultado.ok ? t.success : t.danger,
          }}
        >
          {resultado.ok ? 'Listo' : 'Ups'}
        </Text>
        <Text style={{ color: t.textSecondary, fontSize: 15, textAlign: 'center', marginBottom: 24 }}>
          {resultado.mensaje}
        </Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {!resultado.ok && (
            <Pressable
              onPress={escanearDeNuevo}
              style={{ backgroundColor: t.primary, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 20 }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Escanear de nuevo</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => navigation.goBack()}
            style={{ borderColor: t.border, borderWidth: 1, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 20 }}
          >
            <Text style={{ color: t.textPrimary, fontWeight: '700' }}>Volver</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={onBarcodeScanned}
      />
      <View style={styles.overlay}>
        <Text style={styles.overlayText}>
          {procesando ? 'Procesando…' : 'Apuntá al QR de la entrada'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  overlay: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  overlayText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
});
