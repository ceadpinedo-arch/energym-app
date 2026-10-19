import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Linking, Image, Share, Modal, Platform, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { API_URL } from '../config';
import { useAppTheme } from '../theme/ThemeContext';

const META_VISITAS = 12;
const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

function Anillo({ t, valor, meta }) {
  const size = 96;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(valor / meta, 1);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={t.primaryBg} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={t.primary}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={c * (1 - pct)}
        />
      </Svg>
      <Text style={{ color: t.textPrimary, fontSize: 22, fontWeight: '800' }}>{Math.round(pct * 100)}%</Text>
    </View>
  );
}

function fraseLogro(racha) {
  if (racha >= 30) return '¡Leyenda del gym!';
  if (racha >= 14) return '¡Imparable!';
  if (racha >= 7) return '¡Semana de fuego!';
  if (racha >= 3) return '¡Vas con todo!';
  return '¡Buen comienzo!';
}

function emojiLogro(racha) {
  if (racha >= 30) return '🏆';
  if (racha >= 14) return '🚀';
  if (racha >= 3) return '🔥';
  return '💪';
}

function AnilloLogro({ t, valor, meta, size, children }) {
  const stroke = Math.round(size * 0.09);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(valor / meta, 1);
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
  for (let i = 0; i < stats.racha; i++) {
    const d = ultimo - i;
    if (d >= 0) marcados.push(d);
  }
  return { hoy, marcados };
}

