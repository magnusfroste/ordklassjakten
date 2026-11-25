#!/usr/bin/env python3
"""Bygger public/bank.js ur en handskriven meningbank. Ordet som markeras skrivs
exakt som det står i meningen (versal i början av mening räknas som samma ord)."""
import json
import pathlib

RAW = """
Hunden|sub|Hunden sover på mattan.
katten|sub|Katten sitter i fönstret.
bollen|sub|Bollen rullar nerför backen.
flickan|sub|Flickan läser en bok.
pojken|sub|Pojken cyklar till skolan.
skolan|sub|Vi går till skolan varje morgon.
boken|sub|Boken ligger på bordet.
stolen|sub|Stolen står vid fönstret.
trädet|sub|Trädet har gröna löv.
blomman|sub|Blomman luktar gott.
fågeln|sub|Fågeln sjunger i busken.
hästen|sub|Hästen springer på ängen.
cykeln|sub|Cykeln är blå och ny.
bilen|sub|Bilen står på gatan.
vattnet|sub|Vattnet i sjön är kallt.
äpplet|sub|Äpplet ligger i korgen.
kakan|sub|Kakan doftar kanel.
mjölken|sub|Mjölken står i kylskåpet.
läraren|sub|Läraren skriver på tavlan.
eleven|sub|Eleven räcker upp handen.
Mamma|sub|Mamma lagar soppa i köket.
syster|sub|Min syster heter Elsa.
staden|sub|Staden har många gator.
skogen|sub|Skogen är tyst på vintern.
sjön|sub|Sjön ligger bakom berget.
solen|sub|Solen skiner över taken.
månen|sub|Månen lyser i natt.
stjärnan|sub|Stjärnan blinkar på himlen.
regnet|sub|Regnet trummar mot rutan.
snön|sub|Snön täcker hela gården.
pennan|sub|Pennan ligger i väskan.
ryggsäcken|sub|Ryggsäcken hänger på kroken.
mössan|sub|Mössan är varm och mjuk.
näsan|sub|Näsan är röd av kyla.
svansen|sub|Svansen viftar glatt.
springer|verb|Pojken springer över gräset.
hoppar|verb|Kaninen hoppar över stenen.
äter|verb|Flickan äter en smörgås.
läser|verb|Pappa läser tidningen.
skriver|verb|Elsa skriver ett brev.
målar|verb|Vi målar staketet rött.
bygger|verb|Barnen bygger ett torn.
cyklar|verb|Jag cyklar hem från skolan.
sjunger|verb|Kören sjunger en sång.
dansar|verb|Mormor dansar i köket.
tvättar|verb|Han tvättar händerna.
lagar|verb|Kocken lagar mat åt oss.
letar|verb|Vi letar efter nyckeln.
hittar|verb|Hon hittar sin vante.
gömmer|verb|Katten gömmer sig under soffan.
väntar|verb|Bussen väntar vid hållplatsen.
öppnar|verb|Du öppnar dörren försiktigt.
stänger|verb|De stänger fönstret.
kastar|verb|Emil kastar bollen högt.
fångar|verb|Jag fångar bollen med båda händer.
ritar|verb|Lillasyster ritar en häst.
lyssnar|verb|Vi lyssnar på radio.
viskar|verb|Läraren viskar något.
skrattar|verb|Alla skrattar åt skämtet.
gråter|verb|Bebisen gråter högt.
hjälper|verb|Storebror hjälper mig.
sprang|verb|Hästen sprang över fältet.
läste|verb|Jag läste boken i går.
skrev|verb|Hon skrev ett kort till farmor.
byggde|verb|Vi byggde en koja i skogen.
målade|verb|Barnen målade teckningar.
hoppade|verb|Grodan hoppade ner i dammen.
sov|verb|Katten sov hela dagen.
åt|verb|Vi åt lunch klockan tolv.
hörde|verb|Jag hörde en fågel kvittra.
såg|verb|Han såg en älg i skogen.
röd|adj|Flickan har en röd jacka.
stor|adj|En stor lastbil kör förbi.
lilla|adj|Den lilla musen gömmer sig.
glad|adj|Pojken är glad i dag.
kallt|adj|Vattnet är kallt i morse.
varm|adj|Soppan är varm och god.
snäll|adj|Hunden är snäll mot alla.
trött|adj|Jag är trött efter skolan.
hungrig|adj|Katten är hungrig på kvällen.
blå|adj|Himlen är blå i dag.
grönt|adj|Grodan sitter på ett grönt blad.
rund|adj|Månen ser rund ut.
mjuk|adj|Kissen är mjuk som bomull.
tung|adj|Väskan är tung att bära.
lätt|adj|Fjädern är lätt som luft.
rolig|adj|Filmen var rolig och spännande.
viktigt|adj|Det är viktigt att lyssna.
gammal|adj|Farfar har en gammal klocka.
ny|adj|Mamma har köpt en ny bil.
arg|adj|Läraren blev arg på buset.
tjock|adj|Björnen har tjock päls.
smal|adj|Katten är smal och snabb.
högt|adj|Tornet är mycket högt.
låg|adj|Bänken är låg och bred.
vit|adj|Snön är vit och kall.
svart|adj|Katten har svart päls.
brun|adj|Hästen är brun och stor.
gul|adj|Solen är gul och rund.
rent|adj|Golvet är rent nu.
smutsig|adj|Jackan blev smutsig i regnet.
Jag|pron|Jag bor i Stockholm.
du|pron|Du har en fin mössa.
han|pron|Han spelar fotboll i laget.
hon|pron|Hon läser en spännande bok.
vi|pron|Vi går till biblioteket.
de|pron|De bor i ett rött hus.
mig|pron|Kan du hjälpa mig?
dig|pron|Jag väntar på dig.
honom|pron|Vi såg honom på torget.
henne|pron|Jag gav blomman till henne.
oss|pron|Läraren läser för oss.
dem|pron|Jag känner dem sedan länge.
ni|pron|Ni kan sätta er nu.
"""

