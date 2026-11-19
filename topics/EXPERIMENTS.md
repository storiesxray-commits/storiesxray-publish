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

## YouTube Analytics (XR-06) — 19/11/2026 23:49 UTC (optimizador diario)
XR-06 status=200. Retención inicial = engagedViews / views. Primer video ElevenLabs + apertura v2 con datos: **xr007** (~21 h, todavía < 48 h).
| YouTube id | Video | Dur. | Gancho (1.ª frase) | Narrador | Categoría | Hora NY | Edad | Vistas | Ret. inicial | % visto | Likes | Shares | Coment. | Subs / 1.000 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| _VH127Agpmg | legado (xr002/xr003) | ~41–47 s | — | kokoro | — | — | > 4 d | 1.279 | **64,3 %** | 61,4 % | 17 | 0 | 0 | 1,6 |
| oNWohhg7UF8 | xr004 molasses | 47,2 s | **contradicción**: "The deadliest wave in Boston's history wasn't water. It was molasses." | kokoro | historia rara | 12:00 | 55 h | 1.159 | **62,7 %** | **52,0 %** | 29 | **1** | 0 | 0,0 |
| 9i9w4fNvt8I | xr007 your-face | 39,6 s | cifra + pregunta: "Eight billion people. How many have YOUR face?" | **xr4** | mind / ciencia rara | 21:50 | 21 h | 1.277 | 56,5 % | 61,2 % | 22 | 0 | 2 | 0,8 |
| yFCoFoknAtY | xr005 pepsi-fire | 41,1 s | dato / imagen extrema | kokoro | pop culture / famosos | 19:03 | 72 h | 1.387 | 53,9 % | 58,1 % | 16 | 0 | 1 | **2,9** |
| Kx3zQdMqgwE | xr001 space | ~45 s | dato | kokoro | cuerpo / ciencia | — | > 4 d | 1.267 | 53,4 % | 64,4 % | 27 | 0 | 1 | 0,8 |
| dKt3jbZP3y0 | legado (xr002/xr003) | ~41–47 s | — | kokoro | — | — | > 4 d | 1.440 | 48,6 % | 66,2 % | 37 | 0 | 0 | 1,4 |
| R1tUFDFpg1E | xr006 calment-122 | 44,6 s | pregunta genérica | kokoro | historia rara / longevidad | 11:05 | 80 h | 1.361 | 46,4 % | 92,6 % ⚠️ | 43 | 0 | 1 | 0,0 |
| FghYtMnXkz8 | xr009 gta-flu (NOTICIA) | 39,5 s | dato | xr2 | pop culture / gaming | 17:34 | 25 h | **6** ⚠️ | — | — | 0 | 0 | 0 | — |
| G3Zfe1HCCuI | xr010 phone-germs | 30,1 s | dato | xr4 | cuerpo / asco | 12:41 | 6 h | 1 | — | — | | | | |
| Crdu6Bam1c0 | xr008 mirror-face | 34,3 s | pregunta | xr1 | mind | 16:16 | 2,5 h | 0 | — | — | | | | |
Total: 9.170 vistas en 7 videos con datos, **1 share** (xr004), retención inicial ponderada 54,8 %. xr013 (zcv8gv3iYRg) todavía sin fila.
⚠️ xr006: el % visto saltó de 70,1 % (18/11) a 92,6 % con solo 86 vistas nuevas: recálculo de Analytics, no usarlo para comparar. ⚠️ xr009: 6 vistas a 25 h mientras xr007 hizo 1.277 en 21 h. xr004 tuvo lo mismo (4 vistas a 31 h → 1.159 después), así que puede ser demora de Analytics, pero si mañana sigue < 300 revisar en Studio si quedó restringido (juego para adultos / edad).

### Por variable (19/11) — ninguna variable cumple el criterio (≥ 3 videos por nivel con ≥ 300 vistas y ≥ 48 h)
| Variable | Nivel | n | Ret. inicial | % visto | Vistas 48 h | Shares | Subs/1.000 |
|---|---|---|---|---|---|---|---|
| Duración | corto / medio | 0 | sin datos (xr010 30 s y xr013 32 s recién salen) | | | | |
| Duración | largo 39–47 s | 7 | 54,8 % | 52–66 % (más corto → más % visto: 47 s 52 %, 41 s 58 %, 40 s 61 %) | ~1.300 | 1 | 1,0 |
| Gancho | contradicción ("wasn't X. It was Y.") | 1 | **62,7 %** | 52,0 % | 1.159 | 1 | 0,0 |
| Gancho | cifra + pregunta | 1 | 56,5 % | 61,2 % | 1.277 (21 h) | 0 | 0,8 |
| Gancho | dato / imagen extrema | 2 | 53,6 % | 61,2 % | ~1.330 | 0 | 1,9 |
| Gancho | pregunta genérica | 1 | 46,4 % | — | 1.361 | 0 | 0,0 |
| Narrador | kokoro (v1) | 6 | 54,5 % | 60–66 % | ~1.320 | 1 | 1,1 |
| Narrador | xr4 Absolute Lunatic | 1 | 56,5 % | 61,2 % | 1.277 (21 h) | 0 | 0,8 |
| Narrador | xr1, xr2, xr5–xr9 | 0 | sin datos | | | | |
| Tema | noticia | 1 (xr009, 6 vistas) | sin datos | | | | |
| Tema | evergreen | 7 | 54,8 % | | ~1.300 | 1 | 1,0 |
| Tema | everyday | 0 | sin datos (arranca xr014) | | | | |
| Categoría | historia rara | 2 | 54,6 % (62,7 / 46,4) | | ~1.260 | 1 | 0,0 |
| Categoría | mind / ciencia rara | 1 | 56,5 % | 61,2 % | | 0 | 0,8 |
| Categoría | pop culture / famosos | 1 | 53,9 % | 58,1 % | 1.387 | 0 | 2,9 |
| Categoría | cuerpo / ciencia | 1 | 53,4 % | 64,4 % | 1.267 | 0 | 0,8 |
| Horario (NY) | mañana 11–13 h | 2 | 54,2 % | | ~1.260 | 1 | 0,0 |
| Horario (NY) | noche 19–22 h | 2 | 55,2 % | | ~1.330 | 0 | 1,9 |

