// Drifting starfield background.
(function () {
  const canvas = document.getElementById('bg');
  if (!canvas) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const ctx = canvas.getContext('2d');
  let stars = [];
  let raf = null;

  function starColor() {
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return dark ? '255, 235, 190' : '150, 90, 40';
  }

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const count = Math.min(220, Math.floor((canvas.width * canvas.height) / 7000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 0.6 + Math.random() * 1.8,
      vx: -0.1 - Math.random() * 0.25,
      vy: 0.04 + Math.random() * 0.1,
      a: 0.25 + Math.random() * 0.5,
      tw: 0.5 + Math.random() * 2,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  function draw(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const rgb = starColor();
    for (const s of stars) {
      s.x += s.vx;
      s.y += s.vy;
      if (s.x < -3) s.x = canvas.width + 3;
      if (s.y > canvas.height + 3) s.y = -3;
      const twinkle = 0.6 + 0.4 * Math.sin(s.phase + t * 0.0015 * s.tw);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + rgb + ', ' + (s.a * twinkle).toFixed(3) + ')';
      ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  }

  function drawStatic() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const rgb = starColor();
    for (const s of stars) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + rgb + ', ' + s.a.toFixed(3) + ')';
      ctx.fill();
    }
  }

  function start() {
    if (raf) cancelAnimationFrame(raf);
    raf = null;
    if (reduceMotion.matches) {
      drawStatic();
    } else {
      raf = requestAnimationFrame(draw);
    }
  }

  window.addEventListener('resize', () => { resize(); if (reduceMotion.matches) drawStatic(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    } else {
      start();
    }
  });
  reduceMotion.addEventListener('change', start);
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (reduceMotion.matches) drawStatic();
  });

  resize();
  start();
})();

