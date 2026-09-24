export const scenes = {
  // -------------------------
  // TITLE
  // -------------------------
  title: {
    type: "title",
    bg: "title_bg",
    prompt: "PULSA ENTER",
    next: "station_intro",
  },

  // -------------------------
  // ACTO I — ESTACIÓN
  // -------------------------
  station_intro: {
    bg: "station_bg",
    text: [
      "La estación está casi vacía a esta hora.",
      "",
      "Edward Arkham permanece de pie en el andén,",
      "sosteniendo un informe doblado entre las manos.",
      "",
      "Habla de una extraña enfermedad en un pueblo",
      "a las afueras de Londres.",
      "Síntomas vagos. Cambios de comportamiento.",
      "Nada concluyente.",
      "",
      "El tren ya ha partido.",
      "No hay marcha atrás.",
    ],
    next: "village_arrival",
  },

  // -------------------------
  // ACTO II — PUEBLO
  // -------------------------
  village_arrival: {
    bg: "village_bg",
    text: [
      "El pueblo aparece entre la niebla al caer la tarde.",
      "",
      "Las casas son antiguas, de piedra oscura.",
      "Demasiado silenciosas.",
      "",
      "Edward distingue una posada iluminada.",
      "También la plaza, más allá.",
      "",
      "Debe decidir por dónde empezar.",
    ],
    choices: [
      { text: "Entrar en la posada", next: "inn_scene" },
      { text: "Dirigirse a la plaza", next: "square_blocked" },
    ],
  },

  square_blocked: { 
    bg: "square_approach_bg", 
    text: [
      "Edward se dirige hacia la plaza.",
      "",
      "Tras unos pasos, una sensación de incomodidad lo detiene.",
      "",
      "Quizá debería empezar por la posada.",
      "Hay miradas allí que esperan ser observadas.",
    ],
    next: "village_arrival",
  },

  inn_scene: {
    bg: "inn_bg",
    text: [
      "El interior de la posada está cálidamente iluminado.",
      "",
      "El posadero limpia una jarra sin apartar los ojos de Edward.",
      "",
      "—La gente bebe de la fuente —dice finalmente—.",
      "Siempre lo ha hecho.",
      "",
      "Pero últimamente…",
      "no todos sueñan lo mismo.",
    ],
    onEnter: (flags) => {
      flags.spokeWithInnkeeper = true;
      flags.heardAboutWater = true;
    },
    next: "inn_after",
  },

  inn_after: {
    bg: "inn_bg",
    text: [
      "Edward siente que ha obtenido algo importante.",
      "",
      "No una prueba.",
      "Pero sí una grieta en la normalidad del pueblo.",
      "",
      "La noche cae con rapidez.",
    ],
    next: "night_event",
  },

  night_event: { 
    bg: "inn_room_bg",
    text: [
      "La habitación de la posada cruje con el frío.",
      "",
      "Edward duerme… o cree dormir.",
      "",
      "Un murmullo lo despierta.",
      "Agua.",
      "",
      "Mira por la ventana: figuras quietas alrededor de la fuente.",
      "No hablan. No se mueven.",
      "",
      "Una de ellas alza la cabeza.",
      "",
      "Edward parpadea.",
      "La plaza está vacía.",
      "",
      "Cuando despierta de nuevo, es de mañana.",
    ],
    next: "square_scene",
  },

  square_scene: {
    bg: "plaza_bg",
    text: [
      "La plaza está tranquila a la luz del día.",
      "",
      "En el centro, la fuente murmura con un flujo constante.",
      "El mismo sonido de la noche.",
      "",
      "Varios habitantes beben sin prisa.",
      "Nadie parece enfermo.",
      "",
      "Y, sin embargo, algo no encaja.",
    ],
    choices: [
      { text: "Examinar la fuente", next: "fountain_examine" },
      { text: "Beber del agua", next: "drink_water" },
      { text: "Entrar al archivo parroquial", next: "parish_archive" },
      { text: "Ir hacia la catedral", next: "to_cathedral_path" },
    ],
  },

  fountain_examine: {
    bg: "plaza_bg",
    text: [
      "La piedra está húmeda y fría.",
      "",
      "El agua es cristalina.",
      "No hay olor extraño.",
      "",
      "Edward no encuentra nada…",
      "y eso lo inquieta más.",
    ],
    next: "square_scene",
  },

  // DECISIÓN ÚNICA (clásico): aquí se fija el destino
  drink_water: {
    bg: "plaza_bg",
    text: [
      "Edward se inclina y bebe.",
      "",
      "No sabe a nada.",
      "No está fría.",
      "",
      "Durante un instante, siente una claridad extraña.",
      "Como si algo en él hubiera encajado.",
      "",
      "Nadie reacciona.",
      "Nadie lo mira.",
    ],
    onEnter: (flags) => {
      flags.drankWater = true;
    },
    next: "square_scene",
  },

  parish_archive: {
    bg: "archive_bg",
    text: [
      "El archivo parroquial huele a polvo y madera húmeda.",
      "",
      "Un registro está abierto sobre una mesa.",
      "",
      "Varias entradas recientes aparecen marcadas con el mismo símbolo.",
      "No es una cruz.",
      "",
      "Al margen, una nota escrita con pulso irregular:",
      "“Preparación completa. El agua ha cumplido su función.”",
      "",
      "Edward cierra el libro lentamente.",
      "",
      "Todas las marcas conducen a un mismo lugar.",
      "La catedral.",
    ],
    onEnter: (flags) => {
      flags.readArchive = true;
    },
    next: "square_scene",
  },

  // -------------------------
  // ACTO III — CATEDRAL
  // -------------------------
  to_cathedral_path: {
    bg: "cathedral_path_bg",
    text: [
      "Edward abandona la plaza.",
      "",
      "El camino hacia la catedral está flanqueado por árboles antiguos.",
      "El aire se vuelve más pesado a cada paso.",
      "",
      "La torre se alza por encima de la niebla.",
      "Más grande de lo que parecía desde el pueblo.",
      "",
      "Edward tiene la absurda sensación de que el edificio lo reconoce.",
      "No como a un intruso.",
      "Como a alguien esperado.",
    ],
    next: "cathedral_nave",
  },

  cathedral_nave: {
    bg: "cathedral_nave_bg",
    text: [
      "La puerta se cierra a la espalda de Edward con un sonido grave.",
      "",
      "La nave está en penumbra.",
      "La luz entra por vitrales altos…",
      "que no representan escenas bíblicas.",
      "",
      "Figuras humanas arrodilladas ante formas imposibles.",
      "",
      "Los bancos están marcados con el mismo símbolo del registro.",
      "",
      "Desde el altar llega un olor tenue a humedad y sal.",
    ],
    choices: [
      { text: "Examinar el altar", next: "altar_scene" },
      { text: "Ir a los pasillos laterales", next: "side_aisle_try" },
      { text: "Salir (volver al pueblo)", next: "square_scene" },
    ],
  },

  side_aisle_try: {
    bg: "cathedral_nave_bg",
    text: [
      "Edward se interna en el pasillo lateral.",
      "",
      "El murmullo se intensifica aquí.",
      "No como un sonido, sino como una presión en los oídos.",
      "",
      "Sus pies se detienen.",
      "No es miedo.",
      "Es la certeza de que aún no entiende lo suficiente.",
      "",
      "Edward retrocede.",
    ],
    next: "cathedral_nave",
  },

  altar_scene: {
    bg: "cathedral_altar_bg",
    text: [
      "El altar no está presidido por ninguna cruz.",
      "",
      "Símbolos grabados con precisión ritual cubren la piedra.",
      "La superficie está húmeda.",
      "",
      "Edward apoya la mano.",
      "",
      "El murmullo cesa por completo.",
      "",
      "Un segundo después, un sonido seco resuena en los pasillos laterales,",
      "como el desplazamiento de una losa bajo el suelo.",
      "",
      "Edward entiende algo horrible:",
      "no es un templo.",
      "es una entrada.",
    ],
    onEnter: (flags) => {
      flags.examinedAltar = true;
      flags.catacombsUnlocked = true;
    },
    next: "side_aisle_open",
  },

  side_aisle_open: {
    bg: "cathedral_side_bg",
    text: [
      "Edward regresa al pasillo lateral.",
      "",
      "Donde antes había solo sombra, ahora distingue una abertura.",
      "",
      "Una escalera de piedra desciende hacia la oscuridad.",
      "Desde abajo asciende un olor a humedad antigua… y sal.",
    ],
    choices: [
      { text: "Descender a las catacumbas", next: "catacombs_entry" },
      { text: "Volver a la nave", next: "cathedral_nave" },
    ],
  },

  // -------------------------
  // CATACUMBAS
  // -------------------------
  catacombs_entry: {
    bg: "catacombs_entry_bg",
    text: [
      "Edward desciende.",
      "",
      "Cada peldaño está desgastado por el tiempo… y por algo más.",
      "",
      "Antorchas arden a intervalos irregulares.",
      "La oscuridad aquí no es total.",
      "Es espesa.",
      "",
      "Nichos en las paredes.",
      "Algunos con restos humanos antiguos.",
      "Otros… demasiado limpios para ser viejos.",
    ],
    next: "catacombs_fork",
  },

  catacombs_fork: {
    bg: "catacombs_fork_bg",
    text: [
      "El pasillo se bifurca.",
      "",
      "Un camino desciende aún más, hacia una oscuridad casi total.",
      "",
      "El otro conduce a una cámara amplia.",
      "Desde allí proviene un murmullo coral.",
    ],
    choices: [
      { text: "Descender más", next: "deep_chamber" },
      { text: "Seguir el murmullo", next: "ritual_chamber" },
    ],
  },

  deep_chamber: {
    bg: "deep_chamber_bg",
    text: [
      "Edward elige el camino que desciende.",
      "",
      "La roca aquí parece erosionada desde dentro.",
      "",
      "Charcos brotan de la piedra.",
      "El agua no cae del techo.",
      "Nace del lugar.",
      "",
      "El murmullo se transforma en algo peor.",
      "Una respiración profunda, acompasada, colosal.",
      "",
      "Edward comprende con claridad helada:",
      "no lo están llamando.",
      "ya está cerca.",
    ],
    next: "catacombs_fork",
  },

  ritual_chamber: {
    bg: "ritual_chamber_bg",
    text: [
      "La cámara ritual está excavada con una precisión antinatural.",
      "No hay ángulos definidos.",
      "Todo es curva y piedra húmeda.",
      "",
      "Varias figuras humanas forman un semicírculo alrededor de una pila.",
      "Visten como los habitantes del pueblo.",
      "",
      "El agua está inmóvil.",
      "El cántico no invoca.",
      "Describe.",
      "",
      "Edward entiende:",
      "el agua no los enferma.",
      "los adapta.",
      "",
      "Y entonces… el mundo parece ceder un instante.",
    ],
    // ROUTER CLÁSICO: aquí se decide el final automáticamente
    next: (flags) => (flags.drankWater ? "ending_water" : "ending_witness"),
  },

  // -------------------------
  // FINALES
  // -------------------------
  ending_water: {
    bg: "ending_water_bg",
    text: [
      "Edward siente que algo en él responde al murmullo.",
      "",
      "No hay gritos.",
      "No hay épica.",
      "",
      "Solo una certeza que lo vacía.",
      "",
      "Cuando el despertar ocurre,",
      "ya no hay necesidad de siervos.",
      "Ni de creyentes.",
      "",
      "Solo de silencio.",
    ],
    next: "the_end",
  },

  ending_witness: {
    bg: "ending_witness_bg",
    text: [
      "Edward permanece apartado.",
      "",
      "El ritual continúa sin él.",
      "",
      "La presencia desciende.",
      "",
      "Los acólitos comprenden, demasiado tarde,",
      "que no eran necesarios.",
      "",
      "Algo roza la mente de Edward.",
      "No como una voz.",
      "Como una certeza infinita.",
      "",
      "Edward sobrevive lo suficiente para entender…",
      "y eso es lo peor.",
    ],
    next: "the_end",
  },

  the_end: {
    bg: "final_bg",
    text: [
      "FIN",
      "",
      "Edward Arkham I — El murmullo bajo la catedral",
    ],
    next: null,
  },
};
