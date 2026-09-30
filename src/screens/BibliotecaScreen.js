import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, FlatList, Image, Alert, StyleSheet, ActivityIndicator, Modal, Linking, TextInput, Vibration } from 'react-native';
import { API_URL } from '../config';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../theme/ThemeContext';
import Cronometro from '../components/Cronometro';
import EjercicioItem from '../components/EjercicioItem';
import Contador from '../components/Contador';

const GRUPOS = ['TODOS', 'PECHO', 'ESPALDA', 'PIERNAS', 'BRAZOS', 'HOMBROS', 'ABDOMEN'];

const EJERCICIOS_LOCALES = [
  { id: '1', nombre: 'Press de Banca', grupo: 'PECHO', descripcion: '3 series x 10 repeticiones', imagenUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500' },
  { id: '2', nombre: 'Sentadillas', grupo: 'PIERNAS', descripcion: '4 series x 8 repeticiones', imagenUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500' },
  { id: '3', nombre: 'Dominadas', grupo: 'ESPALDA', descripcion: '3 series al fallo', imagenUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500' },
  { id: '4', nombre: 'Curl de Bíceps', grupo: 'BRAZOS', descripcion: '3 series x 12 repeticiones', imagenUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500' },
  { id: '5', nombre: 'Press Militar', grupo: 'HOMBROS', descripcion: '3 series x 10 repeticiones', imagenUrl: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=500' }
];

export default function BibliotecaScreen({ navigation, route }) {
  const { token } = route.params;
  const t = useAppTheme();
  const styles = makeStyles(t);
  const insets = useSafeAreaInsets();
  const [ejercicios, setEjercicios] = useState(EJERCICIOS_LOCALES);
  const [grupo, setGrupo] = useState('TODOS');
  const [seleccionados, setSeleccionados] = useState([]);
  const [cargando, setCargando] = useState(false);

  const [timerAbierto, setTimerAbierto] = useState(false);
  const [timerCorriendo, setTimerCorriendo] = useState(false);
  const [segundos, setSegundos] = useState(90);

  useEffect(() => {
    if (!timerCorriendo) return;
    if (segundos <= 0) {
      setTimerCorriendo(false);
      Vibration.vibrate([0, 400, 200, 400]);
      return;
    }
    const id = setTimeout(() => setSegundos((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [timerCorriendo, segundos]);

  const formatoTiempo = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const r = (s % 60).toString().padStart(2, '0');
    return `${m}:${r}`;
  };
const [detalle, setDetalle] = useState(null);
  const [rutinaVisible, setRutinaVisible] = useState(false);

  const [marcas, setMarcas] = useState({});
  const DIAS = ['Día A', 'Día B', 'Día C'];
  const [diaFiltro, setDiaFiltro] = useState('TODOS');
  const [ultimos, setUltimos] = useState({});

  const setMarca = (id, campo, v) =>
    setMarcas((prev) => ({ ...prev, [id]: { ...prev[id], [campo]: v } }));

  const cargarUltimos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/entrenos/ultimos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      if (d && typeof d === 'object' && !Array.isArray(d)) setUltimos(d);
    } catch (e) {}
  };

  const guardarEntreno = async () => {
    const registros = Object.entries(marcas)
      .filter(([id, m]) => seleccionados.includes(id) && m && m.kg)
      .map(([ejercicioId, m]) => ({
        ejercicioId,
        peso: Number(String(m.kg).replace(',', '.')) || 0,
        series: parseInt(m.series, 10) || 0,
        repeticiones: parseInt(m.reps, 10) || 0,
      }));
    if (registros.length === 0) {
      Alert.alert('Atención', 'Cargá el peso de al menos un ejercicio.');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/entrenos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ registros }),
      });
      if (res.ok) {
        Alert.alert('¡Listo!', 'Entrenamiento guardado.');
        setMarcas({});
        cargarUltimos();
      } else {
        Alert.alert('Error', 'No se pudo guardar el entrenamiento.');
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar el entrenamiento.');
    }
  };

  useEffect(() => {
    cargarEjercicios();
    cargarRutinaGuardada();
  }, []);

  
  const cargarRutinaGuardada = async () => {
    try {
      const res = await fetch(`${API_URL}/api/rutinas/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data && Array.isArray(data.items)) {
        setSeleccionados(data.items.map((it) => String(it.ejercicioId)));
        setMarcas((prev) => {
          const next = { ...prev };
          data.items.forEach((it) => {
            const id = String(it.ejercicioId);
            next[id] = { ...next[id], dia: it.dia || null };
          });
          return next;
        });
      }
    } catch (e) {}
  };

  const cargarEjercicios = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API_URL}/api/rutinas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setEjercicios(data);
        }
      }
    } catch (e) {
      console.log('Error de red, utilizando lista de respaldo:', e.message);
    } finally {
      setCargando(false);
    }
  };

  const toggle = (id) => {
    const idStr = String(id);
    setSeleccionados((prev) =>
      prev.includes(idStr) ? prev.filter((i) => i !== idStr) : [...prev, idStr]
    );
  };

  const abrirRutina = async () => {
    if (seleccionados.length === 0) {
      Alert.alert('Atención', 'Seleccioná al menos un ejercicio para tu rutina.');
      return;
    }
    setRutinaVisible(true);
    cargarUltimos();
    try {
      const items = seleccionados.map((ejercicioId) => ({
      ejercicioId,
      dia: marcas[ejercicioId]?.dia || null,
    }));
      await fetch(`${API_URL}/api/rutinas/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items }),
      });
    } catch (e) {
      console.log('Error al guardar en el servidor:', e.message);
    }
  };

  const guardarRutina = async () => {
    if (seleccionados.length === 0) {
      Alert.alert('Atención', 'Seleccioná al menos un ejercicio para tu rutina.');
      return;
    }

    const nombres = ejercicios
      .filter((e) => seleccionados.includes(String(e.id)))
      .map((e) => e.nombre)
      .join('\n• ');

    try {
      const items = seleccionados.map((ejercicioId) => ({
      ejercicioId,
      dia: marcas[ejercicioId]?.dia || null,
    }));
      await fetch(`${API_URL}/api/rutinas/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items }),
      });
    } catch (e) {
      console.log('Error al guardar en el servidor:', e.message);
    }

    Alert.alert(
      '¡Tu Rutina!',
      `Ejercicios seleccionados (${seleccionados.length}):\n\n• ${nombres}`
    );
  };

  const ejerciciosFiltrados = ejercicios.filter((e) => {
    if (grupo === 'TODOS') return true;
    const g = (e.grupo || e.grupoMuscular || '').toUpperCase();
    const MAPA_GRUPOS = { BICEPS: 'BRAZOS', TRICEPS: 'BRAZOS', HOMBRO: 'HOMBROS', ABDOMINALES: 'ABDOMEN' };
  return (MAPA_GRUPOS[g] || g) === grupo.toUpperCase();
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <LinearGradient colors={t.gradient} style={StyleSheet.absoluteFill} />
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Ejercicios</Text>
            <Contador n={seleccionados.length} style={styles.subtitle} />
          </View>
          <Pressable onPress={abrirRutina} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Ver rutina</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
          {GRUPOS.map((g) => (
            <Pressable
              key={g}
              onPress={() => setGrupo(g)}
              style={[
                styles.filterChip,
                grupo === g && styles.filterChipActive,
              ]}
            >
              <Text style={grupo === g ? styles.filterTextActive : styles.filterText}>{g}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {cargando ? (
          <ActivityIndicator size="large" color={t.primary} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            key={grupo}
            data={ejerciciosFiltrados}
            keyExtractor={(item, index) => (item && item.id ? String(item.id) : String(index))}
        contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item, index }) => (
          <EjercicioItem
            item={item}
            index={index}
            activo={seleccionados.includes(String(item.id))}
            onOpen={() => setDetalle(item)}
            onToggle={() => toggle(String(item.id))}
          />
        )}
          />
        )}
      
      <Modal visible={!!detalle} transparent animationType="fade" onRequestClose={() => setDetalle(null)}>
        <Pressable style={styles.modalFondo} onPress={() => setDetalle(null)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            {detalle && (
              <>
                <Image
                  source={{ uri: detalle.imagenUrl || detalle.imagen || detalle.uri || detalle.url }}
                  style={styles.modalImg}
                  resizeMode="contain"
                />
                <Text style={styles.modalTitulo}>{detalle.nombre}</Text>
                <Text style={styles.modalDesc}>{detalle.descripcion}</Text>
                <Pressable
                  style={styles.modalBtn}
                  onPress={() => { toggle(String(detalle.id)); setDetalle(null); }}
                >
                  <Text style={styles.modalBtnText}>
                    {seleccionados.includes(String(detalle.id)) ? 'Quitar de mi rutina' : 'Agregar a mi rutina'}
                  </Text>
                </Pressable>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={rutinaVisible} transparent animationType="slide" onRequestClose={() => setRutinaVisible(false)}>
        <View style={styles.modalFondo}>
          <View style={[styles.modalCard, { maxHeight: '94%' }]}>
            <Text style={styles.modalTitulo}>Mi rutina</Text>
            <Text style={styles.modalDesc}>{seleccionados.length} ejercicios</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
              {['TODOS', ...DIAS, 'Sin día'].map((d) => (
                <Pressable
                  key={d}
                  onPress={() => setDiaFiltro(d)}
                  style={[styles.filterChip, diaFiltro === d && styles.filterChipActive]}
                >
                  <Text style={diaFiltro === d ? styles.filterTextActive : styles.filterText}>{d}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <ScrollView style={{ marginTop: 12 }}>
              {ejercicios.filter((e) => {
                if (!seleccionados.includes(String(e.id))) return false;
                if (diaFiltro === 'TODOS') return true;
                const dia = marcas[String(e.id)]?.dia || 'Sin día';
                return dia === diaFiltro;
              }).map((e) => {
                const uri = e.imagenUrl || e.imagen || e.uri || e.url;
                return (
                  <View key={String(e.id)} style={styles.rutinaRow}>
                    {uri ? (
                      <Image source={{ uri }} style={styles.rutinaImg} resizeMode="cover" />
                    ) : (
                      <View style={styles.rutinaImg} />
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemTitle}>{e.nombre}</Text>
                      <Text style={styles.itemDesc}>{e.descripcion}</Text>
                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                        <TextInput style={styles.inputMini} placeholder="Series" placeholderTextColor={t.textSecondary} keyboardType="numeric"
                          value={marcas[String(e.id)]?.series ?? ''} onChangeText={(v) => setMarca(String(e.id), 'series', v)} />
                        <TextInput style={styles.inputMini} placeholder="Reps" placeholderTextColor={t.textSecondary} keyboardType="numeric"
                          value={marcas[String(e.id)]?.reps ?? ''} onChangeText={(v) => setMarca(String(e.id), 'reps', v)} />
                        <TextInput style={styles.inputMini} placeholder="Kg" placeholderTextColor={t.textSecondary} keyboardType="decimal-pad"
                          value={marcas[String(e.id)]?.kg ?? ''} onChangeText={(v) => setMarca(String(e.id), 'kg', v)} />
                      </View>
                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                        {DIAS.map((d) => (
                          <Pressable
                            key={d}
                            onPress={() => setMarca(String(e.id), 'dia', marcas[String(e.id)]?.dia === d ? null : d)}
                            style={[styles.diaChip, marcas[String(e.id)]?.dia === d && styles.diaChipActive]}
                          >
                            <Text style={[styles.diaChipTexto, marcas[String(e.id)]?.dia === d && styles.diaChipTextoActive]}>{d}</Text>
                          </Pressable>
                        ))}
                      </View>
                      {ultimos[String(e.id)] ? (
                        <Text style={styles.ultimaVez}>
                          Última vez: {ultimos[String(e.id)].series}x{ultimos[String(e.id)].repeticiones} con {ultimos[String(e.id)].peso} kg
                        </Text>
                      ) : null}
                    </View>
                    <Pressable onPress={() => toggle(String(e.id))} hitSlop={10}>
                      <Text style={styles.rutinaQuitar}>✕</Text>
                    </Pressable>
                  </View>
                );
              })}
            </ScrollView>
            <Pressable style={styles.spotifyBtn} onPress={() => Linking.openURL(SPOTIFY_URL)}>
              <Text style={styles.modalBtnText}>Escuchar en Spotify</Text>
            </Pressable>
            <View style={styles.btnFila}>
          <Pressable style={[styles.modalBtn, styles.btnFilaItem]} onPress={guardarEntreno}>
            <Text style={styles.modalBtnText}>Guardar entreno</Text>
          </Pressable>
          <Pressable style={[styles.modalBtn, styles.btnFilaItem]} onPress={() => setRutinaVisible(false)}>
            <Text style={styles.modalBtnText}>Listo</Text>
          </Pressable>
        </View>
          </View>
        </View>
      </Modal>

</View>
    
        <Cronometro bottom={84} />
      </View>
    );
}

const SPOTIFY_URL = 'https://open.spotify.com/playlist/6ypUvnU30JFjyfzTzG5VBM';

const makeStyles = (t) => StyleSheet.create({
  diaChip: { paddingHorizontal: 13, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: t.border, backgroundColor: t.surface },
  diaChipActive: { backgroundColor: t.primary, borderColor: t.primary },
  diaChipTexto: { color: t.textSecondary, fontSize: 13 },
  diaChipTextoActive: { color: t.onPrimary, fontWeight: '700' },
  timerFab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: t.primary, alignItems: 'center', justifyContent: 'center', elevation: 6 },
  timerPanel: { position: 'absolute', bottom: 90, right: 20, backgroundColor: t.surface, borderRadius: 20, padding: 16, alignItems: 'center', elevation: 6 },
  timerTexto: { color: t.textPrimary, fontSize: 32, fontWeight: '700' },
  timerBtnChico: { backgroundColor: t.bg, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  timerBtnChicoTexto: { color: t.textPrimary, fontWeight: '600', fontSize: 13 },
  inputMini: { flex: 1, backgroundColor: t.surface, color: t.textPrimary, borderRadius: 12, borderWidth: 1, borderColor: t.border, paddingHorizontal: 8, paddingVertical: 12, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  ultimaVez: { color: t.textSecondary, fontSize: 11, marginTop: 4 },
  spotifyBtn: { backgroundColor: '#1DB954', borderRadius: 16, padding: 10, marginTop: 10, alignItems: 'center' },
  modalFondo: { flex: 1, backgroundColor: 'rgba(20,32,30,0.55)', justifyContent: 'center', padding: 10 },
  modalCard: { backgroundColor: t.surface, borderRadius: 28, padding: 16 },
  modalImg: { width: '100%', height: 320, borderRadius: 16, backgroundColor: '#fff' },
  modalTitulo: { color: t.textPrimary, fontSize: 22, fontWeight: '800', marginTop: 14 },
  modalDesc: { color: t.textSecondary, fontSize: 14, marginTop: 6 },
  modalBtn: { backgroundColor: t.primary, borderRadius: 16, padding: 14, marginTop: 16, alignItems: 'center' },
  modalBtnText: { color: t.onPrimary, fontWeight: '800', fontSize: 15 },
  btnFila: { flexDirection: 'row', gap: 10, marginTop: 10 },
  btnFilaItem: { flex: 1, marginTop: 0, paddingVertical: 12 },
  rutinaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: t.bg, borderRadius: 20, padding: 10, marginBottom: 10 },
  rutinaImg: { width: 56, height: 56, borderRadius: 14, backgroundColor: '#fff' },
  rutinaQuitar: { color: t.danger, fontSize: 18, fontWeight: 'bold', paddingHorizontal: 6 },
  container: { flex: 1, backgroundColor: t.bg, padding: 16 },
  card: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  title: { color: t.textPrimary, fontSize: 24, fontWeight: '800' },
  subtitle: { color: t.textSecondary, fontSize: 13 },
  saveBtn: { backgroundColor: t.coral, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16 },
  saveBtnText: { color: '#2B1710', fontSize: 13, fontWeight: '800' },
  filters: { maxHeight: 44, marginBottom: 12 },
  filterChip: { paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: t.border, backgroundColor: t.surface, marginRight: 8, height: 34, justifyContent: 'center' },
  filterChipActive: { backgroundColor: t.primary, borderColor: t.primary },
  filterText: { color: t.textSecondary, fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: t.onPrimary, fontSize: 13, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: t.surface, padding: 12, borderRadius: 20, marginBottom: 10, gap: 12 },
  thumb: { width: 56, height: 56, borderRadius: 14, backgroundColor: t.primaryBg, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  img: { width: '100%', height: '100%' },
  thumbFallback: { fontSize: 22 },
  itemTitle: { color: t.textPrimary, fontSize: 15, fontWeight: '700' },
  itemDesc: { color: t.textSecondary, fontSize: 12, marginTop: 2 },
  check: { width: 26, height: 26, borderRadius: 8, borderWidth: 1, borderColor: t.border, justifyContent: 'center', alignItems: 'center' },
  checkActive: { backgroundColor: t.primary, borderColor: t.primary },
  checkText: { color: t.onPrimary, fontSize: 12, fontWeight: 'bold' },
});
