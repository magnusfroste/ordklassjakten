/* verify.mjs – kontrollerar meningbanken och rundgenereringen i Ordklassjakten.
   Kör: node verify.mjs */
import fs from 'node:fs';
import path from 'node:path';

const rot = path.dirname(new URL(import.meta.url).pathname);
const bankKod = fs.readFileSync(path.join(rot, 'public/bank.js'), 'utf8');
const { BANK, KLASSER } = new Function(bankKod + '\nreturn { BANK, KLASSER };')();
const appKod = fs.readFileSync(path.join(rot, 'public/app.js'), 'utf8');

let fel = [];
function kolla(villkor, meddelande) { if (!villkor) fel.push(meddelande); }

/* 1. konstanterna i app.js måste stämma med verifieringen */
const KVOT = { 1: { sub: 4, verb: 4 }, 2: { sub: 3, verb: 3, adj: 2 }, 3: { sub: 2, verb: 2, adj: 2, pron: 2 } };
const NIVAKLASSER = { 1: ['sub', 'verb'], 2: ['sub', 'verb', 'adj'], 3: ['sub', 'verb', 'adj', 'pron'] };
kolla(/PER_RUNDA = 8/.test(appKod), 'app.js: PER_RUNDA är inte 8');
kolla(/KVOT = \{ 1: \{ sub: 4, verb: 4 \}/.test(appKod), 'app.js: KVOT stämmer inte med verify.mjs');
kolla(/NIVAKLASSER = \{ 1: \['sub', 'verb'\], 2: \['sub', 'verb', 'adj'\]/.test(appKod), 'app.js: NIVAKLASSER stämmer inte');

/* 2. varje uppgift: ordet finns exakt en gång, som eget ord, i meningen */
const ordKarta = new Map();
for (const t of BANK) {
  const ord = t.w.toLowerCase();
  const token = t.s.split(/\s+/).map(x => x.replace(/[.,!?;:”"’']/g, '').toLowerCase());
  const antal = token.filter(x => x === ord).length;
  kolla(antal === 1, `"${t.w}" finns ${antal} gånger i: ${t.s}`);
  kolla(t.s.split(' ').length >= 3, `för kort mening: ${t.s}`);
  kolla(/^[A-ZÅÄÖ]/.test(t.s), `meningen börjar inte med versal: ${t.s}`);
  kolla(/[.?]$/.test(t.s), `meningen saknar skiljetecken: ${t.s}`);
  kolla(!/  /.test(t.s), `dubbelt mellanslag: ${t.s}`);
  kolla(!!KLASSER[t.k], `okänd klass ${t.k} för ${t.w}`);
  // ordet får bara höra till en klass (böjningsformer räknas som egna ord)
  if (ordKarta.has(ord)) kolla(ordKarta.get(ord) === t.k, `"${ord}" står som både ${ordKarta.get(ord)} och ${t.k}`);
  else ordKarta.set(ord, t.k);
  // ordet får inte vara en del av ett annat ord (t.ex. "vi" i "vid")
  kolla(!token.some(x => x !== ord && x.includes(ord) && x.length <= ord.length + 1 && x.startsWith(ord)),
    `"${t.w}" kan förväxlas med ett annat ord i: ${t.s}`);
}

/* 3. unika meningar och rimliga mängder per klass */
const meningar = new Set();
for (const t of BANK) {
  kolla(!meningar.has(t.s), `dubblett av meningen: ${t.s}`);
  meningar.add(t.s);
}
const antalPerKlass = {};
for (const t of BANK) antalPerKlass[t.k] = (antalPerKlass[t.k] || 0) + 1;
for (const k of Object.keys(KLASSER)) {
  kolla((antalPerKlass[k] || 0) >= 12, `för få uppgifter i klassen ${k}: ${antalPerKlass[k] || 0}`);
}
kolla(BANK.length >= 100, `banken är för liten: ${BANK.length}`);

/* 4. rundgenerering: samma algoritm som app.js, 3000 rundor per nivå */
function blanda(a) {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
}
function byggRunda(niva) {
  const kvot = KVOT[niva], valda = [], anvanda = {};
  for (const k of NIVAKLASSER[niva]) {
    const pool = blanda(BANK.filter(t => t.k === k && !anvanda[t.w.toLowerCase()]));
    const antal = Math.min(kvot[k] || 0, pool.length);
    for (let i = 0; i < antal; i++) { valda.push(pool[i]); anvanda[pool[i].w.toLowerCase()] = true; }
  }
  return blanda(valda);
}
let kontroll = 0;
for (const niva of [1, 2, 3]) {
  for (let r = 0; r < 3000; r++) {
    const u = byggRunda(niva);
    kolla(u.length === 8, `nivå ${niva}: rundan har ${u.length} uppgifter`);
    const ord = u.map(t => t.w.toLowerCase());
    kolla(new Set(ord).size === ord.length, `nivå ${niva}: samma ord två gånger i en runda`);
    for (const k of NIVAKLASSER[niva]) {
      const n = u.filter(t => t.k === k).length;
      kolla(n === KVOT[niva][k], `nivå ${niva}: ${k} fick ${n} av ${KVOT[niva][k]}`);
    }
    for (const t of u) kolla(NIVAKLASSER[niva].includes(t.k), `nivå ${niva}: klassen ${t.k} hör inte till nivån`);
    kontroll++;
  }
}

console.log('Uppgifter:', BANK.length, '| per klass:', antalPerKlass, '| rundor kontrollerade:', kontroll);
console.log('Exempel:');
for (const t of blanda(BANK).slice(0, 12)) console.log('  ', t.k.padEnd(4), t.w.padEnd(12), t.s);
if (fel.length) {
  console.log('\nFEL (' + fel.length + '):');
  [...new Set(fel)].slice(0, 40).forEach(f => console.log('  -', f));
  process.exit(1);
}
console.log('\n0 fel.');