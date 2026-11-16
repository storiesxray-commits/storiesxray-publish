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

## 5b. Miniatura (obligatoria, define el clic)
La hace `tools/thumbnail.py` con el bloque `"thumbnail"` de `meta.json` (ver el encabezado del script). Se revisa `out/<id>/thumb_preview.jpg`: la versión chica (tamaño del feed) tiene que leerse en un segundo.
- **Un solo momento visual**, el más impactante del video (la ola, el tanque que revienta, el objeto imposible), grande y entendible sin contexto. Cuadro limpio, sin subtítulos (`render.py clean`).
- **Texto de 2 a 5 palabras, en mayúsculas, en 1 a 3 líneas**, que abra una pregunta que el video responde: contradicción ("IT WASN'T WATER"), número extremo ("7 MINUTES. NO AIR."), consecuencia ("HE KEPT DANCING"), pregunta ("WHO STOLE IT?"). No repetir el título palabra por palabra.
- Una palabra clave en amarillo `#FFD60A` o rojo `#FF3B30`, el resto en blanco. Como mucho un recurso extra: círculo rojo, flecha roja o etiqueta (fecha, lugar, cifra).
- **Clickbait honesto**: todo lo que promete la miniatura pasa en el video y es verdad. Nada de sangre, cuerpos ni heridas; nada de logos; nada de parecidos con personas reales. YouTube castiga las miniaturas engañosas y el público también (retención).
- Nada importante en el 22 % de abajo (ahí YouTube pone el título) ni pegado a los bordes.
- Variar entre videos: posición del texto (arriba o abajo), color de acento, recurso extra y encuadre. No usar la misma plantilla dos días seguidos.
- `handoff.py` exige `thumb.jpg` de 1080×1920, < 2 MB y hecho con `thumbnail.py`.

## 6. Revisión final (obligatoria)
1. `review.jpg`: una imagen cada 1,1 s. Recorrerla entera buscando los errores de la sección 4.
2. `review_mid.jpg`: el cuadro central de cada plano, grande.
3. Extraer a tamaño real cualquier momento dudoso y mirarlo.
4. Duración < 59 s, loudness −14 LUFS, sin errores de página en el render.
5. Escuchar el video entero con sonido (esto lo hace una persona: Claude no puede escuchar audio).
6. Regla de la dueña (15/11/2026): no hay aprobación previa. Todo lo que está en `publish/` se publica salvo que `metadata.json` tenga `"status": "hold"`. Si algo de este archivo no se cumple, poner `hold` y avisar.
