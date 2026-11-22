# Motor "hyperframes" de Stories X-Ray (desde 22/11/2026)

Pedido de la dueña (22/11/2026): **mitad de los videos en este motor y mitad en el motor cartoon** (reglas en `topics/AUTOPILOT.md` §1d). Este motor dibuja caricaturas 2D planas en SVG, animadas con GSAP, y [HyperFrames](https://github.com/heygen-com/hyperframes) (gratis, open source, versión fijada en `package.json`) las renderiza a MP4 en Chrome sin GPU. **Nunca** usar el render en la nube de HeyGen ni Lambda: todo se renderiza acá, costo 0.

Rinde mejor en temas que se **explican por dentro o con gráficos** (cuerpo, cerebro, parásitos, ilusiones, líneas de tiempo, día por día, números). Para personas en lugares (marcas, negocios, historia con escenarios) conviene el motor cartoon.

Videos de referencia (aprobados por la dueña): `videos/xr017-face-mites/` (primer video), `videos/xr018-false-memories/`, `videos/xr019-no-sleep/`. **No copiar escenas entre videos** (HUMAN.md §2): cada video con paleta, personajes, fondos y planos propios.

## Archivos
| Archivo | Qué hace |
|---|---|
| `lib.js` | `window.XR`: rigs de personajes y el motor de "vida" por cuadro. `XR.person(id, escala, look)` (cara de frente con ojos, párpados, pupilas, cejas, boca, pelo `short/curly/long/bald/bun`, `glasses`, `beard`, `bags`, `veins`), `XR.personLife(id, t, {lid, gaze, pupil, open, smile, brow, tilt})`; `XR.mite(id, escala, {glasses})` + `XR.miteLife(...)` (bicho con 8 patas); `XR.defs()` (degradados y filtros compartidos); `XR.captions({capY})` (subtítulos); `XR.life(fn)` registra una función del tiempo; `XR.sm(a,b,t)` suavizado; `XR.rand(seed)` aleatorio con semilla. |
| `grain.png`, `hyperframes.json` | Grano de película y config del proyecto que arma `tools/hf_build.py`. |

## Cómo se hace un video
1. Guion, voz, `meta.json` y `sound.py` igual que siempre (NEW_VIDEO.md pasos 1–4, 9–10). `meta.json`: `"render_style": "hyperframes"` y `experiment.engine: "hyperframes"`.
2. `videos/<id>/hyperframes/shots.json`: los cortes de escena en segundos, `[{"id": "s1", "start": 0}, ...]` (los usan `mix.py`, los subtítulos y `qa.py`).
3. `videos/<id>/hyperframes/index.html`: la composición. Copiar la estructura de un video de referencia:
   - `<head>` carga `assets/gsap.min.js`, `assets/timing.js` (tiempos reales de cada palabra: `TIMING[frase][palabra]`, lo escribe `hf_build.py`) y `assets/lib.js`.
   - Cada escena es un `<div class="clip scene" data-start data-duration>` con un `<svg viewBox="0 0 1080 1920">` y adentro un `<g id="sNcam">` para mover la cámara (`tl.fromTo("#s2cam", {scale, svgOrigin}, ...)`).
   - Los personajes y la utilería se generan por script al inicio (`XR.put("id", XR.person(...))`), y la animación de vida (parpadeo, mirada, boca, patas, olas) va en `XR.life((t) => {...})`: **todo tiene que ser función del tiempo `t`**, sin `Date`, sin `Math.random` sin semilla, sin timers.
   - Un solo `gsap.timeline({paused: true})` registrado en `window.__timelines["main"]`, con un tween reloj que llama `XR.tick(t)` en cada cuadro.
   - Títulos grandes y animados (palabras o frases clave) en Anton: `<div class="clip cap"><span class="ln">...`. **Subtítulos SIEMPRE** (dueña, 22/11/2026): `<div id="subs">` + `XR.captions({capY: (t) => ...})`, estilo tranquilo (frase corta en minúscula, Archivo Black blanca con borde y sombra, misma división en grupos de 3 palabras / 12 letras que el motor cartoon y `qa.py`).
   - `<audio id="mix" src="assets/mix.wav">` y, en el CSS, `html.clean .cap, html.clean #subs { opacity: 0 !important; }` (para la miniatura sin textos).
4. Cuadros sueltos mientras se arma: `python tools/hf_build.py <id> --stills 0.0,1.5,4.2,...` → `out/<id>/stills/contact-sheet*.jpg`. **Mirarlos** antes del render completo.
5. Render completo + miniatura + paquete: `python tools/hf_build.py <id>` (~3,5–5 min para 30 s). `--skip-voice` si `voice.py` ya corrió; `--reuse-render` rehace solo miniatura y paquete.
6. `python tools/qa.py <id>`, revisor visual nuevo (subagente) y `--visual-ok`, `audit_human.py`, `handoff.py`, commit y push (NEW_VIDEO.md 11b–13).

## Trampas que ya pasaron (revisión del 22/11/2026)
- **Subtítulos sobre una cara**: mover `capY` por escena (abajo del mentón, en el pecho o entre la burbuja y la cabeza). Un revisor lo rechaza.
- **Textos fuera de la zona segura**: todo texto importante entre x 90–930 (a la derecha están los botones de YouTube) y debajo de y 288. Ojo con el zoom de cámara: un rótulo que entra en x=262 sale del cuadro con `scale: 2.3`.
- **Título del gancho**: visible desde el cuadro 0 (no esperar a la palabra).
- **Cuadros quietos ≥ 0,6 s** (`qa.py` frozen_picture): siempre algo en movimiento (zoom lento, parpadeo, respiración).
- **Grupos SVG con `transform` en el atributo + tween GSAP**: GSAP pisa el `translate`. Envolver: `<g transform="translate(x y)"><g id="anim">…</g></g>` y animar el de adentro con `svgOrigin: "0 0"`. Nunca arrancar un grupo con `scale(0)` en el atributo.
- **`fromTo` repetidos sobre el mismo elemento**: `immediateRender: false` en todos menos el primero.
- **Degradados (`url(#id)`) dentro de una escena oculta** no se pintan en las otras: los `defs` compartidos van en el `<svg id="gdefs">` fuera de las escenas.
- **El margen de la voz** (`qa.py` voice_margin ≥ 6 dB) falla en escenas con susurro: bajar efectos y "whoosh" de corte ahí.
- Pelo largo: el rig dibuja el flequillo encima de la cabeza; si una cara "parece pelada", revisar el `hairStyle`.
