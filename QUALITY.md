# Reglas de calidad — Stories X-Ray

Todo lo que se aprendió corrigiendo los videos 1 a 3. Un video no se publica si falla una sola de estas reglas.

## 1. Datos
- Verificar cada dato con búsqueda web antes de escribir el guion. Guardar las fuentes en `meta.json`.
- Si un dato está discutido (por ejemplo, un estudio que otro no pudo repetir), el guion lo dice con cautela ("scientists think") y se anota en `notes`.
- Nada de marcas, logos, arcos de McDonald's, caras reales ni personajes con derechos. Personas = figuras genéricas sin parecido.
- Lesiones o temas fuertes: solo en esquema de rayos X o corte, nunca gráfico.

## 2. Guion
- Gancho en los primeros 2 segundos, que contradiga lo que todos creen ("It's not the water").
- 40 a 50 segundos. Nunca más de 59.
- Una idea por frase. Frases cortas para que los subtítulos no se amontonen.
- Final en bucle: la última imagen vuelve a la primera para que el video se repita sin corte.
- Revisar cómo pronuncia la voz los nombres propios (`python -c` con `k.tokenizer.phonemize`). Si suena mal, escribirlo como se pronuncia.

## 3. Textos en pantalla
- Títulos: franja central de 840 px (de x=90 a x=930), arriba. Subtítulos: franja de 800 px (x=110 a x=910), a la altura del 60 %. Nunca tocar los bordes ni la zona de botones de YouTube a la derecha.
- Se achican solos si no entran (`fit()` en `player.html`). No pelear contra eso con tamaños fijos.
- Subtítulos: máximo 3 palabras y 12 letras por bloque. Palabras clave en amarillo (lista `KEY` en `shots.js`).
- Los tiempos de los subtítulos se anclan a las pausas reales del audio (`voice.py`). Si avisa "fell back", revisar esa frase.
- Ningún texto encima de lo importante de la imagen. Las etiquetas 3D (`labelSprite`) van debajo o arriba del objeto, sin pisar otros elementos.

## 4. Imagen
- Estilo fijo: color plano, sombreado en 3 tonos, contorno negro, fondo oscuro con halo para los rayos X (cian `#22d3ee`).
- Antes del render completo: dibujar a tamaño real (`render.py stills`) el momento más cargado de cada plano y mirarlo.
- Errores que ya pasaron y no pueden volver a pasar:
  - Cuerpo metido dentro de un asiento o de otro objeto. Personaje sentado = cuerpo entero visible delante del respaldo.
  - Siluetas sin pelo ni hombros (se ven como un disco).
  - Halos blancos que queman el fondo y dejan la figura sin contraste.
  - Flechas apuntando al revés (las de presión siempre hacia el objeto).
  - Dedos que se cruzan al agarrar: las yemas convergen y miran al objeto.
  - Objetos cortados por el borde del cuadro sin intención (arcos de dedos, flechas, platos).
  - Etiquetas que se pisan entre sí o con un objeto.
  - Detalles sueltos que no se entienden (arrugas como palitos sueltos): agrupar en patrones reconocibles.
  - Objetos demasiado chicos en plano general: si no se reconocen en un celular, acercar la cámara.
- Transición a rayos X: línea de escaneo + destello breve.

## 5. Sonido
- Voz siempre al frente: `mix.py` informa el margen voz/fondo por plano; mínimo 4 dB, ideal 8 o más.
- Volumen final: −14 LUFS integrado, pico −1 dBTP (lo hace `mix.py`).
- Efectos sincronizados con lo que pasa (golpe, burbujas, tic del reloj), nunca tapando una palabra clave.

