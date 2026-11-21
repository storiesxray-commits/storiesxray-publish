# Stories X-Ray — fábrica de Shorts

Genera Shorts verticales (1080×1920, 30 fps, ~45 s) para YouTube @StoriesXray e Instagram @storiesxray, **100 % por código**: sin Kling, sin ElevenLabs, sin créditos.

- **Imagen:** escenas 3D en three.js con estilo toon (color plano + contorno negro) y momentos de rayos X en cian.
- **Voz:** ElevenLabs eleven_v3 con 3 narradores propios en rotación (`tools/voices.json`, vía Make XR-07; ver NEW_VIDEO.md paso 4). Respaldo: kokoro-onnx local. Subtítulos sincronizados con la alineación por carácter.
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
tools/tts.py          guion -> pedido para Make XR-07 (ElevenLabs)
tools/voice.py        guion -> voz + tiempos por palabra (ElevenLabs o kokoro)
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
| xr007-your-face | Dobles: ¿cuántos de 8.000 millones tienen tu cara? (N01, puntaje 100; voz ElevenLabs xr4) | `ready` (piloto automático, 17/11/2026) |
| xr008-mirror-face | Nunca viste tu cara real: el espejo te invierte (N08, puntaje 100; voz ElevenLabs xr1; extra pedido por la dueña) | `ready` (17/11/2026) |
| xr009-gta-flu | GTA 6: soldados que se reengancharon para jugarlo y la "GTA flu" (pedido de la dueña, puntaje 100; voz ElevenLabs xr2) | `ready`, extra cargado a mano en el ledger para el miércoles 18/11 17:34 NY |
| xr010-phone-germs | Tu celular está más sucio que un inodoro (opción 5 elegida por la dueña, puntaje 100; voz xr4) | `ready`, extra cargado a mano en el ledger para el jueves 19/11 12:41 NY |
| xr011-real-voice | Nunca escuchaste tu voz real (cola v3 N17, puntaje 100; voz ElevenLabs xr6; E2 brazo largo, 36,9 s) | `ready`, horario lo elige Make (21:56 NY) |
| xr013-dennys-nvidia | Nvidia nació en un Denny's: de lavaplatos a gigante de chips, la renuncia de Huang y la placa que desapareció (J01, puntaje 100, NOTICIA; voz ElevenLabs xr7; medio 32 s) | extra cargado a mano en el ledger para el jueves 19/11 13:52 NY |
| xr014-served-first | EVERYDAY X-RAY: la pareja que llegó después ya está comiendo; Larson (MIT, "Dr. Queue"): que te salteen enoja más que esperar (E01, puntaje 96; voz ElevenLabs xr8; 25,9 s; estilo pro) | `ready`, horario lo elige Make (12:12 NY) |
| xr015-voyager-light-day | NOTICIA (18/11/2026): Voyager 1 llegó a un día luz de la Tierra; la luz tarda un día, memoria menor que una selfie, respuesta en 2 días y sin datos desde el 14/11 (X1120, puntaje 95; voz ElevenLabs xr9; 26,7 s; motor cartoon) | publicación rápida (§1b), extra cargado a mano en el ledger |

## Documentos
- [QUALITY.md](QUALITY.md) — reglas para que no salga ningún error (obligatorio leer).
- [NEW_VIDEO.md](NEW_VIDEO.md) — paso a paso para un video nuevo.
- [PIPELINE.md](PIPELINE.md) — cómo se conecta con Make y qué publica.
- [CLAUDE.md](CLAUDE.md) — instrucciones para Claude cuando trabaja en este repo.

## Requisitos
Python 3.10+, Node 18+, ffmpeg, Chrome o Chromium (lo instala Playwright). Funciona sin GPU (render por software, ~0,3 s por cuadro).
