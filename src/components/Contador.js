import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export default function Contador({ n, style }) {
  const salto = useRef(new Animated.Value(0)).current;
  const primera = useRef(true);

  useEffect(() => {
    if (primera.current) { primera.current = false; return; }
    Animated.sequence([
      Animated.timing(salto, { toValue: -5, duration: 100, useNativeDriver: true }),
      Animated.spring(salto, { toValue: 0, friction: 4, useNativeDriver: true }),
    ]).start();
  }, [n]);

  return (
    <Animated.Text style={[style, { transform: [{ translateY: salto }] }]}>
      Tu rutina: {n} seleccionados
    </Animated.Text>
  );
}
