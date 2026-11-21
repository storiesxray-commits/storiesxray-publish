# Piloto automático: un video nuevo por corrida

La tarea programada de Claude corre esto **todos los días**. Make (XR-00 → XR-01 → XR-02) toma lo que quede en `publish/` y lo programa en YouTube (privado con fecha, **un video por día, cada uno a una hora distinta** que elige `tools/handoff.py`). A esa misma hora XR-03 lo publica como Reel en Facebook (página Stories Xray) e Instagram (@storiesxray) usando `publish/<id>/video_social.mp4` (la portada propia es el primer cuadro).

## 0. Preparar el entorno (cada corrida arranca de cero)
```bash
bash tools/setup.sh          # pip, three.js, voz kokoro de respaldo (~340 MB)
command -v ffmpeg && ls /usr/bin/google-chrome
```
Si falta algo que no se puede instalar, no producir: dejar el motivo en el resumen final.

## 1. Elegir el tema
- **`topics/queue_v3.json`** (desde el 16/11/2026): las **100 mejores ideas** calificadas por viralidad extrema. Tomar el ítem `todo` del **nivel de puntaje más alto** (95–100, después 90–94, 85–89, 80–84) y, dentro del nivel, el primero en el orden de la lista. La lista ya viene ordenada así, así que en la práctica es el primer `todo`. `queue.json` y `queue_v2.json` quedaron solo como historial.
- **Puntaje (regla de la dueña):** `score = 5 × viral + 5 × hook_power` (cada uno de 1 a 10). `viral` = curiosidad universal para EE. UU., ganas de compartir/comentar, que hable del espectador; `hook_power` = cuánto frena el scroll la frase de los primeros 1–2 s. Desde el 18/11/2026 la cola fue purgada: solo quedan temas ultra virales (ver `rule`); el orden de la lista es el orden de producción.
- **Usar el `hook` del ítem como frase de apertura** (pantalla + voz en los primeros 1–2 s). Se puede afilar, nunca suavizar. Cumplir la `note` si tiene.
- **Temas nuevos:** los busca cada semana `topics/SCOUT.md` (100 ideas). Solo entran con `score ≥ 90` **y** `hook_power ≥ 9` (ultra virales con hook extremo), al final de su nivel; si pasan de 100 `todo`, los de menor puntaje salen a `dropped_low_score`. Nunca producir un tema sin puntaje.
- **Fuera siempre:** ideas que necesitan personajes con copyright o logos de marca para entenderse (ver `excluded_ip`), datos que no se pueden verificar y tragedias o crímenes como tema central.
- Prefijos: `N` = lista "100 ideas" de la dueña, `H` = lista "50 hooks", `B`/`A`/`C`/`R` = bancos anteriores (`topics/BANK_100.txt`, `topics/BANK_2.txt`).
- Línea editorial: **bizarro o sorprendente, real y muy compartible**.
- Id nuevo: el `xrNNN` más alto en `videos/` + 1, con slug corto en inglés (`xr007-wombat-cubes`).

## 1c. EVERYDAY X-RAY (formato de la dueña, 19/11/2026 — OBLIGATORIO)
- Si el número del id nuevo es **mod 3 = 2** (xr014, xr017, xr020…) y §1b no obliga a una noticia, el video es **EVERYDAY X-RAY**: tomar el primer `todo` con `"format": "everyday"` de `queue_v3.json` y seguir `topics/EVERYDAY.md` (estructura, duración 20–28 s, motor cartoon, rigor). `meta.json` → `experiment.topic_type = "everyday"`.
- Si no quedan `everyday` en `todo`, usar la cola normal y avisarlo en el resumen.

## 1a. FILTRO ULTRA VIRAL (regla de la dueña, 18/11/2026 — OBLIGATORIO, gana sobre todo lo demás)
"No nos podemos permitir publicar nada que no sea ultra viral, ultra buscado y ultra perfecto, en todo sentido." Antes de escribir una sola línea, el tema elegido tiene que pasar LAS TRES pruebas; si falla una, marcarlo `dropped` con `drop_reason` y tomar el siguiente:
1. **Ultra viral:** provoca una reacción fuerte de la lista de `rule` en `queue_v3.json` (asco/horror, historia real increíble, escándalo o dinero de marca conocida, miedo/misterio, debate para comentarios, ilusión para probar ya; en EVERYDAY X-RAY: identificación inmediata con un conflicto cotidiano + revelación no obvia, ver `topics/EVERYDAY.md` §2). La prueba: ¿un adolescente de EE. UU. se lo mandaría a un amigo con "bro look at this"? Un dato curioso tibio NO pasa (rechazado: "Your fingers have ZERO muscles").
2. **Ultra buscado:** con WebSearch confirmar que la gente lo busca o lo comparte (autocompletado de Google/YouTube, artículos o videos virales recientes, Reddit). Anotar la evidencia en `meta.json` → `seo.demand` (consulta + fuente). Sin evidencia, no pasa.
3. **Ultra perfecto:** después de producir, cero errores de QUALITY.md, miniatura que se lee en chico, gancho dicho antes de 1,5 s, datos con 2 fuentes. Cualquier duda → `"status": "hold"` con `hold_reason`. Nunca publicar "casi bien".
Ante la duda en cualquiera de las tres: NO se publica.

