p = "src/screens/HomeSocioScreen.js"
s = open(p, "r", encoding="utf-8").read()

s = s.replace("gym?.nombre", "(typeof gimnasio !== 'undefined' ? gimnasio?.nombre : null)")
s = s.replace("gym?.instagram", "(typeof gimnasio !== 'undefined' ? gimnasio?.instagram : null)")

open(p, "w", encoding="utf-8").write(s)
print("VARIABLE GYM CORREGIDA OK")
