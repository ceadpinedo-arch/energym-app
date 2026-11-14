import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from 'react-native';
import { getTheme } from '../theme/colors';
import { API_URL } from '../config';
import { useAppTheme } from '../theme/ThemeContext';
import useTeclado from '../components/useTeclado';

function conNegritas(texto) {
  const limpio = String(texto || '').replace(/^[ \t]*[*-][ \t]+/gm, '• ');
  return limpio.split(/\*\*([\s\S]+?)\*\*/).map((p, i) =>
    i % 2 === 1 ? (
      <Text key={i} style={{ fontWeight: '700' }}>{p}</Text>
    ) : (
      p
    )
  );
}

export default function AsistenteIAScreen({ route }) {
  const { token } = route.params;
  const t = useAppTheme();
  const teclado = useTeclado();

  const [mensajes, setMensajes] = useState([
    { role: 'assistant', content: '¡Hola! Soy el asistente de TuAccesoGym. ¿En qué te puedo ayudar hoy?' },
  ]);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const listRef = useRef(null);

  async function enviar() {
    if (!texto.trim() || enviando) return;
    const mensaje = texto.trim();
    const historial = mensajes;
    setMensajes((prev) => [...prev, { role: 'user', content: mensaje }]);
    setTexto('');
    setEnviando(true);

    try {
      const res = await fetch(`${API_URL}/api/ia/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mensaje, historial }),
      });
      const data = await res.json();
      setMensajes((prev) => [
        ...prev,
        { role: 'assistant', content: data.respuesta || 'No pude generar una respuesta, probá de nuevo.' },
      ]);
    } catch {
      setMensajes((prev) => [
        ...prev,
        { role: 'assistant', content: 'No me pude conectar. Revisá tu conexión e intentá de nuevo.' },
      ]);
    } finally {
      setEnviando(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: t.bg }}
      behavior={undefined}
    >
      <View style={{ flex: 1, padding: 16, paddingBottom: teclado > 0 ? teclado + 8 : 72 }}>
        <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border, flex: 1 }]}>
          <Text style={{ color: t.textPrimary, fontSize: 19, fontWeight: '700', marginBottom: 12 }}>
            Asistente TuAccesoGym
          </Text>

          <FlatList
            ref={listRef}
            data={mensajes}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.bubble,
                  item.role === 'user'
                    ? { backgroundColor: t.primary, alignSelf: 'flex-end' }
                    : { backgroundColor: t.bg, alignSelf: 'flex-start' },
                ]}
              >
                <Text style={{ color: item.role === 'user' ? t.onPrimary : t.textPrimary, fontSize: 14 }}>
                  {item.role === 'user' ? item.content : conNegritas(item.content)}
                </Text>
              </View>
            )}
            style={{ flex: 1 }}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => listRef.current?.scrollToEnd({ animated: true })}
          />

          <View style={styles.inputRow}>
            <TextInput
              value={texto}
              onChangeText={setTexto}
              placeholder="Escribí tu consulta…"
              placeholderTextColor={t.textSecondary}
              style={[styles.input, { borderColor: t.border, color: t.textPrimary }]}
              multiline
            />
            <Pressable
              onPress={enviar}
              disabled={enviando}
              style={[styles.sendBtn, { backgroundColor: t.primary }]}
            >
              <Text style={{ color: t.onPrimary, fontWeight: '600' }}>➤</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 0.5, padding: 20 },
  bubble: { borderRadius: 16, padding: 12, marginBottom: 8, maxWidth: '85%' },
  inputRow: { flexDirection: 'row', gap: 8, marginTop: 8, alignItems: 'flex-end' },
  input: { flex: 1, borderWidth: 0.5, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
