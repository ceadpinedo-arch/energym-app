import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HORARIOS = ['Mañana 7–10', 'Tarde 17–20', 'Noche 20–22'];

export default function CompaneroScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(true);
  const [misHorarios, setMisHorarios] = useState(['Tarde 17–20', 'Noche 20–22']);
  const [invitados, setInvitados] = useState({ c2: true });
  const [estadoNico, setEstadoNico] = useState('pendiente');

  const toggleHorario = (h) => {
    setMisHorarios((prev) => prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h]);
  };

  return (
    <LinearGradient colors={['#060814', '#0B1228', '#071927']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={[styles.wrap, { paddingTop: insets.top + 12, paddingBottom: 40 }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backTxt}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>🏋️ Buscar compañero</Text>
        </View>

        <View style={styles.cardSwitch}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={styles.cardTitulo}>Aparecer en la búsqueda</Text>
            <Text style={styles.cardSub}>Solo se muestra tu apodo, horarios y objetivo.</Text>
          </View>
          <Switch
            value={visible}
            onValueChange={setVisible}
            trackColor={{ false: '#334155', true: '#7C3AED' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <Text style={styles.seccion}>Mis horarios</Text>
        <View style={styles.horariosRow}>
          {HORARIOS.map((h) => {
            const activo = misHorarios.includes(h);
            return (
              <Pressable
                key={h}
                onPress={() => toggleHorario(h)}
                style={[styles.chipHorario, activo && styles.chipHorarioActivo]}
              >
                <Text style={[styles.chipTxt, activo && styles.chipTxtActivo]}>{h}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.seccion}>Con horarios en común</Text>

        {/* Tarjeta Lauti */}
        <View style={styles.userCard}>
          <View style={styles.userTop}>
            <View style={[styles.avatar, { backgroundColor: '#6366F1' }]}>
              <Text style={styles.avatarTxt}>L</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>Lauti</Text>
              <Text style={styles.userMeta}>Hipertrofia · Intermedio</Text>
              <Text style={styles.coincidenTxt}>Coinciden: lun, mié, vie · 18–20 hs</Text>
            </View>
          </View>
          <Pressable
            onPress={() => setInvitados((p) => ({ ...p, c1: true }))}
            disabled={!!invitados.c1}
            style={[styles.btnPrimario, invitados.c1 && styles.btnEnviado]}
          >
            <Text style={[styles.btnPrimarioTxt, invitados.c1 && { color: '#94A3B8' }]}>
              {invitados.c1 ? 'Invitación enviada' : 'Invitar a entrenar'}
            </Text>
          </Pressable>
        </View>

        {/* Tarjeta Cami */}
        <View style={styles.userCard}>
          <View style={styles.userTop}>
            <View style={[styles.avatar, { backgroundColor: '#7C3AED' }]}>
              <Text style={styles.avatarTxt}>C</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>Cami</Text>
              <Text style={styles.userMeta}>Bajar de peso · Principiante</Text>
              <Text style={styles.coincidenTxt}>Coinciden: mar, jue · 20–22 hs</Text>
            </View>
          </View>
          <View style={[styles.btnPrimario, styles.btnEnviado]}>
            <Text style={[styles.btnPrimarioTxt, { color: '#94A3B8' }]}>Invitación enviada</Text>
          </View>
        </View>

        {/* Tarjeta Nico te invito */}
        {estadoNico !== 'rechazado' && (
          <View style={[styles.userCard, { borderColor: 'rgba(139, 92, 246, 0.5)' }]}>
            <View style={styles.userTop}>
              <View style={[styles.avatar, { backgroundColor: '#4F46E5' }]}>
                <Text style={styles.avatarTxt}>N</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>Nico te invitó</Text>
                <Text style={styles.userMeta}>Fuerza · Avanzado</Text>
                <Text style={styles.coincidenTxt}>Coinciden: lun, mié · 17–19 hs</Text>
              </View>
            </View>
            {estadoNico === 'aceptado' ? (
              <View style={[styles.btnPrimario, { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderWidth: 1, borderColor: '#10B981' }]}>
                <Text style={{ color: '#34D399', fontWeight: '800', fontSize: 14 }}>¡Conectados para entrenar! 💪</Text>
              </View>
            ) : (
              <View style={styles.dualBtnRow}>
                <Pressable onPress={() => setEstadoNico('aceptado')} style={[styles.btnPrimario, { flex: 1, marginTop: 0 }]}>
                  <Text style={styles.btnPrimarioTxt}>Aceptar</Text>
                </Pressable>
                <Pressable onPress={() => setEstadoNico('rechazado')} style={styles.btnSecundario}>
                  <Text style={styles.btnSecundarioTxt}>Ahora no</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}

        <Text style={styles.footerNota}>
          El contacto se comparte solo si los dos aceptan. Podés bloquear o reportar desde cada perfil.
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  backTxt: { color: '#FFF', fontSize: 24, fontWeight: '700', marginTop: -2 },
  headerTitle: { color: '#F8FAFC', fontSize: 20, fontWeight: '900' },
  cardSwitch: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(18, 25, 46, 0.85)', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: 'rgba(148,163,184,0.22)' },
  cardTitulo: { color: '#F8FAFC', fontSize: 15, fontWeight: '800' },
  cardSub: { color: '#94A3B8', fontSize: 12, marginTop: 4 },
  seccion: { color: '#94A3B8', fontSize: 13, fontWeight: '700', marginTop: 20, marginBottom: 10 },
  horariosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipHorario: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(148,163,184,0.28)', backgroundColor: 'rgba(15, 23, 42, 0.7)' },
  chipHorarioActivo: { backgroundColor: 'rgba(99, 102, 241, 0.28)', borderColor: '#818CF8' },
  chipTxt: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },
  chipTxtActivo: { color: '#FFFFFF', fontWeight: '800' },
  userCard: { backgroundColor: 'rgba(18, 25, 46, 0.82)', borderRadius: 22, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(148,163,184,0.2)' },
  userTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
  userName: { color: '#F8FAFC', fontSize: 16, fontWeight: '800' },
  userMeta: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  coincidenTxt: { color: '#34D399', fontSize: 12, fontWeight: '700', marginTop: 3 },
  btnPrimario: { backgroundColor: '#6366F1', borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  btnEnviado: { backgroundColor: 'rgba(15, 23, 42, 0.75)', borderWidth: 1, borderColor: 'rgba(148,163,184,0.2)' },
  btnPrimarioTxt: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  dualBtnRow: { flexDirection: 'row', gap: 10 },
  btnSecundario: { flex: 1, backgroundColor: 'rgba(30, 41, 59, 0.9)', borderRadius: 14, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(148,163,184,0.25)' },
  btnSecundarioTxt: { color: '#CBD5E1', fontSize: 14, fontWeight: '700' },
  footerNota: { color: '#64748B', fontSize: 12, lineHeight: 18, marginTop: 8, textAlign: 'center' },
});
