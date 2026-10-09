import sys, shutil, os
def ind(l):
    return l[:len(l) - len(l.lstrip())]
p = "src/screens/BibliotecaScreen.js"
if not os.path.exists(p):
    print("No encuentro " + p + ". Ejecuta este script desde ~/Desktop/energym/app")
    sys.exit()
L = open(p, encoding="utf-8").read().split("\n")
if any("rutinaImgWrap" in l for l in L):
    print("YA APLICADO")
    sys.exit()
a = [i for i, l in enumerate(L) if l.strip() == "{uri ? ("]
b = [i for i, l in enumerate(L) if l.strip() == "<View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>"]
c = [i for i, l in enumerate(L) if l.strip() == "<Text style={styles.modalDesc}>{detalle.descripcion}</Text>"]
d = [i for i, l in enumerate(L) if l.strip() == "rutinaImg: { width: 56, height: 56, borderRadius: 14, backgroundColor: '#fff' },"]
n = [len(a), len(b), len(c), len(d)]
if n != [1, 1, 1, 1]:
    print("NO COINCIDE " + str(n) + ", no se modifico nada")
    sys.exit()
ia, ib = a[0], b[0]
forma_a = (L[ia + 1].strip().startswith("<Image source={{ uri }} style={styles.rutinaImg}") and L[ia + 2].strip() == ") : (" and L[ia + 3].strip() == "<View style={styles.rutinaImg} />" and L[ia + 4].strip() == ")}")
forma_b = (L[ib + 1].strip().startswith('<TextInput style={styles.inputMini} placeholder="Series"') and L[ib + 3].strip().startswith('<TextInput style={styles.inputMini} placeholder="Reps"') and L[ib + 5].strip().startswith('<TextInput style={styles.inputMini} placeholder="Kg"') and L[ib + 7].strip() == "</View>")
if not (forma_a and forma_b):
    print("NO COINCIDE la forma de los bloques (imagen: " + str(forma_a) + ", campos: " + str(forma_b) + "), no se modifico nada")
    sys.exit()
estilos = """rutinaImg: { width: 88, height: 88, borderRadius: 18, backgroundColor: '#fff' },
rutinaImgWrap: { width: 88, height: 88 },
verBtn: { position: 'absolute', bottom: 4, left: 4, right: 4, backgroundColor: t.primary, borderRadius: 10, paddingVertical: 3, alignItems: 'center' },
verBtnTexto: { color: t.onPrimary, fontSize: 11, fontWeight: '800' },
chipCampo: { flex: 1, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: t.border },
chipLabel: { backgroundColor: t.surface, color: t.textSecondary, fontSize: 10, fontWeight: '700', textAlign: 'center', paddingVertical: 4 },
chipInput: { backgroundColor: t.primary, color: t.onPrimary, fontSize: 18, fontWeight: '800', textAlign: 'center', paddingVertical: 6 },""".split("\n")
campos = """<View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
  <View style={styles.chipCampo}>
    <Text style={styles.chipLabel} numberOfLines={1}>Series</Text>
    <TextInput style={styles.chipInput} placeholder="0" placeholderTextColor={t.onPrimary} keyboardType="numeric"
      value={marcas[String(e.id)]?.series ?? ''} onChangeText={(v) => setMarca(String(e.id), 'series', v)} />
  </View>
  <View style={styles.chipCampo}>
    <Text style={styles.chipLabel} numberOfLines={1} adjustsFontSizeToFit>Repeticiones</Text>
    <TextInput style={styles.chipInput} placeholder="0" placeholderTextColor={t.onPrimary} keyboardType="numeric"
      value={marcas[String(e.id)]?.reps ?? ''} onChangeText={(v) => setMarca(String(e.id), 'reps', v)} />
  </View>
  <View style={styles.chipCampo}>
    <Text style={styles.chipLabel} numberOfLines={1}>Kg</Text>
    <TextInput style={styles.chipInput} placeholder="0" placeholderTextColor={t.onPrimary} keyboardType="decimal-pad"
      value={marcas[String(e.id)]?.kg ?? ''} onChangeText={(v) => setMarca(String(e.id), 'kg', v)} />
  </View>
</View>""".split("\n")
imagen = """<View style={styles.rutinaImgWrap}>
  {uri ? (
    <Image source={{ uri }} style={styles.rutinaImg} resizeMode="cover" />
  ) : (
    <View style={[styles.rutinaImg, { alignItems: 'center', justifyContent: 'center' }]}><Text style={{ fontSize: 30 }}>\U0001F4AA</Text></View>
  )}
  {e.videoUrl ? (
    <Pressable style={styles.verBtn} onPress={() => Linking.openURL(e.videoUrl)}>
      <Text style={styles.verBtnTexto}>\u25B6 Ver</Text>
    </Pressable>
  ) : null}
</View>""".split("\n")
video = """{detalle.videoUrl ? (
  <Pressable style={[styles.modalBtn, { backgroundColor: t.coral }]} onPress={() => Linking.openURL(detalle.videoUrl)}>
    <Text style={[styles.modalBtnText, { color: '#2B1710' }]}>Ver video</Text>
  </Pressable>
) : null}""".split("\n")
shutil.copy(p, "/tmp/Biblioteca_antes_tarjetas.bak")
xd = ind(L[d[0]])
L[d[0]:d[0] + 1] = [xd + s for s in estilos]
xb = ind(L[ib])
L[ib:ib + 8] = [xb + s for s in campos]
xa = ind(L[ia])
L[ia:ia + 5] = [xa + s for s in imagen]
xc = ind(L[c[0]])
L[c[0] + 1:c[0] + 1] = [xc + s for s in video]
open(p, "w", encoding="utf-8").write("\n".join(L))
print("OK")

