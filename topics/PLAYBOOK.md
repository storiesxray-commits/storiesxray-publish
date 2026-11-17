# PLAYBOOK — reglas vivas de producción (las ajusta el optimizador diario)

La producción nocturna (`topics/AUTOPILOT.md`) **sigue este archivo**; donde algo de acá choca con AUTOPILOT §2b/§3c, gana este archivo. Lo edita la tarea programada "Stories X-Ray: optimizador diario" después de leer YouTube Analytics. Cada cambio queda registrado en `topics/EXPERIMENTS.md` (qué, por qué, con qué datos).

## Métrica principal
Retención inicial = `engagedViews / views` (≈ "Stayed to watch"). Objetivo ≥ 70 %. Secundarias: `averageViewPercentage`, vistas a 48 h, suscriptores por 1.000 vistas, compartidos.

## Reglas ganadoras (se aplican siempre)
- Apertura v2 (AUTOPILOT §2b): gancho completo < 1,5 s, título + subtítulo desde el frame 0, imagen más extrema en el frame 0.

## Experimento activo
- **E1 — voz.** Ids impares: `af_heart`; ids pares: `am_michael`. `speed` 1.10.
- Desde: xr007. Cierra con ≥ 3 videos por brazo, ≥ 300 vistas y ≥ 48 h cada uno.

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
| 16/11/2026 | Apertura v2 adoptada | Línea base 58–62 % stayed to watch, corte en ~1.200 vistas |
