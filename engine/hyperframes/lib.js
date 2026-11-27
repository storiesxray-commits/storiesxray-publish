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

  // ---------- FULL-BODY FIGURE (USELESS FACTS, 27/11/2026) ----------
  // Side-ish cartoon person facing +x, feet at y = 0. Limbs swing in the screen plane so runs/walks read instantly.
  // o: skin, skinD, hair, hairStyle (short|curly|long|bald|bun|spiky|mohawk), shirt, pants, shoes, h (leg length k), torso (k),
  //    headS (head size k), arm (arm length k), belly 0..1, glasses, beard, moustache, hat (cap|cowboy|beanie), hatC, apron, tie, stripe
  // Weird bodies on purpose (owner: "some walk badly, very short, things that make no sense; others perfect").
  L.fig = (id, s = 1, o = {}) => {
    const sk = o.skin || "#f2c29b", skd = o.skinD || "#d99a72", hair = o.hair || "#3a2416", sh = o.shirt || "#2f6fd6", pa = o.pants || "#33405a", so = o.shoes || "#1d1b22";
    const HL = 150 * (o.h || 1), TL = 135 * (o.torso || 1), HR = 62 * (o.headS || 1), AR = o.arm || 1, bel = o.belly || 0;
    const OL = "#1d120b", ow = 7;
    const limb = (len, col, w) => `<path d="M0 0 L0 ${len}" stroke="${OL}" stroke-width="${w + 2 * ow}" stroke-linecap="round"/><path d="M0 0 L0 ${len}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
    const leg = (k, back) => `<g id="${id}-leg${k}" transform="translate(${back ? -6 : 6} ${-HL})">${limb(HL * 0.5, back ? L.dim(pa) : pa, 34)}
        <g id="${id}-knee${k}" transform="translate(0 ${HL * 0.5})">${limb(HL * 0.5 - 8, back ? L.dim(pa) : pa, 30)}
          <path d="M-14 ${HL * 0.5 - 22} Q-16 ${HL * 0.5 + 6} 8 ${HL * 0.5 + 6} L40 ${HL * 0.5 + 6} Q48 ${HL * 0.5 - 14} 24 ${HL * 0.5 - 22}Z" fill="${back ? L.dim(so) : so}" stroke="${OL}" stroke-width="${ow}" stroke-linejoin="round"/></g></g>`;
    const shY = -HL - TL + 22;
    const arm = (k, back) => `<g id="${id}-arm${k}" transform="translate(${back ? -4 : 4} ${shY})">${limb(72 * AR, back ? L.dim(sh) : sh, 30)}
        <g id="${id}-elb${k}" transform="translate(0 ${72 * AR})">${limb(64 * AR, back ? L.dim(sk) : sk, 22)}
          <g id="${id}-hand${k}" transform="translate(0 ${64 * AR + 6})"><circle r="17" fill="${back ? L.dim(sk) : sk}" stroke="${OL}" stroke-width="${ow}"/></g></g></g>`;
    const tw = 54 + bel * 30, ty0 = -HL - 6, ty1 = -HL - TL;
    const torso = `<path d="M${-tw} ${ty0} C${-tw - bel * 40} ${ty0 - TL * 0.45} ${-tw + 4} ${ty1 + 10} ${-tw + 16} ${ty1} L${tw - 16} ${ty1} C${tw - 4} ${ty1 + 10} ${tw + bel * 60} ${ty0 - TL * 0.5} ${tw} ${ty0} Z" fill="${sh}" stroke="${OL}" stroke-width="${ow}" stroke-linejoin="round"/>
      ${o.stripe ? `<path d="M${-tw + 6} ${ty0 - TL * 0.45} L${tw + bel * 30} ${ty0 - TL * 0.45}" stroke="${o.stripe}" stroke-width="18"/>` : ""}
      ${o.apron ? `<path d="M${-tw + 14} ${ty1 + 40} L${tw - 6} ${ty1 + 40} L${tw + bel * 20} ${ty0 + 4} L${-tw + 8} ${ty0 + 4}Z" fill="${o.apron}" stroke="${OL}" stroke-width="${ow}" stroke-linejoin="round"/>` : ""}
      ${o.tie ? `<path d="M6 ${ty1 + 4} L18 ${ty1 + 4} L22 ${ty1 + 80} L12 ${ty1 + 96} L2 ${ty1 + 80}Z" fill="${o.tie}" stroke="${OL}" stroke-width="5"/>` : ""}
      <path d="M${-tw + 4} ${ty0 + 2} L${tw - 2} ${ty0 + 2} L${tw - 2} ${ty0 + 22} L${-tw + 4} ${ty0 + 22}Z" fill="${pa}" stroke="${OL}" stroke-width="${ow}"/>`;
    const hx = 10, hy = ty1 - HR + 14;
    const hairSvg = {
      short: `<path d="M${-HR} ${-6} C${-HR - 4} ${-HR * 1.2} ${HR * 0.9} ${-HR * 1.35} ${HR * 0.98} ${-HR * 0.35} C${HR * 0.5} ${-HR * 0.75} ${-HR * 0.2} ${-HR * 0.6} ${-HR * 0.55} ${-HR * 0.2} Z" fill="${hair}" stroke="${OL}" stroke-width="${ow}" stroke-linejoin="round"/>`,
      spiky: `<path d="M${-HR} ${-8} L${-HR * 0.9} ${-HR * 1.3} L${-HR * 0.5} ${-HR * 0.95} L${-HR * 0.2} ${-HR * 1.55} L${HR * 0.15} ${-HR * 1.0} L${HR * 0.55} ${-HR * 1.5} L${HR * 0.7} ${-HR * 0.85} L${HR * 1.05} ${-HR * 1.05} L${HR * 0.95} ${-HR * 0.4} C${HR * 0.4} ${-HR * 0.7} ${-HR * 0.3} ${-HR * 0.55} ${-HR * 0.6} ${-HR * 0.15}Z" fill="${hair}" stroke="${OL}" stroke-width="${ow}" stroke-linejoin="round"/>`,
      mohawk: `<path d="M${-HR * 0.35} ${-HR * 0.9} L${-HR * 0.1} ${-HR * 1.9} L${HR * 0.15} ${-HR * 1.0} L${HR * 0.35} ${-HR * 1.85} L${HR * 0.5} ${-HR * 0.9}Z" fill="${hair}" stroke="${OL}" stroke-width="${ow}" stroke-linejoin="round"/>`,
      curly: [...Array(8)].map((_, i) => { const a = Math.PI * (1.0 + i * 0.13); return `<circle cx="${(Math.cos(a) * HR * 0.92).toFixed(1)}" cy="${(Math.sin(a) * HR * 0.95 - 6).toFixed(1)}" r="${HR * 0.36}" fill="${hair}" stroke="${OL}" stroke-width="${ow}"/>`; }).join(""),
      long: `<path d="M${-HR * 1.05} ${HR * 0.9} C${-HR * 1.25} ${-HR * 0.6} ${-HR * 0.6} ${-HR * 1.25} ${HR * 0.1} ${-HR * 1.15} C${HR * 0.8} ${-HR * 1.1} ${HR * 1.05} ${-HR * 0.6} ${HR * 0.95} ${-HR * 0.3} C${HR * 0.4} ${-HR * 0.75} ${-HR * 0.3} ${-HR * 0.6} ${-HR * 0.55} ${0} C${-HR * 0.6} ${HR * 0.4} ${-HR * 0.75} ${HR * 0.7} ${-HR * 1.05} ${HR * 0.9}Z" fill="${hair}" stroke="${OL}" stroke-width="${ow}" stroke-linejoin="round"/>`,
      bun: `<circle cx="${-HR * 0.55}" cy="${-HR * 1.05}" r="${HR * 0.42}" fill="${hair}" stroke="${OL}" stroke-width="${ow}"/><path d="M${-HR} ${-4} C${-HR - 4} ${-HR * 1.15} ${HR * 0.9} ${-HR * 1.3} ${HR * 0.98} ${-HR * 0.35} C${HR * 0.5} ${-HR * 0.7} ${-HR * 0.2} ${-HR * 0.55} ${-HR * 0.55} ${-HR * 0.1} Z" fill="${hair}" stroke="${OL}" stroke-width="${ow}" stroke-linejoin="round"/>`,
      bald: `<path d="M${-HR * 0.5} ${-HR * 0.75} Q0 ${-HR * 0.95} ${HR * 0.5} ${-HR * 0.75}" fill="none" stroke="#fff" stroke-width="8" opacity=".4" stroke-linecap="round"/>`,
    }[o.hairStyle || "short"];
    const hat = o.hat === "cap" ? `<path d="M${-HR * 0.95} ${-HR * 0.35} C${-HR} ${-HR * 1.25} ${HR} ${-HR * 1.25} ${HR * 0.95} ${-HR * 0.35}Z" fill="${o.hatC || "#c0392b"}" stroke="${OL}" stroke-width="${ow}"/><path d="M${HR * 0.6} ${-HR * 0.42} L${HR * 1.75} ${-HR * 0.3} Q${HR * 1.6} ${-HR * 0.1} ${HR * 0.6} ${-HR * 0.2}Z" fill="${o.hatC || "#c0392b"}" stroke="${OL}" stroke-width="${ow}" stroke-linejoin="round"/>`
      : o.hat === "cowboy" ? `<path d="M${-HR * 1.7} ${-HR * 0.45} Q0 ${-HR * 0.2} ${HR * 1.7} ${-HR * 0.45} Q${HR * 1.9} ${-HR * 0.75} ${HR * 1.55} ${-HR * 0.7} Q0 ${-HR * 0.55} ${-HR * 1.55} ${-HR * 0.7} Q${-HR * 1.9} ${-HR * 0.75} ${-HR * 1.7} ${-HR * 0.45}Z" fill="${o.hatC || "#a8743e"}" stroke="${OL}" stroke-width="${ow}" stroke-linejoin="round"/><path d="M${-HR * 0.8} ${-HR * 0.6} C${-HR * 0.9} ${-HR * 1.6} ${-HR * 0.2} ${-HR * 1.2} 0 ${-HR * 1.45} C${HR * 0.2} ${-HR * 1.2} ${HR * 0.9} ${-HR * 1.6} ${HR * 0.8} ${-HR * 0.6}Z" fill="${o.hatC || "#a8743e"}" stroke="${OL}" stroke-width="${ow}" stroke-linejoin="round"/>`
      : o.hat === "beanie" ? `<path d="M${-HR * 0.98} ${-HR * 0.3} C${-HR} ${-HR * 1.35} ${HR} ${-HR * 1.35} ${HR * 0.98} ${-HR * 0.3}Z" fill="${o.hatC || "#2f8a5a"}" stroke="${OL}" stroke-width="${ow}"/><circle cy="${-HR * 1.2}" r="${HR * 0.22}" fill="#fff" stroke="${OL}" stroke-width="${ow}"/>` : "";
    const eyeX = [HR * 0.18, HR * 0.62];
    const eyes = eyeX.map((ex, k) => `<g transform="translate(${ex.toFixed(1)} ${-HR * 0.12})"><ellipse rx="${HR * 0.2}" ry="${HR * 0.25}" fill="#fff" stroke="${OL}" stroke-width="5"/>
        <g id="${id}-pup${k}"><circle r="${HR * 0.1}" fill="#120a06"/><circle cx="-3" cy="-4" r="${HR * 0.035}" fill="#fff"/></g>
        <clipPath id="${id}-ec${k}"><ellipse rx="${HR * 0.2}" ry="${HR * 0.25}"/></clipPath>
        <g clip-path="url(#${id}-ec${k})"><g transform="scale(${(HR / 62).toFixed(3)})"><path id="${id}-lid${k}" d="M0 0" fill="${sk}"/></g></g>
        <ellipse rx="${HR * 0.2}" ry="${HR * 0.25}" fill="none" stroke="${OL}" stroke-width="5"/></g>`).join("");
    const head = `<g id="${id}-head" transform="translate(${hx} ${hy})">
        ${o.hairStyle === "long" ? hairSvg : ""}
        <ellipse cx="${-HR * 0.72}" cy="${HR * 0.05}" rx="${HR * 0.2}" ry="${HR * 0.27}" fill="${sk}" stroke="${OL}" stroke-width="${ow}"/>
        <ellipse rx="${HR}" ry="${HR * 1.04}" fill="${sk}" stroke="${OL}" stroke-width="${ow}"/>
        <ellipse cx="${HR * 0.15}" cy="${HR * 0.35}" rx="${HR * 0.22}" ry="${HR * 0.13}" fill="url(#blush)" opacity=".6"/>
        ${o.hairStyle === "long" ? "" : hairSvg}${hat}
        ${eyes}
        <path id="${id}-brow0" d="M${HR * 0.02} ${-HR * 0.5} L${HR * 0.34} ${-HR * 0.54}" stroke="${OL}" stroke-width="9" stroke-linecap="round"/>
        <path id="${id}-brow1" d="M${HR * 0.48} ${-HR * 0.55} L${HR * 0.8} ${-HR * 0.5}" stroke="${OL}" stroke-width="9" stroke-linecap="round"/>
        <path d="M${HR * 0.42} ${HR * 0.05} Q${HR * 0.62} ${HR * 0.28} ${HR * 0.4} ${HR * 0.32}" fill="none" stroke="${skd}" stroke-width="6" stroke-linecap="round"/>
        ${o.moustache ? `<path d="M${HR * 0.12} ${HR * 0.48} Q${HR * 0.42} ${HR * 0.32} ${HR * 0.78} ${HR * 0.48} Q${HR * 0.45} ${HR * 0.6} ${HR * 0.12} ${HR * 0.48}Z" fill="${hair}" stroke="${OL}" stroke-width="4"/>` : ""}
        <g transform="translate(${HR * 0.42} ${HR * 0.62})"><path id="${id}-mouth" d="M-20 0 Q0 10 20 0 Q0 16 -20 0Z" fill="#6e1f24" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/></g>
        ${o.beard ? `<path d="M${-HR * 0.65} ${HR * 0.35} C${-HR * 0.5} ${HR * 1.2} ${HR * 0.6} ${HR * 1.25} ${HR * 0.95} ${HR * 0.4} C${HR * 0.6} ${HR * 0.85} ${HR * 0.2} ${HR * 0.8} ${-HR * 0.65} ${HR * 0.35}Z" fill="${hair}" stroke="${OL}" stroke-width="5"/>` : ""}
        ${o.glasses ? `<g fill="none" stroke="${OL}" stroke-width="6"><circle cx="${eyeX[0]}" cy="${-HR * 0.12}" r="${HR * 0.27}"/><circle cx="${eyeX[1]}" cy="${-HR * 0.12}" r="${HR * 0.27}"/></g>` : ""}
      </g>`;
    return `<g id="${id}" transform="scale(${s})"><g id="${id}-flip"><g id="${id}-root">
      <ellipse id="${id}-shadow" cx="0" cy="4" rx="${70 + bel * 30}" ry="14" fill="#000" opacity=".22"/>
      <g id="${id}-body">${arm("B", true)}${leg("B", true)}${torso}${leg("A", false)}${head}${arm("A", false)}</g>
      </g></g></g>`;
  };
  L.dim = (hex) => { const n = parseInt(hex.slice(1), 16), f = 0.78; return `rgb(${Math.round((n >> 16) * f)},${Math.round(((n >> 8) & 255) * f)},${Math.round((n & 255) * f)})`; };
  // per-frame figure life. o.mode: run | walk | weird (knees bend backwards) | flail (arms up, panicked run) | stand | sprint-in-place
  //   speed (cycles/s), phase, lean (deg), flip (face -x), mouth 0..1, smile -1..1, eyes 1 (pupil scale), look [x,y], brow -1..1, lid 0..1
  //   arms: override {A:[sh, el], B:[sh, el]}; legs override likewise; hop (extra bounce), squash
  L.figLife = (id, t, o = {}) => {
    const mode = o.mode || "stand", sp = o.speed || (mode === "run" || mode === "flail" ? 2.2 : mode === "stand" ? 0.5 : 1.3), p = t * sp * Math.PI * 2 + (o.phase || 0);
    const S = Math.sin(p), C = Math.cos(p);
    let thA = 0, thB = 0, knA = 4, knB = 4, shA = 6, shB = -6, elA = -12, elB = -12, bob = 0, lean = o.lean || 0;
    if (mode === "run" || mode === "flail") {
      thA = -48 * S; thB = 48 * S; knA = 12 + 70 * Math.max(0, Math.sin(p + 1.7)); knB = 12 + 70 * Math.max(0, Math.sin(p + 1.7 + Math.PI));
      shA = 55 * S; shB = -55 * S; elA = -85; elB = -85; bob = -Math.abs(C) * 18; lean = o.lean ?? 10;
      if (mode === "flail") { shA = 160 + 25 * Math.sin(t * 19); shB = -160 + 25 * Math.sin(t * 17 + 1); elA = 30 * Math.sin(t * 23); elB = -30 * Math.sin(t * 21); lean = o.lean ?? -4; }
    } else if (mode === "walk") {
      thA = -26 * S; thB = 26 * S; knA = 6 + 28 * Math.max(0, Math.sin(p + 1.7)); knB = 6 + 28 * Math.max(0, Math.sin(p + 1.7 + Math.PI));
      shA = 24 * S; shB = -24 * S; elA = -18; elB = -18; bob = -Math.abs(C) * 6;
    } else if (mode === "weird") { // knees bend the wrong way, stiff arms, big lurch
      thA = -30 * S; thB = 30 * S; knA = -(8 + 55 * Math.max(0, Math.sin(p + 1.2))); knB = -(8 + 55 * Math.max(0, Math.sin(p + 1.2 + Math.PI)));
      shA = -70 + 10 * S; shB = -70 - 10 * S; elA = 0; elB = 0; bob = -Math.abs(S) * 26; lean = (o.lean ?? 0) + 9 * Math.sin(p);
    } else { bob = -Math.sin(t * 2.2 + (o.phase || 0)) * 2; shA = 6 + Math.sin(t * 1.7) * 2; shB = -6; }
    if (o.arms?.A) [shA, elA] = o.arms.A; if (o.arms?.B) [shB, elB] = o.arms.B;
    if (o.legs?.A) [thA, knA] = o.legs.A; if (o.legs?.B) [thB, knB] = o.legs.B;
    const rot = (sfx, a) => { const e = document.getElementById(`${id}-${sfx}`); if (!e) return; const tr = e.getAttribute("transform").replace(/ rotate\([^)]*\)/, ""); e.setAttribute("transform", `${tr} rotate(${a.toFixed(2)})`); };
    rot("legA", thA); rot("legB", thB); rot("kneeA", knA); rot("kneeB", knB); rot("armA", shA); rot("armB", shB); rot("elbA", elA); rot("elbB", elB);
    const hop = o.hop ? -Math.abs(Math.sin(t * o.hop * Math.PI)) * 60 : 0, sq = o.squash || 1;
    L.tf(`${id}-body`, `translate(0 ${(bob + hop).toFixed(2)}) rotate(${lean.toFixed(2)} 0 ${-60}) scale(${(2 - sq).toFixed(3)} ${sq.toFixed(3)})`);
    L.tf(`${id}-flip`, o.flip ? "scale(-1 1)" : "");
    // face
    const lk = o.look || [Math.sin(t * 0.8) * 2, 0], ps = o.eyes || 1;
    for (const k of [0, 1]) L.attr(`${id}-pup${k}`, "transform", `translate(${lk[0]} ${lk[1]}) scale(${ps})`);
    const bt = (t + (o.phase || 0)) % 2.9, bl = !o.noBlink && bt < 0.13 ? Math.sin((bt / 0.13) * Math.PI) : 0, lid = Math.max(bl, o.lid || 0);
    for (const k of [0, 1]) { const e = document.getElementById(`${id}-lid${k}`); if (!e) continue; const r = 16; e.setAttribute("d", lid > 0.02 ? `M${-r} ${-r} L${r} ${-r} L${r} ${(-r + lid * r * 2.1).toFixed(1)} L${-r} ${(-r + lid * r * 2.1).toFixed(1)}Z` : "M0 0"); }
    const br = o.brow || 0;
    L.attr(`${id}-brow0`, "transform", `translate(0 ${-br * 10}) rotate(${br * 10})`); L.attr(`${id}-brow1`, "transform", `translate(0 ${-br * 10}) rotate(${-br * 10})`);
    const op = o.mouth || 0, sm = o.smile ?? 0.3, w = 20 + op * 6;
    L.attr(`${id}-mouth`, "d", `M${-w} ${(-sm * 5).toFixed(1)} Q0 ${(-sm * 5 + sm * 12 - op * 6).toFixed(1)} ${w} ${(-sm * 5).toFixed(1)} Q0 ${(8 + op * 44 + sm * 10).toFixed(1)} ${-w} ${(-sm * 5).toFixed(1)}Z`);
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
