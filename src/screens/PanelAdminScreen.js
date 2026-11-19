import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, RefreshControl, Image } from 'react-native';
import { API_URL } from '../config';
import { useAppTheme } from '../theme/ThemeContext';

const ETIQUETAS = { EFECTIVO: 'Efectivo', MERCADO_PAGO: 'Mercado Pago', TRANSFERENCIA: 'Transferencia' };
const etiquetaMetodo = (m) => ETIQUETAS[m] || m || '';
const pesos = (n) => '$' + Number(n || 0).toLocaleString('es-AR');
const nombreDe = (s) => (s && (s.nombre || (s.usuario && s.usuario.nombre))) || 'Socio';

function saludo() {
  const h = new Date().getHours();
  if (h < 12) return 'Buen día';
  if (h < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const dos = (n) => ('0' + n).slice(-2);

function fechaCorta(v) {
  if (!v) return '';
  const f = new Date(v);
  if (isNaN(f.getTime())) return '';
  const dd = ('0' + f.getDate()).slice(-2);
  const mm = ('0' + (f.getMonth() + 1)).slice(-2);
  return dd + '/' + mm;
}

function etiquetaDia(x) {
  const crudo = x.fecha || x.dia || x.etiqueta || x.label || '';
  if (typeof crudo === 'string' && /^\d{4}-\d{2}-\d{2}/.test(crudo)) {
    const f = new Date(crudo.slice(0, 10) + 'T12:00:00');
    return ['D', 'L', 'M', 'M', 'J', 'V', 'S'][f.getDay()];
  }
  return String(crudo).slice(0, 3);
}

export default function PanelAdminScreen({ navigation, route }) {
  const { token } = route.params;
  const t = useAppTheme();

  const [socios, setSocios] = useState([]);
  const [d, setD] = useState(null);
  const [error, setError] = useState('');
  const [gym, setGym] = useState(null);
  const [ahora, setAhora] = useState(new Date());
  const [refrescando, setRefrescando] = useState(false);

  const cargar = useCallback(() => {
    const h = { Authorization: 'Bearer ' + token };
    const pSocios = fetch(API_URL + '/api/socios', { headers: h })
      .then((res) => res.json())
      .then((x) => setSocios(Array.isArray(x) ? x : []))
      .catch(() => {});
    const pRes = fetch(API_URL + '/api/pagos/resumen', { headers: h })
      .then((res) => res.json())
      .then((x) => { setD(x); setError(''); })
      .catch(() => setError('No se pudo cargar el resumen.'));
    const pGym = fetch(API_URL + '/api/gimnasio/me', { headers: h })
      .then((res) => res.json())
      .then((x) => setGym(x))
      .catch(() => {});
    return Promise.all([pSocios, pRes, pGym]);
  }, [token]);

  useEffect(() => {
    cargar();
    const quitar = navigation.addListener('focus', cargar);
    return quitar;
  }, [cargar, navigation]);

  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const refrescar = () => {
    setRefrescando(true);
    cargar().then(() => setRefrescando(false), () => setRefrescando(false));
  };

  const nombreGym = (gym && gym.nombre) || 'Tu gimnasio';
  const logo = gym && typeof gym.logoUrl === 'string' && gym.logoUrl ? gym.logoUrl : null;
  const hora = dos(ahora.getHours()) + ':' + dos(ahora.getMinutes());
  const fecha = DIAS[ahora.getDay()] + ' ' + ahora.getDate() + ' ' + MESES[ahora.getMonth()];

  const r = d || {};
  const porVencer = r.porVencer || [];
  const vencidosLista = r.vencidosLista || [];
  const semana = r.asistenciaSemana || [];
  const metodos = r.porMetodo || [];
  const ultimos = (r.ultimosPagos || []).slice(0, 5);
  const activos = r.sociosActivos != null ? r.sociosActivos : socios.length;
  const vencidos = r.vencidos != null ? r.vencidos : socios.filter((s) => s.estadoPago === 'VENCIDO').length;
  const totalMes = r.totalMes || 0;
  const variacion = r.totalMesAnterior > 0
    ? Math.round(((totalMes - r.totalMesAnterior) / r.totalMesAnterior) * 100)
    : null;
  const alDia = Math.max(0, activos - porVencer.length);
  const maxSemana = Math.max(1, ...semana.map((x) => x.cantidad || 0));
  const totalSemana = semana.reduce((a, x) => a + (x.cantidad || 0), 0);
  const totalMetodos = Math.max(1, metodos.reduce((a, m) => a + (m.total || 0), 0));
  const proximos = vencidosLista.slice(0, 3).map((s) => ({ s: s, tipo: 'vencida' }))
    .concat(porVencer.slice(0, 5).map((s) => ({ s: s, tipo: 'porvencer' }))).slice(0, 5);

  const card = [styles.card, { backgroundColor: t.surface, borderColor: t.border }];
  const titulo = { color: t.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 12 };

  return (
    <ScrollView
      style={{ backgroundColor: t.bg }}
      contentContainerStyle={styles.wrap}
      refreshControl={<RefreshControl refreshing={refrescando} onRefresh={refrescar} tintColor={t.primary} />}
    >
      <View style={[styles.cabecera, { backgroundColor: t.surface, borderColor: t.border }]}>
        <View style={styles.cabFila}>
          {logo ? (
            <Image source={{ uri: logo }} style={[styles.logo, { borderColor: t.border }]} />
          ) : (
            <View style={[styles.logo, styles.logoVacio, { backgroundColor: t.primaryBg, borderColor: t.border }]}>
              <Text style={{ color: t.primary, fontSize: 22, fontWeight: '800' }}>{nombreGym.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={{ color: t.textPrimary, fontSize: 18, fontWeight: '800' }}>{nombreGym}</Text>
            <Text style={{ color: t.textSecondary, fontSize: 12, marginTop: 2 }}>{saludo()}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: t.textPrimary, fontSize: 22, fontWeight: '800' }}>{hora}</Text>
            <Text style={{ color: t.textSecondary, fontSize: 11 }}>{fecha}</Text>
          </View>
        </View>
      </View>

      {error ? <Text style={{ color: t.danger, marginBottom: 12 }}>{error}</Text> : null}
      {!d && !error ? <Text style={{ color: t.textSecondary, marginBottom: 12 }}>Cargando...</Text> : null}

      <View style={styles.fila}>
        <View style={[styles.stat, { backgroundColor: t.primaryBg }]}>
          <Text style={{ color: t.primary, fontSize: 12 }}>Socios al día</Text>
          <Text style={{ color: t.primary, fontSize: 24, fontWeight: '800' }}>{activos}</Text>
        </View>
        <View style={[styles.stat, { backgroundColor: t.successBg }]}>
          <Text style={{ color: t.success, fontSize: 12 }}>Ingresos del mes</Text>
          <Text style={{ color: t.success, fontSize: 22, fontWeight: '800' }}>{pesos(totalMes)}</Text>
          {variacion !== null ? (
            <Text style={{ color: t.success, fontSize: 11, marginTop: 2 }}>
              {(variacion >= 0 ? '+' : '') + variacion + '% vs mes anterior'}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.fila}>
        <View style={[styles.stat, { backgroundColor: t.warningBg }]}>
          <Text style={{ color: t.warning, fontSize: 12 }}>Por vencer</Text>
          <Text style={{ color: t.warning, fontSize: 24, fontWeight: '800' }}>{porVencer.length}</Text>
        </View>
        <View style={[styles.stat, { backgroundColor: t.warningBg }]}>
          <Text style={{ color: t.danger, fontSize: 12 }}>Cuotas vencidas</Text>
          <Text style={{ color: t.danger, fontSize: 24, fontWeight: '800' }}>{vencidos}</Text>
        </View>
      </View>

      {vencidos > 0 ? (
        <Pressable
          onPress={() => navigation.navigate('ListaSocios', { token, socios })}
          style={[styles.aviso, { backgroundColor: t.warningBg }]}
        >
          <Text style={{ color: t.warning, fontWeight: '700' }}>{vencidos} cuotas vencidas</Text>
          <Text style={{ color: t.warning, fontSize: 12, marginTop: 2 }}>Tocá para ver los socios y registrar pagos.</Text>
        </Pressable>
      ) : null}

      <View style={card}>
        <Text style={titulo}>Estado de las cuotas</Text>
        <View style={[styles.barra, { backgroundColor: t.border }]}>
          <View style={{ flex: alDia, backgroundColor: t.success }} />
          <View style={{ flex: porVencer.length, backgroundColor: t.warning }} />
          <View style={{ flex: vencidos, backgroundColor: t.danger }} />
        </View>
        <View style={styles.leyenda}>
          <Text style={{ color: t.success, fontSize: 12 }}>{'Al día ' + alDia}</Text>
          <Text style={{ color: t.warning, fontSize: 12 }}>{'Por vencer ' + porVencer.length}</Text>
          <Text style={{ color: t.danger, fontSize: 12 }}>{'Vencidas ' + vencidos}</Text>
        </View>
      </View>

      {semana.length > 0 ? (
        <View style={card}>
          <Text style={titulo}>Asistencia, últimos 7 días</Text>
          <View style={styles.grafico}>
            {semana.map((x, i) => (
              <View key={i} style={styles.col}>
                <Text style={{ color: t.textSecondary, fontSize: 10 }}>{x.cantidad || 0}</Text>
                <View
                  style={{
                    width: 18,
                    height: Math.max(4, ((x.cantidad || 0) / maxSemana) * 64),
                    borderRadius: 6,
                    backgroundColor: t.primary,
                    marginVertical: 3,
                  }}
                />
                <Text style={{ color: t.textSecondary, fontSize: 11 }}>{etiquetaDia(x)}</Text>
              </View>
            ))}
          </View>
          <Text style={{ color: t.textSecondary, fontSize: 12, marginTop: 8 }}>{totalSemana + ' ingresos en la semana'}</Text>
        </View>
      ) : null}

      {proximos.length > 0 ? (
        <View style={card}>
          <Text style={titulo}>Próximos vencimientos</Text>
          {proximos.map((p, i) => (
            <View key={i} style={styles.item}>
              <Text style={{ color: t.textPrimary, fontSize: 14, flex: 1 }}>{nombreDe(p.s)}</Text>
              <Text style={{ color: p.tipo === 'vencida' ? t.danger : t.warning, fontSize: 12, fontWeight: '700' }}>
                {p.tipo === 'vencida' ? 'Vencida' : 'Por vencer'}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={card}>
        <Text style={titulo}>Últimos pagos</Text>
        {ultimos.length === 0 ? (
          <Text style={{ color: t.textSecondary, fontSize: 13 }}>Sin pagos registrados.</Text>
        ) : (
          ultimos.map((p, i) => (
            <View key={p.id || i} style={styles.item}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.textPrimary, fontSize: 14 }}>{nombreDe(p)}</Text>
                <Text style={{ color: t.textSecondary, fontSize: 11 }}>
                  {etiquetaMetodo(p.metodo) + ' · ' + fechaCorta(p.pagadoEn)}
                </Text>
              </View>
              <Text style={{ color: t.textPrimary, fontSize: 14, fontWeight: '700' }}>{pesos(p.monto)}</Text>
            </View>
          ))
        )}
      </View>

      <View style={card}>
        <Text style={titulo}>Cobros por método</Text>
        {metodos.length === 0 ? (
          <Text style={{ color: t.textSecondary, fontSize: 13 }}>Todavía no hay pagos este mes.</Text>
        ) : (
          metodos.map((m, i) => (
            <View key={i} style={{ marginBottom: 10 }}>
              <View style={styles.item}>
                <Text style={{ color: t.textPrimary, fontSize: 14, flex: 1 }}>
                  {etiquetaMetodo(m.metodo) + ' · ' + (m.cantidad || 0) + ' pagos'}
                </Text>
                <Text style={{ color: t.textPrimary, fontSize: 14, fontWeight: '700' }}>{pesos(m.total)}</Text>
              </View>
              <View style={[styles.barra, { backgroundColor: t.border, height: 6 }]}>
                <View style={{ flex: m.total || 0, backgroundColor: t.primary }} />
                <View style={{ flex: Math.max(0, totalMetodos - (m.total || 0)) }} />
              </View>
            </View>
          ))
        )}
      </View>

      <View style={card}>
        <Text style={titulo}>Gestión</Text>
        <QuickLink t={t} label="Socios y cuotas" onPress={() => navigation.navigate('ListaSocios', { token, socios })} />
        <QuickLink t={t} label="Registrar pago en efectivo" onPress={() => navigation.navigate('PagoEfectivo', { token })} />
        <QuickLink t={t} label="Biblioteca de ejercicios" onPress={() => navigation.navigate('Biblioteca', { token, admin: true })} />
        <QuickLink t={t} label="Dar de alta un socio" onPress={() => navigation.navigate('AltaSocio', { token })} />
        <QuickLink t={t} label="Datos del gimnasio" onPress={() => navigation.navigate('DatosGimnasio', { token })} />
        <QuickLink t={t} label="Cambiar mi contraseña" onPress={() => navigation.navigate('CambiarClave', { token })} />
      </View>
    </ScrollView>
  );
}

function QuickLink({ t, label, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.quickLink, { backgroundColor: t.bg }]}>
      <Text style={{ color: t.textPrimary, fontSize: 14, flex: 1 }}>{label}</Text>
      <Text style={{ color: t.textSecondary }}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, paddingBottom: 32, flexGrow: 1 },
  cabecera: { borderRadius: 20, borderWidth: 0.5, padding: 14, marginBottom: 14 },
  cabFila: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 52, height: 52, borderRadius: 26, borderWidth: 1 },
  logoVacio: { alignItems: 'center', justifyContent: 'center' },
  fila: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  stat: { flex: 1, borderRadius: 16, padding: 14 },
  aviso: { borderRadius: 16, padding: 16, marginBottom: 14 },
  card: { borderRadius: 20, borderWidth: 0.5, padding: 16, marginBottom: 14 },
  barra: { flexDirection: 'row', height: 10, borderRadius: 6, overflow: 'hidden' },
  leyenda: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  grafico: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 100 },
  col: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 8 },
  quickLink: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 12, marginBottom: 8 },
});
