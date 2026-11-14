import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const FOTO_IMPARABLE = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900';
const FOTO_EPICO = 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=900';
const FOTO_FUERZA = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=900';

export default function TarjetasRecord({ modelo, record, gimnasio, nombreSocio, fotoCustom }) {
  const gymNombre = gimnasio?.nombre || 'EnerGym';
  const gymIg = gimnasio?.instagram ? '@' + gimnasio.instagram.replace(/^@/, '') : '@' + gymNombre.replace(/\s+/g, '');
  const gymHash = '#' + (gimnasio?.hashtag || gymNombre.replace(/\s+/g, ''));
  const tieneFotoPropia = !!fotoCustom;

  if (modelo === 'imparable') {
    const bgUri = fotoCustom || FOTO_IMPARABLE;
    const grad = tieneFotoPropia
      ? ['rgba(0, 0, 0, 0.15)', 'rgba(0, 0, 0, 0.25)', 'rgba(6, 8, 20, 0.85)']
      : ['rgba(124, 58, 237, 0.42)', 'rgba(6, 182, 212, 0.22)', 'rgba(6, 8, 20, 0.94)'];
    return (
      <View collapsable={false} style={styles.cardBase}>
        <Image key={bgUri} source={{ uri: bgUri }} style={styles.bgImg} resizeMode="cover" />
        <LinearGradient colors={grad} style={styles.overlay}>
          <View style={styles.topRowRight}>
            <View style={styles.musicPill}>
              <View style={styles.musicIcon}><Text style={{ fontSize: 10, color: '#FFF' }}>ılı</Text></View>
              <View>
                <Text style={styles.musicTop}>Reproducción</Text>
                <Text style={styles.musicSub}>{gymNombre}</Text>
              </View>
            </View>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.impNuevo}>NUEVO{'\n'}RÉCORD</Text>
            <Text style={styles.impEjercicio}>{record.nombre.toUpperCase()}</Text>
            <Text style={styles.impPeso}>{record.peso} kg</Text>
            <Text style={styles.impReps}>{record.reps}</Text>
            <Text style={styles.impFrase}>LA DISCIPLINA SUPERA AL TALENTO.{'\n'}¿Y VOS QUÉ ESPERÁS? 🔥</Text>
          </View>
          <View style={styles.impFooter}>
            <Text style={styles.footerText}>📷 {gymIg}</Text>
            <View style={styles.impCtaPill}><Text style={styles.impCtaTxt}>¡Entrená conmigo!</Text></View>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (modelo === 'epico') {
    const bgUri = fotoCustom || FOTO_EPICO;
    const grad = tieneFotoPropia
      ? ['rgba(0, 0, 0, 0.2)', 'rgba(0, 0, 0, 0.25)', 'rgba(5, 7, 17, 0.85)']
      : ['rgba(46, 16, 101, 0.78)', 'rgba(15, 23, 42, 0.9)', '#050711'];
    return (
      <View collapsable={false} style={styles.cardBase}>
        <Image key={bgUri} source={{ uri: bgUri }} style={[styles.bgImg, { opacity: tieneFotoPropia ? 1 : 0.55 }]} resizeMode="cover" />
        <LinearGradient colors={grad} style={styles.overlay}>
          <Text style={styles.epicoHeader}>RÉCORD PERSONAL ⚡</Text>
          <View style={[styles.epicoGlassBox, tieneFotoPropia && { backgroundColor: 'rgba(15, 23, 42, 0.45)' }]}>
            <Text style={styles.epicoEj}>{record.nombre.toUpperCase()}</Text>
            <Text style={styles.epicoPeso}>• {record.peso} kg</Text>
            <View style={styles.epicoRepsBadge}><Text style={styles.epicoReps}>{record.reps.toUpperCase()}</Text></View>
          </View>
          <Text style={styles.epicoFrase}>CADA REPETICIÓN TE ACERCA{'\n'}A LA MEJOR VERSIÓN DE VOS.{'\n'}NO HAY EXCUSAS 🏆</Text>
          <View style={{ alignItems: 'center', width: '100%' }}>
            <Text style={styles.epicoGym}>{gymNombre}</Text>
            <View style={styles.epicoSocialRow}>
              <Text style={styles.footerText}>📷 {gymIg}</Text>
              <Text style={[styles.footerText, { color: '#38BDF8' }]}>{gymHash}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (modelo === 'fuerza') {
    const bgUri = fotoCustom || FOTO_FUERZA;
    const grad = tieneFotoPropia
      ? ['rgba(0, 0, 0, 0.15)', 'rgba(0, 0, 0, 0.3)', 'rgba(9, 9, 11, 0.85)']
      : ['rgba(24, 15, 5, 0.5)', 'rgba(12, 10, 9, 0.85)', '#09090B'];
    return (
      <View collapsable={false} style={styles.cardBase}>
        <Image key={bgUri} source={{ uri: bgUri }} style={styles.bgImg} resizeMode="cover" />
        <LinearGradient colors={grad} style={styles.overlay}>
          <View style={styles.fuerzaTopBadge}><Text style={styles.fuerzaTopTxt}>¡SUPERÁ AL RIVAL DE VOS MISMO! 🦾</Text></View>
          <View style={styles.cautionTape}>
            <View style={styles.cautionStripe} />
            <Text style={styles.fuerzaPeso}>{record.peso} KG</Text>
            <Text style={styles.fuerzaEj}>{record.nombre.toUpperCase()} · {record.reps.toUpperCase()}</Text>
            <View style={styles.cautionStripe} />
          </View>
          <Text style={styles.fuerzaFrase}>EL DOLOR ES TEMPORAL,{'\n'}EL RÉCORD ES PARA{'\n'}SIEMPRE 💪</Text>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.fuerzaRacha}>🔥 Superación constante · {nombreSocio} 🔥</Text>
            <Text style={styles.fuerzaSub}>Sumate a entrenar en {gymNombre}</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View collapsable={false} style={styles.cardBase}>
      {tieneFotoPropia ? (
        <Image key={fotoCustom} source={{ uri: fotoCustom }} style={styles.bgImg} resizeMode="cover" />
      ) : null}
      <LinearGradient
        colors={tieneFotoPropia ? ['rgba(255,255,255,0.2)', 'rgba(237,233,254,0.82)'] : ['#C7D2FE', '#EDE9FE', '#F5F3FF']}
        style={[styles.cardBase, styles.clasicoWrap]}
      >
        <View style={styles.clasicoLogo}><Text style={styles.clasicoLogoTxt}>{gymNombre.toUpperCase()}</Text></View>
        <Text style={styles.clasicoTag}>NUEVO RÉCORD</Text>
        <Text style={styles.clasicoEj}>{record.nombre}</Text>
        <Text style={styles.clasicoPeso}>{record.peso} kg</Text>
        <Text style={styles.clasicoReps}>{record.reps}</Text>
        <Text style={styles.clasicoMeta}>{record.fecha + ' · ' + gymNombre + ' · ' + nombreSocio}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  cardBase: { width: '100%', height: '100%', backgroundColor: '#090D16', overflow: 'hidden' },
  bgImg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  overlay: { flex: 1, paddingVertical: 26, paddingHorizontal: 18, justifyContent: 'space-between', alignItems: 'center' },
  topRowRight: { width: '100%', alignItems: 'flex-end' },
  musicPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.92)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  musicIcon: { width: 20, height: 20, borderRadius: 6, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center' },
  musicTop: { color: '#1E293B', fontSize: 9, fontWeight: '800' },
  musicSub: { color: '#64748B', fontSize: 8, fontWeight: '700' },
  impNuevo: { color: '#FFFFFF', fontSize: 34, fontWeight: '900', textAlign: 'center', lineHeight: 36, textShadowColor: '#000', textShadowRadius: 12 },
  impEjercicio: { color: '#22D3EE', fontSize: 15, fontWeight: '900', letterSpacing: 1.2, marginTop: 6, textAlign: 'center', textShadowColor: '#000', textShadowRadius: 8 },
  impPeso: { color: '#FFFFFF', fontSize: 50, fontWeight: '900', marginTop: 8, textShadowColor: '#000', textShadowRadius: 14 },
  impReps: { color: '#F8FAFC', fontSize: 14, fontWeight: '800', textShadowColor: '#000', textShadowRadius: 8 },
  impFrase: { color: '#F8FAFC', fontSize: 12, fontWeight: '900', textAlign: 'center', marginTop: 14, lineHeight: 17, textShadowColor: '#000', textShadowRadius: 8 },
  impFooter: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.25)', paddingTop: 10 },
  footerText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', textShadowColor: '#000', textShadowRadius: 6 },
  impCtaPill: { borderWidth: 1, borderColor: '#22D3EE', backgroundColor: 'rgba(6, 182, 212, 0.35)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  impCtaTxt: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  epicoHeader: { color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 1.5, marginTop: 4, textShadowColor: '#000', textShadowRadius: 10 },
  epicoGlassBox: { width: '96%', backgroundColor: 'rgba(15, 23, 42, 0.78)', borderRadius: 20, borderWidth: 1.5, borderColor: '#38BDF8', paddingVertical: 18, paddingHorizontal: 12, alignItems: 'center' },
  epicoEj: { color: '#F8FAFC', fontSize: 15, fontWeight: '900', textAlign: 'center', textShadowColor: '#000', textShadowRadius: 8 },
  epicoPeso: { color: '#FFFFFF', fontSize: 42, fontWeight: '900', marginVertical: 4, textShadowColor: '#000', textShadowRadius: 10 },
  epicoRepsBadge: { backgroundColor: 'rgba(168, 85, 247, 0.45)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: '#C084FC' },
  epicoReps: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  epicoFrase: { color: '#FFFFFF', fontSize: 13, fontWeight: '900', textAlign: 'center', lineHeight: 19, textShadowColor: '#000', textShadowRadius: 10 },
  epicoGym: { color: '#FFFFFF', fontSize: 14, fontWeight: '900', marginBottom: 4, textShadowColor: '#000', textShadowRadius: 8 },
  epicoSocialRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  fuerzaTopBadge: { backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#F59E0B' },
  fuerzaTopTxt: { color: '#FEF3C7', fontSize: 11, fontWeight: '900' },
  cautionTape: { width: '108%', backgroundColor: '#F59E0B', paddingVertical: 12, alignItems: 'center', transform: [{ rotate: '-4deg' }], borderTopWidth: 3, borderBottomWidth: 3, borderColor: '#18181B' },
  cautionStripe: { width: '100%', height: 3, backgroundColor: 'rgba(0,0,0,0.35)', marginVertical: 2 },
  fuerzaPeso: { color: '#09090B', fontSize: 46, fontWeight: '900', lineHeight: 50 },
  fuerzaEj: { color: '#09090B', fontSize: 13, fontWeight: '900' },
  fuerzaFrase: { color: '#FFFFFF', fontSize: 15, fontWeight: '900', textAlign: 'center', lineHeight: 21, textShadowColor: '#000', textShadowRadius: 10 },
  fuerzaRacha: { color: '#FBBF24', fontSize: 12, fontWeight: '900', textShadowColor: '#000', textShadowRadius: 8 },
  fuerzaSub: { color: '#FFFFFF', fontSize: 11, fontWeight: '700', marginTop: 3, textShadowColor: '#000', textShadowRadius: 8 },
  clasicoWrap: { paddingVertical: 36, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  clasicoLogo: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#6366F1', marginBottom: 14, backgroundColor: 'rgba(255,255,255,0.8)' },
  clasicoLogoTxt: { color: '#4F46E5', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  clasicoTag: { color: '#5B21B6', fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  clasicoEj: { color: '#1E1B4B', fontSize: 22, fontWeight: '900', marginTop: 6, textAlign: 'center' },
  clasicoPeso: { color: '#312E81', fontSize: 48, fontWeight: '900', marginVertical: 8 },
  clasicoReps: { color: '#4338CA', fontSize: 15, fontWeight: '800' },
  clasicoMeta: { color: '#312E81', fontSize: 11, marginTop: 18, fontWeight: '700', textAlign: 'center' },
});
