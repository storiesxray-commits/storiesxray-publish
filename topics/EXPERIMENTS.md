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

## YouTube Analytics (XR-06) — 20/11/2026 23:48 UTC (optimizador diario)
XR-06 status=200. Retención inicial = engagedViews / views. Mapeo nuevo: **TqVget3OnhQ = xr012 finger-muscles** (cancelado por la dueña el 18/11 22:48 UTC, ledger `YT_CANCELLED`, pero **salió público** a las 23:10 UTC y tiene vistas) y 2LF0hl69P0c = xr011 (programado 21/11 02:56 UTC, 2 vistas privadas).
| YouTube id | Video | Dur. | Gancho (1.ª frase) | Narrador | Tema / categoría | Hora NY | Edad | Vistas | Ret. inicial | % visto | Likes | Shares | Coment. | Subs / 1.000 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| FghYtMnXkz8 | xr009 gta-flu | 39,5 s | dato absurdo: "Soldiers reenlisted... to play GTA 6." | xr2 | **noticia** / pop culture, gaming | 17:34 | 49 h | **2.046** ↑ | 57,1 % | 61,5 % | 33 | 0 | 2 | 0,5 |
| TqVget3OnhQ | xr012 finger-muscles | **15,7 s bucle** | dato: "Your fingers have ZERO muscles." | xr4 | evergreen / cuerpo | 18:10 | 49 h | **1.631** | 49,7 % | **96,8 %** | 3 | 0 | 0 | 0,0 |
| dKt3jbZP3y0 | legado (xr002/xr003) | ~41–47 s | — | kokoro | — | — | > 5 d | 1.442 | 48,6 % | 66,1 % | 37 | 0 | 0 | 1,4 |
| yFCoFoknAtY | xr005 pepsi-fire | 41,1 s | dato / imagen extrema | kokoro | pop culture / famosos | 19:03 | 4 d | 1.422 | 54,0 % | 58,0 % | 16 | 0 | 1 | **2,8** |
| R1tUFDFpg1E | xr006 calment-122 | 44,6 s | pregunta genérica | kokoro | historia rara | 11:05 | 4,3 d | 1.378 | 46,2 % | 92,5 % ⚠️ | 44 | 0 | 1 | 0,0 |
| 9i9w4fNvt8I | xr007 your-face | 39,6 s | cifra + pregunta | xr4 | mind | 21:50 | 45 h | 1.328 | 56,6 % | 61,3 % | 21 | **1** | 2 | 0,8 |
| _VH127Agpmg | legado (xr002/xr003) | ~41–47 s | — | kokoro | — | — | > 5 d | 1.279 | **64,4 %** | 61,5 % | 19 | 0 | 0 | 1,6 |
| Kx3zQdMqgwE | xr001 space | ~45 s | dato | kokoro | cuerpo / ciencia | — | > 5 d | 1.265 | 53,6 % | 64,3 % | 27 | 0 | 1 | 0,8 |
| oNWohhg7UF8 | xr004 molasses | 47,2 s | contradicción | kokoro | historia rara | 12:00 | 3,3 d | 1.162 | 62,7 % | 52,2 % | 29 | 1 | 0 | 0,0 |
| G3Zfe1HCCuI | xr010 phone-germs | 30,1 s | dato | xr4 | cuerpo / asco | 12:41 | 30 h | 1 | — | — | | | | |
| Crdu6Bam1c0 | xr008 mirror-face | 34,3 s | pregunta | xr1 | mind | 16:16 | 26 h | 0 | — | — | | | | |
xr013 (zcv8gv3iYRg, noticia, medio) todavía sin fila. Total: 12.953 vistas en 9 videos con datos, **2 shares**. Analytics demora ~2 días en cargar un video nuevo (xr004: 4 vistas a 31 h → 1.159; xr009: 6 a 25 h → 2.046 a 49 h), así que xr008/xr010 en 0–1 todavía es normal; si mañana siguen < 50, revisar en Studio. ⚠️ xr008: el ledger sigue en `YT_SCHEDULED` y **sin `FB_PUBLISHED`** (xr010 y xr013 sí lo tienen).

