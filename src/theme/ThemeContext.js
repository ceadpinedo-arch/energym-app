import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTheme, accents, estilos } from './colors';

const STORAGE_KEY = 'energym:apariencia';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const sistemaOscuro = useColorScheme() === 'dark';
  const [modo, setModo] = useState('claro');
  const [accentKey, setAccentKey] = useState('menta');
  const [estiloKey, setEstiloKey] = useState('menta');
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const guardado = JSON.parse(raw);
          if (guardado.modo) setModo(guardado.modo);
          if (guardado.accentKey) setAccentKey(guardado.accentKey);
          if (guardado.estiloKey) setEstiloKey(guardado.estiloKey);
        }
      })
      .catch(() => {})
      .finally(() => setCargado(true));
  }, []);

  useEffect(() => {
    if (!cargado) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ modo, accentKey, estiloKey })).catch(() => {});
  }, [modo, accentKey, estiloKey, cargado]);

  const isDark = estiloKey === 'oscuro' ? true : (modo === 'auto' ? sistemaOscuro : modo === 'oscuro');
  const t = getTheme(isDark, accentKey, estiloKey);

  return (
    <ThemeContext.Provider value={{ t, isDark, modo, setModo, accentKey, setAccentKey, accents, estiloKey, setEstiloKey, estilos }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme debe usarse dentro de ThemeProvider');
  return ctx.t;
}

export function useAppearance() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppearance debe usarse dentro de ThemeProvider');
  return ctx;
}