function Atajo({ t, emoji, label, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.atajo,
        { backgroundColor: t.surface, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <Text style={{ fontSize: 26 }}>{emoji}</Text>
      <Text style={{ color: t.textPrimary, fontSize: 13, fontWeight: '600', marginTop: 6, textAlign: 'center' }}>{label}</Text>
    </Pressable>
  );
}

function FilaCopiar({ t, label, valor }) {
  return (
    <Pressable
      onPress={async () => { await Clipboard.setStringAsync(valor); alert('Copiado: ' + valor); }}
      style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: t.bg, borderRadius: 14, padding: 12, marginBottom: 8 }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ color: t.textSecondary, fontSize: 12 }}>{label}</Text>
        <Text style={{ color: t.textPrimary, fontSize: 15, fontWeight: '700' }}>{valor}</Text>
      </View>
      <Text style={{ color: t.primary, fontWeight: '700' }}>Copiar</Text>
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
    fetch(`${API_URL}/api/asistencia/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((d) => { if (d && typeof d.visitasMes === 'number') setStats(d); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/gimnasio/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((g) => {
        setContacto({ whatsapp: g.whatsapp || '', instagram: g.instagram || '', alias: g.alias || '', cbu: g.cbu || '' });
        setGimnasio({ nombre: g.nombre || '', logoUrl: g.logoUrl || '', spotifyUrl: g.spotifyUrl || '' });
    	setRedes({ instagram: g.instagram || '', facebook: g.facebook || '', tiktok: g.tiktok || '', redX: g.redX || '', hashtag: g.hashtag || '', linkApp: g.linkApp || '' });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(API_URL + '/api/mp/disponible', { headers: { Authorization: 'Bearer ' + token } })
      .then((res) => res.json())
      .then((d) => setMpListo(!!(d && d.conectado)))
      .catch(() => {});
  }, []);

  const pagarCuota = async () => {
    setPagando(true);
    try {
      const res = await fetch(`${API_URL}/api/pagos/crear-preferencia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ usuarioId: estado.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.initPoint) throw new Error('No se pudo generar el link de pago');
      Linking.openURL(data.initPoint);
    } catch (e) {
      alert('No se pudo iniciar el pago. Probá de nuevo en un momento.');
    } finally {
      setPagando(false);
    }
  };

  const registrarHoy = async () => {
    try {
      const res = await fetch(`${API_URL}/api/asistencia/hoy`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      if (d && typeof d.visitasMes === 'number') setStats(d);
    } catch (e) {}
  };

  useEffect(() => {
    fetch(`${API_URL}/api/socios/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setEstado)
      .catch(() => {});
  }, []);

  const armarTexto = (red) => {
    let linea = stats.racha >= 2 ? 'Llevo ' + stats.racha + ' días seguidos entrenando' : 'Hoy entrené';
    linea += ' · ' + stats.visitasMes + (stats.visitasMes === 1 ? ' visita' : ' visitas') + ' este mes \uD83D\uDCAA';
    const usuarioRed = red === 'instagram' ? redes.instagram : red === 'tiktok' ? redes.tiktok : red === 'x' ? redes.redX : '';
    let etiqueta = gimnasio.nombre ? 'En ' + gimnasio.nombre : '';
    if (usuarioRed) etiqueta = (etiqueta ? etiqueta + ' ' : '') + '@' + usuarioRed;
    if (red === 'facebook' && redes.facebook) etiqueta = (etiqueta ? etiqueta + ' · ' : '') + 'facebook.com/' + redes.facebook;
    const hashtagTxt = redes.hashtag ? '#' + redes.hashtag : '';
    return [linea, etiqueta, hashtagTxt, redes.linkApp].filter(Boolean).join('\n');
  };

  const compartirEn = async (red) => {
    const texto = armarTexto(red);
    try {
      if (red === 'x') {
        await Linking.openURL('https://twitter.com/intent/tweet?text=' + encodeURIComponent(texto));
        return;
      }
      await Clipboard.setStringAsync(texto);
      const destino = red === 'instagram' ? 'https://www.instagram.com/' : red === 'facebook' ? 'https://www.facebook.com/' : 'https://www.tiktok.com/';
      await Linking.openURL(destino);
    } catch (e) {
      alert('No se pudo abrir la red. El texto quedó copiado.');
    }
  };

  // LOGRO_IMG
  const capturarLogro = async () => {
    return await captureRef(logroRef, { format: 'png', quality: 1, result: 'tmpfile', width: 1080, height: 1920 });
  };

  const compartirImagen = async () => {
    try {
      const uri = await capturarLogro();
      await Clipboard.setStringAsync(armarTexto('instagram'));
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Compartí tu logro' });
    } catch (e) {
      alert('No se pudo preparar la imagen.');
    }
  };

  const historiaDirecta = async () => {
    try {
      const uri = await capturarLogro();
      await Clipboard.setStringAsync(armarTexto('instagram'));
      const FS = require('expo-file-system/legacy');
      const IL = require('expo-intent-launcher');
      const contentUri = await FS.getContentUriAsync(uri);
      await IL.startActivityAsync('com.instagram.share.ADD_TO_STORY', {
        data: contentUri,
        type: 'image/png',
        flags: 1,
        packageName: 'com.instagram.android',
      });
    } catch (e) {
      alert('No se pudo abrir la historia directa. Probá con Compartir imagen.');
    }
  };

  const compartirGeneral = async () => {
    try {
      await Share.share({ message: armarTexto('') });
    } catch (e) {}
  };

  const redesActivas = [];
  if (redes.instagram) redesActivas.push({ id: 'instagram', label: 'Instagram' });
  if (redes.facebook) redesActivas.push({ id: 'facebook', label: 'Facebook' });
  if (redes.tiktok) redesActivas.push({ id: 'tiktok', label: 'TikTok' });
  if (redes.redX) redesActivas.push({ id: 'x', label: 'X' });

  const alDia = estado.estadoPago === 'AL_DIA';
  const vencimiento = estado.vencimiento
    ? new Date(estado.vencimiento).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })
    : '—';
  const iniciales = estado.nombre
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const { hoy, marcados } = diasMarcados(stats);

  return (
    <LinearGradient colors={t.gradient} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={[styles.wrap, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32 }]}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.hello, { color: t.textPrimary }]}>Hola, {estado.nombre.split(' ')[0]} 👋</Text>
            <Text style={{ color: t.textSecondary, fontSize: 13 }}>{gimnasio.nombre ? gimnasio.nombre + ' · ' : ''}Listo para entrenar</Text>
          </View>
          {gimnasio.logoUrl ? (
            <Image source={{ uri: gimnasio.logoUrl }} style={{ width: 64, height: 64, borderRadius: 18, backgroundColor: t.surface }} resizeMode="contain" />
          ) : null}
        </View>

        <View style={[styles.card, { backgroundColor: t.surface }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Anillo t={t} valor={stats.visitasMes} meta={META_VISITAS} />
            <View style={{ flex: 1, marginLeft: 18 }}>
              <Text style={{ color: t.textPrimary, fontSize: 16, fontWeight: '700' }}>Tu mes</Text>
              <Text style={{ color: t.textSecondary, fontSize: 13, marginTop: 4 }}>
                {stats.visitasMes} de {META_VISITAS} visitas
              </Text>
              <Text style={{ color: t.primary, fontSize: 13, fontWeight: '600', marginTop: 4 }}>
                Racha: {stats.racha} {stats.racha === 1 ? 'día' : 'días'}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: t.surface }]}>
          <Text style={{ color: t.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 12 }}>Esta semana</Text>
          <View style={styles.semana}>
            {DIAS.map((d, i) => {
              const activo = marcados.includes(i);
              return (
                <View key={d + i} style={{ alignItems: 'center', flex: 1 }}>
                  <View
                    style={{
                      width: 10,
                      height: activo ? 48 : 16,
                      borderRadius: 6,
                      backgroundColor: activo ? t.primary : t.border,
                    }}
                  />
                  <Text
                    style={{
                      marginTop: 6,
                      fontSize: 12,
                      fontWeight: i === hoy ? '800' : '400',
                      color: i === hoy ? t.primary : t.textSecondary,
                    }}
                  >
                    {d}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={[styles.banner, { backgroundColor: alDia ? t.successBg : t.dangerBg }]}>
          <Text style={{ color: alDia ? t.success : t.danger, fontWeight: '700' }}>
            {alDia ? 'Cuota al día' : 'Cuota vencida'}
          </Text>
          <Text style={{ color: alDia ? t.success : t.danger, fontSize: 12, marginTop: 2 }}>
            {alDia ? `Próximo vencimiento: ${vencimiento}` : 'Regularizá tu pago para seguir accediendo.'}
          </Text>
        </View>

        <Pressable
          onPress={registrarHoy}
          disabled={stats.entroHoy}
          style={[styles.boton, { backgroundColor: stats.entroHoy ? t.successBg : t.primary }]}
        >
          <Text style={{ color: stats.entroHoy ? t.success : t.onPrimary, fontWeight: '800' }}>
            {stats.entroHoy ? '✓ Asistencia registrada hoy' : 'Entré hoy'}
          </Text>
        </Pressable>

        {/* LOGRO_V5 */}
    	{stats.entroHoy ? (
    	<View style={[styles.card, { backgroundColor: t.surface, borderWidth: 2, borderColor: t.primary }]}>
      	<Text style={{ color: t.textPrimary, fontSize: 21, fontWeight: '900' }}>{emojiLogro(stats.racha) + ' ' + fraseLogro(stats.racha)}</Text>
      	<Text style={{ color: t.textSecondary, fontSize: 13, marginTop: 2 }}>Compartí tu logro y motivá a tu gente</Text>
      	<View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
        	<View style={{ flex: 1, backgroundColor: t.primaryBg, borderRadius: 18, paddingVertical: 12, alignItems: 'center' }}>
          	<Text style={{ color: t.primary, fontSize: 28, fontWeight: '900' }}>{emojiLogro(stats.racha) + ' ' + stats.racha}</Text>
          	<Text style={{ color: t.textSecondary, fontSize: 12, fontWeight: '600' }}>{stats.racha === 1 ? 'día de racha' : 'días de racha'}</Text>
        	</View>
        	<View style={{ flex: 1, backgroundColor: t.primaryBg, borderRadius: 18, paddingVertical: 12, alignItems: 'center' }}>
          	<Text style={{ color: t.primary, fontSize: 28, fontWeight: '900' }}>{'💪 ' + stats.visitasMes}</Text>
          	<Text style={{ color: t.textSecondary, fontSize: 12, fontWeight: '600' }}>{stats.visitasMes === 1 ? 'visita este mes' : 'visitas este mes'}</Text>
        	</View>
      	</View>
      	<View style={{ marginTop: 14 }}>
        	<Text style={{ color: t.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>{'🎯 Meta del mes: ' + stats.visitasMes + ' de ' + META_VISITAS}</Text>
        	<View style={{ height: 10, borderRadius: 6, backgroundColor: t.primaryBg, overflow: 'hidden' }}>
          	<View style={{ height: 10, borderRadius: 6, backgroundColor: t.primary, width: Math.min(100, Math.round((stats.visitasMes / META_VISITAS) * 100)) + '%' }} />
        	</View>
      	</View>
      	<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
        	<Pressable
          	onPress={() => setVerLogro(true)}
          	style={({ pressed }) => ({ flexBasis: '30%', flexGrow: 1, minHeight: 48, justifyContent: 'center', alignItems: 'center', backgroundColor: t.primary, borderRadius: 16, paddingHorizontal: 8, opacity: pressed ? 0.85 : 1 })}
        	>
          	<Text style={{ color: t.onPrimary, fontWeight: '800', fontSize: 13, textAlign: 'center' }}>✨ Crear historia</Text>
        	</Pressable>
        	{redesActivas.map((r) => (
          	<Pressable
            	key={r.id}
            	onPress={() => compartirEn(r.id)}
            	style={({ pressed }) => ({ flexBasis: '30%', flexGrow: 1, minHeight: 48, justifyContent: 'center', alignItems: 'center', backgroundColor: t.primaryBg, borderRadius: 16, paddingHorizontal: 8, opacity: pressed ? 0.85 : 1 })}
          	>
            	<Text style={{ color: t.primary, fontWeight: '800', fontSize: 13, textAlign: 'center' }}>{r.label}</Text>
          	</Pressable>
        	))}
        	<Pressable
          	onPress={compartirGeneral}
          	style={({ pressed }) => ({ flexBasis: '30%', flexGrow: 1, minHeight: 48, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: t.primary, borderRadius: 16, paddingHorizontal: 8, opacity: pressed ? 0.85 : 1 })}
        	>
          	<Text style={{ color: t.primary, fontWeight: '800', fontSize: 13, textAlign: 'center' }}>↗ Más opciones</Text>
        	</Pressable>
      	</View>
      	<Text style={{ color: t.textSecondary, fontSize: 11, marginTop: 10, textAlign: 'center' }}>Al tocar una red se copia el texto de tu logro para que lo pegues.</Text>
    	</View>
    	) : null}

    	{mpListo ? (
        <Pressable
          onPress={pagarCuota}
          disabled={pagando}
          style={[styles.boton, { backgroundColor: t.coral }]}
        >
          <Text style={{ color: '#2B1710', fontWeight: '800' }}>
            {pagando ? 'Generando link…' : 'Pagar cuota'}
          </Text>
        </Pressable>
        ) : null}

        {(contacto.alias || contacto.cbu) ? (
          <View style={[styles.card, { backgroundColor: t.surface }]}>
            <Text style={{ color: t.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 10 }}>Pagar por transferencia</Text>
            {contacto.alias ? <FilaCopiar t={t} label="Alias" valor={contacto.alias} /> : null}
            {contacto.cbu ? <FilaCopiar t={t} label="CBU" valor={contacto.cbu} /> : null}
            <Text style={{ color: t.textSecondary, fontSize: 12, marginTop: 4 }}>Después de transferir, avisale al gimnasio para que registre tu pago.</Text>
          </View>
        ) : null}

        <Text style={{ color: t.textSecondary, fontSize: 13, fontWeight: '600', marginVertical: 8 }}>Accesos rápidos</Text>
        <View style={styles.grid}>
          <Atajo t={t} emoji="🏋️" label="Mi rutina de hoy" onPress={() => navigation.navigate('Biblioteca', { token })} />
          <Atajo t={t} emoji="📈" label="Mi progreso" onPress={() => navigation.navigate('Progreso', { token })} />
          <Atajo t={t} emoji="🤖" label="Asistente IA" onPress={() => navigation.navigate('AsistenteIA', { token })} />
          <Atajo t={t} emoji="🧾" label="Historial de pagos" onPress={() => navigation.navigate('HistorialPagos', { token })} />
          {gimnasio.spotifyUrl ? <Atajo t={t} emoji="🎵" label="Spotify" onPress={() => Linking.openURL(gimnasio.spotifyUrl)} /> : null}
          {contacto.whatsapp ? <Atajo t={t} emoji="💬" label="WhatsApp" onPress={() => Linking.openURL(`https://wa.me/${contacto.whatsapp}?text=Hola!`)} /> : null}
          {contacto.instagram ? <Atajo t={t} emoji="📸" label="Instagram" onPress={() => Linking.openURL(`https://instagram.com/${contacto.instagram}`)} /> : null}
          <Atajo t={t} emoji="🎨" label="Apariencia" onPress={() => navigation.navigate('Apariencia', { token })} />
          <Atajo t={t} emoji="🔑" label="Cambiar contraseña" onPress={() => navigation.navigate('CambiarClave', { token })} />
        </View>
      <Modal visible={verLogro} animationType="slide" onRequestClose={() => setVerLogro(false)}>
    	<LinearGradient colors={t.gradient} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: insets.top, paddingBottom: insets.bottom }}>
      	<View ref={logroRef} collapsable={false} style={{ width: anchoLogro, height: (anchoLogro * 16) / 9, borderRadius: px(26), overflow: 'hidden' }}>
        	<LinearGradient colors={t.gradient} style={{ flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: px(24), paddingHorizontal: px(18) }}>
          	<View style={{ position: 'absolute', top: -px(40), right: -px(40), width: px(160), height: px(160), borderRadius: px(80), backgroundColor: t.primary, opacity: 0.14 }} />
          	<View style={{ position: 'absolute', bottom: -px(50), left: -px(50), width: px(200), height: px(200), borderRadius: px(100), backgroundColor: t.coral, opacity: 0.25 }} />
          	<View style={{ alignItems: 'center' }}>
            	{gimnasio.logoUrl ? <Image source={{ uri: gimnasio.logoUrl }} style={{ width: px(54), height: px(54), borderRadius: px(14) }} resizeMode="contain" /> : null}
            	<Text style={{ color: t.textPrimary, fontSize: px(15), fontWeight: '800', marginTop: px(6), textAlign: 'center' }}>{gimnasio.nombre}</Text>
          	</View>
          	<View style={{ alignItems: 'center' }}>
            	<Text style={{ color: t.textPrimary, fontSize: px(27), fontWeight: '900', textAlign: 'center' }}>{emojiLogro(stats.racha) + ' ' + fraseLogro(stats.racha)}</Text>
            	<Text style={{ color: t.textSecondary, fontSize: px(13), fontWeight: '600', marginTop: px(4) }}>Hoy entrené y no me detengo</Text>
          	</View>
          	<AnilloLogro t={t} valor={stats.visitasMes} meta={META_VISITAS} size={px(176)}>
            	<Text style={{ fontSize: px(30) }}>{emojiLogro(stats.racha)}</Text>
            	<Text style={{ color: t.primary, fontSize: px(54), fontWeight: '900', lineHeight: px(58) }}>{stats.racha}</Text>
            	<Text style={{ color: t.textSecondary, fontSize: px(12), fontWeight: '700' }}>{stats.racha === 1 ? 'día de racha' : 'días de racha'}</Text>
          	</AnilloLogro>
          	<View style={{ backgroundColor: t.surface, borderRadius: px(18), paddingVertical: px(9), paddingHorizontal: px(16), alignItems: 'center' }}>
            	<Text style={{ color: t.textPrimary, fontSize: px(15), fontWeight: '800' }}>{'🎯 ' + stats.visitasMes + ' de ' + META_VISITAS + ' visitas del mes'}</Text>
          	</View>
          	<View style={{ alignItems: 'center' }}>
            	{redes.hashtag ? <Text style={{ color: t.primary, fontSize: px(17), fontWeight: '900' }}>{'#' + redes.hashtag}</Text> : null}
            	{redes.instagram ? <Text style={{ color: t.textSecondary, fontSize: px(12), fontWeight: '600', marginTop: px(2) }}>{'@' + redes.instagram}</Text> : null}
            	<Text style={{ color: t.textPrimary, fontSize: px(12), fontWeight: '700', marginTop: px(4) }}>¡Sumate y entrená con nosotros!</Text>
          	</View>
        	</LinearGradient>
      	</View>
      	<View style={{ width: anchoLogro, marginTop: 14, gap: 8 }}>
        	<View style={{ flexDirection: 'row', gap: 8 }}>
          	{Platform.OS === 'android' ? (
            	<Pressable onPress={historiaDirecta} style={{ flex: 1, backgroundColor: t.primary, borderRadius: 14, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' }}>
              	<Text style={{ color: t.onPrimary, fontWeight: '800', fontSize: 13, textAlign: 'center' }}>📸 Historia Instagram</Text>
            	</Pressable>
          	) : null}
          	<Pressable onPress={compartirImagen} style={{ flex: 1, backgroundColor: t.primaryBg, borderRadius: 14, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' }}>
            	<Text style={{ color: t.primary, fontWeight: '800', fontSize: 13, textAlign: 'center' }}>↗ Compartir imagen</Text>
          	</Pressable>
        	</View>
        	<Pressable onPress={() => setVerLogro(false)} style={{ borderWidth: 1.5, borderColor: t.primary, borderRadius: 14, padding: 11, alignItems: 'center' }}>
          	<Text style={{ color: t.primary, fontWeight: '700' }}>Cerrar</Text>
        	</Pressable>
      	</View>
    	</LinearGradient>
  	</Modal>
  	</ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  hello: { fontSize: 22, fontWeight: '800' },
  avatar: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  card: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  semana: { flexDirection: 'row', alignItems: 'flex-end', height: 72 },
  banner: { borderRadius: 18, padding: 16, marginBottom: 14 },
  boton: { borderRadius: 18, padding: 15, alignItems: 'center', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  atajo: {
    width: '31%',
    flexGrow: 1,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
});
