import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Modal, Platform, StyleSheet, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as ImagePicker from 'expo-image-picker';
import { captureRef } from 'react-native-view-shot';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_URL } from '../config';
import TarjetasRecord from '../components/TarjetasRecord';

const STORAGE_RECORDS = 'energym:records_v1';
const MODELOS = [
  { id: 'imparable', label: '⚡ Imparable' },
  { id: 'epico', label: '🏆 Mejor Versión' },
  { id: 'fuerza', label: '🔥 Fuerza' },
  { id: 'clasico', label: '✨ Clásico' },
];

const BASE_RECORDS = [
  { id: '1', inicial: 'P', nombre: 'Press de banca', peso: '82,5', reps: '5 repeticiones', fecha: 'Hoy', nuevo: true },
  { id: '2', inicial: 'S', nombre: 'Sentadilla', peso: '110', reps: '5 repeticiones', fecha: '19 oct', nuevo: false },
  { id: '3', inicial: 'D', nombre: 'Peso muerto', peso: '130', reps: '3 repeticiones', fecha: '12 oct', nuevo: false },
  { id: '4', inicial: 'M', nombre: 'Press militar', peso: '50', reps: '6 repeticiones', fecha: '1 oct', nuevo: false },
];

export default function RecordsScreen({ navigation, route }) {
  const { token, usuario } = route.params || {};
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();
  const cardW = Math.min(screenW - 48, 300);
  const cardH = Math.round((cardW * 16) / 9);
  const cardRef = useRef(null);

  const [records, setRecords] = useState(BASE_RECORDS);
  const [seleccionado, setSeleccionado] = useState(BASE_RECORDS[0]);
  const [modelo, setModelo] = useState('imparable');
  const [fotoCustom, setFotoCustom] = useState(null);
  const [gimnasio, setGimnasio] = useState({ nombre: 'EnerGym', logoUrl: '', instagram: '', hashtag: '' });
  const [catalogo, setCatalogo] = useState([]);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoPeso, setNuevoPeso] = useState('');
  const [nuevasReps, setNuevasReps] = useState('5');

  const nombreSocio = usuario?.nombre ? usuario.nombre.split(' ')[0] : 'Socio';

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_RECORDS).then((raw) => {
      if (raw) {
        const guardados = JSON.parse(raw);
        if (Array.isArray(guardados) && guardados.length > 0) {
          setRecords(guardados);
          setSeleccionado(guardados[0]);
        }
      }
    }).catch(() => {});

    if (!token) return;
    const h = { Authorization: 'Bearer ' + token };
    fetch(API_URL + '/api/gimnasio/me', { headers: h }).then((r) => r.json()).then((g) => {
      if (g) setGimnasio({ nombre: g.nombre || 'EnerGym', logoUrl: g.logoUrl || '', instagram: g.instagram || '', hashtag: g.hashtag || '' });
    }).catch(() => {});

    fetch(API_URL + '/api/ejercicios', { headers: h }).then((r) => r.json()).then((lista) => {
      if (Array.isArray(lista)) setCatalogo(lista);
    }).catch(() => {});
  }, []);

  const guardarEnStorage = (lista) => {
    setRecords(lista);
    AsyncStorage.setItem(STORAGE_RECORDS, JSON.stringify(lista)).catch(() => {});
  };

  const elegirFotoFondo = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        alert('Necesitamos permiso para acceder a tus fotos.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.75,
        base64: true,
      });
      if (!res.canceled && res.assets && res.assets[0]) {
        const asset = res.assets[0];
        setFotoCustom(asset.base64 ? 'data:image/jpeg;base64,' + asset.base64 : asset.uri);
      }
    } catch (e) {
      alert('No se pudo cargar la imagen.');
    }
  };

  const abrirNuevo = () => {
    setEditandoId(null);
    setNuevoNombre('');
    setNuevoPeso('');
    setNuevasReps('5');
    setModalAbierto(true);
  };

  const abrirEditar = (item) => {
    setEditandoId(item.id);
    setNuevoNombre(item.nombre);
    setNuevoPeso(String(item.peso));
    const soloNum = String(item.reps).replace(/[^0-9]/g, '');
    setNuevasReps(soloNum || '5');
    setModalAbierto(true);
  };

  const guardarRecord = () => {
    if (!nuevoNombre.trim() || !nuevoPeso.trim()) {
      alert('Completá el nombre del ejercicio y el peso.');
      return;
    }
    const nombreLimpio = nuevoNombre.trim();
    const pesoLimpio = nuevoPeso.trim().replace('.', ',');
    const repsNum = nuevasReps.trim().replace(/[^0-9]/g, '') || '1';
    const repsTexto = repsNum + (repsNum === '1' ? ' repetición' : ' repeticiones');
    const hoyStr = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });

    if (editandoId) {
      const actualizados = records.map((r) => {
        if (r.id !== editandoId) return { ...r, nuevo: false };
        const editado = {
          ...r,
          inicial: nombreLimpio[0].toUpperCase(),
          nombre: nombreLimpio,
          peso: pesoLimpio,
          reps: repsTexto,
          fecha: 'Hoy (' + hoyStr + ')',
          nuevo: true,
        };
        setSeleccionado(editado);
        return editado;
      });
      guardarEnStorage(actualizados);
    } else {
      const nuevoItem = {
        id: String(Date.now()),
        inicial: nombreLimpio[0].toUpperCase(),
        nombre: nombreLimpio,
        peso: pesoLimpio,
        reps: repsTexto,
        fecha: 'Hoy',
        nuevo: true,
      };
      const actualizados = [nuevoItem, ...records.map((r) => ({ ...r, nuevo: false }))];
      guardarEnStorage(actualizados);
      setSeleccionado(nuevoItem);
    }
    setModalAbierto(false);
  };

  const eliminarRecord = () => {
    if (!editandoId) return;
    const restantes = records.filter((r) => r.id !== editandoId);
    guardarEnStorage(restantes);
    if (seleccionado.id === editandoId && restantes.length > 0) {
      setSeleccionado(restantes[0]);
    }
    setModalAbierto(false);
  };

  const textoCompartir = () => {
    let txt = '🏆 Nuevo récord en ' + seleccionado.nombre + ': ' + seleccionado.peso + ' kg (' + seleccionado.reps + ') 💪';
    if (gimnasio.nombre) txt += '\n📍 ' + gimnasio.nombre;
    if (gimnasio.instagram) txt += ' @' + gimnasio.instagram.replace(/^@/, '');
    if (gimnasio.hashtag) txt += '\n#' + gimnasio.hashtag;
    return txt;
  };

  const capturarTarjeta = async () => {
    await new Promise((r) => setTimeout(r, 400));
    return await captureRef(cardRef, { format: 'png', quality: 1, result: 'tmpfile', width: 1080, height: 1920 });
  };

  const compartirInstagram = async () => {
    try {
      const uri = await capturarTarjeta();
      await Clipboard.setStringAsync(textoCompartir());
      if (Platform.OS === 'android') {
        try {
          const FS = require('expo-file-system/legacy');
          const IL = require('expo-intent-launcher');
          const contentUri = await FS.getContentUriAsync(uri);
          await IL.startActivityAsync('com.instagram.share.ADD_TO_STORY', {
            data: contentUri,
            type: 'image/png',
            flags: 1,
            packageName: 'com.instagram.android',
          });
          return;
        } catch (errIntent) {}
      }
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Compartir récord en Instagram' });
    } catch (e) {
      alert('No se pudo preparar la imagen para compartir.');
    }
  };

  const compartirGeneral = async () => {
    try {
      const uri = await capturarTarjeta();
      await Clipboard.setStringAsync(textoCompartir());
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Compartir mi récord' });
    } catch (e) {}
  };

  return (
    <LinearGradient colors={['#060814', '#0B1228', '#071927']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={[styles.wrap, { paddingTop: insets.top + 12, paddingBottom: 40 }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backTxt}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Mis récords</Text>
        </View>

        <Text style={styles.selectorLabel}>Elegí el diseño para tu historia:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
          {MODELOS.map((m) => {
            const activo = modelo === m.id;
            return (
              <Pressable key={m.id} onPress={() => setModelo(m.id)} style={[styles.modeloChip, activo && styles.modeloChipActivo]}>
                <Text style={[styles.modeloChipTxt, activo && { color: '#FFFFFF', fontWeight: '900' }]}>{m.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={{ alignItems: 'center' }}>
          <View ref={cardRef} collapsable={false} style={[styles.shareCardWrap, { width: cardW, height: cardH }]}>
            <TarjetasRecord
              modelo={modelo}
              record={seleccionado}
              gimnasio={gimnasio}
              nombreSocio={nombreSocio}
              fotoCustom={fotoCustom}
            />
          </View>
        </View>

        <View style={styles.fotoRow}>
          <Pressable onPress={elegirFotoFondo} style={styles.fotoBtn}>
            <Text style={styles.fotoBtnTxt}>{fotoCustom ? '📷 Cambiar foto propia' : '📷 Usar mi propia foto de fondo'}</Text>
          </Pressable>
          {fotoCustom ? (
            <Pressable onPress={() => setFotoCustom(null)} style={styles.resetFotoBtn}>
              <Text style={{ color: '#F87171', fontSize: 12, fontWeight: '800' }}>Quitar</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <Pressable onPress={compartirInstagram} style={[styles.igBtnWrap, { flex: 1 }]}>
            <LinearGradient colors={['#7C3AED', '#4F46E5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.igBtn}>
              <Text style={styles.igBtnTxt}>📸 Compartir en Historia de Instagram</Text>
            </LinearGradient>
          </Pressable>
          <Pressable onPress={compartirGeneral} style={styles.shareAltBtn}>
            <Text style={{ color: '#E0F2FE', fontWeight: '800', fontSize: 16 }}>↗</Text>
          </Pressable>
        </View>

        <View style={styles.seccionHeader}>
          <View>
            <Text style={styles.seccionTitulo}>Mis récords por ejercicio</Text>
            <Text style={{ color: '#64748B', fontSize: 11, marginTop: 2 }}>Tocá uno para verlo arriba o "✎ Editar" para cambiar el peso</Text>
          </View>
          <Pressable onPress={abrirNuevo} style={styles.addBtn}>
            <Text style={styles.addBtnTxt}>+ Agregar</Text>
          </Pressable>
        </View>

        {records.map((item) => {
          const activo = seleccionado.id === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => setSeleccionado(item)}
              style={[styles.filaRecord, activo && { borderColor: '#8B5CF6', backgroundColor: 'rgba(139, 92, 246, 0.14)' }]}
            >
              <View style={styles.inicialBadge}><Text style={styles.inicialTxt}>{item.inicial}</Text></View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.filaNombre}>{item.nombre}</Text>
                  {item.nuevo ? <View style={styles.nuevoBadge}><Text style={styles.nuevoTxt}>NUEVO</Text></View> : null}
                </View>
                <Text style={styles.filaSub}>{item.reps + ' · ' + item.fecha}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 6 }}>
                <Text style={styles.filaPeso}>{item.peso} kg</Text>
                <Pressable onPress={() => abrirEditar(item)} hitSlop={8} style={styles.editPill}>
                  <Text style={styles.editPillTxt}>✎ Editar</Text>
                </Pressable>
              </View>
            </Pressable>
          );
        })}

        <Modal visible={modalAbierto} transparent animationType="slide" onRequestClose={() => setModalAbierto(false)}>
          <View style={styles.modalBg}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{editandoId ? 'Editar récord' : 'Agregar récord de ejercicio'}</Text>
              {!editandoId && catalogo.length > 0 ? (
                <>
                  <Text style={styles.label}>Elegir de la lista o escribir abajo:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 38, marginBottom: 8 }}>
                    {catalogo.map((ej) => (
                      <Pressable key={String(ej.id)} onPress={() => setNuevoNombre(ej.nombre)} style={[styles.sugChip, nuevoNombre === ej.nombre && styles.sugChipActivo]}>
                        <Text style={{ color: nuevoNombre === ej.nombre ? '#FFF' : '#94A3B8', fontSize: 12, fontWeight: '700' }}>{ej.nombre}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </>
              ) : null}
              <Text style={styles.label}>Ejercicio</Text>
              <TextInput value={nuevoNombre} onChangeText={setNuevoNombre} placeholder="Ej: Sentadilla, Press de banca..." placeholderTextColor="#64748B" style={styles.input} />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Peso (kg)</Text>
                  <TextInput value={nuevoPeso} onChangeText={setNuevoPeso} keyboardType="decimal-pad" placeholder="Ej: 110" placeholderTextColor="#64748B" style={styles.input} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Repeticiones</Text>
                  <TextInput value={nuevasReps} onChangeText={setNuevasReps} keyboardType="numeric" placeholder="Ej: 5" placeholderTextColor="#64748B" style={styles.input} />
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
                {editandoId && records.length > 1 ? (
                  <Pressable onPress={eliminarRecord} style={[styles.modalBtn, { backgroundColor: 'rgba(239, 68, 68, 0.2)', borderWidth: 1, borderColor: '#F87171', flex: 0.7 }]}>
                    <Text style={{ color: '#F87171', fontWeight: '800' }}>Eliminar</Text>
                  </Pressable>
                ) : null}
                <Pressable onPress={() => setModalAbierto(false)} style={[styles.modalBtn, { backgroundColor: 'rgba(148,163,184,0.18)' }]}>
                  <Text style={{ color: '#CBD5E1', fontWeight: '700' }}>Cancelar</Text>
                </Pressable>
                <Pressable onPress={guardarRecord} style={[styles.modalBtn, { backgroundColor: '#7C3AED' }]}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>Guardar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  backTxt: { color: '#FFF', fontSize: 24, fontWeight: '700', marginTop: -2 },
  headerTitle: { color: '#F8FAFC', fontSize: 22, fontWeight: '900' },
  selectorLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '700', marginBottom: 8 },
  modeloChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(148,163,184,0.3)', backgroundColor: 'rgba(15,23,42,0.75)', marginRight: 8 },
  modeloChipActivo: { backgroundColor: 'rgba(124, 58, 237, 0.45)', borderColor: '#C084FC' },
  modeloChipTxt: { color: '#94A3B8', fontSize: 13, fontWeight: '700' },
  shareCardWrap: { borderRadius: 24, overflow: 'hidden', borderWidth: 1.5, borderColor: 'rgba(168, 85, 247, 0.5)', elevation: 10 },
  fotoRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  fotoBtn: { flex: 1, paddingVertical: 10, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.4)', backgroundColor: 'rgba(15, 23, 42, 0.7)', alignItems: 'center' },
  fotoBtnTxt: { color: '#38BDF8', fontSize: 12, fontWeight: '800' },
  resetFotoBtn: { paddingHorizontal: 14, justifyContent: 'center', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(248, 113, 113, 0.4)', backgroundColor: 'rgba(15, 23, 42, 0.7)' },
  igBtnWrap: { borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: '#C084FC' },
  igBtn: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  igBtnTxt: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  shareAltBtn: { width: 50, borderRadius: 18, borderWidth: 1, borderColor: '#22D3EE', backgroundColor: 'rgba(6, 182, 212, 0.18)', alignItems: 'center', justifyContent: 'center' },
  seccionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 22, marginBottom: 12 },
  seccionTitulo: { color: '#F8FAFC', fontSize: 14, fontWeight: '800' },
  addBtn: { backgroundColor: 'rgba(6, 182, 212, 0.18)', borderWidth: 1, borderColor: '#22D3EE', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12 },
  addBtnTxt: { color: '#E0F2FE', fontSize: 12, fontWeight: '800' },
  filaRecord: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(18, 25, 46, 0.78)', padding: 14, borderRadius: 18, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(148,163,184,0.2)' },
  inicialBadge: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(139, 92, 246, 0.2)', alignItems: 'center', justifyContent: 'center' },
  inicialTxt: { color: '#C084FC', fontSize: 15, fontWeight: '900' },
  filaNombre: { color: '#F8FAFC', fontSize: 15, fontWeight: '800' },
  nuevoBadge: { backgroundColor: 'rgba(16, 185, 129, 0.2)', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#10B981' },
  nuevoTxt: { color: '#34D399', fontSize: 10, fontWeight: '900' },
  filaSub: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  filaPeso: { color: '#F8FAFC', fontSize: 16, fontWeight: '900' },
  editPill: { backgroundColor: 'rgba(139, 92, 246, 0.25)', borderWidth: 1, borderColor: '#A855F7', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8 },
  editPillTxt: { color: '#E9D5FF', fontSize: 11, fontWeight: '800' },
  modalBg: { flex: 1, backgroundColor: 'rgba(6, 8, 20, 0.85)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: '#111827', borderRadius: 24, padding: 20, borderWidth: 1.5, borderColor: '#8B5CF6' },
  modalTitle: { color: '#F8FAFC', fontSize: 19, fontWeight: '900', marginBottom: 12 },
  label: { color: '#94A3B8', fontSize: 12, fontWeight: '700', marginTop: 10, marginBottom: 6 },
  input: { backgroundColor: 'rgba(15, 23, 42, 0.9)', borderWidth: 1, borderColor: 'rgba(148,163,184,0.3)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, color: '#F8FAFC', fontSize: 15 },
  sugChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(148,163,184,0.3)', marginRight: 8, backgroundColor: 'rgba(15,23,42,0.8)' },
  sugChipActivo: { backgroundColor: '#7C3AED', borderColor: '#C084FC' },
  modalBtn: { flex: 1, paddingVertical: 13, borderRadius: 14, alignItems: 'center' },
});
