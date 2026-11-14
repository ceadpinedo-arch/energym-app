import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Linking, Image, Share, Modal, Platform, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop, Path } from 'react-native-svg';
import { API_URL } from '../config';
import * as ImagePicker from 'expo-image-picker';
import TarjetaAsistencia from '../components/TarjetaAsistencia';
import { useAppTheme } from '../theme/ThemeContext';

const META_VISITAS = 12;
const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

function Anillo({ t, valor, meta }) {
  const size = 100, stroke = 10, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const pct = Math.min(valor / meta, 1);
  const visualPct = pct === 0 ? 0.08 : pct;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Defs>
          <SvgGradient id="neonRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#22D3EE" />
            <Stop offset="50%" stopColor="#8B5CF6" />
            <Stop offset="100%" stopColor="#EC4899" />
          </SvgGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(139, 92, 246, 0.22)" strokeWidth={stroke} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="url(#neonRing)" strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={c + ' ' + c} strokeDashoffset={c * (1 - visualPct)} />
      </Svg>
      <Text style={{ color: t.textPrimary, fontSize: 22, fontWeight: '900' }}>{Math.round(pct * 100)}%</Text>
    </View>
  );
}

function PulsoIcon({ color = '#34D399' }) {
  return (
    <View style={[styles.pulseCircle, { borderColor: color }]}>
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path d="M3 12H7L10 5L14 19L17 12H21" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}

const fraseLogro = (r) => r >= 30 ? '¡Leyenda del gym!' : r >= 14 ? '¡Imparable!' : r >= 7 ? '¡Semana de fuego!' : r >= 3 ? '¡Vas con todo!' : '¡Buen comienzo!';
const emojiLogro = (r) => r >= 30 ? '🏆' : r >= 14 ? '🚀' : r >= 3 ? '🔥' : '💪';

function AnilloLogro({ t, valor, meta, size, children }) {
  const stroke = Math.round(size * 0.09), r = (size - stroke) / 2, c = 2 * Math.PI * r, pct = Math.min(valor / meta, 1);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={t.primaryBg} strokeWidth={stroke} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={t.primary} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={c + ' ' + c} strokeDashoffset={c * (1 - pct)} />
      </Svg>
      {children}
    </View>
  );
}

function diasMarcados(stats) {
  const hoy = (new Date().getDay() + 6) % 7;
  const ultimo = stats.entroHoy ? hoy : hoy - 1;
  const marcados = [];
  for (let i = 0; i < stats.racha; i++) { const d = ultimo - i; if (d >= 0) marcados.push(d); }
  return { hoy, marcados };
}

function Atajo({ t, emoji, label, destacado, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.atajo, { backgroundColor: destacado ? 'rgba(30, 41, 82, 0.85)' : t.surface, borderColor: destacado ? (t.cyanBorder || '#22D3EE') : t.border, borderWidth: destacado ? 1.5 : 1, opacity: pressed ? 0.82 : 1 }]}>
      <View style={[styles.atajoIconWrap, destacado && { backgroundColor: 'rgba(34, 211, 238, 0.16)' }]}>
        <Text style={{ fontSize: 26 }}>{emoji}</Text>
      </View>
      <Text style={{ color: t.textPrimary, fontSize: 12, fontWeight: '700', marginTop: 8, textAlign: 'center' }}>{label}</Text>
    </Pressable>
  );
}

function FilaCopiar({ t, label, valor }) {
  return (
    <Pressable onPress={async () => { await Clipboard.setStringAsync(valor); alert('Copiado: ' + valor); }} style={[styles.filaCopiar, { backgroundColor: t.innerBg || t.bg, borderColor: t.border }]}>
      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text style={{ color: t.textSecondary, fontSize: 12 }}>{label}</Text>
        <Text style={{ color: t.textPrimary, fontSize: 15, fontWeight: '800', marginTop: 2 }} numberOfLines={1}>{valor}</Text>
      </View>
      <View style={[styles.copyPill, { borderColor: t.cyanBorder || '#22D3EE', backgroundColor: t.cyanBg || 'rgba(6, 182, 212, 0.18)' }]}>
        <Text style={{ color: '#E0F2FE', fontWeight: '800', fontSize: 13 }}>Copiar</Text>
      </View>
    </Pressable>
  );
}

