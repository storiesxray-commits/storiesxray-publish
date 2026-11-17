# Experimentos de retención — Stories X-Ray

Fuente automática (desde 16/11/2026): escenario de Make XR-06-YT-ANALYTICS-REPORT (7068368) → data store 202381, `global.bridge_last` (YouTube Analytics API, solo lectura, conexión 12381578). Retención inicial ≈ `engagedViews / views` (equivalente a "Stayed to watch"); también `averageViewPercentage`. La tarea semanal de los lunes la carga acá. YouTube Analytics tarda 1–3 días en tener datos.

## Línea base (antes del cambio, datos del 16/11/2026)
| Video | Apertura | Voz | Stayed to watch | Vistas a 48 h |
|---|---|---|---|---|
| xr002 coffee | v1 | am_michael 1.04 | 58,4 % | ~1,4K |
| xr001 space | v1 | am_michael 1.04 | 62,3 % | ~1,2K |
| Canal (28 días) | v1 | — | 62,1 % | — |

## Apertura v2 (desde xr007, commit 9b2ad36)
Gancho completo antes de 1,5 s, título + subtítulo desde el frame 0, voz a 0,03 s, 28–40 s. Voz A/B: impares `af_heart`, pares `am_michael`.
Desde el primer video con ElevenLabs (16/11/2026) la voz pasa a 3 narradores en rotación (`xr1`/`xr2`/`xr3`); comparar retención por narrador y quedarse con el mejor (o los 2 mejores) cuando haya 3+ videos de cada uno.
Objetivo: **≥ 70 % stayed to watch**. Si a las 4–6 v2 no sube de ~62 %, el problema está en el contenido visual del primer plano y hay que probar otra cosa.

| Video | Voz | Duración | Stayed to watch | % promedio reproducido | Vistas a 48 h |
|---|---|---|---|---|---|

## Narradores (ElevenLabs) — por video
| Video | Narrador | Estabilidad | Tema / categoría | Duración | Stayed to watch | % promedio reproducido | Vistas a 48 h | Subs / 1.000 vistas |
|---|---|---|---|---|---|---|---|---|
| xr007-your-face | xr4 Absolute Lunatic | 0.0 | dobles / mind | 39,6 s | | | | |
| xr008-mirror-face | xr1 Campfire Maniac | 0.5 | espejo / mind | 34,3 s | | | | |
| xr009-gta-flu | xr2 Unhinged Podcaster | 0.0 | GTA 6 / pop culture (tendencia) | 39,5 s | | | | |

Nota de la dueña (17/11): xr4 es su favorita ("muy loca, exaltada"). El optimizador completa esta tabla y ajusta los pesos de `tools/voices.json` → `rotation`.
