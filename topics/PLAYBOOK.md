# PLAYBOOK — reglas vivas de producción (las ajusta el optimizador diario)

La producción nocturna (`topics/AUTOPILOT.md`) **sigue este archivo**; donde algo de acá choca con AUTOPILOT §2b/§3c, gana este archivo. Lo edita la tarea programada "Stories X-Ray: optimizador diario" después de leer YouTube Analytics. Cada cambio queda registrado en `topics/EXPERIMENTS.md` (qué, por qué, con qué datos).

## Métrica principal
Retención inicial = `engagedViews / views` (≈ "Stayed to watch"). Objetivo ≥ 70 %. Secundarias: `averageViewPercentage`, vistas a 48 h, suscriptores por 1.000 vistas, compartidos.

## Reglas ganadoras (se aplican siempre)
- Apertura v2 (AUTOPILOT §2b): gancho completo < 1,5 s, título + subtítulo desde el frame 0, imagen más extrema en el frame 0.

## Voz — rotación de narradores (corre siempre, en paralelo al experimento activo)
- Narradores ElevenLabs histriónicos en rotación según `tools/voices.json` → `rotation` (los duplicados son pesos; flujo en NEW_VIDEO.md paso 4, Make XR-07). Kokoro (`af_heart`/`am_michael`) queda solo como respaldo si Make falla. Anotar el narrador en `meta.json` → `experiment.voice`.
- **Preferencia de la dueña (16 y 17/11/2026):** le encanta `xr4` Absolute Lunatic (xr007, "8 billion people"): **muy loco, exaltado, que frene el scroll**. `xr4` va con **peso doble** mientras los datos no digan lo contrario. `xr3` Porch Legend fuera de rotación (voz guardada). Rotación hoy (18/11): `xr5, xr4, xr2, xr1, xr7, xr8, xr9, xr4, xr6` (xr013–xr015 estrenan las 3 voces nuevas).
- **Pedido de la dueña (18/11/2026):** probar voces de HOMBRE y de MUJER hiper histriónicas y locas, algunas con tonadas graciosas de regiones de EE. UU. Altas del 18/11: `xr7` Queens Firecracker (mujer, Nueva York), `xr8` Southie Hothead (hombre, Boston), `xr9` Texas Tornado (mujer, Texas). Próximas a probar cuando haya lugar: Minnesota/Medio Oeste exagerado, Valley girl de California, Nueva Jersey, Chicago, Sur profundo femenino. Mantener equilibrio hombre/mujer.
- **Límite de voces de ElevenLabs (plan Starter: 10 voces propias):** hoy hay 10 (xr1–xr9 + gt1). Para una voz nueva hay que borrar la peor retirada (p. ej. xr3) con aviso a la dueña; nunca tocar gt1.
- Todo narrador nuevo explora ese territorio: cambios bruscos susurro → grito, risas maníacas, palabras estiradas; nada de voces calmas o "de documental".
- El guion siempre se escribe para ser ACTUADO: frases cortas, exclamaciones, 3–4 etiquetas (`[gasps]`, `[whispers]`, `[laughs]`, `[shouting]`) en los giros.
- **Medición de voces (optimizador, todos los días):** tabla por narrador en `topics/EXPERIMENTS.md` (n.º de videos, retención inicial = engagedViews/views, % reproducido, vistas a 48 h, subs/1.000). Ajusta pesos: el mejor puede ir 2–3 veces; **retira** (sin borrar la voz) al peor cuando tiene ≥ 3 videos con ≥ 300 vistas y ≥ 48 h y queda ≥ 3 puntos abajo del mejor. Rotación activa: **4–8 narradores distintos** (ampliado 18/11 por pedido de la dueña). Cuidar que el tema no explique la diferencia.
- **Exploración de voces:** el optimizador crea un narrador nuevo con `tools/new_voice.py` + Make **XR-08 (7068664)** **cada 3 días**, o antes si hay un ganador claro (≥ 3 puntos arriba con ≥ 3 videos cada uno): el nuevo es una versión TODAVÍA MÁS histriónica del ganador. Máximo 1 por día. Descripción siempre ORIGINAL: nunca imitar a una persona real o famosa, nunca clonar, nunca Voice Library. Si XR-08 falla por límite de voces (hay voces de otro proyecto, `gt1`), no borrar nada: retirar al peor de la rotación y avisar a la dueña.
- Último narrador creado: 18/11/2026 (xr7, xr8, xr9, con tonadas regionales). Próxima alta: desde el 21/11/2026, salvo ganador claro antes.

