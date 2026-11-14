p = "src/screens/HomeSocioScreen.js"
s = open(p, "r", encoding="utf-8").read()

s = s.replace(
    "fontWeight: '800', fontSize: 13 }}>✨ Crear historia",
    "fontWeight: '800', fontSize: 13, textAlign: 'center' }}>✨ Crear historia"
).replace(
    "fontWeight: '800', fontSize: 13 }}>{r.label}",
    "fontWeight: '800', fontSize: 13, textAlign: 'center' }}>{r.label}"
).replace(
    "fontWeight: '800', fontSize: 13 }}>↗ Más opciones",
    "fontWeight: '800', fontSize: 13, textAlign: 'center' }}>↗ Más opciones"
).replace(
    "flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14",
    "flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16, justifyContent: 'center'"
)

open(p, "w", encoding="utf-8").write(s)
print("COMANDO 3 OK: Letras centradas en HomeSocioScreen")
