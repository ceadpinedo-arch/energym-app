import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, FlatList, Image, Alert, StyleSheet, ActivityIndicator, Modal, Linking, TextInput, Keyboard } from 'react-native';
import { API_URL } from '../config';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../theme/ThemeContext';
import Cronometro from '../components/Cronometro';
import EjercicioItem from '../components/EjercicioItem';
import Contador from '../components/Contador';

const GRUPOS = ['TODOS', 'PECHO', 'ESPALDA', 'PIERNAS', 'BRAZOS', 'HOMBROS', 'ABDOMEN'];
const DIAS = ['Día A', 'Día B', 'Día C'];
const EJERCICIOS_LOCALES = [
  { id: '1', nombre: 'Press de Banca', grupo: 'PECHO', descripcion: '3 series x 10 repeticiones', imagenUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500' },
  { id: '2', nombre: 'Sentadillas', grupo: 'PIERNAS', descripcion: '4 series x 8 repeticiones', imagenUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500' },
  { id: '3', nombre: 'Dominadas', grupo: 'ESPALDA', descripcion: '3 series al fallo', imagenUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500' },
  { id: '4', nombre: 'Curl de Bíceps', grupo: 'BRAZOS', descripcion: '3 series x 12 repeticiones', imagenUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500' },
  { id: '5', nombre: 'Press Militar', grupo: 'HOMBROS', descripcion: '3 series x 10 repeticiones', imagenUrl: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=500' }
];

export default function BibliotecaScreen({ route }) {
  const { token } = route.params;
  const t = useAppTheme();
  const styles = makeStyles(t);
  const insets = useSafeAreaInsets();
  const [ejercicios, setEjercicios] = useState(EJERCICIOS_LOCALES);
  const [grupo, setGrupo] = useState('TODOS');
  const [seleccionados, setSeleccionados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [rutinaVisible, setRutinaVisible] = useState(false);
  const [marcas, setMarcas] = useState({});
  const [diaFiltro, setDiaFiltro] = useState('TODOS');
  const [ultimos, setUltimos] = useState({});
  const [tecladoAlto, setTecladoAlto] = useState(0);

  useEffect(() => {
    const a = Keyboard.addListener('keyboardDidShow', (ev) => setTecladoAlto(ev.endCoordinates.height));
    const b = Keyboard.addListener('keyboardDidHide', () => setTecladoAlto(0));
    return () => { a.remove(); b.remove(); };
  }, []);

  const setMarca = (id, campo, v) => setMarcas((prev) => ({ ...prev, [id]: { ...prev[id], [campo]: v } }));

  const cargarUltimos = async () => {
    try {
      const res = await fetch(API_URL + '/api/entrenos/ultimos', { headers: { Authorization: 'Bearer ' + token } });
      const d = await res.json();
      if (d && typeof d === 'object' && !Array.isArray(d)) setUltimos(d);
    } catch (e) {}
  };

  const guardarPlan = async () => {
    try {
      const items = seleccionados.map((ejercicioId) => ({
        ejercicioId, dia: marcas[ejercicioId]?.dia || null,
        series: Math.min(50, parseInt(marcas[ejercicioId]?.series, 10) || 4),
        repeticiones: String(marcas[ejercicioId]?.reps || '10-12').slice(0, 20),
      }));
      await fetch(API_URL + '/api/rutinas/me', {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ items }),
      });
    } catch (e) {}
  };

  const guardarEntreno = async () => {
    const registros = Object.entries(marcas)
      .filter(([id, m]) => seleccionados.includes(id) && m && m.kg)
      .map(([ejercicioId, m]) => ({
        ejercicioId, peso: Number(String(m.kg).replace(',', '.')) || 0,
        series: parseInt(m.series, 10) || 0, repeticiones: parseInt(m.reps, 10) || 0,
      }));
    if (registros.length === 0) { Alert.alert('Atención', 'Cargá el peso de al menos un ejercicio.'); return; }
    try {
      const res = await fetch(API_URL + '/api/entrenos', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ registros }),
      });
      if (res.ok) {
        Alert.alert('¡Listo!', 'Entrenamiento guardado.');
        setMarcas((prev) => { const n2 = {}; Object.keys(prev).forEach((k) => { n2[k] = { ...prev[k], kg: '' }; }); return n2; });
        guardarPlan(); cargarUltimos();
      } else { Alert.alert('Error', 'No se pudo guardar el entrenamiento.'); }
    } catch (e) { Alert.alert('Error', 'No se pudo guardar el entrenamiento.'); }
  };

  useEffect(() => {
    setCargando(true);
    fetch(API_URL + '/api/ejercicios', { headers: { Authorization: 'Bearer ' + token } })
      .then((r) => r.json()).then((d) => { if (Array.isArray(d) && d.length > 0) setEjercicios(d); })
      .catch(() => {}).finally(() => setCargando(false));
    fetch(API_URL + '/api/rutinas/me', { headers: { Authorization: 'Bearer ' + token } })
      .then((r) => r.json()).then((data) => {
        if (data && Array.isArray(data.items)) {
          setSeleccionados(data.items.map((it) => String(it.ejercicioId)));
          setMarcas((prev) => {
            const next = { ...prev };
            data.items.forEach((it) => {
              const id = String(it.ejercicioId);
              next[id] = { ...next[id], dia: it.dia || null, series: it.series != null ? String(it.series) : '', reps: it.repeticiones || '' };
            });
            return next;
          });
        }
      }).catch(() => {});
  }, []);

  const toggle = (id) => {
    const idStr = String(id);
    setSeleccionados((prev) => prev.includes(idStr) ? prev.filter((i) => i !== idStr) : [...prev, idStr]);
  };

  const abrirRutina = () => {
    if (seleccionados.length === 0) { Alert.alert('Atención', 'Seleccioná al menos un ejercicio para tu rutina.'); return; }
    setRutinaVisible(true); cargarUltimos(); guardarPlan();
  };

  const ejerciciosFiltrados = ejercicios.filter((e) => {
    if (grupo === 'TODOS') return true;
    const g = (e.grupo || e.grupoMuscular || '').toUpperCase();
    const MAPA = { BICEPS: 'BRAZOS', TRICEPS: 'BRAZOS', HOMBRO: 'HOMBROS', ABDOMINALES: 'ABDOMEN' };
    return (MAPA[g] || g) === grupo.toUpperCase();
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <LinearGradient colors={t.gradient} style={StyleSheet.absoluteFill} />
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Ejercicios</Text>
            <Contador n={seleccionados.length} style={styles.subtitle} />
          </View>
          <Pressable onPress={abrirRutina} style={styles.saveBtnWrap}>
            <LinearGradient colors={['#8B5CF6', '#06B6D4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>Ver rutina</Text>
            </LinearGradient>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
          {GRUPOS.map((g) => (
            <Pressable key={g} onPress={() => setGrupo(g)} style={[styles.filterChip, grupo === g && styles.filterChipActive]}>
              <Text style={grupo === g ? styles.filterTextActive : styles.filterText}>{g}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {cargando ? (
          <ActivityIndicator size="large" color={t.primary} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            key={grupo} data={ejerciciosFiltrados}
            keyExtractor={(item, index) => (item && item.id ? String(item.id) : String(index))}
            contentContainerStyle={{ paddingBottom: 110 }}
            renderItem={({ item, index }) => (
              <EjercicioItem item={item} index={index} activo={seleccionados.includes(String(item.id))} onOpen={() => setDetalle(item)} onToggle={() => toggle(String(item.id))} />
            )}
          />
        )}

        <Modal visible={!!detalle} transparent animationType="fade" onRequestClose={() => setDetalle(null)}>
          <Pressable style={styles.modalFondo} onPress={() => setDetalle(null)}>
            <Pressable style={styles.modalCard} onPress={() => {}}>
              {detalle && (
                <>
                  <Image source={{ uri: detalle.imagenUrl || detalle.imagen || detalle.uri || detalle.url }} style={styles.modalImg} resizeMode="contain" />
                  <Text style={styles.modalTitulo}>{detalle.nombre}</Text>
                  <Text style={styles.modalDesc}>{detalle.descripcion}</Text>
                  {detalle.videoUrl ? (
                    <Pressable style={[styles.modalBtn, { backgroundColor: t.cyan }]} onPress={() => Linking.openURL(detalle.videoUrl)}>
                      <Text style={[styles.modalBtnText, { color: '#060814' }]}>▶ Ver video</Text>
                    </Pressable>
                  ) : null}
                  <Pressable style={styles.modalBtn} onPress={() => { toggle(String(detalle.id)); setDetalle(null); }}>
                    <Text style={styles.modalBtnText}>{seleccionados.includes(String(detalle.id)) ? 'Quitar de mi rutina' : 'Agregar a mi rutina'}</Text>
                  </Pressable>
                </>
              )}
            </Pressable>
          </Pressable>
        </Modal>

        <Modal visible={rutinaVisible} transparent animationType="slide" onRequestClose={() => { guardarPlan(); setRutinaVisible(false); }}>
          <View style={styles.modalFondo}>
            <View style={[styles.modalCard, { maxHeight: '92%' }]}>
              <Text style={styles.modalTitulo}>Mi rutina</Text>
              <Text style={styles.modalDesc}>{seleccionados.length} ejercicios seleccionados</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12, maxHeight: 42 }}>
                {['TODOS', ...DIAS, 'Sin día'].map((d) => (
                  <Pressable key={d} onPress={() => setDiaFiltro(d)} style={[styles.filterChip, diaFiltro === d && styles.filterChipActive]}>
                    <Text style={diaFiltro === d ? styles.filterTextActive : styles.filterText}>{d}</Text>
                  </Pressable>
                ))}
              </ScrollView>
              <ScrollView style={{ marginTop: 12, flexShrink: 1 }} contentContainerStyle={{ paddingBottom: 40 + tecladoAlto }} keyboardShouldPersistTaps="handled">
                {ejercicios.filter((e) => seleccionados.includes(String(e.id)) && (diaFiltro === 'TODOS' || (marcas[String(e.id)]?.dia || 'Sin día') === diaFiltro)).map((e) => {
                  const uri = e.imagenUrl || e.imagen || e.uri || e.url;
                  return (
                    <View key={String(e.id)} style={styles.rutinaRow}>
                      <View style={styles.rutinaTop}>
                        <View style={styles.rutinaImgWrap}>
                          {uri ? <Image source={{ uri }} style={styles.rutinaImg} resizeMode="cover" /> : <View style={[styles.rutinaImg, { alignItems: 'center', justifyContent: 'center' }]}><Text style={{ fontSize: 30 }}>💪</Text></View>}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.itemTitle}>{e.nombre}</Text>
                          <Text style={styles.itemDesc}>{e.descripcion}</Text>
                        </View>
                        <Pressable onPress={() => toggle(String(e.id))} hitSlop={10}><Text style={styles.rutinaQuitar}>✕</Text></Pressable>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                        <View style={styles.chipCampo}>
                          <Text style={styles.chipLabel}>Series</Text>
                          <TextInput style={styles.chipInput} placeholder="4" placeholderTextColor="rgba(255,255,255,0.4)" keyboardType="numeric" value={marcas[String(e.id)]?.series ?? ''} onChangeText={(v) => setMarca(String(e.id), 'series', v)} />
                        </View>
                        <View style={styles.chipCampo}>
                          <Text style={styles.chipLabel}>Repeticiones</Text>
                          <TextInput style={styles.chipInput} placeholder="10-12" placeholderTextColor="rgba(255,255,255,0.4)" keyboardType="numeric" value={marcas[String(e.id)]?.reps ?? ''} onChangeText={(v) => setMarca(String(e.id), 'reps', v)} />
                        </View>
                        <View style={styles.chipCampo}>
                          <Text style={styles.chipLabel}>Kg</Text>
                          <TextInput style={styles.chipInput} placeholder="0" placeholderTextColor="rgba(255,255,255,0.4)" keyboardType="decimal-pad" value={marcas[String(e.id)]?.kg ?? ''} onChangeText={(v) => setMarca(String(e.id), 'kg', v)} />
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
                        {DIAS.map((d) => (
                          <Pressable key={d} onPress={() => setMarca(String(e.id), 'dia', marcas[String(e.id)]?.dia === d ? null : d)} style={[styles.diaChip, marcas[String(e.id)]?.dia === d && styles.diaChipActive]}>
                            <Text style={[styles.diaChipTexto, marcas[String(e.id)]?.dia === d && styles.diaChipTextoActive]}>{d}</Text>
                          </Pressable>
                        ))}
                      </View>
                      {ultimos[String(e.id)] ? <Text style={styles.ultimaVez}>{'Última vez: ' + ultimos[String(e.id)].series + 'x' + ultimos[String(e.id)].repeticiones + ' con ' + ultimos[String(e.id)].peso + ' kg'}</Text> : null}
                    </View>
                  );
                })}
              </ScrollView>
              <View style={styles.btnFila}>
                <Pressable style={[styles.modalBtn, styles.btnFilaItem]} onPress={guardarEntreno}><Text style={styles.modalBtnText}>Guardar entreno</Text></Pressable>
                <Pressable style={[styles.modalBtn, styles.btnFilaItem, { backgroundColor: 'rgba(148, 163, 184, 0.2)' }]} onPress={() => { guardarPlan(); setRutinaVisible(false); }}><Text style={styles.modalBtnText}>Listo</Text></Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
      <Cronometro bottom={84} />
    </View>
  );
}

const makeStyles = (t) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.bg, paddingHorizontal: 16 },
  card: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  title: { color: t.textPrimary, fontSize: 28, fontWeight: '900' },
  subtitle: { color: t.textSecondary, fontSize: 13, marginTop: 2 },
  saveBtnWrap: { borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: '#67E8F9' },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 10 },
  saveBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  filters: { maxHeight: 44, marginBottom: 14 },
  filterChip: { paddingHorizontal: 16, borderRadius: 20, borderWidth: 1.2, borderColor: 'rgba(34, 211, 238, 0.35)', backgroundColor: 'rgba(15, 23, 42, 0.7)', marginRight: 8, height: 36, justifyContent: 'center' },
  filterChipActive: { backgroundColor: 'rgba(37, 99, 235, 0.35)', borderColor: '#38BDF8' },
  filterText: { color: '#CBD5E1', fontSize: 13, fontWeight: '700' },
  filterTextActive: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  modalFondo: { flex: 1, backgroundColor: 'rgba(6, 8, 20, 0.82)', justifyContent: 'center', padding: 12 },
  modalCard: { backgroundColor: '#111827', borderRadius: 28, padding: 18, borderWidth: 1.5, borderColor: 'rgba(139, 92, 246, 0.45)' },
  modalImg: { width: '100%', height: 260, borderRadius: 18, backgroundColor: '#fff' },
  modalTitulo: { color: t.textPrimary, fontSize: 22, fontWeight: '900', marginTop: 10 },
  modalDesc: { color: t.textSecondary, fontSize: 13, marginTop: 4 },
  modalBtn: { backgroundColor: t.primary, borderRadius: 16, padding: 14, marginTop: 14, alignItems: 'center' },
  modalBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  btnFila: { flexDirection: 'row', gap: 10, marginTop: 12 },
  btnFilaItem: { flex: 1, marginTop: 0, paddingVertical: 13 },
  rutinaRow: { backgroundColor: 'rgba(15, 23, 42, 0.85)', borderRadius: 22, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.2)' },
  rutinaTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rutinaImg: { width: 80, height: 80, borderRadius: 16, backgroundColor: '#fff' },
  rutinaImgWrap: { width: 80, height: 80 },
  chipCampo: { flex: 1, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.4)' },
  chipLabel: { backgroundColor: 'rgba(15, 23, 42, 0.9)', color: '#94A3B8', fontSize: 10, fontWeight: '700', textAlign: 'center', paddingVertical: 4 },
  chipInput: { backgroundColor: 'rgba(124, 58, 237, 0.35)', color: '#FFFFFF', fontSize: 18, fontWeight: '800', textAlign: 'center', paddingVertical: 6 },
  rutinaQuitar: { color: t.danger, fontSize: 18, fontWeight: 'bold', paddingHorizontal: 6 },
  diaChip: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 14, borderWidth: 1, borderColor: t.border, backgroundColor: 'rgba(15, 23, 42, 0.6)' },
  diaChipActive: { backgroundColor: t.primary, borderColor: '#C084FC' },
  diaChipTexto: { color: t.textSecondary, fontSize: 12, fontWeight: '600' },
  diaChipTextoActive: { color: '#FFFFFF', fontWeight: '800' },
  ultimaVez: { color: '#38BDF8', fontSize: 11, fontWeight: '600', marginTop: 6 },
  itemTitle: { color: t.textPrimary, fontSize: 16, fontWeight: '800' },
  itemDesc: { color: t.textSecondary, fontSize: 12, marginTop: 2 },
});
