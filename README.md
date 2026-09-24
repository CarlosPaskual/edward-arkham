# Edward Arkham I — El murmullo bajo la catedral

Aventura conversacional de terror lovecraftiano en HTML5/JavaScript vanilla (Canvas2D, sin frameworks ni build step), con estética pixel-art de baja resolución (480×270 internos, escalados x4) y tipografía pixel (Pixeloid).

## Premisa

Edward Arkham viaja a un pueblo a las afueras de Londres para investigar una extraña enfermedad sin síntomas concluyentes. Lo que encuentra es un culto centrado en el agua de la fuente del pueblo, una catedral que esconde catacumbas bajo el altar, y una presencia que no llama — espera.

Es el primer título ("I") de una serie prevista.

## Cómo jugar / probarlo localmente

Igual que cualquier proyecto con módulos ES: no se puede abrir `index.html` directamente por `file://`, hay que servirlo por HTTP:

```bash
python3 -m http.server 8000
# Abrir http://localhost:8000
```

**Controles:**
- `Enter` — avanzar texto / confirmar en la pantalla de título
- Teclas `1`–`9` — elegir una opción cuando aparecen decisiones

## Estructura del proyecto

```
├── index.html
├── style.css
├── main.js              # bucle de juego, render, input, gestión de escenas
├── data/
│   └── scenes.js         # las 23 escenas del juego: texto, decisiones, flags, finales
├── engine/
│   └── assets.js         # loadImages() — precarga del manifiesto de fondos
└── assets/
    └── gfx/
        └── backgrounds/  # 17 fondos, uno por escena/localización
```

## Arquitectura

- **Todo el guion vive en `data/scenes.js`**, como un único objeto donde cada clave es una escena con `text` (líneas a revelar), `bg` (fondo), `choices` (decisiones) y `next` (siguiente escena — string o función que decide dinámicamente según el estado).
- **Sistema de flags + cordura (`sanity`)** en `main.js`: cada escena puede tener un `onEnter(flags, ctx)` que modifica el estado global. Las decisiones (`choices`) pueden tener una `condition(flags, ctx)` que las oculta si no se cumple.
- **Router de finales clásico**: la escena `ritual_chamber` resuelve su `next` con una función (`(flags) => flags.drankWater ? "ending_water" : "ending_witness"`) — el final depende de una única decisión tomada acto y medio antes (beber o no el agua de la fuente), sin que el juego lo señale como "la decisión importante" en su momento.
- **Texto revelado en páginas de 1–2 líneas** con un micro-corte entre páginas (120ms de caja vacía) para dar ritmo a la lectura, en vez de mostrar el bloque de texto completo de golpe.
- **Carga de fondos con manifiesto + lazy-load de respaldo**: los 17 fondos se precargan al arrancar: si se añade una escena nueva y se olvida registrar su fondo en el manifiesto, `lazyLoadBackground()` lo carga bajo demanda la primera vez que se necesita, sin romper el juego.

## Estado actual

- [x] Motor de escenas, texto paginado, decisiones condicionales, flags y cordura
- [x] Acto I (estación) → Acto II (pueblo, posada, plaza, archivo) → Acto III (catedral, catacumbas)
- [x] 2 finales según la decisión de beber o no el agua
- [x] Verificado: las 23 escenas y los 17 fondos referenciados son coherentes entre `scenes.js` y el manifiesto de `main.js`
- [ ] Arte real de los 17 fondos (confirmar que existen en `assets/gfx/backgrounds/`)
- [ ] Tipografía Pixeloid cargada correctamente (el juego sigue funcionando sin ella, con fuente de respaldo)
- [ ] Audio