### Lectura video por video (19/11)
- **El techo de ~1.150–1.450 vistas se repite en los 7 videos, con retención de 46 % o de 64 %.** Ese es el lote de prueba de Shorts; ninguno salió. Ni la retención ni el horario mueven ese número todavía: falta la señal fuerte (≥ 70 % que se queda + shares). Hay 1 share en 9.170 vistas.
- **xr004 (melaza):** era el "muerto" de ayer y hoy es **el mejor video mapeado en retención inicial (62,7 %)** y el único con un share. Gancho de **contradicción** ("no fue agua, fue melaza"): plantea una imagen y la rompe en 2 segundos. Pero es el más largo (47 s) y tiene el peor % visto (52 %): después del gancho la historia se estira. Lección: contradicción en la apertura + video más corto.
- **xr007 (tu cara, xr4):** primer video con ElevenLabs y apertura v2: 56,5 %, +2 puntos sobre el promedio kokoro. Mejora, pero no el salto a 70 %. Abre con cifra + pregunta directa ("How many have YOUR face?"), que funciona mejor que la pregunta genérica de xr006 (46,4 %). 2 comentarios en 21 h: el tema "¿tengo un doble?" hace hablar. Un video solo (y con 21 h) no alcanza para juzgar a xr4.
- **xr005 (MJ):** sigue siendo el que más suscriptores trae (2,9 / 1.000): famoso + imagen extrema atrae gente que quiere más.
- **xr006 (Calment):** la peor retención inicial (46 %), confirmada. La regla de ayer (prohibida la pregunta genérica sola) se mantiene.
- **Defecto de diseño encontrado:** desde que EVERYDAY usa los ids mod 3 = 2, la duración (id mod 3) quedaba pegada al tipo de tema (noticia siempre corta, everyday siempre "largo" pisado por sus 20–28 s): nunca se iba a poder separar el efecto de la duración del del tema. Corregido en PLAYBOOK (duración por (id div 3) mod 3) y se suma el gancho de contradicción.
- Sin cambios de pesos de narradores, de cola ni voces nuevas: ninguna variable tiene n suficiente y ninguna categoría se separa (53–57 %). Próxima alta de voz: 21/11.

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
| xr007-your-face | xr4 Absolute Lunatic | 0.0 | dobles / mind | 39,6 s | 56,5 % (21 h) | 61,2 % | (1.277 a 21 h) | 0,8 |
| xr008-mirror-face | xr1 Campfire Maniac | 0.5 | espejo / mind | 34,3 s | | | | |
| xr009-gta-flu | xr2 Unhinged Podcaster | 0.0 | GTA 6 / pop culture (tendencia) | 39,5 s | | | | |
| xr010-phone-germs | xr4 Absolute Lunatic | 0.0 | celular vs inodoro / cuerpo (asco) | 30,1 s | | | | |

Resumen por narrador (19/11): **sin datos suficientes** — solo xr4 tiene 1 video con datos (xr007: 56,5 % ret. inicial, 21 h, vs 54,5 % del promedio kokoro). xr009 (xr2) con 6 vistas a 25 h (posible demora); xr010 (xr4) y xr008 (xr1) recién salieron. Primer corte posible el 21–22/11. Pesos sin cambios.

Resumen por narrador (18/11): **sin datos todavía** — xr009 (xr2) salió hoy 22:34 UTC; xr007 (xr4) 19/11 02:50 UTC; xr010 (xr4) y xr008 (xr1) 19/11; xr011 (xr6) 21/11. Primer corte posible el 21/11.

Resumen por narrador (17/11): **sin datos todavía** — ningún video con ElevenLabs está publicado (xr009 sale 18/11, xr007 19/11 02:50 UTC, xr010 y xr008 19/11).

Nota de la dueña (17/11): xr4 es su favorita ("muy loca, exaltada"). El optimizador completa esta tabla y ajusta los pesos de `tools/voices.json` → `rotation`.
