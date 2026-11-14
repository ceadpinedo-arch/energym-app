import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Animated, Easing, Vibration, StyleSheet } from 'react-native';
import Svg, { Line, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../theme/ThemeContext';

const PRESETS = [30, 60, 90, 120];
const TICKS = 60;
const RING_SIZE = 210;
const CENTER = RING_SIZE / 2;
const RADIUS = 88;

const fmt = (s) => {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const r = (s % 60).toString().padStart(2, '0');
  return m + ':' + r;
};

export default function Cronometro({ bottom = 84 }) {
  const t = useAppTheme();
  const styles = makeStyles(t);
  const [abierto, setAbierto] = useState(false);
  const [total, setTotal] = useState(90);
  const [restante, setRestante] = useState(90);
  const [corriendo, setCorriendo] = useState(false);
  const [terminado, setTerminado] = useState(false);

  const finRef = useRef(0);
  const panel = useRef(new Animated.Value(0)).current;
  const pulso = useRef(new Animated.Value(0)).current;
  const latido = useRef(new Animated.Value(1)).current;

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

  useEffect(() => {
    if (!corriendo) return;
    Animated.sequence([
      Animated.timing(latido, { toValue: 1.06, duration: 110, useNativeDriver: true }),
      Animated.timing(latido, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [restante]);

  useEffect(() => {
    if (!abierto) return;
    panel.setValue(0);
    Animated.spring(panel, { toValue: 1, friction: 7, tension: 90, useNativeDriver: true }).start();
  }, [abierto]);

  useEffect(() => {
    pulso.setValue(0);
    if (!corriendo && !terminado) return;
    const anim = Animated.loop(
      Animated.timing(pulso, { toValue: 1, duration: terminado ? 700 : 1400, easing: Easing.out(Easing.quad), useNativeDriver: true })
    );
    anim.start();
    return () => anim.stop();
  }, [corriendo, terminado]);

  const elegir = (p) => { setCorriendo(false); setTerminado(false); setTotal(p); setRestante(p); };
  const reiniciar = () => { setCorriendo(false); setTerminado(false); setRestante(total); };
  const ajustar = (delta) => {
    const nuevo = Math.max(0, restante + delta);
    setRestante(nuevo);
    setTotal((prev) => Math.max(prev, nuevo));
    setTerminado(false);
    if (corriendo) finRef.current += delta * 1000;
  };
  const alternar = () => {
    if (terminado || restante <= 0) { setTerminado(false); setRestante(total); setCorriendo(true); return; }
    setCorriendo((c) => !c);
  };

  const pct = total > 0 ? Math.max(0, Math.min(1, restante / total)) : 0;
  const activeTicks = Math.round(pct * TICKS);
  const urgente = corriendo && restante <= 5;
  const colorFab = terminado ? t.success : t.primary;
  const haloScale = pulso.interpolate({ inputRange: [0, 1], outputRange: [1, 1.85] });
  const haloOpacity = pulso.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });

  return (
    <>
      {abierto && (
        <Animated.View style={[styles.panel, { bottom: bottom + 74, opacity: panel, transform: [{ translateY: panel.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }, { scale: panel.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) }] }]}>
          <Text style={styles.titulo}>{terminado ? '¡A ENTRENAR!' : 'DESCANSO'}</Text>
          <View style={styles.ringWrap}>
            <Svg width={RING_SIZE} height={RING_SIZE} style={{ position: 'absolute' }}>
              <Circle cx={CENTER} cy={CENTER} r={RADIUS - 18} stroke="rgba(168, 85, 247, 0.16)" strokeWidth={2} fill="rgba(15, 23, 42, 0.55)" />
              {Array.from({ length: TICKS }).map((_, i) => {
                const rad = (((i * 360) / TICKS - 90) * Math.PI) / 180;
                const activo = i < activeTicks;
                return (
                  <Line
                    key={i}
                    x1={CENTER + (RADIUS - 10) * Math.cos(rad)}
                    y1={CENTER + (RADIUS - 10) * Math.sin(rad)}
                    x2={CENTER + RADIUS * Math.cos(rad)}
                    y2={CENTER + RADIUS * Math.sin(rad)}
                    stroke={activo ? (urgente ? t.danger : '#A855F7') : 'rgba(148, 163, 184, 0.22)'}
                    strokeWidth={activo ? 3 : 2}
                    strokeLinecap="round"
                  />
                );
              })}
            </Svg>
            <Animated.Text style={[styles.tiempo, { color: urgente ? t.danger : terminado ? t.success : '#FFFFFF', transform: [{ scale: latido }] }]}>
              {fmt(restante)}
            </Animated.Text>
          </View>
          <View style={styles.presets}>
            {PRESETS.map((p) => (
              <Pressable key={p} onPress={() => elegir(p)} style={[styles.chip, total === p && styles.chipActivo]}>
                <Text style={[styles.chipTexto, total === p && styles.chipTextoActivo]}>{fmt(p)}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.controles}>
            <Pressable style={styles.btnChico} onPress={() => ajustar(-15)}><Text style={styles.btnChicoTexto}>-15</Text></Pressable>
            <Pressable onPress={alternar} style={styles.btnPrincipalWrap}>
              <LinearGradient colors={corriendo ? ['#475569', '#334155'] : ['#8B5CF6', '#6D28D9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btnPrincipal}>
                <Text style={styles.btnPrincipalTexto}>{terminado ? 'Otra vez' : corriendo ? 'Pausar' : 'Iniciar'}</Text>
              </LinearGradient>
            </Pressable>
            <Pressable style={styles.btnChico} onPress={() => ajustar(15)}><Text style={styles.btnChicoTexto}>+15</Text></Pressable>
          </View>
          <Pressable onPress={reiniciar} style={{ marginTop: 12 }}><Text style={styles.reiniciar}>Reiniciar</Text></Pressable>
        </Animated.View>
      )}
      <View pointerEvents="box-none" style={[styles.fabWrap, { bottom }]}>
        <Animated.View pointerEvents="none" style={[styles.halo, { backgroundColor: colorFab, opacity: haloOpacity, transform: [{ scale: haloScale }] }]} />
        <Pressable style={[styles.fab, { borderColor: '#C084FC' }]} onPress={() => { setAbierto((v) => !v); if (terminado) { setTerminado(false); setRestante(total); } }}>
          <LinearGradient colors={['#A855F7', '#6D28D9']} style={styles.fabGradient}>
            {terminado ? <Text style={styles.fabTexto}>¡Listo!</Text> : corriendo || restante !== total ? <Text style={styles.fabTexto}>{fmt(restante)}</Text> : <Text style={{ fontSize: 26, color: '#FFF' }}>⏱</Text>}
          </LinearGradient>
        </Pressable>
      </View>
    </>
  );
}

const makeStyles = () => StyleSheet.create({
  fabWrap: { position: 'absolute', right: 20, width: 66, height: 66 },
  halo: { position: 'absolute', width: 66, height: 66, borderRadius: 33 },
  fab: { width: 66, height: 66, borderRadius: 33, borderWidth: 2, overflow: 'hidden', elevation: 12, shadowColor: '#A855F7', shadowOpacity: 0.8, shadowRadius: 12, shadowOffset: { width: 0, height: 0 } },
  fabGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fabTexto: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  panel: { position: 'absolute', right: 16, width: 300, backgroundColor: 'rgba(24, 30, 52, 0.94)', borderRadius: 30, paddingVertical: 22, paddingHorizontal: 18, alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(192, 132, 252, 0.45)', elevation: 16, shadowColor: '#7C3AED', shadowOpacity: 0.45, shadowRadius: 20, shadowOffset: { width: 0, height: 8 } },
  titulo: { color: '#CBD5E1', fontSize: 13, fontWeight: '700', letterSpacing: 2.5 },
  ringWrap: { width: RING_SIZE, height: RING_SIZE, alignItems: 'center', justifyContent: 'center', marginVertical: 6 },
  tiempo: { fontSize: 48, fontWeight: '800', fontVariant: ['tabular-nums'], textShadowColor: 'rgba(168, 85, 247, 0.85)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 16 },
  presets: { flexDirection: 'row', gap: 8, marginTop: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.3)', backgroundColor: 'rgba(15, 23, 42, 0.75)' },
  chipActivo: { backgroundColor: 'rgba(168, 85, 247, 0.28)', borderColor: '#C084FC' },
  chipTexto: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },
  chipTextoActivo: { color: '#FFFFFF', fontWeight: '800' },
  controles: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 18 },
  btnChico: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(15, 23, 42, 0.85)', borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.3)', alignItems: 'center', justifyContent: 'center' },
  btnChicoTexto: { color: '#F8FAFC', fontWeight: '800', fontSize: 15 },
  btnPrincipalWrap: { borderRadius: 26, borderWidth: 1.5, borderColor: '#C084FC', overflow: 'hidden', elevation: 8 },
  btnPrincipal: { paddingHorizontal: 32, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  btnPrincipalTexto: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  reiniciar: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
});
