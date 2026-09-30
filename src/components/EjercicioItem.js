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
      toValue: 1,
      duration: 380,
      delay: Math.min(index, 8) * 50,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (primera.current) { primera.current = false; return; }
    Animated.spring(marca, { toValue: activo ? 1 : 0, friction: 5, tension: 140, useNativeDriver: true }).start();
    if (activo) {
      Animated.sequence([
        Animated.timing(pop, { toValue: 1.3, duration: 110, useNativeDriver: true }),
        Animated.spring(pop, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]).start();
    }
  }, [activo]);

  const presionar = (v) =>
    Animated.spring(escala, { toValue: v, friction: 6, tension: 220, useNativeDriver: true }).start();

  const imgUri = item.imagenUrl || item.imagen || item.uri || item.url;
  const opacidadMarca = marca.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolate: 'clamp' });

  return (
    <Animated.View
      style={{
        opacity: entrada,
        transform: [
          { translateY: entrada.interpolate({ inputRange: [0, 1], outputRange: [26, 0] }) },
          { scale: escala },
        ],
      }}
    >
      <Pressable
        style={styles.row}
        onPress={onOpen}
        onPressIn={() => presionar(0.97)}
        onPressOut={() => presionar(1)}
      >
        <View style={styles.thumb}>
          {imgUri && typeof imgUri === 'string' && imgUri.startsWith('http') ? (
            <Image source={{ uri: imgUri }} style={styles.img} resizeMode="cover" />
          ) : (
            <Text style={styles.thumbFallback}>💪</Text>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemTitle}>{item.nombre || 'Ejercicio'}</Text>
          <Text style={styles.itemDesc}>{item.descripcion || 'Sin descripción'}</Text>
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
    flexDirection: 'row', alignItems: 'center', backgroundColor: t.surface, padding: 12, borderRadius: 20, marginBottom: 10, gap: 12,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  thumb: { width: 56, height: 56, borderRadius: 14, backgroundColor: t.primaryBg, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  img: { width: '100%', height: '100%' },
  thumbFallback: { fontSize: 22 },
  itemTitle: { color: t.textPrimary, fontSize: 15, fontWeight: '700' },
  itemDesc: { color: t.textSecondary, fontSize: 12, marginTop: 2 },
  check: { width: 26, height: 26, borderRadius: 8, borderWidth: 1, borderColor: t.border, justifyContent: 'center', alignItems: 'center' },
  relleno: { position: 'absolute', top: -1, left: -1, right: -1, bottom: -1, borderRadius: 8, backgroundColor: t.primary },
  checkText: { color: t.onPrimary, fontSize: 13, fontWeight: 'bold' },
  borde: { ...StyleSheet.absoluteFillObject, borderWidth: 1.5, borderColor: t.primary, borderRadius: 20 },
});
