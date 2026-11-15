# Cómo crear un video nuevo

1. **Tema.** El siguiente del banco del manual (o uno nuevo con gancho fuerte y pocos personajes). Verificar los datos con búsqueda web.
2. **Carpeta.** Copiar la de un video parecido: `cp -r videos/xr003-fingers-wrinkle videos/xr004-<tema>`.
3. **`script.json`.** Frases y pausa después de cada una (segundos). 40–50 s en total.
4. **Voz.** `python tools/voice.py xr004-<tema>`. Revisar la duración y que no aparezca el aviso "fell back".
5. **`scenes.js`.** Una función por escena, que devuelve `{ scene, camera, update(t, d), ui?(t, d) }`. Reutilizar lo del motor (`engine/engine.js`: `Subject`, `M`, `fresnel`, `halo`, `lights`, `stars`, `earth`, `shake`…) y las escenas de los otros videos.
6. **`shots.js`.** La lista de planos: `[id, inicio, () => S.escena(), { html | fn, t0, pop | popFrac }]`. Usar `st(frase)` y `wd(frase, palabra)` para que cada plano entre justo con la palabra. Lista `KEY` de palabras en amarillo.
7. **Revisar cuadros.** `python tools/render.py xr004-<tema> list` y después `stills` en el momento más cargado de cada plano. Corregir hasta que no haya nada de QUALITY.md §4.
8. **`sound.py`.** Efectos en los momentos clave (`put(boom(1.2), wd(7, 3), 0.5)`). `MUSIC.update(...)` si hace falta un silencio o una resolución.
9. **`meta.json`.** Título, descripción con fuentes, etiquetas, comentario fijado, segundo de la miniatura.
10. **Armar.** `python tools/build.py xr004-<tema>`. Revisar `review.jpg` y `review_mid.jpg` (QUALITY.md §6).
11. **Publicar.** `git add videos/xr004-<tema> publish/xr004-<tema> && git commit && git push`. Antes, correr `python tools/handoff.py <id>`. Make (XR-00) lo toma en ≤ 2 h salvo que `status` sea `hold`.

Si un plano necesita arreglo: `python tools/build.py xr004-<tema> --only s05,s06` vuelve a hacer solo esos y rearma el video.
