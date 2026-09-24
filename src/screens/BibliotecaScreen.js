import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, FlatList, Image, Alert, StyleSheet, ActivityIndicator, Modal, Linking, TextInput } from 'react-native';
import { API_URL } from '../config';

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
    return g === grupo.toUpperCase();
  });

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Ejercicios TEST</Text>
            <Text style={styles.subtitle}>Tu rutina: {seleccionados.length} seleccionados</Text>
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
          <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={ejerciciosFiltrados}
            keyExtractor={(item, index) => (item && item.id ? String(item.id) : String(index))}
            renderItem={({ item }) => {
              const idStr = String(item.id);
              const activo = seleccionados.includes(idStr);
              const imgUri = item.imagenUrl || item.imagen || item.uri || item.url;

              return (
                <Pressable style={styles.row} onPress={() => setDetalle(item)}>
                  <View style={styles.thumb}>
                    {imgUri && typeof imgUri === 'string' && imgUri.startsWith('http') ? (
                      <Image source={{ uri: imgUri }} style={styles.img} resizeMode="cover" />
                    ) : (
                      <Text style={styles.thumbFallback}>💪</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{item.nombre || 'Ejercicio'}</Text>
                    <Text style={styles.itemDesc}>{item.descripcion || 'Sin descripción'}</Text>
                  </View>
                  <Pressable
                    onPress={() => toggle(idStr)}
                    style={[styles.check, activo && styles.checkActive]}
                  >
                    {activo && <Text style={styles.checkText}>✓</Text>}
                  </Pressable>
                </Pressable>
              );
            }}
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
          <View style={[styles.modalCard, { maxHeight: '85%' }]}>
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
                        <TextInput style={styles.inputMini} placeholder="Series" placeholderTextColor="#64748B" keyboardType="numeric"
                          value={marcas[String(e.id)]?.series ?? ''} onChangeText={(v) => setMarca(String(e.id), 'series', v)} />
                        <TextInput style={styles.inputMini} placeholder="Reps" placeholderTextColor="#64748B" keyboardType="numeric"
                          value={marcas[String(e.id)]?.reps ?? ''} onChangeText={(v) => setMarca(String(e.id), 'reps', v)} />
                        <TextInput style={styles.inputMini} placeholder="Kg" placeholderTextColor="#64748B" keyboardType="decimal-pad"
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
            <Pressable style={styles.modalBtn} onPress={guardarEntreno}>
              <Text style={styles.modalBtnText}>Guardar entrenamiento</Text>
            </Pressable>
            <Pressable style={styles.modalBtn} onPress={() => setRutinaVisible(false)}>
              <Text style={styles.modalBtnText}>Listo</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

</View>
    
        {timerAbierto && (
          <View style={styles.timerPanel}>
            <Text style={styles.timerTexto}>{formatoTiempo(segundos)}</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <Pressable style={styles.timerBtnChico} onPress={() => setSegundos((s) => Math.max(0, s - 15))}>
                <Text style={styles.timerBtnChicoTexto}>-15</Text>
              </Pressable>
              <Pressable
                style={[styles.timerBtnChico, { backgroundColor: '#3B82F6' }]}
                onPress={() => setTimerCorriendo((c) => !c)}
              >
                <Text style={styles.timerBtnChicoTexto}>{timerCorriendo ? 'Pausar' : 'Iniciar'}</Text>
              </Pressable>
              <Pressable style={styles.timerBtnChico} onPress={() => setSegundos((s) => s + 15)}>
                <Text style={styles.timerBtnChicoTexto}>+15</Text>
              </Pressable>
            </View>
            <Pressable
              onPress={() => { setTimerCorriendo(false); setSegundos(90); }}
              style={{ marginTop: 8 }}
            >
              <Text style={{ color: '#94A3B8', fontSize: 12 }}>Reiniciar</Text>
            </Pressable>
          </View>
        )}
        <Pressable
          style={styles.timerFab}
          onPress={() => setTimerAbierto((v) => !v)}
        >
          <Text style={{ fontSize: 24 }}>⏱</Text>
        </Pressable>
      </View>
    );
}

const SPOTIFY_URL = 'https://open.spotify.com/playlist/6ypUvnU30JFjyfzTzG5VBM';

const styles = StyleSheet.create({
  diaChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14, borderWidth: 1, borderColor: '#334155' },
  diaChipActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  diaChipTexto: { color: '#94A3B8', fontSize: 11 },
  diaChipTextoActive: { color: '#FFFFFF', fontWeight: '600' },
  timerFab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 6 },
  timerPanel: { position: 'absolute', bottom: 90, right: 20, backgroundColor: '#1E293B', borderRadius: 16, padding: 16, alignItems: 'center', elevation: 6 },
  timerTexto: { color: '#F8FAFC', fontSize: 32, fontWeight: '700' },
  timerBtnChico: { backgroundColor: '#334155', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  timerBtnChicoTexto: { color: '#F8FAFC', fontWeight: '600', fontSize: 13 },
  inputMini: { backgroundColor: '#1E293B', color: '#F8FAFC', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 4, width: 54, fontSize: 12 },
  ultimaVez: { color: '#94A3B8', fontSize: 11, marginTop: 4 },
  spotifyBtn: { backgroundColor: '#1DB954', borderRadius: 12, padding: 14, marginTop: 12, alignItems: 'center' },
  modalFondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#1E293B', borderRadius: 20, padding: 16 },
  modalImg: { width: '100%', height: 320, borderRadius: 12, backgroundColor: '#fff' },
  modalTitulo: { color: '#F8FAFC', fontSize: 22, fontWeight: 'bold', marginTop: 14 },
  modalDesc: { color: '#94A3B8', fontSize: 14, marginTop: 6 },
  modalBtn: { backgroundColor: '#3B82F6', borderRadius: 12, padding: 14, marginTop: 16, alignItems: 'center' },
  modalBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  rutinaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#0F172A', borderRadius: 14, padding: 10, marginBottom: 10 },
  rutinaImg: { width: 56, height: 56, borderRadius: 10, backgroundColor: '#fff' },
  rutinaQuitar: { color: '#F87171', fontSize: 18, fontWeight: 'bold', paddingHorizontal: 6 },

  container: { flex: 1, backgroundColor: '#0F172A', padding: 16 },
  card: { flex: 1, backgroundColor: '#1E293B', borderRadius: 12, borderWidth: 1, borderColor: '#334155', padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { color: '#F8FAFC', fontSize: 19, fontWeight: '700' },
  subtitle: { color: '#94A3B8', fontSize: 12 },
  saveBtn: { backgroundColor: '#3B82F6', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  saveBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  filters: { maxHeight: 40, marginBottom: 12 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#334155', marginRight: 8, height: 32 },
  filterChipActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  filterText: { color: '#94A3B8', fontSize: 13 },
  filterTextActive: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', padding: 10, borderRadius: 8, marginBottom: 8, gap: 12 },
  thumb: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#1E3A8A', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  img: { width: '100%', height: '100%' },
  thumbFallback: { fontSize: 20 },
  itemTitle: { color: '#F8FAFC', fontSize: 14, fontWeight: '600' },
  itemDesc: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  check: { width: 24, height: 24, borderRadius: 6, borderWidth: 1, borderColor: '#334155', justifyContent: 'center', alignItems: 'center' },
  checkActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  checkText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
});
