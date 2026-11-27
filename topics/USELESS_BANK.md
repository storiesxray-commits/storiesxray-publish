# USELESS FACTS: banco de guiones (dueña, 27/11/2026)

Desde el 27/11/2026 TODOS los videos del día son de este formato (AUTOPILOT §0b) hasta el análisis del 4/12/2026.
Medidos: xr023, xr027 (publicados 27/11), xr024–xr026, xr028–xr031 (en cola).

## Reglas de la dueña (no negociables)
1. **Cadena "shawarma".** Algo cotidiano y muy yanqui → se acumula o escala paso a paso con NÚMEROS REALES (peso, cantidad, velocidad, carga) → catástrofe → el final sale del MISMO objeto del principio. Todo conectado, nada que caiga de afuera.
2. **Nada de "uno vs. otro"** como estructura (ya se usó en la tanda 2). Una sola historia que avanza.
3. **Curiosidad hasta el final:** cada frase tiene que hacer querer saber cómo termina. El remate es lo último que se dice, seco.
4. **70 % termina en muerte** (cartoon, nunca gráfica: zapatillas asomando, polvo, lápida) y **30 % NO muere pero termina bizarro** (queda congelado al piso hasta abril, lo adopta el vecino, gana un premio). Mirar los últimos 3 producidos: si los 3 murieron, el próximo no muere.
5. **Ideas enfermas y absurdas, cualquier tema**, pero que en EE. UU. se entiendan en 1 s (vecinos, HOA, Costco, Thanksgiving, nieve, Amazon, cul-de-sac, Ohio). Originales: nunca copiar los ejemplos de la dueña.
6. **Detalles hiper específicos** (nombre propio del objeto, día y hora exactos, lugar) solo cuando suman al chiste. No en todos.
7. **Cierre para suscribirse ~1 de cada 4**, dentro del chiste ("Follow before you open yours."). Nunca 2 seguidos.
8. Cifras verificadas con 2 fuentes serias; fuentes en `meta.json`. Si un número es exageración del chiste, que el guion lo deje claro ("nobody told the ice maker").
9. **Títulos humanos:** no todos en Title Case. Mezclar oración normal, minúsculas y alguno en Title Case. Sin repetir molde (HUMAN.md §2, `audit_human.py` lo marca).
10. Duración 15–25 s. Personajes: algunos raros a propósito (muy bajo, cabeza enorme, rodillas al revés) y otros normales.

## Variantes de estructura (alternar: nunca 3 seguidos de la misma)
Todas cumplen las reglas 1–10: todo conectado, cifras reales, curiosidad hasta el final, remate seco.

**A · Cadena (shawarma).** Acumulación o escalada de un objeto cotidiano → catástrofe con el mismo objeto. (U01–U05.)

**B · Overkill técnico (referencia de la dueña 27/11: "cortar pan de molde" — NO copiar ese ejemplo).** Anatomía:
1. Instrucción normal y precisa para una tarea mínima, con la herramienta humilde descripta como un manual ("a serrated stainless steel knife, gentle back-and-forth").
2. "Under no circumstances use…" + una máquina industrial REAL con marca, modelo y ficha técnica exacta (caballos de fuerza, presión, velocidad, tolerancia en milímetros). La seriedad de la ficha es el chiste.
3. Concesión: reconocer que funcionaría perfecto ("Although it will slice the crust to ±0.025 mm…").
4. Cadena de daños colaterales que baja por la casa, cada uno más grave y más específico (la tabla → la mesada → el caño maestro de gas → el compresor de la heladera de abajo).
5. Costo operativo absurdo de la tarea trivial ("$45 per minute for your sandwich").
6. Cierre de 3 palabras, seco, volviendo a la herramienta humilde ("Use the knife.").
Voz deadpan (xr10/xr12), leída como manual de seguridad. Gráficos: ficha técnica que se arma en pantalla, cotas y flechas de ingeniería, corte en sección de la casa piso por piso. Marcas solo dichas (sin logos). Cifras de la ficha verificadas con la hoja técnica del fabricante.
Ideas B (verificar fichas antes de escribir):
- Aplanar masa de pizza → no la prensa de forja de 50.000 toneladas de Cleveland, Ohio (la "Fifty"): la mesada, el sótano, el lecho de roca.
- Abrir un frasco de pepinillos → no una herramienta hidráulica de rescate (fuerza de separación en libras-fuerza de la ficha): el frasco, la mesada, la puerta del auto del vecino.
- Despertar a tu hijo adolescente → no un dispositivo acústico de largo alcance de la policía (decibeles y alcance de la ficha): las ventanas de la cuadra, el perro, el HOA.
- Sacar la nieve del parabrisas → no un soplador de pista de aeropuerto con turbina de avión (empuje y temperatura de la ficha).

**C · "Ni lo uno ni lo otro" (tanda 2, ya usado).** Dos conductas opuestas, mismo final. Usar poco; la dueña pidió no hacer todo "vs.".

