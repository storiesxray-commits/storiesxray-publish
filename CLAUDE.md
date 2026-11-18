# Instrucciones para Claude en este repositorio

Este repo produce los Shorts del canal Stories X-Ray (YouTube @StoriesXray, Instagram @storiesxray). Objetivo del canal: audiencia de habla inglesa (EE. UU., Australia) y monetizar; Instagram sirve para llevar gente a YouTube.

## Reglas
- Los videos se hacen por código con este repo. No usar Kling. **La voz es ElevenLabs** (pedido de la dueña, 16/11/2026): 3 narradores propios en rotación, vía Make XR-07 (NEW_VIDEO.md paso 4). Kokoro solo de respaldo.
- Antes de crear o corregir un video, leer `QUALITY.md` y seguir `NEW_VIDEO.md`.
- Guiones en inglés. Comunicación con la dueña en español, directa y sin vueltas.
- Verificar los datos con búsqueda web antes de escribir el guion; las fuentes van en `meta.json`.
- Revisar cuadros a tamaño real antes del render completo y las hojas `review.jpg` / `review_mid.jpg` después. Si aparece cualquier error de QUALITY.md §4, corregir y volver a renderizar ese plano (`--only`).
- Claude no puede escuchar audio: decirlo siempre. Por regla de la dueña (15/11/2026) no hay aprobación previa: Make publica todo lo de `publish/` salvo `"status": "hold"`. YouTube lo recibe privado con fecha (≥ 24 h antes), así que se puede revisar en YouTube Studio.
- Si un video no cumple QUALITY.md o hay una duda de datos que no se puede resolver, poner `"status": "hold"` en vez de publicarlo.
- **YouTube, Instagram y Facebook salen siempre juntos** (pedido de la dueña, 17/11/2026): a la misma hora o muy cerca, nunca uno solo. `platforms` siempre con las 3 (lo fuerza `handoff.py`) y `video_social.mp4` obligatorio; XR-03 publica el Reel a la hora de YouTube.
- Producción automática: seguir `topics/AUTOPILOT.md`.
- Posicionamiento en búsquedas (YouTube, Google, IAs) para EE. UU. y los países de habla inglesa que más pagan: seguir `SEO.md`.
- Make: cuenta de Greentech. Crear solo escenarios nuevos para el canal y no tocar nada existente.

## Comandos
```bash
python tools/build.py <id>                 # video completo + paquete publish/<id>/
python tools/build.py <id> --only s03,s05  # rehace solo esos planos
python tools/render.py <id> stills 2.5 7.0 # cuadros sueltos para revisar
```
