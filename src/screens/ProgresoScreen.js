import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_URL } from '../config';
import { useAppTheme } from '../theme/ThemeContext';

const num = (p) => String(p).replace('.', ',');
const larga = (d) => (d ? String(d).slice(8, 10) + '/' + String(d).slice(5, 7) + '/' + String(d).slice(0, 4) : '');

function Anillo({ pct, peso, t }) {
  const size = 104;
  const grosor = 10;
  const r = (size - grosor) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, pct));
  const mitad = size / 2;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle cx={mitad} cy={mitad} r={r} stroke={t.primaryBg} strokeWidth={grosor} fill="none" />
        <Circle
          cx={mitad}
          cy={mitad}
          r={r}
          stroke={t.primary}
          strokeWidth={grosor}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - p)}
          rotation={-90}
          origin={mitad + ', ' + mitad}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={{ color: t.textPrimary, fontSize: 20, fontWeight: '800' }}>{num(peso)}</Text>
        <Text style={{ color: t.textSecondary, fontSize: 11 }}>kg</Text>
      </View>
    </View>
  );
}

export default function ProgresoScreen({ route }) {
  const { token } = route.params;
  const t = useAppTheme();
  const insets = useSafeAreaInsets();
  const [datos, setDatos] = useState({});
  const [nombres, setNombres] = useState({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const h = { Authorization: 'Bearer ' + token };
    Promise.all([
      fetch(API_URL + '/api/entrenos/progreso', { headers: h }).then((r) => r.json()),
      fetch(API_URL + '/api/ejercicios', { headers: h }).then((r) => r.json()).catch(() => []),
    ])
      .then(([p, e]) => {
        if (p && typeof p === 'object' && !Array.isArray(p) && !p.error) setDatos(p);
        else setError(true);
        const m = {};
        if (Array.isArray(e)) e.forEach((x) => { m[String(x.id)] = x.nombre; });
        setNombres(m);
      })
      .catch(() => setError(true))
      .finally(() => setCargando(false));
  }, []);

  const ultimoDia = (id) => {
    const s = datos[id].sesiones;
    return s.length ? s[s.length - 1].dia : '';
  };
  const ids = Object.keys(datos).sort((a, b) => (ultimoDia(b) > ultimoDia(a) ? 1 : -1));

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg }}
      contentContainerStyle={{ padding: 16, paddingTop: insets.top + 12, paddingBottom: 40 }}
    >
      <Text style={{ color: t.textPrimary, fontSize: 22, fontWeight: '700' }}>Mi progreso</Text>
      <Text style={{ color: t.textSecondary, fontSize: 13, marginTop: 4, marginBottom: 14 }}>
        El anillo compara tu último peso con tu máximo. Completo significa que estás en tu mejor marca.
      </Text>

      {cargando && <ActivityIndicator color={t.primary} style={{ marginTop: 30 }} />}

      {!cargando && error && (
        <Text style={{ color: t.textSecondary, fontSize: 14 }}>No se pudo cargar tu progreso. Probá de nuevo más tarde.</Text>
      )}

      {!cargando && !error && ids.length === 0 && (
        <Text style={{ color: t.textSecondary, fontSize: 14 }}>
          Todavía no guardaste entrenos. Cargá el peso en "Mi rutina" y tocá "Guardar entreno".
        </Text>
      )}

      {ids.map((id) => {
        const d = datos[id];
        const ses = d.sesiones;
        const primera = ses[0];
        const ultima = ses[ses.length - 1];
        const maxP = Number(d.maximo.peso) || 0;
        const pct = maxP > 0 ? (Number(ultima.peso) || 0) / maxP : 0;
        const dif = Math.round((Number(ultima.peso) - Number(primera.peso)) * 10) / 10;
        return (
          <View key={id} style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
            <View style={styles.fila}>
              <Anillo pct={pct} peso={ultima.peso} t={t} />
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={{ color: t.textPrimary, fontSize: 17, fontWeight: '700' }}>{nombres[id] || 'Ejercicio'}</Text>
                <Text style={{ color: t.textSecondary, fontSize: 12, marginTop: 4 }}>
                  {'Máximo ' + num(maxP) + ' kg · ' + larga(d.maximo.dia)}
                </Text>
                {ses.length >= 2 && (
                  <Text style={{ color: dif > 0 ? t.primary : t.textSecondary, fontSize: 13, fontWeight: '600', marginTop: 6 }}>
                    {(dif > 0 ? '+' : '') + num(dif) + ' kg desde el ' + larga(primera.dia)}
                  </Text>
                )}
                <Text style={{ color: t.textSecondary, fontSize: 12, marginTop: 6 }}>
                  {d.total + (d.total === 1 ? ' sesión guardada' : ' sesiones guardadas')}
                </Text>
              </View>
            </View>

            {ses.slice(-3).reverse().map((s, i) => (
              <View key={i} style={[styles.sesion, { backgroundColor: t.bg }]}>
                <Text style={{ color: t.textSecondary, fontSize: 12, flex: 1 }}>{larga(s.dia)}</Text>
                <Text style={{ color: t.textPrimary, fontSize: 13, fontWeight: '600' }}>
                  {num(s.peso) + ' kg · ' + s.series + 'x' + s.repeticiones}
                </Text>
              </View>
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 18, padding: 16, marginBottom: 14 },
  fila: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  sesion: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginTop: 6 },
});
