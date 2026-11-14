import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Pressable, Animated, Easing, StyleSheet } from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';

export default function EjercicioItem({ item, index, activo, onOpen, onToggle }) {
  const t = useAppTheme();
  const styles = makeStyles(t);
  const entrada = useRef(new Animated.Value(0)).current;
  const escala = useRef(new Animated.Value(1)).current;
  const marca = useRef(new Animated.Value(activo ? 1 : 0)).current;
  const pop = useRef(new Animated.Value(1)).current;
  const primera = useRef(true);

  useEffect(() => {
    Animated.timing(entrada, {
      toValue: 1, duration: 360, delay: Math.min(index, 8) * 45,
      easing: Easing.out(Easing.cubic), useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (primera.current) { primera.current = false; return; }
    Animated.spring(marca, { toValue: activo ? 1 : 0, friction: 5, tension: 140, useNativeDriver: true }).start();
    if (activo) {
      Animated.sequence([
        Animated.timing(pop, { toValue: 1.28, duration: 110, useNativeDriver: true }),
        Animated.spring(pop, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]).start();
    }
  }, [activo]);

  const presionar = (v) => Animated.spring(escala, { toValue: v, friction: 6, tension: 220, useNativeDriver: true }).start();
  const imgUri = item.imagenUrl || item.imagen || item.uri || item.url;
  const opacidadMarca = marca.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolate: 'clamp' });

  return (
    <Animated.View style={{ opacity: entrada, transform: [{ translateY: entrada.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }, { scale: escala }] }}>
      <Pressable style={styles.row} onPress={onOpen} onPressIn={() => presionar(0.97)} onPressOut={() => presionar(1)}>
        <View style={styles.thumb}>
          {imgUri && typeof imgUri === 'string' && imgUri.startsWith('http') ? (
            <Image source={{ uri: imgUri }} style={styles.img} resizeMode="cover" />
          ) : (
            <Text style={styles.thumbFallback}>💪</Text>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemTitle}>{item.nombre || 'Ejercicio'}</Text>
          <Text style={styles.itemDesc} numberOfLines={2}>{item.descripcion || 'Sin descripción'}</Text>
        </View>
        <Pressable onPress={onToggle} hitSlop={12}>
          <Animated.View style={[styles.check, { transform: [{ scale: pop }] }]}>
            <Animated.View style={[styles.relleno, { opacity: opacidadMarca, transform: [{ scale: marca }] }]} />
            <Animated.Text style={[styles.checkText, { opacity: opacidadMarca, transform: [{ scale: marca }] }]}>✓</Animated.Text>
          </Animated.View>
        </Pressable>
        <Animated.View pointerEvents="none" style={[styles.borde, { opacity: opacidadMarca }]} />
      </Pressable>
    </Animated.View>
  );
}

const makeStyles = (t) => StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: t.surface, padding: 13, borderRadius: 22,
    marginBottom: 12, gap: 14, borderWidth: 1, borderColor: t.border,
    shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  thumb: { width: 60, height: 60, borderRadius: 16, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.3)' },
  img: { width: '100%', height: '100%' },
  thumbFallback: { fontSize: 24 },
  itemTitle: { color: t.textPrimary, fontSize: 16, fontWeight: '800' },
  itemDesc: { color: t.textSecondary, fontSize: 12, marginTop: 3 },
  check: { width: 28, height: 28, borderRadius: 9, borderWidth: 1.5, borderColor: 'rgba(148, 163, 184, 0.4)', backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center' },
  relleno: { position: 'absolute', top: -1.5, left: -1.5, right: -1.5, bottom: -1.5, borderRadius: 9, backgroundColor: t.cyan || t.primary },
  checkText: { color: '#060814', fontSize: 14, fontWeight: '900' },
  borde: { ...StyleSheet.absoluteFillObject, borderWidth: 1.8, borderColor: t.cyan || t.primary, borderRadius: 22 },
});