### Por variable (20/11) — ninguna variable cumple el criterio (≥ 3 videos por nivel con ≥ 300 vistas y ≥ 48 h)
| Variable | Nivel | n | Ret. inicial | % visto | Vistas prom. | Shares | Subs/1.000 |
|---|---|---|---|---|---|---|---|
| Duración | corto 15–22 s (bucle) | 1 (xr012) | 49,7 % | **96,8 %** | **1.631** | 0 | 0,0 |
| Duración | medio 25–32 s | 0 | sin datos (xr013, xr014, xr010 en camino) | | | | |
| Duración | largo 39–47 s | 8 | 55,2 % | 52–66 % (sin xr006 ⚠️) | 1.415 | 2 | 1,0 |
| Gancho | contradicción | 1 | **62,7 %** | 52,2 % | 1.162 | 1 | 0,0 |
| Gancho | cifra + pregunta | 1 | 56,6 % | 61,3 % | 1.328 | 1 | 0,8 |
| Gancho | dato / imagen extrema | 4 | 53,8 % | 58–97 % | 1.591 | 0 | 0,9 |
| Gancho | pregunta genérica | 1 | 46,2 % | — | 1.378 | 0 | 0,0 |
| Narrador | kokoro (v1) | 6 | 54,5 % | 52–66 % | 1.325 | 1 | 1,1 |
| Narrador | xr4 Absolute Lunatic | 2 | 52,8 % (56,6 / 49,7) | 61 / 97 % | 1.480 | 1 | 0,3 |
| Narrador | xr2 Unhinged Podcaster | 1 | 57,1 % | 61,5 % | **2.046** | 0 | 0,5 |
| Narrador | xr1, xr5–xr9 | 0 | sin datos | | | | |
| Tema | noticia | 1 | 57,1 % | 61,5 % | **2.046** | 0 | 0,5 |
| Tema | evergreen | 8 | 54,1 % | | 1.363 | 2 | 0,9 |
| Tema | everyday | 0 | sin datos (xr014 sale 21/11) | | | | |
| Categoría | pop culture / famosos | 2 | **55,9 %** | 60,1 % | **1.734** | 0 | 1,4 |
| Categoría | mind | 1 | 56,6 % | 61,3 % | 1.328 | 1 | 0,8 |
| Categoría | historia rara | 2 | 53,7 % | | 1.270 | 1 | 0,0 |
| Categoría | cuerpo | 2 | 51,4 % | | 1.448 | 0 | 0,3 |
| Horario (NY) | mañana 11–13 h | 2 | 53,7 % | | 1.270 | 1 | 0,0 |
| Horario (NY) | tarde 17–18:30 h | 2 | 53,8 % | | **1.838** | 0 | 0,3 |
| Horario (NY) | noche 19–22 h | 2 | 55,2 % | | 1.375 | 1 | 1,8 |

### Lectura video por video (20/11)
- **Por primera vez dos videos rompen el techo de ~1.150–1.450 vistas: xr009 (2.046 y sigue subiendo) y xr012 (1.631).** Los otros 7 siguen clavados ahí. Lo que tienen en común no es la retención inicial (57 % y 50 %, normales o bajas) ni el narrador: xr009 es **noticia** (GTA 6, búsqueda caliente → tráfico extra además del feed) y xr012 es **corto con bucle** (15,7 s; % visto 96,8 %: la gente lo ve entero y vuelve a empezar). Los dos salieron a la tarde de NY (17:34 y 18:10), pero con n = 2 eso puede ser casualidad.
- **xr012 es la lección más fuerte del día:** un tema que la dueña calificó de tibio, con la peor retención inicial de los nuevos (49,7 %), superó en alcance a 7 de 9 videos solo por la duración y el bucle ("See? Because..." → "Your fingers have ZERO muscles."). En Shorts, terminar visto (y re-visto) pesa más que el primer segundo para salir del lote inicial. Con un tema ultra viral, corto + bucle tendría que andar todavía mejor. Ojo: 0 subs y 0 shares; corto atrae vistas, no fans.
- **xr009 (noticia GTA):** 57,1 % de retención y a las 49 h sigue sumando (era 6 vistas a 25 h por la demora de Analytics). Es el único que siguió creciendo después del lote: la búsqueda del tema lo sostiene. Si xr013 (otra noticia) también pasa ~1.700 a 48 h, las noticias suben a 1 de cada 2.
- **xr007 (xr4):** sumó su primer share; 56,6 % se mantiene. Sigue en el techo.
- **Largos (8 videos, 39–47 s):** todos entre 1.162 y 1.442 vistas y 52–66 % visto. Este nivel ya tiene datos de sobra; lo que falta medir es corto y medio.
- **Narradores:** xr2 57,1 % (n = 1) y xr4 52,8 % (n = 2, uno es el corto tibio). Sin diferencia que no explique el tema/duración. Sin cambios.
- **Decisión:** la duración pasa a priorizar corto (ver PLAYBOOK): el largo queda pausado hasta que corto y medio tengan 3 videos con datos cada uno. Hora: se anota la tarde de NY como hipótesis (la elige `handoff.py`, que ya le da 50 % a 16:10–20:50; no se toca).