## 1b. NOTICIA CALIENTE cada 3 videos (regla de la dueña, 18/11/2026 — OBLIGATORIA)
"Que cada dos o tres videos uno sea muy muy actual, ultra buscado, que haya pasado hace horas o días."
- **Cuándo (mínimo):** si el número del id nuevo es múltiplo de 3 (xr015, xr018, xr021…) **o** si ninguno de los últimos 2 videos producidos fue `topic_type: "news"`. En ese caso NO se usa la cola: se busca una noticia.
- **Más de una (regla de la dueña, 18/11/2026):** si en la semana pasan VARIAS cosas ultra virales, se pueden meter todas las que pasen el filtro §1a, aunque no sea su turno, e incluso sumar videos extra ese día. Cada noticia nueva que se encuentre y no se produzca en el momento va a `queue_v3.json` con `topic_type: "news"`, `event_date` (AAAA-MM-DD) y `expires` = `event_date` + 7 días.
- **Vencimiento (OBLIGATORIO):** una noticia se publica como máximo dentro de la semana del hecho (ideal: 24–72 h). Antes de elegir tema, revisar la cola: si hay un `todo` con `topic_type: "news"` sin vencer, va PRIMERO (antes que cualquier evergreen); si `expires` ya pasó, decidir con esta regla (de la dueña, 18/11/2026, criterio de Claude):
  - **Se rescata** si se cumple al menos una: (a) **es atemporal**: el hecho sigue siendo increíble sin el "acaba de pasar" (un récord, un descubrimiento científico, una cifra de una marca, algo que se va a seguir buscando por meses); o (b) **viralidad extrema**: puntaje 100 y la búsqueda sigue alta hoy (verificar con WebSearch que se siga hablando del tema esta semana). En ese caso pasa a `topic_type: "evergreen"`, se reescribe el gancho sin "esta semana / just happened" (contarlo como dato increíble, no como novedad) y entra a la cola por su puntaje.
  - **Se descarta** (`dropped`, `drop_reason: "noticia vencida"`) si solo era interesante por ser nueva (resultados, lanzamientos, declaraciones, polémicas del momento). Una noticia contada como "novedad" nunca sale con más de 7 días.
- **Cómo buscar (WebSearch, mode extended):** lo que está explotando en EE. UU. en las últimas 24–72 h: Google Trends "Trending now" (EE. UU.), lo más leído de AP/Reuters/CNN/NYT/BBC, tendencias de YouTube/X/Reddit. Elegir la que más se busca Y que se pueda contar con el estilo del canal (dato increíble, récord, ciencia, tecnología/IA, marcas, espacio, animales, rarezas, deportes con un dato loco).
- **Fuera siempre:** política partidaria, elecciones con candidatos, guerras, crímenes, muertes o tragedias como tema central, salud con consejos médicos, rumores sin confirmar, y todo lo que necesite caras reales, logos o imágenes de terceros.
- Tiene que pasar el filtro §1a igual que cualquier tema (ultra viral, ultra buscado, ultra perfecto) y verificarse con **2 fuentes serias de las últimas 72 h**. Si no hay ninguna noticia que pase, usar el tema de la cola y anotarlo en el resumen.
- Agregarla a `queue_v3.json` con id `X` + fecha (ej. `X1119`), `status: "done"` y `topic_type: "news"`; en `meta.json` → `experiment.topic_type = "news"`.
- **Publicación rápida (la noticia no puede esperar el turno de XR-01; vale también para temas de la cola cuya `note` pida publicarlos como EXTRA, ej. J01):** después de `handoff.py` y ANTES del push (así XR-00 no lo toma por su cuenta y no se duplica), cargar el registro en el ledger de Make 202379 a mano como EXTRA (procedimiento "Publicación inmediata" de `claude/ESTADO_AUTOPUBLISHER.md`: clave `xr-NNN`, `yt_status: YT_NEW`, `global_status: QUEUED`, `ig_status: IG_READY`, `scheduled_at_utc` = `ig_scheduled_at_utc` = la próxima franja buena de EE. UU. (11:40–14:20 o 16:10–20:50 hora de Nueva York) que esté a ≥ 65 min, SIEMPRE con `.000Z`, `video_url`/`social_video_url`/`thumbnail_url` raw de GitHub y `sha256`), después hacer el push y recién ahí correr **XR-02 (7050624)** con scenarios_run. Verificar en el ledger que quedó `YT_SCHEDULED`. Facebook e Instagram salen solos a la misma hora (XR-03).