## Experimento activo
- **E2 — Duración (abierto 17/11/2026 por el optimizador).** Brazo por id: **impar → LARGO 36–40 s**, **par → CORTO 28–32 s** (dentro del rango de AUTOPILOT §2b; alternar par/impar ya cumple la regla de variedad ±2 s de §3c). Anotar en `meta.json` → `experiment.duration` = `"long"` o `"short"` además de `opening` y `voice`.
- Por qué: en los videos viejos de 41–47 s el % reproducido promedio es ~64 % y la retención inicial ~55 % (YouTube Analytics 17/11). La duración es la palanca más directa para el % reproducido.
- Desde: el primer video producido después del 17/11/2026 20:47 ART. Los videos ya hechos (xr007–xr010) no cuentan.
- Cierre: ≥ 3 videos por brazo con ≥ 300 vistas y ≥ 48 h. Gana un brazo si supera al otro por ≥ 3 puntos de retención inicial sin bajar el % reproducido más de 5 puntos; sin diferencia clara a los 6 por brazo → queda el corto (más simple).

## Próximos experimentos (en orden; uno a la vez)
1. Tipo de gancho: dato imposible vs pregunta directa vs contradicción ("It's not X").
2. Ritmo: cambio de plano cada ~2 s vs cada ~4 s.
3. Final en bucle explícito (la última frase empalma con la primera) vs final cerrado.
4. Subtítulos: tamaño actual vs +20 % con palabra clave en amarillo y rebote.
5. Música: nivel actual vs −4 dB y golpe en el segundo 0.
6. Categoría de tema (cuerpo humano, historia rara, marcas, supervivencia, ciencia extrema): priorizar dentro de cada nivel de puntaje la que mejor retiene.
7. Horario de publicación: franja que más vistas a 48 h da.

## Historial de decisiones
| Fecha | Cambio | Motivo / datos |
|---|---|---|
| 17/11/2026 (optimizador) | Abre E2 duración (impar 36–40 s / par 28–32 s). Voz como rotación permanente aparte; reglas de narradores unificadas (4–6 activos, alta cada 3 días, retiro con ≥ 3 videos). Sin cambios de pesos ni narrador nuevo | Analytics 17/11: solo hay 3 videos viejos (kokoro, 41–47 s) con datos: retención inicial 49–65 % (prom. 55,4 %), % reproducido ~64 %. Ningún video ElevenLabs publicado todavía (el primero, xr009, sale el 18/11) → sin datos de narradores. Ya se crearon 2 voces hoy |
| 17/11/2026 | Altas xr5 Breathless Hype Host y xr6 Total Meltdown; xr4 con peso doble; xr3 fuera de rotación; voz nueva cada 3 días | Pedido de la dueña: le encanta la voz loca y exaltada de xr4 (xr007) y quiere probar más voces así y medir cuál rinde |
| 17/11/2026 | Alta xr4 Absolute Lunatic (XR-08, estabilidad 0.0) | Pedido de la dueña: probar una voz todavía más histriónica |
| 16/11/2026 | Voz: kokoro → 3 narradores ElevenLabs en rotación (E1 nuevo) | Pedido de la dueña: voz única, histriónica, que no suene a IA y retenga |
| 16/11/2026 | Apertura v2 adoptada | Línea base 58–62 % stayed to watch, corte en ~1.200 vistas |
