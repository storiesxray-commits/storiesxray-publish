# Posicionamiento extremo (pedido de la dueña, 18/11/2026)

Objetivo: que cada video se encuentre no solo en el feed de Shorts sino también en la **búsqueda de YouTube, Google y las IAs** (ChatGPT, Gemini, Perplexity), **en los países de habla inglesa que más pagan: EE. UU. primero, después Canadá, Australia, Reino Unido, Nueva Zelanda e Irlanda.**

## 1. En cada video (lo controla `tools/seo.py`; si falla, `handoff.py` pone `hold`)
Bloque `seo` en `meta.json`:
- `keyword`: la frase exacta que escribiría alguien en EE. UU. (ortografía y vocabulario de EE. UU.: "color", "fall", "apartment", "cell phone"). Buscar la frase con autocompletado de YouTube/Google en la cabeza: preguntas ("why does…", "what happened…") o nombre propio + hecho.
- El título contiene la keyword (o casi toda) y sigue siendo un gancho; la primera línea de la descripción también.
- Las palabras de la keyword van en los primeros 150 caracteres de la descripción (es lo que se ve en la búsqueda).
- `tags`: 10 a 20; el primero es la keyword; al menos 2 de cola larga (4+ palabras); total < 500 caracteres.
- 3 a 5 hashtags en la descripción.
- `title_alts`: 2 títulos alternativos distintos. **XR-10** cambia al primero a las 48 h si el video tiene menos de 1.500 vistas (prueba A/B automática; una sola vez).
- `playlist`: nombre de lista con palabras de búsqueda (una por serie). XR-10 la crea si no existe y agrega el video.
- `questions`: 3 preguntas reales que la gente escribe, cada una con su respuesta (`{"q": …, "a": …}`, 1–2 oraciones con datos de las fuentes). Van al sitio web como preguntas frecuentes con schema `FAQPage` (Google y las IAs citan eso).
- `pinned_comment`: por ahora se publica a mano (la conexión de YouTube de Make no tiene el permiso de comentarios).

## 2. Automático después de publicar (Make, XR-10-YT-SEO-BOOST, cada 1 h)
1. Video público → lo agrega a la playlist de su serie (crea la playlist pública si no existe).
2. Fija idioma del video `en` / audio `en-US` (señal de público de EE. UU.).
3. Escribe `publish/<id>/yt.json` en el repo con el id de YouTube → el sitio se reconstruye solo.
4. A las 48 h: si tiene < 1.500 vistas, cambia el título por `title_alts[0]` (una vez) y lo anota en el ledger.

## 3. Sitio web (Google + IAs)
`tools/site.py` arma `site/` (GitHub Pages, workflow `.github/workflows/site.yml`): una página por video con el video embebido, transcripción, datos, preguntas frecuentes, fuentes, schema `VideoObject` + `FAQPage`, `sitemap.xml`, `robots.txt` y `llms.txt`. Idioma `en-US`. Se publica solo en cada push.
