# Videos largos (horizontales) — Stories X-Ray

Regla de la dueña (18/11/2026): **un video largo por semana**, a nivel extremo de calidad y sin un solo error. Este archivo es el estándar. Si un video no cumple algo de acá, se arregla o queda en `"status": "hold"`.

## 0. Para qué existen
- YouTube paga por horas de reproducción de videos largos; las horas de Shorts **no cuentan** para entrar al Programa de Socios.
- Hoy la vara es 1.000 suscriptores + 4.000 horas en 12 meses. **Desde el 1/2/2027 sube a 8.000 horas** para los canales nuevos. Meta: llegar a 4.000 h antes de esa fecha.
- Cuenta: 4.000 h = 240.000 min. Con videos de 12 min y 45 % visto en promedio (5,4 min por vista) hacen falta **~44.000 vistas** en total en los videos largos.
- Los Shorts son el tráiler: cada Short del mismo tema lleva el video largo como "video relacionado".

## 1. Métricas objetivo (se miden con XR-06 y se anotan en `topics/EXPERIMENTS.md`)
| Métrica | Mínimo | Objetivo |
|---|---|---|
| CTR de la miniatura | 5 % | 8 %+ |
| Retención a los 30 s | 65 % | 75 %+ |
| % promedio visto | 40 % | 50 %+ |
| Suscriptores por 1.000 vistas | 3 | 8+ |

## 2. Formato técnico
- 16:9, **render a 2560×1440 (1440p), 30 fps**. Subir 1440p hace que YouTube use su códec de más calidad, incluso para quien mira en 1080p.
- 9 a 14 minutos (más de 8 para poder poner anuncios en el medio). Nunca relleno: si la historia da 9, son 9.
- Capítulos en la descripción (desde 0:00, mínimo 3, cada uno ≥ 10 s).
- Volumen −14 LUFS integrado, pico −1 dBTP. Voz siempre ≥ 8 dB sobre la música.

## 3. Estructura de retención (obligatoria)
| Tramo | Qué pasa |
|---|---|
| 0:00–0:30 **cold open** | La imagen más impactante de todo el video en el primer cuadro. Una promesa clara de lo que se va a descubrir. Sin logo, sin intro, sin "in this video". |
| 0:30–1:30 | Contexto mínimo + la primera pregunta abierta ("nobody asked the obvious question"). |
| Cada 60–90 s | **Re-gancho**: cierre de una pregunta y apertura de otra más grande. |
| Cada 6–10 s | Cambio visual (plano, cámara, escala, rayos X, mapa, texto). Nunca más de 12 s con la misma imagen quieta. |
| ~50–60 % | **Giro del medio**: un dato que da vuelta lo que el espectador creía. |
| Último tercio | La revelación más fuerte. No se resuelve todo antes. |
| Final | Una última imagen fuerte y cierre en ≤ 20 s. Nada de "thanks for watching". Pantalla final (15–20 s) apuntando al **próximo video**, no al canal. |

**Pedido de suscripción:** una sola vez, una frase, justo después de un momento fuerte (~60–70 % del video), ligada a la serie ("we X-ray one of these every week"). Nunca al principio ni rogando.

## 4. Guion
- Inglés, 1.250–1.900 palabras (≈ 145 palabras por minuto con pausas). Narración con opinión, humor seco y tensión: que suene a persona que cuenta una historia, no a enciclopedia.
- Cada dato verificado con búsqueda web; fuentes en `meta.json` y en la descripción. Los datos discutidos van con cautela ("survivors said", "one modern analysis found").
- Nada de rellenar con datos sin fuente: si no se pudo verificar, se saca.
- Frases cortas, una idea por frase, verbos fuertes. Leerlo en voz alta (mental) buscando trabas.
- Prohibido: listas de datos sin historia, frases genéricas ("throughout history"), repetir la misma estructura de frase en cadena.

