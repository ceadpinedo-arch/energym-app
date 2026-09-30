import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTheme, accents } from './colors';

const STORAGE_KEY = 'energym:apariencia';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const sistemaOscuro = useColorScheme() === 'dark';
  const [modo, setModo] = useState('claro');
  const [accentKey, setAccentKey] = useState('menta');
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const guardado = JSON.parse(raw);
          if (guardado.modo) setModo(guardado.modo);
          if (guardado.accentKey) setAccentKey(guardado.accentKey);
        }
      })
      .catch(() => {})
      .finally(() => setCargado(true));
  }, []);

  useEffect(() => {
    if (!cargado) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ modo, accentKey })).catch(() => {});
  }, [modo, accentKey, cargado]);

  const isDark = modo === 'auto' ? sistemaOscuro : modo === 'oscuro';
  const t = getTheme(isDark, accentKey);

  return (
    <ThemeContext.Provider value={{ t, isDark, modo, setModo, accentKey, setAccentKey, accents }}>
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