## YouTube Analytics (XR-06) — 23/11/2026 23:50 UTC (optimizador diario)
XR-06 status=200. Retención inicial = engagedViews / views. Mapeo nuevo: **muJY3x20XvU = xr014** (everyday, cartoon), **Hoz_y4MsBEM = xr015** (2 vistas a 26 h: demora de Analytics). xr016 (wwAlEAp9ack) y xr017 (9p6JpvenW_A) todavía sin fila. Los optimizadores del 21 y 22/11 no dejaron registro.
| YouTube id | Video | Dur. real | Gancho (1.ª frase) | Narrador | Tema / categoría | Hora NY | Edad | Vistas | Ret. inicial | % visto | Likes | Shares | Coment. | Subs / 1.000 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TqVget3OnhQ | xr012 finger-muscles | 15,7 s | dato | xr4 | evergreen / cuerpo | 18:10 | 5 d | **2.799** ↑↑ (+1.168 en 3 d) | 53,2 % | **91,8 %** | 4 | 0 | 0 | 0,0 |
| FghYtMnXkz8 | xr009 gta-flu | 39,5 s | dato absurdo | xr2 | noticia / pop culture | 17:34 | 5 d | 2.087 (plano) | **56,9 %** | 61,6 % | 34 | 0 | 2 | 0,5 |
| 2LF0hl69P0c | xr011 real-voice | 36,9 s | "You've never heard…" | xr6 (borrada) | evergreen / cuerpo | 21:56 | 2,9 d | 1.587 | 48,0 % | 64,8 % | 16 | 0 | 1 | 0,6 |
| muJY3x20XvU | xr014 served-first | 26,7 s | cifra suelta "Eighteen minutes." | xr8 | **everyday** / mind | 12:12 | 2,3 d | 1.552 | 51,2 % | **86,8 %** | 21 | 0 | 0 | 0,6 |
| Crdu6Bam1c0 | xr008 mirror-face | 34,3 s | "You've never seen…" | xr1 | evergreen / mind | 16:16 | 4,1 d | 1.544 | 53,5 % | 79,7 % | 26 | 0 | 1 | 0,6 |
| yFCoFoknAtY | xr005 pepsi-fire | 41,1 s | imagen extrema | kokoro | pop culture | 19:03 | 7 d | 1.453 | 54,0 % | 57,9 % | 16 | 0 | 1 | **2,8** |
| dKt3jbZP3y0 | legado | ~41–47 s | — | kokoro | — | — | > 7 d | 1.445 | 48,6 % | 66,1 % | 37 | 0 | 0 | 1,4 |
| R1tUFDFpg1E | xr006 calment-122 | 44,6 s | pregunta genérica | kokoro | historia rara | 11:05 | 7,3 d | 1.418 | 46,3 % | 92,1 % ⚠️ | 45 | 0 | 1 | 0,0 |
| 9i9w4fNvt8I | xr007 your-face | 39,6 s | cifra + pregunta | xr4 | mind | 21:50 | 4,9 d | 1.349 | 56,2 % | 61,2 % | 21 | 1 | 2 | 0,7 |
| _VH127Agpmg | legado | ~41–47 s | — | kokoro | — | — | > 7 d | 1.279 | **64,4 %** | 61,4 % | 19 | 0 | 0 | 1,6 |
| Kx3zQdMqgwE | xr001 space | ~45 s | dato | kokoro | cuerpo | — | > 7 d | 1.265 | 53,6 % | 64,3 % | 27 | 0 | 1 | 0,8 |
| oNWohhg7UF8 | xr004 molasses | 47,2 s | contradicción | kokoro | historia rara | 12:00 | 6,3 d | 1.245 | **63,1 %** | 52,1 % | 30 | 1 | 0 | 0,0 |
| G3Zfe1HCCuI | xr010 phone-germs | 30,1 s | "Your phone?" | xr4 | evergreen / cuerpo (asco) | 12:41 | 4,3 d | 1.236 | 51,7 % | 54,9 % | 19 | 0 | 1 | 1,6 |
| zcv8gv3iYRg | xr013 dennys-nvidia | 32,5 s | "Nvidia was born at Denny's?!" | xr7 | **noticia** / negocios-tech | 13:52 | 4,2 d | **546** ⚠️ | 49,3 % | **41,2 %** | 3 | 0 | 0 | 0,0 |
| Hoz_y4MsBEM | xr015 voyager | 26,2 s | contradicción implícita | xr10 | noticia / espacio | 16:50 | 26 h | 2 (demora) | — | — | | | | |
Total: 20.805 vistas en 14 videos con datos, retención inicial ponderada 53,6 %, **2 shares** en total (ninguno nuevo desde el 20/11).

