import re

path = "src/screens/HomeSocioScreen.js"
with open(path, "r", encoding="utf-8") as f:
    code = f.read()

ref_match = re.search(r'captureRef\(\s*(\w+)', code)
ref_name = ref_match.group(1) if ref_match else "cardRef"

patron_modal = re.compile(r'<Modal[^>]*visible=\{verLogro\}[\s\S]*?</Modal>')

nuevo_modal = """<Modal visible={verLogro} transparent animationType="fade" onRequestClose={() => setVerLogro(false)}>
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

          <View ref={__REF_NAME__} collapsable={false} style={{ width: 292, height: 518, borderRadius: 24, overflow: 'hidden', borderWidth: 1.5, borderColor: 'rgba(168, 85, 247, 0.55)' }}>
            <TarjetaAsistencia
              estilo={estiloLogro}
              racha={stats.racha}
              visitasMes={stats.visitasMes}
              metaVisitas={META_VISITAS}
              emoji={emojiLogro(stats.racha)}
              frase={fraseLogro(stats.racha)}
              gymNombre={gym?.nombre || 'EnerGym'}
              gymIg={gym?.instagram || ''}
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
      </Modal>""".replace("__REF_NAME__", ref_name)

if patron_modal.search(code):
    code = patron_modal.sub(nuevo_modal, code, count=1)
    with open(path, "w", encoding="utf-8") as f:
        f.write(code)
    print("SINTAXIS DEL MODAL CORREGIDA OK")
else:
    print("No se encontro el bloque Modal")
