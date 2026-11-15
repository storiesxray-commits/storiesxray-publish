Carpeta que lee Make (XR-00, cada 2 h). `tools/build.py` deja acá `publish/<id>/video.mp4`, `thumb.jpg` y `metadata.json`; `tools/handoff.py` agrega `xr_payload.json` y pone `status: ready`.
Make publica todo salvo `"status": "hold"`. Ver PIPELINE.md.