export default function HomeSocioScreen({ navigation, route }) {
  const { usuario, token } = route.params;
  const t = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width: anchoPantalla, height: altoPantalla } = useWindowDimensions();
  const anchoLogro = Math.min(anchoPantalla - 64, ((altoPantalla - 300) * 9) / 16, 320);
  const [verLogro, setVerLogro] = useState(false);
  const [estiloLogro, setEstiloLogro] = useState('cyber');
  const [fotoLogro, setFotoLogro] = useState(null);
  const elegirFotoLogro = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return;
      const res = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [9, 16], quality: 0.7, base64: true });
      if (!res.canceled && res.assets?.[0]) {
        const a = res.assets[0];
        setFotoLogro(a.base64 ? 'data:image/jpeg;base64,' + a.base64 : a.uri);
      }
    } catch (e) {}
  };
  const logroRef = useRef(null);
  const px = (n) => Math.round((n * anchoLogro) / 300);

  const [estado, setEstado] = useState(usuario);
  const [stats, setStats] = useState({ visitasMes: 0, racha: 0, entroHoy: false });
  const [pagando, setPagando] = useState(false);
  const [mpListo, setMpListo] = useState(false);
  const [gimnasio, setGimnasio] = useState({ nombre: '', logoUrl: '', spotifyUrl: '' });
  const [contacto, setContacto] = useState({ whatsapp: '', instagram: '', alias: '', cbu: '' });
  const [redes, setRedes] = useState({ instagram: '', facebook: '', tiktok: '', redX: '', hashtag: '', linkApp: '' });

  useEffect(() => {
    const h = { Authorization: 'Bearer ' + token };
    fetch(API_URL + '/api/asistencia/me', { headers: h }).then((r) => r.json()).then((d) => { if (d && typeof d.visitasMes === 'number') setStats(d); }).catch(() => {});
    fetch(API_URL + '/api/gimnasio/me', { headers: h }).then((r) => r.json()).then((g) => {
      setContacto({ whatsapp: g.whatsapp || '', instagram: g.instagram || '', alias: g.alias || '', cbu: g.cbu || '' });
      setGimnasio({ nombre: g.nombre || '', logoUrl: g.logoUrl || '', spotifyUrl: g.spotifyUrl || '' });
      setRedes({ instagram: g.instagram || '', facebook: g.facebook || '', tiktok: g.tiktok || '', redX: g.redX || '', hashtag: g.hashtag || '', linkApp: g.linkApp || '' });
    }).catch(() => {});
    fetch(API_URL + '/api/mp/disponible', { headers: h }).then((r) => r.json()).then((d) => setMpListo(!!(d && d.conectado))).catch(() => {});
    fetch(API_URL + '/api/socios/me', { headers: h }).then((r) => r.json()).then(setEstado).catch(() => {});
  }, []);

  const pagarCuota = async () => {
    setPagando(true);
    try {
      const res = await fetch(API_URL + '/api/pagos/crear-preferencia', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ usuarioId: estado.id }) });
      const data = await res.json();
      if (!res.ok || !data.initPoint) throw new Error();
      Linking.openURL(data.initPoint);
    } catch (e) { alert('No se pudo iniciar el pago.'); } finally { setPagando(false); }
  };

  const registrarHoy = async () => {
    try {
      const res = await fetch(API_URL + '/api/asistencia/hoy', { method: 'POST', headers: { Authorization: 'Bearer ' + token } });
      const d = await res.json();
      if (d && typeof d.visitasMes === 'number') setStats(d);
    } catch (e) {}
  };

  const armarTexto = (red) => {
    let linea = (stats.racha >= 2 ? 'Llevo ' + stats.racha + ' días seguidos entrenando' : 'Hoy entrené') + ' · ' + stats.visitasMes + (stats.visitasMes === 1 ? ' visita' : ' visitas') + ' este mes 💪';
    const usuarioRed = red === 'instagram' ? redes.instagram : red === 'tiktok' ? redes.tiktok : red === 'x' ? redes.redX : '';
    let etiqueta = gimnasio.nombre ? 'En ' + gimnasio.nombre : '';
    if (usuarioRed) etiqueta = (etiqueta ? etiqueta + ' ' : '') + '@' + usuarioRed;
    if (red === 'facebook' && redes.facebook) etiqueta = (etiqueta ? etiqueta + ' · ' : '') + 'facebook.com/' + redes.facebook;
    return [linea, etiqueta, redes.hashtag ? '#' + redes.hashtag : '', redes.linkApp].filter(Boolean).join('\n');
  };

  const compartirEn = async (red) => {
    const texto = armarTexto(red);
    try {
      if (red === 'x') { await Linking.openURL('https://twitter.com/intent/tweet?text=' + encodeURIComponent(texto)); return; }
      await Clipboard.setStringAsync(texto);
      await Linking.openURL(red === 'instagram' ? 'https://www.instagram.com/' : red === 'facebook' ? 'https://www.facebook.com/' : 'https://www.tiktok.com/');
    } catch (e) { alert('El texto quedó copiado.'); }
  };

  const capturarLogro = async () => await captureRef(logroRef, { format: 'png', quality: 1, result: 'tmpfile', width: 1080, height: 1920 });
  const compartirImagen = async () => {
    try { const uri = await capturarLogro(); await Clipboard.setStringAsync(armarTexto('instagram')); await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Compartí tu logro' }); }
    catch (e) { alert('No se pudo preparar la imagen.'); }
  };
  const historiaDirecta = async () => {
    try {
      const uri = await capturarLogro(); await Clipboard.setStringAsync(armarTexto('instagram'));
      const FS = require('expo-file-system/legacy'); const IL = require('expo-intent-launcher');
      const contentUri = await FS.getContentUriAsync(uri);
      await IL.startActivityAsync('com.instagram.share.ADD_TO_STORY', { data: contentUri, type: 'image/png', flags: 1, packageName: 'com.instagram.android' });
    } catch (e) { alert('Probá con Compartir imagen.'); }
  };
  const compartirGeneral = async () => { try { await Share.share({ message: armarTexto('') }); } catch (e) {} };

  const redesActivas = [];
  if (redes.instagram) redesActivas.push({ id: 'instagram', label: 'Instagram' });
  if (redes.facebook) redesActivas.push({ id: 'facebook', label: 'Facebook' });
  if (redes.tiktok) redesActivas.push({ id: 'tiktok', label: 'TikTok' });
  if (redes.redX) redesActivas.push({ id: 'x', label: 'X' });

  const alDia = estado.estadoPago === 'AL_DIA';
  const vencimiento = estado.vencimiento ? new Date(estado.vencimiento).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' }) : '—';
  const { hoy, marcados } = diasMarcados(stats);

  return (
    <LinearGradient colors={t.gradient} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={[styles.wrap, { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 36 }]}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.hello, { color: t.textPrimary }]}>Hola, {estado.nombre.split(' ')[0]} 👋</Text>
            <Text style={{ color: t.textSecondary, fontSize: 14, marginTop: 2 }}>{gimnasio.nombre ? gimnasio.nombre + ' · ' : ''}Listo para entrenar</Text>
          </View>
          {gimnasio.logoUrl ? (
            <View style={styles.logoHalo}><Image source={{ uri: gimnasio.logoUrl }} style={styles.logoImg} resizeMode="cover" /></View>
          ) : null}
        </View>

        <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.cardBorder || t.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Anillo t={t} valor={stats.visitasMes} meta={META_VISITAS} />
            <View style={{ flex: 1, marginLeft: 18 }}>
              <Text style={{ color: t.textPrimary, fontSize: 17, fontWeight: '800' }}>Tu mes</Text>
              <Text style={{ color: t.textSecondary, fontSize: 14, marginTop: 4 }}>{stats.visitasMes} de {META_VISITAS} visitas</Text>
              <Text style={{ color: '#F8FAFC', fontSize: 14, fontWeight: '700', marginTop: 6 }}>🔥 Racha: {stats.racha} {stats.racha === 1 ? 'día' : 'días'}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
          <Text style={{ color: t.textPrimary, fontSize: 16, fontWeight: '800', marginBottom: 14 }}>Esta semana</Text>
          <View style={styles.semanaCapsulas}>
            {DIAS.map((d, i) => {
              const activo = marcados.includes(i) || i === hoy;
              return (
                <View key={d + i} style={styles.capsulaWrap}>
                  {activo ? (
                    <LinearGradient colors={t.capsuleGradient || ['#38BDF8', '#2563EB']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={[styles.capsula, styles.capsulaActiva]}>
                      <Text style={styles.capsulaLetraActiva}>{d}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={[styles.capsula, { backgroundColor: t.innerBg || 'rgba(9, 13, 26, 0.7)', borderColor: 'rgba(148, 163, 184, 0.28)' }]}>
                      <Text style={[styles.capsulaLetra, { color: t.textSecondary }]}>{d}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        <View style={[styles.banner, { backgroundColor: alDia ? t.successBg : t.dangerBg, borderColor: alDia ? (t.successBorder || t.success) : t.danger }]}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#F8FAFC', fontSize: 16, fontWeight: '800' }}>{alDia ? 'Cuota al día' : 'Cuota vencida'}</Text>
            <Text style={{ color: alDia ? '#A7F3D0' : '#FECACA', fontSize: 13, marginTop: 3 }}>{alDia ? 'Próximo vencimiento: ' + vencimiento : 'Regularizá tu pago para seguir accediendo.'}</Text>
          </View>
          <PulsoIcon color={alDia ? '#34D399' : '#F87171'} />
        </View>

        <Pressable onPress={registrarHoy} disabled={stats.entroHoy} style={[styles.checkInWrap, stats.entroHoy && { borderColor: t.success }]}>
          <LinearGradient colors={stats.entroHoy ? ['rgba(16, 185, 129, 0.28)', 'rgba(5, 150, 105, 0.38)'] : (t.buttonGradient || ['#7C3AED', '#4F46E5'])} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.checkInGradient}>
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.4 }}>{stats.entroHoy ? '✓ Asistencia registrada hoy' : 'Entré hoy  🛡️'}</Text>
          </LinearGradient>
        </Pressable>

        {stats.entroHoy ? (
          <View style={[styles.card, { backgroundColor: t.surface, borderWidth: 1.5, borderColor: t.primary }]}>
            <Text style={{ color: t.textPrimary, fontSize: 21, fontWeight: '900' }}>{emojiLogro(stats.racha) + ' ' + fraseLogro(stats.racha)}</Text>
            <Text style={{ color: t.textSecondary, fontSize: 13, marginTop: 2 }}>Compartí tu logro y motivá a tu gente</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16, justifyContent: 'center' }}>
              <Pressable onPress={() => setVerLogro(true)} style={{ flexBasis: '30%', flexGrow: 1, minHeight: 46, justifyContent: 'center', alignItems: 'center', backgroundColor: t.primary, borderRadius: 16, paddingHorizontal: 8 }}>
                <Text style={{ color: t.onPrimary, fontWeight: '800', fontSize: 13, textAlign: 'center' }}>✨ Crear historia</Text>
              </Pressable>
              {redesActivas.map((r) => (
                <Pressable key={r.id} onPress={() => compartirEn(r.id)} style={{ flexBasis: '30%', flexGrow: 1, minHeight: 46, justifyContent: 'center', alignItems: 'center', backgroundColor: t.primaryBg, borderRadius: 16, paddingHorizontal: 8 }}>
                  <Text style={{ color: t.primary, fontWeight: '800', fontSize: 13, textAlign: 'center' }}>{r.label}</Text>
                </Pressable>
              ))}
              <Pressable onPress={compartirGeneral} style={{ flexBasis: '30%', flexGrow: 1, minHeight: 46, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: t.primary, borderRadius: 16, paddingHorizontal: 8 }}>
                <Text style={{ color: t.primary, fontWeight: '800', fontSize: 13, textAlign: 'center' }}>↗ Más opciones</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {mpListo ? (
          <Pressable onPress={pagarCuota} disabled={pagando} style={[styles.boton, { backgroundColor: t.coral }]}>
            <Text style={{ color: '#060814', fontWeight: '800', fontSize: 15 }}>{pagando ? 'Generando link…' : 'Pagar cuota con Mercado Pago'}</Text>
          </Pressable>
        ) : null}

        {(contacto.alias || contacto.cbu) ? (
          <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
            <Text style={{ color: t.textPrimary, fontSize: 16, fontWeight: '800', marginBottom: 12 }}>Pagar por transferencia</Text>
            {contacto.alias ? <FilaCopiar t={t} label="Alias" valor={contacto.alias} /> : null}
            {contacto.cbu ? <FilaCopiar t={t} label="CBU" valor={contacto.cbu} /> : null}
            <Text style={{ color: t.textSecondary, fontSize: 12, marginTop: 4 }}>Después de transferir, avisale al gimnasio para que registre tu pago.</Text>
          </View>
        ) : null}

        <Text style={{ color: t.textPrimary, fontSize: 15, fontWeight: '700', marginVertical: 10 }}>Accesos rápidos</Text>
        <View style={styles.grid}>
          <Atajo t={t} destacado emoji="🏋️" label="Mi rutina" onPress={() => navigation.navigate('Biblioteca', { token })} />
          <Atajo t={t} emoji="📈" label="Mi progreso" onPress={() => navigation.navigate('Progreso', { token })} />
          <Atajo t={t} emoji="🏆" label="Mis récords" onPress={() => navigation.navigate("Records", { token, usuario: estado })} />
          <Atajo t={t} emoji="🤝" label="Compañero" onPress={() => navigation.navigate("Companero", { token, usuario: estado })} />
          <Atajo t={t} emoji="🤖" label="Asistente IA" onPress={() => navigation.navigate('AsistenteIA', { token })} />
          <Atajo t={t} emoji="🧾" label="Historial de pagos" onPress={() => navigation.navigate('HistorialPagos', { token })} />
          {gimnasio.spotifyUrl ? <Atajo t={t} emoji="🎵" label="Spotify" onPress={() => Linking.openURL(gimnasio.spotifyUrl)} /> : null}
          {contacto.whatsapp ? <Atajo t={t} emoji="💬" label="WhatsApp" onPress={() => Linking.openURL('https://wa.me/' + contacto.whatsapp + '?text=Hola!')} /> : null}
          {contacto.instagram ? <Atajo t={t} emoji="📸" label="Instagram" onPress={() => Linking.openURL('https://instagram.com/' + contacto.instagram)} /> : null}
          <Atajo t={t} emoji="🎨" label="Apariencia" onPress={() => navigation.navigate('Apariencia', { token })} />
          <Atajo t={t} emoji="🔑" label="Cambiar contraseña" onPress={() => navigation.navigate('CambiarClave', { token })} />
        </View>

        <Modal visible={verLogro} transparent animationType="fade" onRequestClose={() => setVerLogro(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(6, 8, 20, 0.92)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
            {[
              { id: 'cyber', label: '⚡ Cyber Neón' },
              { id: 'fuego', label: '🔥 Imparable' },
              { id: 'bestia', label: '🦾 Modo Bestia' },
            ].map((m) => (
              <Pressable
                key={m.id}
                onPress={() => setEstiloLogro(m.id)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: estiloLogro === m.id ? '#C084FC' : 'rgba(148,163,184,0.3)',
                  backgroundColor: estiloLogro === m.id ? 'rgba(124, 58, 237, 0.45)' : 'rgba(15, 23, 42, 0.8)',
                }}
              >
                <Text style={{ color: estiloLogro === m.id ? '#FFF' : '#94A3B8', fontSize: 12, fontWeight: '800' }}>{m.label}</Text>
              </Pressable>
            ))}
          </View>

          <View ref={logroRef} collapsable={false} style={{ width: 292, height: 518, borderRadius: 24, overflow: 'hidden', borderWidth: 1.5, borderColor: 'rgba(168, 85, 247, 0.55)' }}>
            <TarjetaAsistencia
              estilo={estiloLogro}
              racha={stats.racha}
              visitasMes={stats.visitasMes}
              metaVisitas={META_VISITAS}
              emoji={emojiLogro(stats.racha)}
              frase={fraseLogro(stats.racha)}
              gymNombre={(typeof gimnasio !== 'undefined' ? gimnasio?.nombre : null) || 'EnerGym'}
              gymIg={(typeof gimnasio !== 'undefined' ? gimnasio?.instagram : null) || ''}
              nombreSocio={estado?.nombre ? estado.nombre.split(' ')[0] : 'Socio'}
              fotoCustom={fotoLogro}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 8, width: 292, marginTop: 10 }}>
            <Pressable
              onPress={elegirFotoLogro}
              style={{ flex: 1, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.45)', backgroundColor: 'rgba(15, 23, 42, 0.8)', alignItems: 'center' }}
            >
              <Text style={{ color: '#38BDF8', fontSize: 12, fontWeight: '800' }}>{fotoLogro ? '📷 Cambiar mi foto' : '📷 Usar mi propia foto'}</Text>
            </Pressable>
            {fotoLogro ? (
              <Pressable
                onPress={() => setFotoLogro(null)}
                style={{ paddingHorizontal: 12, justifyContent: 'center', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(248, 113, 113, 0.45)', backgroundColor: 'rgba(15, 23, 42, 0.8)' }}
              >
                <Text style={{ color: '#F87171', fontSize: 12, fontWeight: '800' }}>Quitar</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={{ flexDirection: 'row', gap: 8, width: 292, marginTop: 10 }}>
            <Pressable
              onPress={() => compartirEn('ig_story')}
              style={{ flex: 1.3, backgroundColor: '#7C3AED', paddingVertical: 12, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#C084FC' }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 12, textAlign: 'center' }}>📸 Historia Instagram</Text>
            </Pressable>
            <Pressable
              onPress={compartirGeneral}
              style={{ flex: 1, backgroundColor: 'rgba(30, 41, 59, 0.9)', paddingVertical: 12, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#38BDF8' }}
            >
              <Text style={{ color: '#E0F2FE', fontWeight: '800', fontSize: 12, textAlign: 'center' }}>↗ Compartir</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => setVerLogro(false)}
            style={{ width: 292, marginTop: 8, paddingVertical: 10, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.35)', alignItems: 'center' }}
          >
            <Text style={{ color: '#CBD5E1', fontWeight: '800', fontSize: 13 }}>Cerrar</Text>
          </Pressable>
        </View>
      </Modal>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  hello: { fontSize: 26, fontWeight: '900' },
  logoHalo: { width: 64, height: 64, borderRadius: 32, padding: 3, borderWidth: 2, borderColor: '#22D3EE', backgroundColor: 'rgba(139, 92, 246, 0.25)', elevation: 8 },
  logoImg: { width: '100%', height: '100%', borderRadius: 29 },
  card: { borderRadius: 24, padding: 18, marginBottom: 14, borderWidth: 1, elevation: 6 },
  semanaCapsulas: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 6 },
  capsulaWrap: { flex: 1, alignItems: 'center' },
  capsula: { width: 38, height: 78, borderRadius: 19, borderWidth: 1.2, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 12 },
  capsulaActiva: { borderColor: '#67E8F9', elevation: 8 },
  capsulaLetra: { fontSize: 13, fontWeight: '700' },
  capsulaLetraActiva: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  banner: { borderRadius: 22, paddingVertical: 16, paddingHorizontal: 18, marginBottom: 14, borderWidth: 1.2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pulseCircle: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, backgroundColor: 'rgba(16, 185, 129, 0.16)', alignItems: 'center', justifyContent: 'center' },
  checkInWrap: { borderRadius: 28, borderWidth: 1.8, borderColor: '#C084FC', overflow: 'hidden', marginBottom: 14, elevation: 10 },
  checkInGradient: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  boton: { borderRadius: 22, padding: 15, alignItems: 'center', marginBottom: 14 },
  filaCopiar: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 14, marginBottom: 10, borderWidth: 1 },
  copyPill: { paddingVertical: 7, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1.2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  atajo: { width: '31%', flexGrow: 1, borderRadius: 22, paddingVertical: 16, paddingHorizontal: 8, alignItems: 'center', elevation: 4 },
  atajoIconWrap: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(255, 255, 255, 0.05)', alignItems: 'center', justifyContent: 'center' },
});
