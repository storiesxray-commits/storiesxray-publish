// Stories X-Ray — HyperFrames engine (since 22/11/2026). Character rigs (mites + people) and the per-frame "life" driver.
// Everything is a pure function of timeline time t (seconds). No Date, no unseeded random.
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const L = (window.XR = {});
  L.lives = [];
  L.life = (fn) => L.lives.push(fn);
  L.tick = (t) => { for (const f of L.lives) f(t); };
  L.rand = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
  L.sm = (a, b, x) => { x = Math.min(1, Math.max(0, (x - a) / (b - a))); return x * x * (3 - 2 * x); };
  L.clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const $ = (id) => document.getElementById(id);
  L.$ = $;
  L.put = (parentId, svg) => { const p = $(parentId); p.insertAdjacentHTML("beforeend", svg); };
  L.attr = (id, k, v) => { const e = $(id); if (e) e.setAttribute(k, v); };
  L.tf = (id, v) => { const e = $(id); if (e) e.setAttribute("transform", v); };

  // keyed states: [[t, value], ...] -> value at time t (step)
  L.key = (keys, t) => { let v = keys[0][1]; for (const k of keys) if (t >= k[0]) v = k[1]; return v; };

  // ---------- shared defs ----------
  L.defs = () => `
  <defs>
    <radialGradient id="miteBody" cx="38%" cy="30%" r="80%">
      <stop offset="0" stop-color="#fff3e2"/><stop offset=".55" stop-color="#f1d2ad"/><stop offset="1" stop-color="#d9a77d"/>
    </radialGradient>
    <radialGradient id="eyeW" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#e6e9f2"/></radialGradient>
    <radialGradient id="oil" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fffbd0"/><stop offset=".45" stop-color="#f7d34a"/><stop offset="1" stop-color="#c98f12"/></radialGradient>
    <radialGradient id="mel" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#d9b8ff"/><stop offset="1" stop-color="#9a5cff" stop-opacity="0"/></radialGradient>
    <radialGradient id="blush" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ff6f8a" stop-opacity=".75"/><stop offset="1" stop-color="#ff6f8a" stop-opacity="0"/></radialGradient>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="10"/></filter>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>`;

  // ---------- MITE ----------
  // Top view, head at +x. s = scale. Returns markup; parts get ids `${id}-*`.
  L.mite = (id, s = 1, o = {}) => {
    const len = 230, w = 34;
    const body = `M48 0 C48 -30 30 -${w} 0 -${w} C-60 -${w} -120 -${w * 0.82} -170 -${w * 0.6} C-205 -${w * 0.45} -${len} -14 -${len} 0 C-${len} 14 -205 ${w * 0.45} -170 ${w * 0.6} C-120 ${w * 0.82} -60 ${w} 0 ${w} C30 ${w} 48 30 48 0Z`;
    let rings = "";
    for (let i = 0; i < 9; i++) {
      const x = -70 - i * 17, hw = w * (0.86 - i * 0.055);
      rings += `<path d="M${x} -${hw} Q${x - 7} 0 ${x} ${hw}" fill="none" stroke="#c4936b" stroke-width="3" stroke-linecap="round" opacity=".7"/>`;
    }
    let legs = "";
    for (let i = 0; i < 4; i++) {
      const x = 22 - i * 22;
      for (const sd of [-1, 1]) {
        legs += `<g id="${id}-leg${i}${sd > 0 ? "b" : "a"}" transform="translate(${x} ${sd * (w - 6)})">
          <path d="M0 0 L${6} ${sd * 26} L${-2} ${sd * 40}" fill="none" stroke="#6b4430" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M0 0 L${6} ${sd * 26} L${-2} ${sd * 40}" fill="none" stroke="#efcaa2" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></g>`;
      }
    }
    const eyes = [-13, 13].map((y, k) => `
      <g transform="translate(18 ${y})"><circle r="15" fill="url(#eyeW)" stroke="#6b4430" stroke-width="3.5"/>
        <g id="${id}-pup${k}"><circle r="7.5" fill="#1c1410"/><circle cx="-2.5" cy="-3" r="2.6" fill="#fff"/></g>
        <clipPath id="${id}-ec${k}"><circle r="15"/></clipPath><g clip-path="url(#${id}-ec${k})"><rect id="${id}-lid${k}" x="-17" y="-17" width="34" height="0" fill="#efc9a0"/></g>
        <path id="${id}-lash${k}" d="M-15 0 Q0 8 15 0" fill="none" stroke="#6b4430" stroke-width="3.5" stroke-linecap="round" opacity="0"/>
        <circle r="15" fill="none" stroke="#6b4430" stroke-width="3.5"/></g>`).join("");
    const extra = o.glasses ? `<g id="${id}-shades" opacity="0"><rect x="4" y="-30" width="26" height="22" rx="8" fill="#111"/><rect x="4" y="8" width="26" height="22" rx="8" fill="#111"/><path d="M17 -8 L17 8" stroke="#111" stroke-width="5"/><path d="M10 -26 L20 -20" stroke="#6af" stroke-width="3" opacity=".8"/></g>` : "";
    return `<g id="${id}" transform="scale(${s})"><g id="${id}-bob">
      <ellipse cx="-90" cy="10" rx="150" ry="40" fill="#000" opacity=".16" filter="url(#soft)"/>
      ${legs}
      <path d="${body}" fill="url(#miteBody)" stroke="#6b4430" stroke-width="5" stroke-linejoin="round"/>
      <path d="M30 -18 C10 -28 -40 -26 -120 -20" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".55"/>
      ${rings}
      <ellipse id="${id}-blush" cx="8" cy="0" rx="20" ry="30" fill="url(#blush)" opacity="0"/>
      ${eyes}
      <path id="${id}-mouth" d="M42 -9 Q50 0 42 9" fill="#7a2a2a" stroke="#6b4430" stroke-width="3.5" stroke-linejoin="round"/>
      ${extra}
    </g></g>`;
  };
  // per-frame mite life: legs wiggle, breathe, blink, mouth chew/talk
  L.miteLife = (id, t, o = {}) => {
    const sp = o.walk ? 9 : 3.2, amp = o.walk ? 26 : 10, ph = o.phase || 0;
    for (let i = 0; i < 4; i++) for (const sd of ["a", "b"]) {
      const a = Math.sin(t * sp + i * 1.3 + (sd === "b" ? Math.PI : 0) + ph) * amp;
      const e = document.getElementById(`${id}-leg${i}${sd}`);
      if (e) { const tr = e.getAttribute("transform").replace(/ rotate\([^)]*\)/, ""); e.setAttribute("transform", `${tr} rotate(${a.toFixed(2)})`); }
    }
    const br = 1 + Math.sin(t * 2.4 + ph) * 0.025 + (o.bounce ? Math.abs(Math.sin(t * o.bounce)) * 0.08 : 0);
    const wob = Math.sin(t * 1.7 + ph) * (o.walk ? 4 : 2);
    L.tf(`${id}-bob`, `rotate(${wob.toFixed(2)}) scale(${br.toFixed(3)} ${(2 - br).toFixed(3)})`);
    // blink every ~2.6 s (seeded by phase)
    const bt = (t + ph * 0.7) % 2.6, bl = bt < 0.14 ? Math.sin((bt / 0.14) * Math.PI) : 0;
    const lid = Math.max(bl, o.lid || 0);
    for (const k of [0, 1]) { L.attr(`${id}-lid${k}`, "height", (34 * lid).toFixed(2)); const y = -17 + 34 * lid; L.attr(`${id}-lash${k}`, "d", `M-14 ${(y - 1).toFixed(1)} Q0 ${(y + 5).toFixed(1)} 14 ${(y - 1).toFixed(1)}`); L.attr(`${id}-lash${k}`, "opacity", lid > 0.08 ? 1 : 0); }
    const gx = o.gaze ? o.gaze[0] : Math.sin(t * 0.9 + ph) * 3, gy = o.gaze ? o.gaze[1] : Math.cos(t * 0.7 + ph) * 3;
    const ps = o.pupil || 1;
    L.attr(`${id}-pup0`, "transform", `translate(${gx} ${gy}) scale(${ps})`); L.attr(`${id}-pup1`, "transform", `translate(${gx} ${gy}) scale(${ps})`);
    // mouth: open amount 0..1
    const m = o.mouth != null ? o.mouth : 0.15;
    const mw = 9 + m * 12, mx = 42 + m * 16;
    L.attr(`${id}-mouth`, "d", `M42 -${mw} Q${mx} 0 42 ${mw}`);
    if (o.blush != null) L.attr(`${id}-blush`, "opacity", o.blush);
  };

  // ---------- PERSON (front face) ----------
  // Head centred at 0,0, ~ 300 wide. o: skin, hair, hairStyle, shirt, glasses, brow
  L.person = (id, s = 1, o = {}) => {
    const sk = o.skin || "#f2c29b", skd = o.skinD || "#d99a72", hair = o.hair || "#3a2416", shirt = o.shirt || "#2f6fd6";
    const hairSvg = {
      short: `<path d="M-150 -60 C-160 -190 -40 -230 20 -215 C120 -205 170 -140 152 -50 C140 -95 100 -130 40 -135 C-20 -110 -100 -120 -150 -60Z" fill="${hair}" stroke="#1d120b" stroke-width="6" stroke-linejoin="round"/>`,
      curly: [...Array(9)].map((_, i) => { const a = Math.PI * (1.05 + i * 0.11); return `<circle cx="${Math.cos(a) * 140}" cy="${Math.sin(a) * 150 - 40}" r="52" fill="${hair}" stroke="#1d120b" stroke-width="6"/>`; }).join(""),
      long: `<path d="M-160 120 C-190 -120 -110 -225 10 -220 C140 -215 195 -110 165 120 C140 60 140 -60 120 -100 C60 -130 -60 -140 -120 -90 C-140 -40 -140 60 -160 120Z" fill="${hair}" stroke="#1d120b" stroke-width="6" stroke-linejoin="round"/>`,
      bald: `<path d="M-120 -150 C-60 -200 60 -200 120 -150" fill="none" stroke="#fff" stroke-width="10" opacity=".35" stroke-linecap="round"/>`,
      bun: `<circle cx="0" cy="-215" r="62" fill="${hair}" stroke="#1d120b" stroke-width="6"/><path d="M-150 -40 C-160 -190 -40 -215 10 -210 C120 -205 170 -140 152 -40 C130 -110 60 -140 0 -140 C-70 -140 -130 -110 -150 -40Z" fill="${hair}" stroke="#1d120b" stroke-width="6"/>`,
    }[o.hairStyle || "short"];
    const eye = (k, x) => `<g transform="translate(${x} -10)">
        <ellipse rx="34" ry="38" fill="url(#eyeW)"/>
        <g id="${id}-pup${k}"><circle r="17" fill="${o.iris || "#4a2d1a"}"/><circle r="9" fill="#0b0705"/><circle cx="-6" cy="-7" r="5" fill="#fff"/></g>
        <clipPath id="${id}-ec${k}"><ellipse rx="34" ry="38"/></clipPath>
        <g clip-path="url(#${id}-ec${k})"><path id="${id}-lid${k}" d="M-40 -44 L40 -44 L40 -44 L-40 -44Z" fill="${sk}"/></g>
        <path id="${id}-lash${k}" d="M-34 -40 Q0 -36 34 -40" fill="none" stroke="#1d120b" stroke-width="6" stroke-linecap="round" opacity="0"/>
        <ellipse id="${id}-eo${k}" rx="34" ry="38" fill="none" stroke="#1d120b" stroke-width="5"/></g>`;
    return `<g id="${id}" transform="scale(${s})"><g id="${id}-body">
      <path d="M-230 520 C-220 330 -120 270 0 270 C120 270 220 330 230 520Z" fill="${shirt}" stroke="#1d120b" stroke-width="6"/>
      <path d="M-55 230 L-60 300 Q0 340 60 300 L55 230Z" fill="${skd}" stroke="#1d120b" stroke-width="6"/>
      <g id="${id}-head">
      ${o.hairStyle === "long" ? hairSvg : ""}
      <ellipse cx="-158" cy="20" rx="26" ry="40" fill="${sk}" stroke="#1d120b" stroke-width="6"/>
      <ellipse cx="158" cy="20" rx="26" ry="40" fill="${sk}" stroke="#1d120b" stroke-width="6"/>
      <path d="M-155 -40 C-160 -170 -80 -205 0 -205 C80 -205 160 -170 155 -40 C152 90 100 230 0 238 C-100 230 -152 90 -155 -40Z" fill="${sk}" stroke="#1d120b" stroke-width="6"/>
      <ellipse cx="-95" cy="85" rx="38" ry="22" fill="url(#blush)" opacity=".55"/><ellipse cx="95" cy="85" rx="38" ry="22" fill="url(#blush)" opacity=".55"/>
      ${o.hairStyle === "long" ? `<path d="M-156 -30 C-165 -175 -60 -215 10 -212 C120 -208 168 -150 158 -30 C140 -110 90 -150 30 -150 C-10 -120 -90 -110 -156 -30Z" fill="${hair}" stroke="#1d120b" stroke-width="6" stroke-linejoin="round"/>` : hairSvg}
      ${eye(0, -62)}${eye(1, 62)}
      ${o.bags ? `<path d="M-100 34 Q-62 60 -24 34 M24 34 Q62 60 100 34" fill="none" stroke="#8a5a9a" stroke-width="9" stroke-linecap="round" opacity=".75"/>` : ""}
      ${o.veins ? `<g id="${id}-veins" stroke="#e23a3a" stroke-width="2.5" fill="none" opacity=".8"><path d="M-92 -14 l14 4 l6 -6 M-36 2 l-12 -2 M32 -20 l14 6 l8 -4 M96 4 l-14 -2"/></g>` : ""}
      <path id="${id}-brow0" d="M-100 -72 Q-62 -92 -28 -76" fill="none" stroke="#1d120b" stroke-width="13" stroke-linecap="round"/>
      <path id="${id}-brow1" d="M28 -76 Q62 -92 100 -72" fill="none" stroke="#1d120b" stroke-width="13" stroke-linecap="round"/>
      <path d="M0 0 C-10 30 -26 52 -14 62 C-6 68 8 68 16 62" fill="none" stroke="${skd}" stroke-width="7" stroke-linecap="round"/>
      <g id="${id}-mouthG" transform="translate(0 130)">
        <path id="${id}-mouth" d="M-50 0 Q0 30 50 0 Q0 40 -50 0Z" fill="#6e1f24" stroke="#1d120b" stroke-width="6" stroke-linejoin="round"/>
        <path id="${id}-teeth" d="M-40 4 Q0 14 40 4 L36 12 Q0 20 -36 12Z" fill="#fff" opacity="0"/>
        <path id="${id}-tongue" d="M-22 26 Q0 10 22 26 Q0 36 -22 26Z" fill="#e2656f" opacity="0"/>
      </g>
      ${o.glasses ? `<g fill="none" stroke="#1d120b" stroke-width="8"><circle cx="-62" cy="-10" r="50"/><circle cx="62" cy="-10" r="50"/><path d="M-12 -14 Q0 -24 12 -14"/></g>` : ""}
      ${o.beard ? `<path d="M-140 60 C-120 200 -60 250 0 252 C60 250 120 200 140 60 C110 150 60 175 0 178 C-60 175 -110 150 -140 60Z" fill="${hair}" stroke="#1d120b" stroke-width="6"/>` : ""}
      </g></g></g>`;
  };
  // mouth shapes: open 0..1, smile -1..1, width
  L.mouthD = (open, smile = 0.4, w = 50) => {
    const top = -smile * 10 + open * -4, low = 10 + open * 70 + smile * 14;
    return `M-${w} ${-smile * 6} Q0 ${top + smile * 18} ${w} ${-smile * 6} Q0 ${low} -${w} ${-smile * 6}Z`;
  };
  L.personLife = (id, t, o = {}) => {
    const ph = o.phase || 0;
    const bt = (t + ph) % 3.1, bl = !o.noBlink && bt < 0.16 ? Math.sin((bt / 0.16) * Math.PI) : 0;
    const lid = Math.max(bl, o.lid || 0);
    const ly = -42 + lid * 84;
    for (const k of [0, 1]) {
      L.attr(`${id}-lid${k}`, "d", `M-40 -44 L40 -44 L40 ${ly} Q0 ${ly + 10} -40 ${ly}Z`);
      L.attr(`${id}-lash${k}`, "d", `M-36 ${ly} Q0 ${ly + 10} 36 ${ly}`);
      L.attr(`${id}-lash${k}`, "opacity", lid > 0.05 ? 1 : 0);
      L.attr(`${id}-eo${k}`, "opacity", lid > 0.9 ? 0 : 1);
    }
    const g = o.gaze || [Math.sin(t * 0.8 + ph) * 4, Math.cos(t * 0.6 + ph) * 3];
    const ps = o.pupil || 1;
    for (const k of [0, 1]) L.attr(`${id}-pup${k}`, "transform", `translate(${g[0]} ${g[1]}) scale(${ps})`);
    const open = o.open != null ? o.open : 0, smile = o.smile != null ? o.smile : 0.4;
    L.attr(`${id}-mouth`, "d", L.mouthD(open, smile, o.mw || 50));
    L.attr(`${id}-teeth`, "opacity", open > 0.15 && smile > 0 ? 1 : 0);
    L.attr(`${id}-tongue`, "opacity", open > 0.35 ? 1 : 0);
    L.attr(`${id}-tongue`, "transform", `translate(0 ${open * 40})`);
    const br = o.brow || 0; // -1 angry, +1 raised
    L.attr(`${id}-brow0`, "transform", `translate(0 ${-br * 22}) rotate(${-br * 6} -64 -80)`);
    L.attr(`${id}-brow1`, "transform", `translate(0 ${-br * 22}) rotate(${br * 6} 64 -80)`);
    const breathe = Math.sin(t * 2 + ph) * 3;
    const tilt = (o.tilt || 0) + Math.sin(t * 0.9 + ph) * 1.5;
    L.tf(`${id}-head`, `translate(0 ${breathe.toFixed(2)}) rotate(${tilt.toFixed(2)} 0 200)`);
  };

  // ---------- CAPTIONS (owner 22/11/2026: always subtitles, calm style) ----------
  // Same chunking as engine/cartoon/core.js and tools/qa.py: max 3 words / 12 letters, a chunk ends on , . ! ?
  // Style: sentence case, Archivo Black, white, thin black outline + soft drop shadow (no caps, no bounce).
  // Big animated key words/phrases are separate titles in Anton (class .cap .ln in the scene file).
  // window.TIMING_FULL = timing.json (written by tools/hf_build.py); window.SHOTS = [{id,start,end}].
  L.captions = (opt = {}) => {
    const tm = window.TIMING_FULL; if (!tm) return;
    const el = document.getElementById("subs"); if (!el) return;
    const chunks = [];
    for (const s of tm.sentences) { let cur = [];
      const flush = () => { if (cur.length) { chunks.push({ s: cur[0].s, e: cur[cur.length - 1].e, words: cur.map((w) => w.w) }); cur = []; } };
      for (const w of s.words) { if (cur.length && (cur.map((x) => x.w).join(" ") + " " + w.w).replace(/[.,!?…]/g, "").length > 12) flush(); cur.push(w); if (cur.length >= 3 || /[,.!?]$/.test(w.w)) flush(); }
      flush(); }
    for (let i = 0; i < chunks.length - 1; i++) if (chunks[i + 1].s - chunks[i].e < 0.4) chunks[i].e = chunks[i + 1].s;
    const shots = window.SHOTS || [];
    for (const c of chunks) { const cut = shots.find((sh) => sh.start > c.e - 0.4 && sh.start < c.e && sh.start > c.s + 0.25); if (cut) c.e = cut.start; }
    const last = chunks[chunks.length - 1]; if (last) last.e = Math.max(last.e, tm.total + 0.1);
    L.CHUNKS = chunks;
    const capY = opt.capY || (() => 1290);
    L.life((t) => {
      if (window.XR_REAL_T != null) t = window.XR_REAL_T;   // a scene authored on another clock (time warp) still subtitles on the real voice
      if (window.XR_CLEAN) { el.style.opacity = 0; return; }
      const ch = chunks.find((c) => t >= c.s - 0.03 && t < c.e - 0.03) || (chunks.length && t < chunks[0].s ? chunks[0] : null);
      if (!ch) { el.style.opacity = 0; return; }
      const txt = ch.words.join(" ").replace(/\.\.\.$/, "…");
      if (el.textContent !== txt) el.textContent = txt;
      const k = Math.min(1, Math.max(0, (t - ch.s + 0.03) / 0.1));
      el.style.opacity = 1;   // always fully opaque (reviewer 22/11: faded subtitles read as ghosted)
      el.style.top = capY(t) + "px";
      el.style.transform = `scale(${(0.94 + 0.06 * k).toFixed(3)})`;
    });
  };
  L.CAP_CSS = `#subs{position:absolute;left:90px;width:900px;top:1290px;z-index:32;text-align:center;font-family:"Archivo Black",sans-serif;font-size:72px;line-height:1.1;color:#fff;
    -webkit-text-stroke:9px #000;paint-order:stroke fill;text-shadow:0 6px 0 rgba(0,0,0,.55),0 0 18px rgba(0,0,0,.35);letter-spacing:.5px;white-space:nowrap}`;
})();
