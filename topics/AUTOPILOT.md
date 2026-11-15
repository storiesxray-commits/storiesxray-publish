# Piloto automático: un video nuevo por corrida

La tarea programada de Claude corre esto cada 2 días. Make (XR-00 → XR-01 → XR-02) toma lo que quede en `publish/` y lo programa en YouTube (privado con fecha, cadencia 2 días, 12:00 hora de Nueva York). Instagram está en pausa.

## 0. Preparar el entorno (cada corrida arranca de cero)
```bash
bash tools/setup.sh          # pip, three.js, voz kokoro (~340 MB)
command -v ffmpeg && ls /usr/bin/google-chrome
```
Si falta algo que no se puede instalar, no producir: dejar el motivo en el resumen final.

## 1. Elegir el tema
- `topics/queue.json`: el primer ítem con `status: "todo"` (orden ascendente de `n`). El texto completo de cada idea está en `topics/BANK_100.txt`.
- Id nuevo: el `xrNNN` más alto en `videos/` + 1, con slug corto en inglés (`xr005-pepsi-fire`).

## 2. Verificar los datos ANTES de escribir
- Buscar en la web y abrir fuentes primarias u oficiales (la "FUENTE PARA INVESTIGAR" es una pista, no un fact-check).
- Seguir el CRITERIO EDITORIAL del banco: el gancho puede ser dramático, el dato no. En muertes, crímenes, salud o empresas: precisar quién hizo qué, incluir el desenlace y no atribuir culpas no probadas.
- Si un dato central no se puede confirmar con al menos dos fuentes serias, marcar el tema `status: "skipped"` con `note` y pasar al siguiente.
- Las fuentes (URLs https) van en `meta.json` → `sources` y también en la descripción.

## 3. Reglas visuales y de contenido
- Personas reales: figuras genéricas del motor (sin intentar parecido físico, sin fotos). Nombres en texto sí.
- Nada de logos, marcas gráficas, tipografías de marca ni personajes con copyright (Mickey, etc.): usar objetos genéricos y el nombre en texto.
- Muerte, heridas o violencia: no gráficas, simbólicas (siluetas, contadores, mapas). Nada de sangre ni cuerpos.
- Guion en inglés de EE. UU., original (sin citar textos de prensa), 40–50 s, una idea por oración (así `voice.py` corta bien las pausas).
- `meta.json`: `title` ≤ 100 caracteres y sin `<` ni `>`, `description`, `tags`, `series`, `caption_instagram`, `sources`, `platforms`, `made_for_kids: false`, `altered_or_synthetic_realistic: false`.

## 4. Producir
Seguir `NEW_VIDEO.md` y `QUALITY.md` completos: escenas, cuadros sueltos a tamaño real, `python tools/build.py <id>`, hojas `review.jpg` y `review_mid.jpg`, margen de voz ≥ 4 dB, −14 LUFS, nada cortado en los bordes. Corregir con `--only` hasta que todo cumpla.

## 5. Entregar
```bash
python tools/handoff.py <id>     # pone status "ready", o "hold" si algún chequeo falla
```
- Si quedó alguna duda de calidad o de datos sin resolver, poner `"status": "hold"` y `"hold_reason"` a mano.
- Actualizar `topics/queue.json` (`status: "done"`, `video_id`) y la tabla de `README.md`.
- `git add videos/<id> publish/<id> topics/queue.json README.md && git commit -m "<id>: <título>" && git pull --rebase && git push origin main`.

## Nunca
- Tocar otros `publish/<id>` ni cambiar su `status`.
- Subir xr001 (ya está en YouTube) ni xr002/xr003.
- Tocar Make, conexiones o cuentas. El repo es el único punto de contacto.
- Gastar créditos de servicios pagos (Kling, ElevenLabs, etc.).

## Resumen final de cada corrida (en español)
Tema, id, duración, LUFS, margen de voz, fuentes usadas, `status` final y el link del commit. Aclarar siempre que Claude no escuchó el audio.
