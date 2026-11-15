# Flujo automático: Claude → GitHub → Make → YouTube e Instagram

```
Claude (tarea programada)            GitHub (este repo)              Make
─────────────────────────            ──────────────────              ────
1 elige tema del banco          ──►  videos/<id>/  (código)
2 verifica datos, guion, escenas
3 python tools/build.py <id>    ──►  publish/<id>/video.mp4     ──►  4 detecta carpeta nueva
                                     publish/<id>/thumb.jpg          5 publica salvo status "hold"
                                     publish/<id>/metadata.json      6 sube a YouTube (programado)
                                                                     7 publica el Reel en Instagram
```

Por qué GitHub en el medio: el entorno en la nube de Claude llega a GitHub pero no a los webhooks de Make.

## Paquete de publicación (`publish/<id>/metadata.json`)
```json
{
  "id": "xr003-fingers-wrinkle",
  "title": "...", "description": "...", "tags": ["..."],
  "pinned_comment": "...",
  "language": "en-US", "category": "Science & Technology",
  "made_for_kids": false, "altered_or_synthetic_realistic": false,
  "publish_at_local": "19:00", "publish_timezone": "America/New_York",
  "platforms": ["youtube", "instagram"],
  "duration_s": 44.75,
  "status": "needs_approval"
}
```
`status`: `ready` (lo pone `tools/handoff.py`) → Make lo programa. `hold` frena la publicación (se puede poner en cualquier momento antes de que Make lo tome; después, el video ya está en YouTube como privado con fecha y se frena desde YouTube Studio).

## Escenario de Make (resumen)
1. **Disparador:** GitHub "Watch commits" en la rama `main`, filtrando cambios en `publish/*/metadata.json` (o un webhook de GitHub hacia Make).
2. **Leer** `metadata.json` (HTTP GET a la URL raw del archivo, con token si el repo es privado). Seguir salvo que `status` sea `hold`.
3. **Descargar** `video.mp4` y `thumb.jpg` (HTTP GET, binario).
4. **YouTube › Upload a Video:** título, descripción, etiquetas, categoría, idioma, "no es para niños", privado + fecha de publicación (`publish_at_local` en `publish_timezone`).
5. **Instagram › Create a Reel:** la API de Instagram exige una URL pública del video. Si el repo es privado, Make debe volver a alojar el archivo en un lugar público temporal (por ejemplo Google Drive con enlace público) antes de crear el Reel.
6. **Actualizar** `status` a `published` (GitHub › Update a file) para no publicar dos veces.

Regla de la cuenta de Make de Greentech: crear solo escenarios nuevos para el canal y no tocar nada existente.

## Tamaño del repo
Cada MP4 pesa ~25 MB (GitHub admite hasta 100 MB por archivo). Después de publicado, borrar `publish/<id>/video.mp4` en un commit para no inflar el repo.
