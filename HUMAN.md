# Canal humano (prioridad máxima desde 19/11/2026)

Instagram inhabilitó @storiesxray el 19/11/2026. Pedido de la dueña: que a YouTube no le pase nada. La política de YouTube que importa es **"inauthentic content"** (julio 2026): pierden la monetización los canales con videos genéricos, repetitivos o hechos con plantilla, aunque usen o no IA. Lo que protege al canal no es esconder herramientas: es que **cada video tenga criterio propio y se vea distinto del anterior**. Este archivo gana sobre PLAYBOOK, AUTOPILOT y QUALITY cuando choca con ellos (salvo las reglas de honestidad, que siempre ganan).

## 1. Criterio propio en cada video
- Cada guion tiene un **ángulo** que no está en Wikipedia: una conexión, una comparación, una opinión o una consecuencia práctica. Anotarlo en `meta.json` → `human_angle` (1 frase). Sin ángulo, no hay video.
- Prohibido el guion "gritado": máx. 0,5 signos de exclamación por frase y 2–4 etiquetas de actuación por video.
- No repetir la fórmula de apertura ni de cierre de los últimos 5 videos ("You've never…", "Be honest…", "Send this to…"). Cerrar a veces sin pedir nada.

## 2. Nada de plantilla visible
- **Miniaturas:** no repetir la misma receta en más de 2 videos seguidos. Rotar entre al menos 4 diseños: (a) círculo + rayos + sello, (b) primer plano sin círculo con texto en caja, (c) antes/después partido en dos, (d) objeto en estudio con flecha o número gigante, (e) sin texto o con 1 palabra. Variar lado del texto, color dominante y fondo.
- **Videos:** variar paleta, escenarios (`world.js`), personajes y estilo de subtítulo entre videos. Duraciones distintas (de 15 a 55 s), no siempre 30–45 s.
- **Títulos, descripciones, comentarios fijados y tags:** escritos para ese video. No arrancar 3 o más de los últimos 10 con las mismas palabras; tags con menos de la mitad en común con cualquier otro video.

## 3. Ritmo de persona, no de máquina
- Horario de publicación distinto cada día dentro de la franja buena (no siempre la misma hora).
- Máx. 1 Short por día + la serie THE MIRROR. Si un día no hay tema que pase el filtro, no se publica: un hueco es normal en un canal humano.
- Metadata de videos publicados: **máx. 1 cambio de título por video cada 30 días** sumando todo (XR-11, optimizador diario y semanal). Descripciones y tags: máx. 1 edición por semana por video. Nunca editar en masa muchos videos el mismo día.

## 4. Comentarios
- El sistema no comenta ni responde solo. Excepción: el comentario de votación de THE MIRROR (uno por parte). Las respuestas a la audiencia las escribe la dueña.

## 5. Honestidad y etiquetas
- `altered_or_synthetic_realistic: true` cuando hay imagen o voz realista que puede pasar por real (personas reales, lugares reales o hechos reales recreados con estilo "pro"). En estilo caricatura queda `false`. Nunca hacer hablar a una persona real con voz sintética.
- Personas reales: solo hechos verificados con fuentes, sin parecido físico, nada que sugiera delitos sin fuente seria.

## 6. Control automático
- Antes de `handoff.py`, correr `python tools/audit_human.py --id <id>`. Si sale con ROJO (código 2), corregir; si no se puede, `status: "hold"`. Los AMARILLO se corrigen si es barato.
- La tarea "Stories X-Ray: auditor de canal humano" revisa todos los días el canal entero y deja sus decisiones en "Historial de auditorías" al final de este archivo.

## Historial de auditorías
- 19/11/2026 — Primera auditoría (xr004–xr013): 9/9 miniaturas con la misma receta (círculo + rayos + sello) y 5 comentarios fijados que arrancan con "Be honest". Los guiones abren variados.
