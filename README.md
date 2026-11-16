# Stories X-Ray — fábrica de Shorts

Genera Shorts verticales (1080×1920, 30 fps, ~45 s) para YouTube @StoriesXray e Instagram @storiesxray, **100 % por código**: sin Kling, sin ElevenLabs, sin créditos.

- **Imagen:** escenas 3D en three.js con estilo toon (color plano + contorno negro) y momentos de rayos X en cian.
- **Voz:** kokoro-onnx local (voz `am_michael`), con subtítulos sincronizados a las pausas reales.
- **Sonido:** efectos y música sintetizados, mezclados a −14 LUFS.
- **Salida:** MP4 + miniatura + `metadata.json` listos para que Make los publique.

## Inicio rápido
```bash
./tools/setup.sh                                   # una vez
python tools/build.py xr003-fingers-wrinkle        # arma el video completo (~10 min con 2 procesos)
```
Resultado en `out/xr003-fingers-wrinkle/` y paquete para Make en `publish/xr003-fingers-wrinkle/`.

## Estructura
```
engine/engine.js      motor: materiales toon, contorno, rayos X, personaje Subject, luces, Tierra, estrellas
engine/player.html    reproductor: arma planos, títulos y subtítulos con márgenes seguros
tools/voice.py        guion -> voz + tiempos por palabra
tools/render.py       render cuadro a cuadro en Chrome headless -> un MP4 por plano
tools/mix.py          efectos + música + voz -> mix.wav (-14 LUFS) e informe de niveles
tools/build.py        todo junto + miniatura + hojas de revisión + paquete para Make
tools/review.py       hojas de revisión visual
videos/<id>/          script.json, scenes.js, shots.js, sound.py, meta.json de cada video
publish/<id>/         lo que Make publica
```

## Videos incluidos
| id | tema | estado |
|---|---|---|
| xr001-space-no-suit | El cuerpo en el espacio sin traje | publicado |
| xr002-coffee-lawsuit | La demanda del café de McDonald's | producido antes del piloto automático, no se republica |
| xr003-fingers-wrinkle | Por qué se arrugan los dedos en el agua | `hold`: estado de publicación desconocido |
| xr005-pepsi-fire | El comercial de 1984 en que se le prendió fuego el pelo a Michael Jackson | `ready` (piloto automático, 16/11/2026) |
| xr006-calment-122 | Jeanne Calment: vivió 122 años y el abogado que le pagó 30 años murió primero (extra pedido por la dueña) | `ready` (publicación inmediata, 16/11/2026) |

## Documentos
- [QUALITY.md](QUALITY.md) — reglas para que no salga ningún error (obligatorio leer).
- [NEW_VIDEO.md](NEW_VIDEO.md) — paso a paso para un video nuevo.
- [PIPELINE.md](PIPELINE.md) — cómo se conecta con Make y qué publica.
- [CLAUDE.md](CLAUDE.md) — instrucciones para Claude cuando trabaja en este repo.

## Requisitos
Python 3.10+, Node 18+, ffmpeg, Chrome o Chromium (lo instala Playwright). Funciona sin GPU (render por software, ~0,3 s por cuadro).