### Por variable (23/11) — videos con ≥ 300 vistas y ≥ 48 h, duración REAL del mp4
| Variable | Nivel | n | Ret. inicial | % visto | Vistas prom. | Shares | Subs/1.000 |
|---|---|---|---|---|---|---|---|
| Duración | corto ≤ 22 s | 1 (xr012) | 53,2 % | **91,8 %** | **2.799** | 0 | 0,0 |
| Duración | medio 25–33 s | **3** (xr010, xr013, xr014) | 51,1 % | 61,0 % | 1.111 | 0 | 0,9 |
| Duración | largo ≥ 34 s | 10 | 54,3 % | 63,2 % (sin xr006 ⚠️) | 1.467 | 2 | 0,9 |
| Gancho | dato / imagen | 6 | 53,6 % | 69,5 % | **1.732** | 0 | 0,9 |
| Gancho | pregunta / "you…" | 5 | 50,8 % | 67,8 % | 1.289 | 1 | 0,5 |
| Gancho | contradicción | 1 | **63,1 %** | 52,1 % | 1.245 | 1 | 0,0 |
| Narrador | xr4 Absolute Lunatic | **3** | 53,6 % | 69,3 % | **1.795** | 1 | 0,6 |
| Narrador | kokoro (v1) | 6 | 54,7 % | 65,6 % | 1.351 | 1 | 1,1 |
| Narrador | xr2 / xr1 / xr6 / xr7 / xr8 | 1 c/u | 56,9 / 53,5 / 48,0 / 49,3 / 51,2 % | | | | |
| Tema | noticia | 2 | 55,3 % (56,9 / 49,3) | 51,4 % | 1.316 (2.087 / 546) | 0 | 0,4 |
| Tema | evergreen | 11 | 53,6 % | 67,8 % | 1.511 | 2 | 0,8 |
| Tema | everyday | 1 | 51,2 % | 86,8 % | 1.552 | 0 | 0,6 |
| Categoría | pop culture / famosos | 2 | **55,7 %** | 59,8 % | **1.770** | 0 | **1,4** |
| Categoría | mind / psicología | 3 | 53,5 % | **75,9 %** | 1.482 | 1 | 0,7 |
| Categoría | historia rara | 2 | 54,1 % | — | 1.332 | 1 | 0,0 |
| Categoría | cuerpo | 4 | 51,8 % | 69,0 % | 1.722 (xr012 tira) | 0 | 0,6 |
| Categoría | negocios / tech | 1 | 49,3 % | 41,2 % | 546 | 0 | 0,0 |
| Horario (NY) | mediodía 11–14 h | 5 | 52,4 % | 65,4 % | 1.199 | 1 | 0,5 |
| Horario (NY) | tarde 16–18:30 h | **3** | 54,4 % | **77,7 %** | **2.143** | 0 | 0,3 |
| Horario (NY) | noche 19–22 h | 3 | 52,5 % | 61,3 % | 1.463 | 1 | 1,4 |
| Motor | cartoon / hyperframes | 1 / 0 | xr014 51,2 % / sin datos (xr017 salió hoy) | | | | |
Ninguna variable cumple la regla de retención (≥ 3 por nivel y ≥ 3 puntos): duración tiene medio n = 3 pero corto n = 1; horario tiene 3/3/3 pero la ventaja de la tarde es +2,0 puntos (no 3). **En alcance la tarde NY es clara (2.143 vs 1.199–1.463 vistas, n = 3 por nivel)**, aunque xr009 (noticia) y xr012 (corto) pueden explicar parte.

