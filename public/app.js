/* Ordklassjakten – svenska åk 4–6: ordklasser.
   En uppgift = en riktig mening med ett markerat ord; eleven väljer ordklass.
   Allt ritas i DOM, inga externa resurser förutom kodsnutten i index.html. */
(function () {
  'use strict';

  var BANK = window.BANK || [];
  var KLASSER = window.KLASSER || {};
  var PER_RUNDA = 8;
  var NIVAKLASSER = { 1: ['sub', 'verb'], 2: ['sub', 'verb', 'adj'], 3: ['sub', 'verb', 'adj', 'pron'] };
  // Hur många uppgifter varje klass får i en runda (summan = 8)
  var KVOT = { 1: { sub: 4, verb: 4 }, 2: { sub: 3, verb: 3, adj: 2 }, 3: { sub: 2, verb: 2, adj: 2, pron: 2 } };
  var FARG = { sub: 'var(--sub)', verb: 'var(--verb)', adj: 'var(--adj)', pron: 'var(--pron)' };

  var S = {
    niva: 1,
    uppgifter: [],
    i: 0,
    stjarnor: 0,
    forsok: 0,
    ljud: true,
    svarar: false,
    lage: 'start'
  };

  var el = {
    start: document.getElementById('startskarm'),
    spel: document.getElementById('spel'),
    slut: document.getElementById('slut'),
    niva: document.getElementById('niva'),
    prickar: document.getElementById('prickar'),
    stjarnantal: document.getElementById('stjarnantal'),
    ljud: document.getElementById('ljud'),
    mening: document.getElementById('mening'),
    svar: document.getElementById('svar'),
    knappar: document.getElementById('knappar'),
    slutRubrik: document.getElementById('slut-rubrik'),
    slutStjarnor: document.getElementById('slut-stjarnor'),
    slutRad: document.getElementById('slut-rad'),
    nasta: document.getElementById('nasta'),
    igen: document.getElementById('igen')
  };

  /* ---------- ljud ---------- */
  var ac = null;
  function kontekst() {
    if (!S.ljud) return null;
    try {
      if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === 'suspended') ac.resume();
      return ac;
    } catch (e) { return null; }
  }
  function ton(frek, langd, typ, volym) {
    var c = kontekst();
    if (!c) return;
    try {
      var o = c.createOscillator(), g = c.createGain();
      o.type = typ || 'sine';
      o.frequency.value = frek;
      g.gain.setValueAtTime(volym || 0.06, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + langd);
      o.connect(g); g.connect(c.destination);
      o.start(); o.stop(c.currentTime + langd);
    } catch (e) { /* ljud är aldrig kritiskt */ }
  }
  function ljudRatt() { ton(660, 0.12, 'sine'); ton(990, 0.16, 'sine'); }
  function ljudFel() { ton(240, 0.16, 'triangle', 0.05); }
  function ljudKlar() { [523, 659, 784, 1047].forEach(function (f, i) { setTimeout(function () { ton(f, 0.20, 'sine'); }, i * 110); }); }

  var roster = null;
  function valjRost() {
    if (!('speechSynthesis' in window)) return null;
    if (roster) return roster;
    var alla = window.speechSynthesis.getVoices() || [];
    for (var i = 0; i < alla.length; i++) {
      if ((alla[i].lang || '').toLowerCase().indexOf('sv') === 0) { roster = alla[i]; return roster; }
    }
    return null;
  }
  function saga(text) {
          try { if (window.__rost && window.__rost(text, true)) return; } catch (e) { }
    if (!S.ljud || !('speechSynthesis' in window) || !text) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'sv-SE';
      u.rate = 0.95;
      u.pitch = 1.05;
      var r = valjRost();
      if (r) u.voice = r;
      window.speechSynthesis.speak(u);
    } catch (e) { /* klassrummets iPads tappar ibland talet – appen får aldrig stanna */ }
  }
  if ('speechSynthesis' in window) {
    try { window.speechSynthesis.onvoiceschanged = function () { roster = null; valjRost(); }; } catch (e) {}
  }

  function skicka(namn, varde) {
    try { if (window.skolappar && typeof window.skolappar.event === 'function') window.skolappar.event(namn, varde); } catch (e) {}
  }

  /* ---------- uppgifter ---------- */
  function blanda(a) {
    var b = a.slice();
    for (var i = b.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = b[i]; b[i] = b[j]; b[j] = t;
    }
    return b;
  }

  function byggRunda(niva) {
    var kvot = KVOT[niva] || KVOT[3];
    var valda = [], anvanda = {}, klasser = NIVAKLASSER[niva];
    klasser.forEach(function (k) {
      var pool = blanda(BANK.filter(function (t) { return t.k === k && !anvanda[t.w.toLowerCase()]; }));
      var antal = Math.min(kvot[k] || 0, pool.length);
      for (var i = 0; i < antal; i++) {
        valda.push(pool[i]);
        anvanda[pool[i].w.toLowerCase()] = true;
      }
    });
    return blanda(valda);
  }

  /* ---------- rita ---------- */
  function ritaPrickar() {
    el.prickar.innerHTML = '';
    for (var i = 0; i < S.uppgifter.length; i++) {
      var p = document.createElement('i');
      p.className = i === S.i ? 'nu' : '';
      el.prickar.appendChild(p);
    }
  }

  function markeraPrick(status) {
    var p = el.prickar.children[S.i];
    if (p) { p.className = status; }
  }

  function ritaKnappar(klasser) {
    el.knappar.className = 'knappar ' + (klasser.length === 2 ? 'tva' : klasser.length === 3 ? 'tre' : 'fyra');
    el.knappar.innerHTML = '';
    klasser.forEach(function (k) {
      var b = document.createElement('button');
      b.className = 'klass';
      b.dataset.klass = k;
      b.style.setProperty('--kc', FARG[k]);
      b.setAttribute('aria-label', KLASSER[k].namn + ': ' + KLASSER[k].forklaring);
      var namn = document.createElement('b');
      namn.textContent = KLASSER[k].namn;
      var forkl = document.createElement('i');
      forkl.textContent = KLASSER[k].forklaring;
      b.appendChild(namn); b.appendChild(forkl);
      b.addEventListener('click', function () { svara(k); });
      el.knappar.appendChild(b);
    });
  }

  function ritaUppgift() {
    var t = S.uppgifter[S.i];
    S.forsok = 0;
    S.svarar = true;
    el.svar.className = 'svar';
    el.svar.textContent = '';

    // meningen ord för ord, målet får en markering
    el.mening.innerHTML = '';
    var mal = t.w.toLowerCase();
    var hittad = false;
    t.s.split(' ').forEach(function (bit, idx, arr) {
      var ren = bit.replace(/[.,!?;:”"’']/g, '').toLowerCase();
      var span = document.createElement('span');
      span.className = 'ord';
      if (!hittad && ren === mal) {
        span.className = 'ord mal';
        hittad = true;
      }
      span.textContent = bit;
      el.mening.appendChild(span);
      if (idx < arr.length - 1) el.mening.appendChild(document.createTextNode(' '));
    });

    var klasser = NIVAKLASSER[S.niva];
    ritaKnappar(klasser);
    ritaPrickar();

    el.niva.textContent = 'Nivå ' + S.niva;
    el.stjarnantal.textContent = String(S.stjarnor);

    saga(t.s + ' Vilken ordklass är ' + t.w.toLowerCase() + '?');
  }

  /* ---------- svar ---------- */
  function svara(k) {
    if (!S.svarar) return;
    var t = S.uppgifter[S.i];
    var ratt = k === t.k;
    var knapp = el.knappar.querySelector('[data-klass="' + k + '"]');

    if (ratt) {
      S.svarar = false;
      if (knapp) { knapp.classList.remove('hint'); knapp.classList.add('ratt'); }
      el.knappar.querySelectorAll('.klass').forEach(function (b) { b.disabled = true; });
      var stjarna = S.forsok === 0;
      if (stjarna) S.stjarnor++;
      el.stjarnantal.textContent = String(S.stjarnor);
      el.svar.className = 'svar ratt';
      el.svar.textContent = 'Rätt! ' + t.w + ' är ett ' + KLASSER[t.k].namn + ' – ' + KLASSER[t.k].forklaring + '.';
      markeraPrick(stjarna ? 'ratt' : 'fel');
      if (stjarna) ljudRatt(); else ton(520, 0.14, 'sine');
      saga('Rätt! ' + t.w + ' är ett ' + KLASSER[t.k].namn + '.');
      setTimeout(nastaUppgift, 1250);
    } else {
      S.forsok++;
      if (knapp) { knapp.classList.add('felval'); knapp.disabled = true; }
      ljudFel();
      if (S.forsok >= 2) {
        var rättKnapp = el.knappar.querySelector('[data-klass="' + t.k + '"]');
        if (rättKnapp) rättKnapp.classList.add('hint');
        el.svar.className = 'svar fel';
        el.svar.textContent = 'Prova knappen som lyser.';
        skicka('hint');
        saga('Prova knappen som lyser.');
      } else {
        el.svar.className = 'svar fel';
        el.svar.textContent = 'Inte riktigt. ' + t.w + ' är inte ett ' + KLASSER[k].namn + '. Prova igen.';
        saga('Inte riktigt. Prova igen.');
      }
    }
  }

  function nastaUppgift() {
    S.i++;
    if (S.i >= S.uppgifter.length) { avslutaRunda(); return; }
    ritaUppgift();
  }

  /* ---------- runda ---------- */
  function startaNiva(niva) {
    S.niva = Math.min(3, Math.max(1, niva || 1));
    S.uppgifter = byggRunda(S.niva);
    S.i = 0;
    S.stjarnor = 0;
    S.lage = 'spel';
    el.start.hidden = true;
    el.slut.hidden = true;
    el.spel.hidden = false;
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    skicka('round_start');
    skicka('level', S.niva);
    ritaUppgift();
    try { window.scrollTo(0, 0); } catch (e) {}
  }

  function avslutaRunda() {
    S.lage = 'slut';
    S.svarar = false;
    var totalt = S.uppgifter.length;
    el.slutStjarnor.textContent = String(S.stjarnor);
    el.slutRubrik.textContent = S.niva < 3 ? 'Rundan är klar!' : 'Alla tre nivåerna klarade!';
    if (S.stjarnor === totalt) {
      el.slutRad.textContent = 'Alla rätt! Du hittade varje ordklass på första försöket.';
    } else if (S.stjarnor >= totalt * 0.6) {
      el.slutRad.textContent = 'Bra jobbat! Stjärnorna delas ut när svaret är rätt på första försöket.';
    } else {
      el.slutRad.textContent = 'Varje ord du tittade på lärde dig något. Ett varv till?';
    }
    el.slut.hidden = false;
    el.nasta.hidden = S.niva >= 3;
    el.nasta.textContent = 'Nästa nivå';
    ljudKlar();
    saga(S.niva < 3 ? 'Rundan är klar. ' + S.stjarnor + ' av ' + totalt + ' stjärnor.' : 'Alla nivåer klara. Bra jobbat!');
    skicka('round_done', Math.round(100 * S.stjarnor / totalt));
  }

  /* ---------- start och kontroller ---------- */
  document.getElementById('spela').addEventListener('click', function () {
    kontekst();
    startaNiva(1);
  });
  el.nasta.addEventListener('click', function () { startaNiva(S.niva + 1); });
  el.igen.addEventListener('click', function () { startaNiva(S.niva); });

  el.ljud.addEventListener('click', function () {
    S.ljud = !S.ljud;
    el.ljud.setAttribute('aria-pressed', String(S.ljud));
    el.ljud.setAttribute('aria-label', S.ljud ? 'Stäng av ljudet' : 'Sätt på ljudet');
    el.ljud.querySelector('.ljud-pa').hidden = !S.ljud;
    el.ljud.querySelector('.ljud-av').hidden = S.ljud;
    if (!S.ljud) { try { window.speechSynthesis.cancel(); } catch (e) {} skicka('sound_off'); }
  });

  document.addEventListener('keydown', function (e) {
    if (S.lage !== 'spel' || !S.svarar) return;
    var n = parseInt(e.key, 10);
    var klasser = NIVAKLASSER[S.niva];
    if (n >= 1 && n <= klasser.length) { svara(klasser[n - 1]); }
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { try { window.speechSynthesis.cancel(); } catch (e) {} }
  });

  // för test: window.__game.startaNiva(3), __game.svara('verb'), __game.S
  window.__game = { S: S, startaNiva: startaNiva, svara: svara, byggRunda: byggRunda, KLASSER: KLASSER, NIVAKLASSER: NIVAKLASSER };
})();