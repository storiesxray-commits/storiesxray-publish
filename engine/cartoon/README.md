# Motor "cartoon" de Stories X-Ray

Personajes 2D expresivos (tarjetas dibujadas en canvas) dentro de escenarios 3D con tinta negra en los bordes, luces prácticas,
sombras, profundidad de campo, gradación de color y cámaras que se mueven con intención. Corre en el mismo Chromium sin GPU que
el resto del repo (`tools/render.py`), así que `build.py`, `thumbnail.py`, `social.py`, `review.py` y `handoff.py` funcionan igual.

Se activa con `"render_style": "cartoon"` en `meta.json`. El resto del flujo (voz de ElevenLabs vía Make, `voice.py`,
`sound.py` + `mix.py`, miniatura, paquete `publish/`, Make, YouTube y Facebook) no cambia.

Base técnica: el kit `cartoon-short-kit` (three.js r160 vendorizado en `lib/`) y la librería de dibujo `toon.ts` de
github.com/mromidev/claude-animated-shorts (MIT, en `toonbase.js` sin tipos). Los personajes, escenarios y planos son propios.

## Archivos
| Archivo | Qué hace |
|---|---|
| `index.html` | Página que carga `render.py` (`?v=<id>`; `&clean=1` sin textos, para miniaturas). Expone `READY`, `SHOTS`, `renderAt(T)` |
| `core.js` | Render: materiales toon, tinta (normal+profundidad), luces, cielo, tarjetas, desenfoque de lente, grano, sepia, subtítulos y títulos del canal |
| `cast.js` | Personajes modernos: `person(p, look, opts)`, looks listos (`LOOKS`), 25 expresiones, poses de brazos, objetos en mano y efectos 2D (`fx`) |
| `sets.js` | Escenarios y utilería 3D: `room()`, mesas, sillas, booths, platos con comida, vasos, velas, lámparas colgantes con luz, reloj de pared animable, ventanas con ciudad de noche, cuadros, plantas, postes con cordón, caja registradora, bicicleta, paquetes |
| `paint.js` | Texturas pintadas: madera, piedra, ladrillo, damero, empapelado, zócalo, pizarrón, estantes de negocio, carteles con texto, calendario, tela |
| `motion.js` | Curvas de movimiento (smooth, easeOut, back, spring), splines, vida (`idle`, `blinkAt`) |

## Cómo se hace un video (cada video = `videos/<id>/cartoon.js`)
El guion, la voz y los tiempos salen igual que siempre (`script.json` → Make XR-07 → `voice.py` → `out/<id>/timing.json`).
`cartoon.js` exporta `story(E, tm)` y devuelve funciones puras del tiempo `t` (segundos):
`{ shots: [{id, start}], cam(t), dof(t), light(t), update(t), actors(t), ui(t), KEY }`.
`tm.st(i)` = inicio de la frase i, `tm.wd(i, j)` / `tm.we(i, j)` = inicio / fin de la palabra j de la frase i (tiempos reales de ElevenLabs).

Referencia completa: `videos/zz-cartoon-xr014/cartoon.js` (piloto: restaurante, aula, mostrador moderno y de 1976).

### Escala (todo sale de las tarjetas)
- Tarjeta = 2,25 m de alto. Adulto de pie: cabeza arriba ~1,75 m, centro de la cabeza 1,72 m. Sentado: centro de la cabeza ~1,11 m.
- Mesa 0,56 m (`TABLE_H`), asiento 0,31 m, mostrador 0,95 m. Para manos sobre la mesa: `tableY: designY(TABLE_H)`.
- Una persona sentada va con la tarjeta **detrás del borde de atrás de la mesa** (la mesa le tapa las piernas).
- Las tarjetas giran solas hacia la cámara. Si la cámara está detrás de alguien, usar `back: true` (se ve de espaldas).
- Las cabezas miden ~0,53 m: para un primer plano la cámara va a ~1,5–3 m, no a 50 cm. Usar el ayudante de encuadre
  `k(t, objetivo, anchoEnMetros, yaw, pitch, fov)` del piloto: se pide el ancho del cuadro y calcula la distancia.

