 import sys, shutil, os
def ind(l):
    return l[:len(l) - len(l.lstrip())]
def cierre(L, i):
    x = ind(L[i])
    for j in range(i + 1, len(L)):
        if ind(L[j]) == x and L[j].strip() == "</View>":
            return j
    return -1
def uno(L, f):
    return [i for i, l in enumerate(L) if f(l.strip())]
p = "src/screens/BibliotecaScreen.js"
if not os.path.exists(p):
    print("No encuentro " + p + ". Ejecuta este script desde ~/Desktop/energym/app")
    sys.exit()
L = open(p, encoding="utf-8").read().split("\n")
if any("rutinaTop" in l for l in L):
    print("YA APLICADO")
    sys.exit()
sp = uno(L, lambda s: s.startswith("<Pressable style={[styles.spotifyBtn"))
sv = uno(L, lambda s: s == "<ScrollView style={{ marginTop: 12 }}>")
r0 = uno(L, lambda s: s == "<View key={String(e.id)} style={styles.rutinaRow}>")
sr = uno(L, lambda s: s.startswith("rutinaRow: {"))
sd = uno(L, lambda s: s.startswith("diaChip: {"))
n = [len(sp), len(sv), len(r0), len(sr), len(sd)]
if n != [1, 1, 1, 1, 1]:
    print("NO COINCIDE " + str(n) + ", no se modifico nada")
    sys.exit()
sp, sv, r0, sr, sd = sp[0], sv[0], r0[0], sr[0], sd[0]
if not ("Escuchar en Spotify" in L[sp + 1] and L[sp + 2].strip() == "</Pressable>"):
    print("NO COINCIDE el bloque de Spotify, no se modifico nada")
    sys.exit()
i1 = r0 + 1
if L[i1].strip() != "<View style={styles.rutinaImgWrap}>":
    print("NO COINCIDE la imagen, no se modifico nada")
    sys.exit()
e1 = cierre(L, i1)
c0 = e1 + 4
if e1 < 0 or L[e1 + 1].strip() != "<View style={{ flex: 1 }}>" or "styles.itemTitle" not in L[e1 + 2] or "styles.itemDesc" not in L[e1 + 3] or not L[c0].strip().startswith("<View style={{ flexDirection: 'row', gap: 8"):
    print("NO COINCIDE la columna de texto, no se modifico nada")
    sys.exit()
ec = cierre(L, c0)
d0 = ec + 1
if ec < 0 or "flexWrap: 'wrap'" not in L[d0]:
    print("NO COINCIDE la fila de dias, no se modifico nada")
    sys.exit()
ed = cierre(L, d0)
u0 = ed + 1
if ed < 0 or not L[u0].strip().startswith("{ultimos["):
    print("NO COINCIDE Ultima vez, no se modifico nada")
    sys.exit()
ue = -1
for j in range(u0, len(L)):
    if L[j].strip() == ") : null}":
        ue = j
        break
fl = ue + 1
if ue < 0 or L[fl].strip() != "</View>" or not L[fl + 1].strip().startswith("<Pressable onPress={() => toggle(") or L[fl + 3].strip() != "</Pressable>" or L[fl + 4].strip() != "</View>":
    print("NO COINCIDE el cierre de la tarjeta, no se modifico nada")
    sys.exit()
x = ind(L[i1])
dias = L[d0:ed + 1]
dias[0] = ind(dias[0]) + "<View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>"
nuevo = ([x + "<View style={styles.rutinaTop}>"] + L[i1:e1 + 1] + L[e1 + 1:e1 + 4] + [ind(L[fl]) + "</View>"] + L[fl + 1:fl + 4] + [x + "</View>"]
         + L[c0:ec + 1] + dias + L[u0:ue + 1])
shutil.copy(p, "/tmp/Biblioteca_antes_v3.bak")
del L[sp:sp + 3]
L[i1:fl + 4] = nuevo
L[sv] = ind(L[sv]) + "<ScrollView style={{ marginTop: 12, flexShrink: 1 }}>"
k = [i for i, l in enumerate(L) if l.strip().startswith("rutinaRow: {")][0]
q = ind(L[k])
L[k] = q + "rutinaRow: { backgroundColor: t.bg, borderRadius: 20, padding: 12, marginBottom: 10 },"
L.insert(k + 1, q + "rutinaTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },")
k2 = [i for i, l in enumerate(L) if l.strip().startswith("diaChip: {")][0]
q2 = ind(L[k2])
L[k2] = q2 + "diaChip: { flex: 1, alignItems: 'center', paddingHorizontal: 6, paddingVertical: 9, borderRadius: 16, borderWidth: 1, borderColor: t.border, backgroundColor: t.surface },"
open(p, "w", encoding="utf-8").write("\n".join(L))
print("OK")
