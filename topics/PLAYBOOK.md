# PLAYBOOK — reglas vivas de producción (las ajusta el optimizador diario)

La producción nocturna (`topics/AUTOPILOT.md`) **sigue este archivo**; donde algo de acá choca con AUTOPILOT §2b/§3c, gana este archivo. Lo edita la tarea programada "Stories X-Ray: optimizador diario" después de leer YouTube Analytics. Cada cambio queda registrado en `topics/EXPERIMENTS.md` (qué, por qué, con qué datos).

## Métrica principal
Retención inicial = `engagedViews / views` (≈ "Stayed to watch"). Objetivo ≥ 70 %. Secundarias: `averageViewPercentage`, vistas a 48 h, suscriptores por 1.000 vistas, compartidos.

## Reglas ganadoras (se aplican siempre)
- Apertura v2 (AUTOPILOT §2b): gancho completo < 1,5 s, título + subtítulo desde el frame 0, imagen más extrema en el frame 0.

## Experimento activo
- **E1 — voz (cambiado por la dueña el 16/11/2026): narradores ElevenLabs histriónicos en rotación**, `xrNNN % 3` → `xr1` Campfire Maniac / `xr2` Unhinged Podcaster / `xr3` Porch Legend (`tools/voices.json`, flujo en NEW_VIDEO.md paso 4, Make XR-07). Kokoro (`af_heart`/`am_michael`) queda solo como respaldo si Make falla.
- Desde: el primer video producido después del 16/11/2026 21:55 ART.
- **Narradores vivos (regla de la dueña, 16/11/2026: probar de todo, cada vez más histriónico).** Rotación actual en `tools/voices.json` → `rotation` (hoy xr1–xr4; `xr4` Absolute Lunatic es el más extremo, estabilidad 0.0). El optimizador:
  - **Crea un narrador nuevo** con `tools/new_voice.py` + Make **XR-08-ELEVENLABS-NEW-VOICE (7068664)** cuando (a) el mejor narrador supera al resto por ≥ 3 puntos de retención con ≥ 3 videos cada uno: el nuevo es una versión TODAVÍA MÁS histriónica de ese ganador (misma base, más extremo en energía, contrastes susurro/grito, risas, ritmo); o (b) pasaron 7 días sin narrador nuevo. Máximo 1 por día.
  - Descripción siempre ORIGINAL (adjetivos de voz, edad, acento genérico, energía). Nunca imitar a una persona real o famosa, nunca clonar, nunca usar voces de la Voice Library: así las voces son de la dueña y se monetizan sin problema. `new_voice.py` corta si detecta "sounds like", "clone", "celebrity"…
  - **Retira** de `rotation` (no borra la voz) al narrador con peor retención cuando tiene ≥ 3 videos y queda ≥ 3 puntos abajo del mejor. Rotación activa: entre 3 y 5 narradores.
  - Registra cada alta y baja en el historial de abajo y en `topics/EXPERIMENTS.md`.
  - Si XR-08 falla por límite de voces de la cuenta (Starter), no borra nada: retira de la rotación y avisa a la dueña. Cierra con ≥ 3 videos por narrador, ≥ 300 vistas y ≥ 48 h cada uno. El optimizador puede sacar al peor narrador de `rotation` en `tools/voices.json`; agregar narradores nuevos lo decide la dueña (crearlos gasta créditos y cupos de voz).

## Próximos experimentos (en orden; uno a la vez)
1. Duración: 28–32 s vs 36–40 s.
2. Tipo de gancho: dato imposible vs pregunta directa vs contradicción ("It's not X").
3. Ritmo: cambio de plano cada ~2 s vs cada ~4 s.
4. Final en bucle explícito (la última frase empalma con la primera) vs final cerrado.
5. Subtítulos: tamaño actual vs +20 % con palabra clave en amarillo y rebote.
6. Música: nivel actual vs −4 dB y golpe en el segundo 0.
7. Categoría de tema (cuerpo humano, historia rara, marcas, supervivencia, ciencia extrema): priorizar dentro de cada nivel de puntaje la que mejor retiene.
8. Horario de publicación: franja que más vistas a 48 h da.

## Historial de decisiones
| Fecha | Cambio | Motivo / datos |
|---|---|---|
| 17/11/2026 | Alta xr4 Absolute Lunatic (XR-08, estabilidad 0.0) | Pedido de la dueña: probar una voz todavía más histriónica |
| 16/11/2026 | Voz: kokoro → 3 narradores ElevenLabs en rotación (E1 nuevo) | Pedido de la dueña: voz única, histriónica, que no suene a IA y retenga |
| 16/11/2026 | Apertura v2 adoptada | Línea base 58–62 % stayed to watch, corte en ~1.200 vistas |