### Personajes
`actor({ id, look, seed, x, y, z, pose: alive(t, seed, {...}) })`. `alive()` agrega respiración, balanceo y parpadeos: usarlo siempre.
- `look`: uno de `LOOKS` o un objeto propio `{ skin, hair, style, top, topKind, pants, shoes, glasses, beard, moustache, apron, tie, bow, kid, stout }`.
  `style`: short, side, spiky, curly, long, bob, bun, pony, balding, bald. `topKind`: tee, shirt, polo, blouse, hoodie, sweater, cardigan, vest.
- `pose`: `expr` (neutral, smile, happy, grin, laugh, smug, chew, think, bored, annoyed, angry, furious, shout, gasp, shock, sad, nervous, sideeye, whisper…),
  `L` / `R` (hang, point, up, fist, wave, raise, hip, cross, chin, temple, cheek, table, drum, fork, tray, hold, reach, watch, shrug),
  `mode` (stand, sit, walk + `step`), `facing` (-1/0/1), `look` (ojos -1..1), `hold: { L|R: fork|phone|receipt|ticket|glass|plate|menu|chalk }`,
  `k` (avance de la pose: comer, tamborilear, saludar), `talk` (abre la boca), `back`.
- Efectos 2D: `fxCard({ id, kind, args, x, y, z, s })` con `steam`, `vein`, `exclaim`, `question`, `sweat`, `sparkle`, `zzz`, `speed`, `puff`.

### Luz
`light(t)` devuelve un preset: `{ sky, ground, hemi, sun, sunI, az, el, fog, card (tinte de personajes), sat, gain, lift, vig, grain, sepia, lamps: {grupo: intensidad} }`.
Las lámparas (`lamp()` o `X.pendant()`) pertenecen a un grupo (`warm`, `window`, `candle`, `store`…) que el preset sube o baja.
Usar la luz para contar: cálido de noche para la escena cotidiana, azul frío para la explicación, sepia + grano para el pasado, tinte rojo en el pico de enojo.

### Cámara
`camKeys(keys, t, { shake, hand })`: viajes suaves entre claves, empuje lento en cada plano, cámara en mano leve y sacudones en los golpes.
Planos continuos cuando se puede; corte duro solo al cambiar de lugar o de época. Variar tamaños: general → medio → primer plano → detalle → reacción.

### Textos
Subtítulos del canal (Inter 900, blanco con borde negro, palabras clave de `KEY` en amarillo, máx. 3 palabras / 12 letras), anclados a los tiempos
reales de la voz y visibles desde el cuadro 0. `ui(t)` puede devolver `capY` (altura) para que no tapen la acción, `title` (franja de arriba,
solo para el gancho o un dato clave) y `flash`.

## Revisión (obligatoria, además de QUALITY.md)
1. `python tools/render.py <id> stills t1 t2 …` en el momento más cargado de cada plano y en cada transición. Mirarlos.
2. Trampas: cámara atravesando una pared (si se ve una textura lisa gigante, la cámara quedó afuera del cuarto), personajes flotando
   (las tarjetas van con `y` en el piso o el asiento), manos que no tocan la mesa, gente tapada por otra o por un objeto, subtítulo encima de una cara,
   plano demasiado cerrado (cabezas cortadas sin intención), escenas sin nada que se mueva, mismo encuadre dos veces seguidas.
3. `python tools/build.py <id>` y revisar `review.jpg` / `review_mid.jpg`.
4. Pruebas de desarrollo: `--no-publish` y un id `zz-…` (nunca entran a `publish/`).

Tiempo de render: ~3,5 s por cuadro en la nube (CPU). Un video de 30 s ≈ 50–60 min con 2 procesos.
