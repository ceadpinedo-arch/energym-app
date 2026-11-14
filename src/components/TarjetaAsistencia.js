import React, { forwardRef } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line } from 'react-native-svg';

const FOTOS = {
  cyber: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900',
  fuego: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=900',
  bestia: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=900',
};

const FRASES = {
  cyber: 'LA DISCIPLINA DE HOY ES TU FUERZA DE MAÑANA. ⚡',
  fuego: 'UN DÍA MÁS QUE SUMA. ¡NO SE NEGOCIA EL ENTRENO! 🔥',
  bestia: 'CADA VISITA TE ACERCA A TU MEJOR VERSIÓN. 🏆',
};

const TarjetaAsistencia = forwardRef(({
  estilo = 'cyber',
  racha = 1,
  visitasMes = 1,
  metaVisitas = 12,
  emoji = '💪',
  frase = '¡Buen comienzo!',
  gymNombre = 'EnerGym',
  gymIg = '',
  nombreSocio = 'Socio',
  fotoCustom = null,
}, ref) => {
  const bgUri = fotoCustom || FOTOS[estilo] || FOTOS.cyber;
  const tieneFoto = !!fotoCustom;
  const pct = Math.min(100, Math.round((visitasMes / Math.max(1, metaVisitas)) * 100));
  const igTag = gymIg ? '@' + gymIg.replace(/^@/, '') : '@' + gymNombre.replace(/\s+/g, '');
  const hoyStr = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }).toUpperCase();

  const colorAcento = estilo === 'fuego' ? '#F59E0B' : estilo === 'bestia' ? '#22D3EE' : '#A855F7';
  const colorSec = estilo === 'fuego' ? '#EF4444' : estilo === 'bestia' ? '#38BDF8' : '#22D3EE';

  const gradOverlay = tieneFoto
    ? ['rgba(6, 8, 20, 0.25)', 'rgba(6, 8, 20, 0.35)', 'rgba(6, 8, 20, 0.9)']
    : estilo === 'fuego'
    ? ['rgba(24, 10, 5, 0.55)', 'rgba(15, 10, 10, 0.82)', '#09090B']
    : estilo === 'bestia'
    ? ['rgba(6, 24, 44, 0.6)', 'rgba(15, 23, 42, 0.85)', '#050711']
    : ['rgba(76, 29, 149, 0.52)', 'rgba(15, 23, 42, 0.84)', '#060814'];

  const totalTicks = 48;
  const activosTicks = Math.max(6, Math.round((pct / 100) * totalTicks));
  const ticks = Array.from({ length: totalTicks }, (_, i) => {
    const angle = (i * 360) / totalTicks - 90;
    const rad = (angle * Math.PI) / 180;
    const rIn = 62;
    const rOut = i % 4 === 0 ? 74 : 70;
    return {
      x1: 80 + rIn * Math.cos(rad),
      y1: 80 + rIn * Math.sin(rad),
      x2: 80 + rOut * Math.cos(rad),
      y2: 80 + rOut * Math.sin(rad),
      activo: i < activosTicks,
    };
  });

  return (
    <View ref={ref} collapsable={false} style={styles.cardBase}>
      <Image key={bgUri} source={{ uri: bgUri }} style={styles.bgImg} resizeMode="cover" />
      <LinearGradient colors={gradOverlay} style={styles.overlay}>
        {/* Encabezado Superior */}
        <View style={styles.topBar}>
          <View style={[styles.gymBadge, { borderColor: colorAcento }]}>
            <Text style={[styles.gymBadgeTxt, { color: '#FFFFFF' }]}>⚡ {gymNombre.toUpperCase()}</Text>
          </View>
          <View style={styles.statusPill}>
            <View style={styles.dotVerde} />
            <Text style={styles.statusTxt}>ENTRENO OK · {hoyStr}</Text>
          </View>
        </View>

        {/* Título Motivador */}
        <View style={{ alignItems: 'center', marginTop: 4 }}>
          <Text style={[styles.subTag, { color: colorSec }]}>PRESENTE EN EL GYM</Text>
          <Text style={[styles.frasePrincipal, { textShadowColor: colorAcento }]}>
            {emoji} {frase.toUpperCase()}
          </Text>
        </View>

        {/* Anillo Sci-Fi Neón Central */}
        <View style={styles.ringWrap}>
          <Svg width={160} height={160} viewBox="0 0 160 160">
            <Circle cx="80" cy="80" r="54" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="rgba(6, 8, 20, 0.65)" />
            {ticks.map((t, idx) => (
              <Line
                key={idx}
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke={t.activo ? colorSec : 'rgba(148, 163, 184, 0.25)'}
                strokeWidth={idx % 4 === 0 ? '3' : '2'}
                strokeLinecap="round"
              />
            ))}
          </Svg>
          <View style={styles.ringCenter}>
            <Text style={styles.ringEmoji}>🔥</Text>
            <Text style={[styles.ringNumero, { textShadowColor: colorSec }]}>{racha}</Text>
            <Text style={styles.ringLabel}>{racha === 1 ? 'DÍA DE RACHA' : 'DÍAS DE RACHA'}</Text>
          </View>
        </View>

        {/* Tarjeta Glassmorphism de Progreso Mensual */}
        <View style={[styles.glassBox, { borderColor: colorSec }, tieneFoto && { backgroundColor: 'rgba(15, 23, 42, 0.55)' }]}>
          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statVal}>🎯 {visitasMes} / {metaVisitas}</Text>
              <Text style={styles.statSub}>VISITAS DEL MES</Text>
            </View>
            <View style={styles.dividerVert} />
            <View style={styles.statCol}>
              <Text style={[styles.statVal, { color: colorSec }]}>{pct}%</Text>
              <Text style={styles.statSub}>META MENSUAL</Text>
            </View>
          </View>

          <View style={styles.barTrack}>
            <LinearGradient
              colors={[colorAcento, colorSec]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.barFill, { width: Math.max(8, pct) + '%' }]}
            />
          </View>
        </View>

        {/* Frase y Pie de Redes */}
        <View style={{ alignItems: 'center', width: '100%' }}>
          <Text style={styles.lemaTxt}>{FRASES[estilo] || FRASES.cyber}</Text>
          <View style={styles.footerRow}>
            <Text style={styles.footerTxt}>📷 {igTag}</Text>
            <Text style={[styles.footerTxt, { color: colorSec }]}>#{gymNombre.replace(/\s+/g, '')}</Text>
            <View style={[styles.ctaPill, { borderColor: colorAcento }]}>
              <Text style={styles.ctaTxt}>¡Entrená hoy!</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
});