## Guiones listos (datos verificados el 27/11/2026)
Estado: `todo` → `done (xrNNN)` cuando se produce. Tomar el primer `todo` que encaje en el motor que toca (AUTOPILOT §1d: cartoon = adentro de una casa con personas; HyperFrames = acumulación con gráficos, números, cortes).

### U01 · toilet paper upstairs · cartoon · MUERE · todo
"Your upstairs neighbor buys a 48-pack of toilet paper every Saturday. He never runs out. He never throws any away. After one year, that's two thousand five hundred rolls. All in the closet. Right above your bed. Bedroom floors in America are built for thirty pounds per square foot. His closet is at thirty-three. At 3 AM, the ceiling gives. You die under two thousand rolls. Extremely soft."
- 96 rollos estándar = 25,5 lb netas (ficha Right Choice 78000039, Wasserstrom) → ~0,27 lb/rollo → 2.496 rollos ≈ 670 lb; placard 4×5 ft = 20 ft² → 33,5 lb/ft².
- IRC tabla R301.5: 40 psf ambientes habitables, 30 psf dormitorios (jlconline.com "Calculating Live Loads"; codes.iccsafe.org IRC cap. 5).

### U02 · bag of bags · HyperFrames · MUERE · CTA · todo
"You keep every plastic grocery bag. Under the sink. Inside one bag. For thirty years. That's eleven thousand bags pressed into one cabinet. One morning, you open the door. They come out at two hundred miles an hour. Same speed as an airbag. You die. Inside a bag. Follow before you open yours."
- 365 bolsas por persona por año en EE. UU. (Center for Biological Diversity, "The Problem With Plastic Bags").
- Airbag ~200 mph (Clemson CVEL "Airbag Deployment Systems"; AAA "How does an airbag work").

### U03 · the ice maker · cartoon · NO MUERE · todo
"Your fridge makes about four pounds of ice a day. You never use it. The bin is full. Nobody told the ice maker. After one year, that's fourteen hundred pounds of ice behind one little door. Tuesday night, you open the freezer to find the peas. You survive. You're frozen to the kitchen floor until April. The peas are fine."
- GE Appliances, "Normal Ice Production and Cube Size": ~4 lb/día (products.geappliances.com, contentId 16918). En la realidad se apaga con la cubeta llena: por eso "nobody told the ice maker".

### U04 · penny jar · cartoon · NO MUERE · todo
"Every night, you drop your pennies in a jar on the top shelf. You never take them out. After forty years, it's fifty thousand pennies. Two hundred seventy-six pounds. On one shelf. Above the cereal. One morning, you reach for the cereal. The shelf holds. The jar doesn't. You survive under five hundred dollars. Nobody takes pennies anymore."
- Centavo desde 1982 = 2,50 g (U.S. Mint, media kit "Penny"); 50.000 × 2,5 g = 125 kg ≈ 276 lb; 50.000 centavos = 500 dólares.
- Verificar antes de producir el estado actual de la producción del centavo (la Casa de la Moneda dejó de acuñar para circulación en 2025; el chiste final no depende de eso, pero no afirmar nada falso).

### U05 · neighbor's snow · HyperFrames · MUERE · todo
"Every morning, your neighbor shovels his driveway. Onto your side. Every morning. All winter. Wet snow weighs about twenty pounds per cubic foot. By February, the pile on your garage roof weighs more than a pickup truck. You open the garage. The roof was rated for twenty. You die under his driveway. He waves."
- Nieve húmeda ≈ 20 lb/ft³ (CNY Central "The weight of snow"); 1 ft de nieve húmeda = 21 lb/ft² (FEMA P-957, vía PNNL BASC); techos residenciales ~20 lb/ft² antes de sufrir (Fox Weather, citando a FEMA).
- Calcular el "más que una pickup" con el área y la altura de la pila que se dibuje (pickup ≈ 4.500–5.500 lb).

## Ideas para desarrollar (verificar cifras antes de escribir)
- La sopladora del vecino: hojas de 7 robles al techo (un roble grande ≈ 200.000 hojas: verificar).
- Pesas del vecino de arriba: un disco de 45 lb cada 90 s.
- Luces de Navidad: +1.000 por año durante 20 años; el transformador de la cuadra (NO muere: la casa queda visible desde un avión, la FAA llama).
- Cajas de Amazon sin desarmar: torre que se cae en la llamada de Zoom ("You die on mute").
- Pavo de Thanksgiving descongelado en la bañera (USDA: 24 h cada 4–5 lb) → la bañera, el piso, el vecino de abajo.
- Fila del drive-thru que nunca se mueve; Black Friday a las 5 AM; el HOA y el pasto de 4,1 pulgadas; el inflable gigante del concesionario; el pastel de calabaza del vecino; la impresora de la oficina con 10.000 hojas en cola.
