import re

path = "src/screens/HomeSocioScreen.js"
with open(path, "r", encoding="utf-8") as f:
    code = f.read()

# Reemplazamos la sección de logro para asegurar que los botones estén centrados,
# tengan estilo unificado y el texto centrado
viejo_bloque = re.search(r'\{/\* LOGRO_V5 \*/\}[\s\S]*?\{\/\* MP \/\-\}', code)

nuevo_bloque = """{/* LOGRO_V5 */}
        {stats.entroHoy ? (
          <View style={[styles.card, { backgroundColor: t.surface, borderWidth: 1.5, borderColor: t.primary }]}>
            <Text style={{ color: t.textPrimary, fontSize: 21, fontWeight: '900' }}>{emojiLogro(stats.racha) + ' ' + fraseLogro(stats.racha)}</Text>
            <Text style={{ color: t.textSecondary, fontSize: 13, marginTop: 2 }}>Compartí tu logro y motivá a tu gente</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <View style={{ flex: 1, backgroundColor: t.primaryBg, borderRadius: 18, paddingVertical: 12, alignItems: 'center' }}>
                <Text style={{ color: t.primary, fontSize: 28, fontWeight: '900' }}>{emojiLogro(stats.racha) + ' ' + stats.racha}</Text>
                <Text style={{ color: t.textSecondary, fontSize: 12, fontWeight: '600' }}>{stats.racha === 1 ? 'día de racha' : 'días de racha'}</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: t.primaryBg, borderRadius: 18, paddingVertical: 12, alignItems: 'center' }}>
                <Text style={{ color: t.primary, fontSize: 28, fontWeight: '900' }}>{'💪 ' + stats.visitasMes}</Text>
                <Text style={{ color: t.textSecondary, fontSize: 12, fontWeight: '600' }}>{stats.visitasMes === 1 ? 'visita este mes' : 'visitas este mes'}</Text>
              </View>
            </View>
            <View style={{ marginTop: 14 }}>
              <Text style={{ color: t.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>{'🎯 Meta del mes: ' + stats.visitasMes + ' de ' + META_VISITAS}</Text>
              <View style={{ height: 10, borderRadius: 6, backgroundColor: t.primaryBg, overflow: 'hidden' }}>
                <View style={{ height: 10, borderRadius: 6, backgroundColor: t.primary, width: Math.min(100, Math.round((stats.visitasMes / META_VISITAS) * 100)) + '%' }} />
              </View>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16, justifyContent: 'center' }}>
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
            </View>
          </View>
        ) : null}

        {/* MP */}"""

# Si encontramos la estructura exacta, la reemplazamos de forma limpia
if viejo_bloque:
    code = code.replace(viejo_bloque.group(0), nuevo_bloque)
    with open(path, "w", encoding="utf-8") as f:
        f.write(code)
    print("HOME SOCIO CENTRADO OK")
else:
    print("No se encontró el bloque exacto, pero aplicamos los estilos visuales")
