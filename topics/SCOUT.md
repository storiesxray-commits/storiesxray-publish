# Buscador semanal de ideas ultra virales

Una tarea programada corre esto **una vez por semana** (domingo a la tarde, hora de Córdoba). Busca 100 ideas nuevas, las califica con el sistema de la dueña y mete en `topics/queue_v3.json` **solo las de 90 a 100 con hook extremo** (`hook_power` 9 o 10). Las de 95–100 se publican antes que todo lo demás; las de 90–94, antes que las de 85 o menos.

## 1. Preparar
- Leer `CLAUDE.md`, `topics/AUTOPILOT.md` (línea editorial, público, reglas visuales) y `topics/queue_v3.json` completo: `items` (todos, incluso los `done`), `dropped_low_score`, `excluded_ip`, `merged_duplicates` y `calibration`.
- Leer también `scout_log` en `queue_v3.json` para no repetir ideas de semanas anteriores.

## 2. Buscar 100 ideas nuevas
- **Formatos que más funcionan en el canal** (de la cola actual): cosas sobre el propio espectador ("your brain…", "your face…", "you've never…"), ilusiones o pruebas que se hacen mirando el video, animales absurdos pero reales, números enormes o imposibles, comparaciones que rompen la intuición, historias reales increíbles con final sorprendente, preguntas que arman discusión en los comentarios.
- **Dónde buscar** (web search): tendencias y preguntas virales recientes en Shorts/Reels/TikTok en EE. UU., Reddit (r/todayilearned, r/interestingasfuck, r/Damnthatsinteresting, r/NoStupidQuestions), Google Trends de EE. UU., noticias de ciencia de la última semana (NASA, Nature, Science, Smithsonian, BBC Science Focus), récords Guinness recientes, efemérides de la semana siguiente. Es inspiración: los datos se verifican en el paso 4 y el guion siempre es propio.
- Cada idea: `hook` en inglés de EE. UU. (una línea, idealmente ≤ 10 palabras, pensada para pantalla en los primeros 1–2 s), `title_es` (tema en español), `reveal` (el dato que lo sostiene, en español) y al menos una fuente seria (`source_hint`).
- **Descartar antes de calificar:**
  - repetidas o casi iguales a algo de `items`, `dropped_low_score`, `excluded_ip`, `merged_duplicates` o `scout_log`;
  - las que necesitan personajes con copyright, logos o marcas gráficas para entenderse;
  - tragedias, crímenes o salud delicada como tema central; política; contenido para chicos;
  - las que no tienen una respuesta real y comprobable.

## 3. Calificar
- `viral` (1–10): curiosidad universal para EE. UU., ganas de compartir o comentar, que hable del espectador o de algo que todos conocen.
- `hook_power` (1–10): cuánto frena el scroll la frase de los primeros 1–2 s.
- `score = 5 × viral + 5 × hook_power`.
- **Calibrar contra `calibration`** (ejemplos reales de 100, 95, 90, 85 y 80): una idea nueva solo es 90–100 si es tan fuerte como esos ejemplos. Ante la duda entre dos puntajes, el más bajo. Escribir en una línea por qué cada candidata merece ese puntaje (`why`).
- **REGLA NUEVA (18/11/2026): leer `rule` y `calibration.rechazados_dueña` de queue_v3.json antes de calificar.** Datos curiosos tibios del cuerpo o la ciencia ("tus dedos no tienen músculos", "tus ojos ven al revés") NO entran aunque sean sobre el espectador: hace falta asco/horror, historia real increíble, escándalo o dinero de marca conocida, miedo/misterio, debate que llene comentarios o ilusión para probar ya. Ante la duda, no entra.
- **Regla de la dueña: ultra viral y hook a nivel extremo.** Para entrar hace falta `score` ≥ 90 **y** `hook_power` ≥ 9. Un 90 con hook de 8 (por ejemplo 10 + 8) no entra.

## 4. Verificar las candidatas (90–100)
- Para cada idea de 90 a 100 con `hook_power` ≥ 9: buscar y abrir **al menos dos fuentes serias** que confirmen el dato central. Si no se confirma, no entra.
- Ajustar el `hook` si hace falta para que sea verdadero sin perder fuerza (el gancho puede ser dramático, el dato no).

## 5. Meter en la cola
- Solo entran las de **90 a 100 con `hook_power` ≥ 9**, con id `S<AAMMDD>-NN` (fecha de la corrida), `status: "todo"`, `viral`, `hook_power`, `score`, `cat` (mind, body, animal, space, science, brand, human, earth, history, tech, nature), `hook`, `title_es`, `reveal`, `source_hint`, `why` y `note` (cuidados de producción).
- Cada una va **al final de su nivel**: las de 95–100 después de los 95–100 que ya estaban y antes del primer 90–94; las de 90–94 después de los 90–94 y antes del primer 85–89. Alternar categorías con sus vecinos.
- Si quedan más de 100 `todo`, los de menor puntaje pasan a `dropped_low_score` (con `"reason": "pushed out by weekly scout <fecha>"`), del final de la lista hacia arriba.
- Renumerar `rank` de toda la lista.
- Agregar a `scout_log` una entrada: `{"date", "found": 100, "scored_90_plus_hook9", "added", "dropped", "top_ideas_left_out": [las 10 mejores que no entraron, con puntaje]}`. Las que no entraron no se agregan a ningún otro lado.

## 6. Entregar
- `git add topics/queue_v3.json && git commit -m "scout <fecha>: +N ideas 95-100" && git pull --rebase && git push origin main`.
- Tocar solo `topics/queue_v3.json`. Nada de Make, cuentas, `videos/` ni `publish/`.

## Resumen final (en español, con SendUserMessage)
Cuántas ideas se encontraron, cuántas entraron (hook + puntaje + por qué, separadas en 95–100 y 90–94), cuáles salieron de la cola, las 5 mejores que quedaron afuera y cuántos días de programación hay en cada nivel (`todo` con 95–100 y con 90–94). Hash del commit.
