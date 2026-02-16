export interface Message {
  id: number;
  title: string;
  content: string;
  tags: string[];
  usage: string;
}

export interface Tag {
  id: string;
  label: string;
}

export const tags: Tag[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'inicio', label: 'Inicio' },
  { id: 'exploracion', label: 'Exploración' },
  { id: 'validacion', label: 'Validación' },
  { id: 'fortalezas', label: 'Fortalezas' },
  { id: 'ansiedad', label: 'Ansiedad' },
  { id: 'depresion', label: 'Depresión' },
  { id: 'autolesion', label: 'Autolesión' },
  { id: 'suicidio', label: 'Suicidio' },
  { id: 'abuso', label: 'Abuso' },
  { id: 'relaciones', label: 'Relaciones' },
  { id: 'cierre', label: 'Cierre' },
  { id: 'chequeo', label: 'Chequeo' },
];

export const messages: Message[] = [
  // === INICIO ===
  {
    id: 1,
    title: 'Saludo inicial estándar',
    content: 'Hola, gracias por contactarnos. Soy [NOMBRE]. Estoy aquí para escucharte. ¿Me puedes contar un poco más sobre lo que está pasando?',
    tags: ['inicio'],
    usage: 'Usar al inicio de cada conversación',
  },
  {
    id: 2,
    title: 'Inicio con reflejo de sentimiento',
    content: 'Hola, soy [NOMBRE]. Suena como que te sientes [SENTIMIENTO] ahora mismo. Estoy aquí para escuchar. Cuéntame más acerca de lo que te está causando sentirte así.',
    tags: ['inicio'],
    usage: 'Cuando el primer mensaje ya expresa un sentimiento',
  },
  {
    id: 3,
    title: 'Inicio para acoso/bullying',
    content: 'Gracias por contactarnos. Soy [NOMBRE]. Parece ser que te sientes aislado y confundido. Nadie merece ser tratado de esa manera. ¿Me puedes decir más sobre el acoso?',
    tags: ['inicio'],
    usage: 'Cuando mencionan acoso o bullying',
  },

  // === VALIDACIÓN ===
  {
    id: 10,
    title: 'Validación general',
    content: 'Es comprensible que te sientas así dado todo lo que has compartido.',
    tags: ['validacion'],
    usage: 'Validar sentimientos del texter',
  },
  {
    id: 11,
    title: 'Validación con normalización',
    content: 'Es normal sentirse abrumado cuando cargas con tanto. Mereces apoyo.',
    tags: ['validacion'],
    usage: 'Cuando se sienten abrumados',
  },
  {
    id: 12,
    title: 'Validación de situación difícil',
    content: 'Esa es una situación difícil. Tiene sentido que te sientas de esta manera.',
    tags: ['validacion'],
    usage: 'Reconocer la dificultad de su situación',
  },
  {
    id: 13,
    title: 'Validación de frustración',
    content: 'Es normal que estés frustrado cuando no te sientes escuchado.',
    tags: ['validacion', 'relaciones'],
    usage: 'Cuando hay conflicto con familia/pareja',
  },
  {
    id: 14,
    title: 'Validación de miedo',
    content: 'Es comprensible que tengas miedo. Esto no es fácil y requiere mucha valentía.',
    tags: ['validacion'],
    usage: 'Cuando expresan miedo o nervios',
  },

  // === FORTALEZAS ===
  {
    id: 20,
    title: 'Fortaleza por contactar',
    content: 'Se necesita ser realmente valiente para textear cuando te estás sintiendo así. Estoy aquí para ti.',
    tags: ['fortalezas'],
    usage: 'Reconocer valentía por pedir ayuda',
  },
  {
    id: 21,
    title: 'Fortaleza por priorizar bienestar',
    content: 'Se necesita fuerza de verdad para hacer que tu bienestar sea una prioridad.',
    tags: ['fortalezas'],
    usage: 'Cuando toman decisiones por su salud',
  },
  {
    id: 22,
    title: 'Resiliencia',
    content: 'Eres resiliente por lidiar con esto por tanto tiempo. Mereces sentir apoyo.',
    tags: ['fortalezas'],
    usage: 'Cuando han lidiado con algo difícil',
  },
  {
    id: 23,
    title: 'Valentía por compartir',
    content: 'Aprecio tu valentía. Yo sé que no es fácil compartir estas cosas.',
    tags: ['fortalezas'],
    usage: 'Cuando comparten algo difícil',
  },
  {
    id: 24,
    title: 'Autoconocimiento',
    content: 'Me doy cuenta de que eres consciente de ti mismo por lo bien que te conoces y por lo que estás atravesando.',
    tags: ['fortalezas'],
    usage: 'Cuando muestran insight sobre sí mismos',
  },

  // === EXPLORACIÓN ===
  {
    id: 30,
    title: 'Pregunta abierta general',
    content: '¿Me puedes contar más sobre lo que está pasando?',
    tags: ['exploracion'],
    usage: 'Invitar a compartir más',
  },
  {
    id: 31,
    title: 'Explorar sentimientos',
    content: '¿Cómo te hace sentir eso?',
    tags: ['exploracion'],
    usage: 'Explorar impacto emocional',
  },
  {
    id: 32,
    title: 'Explorar duración',
    content: '¿Por cuánto tiempo te has estado sintiendo así?',
    tags: ['exploracion'],
    usage: 'Entender duración de la crisis',
  },
  {
    id: 33,
    title: 'Explorar estrategias previas',
    content: '¿Qué te ha ayudado a sentirte mejor en el pasado?',
    tags: ['exploracion'],
    usage: 'Identificar estrategias de afrontamiento',
  },
  {
    id: 34,
    title: 'Explorar apoyo social',
    content: '¿Hay alguien en tu vida con quien te sientas cómodo compartiendo cómo te sientes?',
    tags: ['exploracion'],
    usage: 'Identificar red de apoyo',
  },
  {
    id: 35,
    title: 'Explorar objetivo',
    content: '¿Qué crees que sería útil para que nos enfoquemos hoy?',
    tags: ['exploracion'],
    usage: 'Identificar objetivo de la conversación',
  },

  // === ANSIEDAD ===
  {
    id: 40,
    title: 'Ejercicio de respiración',
    content: '¿Te gustaría intentar un ejercicio de respiración conmigo? Inhala contando hasta 4, sostén por 4, y exhala contando hasta 4. Lo hacemos juntos.',
    tags: ['ansiedad'],
    usage: 'Cuando hay síntomas de ansiedad',
  },
  {
    id: 41,
    title: 'Técnica 5-4-3-2-1',
    content: '¿Te gustaría intentar un ejercicio de grounding conmigo? Nombra 5 cosas que puedes ver, 4 que puedes tocar, 3 que puedes escuchar, 2 que puedes oler, y 1 que puedes saborear.',
    tags: ['ansiedad'],
    usage: 'Técnica de grounding para ansiedad',
  },
  {
    id: 42,
    title: 'Validar síntomas físicos',
    content: 'Es comprensible que tu cuerpo esté reaccionando así. La ansiedad puede causar sensaciones físicas intensas. Estoy aquí contigo.',
    tags: ['ansiedad', 'validacion'],
    usage: 'Cuando reportan síntomas físicos de ansiedad',
  },

  // === DEPRESIÓN ===
  {
    id: 50,
    title: 'Validar depresión',
    content: 'Es comprensible que te sientas así. La depresión puede hacer que todo se sienta más pesado. Mereces apoyo.',
    tags: ['depresion', 'validacion'],
    usage: 'Validar sentimientos de depresión',
  },
  {
    id: 51,
    title: 'Explorar depresión',
    content: '¿Me puedes contar más sobre cómo te has estado sintiendo últimamente?',
    tags: ['depresion', 'exploracion'],
    usage: 'Explorar síntomas de depresión',
  },
  {
    id: 52,
    title: 'Pequeños pasos',
    content: 'A veces cuando todo se siente abrumador, ayuda enfocarse en un pequeño paso a la vez. ¿Qué sería una cosa pequeña que podrías hacer hoy para cuidarte?',
    tags: ['depresion'],
    usage: 'Ayudar a identificar pequeñas acciones',
  },

  // === AUTOLESIÓN ===
  {
    id: 60,
    title: 'Separar de mecanismos',
    content: 'Mereces estar seguro/a. ¿Estarías dispuesto/a a guardar [OBJETO] mientras hablamos?',
    tags: ['autolesion'],
    usage: 'Cuando se están autolesionando activamente',
  },
  {
    id: 61,
    title: 'Verificar intención',
    content: 'Quiero checar, ¿te estás lastimando porque quieres acabar con tu vida?',
    tags: ['autolesion', 'suicidio'],
    usage: 'Verificar si hay intención suicida',
  },
  {
    id: 62,
    title: 'Explorar autolesión',
    content: '¿Me podrías contar más sobre lo que sentías antes de empezar a lastimarte?',
    tags: ['autolesion', 'exploracion'],
    usage: 'Explorar qué llevó a la autolesión',
  },
  {
    id: 63,
    title: 'Validar autolesión',
    content: 'Tiene sentido que quieras sentir alivio. Me pregunto si estás buscando algo de control en tu vida.',
    tags: ['autolesion', 'validacion'],
    usage: 'Validar sin juzgar',
  },

  // === SUICIDIO ===
  {
    id: 70,
    title: 'Expresión de preocupación',
    content: 'Con todo lo que me has compartido, solo quiero asegurarme de que estés seguro/a. ¿Has tenido pensamientos sobre suicidarte?',
    tags: ['suicidio'],
    usage: 'Preguntar sobre pensamientos suicidas',
  },
  {
    id: 71,
    title: 'Explorar plan',
    content: 'Gracias por tu honestidad. ¿Me puedes contar cómo es tu plan para terminar con tu vida?',
    tags: ['suicidio'],
    usage: 'Segundo paso: explorar plan',
  },
  {
    id: 72,
    title: 'Explorar mecanismos',
    content: 'Aprecio que compartas esto conmigo. ¿Tienes acceso a lo que necesitas para llevar a cabo tu plan?',
    tags: ['suicidio'],
    usage: 'Tercer paso: explorar mecanismos',
  },
  {
    id: 73,
    title: 'Explorar tiempo',
    content: 'Quiero ayudarte a permanecer seguro/a. ¿Cuándo planeas llevar a cabo tu plan?',
    tags: ['suicidio'],
    usage: 'Cuarto paso: explorar periodo de tiempo',
  },
  {
    id: 74,
    title: 'Alejar de mecanismos',
    content: 'Mereces estar a salvo. ¿Podrías guardar [OBJETO] en otro cuarto mientras hablamos?',
    tags: ['suicidio'],
    usage: 'Pedir que se alejen de mecanismos',
  },
  {
    id: 75,
    title: 'Respuesta a NO suicidio',
    content: 'Gracias por ser honesto/a conmigo. Quiero que sepas que si en cualquier momento lo estás considerando, siempre nos puedes contar.',
    tags: ['suicidio'],
    usage: 'Cuando responden NO a pensamientos suicidas',
  },
  {
    id: 76,
    title: 'Ambivalencia',
    content: 'Parece que aunque hay una parte de ti que quiere morir, también hay una parte que desea seguir viviendo.',
    tags: ['suicidio'],
    usage: 'Cuando muestran ambivalencia',
  },
  {
    id: 77,
    title: 'Posible rescate activo',
    content: 'Tal vez tengamos que comunicarnos con Servicios de Emergencia pero sólo como último recurso si no podemos trabajar en conjunto para pensar en maneras de mantenerte a salvo. Nuestra meta principal es brindarte el apoyo que necesitas.',
    tags: ['suicidio'],
    usage: 'Advertir sobre posible rescate activo',
  },

  // === ABUSO ===
  {
    id: 80,
    title: 'Validar abuso',
    content: 'Lo que me estás contando suena muy difícil. No es tu culpa y mereces sentirte seguro/a.',
    tags: ['abuso', 'validacion'],
    usage: 'Validar situación de abuso',
  },
  {
    id: 81,
    title: 'Responsabilidad de reportar',
    content: 'Debido a que soy un adulto en una línea de crisis, tengo la responsabilidad de tomar acción si la seguridad de alguien está en riesgo. Si estás dispuesto/a a darme tu nombre completo, dirección y fecha de nacimiento, puedo hacer un reporte.',
    tags: ['abuso'],
    usage: 'Explicar responsabilidad de reportar',
  },
  {
    id: 82,
    title: 'Decisión del texter',
    content: 'Es tu decisión compartir esa información. Estoy aquí para apoyarte sin importar lo que decidas.',
    tags: ['abuso'],
    usage: 'Respetar decisión de no reportar',
  },

  // === RELACIONES ===
  {
    id: 90,
    title: 'Conflicto familiar',
    content: 'No poder elegir cómo pasas el tiempo hace parecer como que uno no tiene vida propia. ¿Cómo te hace sentir cuando ellos quieren que solo estudies?',
    tags: ['relaciones'],
    usage: 'Cuando hay conflicto con padres',
  },
  {
    id: 91,
    title: 'Ruptura',
    content: 'Terminar una relación puede ser muy doloroso. Es comprensible que te sientas así.',
    tags: ['relaciones', 'validacion'],
    usage: 'Cuando mencionan ruptura',
  },
  {
    id: 92,
    title: 'Aislamiento',
    content: 'Lidiar con sentimientos de aislamiento toma valentía. Algunas personas encuentran que estar cerca de otras personas es útil aún si no las conocen. ¿Cómo crees que eso te haría sentir?',
    tags: ['relaciones'],
    usage: 'Cuando se sienten solos',
  },

  // === CIERRE ===
  {
    id: 100,
    title: 'Cierre estándar',
    content: 'Demuestra fortaleza que te hayas comunicado hoy. Si estás en crisis y quisieras hablar otra vez, estamos aquí 24 horas al día, 7 días de la semana para apoyarte. Cuídate.',
    tags: ['cierre'],
    usage: 'Cerrar conversación de manera positiva',
  },
  {
    id: 101,
    title: 'Cierre con plan',
    content: 'Demuestra fortaleza que te hayas comunicado y elaborado un plan para [OBJETIVO]. Si estás en crisis otra vez, estamos aquí para apoyarte. Cuídate.',
    tags: ['cierre'],
    usage: 'Cuando se acordó un plan de acción',
  },
  {
    id: 102,
    title: 'Cierre cálido (sin respuesta)',
    content: 'Parece que ahora no es el mejor momento para hablar. Voy a terminar esta conversación, pero estamos aquí 24 horas al día, 7 días a la semana si estás en crisis otra vez. Cuídate.',
    tags: ['cierre'],
    usage: 'Cuando el texter deja de responder',
  },

  // === CHEQUEO ===
  {
    id: 110,
    title: 'Chequeo 1',
    content: 'Ha pasado algún tiempo desde la última vez que supe de ti. Estoy aquí si todavía quieres hablar.',
    tags: ['chequeo'],
    usage: 'Primer mensaje si no responden',
  },
  {
    id: 111,
    title: 'Chequeo 2',
    content: 'Tú mereces sentir apoyo, y fue una buena idea que establecieras contacto. ¿Es todavía un buen momento para hablar?',
    tags: ['chequeo'],
    usage: 'Segundo mensaje si no responden',
  },

  // === ACLARACIONES ===
  {
    id: 120,
    title: 'Pedir aclaración de palabra',
    content: 'Quiero asegurarme que te entiendo bien, ¿me puedes aclarar qué quieres decir con [PALABRA]?',
    tags: ['exploracion'],
    usage: 'Cuando usan palabras que no entiendes',
  },
  {
    id: 121,
    title: 'Pedir aclaración general',
    content: 'Para asegurarme que te pueda ayudar de la mejor manera, ¿me puedes decir qué significa eso?',
    tags: ['exploracion'],
    usage: 'Pedir aclaración sin juzgar',
  },

  // === RECURSOS ===
  {
    id: 130,
    title: 'Ofrecer recurso',
    content: 'Si te parece bien, puedo compartir un recurso contigo que podría ayudarte con [TEMA]. ¿Está bien si te lo envío?',
    tags: ['exploracion'],
    usage: 'Antes de enviar cualquier recurso',
  },
  {
    id: 131,
    title: 'Plan de seguridad',
    content: 'Esta página te ayuda a crear un plan para estar seguro/a para cuando sientas que vas a hacerte daño: [ENLACE]',
    tags: ['suicidio', 'autolesion'],
    usage: 'Compartir recurso de plan de seguridad',
  },
];
