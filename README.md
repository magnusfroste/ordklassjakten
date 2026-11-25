# Ordklassjakten

Svenska åk 4–6: ordklasser (substantiv, verb, adjektiv, pronomen). 114 meningar, tre nivåer,
åtta uppgifter per runda. Statisk app, inga externa resurser utöver kodsnutten från skolappar.com.

- Spellogik: `public/app.js`, meningbank: `public/bank.js` (genereras av `genbank.py`)
- Kontroll: `node verify.mjs` (ordet finns en gång i meningen, en klass per ord, 9 000 rundor)
- Ikoner och og-bild: `python3 kit.py`
- Publicerad på https://ordklassjakten.shipholm.dev