## 2. Verificar los datos ANTES de escribir
- Buscar en la web y abrir fuentes primarias u oficiales (la "FUENTE PARA INVESTIGAR" es una pista, no un fact-check).
- Seguir el CRITERIO EDITORIAL del banco: el gancho puede ser dramático, el dato no. En muertes, crímenes, salud o empresas: precisar quién hizo qué, incluir el desenlace y no atribuir culpas no probadas.
- Si un dato central no se puede confirmar con al menos dos fuentes serias, marcar el tema `status: "skipped"` en `queue_v3.json` con `note` y pasar al siguiente.
- Las fuentes (URLs https) van en `meta.json` → `sources` y también en la descripción.

## 2a. PLAYBOOK (obligatorio)
Antes de escribir el guion, leer `topics/PLAYBOOK.md`: tiene las reglas ganadoras y el experimento activo que fija el optimizador diario (voz, duración, tipo de gancho, ritmo, etc.). Si contradice algo de este archivo, gana el PLAYBOOK. Anotar en `meta.json` → `experiment` qué brazo del experimento activo usa el video.

## 2b. Apertura anti-swipe (regla de la dueña, 16/11/2026 — OBLIGATORIA)
Dato del canal (YouTube Studio, 16/11): **solo 58–62 % "Stayed to watch"** en todos los Shorts; la prueba inicial corta en ~1.200 vistas. Objetivo: **≥ 70 %**. Todo video nuevo cumple:
- **Primera frase de 7 palabras o menos, y el dato más fuerte dicho completo antes de 1,5 s.** Nada de preparación ni preguntas genéricas ("Do you want to live to 100?" ✗ → "She smoked until she was 117." ✓). El giro va en la frase 1, no en la 2.
- **Frame 0 = la imagen más extrema del video ya en movimiento** (el fuego, la ola, el objeto imposible), con el sujeto grande. Nunca un plano general tranquilo, una portada o un fundido.
- **Título del gancho a tamaño completo y primer subtítulo visibles desde el frame 0** (lo hace `player.html` solo). La voz arranca a los 0,03 s (`voice.py`).
- **El título de pantalla del plano 1 dice lo mismo que la voz**, en 2–5 palabras grandes; no un rótulo de tema ("THE HOT COFFEE LAWSUIT" ✗).
- **Duración 28–40 s** (antes 40–50): más corto = más % reproducido. Cada 3–5 s un dato nuevo, un giro o un cambio de plano.
- **Voz (desde 21/11/2026): ElevenLabs elegida por el tono del tema** (`script.json` → `"tone"` y `"voice"` de `tools/voices.json` → `casting`; NEW_VIDEO.md paso 4, Make XR-07). Nunca siempre la histriónica: la que haga viral ese tema.
- Antes de renderizar, revisar `render.py stills` en 0.0, 0.5 y 1.0 s: en el frame 0 ya se entiende de qué va y por qué no hay que deslizar. Si no, rehacer el plano 1.

## 3. Reglas visuales y de contenido
- Personas reales: figuras genéricas del motor (sin intentar parecido físico, sin fotos). Nombres en texto sí.
- Nada de logos, marcas gráficas, tipografías de marca ni personajes con copyright (Mickey, etc.): usar objetos genéricos y el nombre en texto.
- Muerte, heridas o violencia: no gráficas, simbólicas (siluetas, contadores, mapas). Nada de sangre ni cuerpos.
- Guion en inglés de EE. UU., original (sin citar textos de prensa), 28–40 s (ver §2b), una idea por oración (así `voice.py` corta bien las pausas).
- `meta.json`: bloque `thumbnail` (ver `tools/thumbnail.py`), `title` ≤ 100 caracteres y sin `<` ni `>`, `description`, `tags`, `series`, `caption_instagram`, `sources`, `platforms`, `made_for_kids: false`, `altered_or_synthetic_realistic: false`.