## 5. Voz (ElevenLabs)
- Para 12 minutos, una voz a estabilidad 0,0 cansa. Narrador de largos: **storyteller carismático, estabilidad 0,35–0,5**, que suba la intensidad en los momentos clave. Se prueba primero con 60 s del cold open.
- Mismo narrador en todos los largos (la voz es la marca del canal en formato largo).
- Consumo: ~11.000 caracteres por video largo (+ reintentos). Con Shorts diarios, el plan Starter (30.000 créditos/mes) **no alcanza**: hace falta **Creator** (121.000 créditos/mes).
- **Generar la voz por capítulo** (un archivo por capítulo, ~1.000 caracteres cada uno): si cambia una frase se rehace solo ese capítulo y no los ~7.000 caracteres del guion entero.
- Créditos: Make **XR-09-ELEVENLABS-USAGE** (7091835) deja plan, usados, límite y fecha de renovación en `global.bridge_last` del data store 202381. Mirarlo antes de generar.
- Claude no puede escuchar el audio: lo dice siempre. Se revisa por la transcripción (`voice.py`) y los tiempos de las pausas.

## 6. Textos en pantalla
- **Sin subtítulos quemados** en los largos. Sí: archivo de subtítulos `.srt` exacto (sale del guion con los tiempos reales), subido como subtítulos cerrados. Ayuda a quien mira sin sonido o no es nativo, y a que YouTube entienda el tema.
- Texto en pantalla solo para lo importante: fechas, cifras, nombres, títulos de capítulo, una cita clave. Máximo 6 palabras, en la zona segura (5 % de margen), nunca encima del sujeto.

## 7. Imagen
- Misma identidad del canal (color plano, sombreado en 3 tonos, contorno negro, rayos X en cian `#22d3ee`) llevada a cine:
  - Cámara con movimiento de cine: travelling, grúa, órbita, zoom lento; aceleración y frenado suaves, nunca lineales.
  - Profundidad: primer plano, plano medio y fondo en cada escena; niebla y luz direccional.
  - Escala: siempre algo de tamaño conocido (persona, carro, poste) al lado de lo enorme.
  - Recursos propios del canal: corte en rayos X, mapa 3D de la época, línea de tiempo, plano forense con medidas.
- **Ningún plano se repite más de 2 veces** y ninguna escena usa la misma plantilla que otra del mismo video (esto es lo que YouTube castiga como contenido "inauténtico").
- Personas = figuras genéricas sin parecido. Víctimas nunca en pantalla; la tragedia se cuenta con objetos (un balde, un carro volcado, un reloj parado).
- `altered_or_synthetic_realistic: false` (es animación estilizada, no realista).
- Fotos de archivo de dominio público (antes de 1929 en EE. UU.) suman autenticidad: se pueden usar con zoom lento si la dueña las consigue (la red del entorno no las descarga).

## 8. Sonido
- Música por acto (tensión → desastre → investigación → revelación), con silencios a propósito antes de los golpes.
- Efectos en capas sincronizados con la imagen. Nunca tapan una palabra clave.
- La música tiene que tener licencia comercial (ElevenLabs Music con plan pago o música propia generada por código).

## 9. Control de calidad (nada sale sin esto)
1. Hoja de cuadros cada 2 s del video completo, mirada entera, más cuadros a tamaño real de cada plano cargado.
2. Chequeos automáticos: cuadros negros o congelados, texto fuera de la zona segura, silencios > 1,5 s, picos de audio, desfase voz/imagen.
3. Tabla de datos: cada afirmación del guion con su fuente.
4. Todas las reglas de `QUALITY.md` §4 y §5 que aplican.
5. Cualquier duda sin resolver → `hold`.

## 10. Empaque
- Título ≤ 60 caracteres, con curiosidad pero verdadero. 3 variantes de miniatura 16:9 (1280×720) para la prueba A/B de YouTube.
- Miniatura: el momento más extremo, enorme; 2–4 palabras; contraste que se lea en celular.
- Descripción: 2 líneas que enganchan + capítulos + fuentes.
- Comentario fijado con una pregunta que invite a responder.
- Lista de reproducción "X-Ray Deep Dives".

## 11. Publicación en las 3 plataformas (regla del 17/11/2026)
- YouTube: video completo (horizontal).
- Facebook: video completo (horizontal).
- Instagram: tráiler vertical de 60–90 s cortado del video largo (el cold open), a la misma hora.

## 12. Semana tipo
| Día | Qué |
|---|---|
| 1 | Tema (datos + demanda), investigación, guion y desglose de planos |
| 2 | Voz y tiempos; escenas 3D |
| 3 | Render por planos, revisión de cuadros, correcciones |
| 4 | Sonido, miniaturas, control de calidad completo, paquete de publicación |