KLASSER = {
    "sub": {"namn": "substantiv", "forklaring": "namn på saker, djur och personer",
            "exempel": "hund, stol, Elsa"},
    "verb": {"namn": "verb", "forklaring": "något man gör eller är",
             "exempel": "springer, sover, läser"},
    "adj": {"namn": "adjektiv", "forklaring": "ord som beskriver hur något är",
            "exempel": "röd, stor, glad"},
    "pron": {"namn": "pronomen", "forklaring": "ord man använder i stället för namn",
             "exempel": "jag, du, hon, vi"},
}

tasks = []
for line in RAW.strip().splitlines():
    w, k, s = line.strip().split("|")
    # markera ordet exakt som det står i meningen (versal i meningsstart räknas som samma ord)
    i = s.lower().find(w.lower())
    assert i >= 0, f"ordet {w} finns inte i: {s}"
    tasks.append({"w": s[i:i + len(w)], "k": k, "s": s})

assert set(t["k"] for t in tasks) == set(KLASSER), "okänd klass"

out = "// Ordklassjakten – meningbank. Ordet i fältet w är exakt som det står i meningen s.\n"
out += "// Klasserna: sub = substantiv, verb = verb, adj = adjektiv, pron = pronomen.\n"
out += "const BANK = " + json.dumps(tasks, ensure_ascii=False, indent=0).replace("\n", "") + ";\n\n"
out += "const KLASSER = " + json.dumps(KLASSER, ensure_ascii=False, indent=2) + ";\n\n"
out += """if (typeof window !== 'undefined') { window.BANK = BANK; window.KLASSER = KLASSER; }
if (typeof module !== 'undefined') { module.exports = { BANK, KLASSER }; }
"""
p = pathlib.Path(__file__).parent / "public" / "bank.js"
p.write_text(out, encoding="utf-8")
print(len(tasks), "uppgifter,", p.stat().st_size, "byte")