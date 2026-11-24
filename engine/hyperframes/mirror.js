// THE MIRROR — "hijacked signal" mode for the HyperFrames engine (owner 23/11/2026: the series is made in HyperFrames).
// Load AFTER lib.js. Everything is a pure function of timeline time t (no Date, no unseeded random, no timers).
// Layout (1080x1920): top data band 0-555, 4:3 camera window 555-1365 (1080x810), bottom data band 1365-1920.
// Text stays inside x 90-930 and y 288-1650 (YouTube safe zone).
// Our side = cold night-vision green. Mirror side = warm sodium amber. Only alert colour = REC red.
(function () {
  const L = window.XR, M = (window.XRM = {});
  const $ = (id) => document.getElementById(id);
  M.WIN = { x: 0, y: 555, w: 1080, h: 810 };
  M.GREEN = "#8dffa8"; M.AMBER = "#ffb14a"; M.RED = "#ff2b2b";

  // ---------- shared SVG defs: put XRM.defs() inside <svg id="gdefs"> ----------
  // Tints map luminance to one hue so any drawing becomes CCTV footage.
  M.defs = () => `
    <filter id="nv" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".05 .13 .03 0 0  .17 .44 .08 0 .015  .05 .13 .03 0 0  0 0 0 1 0"/></filter>
    <filter id="amber" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".30 .62 .12 0 .03  .17 .36 .07 0 .01  .03 .07 .02 0 0  0 0 0 1 0"/></filter>
    <filter id="bw" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/></filter>
    <filter id="blur3"><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="blur12"><feGaussianBlur stdDeviation="12"/></filter>
    <filter id="fog" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="3" seed="7"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .9 -.25"/><feGaussianBlur stdDeviation="6"/></filter>
    <radialGradient id="torch" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".55" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <radialGradient id="winVig" cx="50%" cy="48%" r="70%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".85"/></radialGradient>`;

  M.CSS = `
    @font-face { font-family: "VT323"; src: url("assets/fonts/VT323-Regular.woff2"); }
    @font-face { font-family: "PlexMono"; src: url("assets/fonts/IBMPlexMono-Bold.woff2"); }
    #mwin { position:absolute; left:0; top:555px; width:1080px; height:810px; overflow:hidden; z-index:5; background:#000; }
    #mwin .scene { position:absolute; inset:0; }
    #mwin .scene svg { position:absolute; left:0; top:0; width:1080px; height:810px; }
    #mwin.flip { transform: scaleX(-1); }
    #mscan { position:absolute; inset:0; z-index:8; pointer-events:none; background: repeating-linear-gradient(0deg, rgba(0,0,0,.28) 0 2px, rgba(0,0,0,0) 2px 5px); }
    #mroll { position:absolute; left:0; width:100%; height:120px; z-index:9; background: linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,.07), rgba(255,255,255,0)); }
    #mgrain { position:absolute; inset:0; z-index:10; opacity:.22; mix-blend-mode:screen; background:url(assets/grain.png); }
    #mvig { position:absolute; inset:0; z-index:11; background: radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,.8) 100%); }
    #mosd { position:absolute; inset:0; z-index:12; font-family:"VT323"; color:#e9ffe9; font-size:46px; letter-spacing:2px; text-shadow:0 0 6px rgba(0,0,0,.9), 0 2px 0 #000; }
    #mosd .tl { position:absolute; left:96px; top:22px; } #mosd .tr { position:absolute; right:150px; top:22px; text-align:right; }
    #mosd .bl { position:absolute; left:96px; bottom:20px; }
    .mband { position:absolute; left:0; width:1080px; z-index:4; background:#030504; font-family:"VT323"; color:#7fa88a; }
    #mtop { top:0; height:555px; } #mbot { top:1365px; height:555px; }
    .mrow { position:absolute; left:96px; width:840px; font-size:44px; letter-spacing:3px; display:flex; justify-content:space-between; }
    .mrow b { font-weight:normal; color:#d6ffe0; }
    .mrule { position:absolute; left:96px; width:840px; height:3px; background:#1c2b22; }
    #mtitle { position:absolute; left:96px; top:300px; width:840px; font-family:"PlexMono"; font-size:40px; letter-spacing:6px; color:#d6ffe0; }
    #mrec { position:absolute; left:96px; top:470px; font-family:"PlexMono"; font-size:44px; color:#ff2b2b; letter-spacing:4px; }
    #mrec i { display:inline-block; width:30px; height:30px; border-radius:50%; background:#ff2b2b; margin-right:14px; vertical-align:-2px; box-shadow:0 0 18px #ff2b2b; }
    #mclock { position:absolute; right:144px; top:452px; font-family:"VT323"; font-size:86px; color:#e9ffe9; letter-spacing:4px; }
    #mecg { position:absolute; left:96px; top:1625px; width:840px; height:120px; z-index:6; }
    #mkey { position:absolute; left:90px; width:900px; z-index:24; text-align:center; font-family:"PlexMono"; font-size:96px; letter-spacing:10px; color:#fff; opacity:0;
            text-shadow: 4px 0 0 rgba(255,40,40,.85), -4px 0 0 rgba(40,220,255,.85), 0 0 24px rgba(0,0,0,.9); }
    #mvote { position:absolute; inset:0; z-index:40; background:#000; display:none; font-family:"PlexMono"; color:#e9ffe9; }
    #mvote .err { position:absolute; left:96px; top:420px; width:840px; font-size:58px; letter-spacing:4px; color:#ff2b2b; }
    #mvote .sub { position:absolute; left:96px; top:560px; width:840px; font-size:40px; letter-spacing:3px; color:#7fa88a; }
    #mvote .opt { position:absolute; left:96px; width:840px; font-size:66px; letter-spacing:3px; opacity:0; }
    #mvote .opt span { color:#ffb14a; } #mvote .cur { display:inline-block; width:34px; height:58px; background:#e9ffe9; vertical-align:-6px; margin-left:10px; }
    #mvote .cta { position:absolute; left:96px; top:1330px; width:840px; font-size:44px; letter-spacing:3px; color:#d6ffe0; opacity:0; }
    #mvote .next { position:absolute; left:96px; top:1420px; width:840px; font-size:38px; letter-spacing:3px; color:#7fa88a; opacity:0; }
    #subs.mono { font-family:"PlexMono"; font-size:58px; -webkit-text-stroke:0; color:#e9ffe9; text-shadow:0 0 10px #000, 0 3px 0 #000; letter-spacing:1px; }
    html.clean #mkey, html.clean #mvote .cta, html.clean #mvote .next { opacity:0 !important; }`;

  // ---------- frame chrome: call once after <div id="root"> exists ----------
  // o: {part, title}
  M.chrome = (o = {}) => {
    const root = $("root");
    root.insertAdjacentHTML("beforeend", `
      <div id="mtop" class="mband">
        <div id="mtitle">THE MIRROR · PART ${o.part || 1}</div>
        <div class="mrule" style="top:372px"></div>
        <div class="mrow" style="top:392px"><span id="mcam">CAM 02 · BATHROOM</span><span id="msig">SIGNAL ▮▮▮▮</span></div>
        <div id="mrec"><i id="mrecdot"></i>REC</div>
        <div id="mclock">03:17:44</div>
      </div>
      <div id="mbot" class="mband">
        <div class="mrule" style="top:24px"></div>
        <div class="mrow" style="top:150px"><span>ROOM TEMP</span><b id="mtemp">68.0°F</b></div>
        <div class="mrow" style="top:202px"><span>HEART RATE</span><b id="mbpm">72 BPM</b></div>
        <svg id="mecg" viewBox="0 0 840 120"><path id="mecgp" fill="none" stroke="#8dffa8" stroke-width="4"/></svg>
      </div>
      <div id="mkey"></div>
      <div id="mvote"></div>`);
    // fix ecg position inside the root (bottom band starts at 1365)
    $("mecg").style.top = "1625px"; $("mecg").style.position = "absolute"; root.appendChild($("mecg"));
    const win = $("mwin");
    win.insertAdjacentHTML("beforeend", `<div id="mscan"></div><div id="mroll"></div><div id="mgrain"></div><div id="mvig"></div>
      <div id="mosd"><div class="tl" id="mosdl">CAM 02</div><div class="tr" id="mosdr">03:17:44</div><div class="bl" id="mosdb">IR ON · 15 FPS</div></div>`);
  };

  // ---------- low frame rate: CCTV steps time at fps ----------
  M.step = (t, fps = 15) => Math.floor(t * fps + 1e-6) / fps;

  // ---------- live clock: 03:17:44 forward, seconds run BACKWARDS inside `back` windows ----------
  // back: [[t0, t1], ...]; inside them the clock rewinds 3x faster than it ran.
  M.clockAt = (t, back = [], start = 44) => {
    let s = start;
    let last = 0, dir = 1;
    const edges = [];
    for (const [a, b] of back) edges.push([a, -3], [b, 1]);
    edges.sort((x, y) => x[0] - y[0]);
    for (const [e, d] of edges) { if (t <= e) break; s += (e - last) * dir; last = e; dir = d; }
    s += (t - last) * dir;
    const tot = 17 * 60 + Math.floor(s); const mm = Math.floor(((tot % 3600) + 3600) % 3600 / 60), ss = ((tot % 60) + 60) % 60;
    return `03:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  };

  // ---------- per-frame driver ----------
  // o: {cams: [[t, "CAM 02 · BATHROOM", "nv"|"amber"|"phone"|"black"]], back: [[t0,t1]], temp: [[t, °F]], bpm: [[t, bpm]],
  //     glitches: [{t, d, flip, shift}], keys: [{t, d, text, y, mirror}], corruption: 0..1, vote: {t, ...}}
  M.drive = (o) => {
    const keyFn = (arr, t) => { let v = arr[0][1]; for (const k of arr) if (t >= k[0]) v = k[1]; return v; };
    const lerpKeys = (arr, t) => { if (t <= arr[0][0]) return arr[0][1]; for (let i = 1; i < arr.length; i++) if (t <= arr[i][0]) { const [a, va] = arr[i - 1], [b, vb] = arr[i]; return va + (vb - va) * L.sm(a, b, t); } return arr[arr.length - 1][1]; };
    const cor = o.corruption || 0;
    L.life((t) => {
      const cam = o.cams ? o.cams.filter((c) => t >= c[0]).pop() || o.cams[0] : [0, "CAM 02", "nv"];
      const mode = cam[2];
      const amber = mode === "amber";
      const col = amber ? M.AMBER : M.GREEN;
      $("mcam").textContent = cam[1]; $("mosdl").textContent = cam[1].split(" · ")[0];
      $("mcam").style.color = amber ? M.AMBER : "";
      const clk = M.clockAt(t, o.back || []);
      $("mclock").textContent = clk; $("mosdr").textContent = clk;
      const rewinding = (o.back || []).some(([a, b]) => t >= a && t < b);
      $("mclock").style.color = rewinding ? M.AMBER : "#e9ffe9";
      $("mosdb").textContent = amber ? "SRC: UNKNOWN · 15 FPS" : mode === "phone" ? "" : "IR ON · 15 FPS";
      $("mosd").style.display = mode === "phone" || mode === "black" ? "none" : "block";
      ["mscan", "mroll", "mgrain"].forEach((id) => ($(id).style.display = mode === "black" ? "none" : "block"));
      $("mroll").style.top = ((t * 260) % 1000 - 120).toFixed(0) + "px";
      // REC blinks 1 Hz
      $("mrecdot").style.opacity = Math.floor(t * 2) % 2 ? 0.15 : 1;
      // signal bars flicker with corruption and during glitches
      const g = (o.glitches || []).find((x) => t >= x.t && t < x.t + x.d);
      const bars = g ? 1 : 4 - Math.floor((L.rand(Math.floor(t * 4) + 3)() < cor ? 1 : 0) * 2);
      $("msig").textContent = "SIGNAL " + "▮".repeat(bars) + "▯".repeat(4 - bars);
      // data that tells the story
      if (o.temp) $("mtemp").textContent = lerpKeys(o.temp, t).toFixed(1) + "°F";
      $("mtemp").style.color = o.temp && lerpKeys(o.temp, t) < 60 ? M.AMBER : "";
      const bpm = o.bpm ? lerpKeys(o.bpm, t) : 72;
      $("mbpm").textContent = Math.round(bpm) + " BPM";
      // ECG trace: one beat every 60/bpm s, scrolling
      const per = 60 / bpm; let d = "";
      for (let x = 0; x <= 840; x += 6) { const tt = t - (840 - x) / 420; const ph = ((tt % per) + per) % per / per; let y = 60;
        if (ph > 0.10 && ph < 0.13) y = 70; else if (ph >= 0.13 && ph < 0.16) y = 6; else if (ph >= 0.16 && ph < 0.19) y = 104; else if (ph > 0.3 && ph < 0.4) y = 60 - Math.sin((ph - 0.3) / 0.1 * Math.PI) * 12;
        d += (x ? "L" : "M") + x + " " + y; }
      $("mecgp").setAttribute("d", d); $("mecgp").setAttribute("stroke", col);
      // glitch: 2-4 frames, full horizontal flip and RGB split
      const win = $("mwin");
      win.classList.toggle("flip", !!(g && g.flip));
      win.style.filter = g ? `drop-shadow(${g.shift || 14}px 0 0 rgba(255,40,40,.75)) drop-shadow(-${g.shift || 14}px 0 0 rgba(40,220,255,.75)) contrast(1.4)` : "none";
      win.style.transform = (g && g.flip ? "scaleX(-1) " : "") + (g ? `translateY(${((L.rand(Math.floor(t * 30))() - 0.5) * 40).toFixed(0)}px)` : "");
      // key words (LET ME OUT, backwards text)
      const k = (o.keys || []).find((x) => t >= x.t && t < x.t + x.d);
      const ke = $("mkey");
      if (k && !window.XR_CLEAN) { ke.textContent = k.text; ke.style.top = (k.y || 1200) + "px"; ke.style.opacity = 1;
        ke.style.transform = k.mirror ? "scaleX(-1)" : "none"; ke.style.color = k.amber ? M.AMBER : "#fff"; }
      else ke.style.opacity = 0;
      if (o.vote) M.voteLife(t, o.vote);
    });
  };

  // ---------- voting screen as a system error ----------
  // v: {t (start), part, next, options: [["A","OPEN_DOOR"],["B","BREAK_MIRROR"],["C","RUN"]]}
  M.voteBuild = (v) => {
    const opts = v.options || [["A", "OPEN_DOOR"], ["B", "BREAK_MIRROR"], ["C", "RUN"]];
    $("mvote").innerHTML = `<div class="err" id="mverr">SIGNAL LOST</div><div class="sub">INPUT REQUIRED_</div>` +
      opts.map((o, i) => `<div class="opt" id="mvo${i}" style="top:${760 + i * 150}px"><span>[${o[0]}]</span> ${o[1]}</div>`).join("") +
      `<div class="cta" id="mvcta">COMMENT A, B OR C</div><div class="next" id="mvnext">PART ${v.next || 2} IN 48H</div>`;
  };
  M.voteLife = (t, v) => {
    const el = $("mvote"); const on = t >= v.t; el.style.display = on ? "block" : "none"; if (!on) return;
    const u = t - v.t;
    $("mverr").style.opacity = u < 0.4 ? (Math.floor(u * 20) % 2 ? 0.2 : 1) : 1;
    for (let i = 0; i < 3; i++) { const e = $("mvo" + i); if (e) e.style.opacity = u > 0.6 + i * 0.35 ? 1 : 0; }
    $("mvcta").style.opacity = u > 1.9 ? 1 : 0; $("mvnext").style.opacity = u > 2.3 ? 1 : 0;
    // blinking cursor after the last option
    const last = $("mvo2"); if (last && !last.querySelector(".cur")) last.insertAdjacentHTML("beforeend", '<i class="cur"></i>');
    const cur = last && last.querySelector(".cur"); if (cur) cur.style.opacity = Math.floor(u * 2) % 2 ? 0 : 1;
  };

  // ---------- helpers for scene art ----------
  // A figure seen from behind (no face, ever): hoodie silhouette. Returns SVG markup, origin at feet centre.
  M.backFigure = (id, s = 1, o = {}) => `<g id="${id}" transform="scale(${s})"><g id="${id}-b">
    <path d="M-150 0 C-160 -220 -150 -380 -110 -450 C-80 -500 80 -500 110 -450 C150 -380 160 -220 150 0Z" fill="${o.fill || "#4a4f4c"}"/>
    <path d="M-110 -450 C-70 -470 70 -470 110 -450 L90 -420 C40 -440 -40 -440 -90 -420Z" fill="#000" opacity=".25"/>
    <g id="${id}-hd"><ellipse cx="0" cy="-540" rx="78" ry="92" fill="${o.hair || "#2a2e2c"}"/><path d="M-78 -540 C-70 -470 70 -470 78 -540" fill="#000" opacity=".3"/></g>
    <g id="${id}-armL"><path d="M-128 -430 C-168 -340 -176 -250 -162 -150" fill="none" stroke="${o.fill || "#4a4f4c"}" stroke-width="44" stroke-linecap="round"/><ellipse cx="-160" cy="-128" rx="20" ry="26" fill="#6e7471"/></g>
    <g id="${id}-armR"><path d="M128 -430 C168 -340 176 -250 162 -150" fill="none" stroke="${o.fill || "#4a4f4c"}" stroke-width="44" stroke-linecap="round"/><ellipse cx="160" cy="-128" rx="20" ry="26" fill="#6e7471"/></g>
    <path d="M-92 -452 C-60 -400 60 -400 92 -452 C60 -430 -60 -430 -92 -452Z" fill="#000" opacity=".35"/>
  </g></g>`;
  // Front silhouette inside the mirror: same build, face ALWAYS in shadow (owner rule: no face until part 5).
  M.reflection = (id, s = 1, o = {}) => `<g id="${id}" transform="scale(${s})"><g id="${id}-b">
    <path d="M-150 0 C-160 -220 -150 -380 -110 -450 C-80 -500 80 -500 110 -450 C150 -380 160 -220 150 0Z" fill="${o.fill || "#3b403d"}"/>
    <g id="${id}-hd"><ellipse cx="0" cy="-540" rx="78" ry="92" fill="#0c0f0d"/>
      <path id="${id}-smile" d="M-26 -488 Q0 -474 26 -488" fill="none" stroke="#c9d6cd" stroke-width="3.5" stroke-linecap="round" opacity="0"/></g>
    <g id="${id}-armL"><path d="M-128 -430 C-168 -340 -176 -250 -162 -150" fill="none" stroke="${o.fill || "#3b403d"}" stroke-width="44" stroke-linecap="round"/><ellipse cx="-160" cy="-128" rx="20" ry="26" fill="#5a605d"/></g>
    <g id="${id}-armR"><path d="M128 -430 C168 -340 176 -250 162 -150" fill="none" stroke="${o.fill || "#3b403d"}" stroke-width="44" stroke-linecap="round"/><ellipse cx="160" cy="-128" rx="20" ry="26" fill="#5a605d"/></g>
  </g></g>`;
  // raise an arm: k 0..1 (arm swings up from the shoulder)
  M.arm = (id, side, k) => { const sx = side === "L" ? -130 : 130; L.tf(`${id}-arm${side}`, `rotate(${(side === "L" ? 1 : -1) * k * 150} ${sx} -420)`); };
  // corruption by part number (doc table): 1-3 clean, 4-6 lying data, 7-9 half mirrored, 10 all mirror side
  M.corruption = (part) => (part <= 3 ? 0.1 : part <= 6 ? 0.4 : part <= 9 ? 0.75 : 1);
})();
