# Instrucciones para Claude en este repositorio

Este repo produce los Shorts del canal Stories X-Ray (YouTube @StoriesXray, Instagram @storiesxray). Objetivo del canal: audiencia de habla inglesa (EE. UU., Australia) y monetizar; Instagram sirve para llevar gente a YouTube.

## Reglas
- **`HUMAN.md` primero (19/11/2026): el canal tiene que verse y sentirse hecho por personas, video por video. Gana sobre PLAYBOOK, AUTOPILOT y QUALITY cuando chocan.**
- **Dos motores desde 22/11/2026 (pedido de la dueña): mitad de los videos en `"render_style": "cartoon"` (`engine/cartoon/`, `tools/build.py`) y mitad en `"render_style": "hyperframes"` (`engine/hyperframes/README.md`, `tools/hf_build.py`).** Qué motor toca y qué temas van a cada uno: `topics/AUTOPILOT.md` §1d. Los estilos "pro" y "toon" quedan dados de baja; su código queda solo para poder rehacer videos viejos. `handoff.py` rechaza cualquier otro estilo. **Subtítulos siempre** en los dos motores.
- **Serie THE MIRROR (dueña, 23/11/2026): se hace en HyperFrames**, con el modo "señal intervenida" de `engine/hyperframes/mirror.js`. Biblia, estado y reglas: `series/mirror/BIBLE.md` y `STATE.json`. Las partes van en `videos/mrNN-<slug>/` (fuera de la numeración `xrNNN` y de la alternancia diaria de AUTOPILOT §1d).
- **Auditoría obligatoria antes de publicar (pedido de la dueña, 20/11/2026):** `python tools/qa.py <id>` en 0 errores + firma visual (`--visual-ok`) después de mirar `qa_sheet.jpg` y `qa_mid.jpg` (QUALITY.md §7). Sin eso, `hold`.
- Los videos se hacen por código con este repo. No usar Kling. **La voz es ElevenLabs** (pedido de la dueña, 16/11/2026): 3 narradores propios en rotación, vía Make XR-07 (NEW_VIDEO.md paso 4). Kokoro solo de respaldo.
- Antes de crear o corregir un video, leer `QUALITY.md` y seguir `NEW_VIDEO.md`.
- Guiones en inglés. Comunicación con la dueña en español, directa y sin vueltas.
- Verificar los datos con búsqueda web antes de escribir el guion; las fuentes van en `meta.json`.
- Revisar cuadros a tamaño real antes del render completo y las hojas `review.jpg` / `review_mid.jpg` después. Si aparece cualquier error de QUALITY.md §4, corregir y volver a renderizar ese plano (`--only`).
- Claude no puede escuchar audio: decirlo siempre. Por regla de la dueña (15/11/2026) no hay aprobación previa: Make publica todo lo de `publish/` salvo `"status": "hold"`. YouTube lo recibe privado con fecha (≥ 24 h antes), así que se puede revisar en YouTube Studio.
- Si un video no cumple QUALITY.md o hay una duda de datos que no se puede resolver, poner `"status": "hold"` en vez de publicarlo.
- **Solo YouTube desde el 21/11/2026 (pedido de la dueña):** Facebook e Instagram quedan dados de baja. XR-03 apagado, `fb_paused` e `ig_paused` en `true` (data store 202381); `handoff.py` deja `platforms: ["youtube"]` y ya no pide `video_social.mp4`. No reactivar ni crear cuentas. Además del Short, empujar el **posicionamiento web** (sitio de `SEO.md` §3) para traer tráfico de Google y de las IAs.
- Producción automática: seguir `topics/AUTOPILOT.md`. Formato **EVERYDAY X-RAY** (situaciones cotidianas explicadas con ciencia, 19/11/2026): `topics/EVERYDAY.md`, 1 de cada 3 videos.
- Posicionamiento en búsquedas (YouTube, Google, IAs) para EE. UU. y los países de habla inglesa que más pagan: seguir `SEO.md`.
- Make: cuenta de Greentech. Crear solo escenarios nuevos para el canal y no tocar nada existente.

## Comandos
```bash
python tools/build.py <id>                 # video completo + paquete publish/<id>/ (motor cartoon)
python tools/hf_build.py <id>              # lo mismo con el motor HyperFrames (--stills 0.5,3.2 para cuadros sueltos)
python tools/build.py <id> --only s03,s05  # rehace solo esos planos
python tools/render.py <id> stills 2.5 7.0 # cuadros sueltos para revisar
python tools/qa.py <id>                    # auditoría completa (después: --visual-ok "qué se revisó")
```