// Highlight the nav link of the section currently in view.
(function () {
  const links = document.querySelectorAll('.topnav a[href^="#"]');
  if (!links.length) return;
  const sections = Array.from(links)
    .map(a => document.getElementById(a.getAttribute('href').slice(1)))
    .filter(Boolean);

  function update() {
    const mark = window.scrollY + window.innerHeight * 0.25;
    let current = null;
    for (const s of sections) {
      if (s.offsetTop <= mark) current = s.id;
    }
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 2) {
      current = sections[sections.length - 1].id;
    }
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
  }

  document.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

// ---------------------------------------------------------------------------
(function () {
  console.log(
    '%cThese aren\'t the droids you\'re looking for.\n\nThere is a door on this page. A star by the copyright opens it.\nOld gamers know another knock. So does the Force.',
    'color:#dcb84e;font-family:monospace'
  );

  const C = 'EBQ PRDN ZIZMYD.';
  const KEY_HASH = '6d59b0a07e75f387e3f763745924149202f4995320dd96926fac280ba9d387ca';
  const ANS_HASH = '96061e92f58e4bdcdee73df36183fe3ac64747c81c26f6c83aada8d2aabb1864';
  const SALT = 'vZNj4njVf8a68SsM0hlVFQ==';
  const DATA = 'a3RS2A30t93CkcT/wpAEgX2nNzJj6kVL/1RIZKSAWBup11IwFg==';
  const TAG = '3ff4e1f72257084f17f204b08502afaa02ee444b6ae483fc82a07d84c848c871';

  let overlay = null;

  function b64(s) {
    const bin = atob(s);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  function hex(buf) {
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function sha256Hex(str) {
    const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return hex(d);
  }

  async function unseal(pass) {
    const keyBits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: b64(SALT), iterations: 200000, hash: 'SHA-256' },
      await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveBits']),
      256
    );
    const hmacKey = await crypto.subtle.importKey(
      'raw', keyBits, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const data = b64(DATA);
    const tag = hex(await crypto.subtle.sign('HMAC', hmacKey, data));
    if (tag !== TAG) throw new Error('bad');
    const ks = new Uint8Array(Math.ceil(data.length / 32) * 32);
    for (let i = 0; i * 32 < data.length; i++) {
      const ctr = new Uint8Array(4);
      new DataView(ctr.buffer).setUint32(0, i);
      ks.set(new Uint8Array(await crypto.subtle.sign('HMAC', hmacKey, ctr)), i * 32);
    }
    const pt = data.map((b, i) => b ^ ks[i]);
    return new TextDecoder().decode(pt);
  }

  function line(txt, cls) {
    const p = document.createElement('p');
    p.textContent = txt;
    if (cls) p.className = cls;
    overlay.querySelector('.term-log').appendChild(p);
    overlay.querySelector('.term-log').scrollTop = 1e9;
  }

  function vigDec(ct, key) {
    let out = '';
    let ki = 0;
    const K = key.toUpperCase();
    for (const ch of ct) {
      if (/[A-Z]/.test(ch)) {
        out += String.fromCharCode((ch.charCodeAt(0) - 65 - (K.charCodeAt(ki % K.length) - 65) + 26) % 26 + 65);
        ki++;
      } else {
        out += ch;
      }
    }
    return out;
  }

  function openTerminal() {
    if (overlay) { overlay.querySelector('input').focus(); return; }
    overlay = document.createElement('div');
    overlay.className = 'term-overlay';
    overlay.innerHTML =
      '<div class="term">' +
      '<div class="term-log"></div>' +
      '<div class="term-input-row"><span class="term-prompt">key:&nbsp;</span><input type="text" autocomplete="off" spellcheck="false"></div>' +
      '<div class="term-hint">esc to leave</div>' +
      '</div>';
    document.body.appendChild(overlay);

    line('a long time ago in a galaxy far, far away...', 'term-far');
    line('');
    line('> signal detected. an encrypted transmission:');
    line('> ' + C);
    line('> it asks for a key. the key watches the Moon.');

    let stage = 'key';
    let vkey = '';
    const input = overlay.querySelector('input');
    const prompt = overlay.querySelector('.term-prompt');
    input.focus();
    input.addEventListener('keydown', async (e) => {
      if (e.key !== 'Enter') return;
      const guess = input.value.trim().toLowerCase().replace(/[\s-]/g, '');
      input.value = '';
      if (!guess) return;
      line('> ' + guess, 'term-echo');

      if (stage === 'key') {
        if (await sha256Hex(guess) === KEY_HASH) {
          vkey = guess;
          stage = 'answer';
          prompt.innerHTML = 'whisper:&nbsp;';
          line('> key accepted. the transmission reads:');
          line('> ' + vigDec(C, vkey));
        } else {
          line('> the moon does not answer.');
        }
        return;
      }

      if (await sha256Hex(guess) === ANS_HASH) {
        try {
          const msg = await unseal(guess);
          overlay.querySelector('.term-input-row').style.display = 'none';
          line('');
          msg.split('\n').forEach(l => line(l, 'term-secret'));
        } catch {
          line('> that is not the best number.');
        }
      } else {
        line('> that is not the best number.');
      }
    });

    document.addEventListener('keydown', escClose);
  }

  function escClose(e) {
    if (e.key === 'Escape' && overlay) {
      overlay.remove();
      overlay = null;
      document.removeEventListener('keydown', escClose);
    }
  }

  // Knock 1: the old code.
  const seq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let pos = 0;
  document.addEventListener('keydown', (e) => {
    if (overlay) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    pos = (k === seq[pos]) ? pos + 1 : (k === seq[0] ? 1 : 0);
    if (pos === seq.length) { pos = 0; openTerminal(); }
  });

  // Knock 2: the Force. Type the famous blessing anywhere on the page.
  let typed = '';
  document.addEventListener('keydown', (e) => {
    if (overlay || e.key.length !== 1) return;
    if (/[a-z]/i.test(e.key)) {
      typed = (typed + e.key.toLowerCase()).slice(-24);
      if (typed.endsWith('maytheforcebewithyou')) openTerminal();
    }
  });

  // Knock 3: three taps on the portrait.
  const portrait = document.querySelector('.portrait');
  if (portrait) {
    let taps = 0;
    let timer = null;
    portrait.addEventListener('click', () => {
      taps++;
      clearTimeout(timer);
      timer = setTimeout(() => { taps = 0; }, 1500);
      if (taps >= 3) { taps = 0; openTerminal(); }
    });
  }

  // Knock 4: the star in the footer.
  const door = document.getElementById('door');
  if (door) {
    door.addEventListener('click', (e) => {
      e.preventDefault();
      openTerminal();
    });
  }
})();