## 3b. Público y monetización
- Canal para todo el público de habla inglesa, **priorizando los países que más pagan por vista en Shorts: EE. UU. primero, después Australia, Canadá, Reino Unido, Nueva Zelanda e Irlanda.**
- Inglés de EE. UU. Unidades estadounidenses primero (feet, miles, °F, dólares) y la métrica solo si suma. Referencias que un estadounidense entienda sin contexto.
- Cuando el tema es de otro país, el gancho tiene que ser universal ("A lake killed 1,700 people overnight"), no local.
- Títulos y tags pensados para búsquedas en inglés de EE. UU.
- **Posicionamiento extremo (18/11/2026): seguir `SEO.md`.** Bloque `seo` obligatorio en `meta.json` (keyword de EE. UU., 2 títulos alternativos, playlist, 3 preguntas); `tools/seo.py` lo controla y `handoff.py` pone `hold` si falta algo.

## 3c. Variedad (originalidad, no plantilla)
La política de YouTube sobre contenido "inauthentic" (producido en masa o repetitivo) es el riesgo real para la monetización, no el horario de subida. Cada video tiene que verse hecho a mano. Comparalo con los 3 anteriores (`videos/`, `publish/*/metadata.json`) y cambiá:
- **Estructura del título**: pregunta, afirmación, número, "The day…", "Why…", "He…". Sin repetir la fórmula del anterior. Emojis: a veces uno, a veces ninguno.
- **Tipo de gancho**: dato imposible, pregunta, objeto misterioso, cuenta regresiva, contradicción.
- **Duración** entre 28 y 40 s (nunca la misma que el anterior ± 2 s).
- **Paleta, escenario, ángulos de cámara y clima musical** (`sound.py`).
- **Descripción**: alternar formatos (una línea + fuentes; mini lista de datos + fuentes; pregunta al público + fuentes). Siempre con fuentes, nunca el mismo texto fijo.
- **Hashtags**: 3 a 5, distintos según el tema. `#shorts` no siempre.
- **Serie**: rotar (American Oddities, Brands Exposed, Your Body, Survival, Unsolved, Extreme Science…).
- Nada en título, descripción, tags ni comentario fijado que hable del proceso de producción interno.
- `altered_or_synthetic_realistic` se completa con honestidad: `false` para la animación estilizada del motor; `true` si alguna vez se muestran personas o hechos realistas generados.
- El horario de publicación lo elige `tools/handoff.py` (distinto cada día, en franjas de EE. UU./Reino Unido/Australia). No escribirlo a mano salvo pedido de la dueña.

## 4. Producir
**Miniatura perfecta e hiperviral en todos los videos (regla de la dueña, 16/11/2026):** `protect` + 3 ganchos + al menos 3 `variants` comparadas en `thumb_variants.jpg`; sin eso, `handoff.py` pone `hold`. Seguir `NEW_VIDEO.md` y `QUALITY.md` completos (incluida la **miniatura, §5b**: elegir el momento más fuerte, probar 2–3 variantes de texto/cuadro con `tools/thumbnail.py` y quedarse con la que mejor se lee en la versión chica de `thumb_preview.jpg`): escenas, cuadros sueltos a tamaño real, `python tools/build.py <id>`, hojas `review.jpg` y `review_mid.jpg`, margen de voz ≥ 4 dB, −14 LUFS, nada cortado en los bordes. Corregir con `--only` hasta que todo cumpla.

## 5. Entregar
```bash
python tools/handoff.py <id>     # pone status "ready", o "hold" si algún chequeo falla
```
- Si quedó alguna duda de calidad o de datos sin resolver, poner `"status": "hold"` y `"hold_reason"` a mano.
- Actualizar `topics/queue_v3.json` (`status: "done"`, `video_id`) y la tabla de `README.md`.
- `git add videos/<id> publish/<id> topics/queue_v3.json README.md && git commit -m "<id>: <título>" && git pull --rebase && git push origin main`.

## Nunca
- Tocar otros `publish/<id>` ni cambiar su `status`.
- Subir xr001 (ya está en YouTube) ni xr002/xr003.
- Tocar Make, conexiones o cuentas. El repo es el único punto de contacto.
- Gastar créditos de servicios pagos (Kling, ElevenLabs, etc.).

## Resumen final de cada corrida (en español)
Tema, id, duración, LUFS, margen de voz, fuentes usadas, `status` final y el link del commit. Aclarar siempre que Claude no escuchó el audio.
