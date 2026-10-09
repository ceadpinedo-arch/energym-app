import sys, shutil, os
def ind(l):
    return l[:len(l) - len(l.lstrip())]
def cierre(L, i):
    x = ind(L[i])
    for j in range(i + 1, len(L)):
        if ind(L[j]) == x and L[j].strip() == "</View>":
            return j
    return -1
p = "src/screens/BibliotecaScreen.js"
if not os.path.exists(p):
    print("No encuentro " + p + ". Ejecuta este script desde ~/Desktop/energym/app")
    sys.exit()
L = open(p, encoding="utf-8").read().split("\n")
if any("filaLabel" in l for l in L):
    print("YA APLICADO")
    sys.exit()
if not any("rutinaImgWrap" in l for l in L):
    print("Falta aplicar antes tarjetas_rutina.py, no se modifico nada")
    sys.exit()
a = [i for i, l in enumerate(L) if l.strip() == "<View style={styles.rutinaImgWrap}>"]
b = [i for i, l in enumerate(L) if l.strip() == "<View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>" and i + 1 < len(L) and "styles.chipCampo" in L[i + 1]]
s = [i for i, l in enumerate(L) if l.strip().startswith("rutinaImg: { width: 88")]
n = [len(a), len(b), len(s)]
if n != [1, 1, 1]:
    print("NO COINCIDE " + str(n) + ", no se modifico nada")
    sys.exit()
ea = cierre(L, a[0])
eb = cierre(L, b[0])
claves = ["rutinaImg:", "rutinaImgWrap:", "verBtn:", "verBtnTexto:", "chipCampo:", "chipLabel:", "chipInput:"]
ok_s = all(L[s[0] + k].strip().startswith(claves[k]) for k in range(7))
if ea < 0 or eb < 0 or not ok_s or eb < ea:
    print("NO COINCIDE la forma de los bloques (" + str([ea, eb, ok_s]) + "), no se modifico nada")
    sys.exit()
estilos = """rutinaImg: { width: 120, height: 104, borderRadius: 18, backgroundColor: '#fff' },
rutinaImgWrap: { width: 120, height: 104, marginRight: 10, marginBottom: 10 },
verBtn: { position: 'absolute', bottom: -10, left: 8, right: 8, backgroundColor: t.primary, borderRadius: 14, paddingVertical: 4, alignItems: 'center' },
verBtnTexto: { color: t.onPrimary, fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
fila: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
filaLabel: { flex: 1, backgroundColor: t.surface, color: t.textSecondary, fontSize: 12, fontWeight: '800', paddingVertical: 8, paddingHorizontal: 10, borderTopLeftRadius: 12, borderBottomLeftRadius: 12, overflow: 'hidden' },
filaInput: { width: 62, backgroundColor: t.primary, color: t.onPrimary, fontSize: 17, fontWeight: '900', textAlign: 'center', paddingVertical: 5, borderTopRightRadius: 12, borderBottomRightRadius: 12 },""".split("\n")
def fila(nombre, clave, teclado):
    return [
        "<View style={styles.fila}>",
        "  <Text style={styles.filaLabel} numberOfLines={1}>" + nombre + "</Text>",
        "  <TextInput style={styles.filaInput} placeholder=\"0\" placeholderTextColor={t.onPrimary} keyboardType=\"" + teclado + "\"",
        "    value={marcas[String(e.id)]?." + clave + " ?? ''} onChangeText={(v) => setMarca(String(e.id), '" + clave + "', v)} />",
        "</View>",
    ]
campos = ["<View>"] + ["  " + x for x in fila("SERIES", "series", "numeric") + fila("REPETICIONES", "reps", "numeric") + fila("KG", "kg", "decimal-pad")] + ["</View>"]
imagen = """<View style={styles.rutinaImgWrap}>
  {uri ? (
    <Image source={{ uri }} style={styles.rutinaImg} resizeMode="cover" />
  ) : (
    <View style={[styles.rutinaImg, { alignItems: 'center', justifyContent: 'center' }]}><Text style={{ fontSize: 34 }}>\U0001F4AA</Text></View>
  )}
  {e.videoUrl ? (
    <Pressable style={styles.verBtn} onPress={() => Linking.openURL(e.videoUrl)}>
      <Text style={styles.verBtnTexto}>\u25B6 VER AHORA</Text>
    </Pressable>
  ) : null}
</View>""".split("\n")
shutil.copy(p, "/tmp/Biblioteca_antes_v2.bak")
xa = ind(L[a[0]])
xb = ind(L[b[0]])
bloques = [(s[0], s[0] + 7, [ind(L[s[0]]) + z for z in estilos]), (b[0], eb + 1, [xb + z for z in campos]), (a[0], ea + 1, [xa + z for z in imagen])]
for ini, fin, nuevo in sorted(bloques, key=lambda t3: -t3[0]):
    L[ini:fin] = nuevo
r = [i for i, l in enumerate(L) if l.strip().startswith("rutinaRow: {")]
if len(r) == 1 and "borderStyle" not in L[r[0]] and L[r[0]].rstrip().endswith("},"):
    t0 = L[r[0]].rstrip()
    L[r[0]] = t0[:-2] + ", borderWidth: 1.5, borderStyle: 'dashed', borderColor: t.border },"
    print("Borde punteado agregado a rutinaRow")
else:
    print("rutinaRow no se toco (" + str(len(r)) + " coincidencias)")
open(p, "w", encoding="utf-8").write("\n".join(L))
print("OK")