## 5b. Miniatura HYPER CLICKBAIT (obligatoria, define el clic)
**Regla de la dueña (16/11/2026): TODOS los videos salen con miniatura perfecta e hiperviral, sin excepción.** `tools/thumbnail.py` corta con error y `handoff.py` pone `hold` si no se cumple lo siguiente:
- **`protect` obligatorio:** caja (px finales) del sujeto clave: cara, fuego, ola. El texto y el sello nunca lo tapan (el script mueve el texto arriba o abajo). Los rayos y la franja oscura no lo ensucian, y el brillo del círculo queda solo por fuera del aro. La cara o el objeto tienen que verse nítidos y enteros.
- **Los 3 ganchos siempre:** círculo, rayos y sello (`badge`). Si falta el círculo o los rayos, se centran en `protect`; el sello es obligatorio.
- **De 2 a 4 palabras** y **cada línea de al menos 120 px de alto** (se lee en el feed). Si no entra, menos palabras u otro cuadro, nunca letra chica.
- **Al menos 3 `variants`** en `meta.json`, con `pick` en la elegida. Se miran todas juntas en `out/<id>/thumb_variants.jpg` (tamaño feed) y gana la que se lee y da ganas de tocar en medio segundo. Hay que mirarla de verdad, no elegir a ciegas.
- **Cuadro:** el momento más extremo, con el sujeto grande (≥ 25 % del alto). Si el sujeto no se reconoce en el feed, elegir otro cuadro. El tachado no puede tapar la palabra.
- `handoff.py` exige `out/<id>/thumb_report.json` y que `thumb.jpg` sea exactamente el archivo chequeado (mismo SHA-256).
- **Instagram y Facebook (desde 16/11/2026):** `tools/social.py` (lo llama `build.py`) hace `cover_social.jpg` con `thumbnail.py --social` (misma miniatura, pero dentro de la zona 3:4 que muestra la grilla del perfil de Instagram: filas 270–1650; se ajusta con el bloque opcional `social_thumbnail` de `meta.json`) y `video_social.mp4`, que es el video con esa portada como **primer cuadro** (1 cuadro, 33 ms). XR-03 publica ese archivo con `thumb_offset 0`, así la portada en Instagram y Facebook es la nuestra. `handoff.py` pone `hold` si falta. Mirar `out/<id>/cover_social_variants.jpg` igual que la de YouTube.
- Para rehacer solo la miniatura de un video ya armado: `python tools/rethumb.py <id>`. Si el video ya está en YouTube, el archivo nuevo hay que subirlo ahí aparte.

La hace `tools/thumbnail.py` con el bloque `"thumbnail"` de `meta.json` (ver el encabezado del script). Objetivo: que nadie pueda pasarla sin tocar. Se revisa `out/<id>/thumb_preview.jpg`: la versión chica (tamaño del feed) tiene que leerse y dar ganas de tocar en medio segundo.
- **El momento más extremo del video, enorme**: la ola, el tanque que revienta, el objeto imposible. Zoom 1.05–1.3 sobre la acción, cuadro limpio (`render.py clean`).
- **Siempre los 3 ganchos visuales**: (1) círculo rojo `circle` sobre la cosa clave, (2) rayos de luz `rays` saliendo de ese mismo punto, (3) sello `badge` rojo inclinado con fecha, lugar o cifra ("BOSTON 1919", "7 MIN", "$1,000,000"). Flecha roja `arrow` solo si el círculo no alcanza.
- **Texto de 2 a 4 palabras, gigante, inclinado (`tilt` −3 a −6), con brillo**, que haga explotar la curiosidad. Fórmulas que funcionan, rotando:
  - contradicción con tachado: "IT WASN'T / ~~WATER~~" (`strike: true`);
  - número brutal en caja roja: `{"text": "7 MINUTES", "box": "#FF3B30"}` + "NO AIR";
  - consecuencia increíble: "HE KEPT / DANCING";
  - pregunta directa: "WHO STOLE / HIS BODY?";
  - "THEY / HID THIS" solo si en el video realmente hay algo oculto que se revela.
- Una palabra o caja en amarillo `#FFD60A` o rojo `#FF3B30`, el resto en blanco con borde negro grueso.
- **Clickbait honesto, sin excepción**: todo lo que promete la miniatura pasa en el video y es verdad. Nada de sangre, cuerpos ni heridas; nada de logos; nada de parecidos con personas reales. Una miniatura que engaña hace que la gente se vaya a los 2 segundos y YouTube deja de mostrar el video.
- **Márgenes automáticos**: `thumbnail.py` encaja todo en la zona segura (80 px a los costados, 120 px arriba, nada debajo de 1490 px, donde YouTube pone el título), achica el texto si hace falta, mueve el sello para que no pise el texto ni el círculo y corta con error si algo no entra. En `thumb_preview.jpg` la zona segura se ve en celeste y la franja del título en violeta.
- **Probar al menos 3 variantes** (cuadro, texto, posición) y quedarse con la que más se lee en la vista chica. Variar entre días: color del brillo, lado del sello, texto arriba o abajo, tachado / caja / pregunta.
- `handoff.py` exige `thumb.jpg` de 1080×1920, < 2 MB y hecho con `thumbnail.py`.

## 6. Revisión final (obligatoria)
1. `review.jpg`: una imagen cada 1,1 s. Recorrerla entera buscando los errores de la sección 4.
2. `review_mid.jpg`: el cuadro central de cada plano, grande.
3. Extraer a tamaño real cualquier momento dudoso y mirarlo.
4. Duración < 59 s, loudness −14 LUFS, sin errores de página en el render.
5. Escuchar el video entero con sonido (esto lo hace una persona: Claude no puede escuchar audio).
6. Regla de la dueña (15/11/2026): no hay aprobación previa. Todo lo que está en `publish/` se publica salvo que `metadata.json` tenga `"status": "hold"`. Si algo de este archivo no se cumple, poner `hold` y avisar.
