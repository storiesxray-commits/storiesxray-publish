# Cómo crear un video nuevo

1. **Tema.** El siguiente del banco del manual (o uno nuevo con gancho fuerte y pocos personajes). Verificar los datos con búsqueda web.
2. **Carpeta.** Copiar la de un video parecido: `cp -r videos/xr003-fingers-wrinkle videos/xr004-<tema>`.
3. **`script.json`.** Frases y pausa después de cada una (segundos). 28–40 s en total. Primera frase ≤ 7 palabras con el dato más fuerte (AUTOPILOT §2b).
4. **Voz (ElevenLabs, desde 16/11/2026).** Las voces son 3 narradores histriónicos diseñados en la cuenta de ElevenLabs de la dueña (`tools/voices.json`: `xr1` Campfire Maniac, `xr2` Unhinged Podcaster, `xr3` Porch Legend). Se rotan por número de video (`xrNNN % 3`) salvo que `script.json` fije `"voice"`. El sandbox no llega a api.elevenlabs.io, así que la llamada la hace Make:
   1. `python tools/tts.py request xr004-<tema> > /tmp/tts_req.json` (imprime `voice_id`, `out_name`, `payload_b64`).
   2. Correr **XR-07-ELEVENLABS-TTS** (Make, id en `tools/voices.json` → `make_scenario_id`) con `scenarios_run`, `responsive: true` y `data` = ese JSON. Make escribe `tts/<out_name>.mp3` y `.json` en `main`.
   3. `git pull --rebase` y `python tools/voice.py xr004-<tema>`. Tiene que decir `elevenlabs xrN …`. Si dice `WARNING: no ElevenLabs audio`, el paso 2 falló: revisar la ejecución en Make (una vez), y si sigue fallando usar kokoro (`--kokoro`) y anotarlo en `meta.json` → `experiment.voice_fallback`.
   - Cada vez que se cambia el texto del guion hay que repetir 1–3 (el nombre del archivo lleva un hash del texto). Gasta créditos de ElevenLabs (~1 por carácter): no regenerar por gusto.
   - eleven_v3 entiende etiquetas de actuación dentro de la frase: `[whispers]`, `[laughs]`, `[gasps]`, `[sighs]`, `[excited]`, `[shouting]`. Usar 2–4 por video donde suman (giro, dato imposible, remate). No salen en los subtítulos ni cuentan como palabras para `wd(frase, palabra)`.
5. **`scenes.js`.** Una función por escena, que devuelve `{ scene, camera, update(t, d), ui?(t, d) }`. Reutilizar lo del motor (`engine/engine.js`: `Subject`, `M`, `fresnel`, `halo`, `lights`, `stars`, `earth`, `shake`…) y las escenas de los otros videos.
6. **`shots.js`.** La lista de planos: `[id, inicio, () => S.escena(), { html | fn, t0, pop | popFrac }]`. Usar `st(frase)` y `wd(frase, palabra)` para que cada plano entre justo con la palabra. Lista `KEY` de palabras en amarillo.
7. **Revisar cuadros.** `python tools/render.py xr004-<tema> list` y después `stills` en el momento más cargado de cada plano. Corregir hasta que no haya nada de QUALITY.md §4.
8. **`sound.py`.** Efectos en los momentos clave (`put(boom(1.2), wd(7, 3), 0.5)`). `MUSIC.update(...)` si hace falta un silencio o una resolución.
9. **`meta.json`.** Título, descripción con fuentes, etiquetas, comentario fijado, segundo de la miniatura.
10. **Armar.** `python tools/build.py xr004-<tema>`. Revisar `review.jpg` y `review_mid.jpg` (QUALITY.md §6).
11. **Publicar.** `git add videos/xr004-<tema> publish/xr004-<tema> && git commit && git push`. Antes, correr `python tools/handoff.py <id>`. Make (XR-00) lo toma en ≤ 2 h salvo que `status` sea `hold`.

Si un plano necesita arreglo: `python tools/build.py xr004-<tema> --only s05,s06` vuelve a hacer solo esos y rearma el video.
