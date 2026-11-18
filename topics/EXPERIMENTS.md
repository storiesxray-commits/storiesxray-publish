# Experimentos de retención — Stories X-Ray

Fuente automática (desde 16/11/2026): escenario de Make XR-06-YT-ANALYTICS-REPORT (7068368) → data store 202381, `global.bridge_last` (YouTube Analytics API, solo lectura, conexión 12381578). Retención inicial ≈ `engagedViews / views` (equivalente a "Stayed to watch"); también `averageViewPercentage`. La tarea semanal de los lunes la carga acá. YouTube Analytics tarda 1–3 días en tener datos.

## Línea base (antes del cambio, datos del 16/11/2026)
| Video | Apertura | Voz | Stayed to watch | Vistas a 48 h |
|---|---|---|---|---|
| xr002 coffee | v1 | am_michael 1.04 | 58,4 % | ~1,4K |
| xr001 space | v1 | am_michael 1.04 | 62,3 % | ~1,2K |
| Canal (28 días) | v1 | — | 62,1 % | — |

## YouTube Analytics (XR-06) — 17/11/2026 23:48 UTC
Retención inicial = engagedViews / views (métrica principal del optimizador; no es igual al "Stayed to watch" de Studio, que da números más altos).
| YouTube id | Video | Vistas | Retención inicial | % reproducido | Subs / 1.000 | Shares |
|---|---|---|---|---|---|---|
| Kx3zQdMqgwE | xr001 space (v1, kokoro) | 1.254 | 53,3 % | 64,2 % | 0,8 | 0 |
| _VH127Agpmg | legado sin mapear (xr002 o xr003, v1, kokoro) | 1.182 | 64,7 % | 61,6 % | 0,8 | 0 |
| dKt3jbZP3y0 | legado sin mapear (xr002 o xr003, v1, kokoro) | 1.267 | 48,9 % | 65,0 % | 1,6 | 0 |
| oNWohhg7UF8 | xr004 molasses | 4 | — | — | — | — |
Línea base v1: **55,4 %** retención inicial (2.053 / 3.703), ~64 % reproducido. xr005 y xr006 todavía sin filas (Analytics demora 1–3 días). Los ids legados no están en el repo ni en el ledger: si alguien los mapea, completarlos.

## YouTube Analytics (XR-06) — 18/11/2026 23:48 UTC (optimizador diario)
Retención inicial = engagedViews / views. Todos los videos con datos son **v1 + kokoro** (ningún ElevenLabs/MEZCLA tiene datos todavía: xr009 salió hoy 22:34 UTC, xr007 sale 19/11 02:50 UTC).
| YouTube id | Video | Dur. | Gancho (1.ª frase) | Categoría | Vistas | Ret. inicial | % visto | Likes | Shares | Coment. | Subs / 1.000 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| _VH127Agpmg | legado (xr002 o xr003) | ~41–47 s | dato | — | 1.270 | **64,3 %** | 61,5 % | 17 | 0 | 0 | 1,6 |
| yFCoFoknAtY | xr005 pepsi-fire (MJ) | 41,1 s | dato / imagen: "Michael Jackson's hair was on fire." | pop culture / famosos | 1.301 | 53,7 % | 58,5 % | 16 | 0 | 1 | **3,1** |
| Kx3zQdMqgwE | xr001 space | ~45 s | dato | cuerpo / ciencia | 1.263 | 53,4 % | 64,4 % | 27 | 0 | 1 | 0,8 |
| dKt3jbZP3y0 | legado (xr002 o xr003) | ~41–47 s | dato | — | 1.432 | 48,6 % | 66,4 % | 37 | 0 | 0 | 1,4 |
| R1tUFDFpg1E | xr006 calment-122 | 44,6 s | pregunta genérica: "Do you want to live to a hundred?" | historia rara / longevidad | 1.275 | **47,1 %** | **70,1 %** | **43** | 0 | 1 | 0,0 |
| oNWohhg7UF8 | xr004 molasses | 47,2 s | dato | historia rara | 4 | — | — | 0 | 0 | 0 | — |
Total v1: 6.541 vistas, retención inicial 53,4 %, ~64 % visto, **0 shares**.

