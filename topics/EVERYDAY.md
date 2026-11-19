# EVERYDAY X-RAY — formato de situaciones cotidianas (dueña, 19/11/2026)

**Everyday moments. Hidden explanations.** Mostrarle al espectador algo que vivió cientos de veces y revelarle qué pasa realmente detrás (psicología, neurociencia, fisiología, percepción, memoria, decisiones, comportamiento social). Es una categoría más del canal: no reemplaza a los otros formatos. Documento completo de la dueña: `topics/EVERYDAY_MASTER.txt` (40 ideas con escena, revelación, cierre y un guion modelo del restaurante, §6). Ideas en `queue_v3.json` con `"format": "everyday"` (E01–E40).

Tres reacciones seguidas: **identificación** ("me pasa exactamente a mí") → **curiosidad** ("¿cómo puede ser?") → **revelación** ("ahora entiendo, se lo mando a alguien").

## 1. Cuándo se produce
AUTOPILOT §1c: los ids con número **mod 3 = 2** (xr014, xr017, xr020…) son EVERYDAY, salvo que §1b obligue a una noticia. Se toma el primer `todo` con `format: "everyday"`. El optimizador diario compara EVERYDAY contra el resto y puede subir o bajar la frecuencia.

## 2. Filtro (además de AUTOPILOT §1a)
- **Prueba de los 2 segundos:** ¿alguien que ve los primeros 2 s, sin sonido, puede pensar "esto me pasó ayer"? Si no, se revisa o se descarta.
- Cuenta como reacción fuerte de §1a la **identificación inmediata con un conflicto emocional** (frustración, vergüenza, ansiedad, nostalgia, decepción) + una revelación que no es obvia.
- Descartar si: necesita mucho contexto, no se entiende visualmente, la explicación es obvia, no hay respaldo científico confiable, depende de cifras inventadas, se parece demasiado a otro video publicado, o termina sin respuesta satisfactoria.
- Fórmula para ideas nuevas: **situación reconocible + emoción real + detalle inesperado + explicación verificable**. Categorías: esperas y frustraciones, relaciones y mensajería, cerebro y memoria, dinero y consumo, viajes y expectativas, tecnología y redes, comida, vergüenza y situaciones sociales, tiempo y rutinas, comportamientos extrañamente universales.

## 3. Guion (inglés natural, 20–28 s; esta duración reemplaza la variable de duración del PLAYBOOK, anotar `experiment.duration = "everyday"`)
- **No empezar con una explicación: empezar con una experiencia.** ✗ "Did you know your brain perceives time differently?" ✓ "You walked in for ONE reason. Now it's gone."
- **0–3 s, identificación:** la situación en imagen desde el cuadro 0 + primera frase de ≤ 7 palabras (AUTOPILOT §2b). El gancho del doc se puede partir en dos frases.
- **3–8 s, tensión:** el detalle que empeora todo (la otra mesa recibe primero, la puerta del colectivo se cierra, el 99 % se clava). No revelar todavía.
- **8–19 s, explicación visual:** UNA sola gran idea, mostrada, no narrada: congelar la escena, pantalla dividida, dos líneas temporales, relojes, rayos X del cuerpo o del cerebro solo cuando aclaran. No convertir todos en animaciones de cerebro.
- **19–25 s, cierre:** una frase que cambia cómo el espectador va a vivir esa situación la próxima vez ("Your food didn't change. What you compared it to did."). Sin explicación larga al final. Variar los cierres (HUMAN.md §1).
- Narrador con frases cortas y naturales, sin lenguaje académico. Actuación sutil: este formato pide menos grito y más complicidad que los otros (máx. 2–3 etiquetas).

## 4. Imagen y sonido
- Estilo **"pro"** (NEW_VIDEO.md paso 5): escenas humanas creíbles en lugares reconocibles con `world.js` (restaurante, supermercado, casa, calle, colectivo, aeropuerto, oficina), primeros planos de caras y manos, cámara con intención, profundidad de campo, cortes que aportan información o emoción. Nada de diapositivas ni imágenes genéricas con voz encima.
- Interfaces (mensajería, barra de carga, streaming, reseñas) siempre **inventadas**: sin logos ni pantallas reconocibles de WhatsApp, Netflix, etc.
- Sonido sincronizado con la acción: notificaciones, bocinas, pasos, relojes, respiraciones, silencios dramáticos. Música que acompaña el conflicto y la revelación, nunca la misma pista en serie.
- Texto en pantalla corto, minimalista y legible; no tapar la escena. Marca Stories X-Ray discreta.

## 5. Rigor (obligatorio)
- Cada fenómeno con **≥ 2 fuentes serias** (papers, universidades, instituciones, divulgación basada en evidencia). Las fuentes del campo `reveal` de la cola son pistas: verificarlas y abrirlas.
- Distinguir lo establecido de lo hipotético; no presentar correlación como causa; nada de "siempre" ni "todos". Usar "can", "often", "your brain may…".
- No inventar estudios, investigadores ni números. Las cifras de la escena ("27 minutes", "18 minutes") son dramatización y no se presentan como mediciones.
- Las visualizaciones de cerebro y cuerpo son ilustrativas.
- Si la base científica es débil: reformular o descartar (`dropped` con `drop_reason`).
- Nada de consejos médicos ni diagnósticos (sueño, ansiedad, TOC): explicar el fenómeno común, no tratarlo.

## 6. Métricas
Además de las de PLAYBOOK, el optimizador compara EVERYDAY vs los otros formatos en: stayed-to-watch, % visto, finalización, compartidos (clave en este formato), comentarios del tipo "this literally happened to me" y suscriptores por 1.000 vistas. Nunca decidir solo por vistas absolutas.

## 7. Entrega por idea (en `meta.json` → `everyday`)
`concept`, `emotion`, `question`, `phenomenon`, `evidence` (fuentes), `closing_line` y `human_angle` (HUMAN.md §1), además de lo habitual (guion, título, descripción con fuentes, comentario fijado, miniatura).