### Lectura video por video (23/11)
- **xr012 es el único video del canal que sigue creciendo después del lote inicial:** 1.631 → 2.799 en 3 días, con 91,8 % visto. Todos los demás quedaron planos entre 1.240 y 1.590 (xr009 también se frenó en 2.087). El patrón se confirma: un Short de ~16 s que se ve entero y se repite sigue recibiendo feed; los de 35–47 s no. Ojo: 0 subs y 0 shares; alcance, no fans.
- **xr013 (noticia Nvidia/Denny's) es el peor del canal: 546 vistas, ni siquiera completó el lote.** 41 % visto (13 s de 32). Tres razones: (1) no era noticia caliente — la historia del Denny's es vieja y el hecho tenía 7 días; (2) la apertura "<marca> was born at…?!" no dice nada nuevo a quien la conoce y no le importa a quien no; (3) negocios/CEO es la categoría con menos ganas de compartir. **Noticias: 1 de 2 anduvo (xr009 GTA, hecho de horas y cultura pop) → siguen 1 de cada 3, y solo si el hecho tiene ≤ 72 h y es de cultura pop / internet / algo que la gente ya está buscando.**
- **xr014 (everyday, cartoon, 26,7 s):** 86,8 % visto, la mejor terminación entre los de > 20 s. La retención inicial (51 %) la bajó la apertura "Eighteen minutes." (cifra suelta sin contexto, ya prohibida por HUMAN 21/11). Formato everyday promete: se ve entero.
- **xr008 (espejo, 34 s):** 79,7 % visto pese a 34 s; el tema "tu cara real" sostiene. Pero "You've never seen…" (y xr011 "You've never heard…", 48,0 %) no frena el scroll: los dos "You've never…" promedian 50,9 %. Confirma la prohibición de HUMAN.
- **xr011 (voz grabada, 36,9 s, xr6):** 48,0 %, de los peores. Largo + apertura "You've never…". La voz xr6 ya fue borrada.
- **Shares: 0 nuevos en 3 días (2 en 20.805 vistas).** Ni el cierre "share" (xr013) ni el "comment" movieron nada. El cierre no es la palanca; el tema sí.
- **Etiquetado:** xr017 (31,1 s) y xr019 (30,7 s) salieron con `duration: "short"` pero duran como MEDIO. Desde hoy cuenta la duración real del mp4; "short" = ≤ 22 s.

## Narradores — 23/11
| Narrador | n (≥ 300 v, ≥ 48 h) | Videos | Ret. inicial | % visto | Vistas prom. | Subs/1.000 |
|---|---|---|---|---|---|---|
| xr4 Absolute Lunatic | 3 | xr007, xr010, xr012 | 53,6 % | 69,3 % | 1.795 | 0,6 |
| xr2 Unhinged Podcaster | 1 | xr009 | 56,9 % | 61,6 % | 2.087 | 0,5 |
| xr1 Campfire Maniac | 1 | xr008 | 53,5 % | 79,7 % | 1.544 | 0,6 |
| xr8 Southie Hothead | 1 | xr014 | 51,2 % | 86,8 % | 1.552 | 0,6 |
| xr7 Queens Firecracker | 1 | xr013 | 49,3 % | 41,2 % | 546 | 0,0 |
| xr6 Total Meltdown (borrada) | 1 | xr011 | 48,0 % | 64,8 % | 1.587 | 0,6 |
| xr10 / xr11 / xr12 | 0 | xr015 (demora), xr018, xr016/xr020 | sin datos | | | |
| kokoro (respaldo) | 6 | v1 | 54,7 % | 65,6 % | 1.351 | 1,1 |
Resumen (23/11): **sin ganador**. Solo xr4 tiene n = 3 (53,6 %, el que más alcance trae por xr012). Las diferencias entre voces de n = 1 (48–57 %) las explican tema y apertura (xr7 cargó con la noticia vieja, xr6 con el "You've never…"). Pesos sin cambios. Sin voz nueva: la cuenta está en 10/10 y la última alta fue el 21/11 (máx. 1 por semana); las voces sobrias xr10–xr12 todavía no tienen datos.

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
| xr007-your-face | xr4 Absolute Lunatic | 0.0 | dobles / mind | 39,6 s | 56,6 % | 61,3 % | 1.328 | 0,8 |
| xr008-mirror-face | xr1 Campfire Maniac | 0.5 | espejo / mind | 34,3 s | | | | |
| xr009-gta-flu | xr2 Unhinged Podcaster | 0.0 | GTA 6 / pop culture (noticia) | 39,5 s | 57,1 % | 61,5 % | 2.046 | 0,5 |
| xr010-phone-germs | xr4 Absolute Lunatic | 0.0 | celular vs inodoro / cuerpo (asco) | 30,1 s | | | | |
| xr012-finger-muscles | xr4 Absolute Lunatic | 0.0 | dedos / cuerpo (tibio, cancelado pero público) | 15,7 s bucle | 49,7 % | 96,8 % | 1.631 | 0,0 |
| xr011-real-voice | xr6 Total Meltdown | 0.0 | tu voz grabada / cuerpo | 36,9 s | sale 21/11 | | | |
| xr013-dennys-nvidia | xr7 Queens Firecracker | 0.0 | Nvidia / noticia | 32,5 s | sin fila | | | |
| xr014-served-first | xr8 Southie Hothead | 0.0 | everyday / mind | 26,0 s | sale 21/11 | | | |

Resumen por narrador (20/11): **sin ganador** — xr2 57,1 % (n = 1, 2.046 vistas, noticia), xr4 52,8 % (n = 2: 56,6 % largo + 49,7 % corto tibio), kokoro 54,5 % (n = 6). Las diferencias las explican tema y duración, no la voz. xr1, xr6–xr8 con videos en camino. Pesos sin cambios; próxima alta de voz 21/11.

Resumen por narrador (19/11): **sin datos suficientes** — solo xr4 tiene 1 video con datos (xr007: 56,5 % ret. inicial, 21 h, vs 54,5 % del promedio kokoro). xr009 (xr2) con 6 vistas a 25 h (posible demora); xr010 (xr4) y xr008 (xr1) recién salieron. Primer corte posible el 21–22/11. Pesos sin cambios.

Resumen por narrador (18/11): **sin datos todavía** — xr009 (xr2) salió hoy 22:34 UTC; xr007 (xr4) 19/11 02:50 UTC; xr010 (xr4) y xr008 (xr1) 19/11; xr011 (xr6) 21/11. Primer corte posible el 21/11.

Resumen por narrador (17/11): **sin datos todavía** — ningún video con ElevenLabs está publicado (xr009 sale 18/11, xr007 19/11 02:50 UTC, xr010 y xr008 19/11).

Nota de la dueña (17/11): xr4 es su favorita ("muy loca, exaltada"). El optimizador completa esta tabla y ajusta los pesos de `tools/voices.json` → `rotation`.
