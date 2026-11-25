# Ordklassjakten – koncept och testplan

**Mål (en sak):** eleven ska kunna avgöra vilken ordklass ett ord i en mening tillhör.
**Målgrupp:** svenska åk 4–6 (9–11 år). Läskunnig, men inte van vid grammatiska etiketter.
**Kärnmekanik (touch först):** en riktig mening står i mitten, ett ord lyser med pulserande ram.
Fyra (nivå 1: två) stora knappar längst ned: substantiv, verb, adjektiv, pronomen. Ett tryck = ett svar.
**5-minuterssession:** 8 uppgifter per runda, tre nivåer, rundan tar 2–3 minuter – "en runda till" är billig.
**Belöning barnet kan berätta om:** stjärnor (en per rätt svar på första försöket) och en rad som säger
vad ordet var ("stänger är ett verb – något man gör eller är").
**Vad barnet lär:** kriteriet för varje ordklass, inte bara etiketten; att tempusformer (sprang, läste)
fortfarande är verb och att pronomen står i stället för namn.
**Lgr22:** SV.4-6.1.7 – "Stavning, ords böjningsformer och ordklasser." (ordagrant ur Skolverkets
centrala innehåll, hämtat via get_curriculum 2026-11-25). Punktens text i sin helhet citeras på
startskärmen.
**Varför iPad:** två tryckytor i botten som en 9-åring träffar med tummen, ingen drag, ingen text
som måste scrollas, inget ljud som krävs (allt står också skrivet), inga länkar ut.

## Testplan (mätbara krav)

| Krav | Mätning | Utfall |
|---|---|---|
| Allt ryms, ingen sidscroll | `scrollHeight-innerHeight` = 0 och `scrollWidth-innerWidth` = 0 i 1024×768, 768×1024, 390×844, 1440×900 | 0/0 i alla fyra, både på startskärmen och i spelet |
| Tryckytor | minst 56 px höga (åk 3–6 → ≥ 56) | 68 px (iPad/desktop), 78 px (390 px telefon) |
| Spelbart med bara fingrar | hela rundan med `Input.dispatchTouchEvent` (touchStart/Move/End) | nivå 1: 8/8, nivå 3: 8/8 med fyra knappar 242 px breda |
| Tangentbord som tredje väg | siffra 1–4 väljer knapp | `2` gav rätt svar på "hörde" |
| Återkoppling + nytt försök | fel svar flyttar inte uppgiften, andra felet tänder rätt knapp | verifierat: `S.i` stod kvar, rätt knapp fick puls |
| Ingen förlust | stjärnor kan inte bli negativa, ingen timer | 7/8 efter ett avsiktligt fel |
| Faktakontroll | ordet finns exakt en gång i meningen, ett ord = en klass, 9 000 rundor | `node verify.mjs`: 114 uppgifter, 0 fel |
| Mörk/ljus, rörelse | `prefers-reduced-motion` stänger av puls | `animationName: none` |
| Inga externa resurser | bara `kotten.js` från skolappar.com | alla andra filer lokala |

## Validering före bygge (go/no-go)

`delegate_task` finns inte i den här körningens verktyg, så granskningen gjordes som en skriven
självkritik mot de tre frågorna:
(a) *Spelar ett barn frivilligt 5 minuter?* Ja om rundan är kort och svaret ger en förklaring –
därför 8 uppgifter, stjärnor och "en runda till". Svagheten är att mekaniken är en frågesport utan
rörelse; motmedlet är att målet lyser i meningen så att barnet slipper leta.
(b) *Träffar det ett verkligt kunskapskrav?* Ja, SV.4-6.1.7 nämner ordklasser uttryckligen, och
ordklasser förhörs i nationella provens språkdel i åk 6.
(c) *Teknisk risk?* Låg: ingen fysik, ingen canvas, ingen server. Den verkliga risken är grammatisk
– därför bara entydiga ord (inga adverb på -t, inga partiklar) och en verifierare som kontrollerar
att varje ord hör till en och bara en klass. **GO.**

## Iteration efter test

1. Fel-svaret var först "Titta på ordet en gång till", vilket inte säger något om *varför*. Nu:
   "Inte riktigt. stänger är inte ett substantiv. Prova igen." – barnets hypotes namnges, kriteriet
   blir synligt.
2. Kortbilden togs först direkt efter ett rätt svar (utfylld grön knapp + förklaring), vilket läste
   som en resultatskärm. Ny bild: pågående uppgift, mening + markerat ord + de tre knapparna.

## Vad som återstår

Publicering på `ordklassjakten.shipholm.dev` är blockerad: kontot har 50 av 50 appar (Pro-planen).
Repot är pushat (`github.com/magnusfroste/ordklassjakten`, `main` = 5cc329c) och appen är testad
lokalt; `create_app` svarar "the pro plan allows 50 apps and you have 50". Katalograd, bild och
Lgr22-punkter läggs in så snart en plats finns.