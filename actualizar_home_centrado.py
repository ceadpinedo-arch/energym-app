path = "src/screens/HomeSocioScreen.js"
with open(path, "r", encoding="utf-8") as f:
    code = f.read()

# Buscamos y reemplazamos el contenedor de botones de logro por uno con flexWrap y justifyContent: center
viejo = """            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
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
            </View>"""

nuevo = """            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16, justifyContent: 'center' }}>
              <Pressable
                onPress={() => setVerLogro(true)}
                style={({ pressed }) => ({ flexBasis: '47%', minHeight: 48, justifyContent: 'center', alignItems: 'center', backgroundColor: t.primary, borderRadius: 16, paddingHorizontal: 12, opacity: pressed ? 0.85 : 1 })}
              >
                <Text style={{ color: t.onPrimary, fontWeight: '800', fontSize: 13, textAlign: 'center' }}>✨ Crear historia</Text>
              </Pressable>
              {redesActivas.map((r) => (
                <Pressable
                  key={r.id}
                  onPress={() => compartirEn(r.id)}
                  style={({ pressed }) => ({ flexBasis: '47%', minHeight: 48, justifyContent: 'center', alignItems: 'center', backgroundColor: t.primaryBg, borderRadius: 16, paddingHorizontal: 12, opacity: pressed ? 0.85 : 1 })}
                >
                  <Text style={{ color: t.primary, fontWeight: '800', fontSize: 13, textAlign: 'center' }}>{r.label}</Text>
                </Pressable>
              ))}
              <Pressable
                onPress={compartirGeneral}
                style={({ pressed }) => ({ flexBasis: '47%', minHeight: 48, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: t.primary, borderRadius: 16, paddingHorizontal: 12, opacity: pressed ? 0.85 : 1 })}
              >
                <Text style={{ color: t.primary, fontWeight: '800', fontSize: 13, textAlign: 'center' }}>↗ Más opciones</Text>
              </Pressable>
            </View>"""

if viejo in code:
    code = code.replace(viejo, nuevo)
    with open(path, "w", encoding="utf-8") as f:
        f.write(code)
    print("HOME BOTONES CENTRADOS OK")
else:
    print("Ya estaban centrados o formato diferente")