### Por variable (18/11) — ninguna variable cumple el criterio (≥ 3 videos por nivel con ≥ 300 vistas y ≥ 48 h)
| Variable | Nivel | n | Ret. inicial | % visto | Vistas 48 h | Shares | Subs/1.000 |
|---|---|---|---|---|---|---|---|
| Duración | corto 15–22 s | 0 | sin datos | | | | |
| Duración | medio 25–32 s | 0 | sin datos | | | | |
| Duración | largo 36–47 s (todos los v1) | 5 | 53,4 % | 64 % | ~1.300 | 0 | 1,4 |
| Gancho | dato / imagen extrema | 4 | 55,0 % | 62,7 % | ~1.320 | 0 | 1,7 |
| Gancho | pregunta | 1 | 47,1 % | 70,1 % | 1.275 | 0 | 0,0 |
| Narrador | kokoro am_michael | 5 | 53,4 % | 64 % | ~1.300 | 0 | 1,4 |
| Narrador | ElevenLabs (xr1–xr9) | 0 | sin datos | | | | |
| Tema | noticia | 0 | sin datos (xr009 GTA salió hoy) | | | | |
| Tema | evergreen | 5 | 53,4 % | 64 % | ~1.300 | 0 | 1,4 |
| Categoría | pop culture / famosos | 1 | 53,7 % | 58,5 % | 1.301 | 0 | 3,1 |
| Categoría | historia rara | 1 (+xr004 sin datos) | 47,1 % | 70,1 % | 1.275 | 0 | 0,0 |
| Categoría | cuerpo / ciencia | 1 | 53,4 % | 64,4 % | 1.263 | 0 | 0,8 |
| Horario (NY) | mañana 11:05 | 1 | 47,1 % | | 1.275 | | |
| Horario (NY) | noche 19:03 | 1 | 53,7 % | | 1.301 | | |

### Lectura video por video (18/11)
- **Todos se frenaron en ~1.200–1.400 vistas**: es el lote de prueba inicial de Shorts y ninguno pasó al siguiente. Con 47–64 % de retención inicial y **0 shares en 6.541 vistas**, YouTube no tiene señal para empujarlos. El cuello de botella es doble: primer segundo (gente que desliza) y nada que invite a mandarlo a alguien.
- **xr006 (Calment):** peor retención inicial (47 %) y mejor % visto (70 %) y más likes. Abrió con una pregunta genérica ("Do you want to live to a hundred?") sin dato chocante en la primera frase: el que desliza, desliza; el que se queda, se queda hasta el final porque la historia (la venta del departamento) es buena. Lección: **la pregunta sola no frena el scroll; la cifra imposible tiene que estar en la misma primera frase** ("She lived to 122 and smoked until 117" > "Do you want to live to 100?").
- **xr005 (MJ / Pepsi):** retención media (54 %) pero **el mejor en suscriptores (3,1 / 1.000)**: famoso + imagen extrema en la primera frase ("hair was on fire") atrae gente que quiere más. % visto bajo (58 %): 41 s es largo para esa historia; el clímax llega temprano y después se cae.
- **_VH127Agpmg (legado):** mejor retención inicial (64 %) — sin mapear, no se puede leer el gancho.
- **xr004 (melaza):** ⚠️ 4 vistas en Analytics a ~31 h de publicado (17/11 17:00 UTC), cuando xr005/xr006 tenían ~1.300 al día. Puede ser demora de Analytics, pero XR-04 tampoco cargó `metrics_24h` para xr004. Revisar en Studio si está público y sin restricciones.
- Conclusión: ningún dato contradice la MEZCLA; el único efecto visible (pregunta genérica < dato) es n = 1 y el tema puede explicarlo. **No se cambian pesos.** Se agrega a la mezcla el **cierre que pide compartir** (ver PLAYBOOK) porque los shares están en cero.

## E2 — Duración (desde 17/11/2026; impar = largo 36–40 s, par = corto 28–32 s)
| Video | Brazo | Duración | Narrador | Tema / categoría | Retención inicial | % reproducido | Vistas a 48 h | Subs / 1.000 |
|---|---|---|---|---|---|---|---|---|

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
| xr010-phone-germs | xr4 Absolute Lunatic | 0.0 | celular vs inodoro / cuerpo (asco) | 30,1 s | | | | |

Resumen por narrador (18/11): **sin datos todavía** — xr009 (xr2) salió hoy 22:34 UTC; xr007 (xr4) 19/11 02:50 UTC; xr010 (xr4) y xr008 (xr1) 19/11; xr011 (xr6) 21/11. Primer corte posible el 21/11.

Resumen por narrador (17/11): **sin datos todavía** — ningún video con ElevenLabs está publicado (xr009 sale 18/11, xr007 19/11 02:50 UTC, xr010 y xr008 19/11).

Nota de la dueña (17/11): xr4 es su favorita ("muy loca, exaltada"). El optimizador completa esta tabla y ajusta los pesos de `tools/voices.json` → `rotation`.
