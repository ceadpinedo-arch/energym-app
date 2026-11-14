import { useEffect, useState } from 'react';
import { Keyboard, Platform, Dimensions } from 'react-native';

// Devuelve cuánto espacio hay que reservar abajo cuando el teclado está abierto (0 si está cerrado)
export default function useTeclado() {
  const [alto, setAlto] = useState(0);
  useEffect(() => {
    const show = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hide = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const a = Keyboard.addListener(show, (e) => {
      const desdeArriba = Dimensions.get('screen').height - e.endCoordinates.screenY;
      setAlto(Math.max(e.endCoordinates.height, desdeArriba));
    });
    const b = Keyboard.addListener(hide, () => setAlto(0));
    return () => { a.remove(); b.remove(); };
  }, []);
  return alto;
}