const styles = StyleSheet.create({
  cardBase: { width: '100%', height: '100%', borderRadius: 24, overflow: 'hidden', backgroundColor: '#060814' },
  bgImg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  overlay: { flex: 1, paddingVertical: 20, paddingHorizontal: 16, justifyContent: 'space-between', alignItems: 'center' },
  topBar: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  gymBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1, backgroundColor: 'rgba(15, 23, 42, 0.75)' },
  gymBadgeTxt: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(15, 23, 42, 0.8)', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(52, 211, 153, 0.4)' },
  dotVerde: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  statusTxt: { color: '#E2E8F0', fontSize: 9, fontWeight: '800' },
  subTag: { fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  frasePrincipal: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', textAlign: 'center', marginTop: 3, textShadowRadius: 12 },
  ringWrap: { width: 160, height: 160, alignItems: 'center', justifyContent: 'center' },
  ringCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  ringEmoji: { fontSize: 18, marginBottom: -4 },
  ringNumero: { color: '#FFFFFF', fontSize: 42, fontWeight: '900', lineHeight: 46, textShadowRadius: 14 },
  ringLabel: { color: '#CBD5E1', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  glassBox: { width: '96%', backgroundColor: 'rgba(15, 23, 42, 0.82)', borderRadius: 18, borderWidth: 1.2, paddingVertical: 12, paddingHorizontal: 14 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 10 },
  statCol: { alignItems: 'center' },
  statVal: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  statSub: { color: '#94A3B8', fontSize: 9, fontWeight: '800', marginTop: 2, letterSpacing: 0.5 },
  dividerVert: { width: 1, height: 26, backgroundColor: 'rgba(148, 163, 184, 0.25)' },
  barTrack: { width: '100%', height: 8, borderRadius: 4, backgroundColor: 'rgba(255, 255, 255, 0.12)', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  lemaTxt: { color: '#F8FAFC', fontSize: 11, fontWeight: '900', textAlign: 'center', lineHeight: 16, marginBottom: 10, textShadowColor: '#000', textShadowRadius: 8 },
  footerRow: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.18)', paddingTop: 8 },
  footerTxt: { color: '#E2E8F0', fontSize: 10, fontWeight: '800' },
  ctaPill: { borderWidth: 1, backgroundColor: 'rgba(124, 58, 237, 0.3)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  ctaTxt: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
});

export default TarjetaAsistencia;
