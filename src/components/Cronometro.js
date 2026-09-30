import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Animated, Easing, Vibration, StyleSheet } from 'react-native';

const PRESETS = [30, 60, 90, 120];

const fmt = (s) => {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const r = (s % 60).toString().padStart(2, '0');
  return `${m}:${r}`;
};

export default function Cronometro({ bottom = 84 }) {
  const [abierto, setAbierto] = useState(false);
  const [total, setTotal] = useState(90);
  const [restante, setRestante] = useState(90);
  const [corriendo, setCorriendo] = useState(false);
  const [terminado, setTerminado] = useState(false);

  const finRef = useRef(0);
  const panel = useRef(new Animated.Value(0)).current;
  const pulso = useRef(new Animated.Value(0)).current;
  const latido = useRef(new Animated.Value(1)).current;
  const progreso = useRef(new Animated.Value(1)).current;

  // Cuenta regresiva basada en la hora de fin (sigue bien si la app pasa a segundo plano)
  useEffect(() => {
    if (!corriendo) return;
    finRef.current = Date.now() + restante * 1000;
    const id = setInterval(() => {
      const s = Math.max(0, Math.ceil((finRef.current - Date.now()) / 1000));
      setRestante(s);
      if (s <= 0) {
        clearInterval(id);
        setCorriendo(false);
        setTerminado(true);
        Vibration.vibrate([0, 400, 200, 400, 200, 600]);
      }
    }, 250);
    return () => clearInterval(id);
  }, [corriendo]);

  // Latido del número cada segundo
  useEffect(() => {
    if (!corriendo) return;
    Animated.sequence([
      Animated.timing(latido, { toValue: 1.12, duration: 110, useNativeDriver: true }),
      Animated.timing(latido, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [restante]);

  // Barra de progreso
  useEffect(() => {
    Animated.timing(progreso, {
      toValue: total > 0 ? restante / total : 0,
      duration: 250,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [restante, total]);

  // Entrada del panel
  useEffect(() => {
    if (!abierto) return;
    panel.setValue(0);
    Animated.spring(panel, { toValue: 1, friction: 7, tension: 90, useNativeDriver: true }).start();
  }, [abierto]);

  // Aro que late alrededor del botón
  useEffect(() => {
    pulso.setValue(0);
    if (!corriendo && !terminado) return;
    const anim = Animated.loop(
      Animated.timing(pulso, {
        toValue: 1,
        duration: terminado ? 700 : 1400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [corriendo, terminado]);

  const elegir = (p) => {
    setCorriendo(false);
    setTerminado(false);
    setTotal(p);
    setRestante(p);
  };
  const reiniciar = () => {
    setCorriendo(false);
    setTerminado(false);
    setRestante(total);
  };
  const ajustar = (delta) => {
    const nuevo = Math.max(0, restante + delta);
    setRestante(nuevo);
    setTotal((t) => Math.max(t, nuevo));
    setTerminado(false);
    if (corriendo) finRef.current += delta * 1000;
  };
  const alternar = () => {
    if (terminado || restante <= 0) {
      setTerminado(false);
      setRestante(total);
      setCorriendo(true);
      return;
    }
    setCorriendo((c) => !c);
  };

  const colorFab = terminado ? '#22C55E' : '#3B82F6';
  const urgente = corriendo && restante <= 5;
  const barraColor = progreso.interpolate({
    inputRange: [0, 0.2, 0.5, 1],
    outputRange: ['#EF4444', '#F59E0B', '#3B82F6', '#3B82F6'],
  });
  const barraAncho = progreso.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const haloScale = pulso.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] });
  const haloOpacity = pulso.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });

  return (
    <>
      {abierto && (
        <Animated.View
          style={[
            styles.panel,
            {
              bottom: bottom + 76,
              opacity: panel,
              transform: [
                { translateY: panel.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) },
                { scale: panel.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) },
              ],
            },
          ]}
        >
          <Text style={styles.titulo}>{terminado ? '¡A entrenar!' : 'Descanso'}</Text>
          <Animated.Text
            style={[
              styles.tiempo,
              {
                color: urgente ? '#F87171' : terminado ? '#22C55E' : '#F8FAFC',
                transform: [{ scale: latido }],
              },
            ]}
          >
            {fmt(restante)}
          </Animated.Text>

          <View style={styles.pista}>
            <Animated.View style={[styles.barra, { width: barraAncho, backgroundColor: barraColor }]} />
          </View>

          <View style={styles.presets}>
            {PRESETS.map((p) => (
              <Pressable
                key={p}
                onPress={() => elegir(p)}
                style={[styles.chip, total === p && styles.chipActivo]}
              >
                <Text style={[styles.chipTexto, total === p && styles.chipTextoActivo]}>{fmt(p)}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.controles}>
            <Pressable style={styles.btnChico} onPress={() => ajustar(-15)}>
              <Text style={styles.btnChicoTexto}>-15</Text>
            </Pressable>
            <Pressable
              style={[styles.btnPrincipal, corriendo && { backgroundColor: '#475569' }]}
              onPress={alternar}
            >
              <Text style={styles.btnPrincipalTexto}>
                {terminado ? 'Otra vez' : corriendo ? 'Pausar' : 'Iniciar'}
              </Text>
            </Pressable>
            <Pressable style={styles.btnChico} onPress={() => ajustar(15)}>
              <Text style={styles.btnChicoTexto}>+15</Text>
            </Pressable>
          </View>

          <Pressable onPress={reiniciar} style={{ marginTop: 10 }}>
            <Text style={styles.reiniciar}>Reiniciar</Text>
          </Pressable>
        </Animated.View>
      )}

      <View pointerEvents="box-none" style={[styles.fabWrap, { bottom }]}>
        <Animated.View
          pointerEvents="none"
          style={[styles.halo, { backgroundColor: colorFab, opacity: haloOpacity, transform: [{ scale: haloScale }] }]}
        />
        <Pressable
          style={[styles.fab, { backgroundColor: colorFab }]}
          onPress={() => {
            setAbierto((v) => !v);
            if (terminado) { setTerminado(false); setRestante(total); }
          }}
        >
          {terminado ? (
            <Text style={styles.fabTexto}>¡Listo!</Text>
          ) : corriendo || restante !== total ? (
            <Text style={styles.fabTexto}>{fmt(restante)}</Text>
          ) : (
            <Text style={{ fontSize: 26 }}>⏱</Text>
          )}
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  fabWrap: { position: 'absolute', right: 20, width: 64, height: 64 },
  halo: { position: 'absolute', width: 64, height: 64, borderRadius: 32 },
  fab: {
    width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center',
    elevation: 8, shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
  },
  fabTexto: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  panel: {
    position: 'absolute', right: 20, width: 264, backgroundColor: '#1E293B', borderRadius: 22,
    padding: 18, alignItems: 'center', borderWidth: 1, borderColor: '#334155', elevation: 10,
  },
  titulo: { color: '#94A3B8', fontSize: 12, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  tiempo: { fontSize: 56, fontWeight: '800', marginVertical: 6, fontVariant: ['tabular-nums'] },
  pista: { width: '100%', height: 8, borderRadius: 4, backgroundColor: '#0F172A', overflow: 'hidden' },
  barra: { height: '100%', borderRadius: 4 },
  presets: { flexDirection: 'row', gap: 8, marginTop: 14 },
  chip: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 14, borderWidth: 1, borderColor: '#334155' },
  chipActivo: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  chipTexto: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  chipTextoActivo: { color: '#FFFFFF' },
  controles: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 },
  btnChico: { backgroundColor: '#334155', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  btnChicoTexto: { color: '#F8FAFC', fontWeight: '700', fontSize: 13 },
  btnPrincipal: { backgroundColor: '#3B82F6', borderRadius: 14, paddingHorizontal: 22, paddingVertical: 12 },
  btnPrincipalTexto: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  reiniciar: { color: '#94A3B8', fontSize: 12 },
});
