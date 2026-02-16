export interface Resource {
  title: string;
  description: string;
  type: string;
  contact?: string;
  link?: string;
}

export interface ResourceCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  resources: Resource[];
}

export const resourceCategories: ResourceCategory[] = [
  {
    id: 'emergencias',
    title: 'Líneas de Emergencia',
    icon: '🚨',
    description: 'Contactos de emergencia para crisis',
    resources: [
      {
        title: '1118 - Línea de Salud Emocional',
        description: 'Línea telefónica con atención cálida y profesional, que contiene y canaliza casos de salud emocional. Servicio para niños, adolescentes y adultos. Absolutamente anónimo y confidencial.',
        type: 'Teléfono',
        contact: '55 5980-1118',
        link: 'tel:5559801118',
      },
      {
        title: 'Acción Social',
        description: 'Ayuda en temas de delincuencia y seguridad',
        type: 'Teléfono/WhatsApp',
        contact: '55 1995-1520 / 55 5070-7070',
        link: 'tel:5519951520',
      },
    ],
  },
  {
    id: 'internos',
    title: 'Recursos Internos (Comunitarios)',
    icon: '🏠',
    description: 'Instituciones de la comunidad para diferentes necesidades',
    resources: [
      {
        title: 'Fundación Activa',
        description: 'Ayuda para conseguir empleos',
        type: 'Teléfono',
        contact: '55 9505-4454',
      },
      {
        title: 'Hatzalah',
        description: 'Ayuda en primeros auxilios',
        type: 'Teléfono',
        contact: '55 5280-5025 / 55 8888-9999 / 55 5253-5253',
      },
      {
        title: 'Kadurim',
        description: 'Medicamentos gratuitos',
        type: 'Teléfono',
        contact: '55 5087-7734',
      },
      {
        title: 'Kol Ve Koaj',
        description: 'Ayuda contra abuso infantil',
        type: 'Teléfono',
        contact: '55 1849-4962',
      },
      {
        title: 'OSE',
        description: 'Asistencia médica intercomunitaria',
        type: 'Teléfono',
        contact: '55 5515-6736 / 55 5516-3734',
      },
      {
        title: 'Tipul',
        description: 'Ayuda en terapias, pago de quimioterapias y gastos hospitalarios; recomendaciones de médicos en el extranjero',
        type: 'Teléfono',
        contact: '55 2489-0316',
      },
      {
        title: 'Umbral',
        description: 'Ayuda contra adicciones',
        type: 'Teléfono',
        contact: '55 5245-0595 / 55 1324-1082',
      },
      {
        title: 'Yad Rajamim',
        description: 'Acompañamiento psicoemocional a menores',
        type: 'Teléfono',
        contact: '55 5395-3431',
      },
      {
        title: 'Techo Digno',
        description: 'Mejora viviendas de familias de bajos recursos. Repara casas, consigue muebles, equipa cocinas.',
        type: 'Teléfono',
        contact: '55 3232-6932 (Maguie) / 55 1384-6568 (Diana)',
      },
      {
        title: 'Libeinu MS',
        description: 'Centro para adultos mayores',
        type: 'Teléfono',
        contact: '55 5596-9966 (Aida Kassin)',
      },
      {
        title: 'Kol Hanisayon MD',
        description: 'Centro para adultos mayores',
        type: 'Teléfono',
        contact: '55 5814-0600',
      },
      {
        title: 'Lehaim',
        description: 'Grupo para personas en duelo por pérdidas de seres queridos',
        type: 'Teléfono',
        contact: '55 5435-7763 (Sofy Mercado)',
      },
      {
        title: 'Yad la Tefilin',
        description: 'Comité de ayuda para adquirir tefilin',
        type: 'Teléfono',
        contact: '55 8728-1800 (Maguen David)',
      },
      {
        title: 'Yesod Haolam',
        description: 'Ayuda con comida para parientes hospitalizados',
        type: 'Teléfono',
        contact: '55 7925-4680 (Tanya Susi)',
      },
      {
        title: 'Yad la Kala',
        description: 'Ayuda para novias',
        type: 'Teléfono',
        contact: '55 8103-6784',
      },
      {
        title: 'Puah MS',
        description: 'Infertilidad y genética',
        type: 'Teléfono',
        contact: '55 7696-4294 (Rajel Sacal)',
      },
      {
        title: 'Hatikva MD',
        description: 'Infertilidad y genética',
        type: 'Teléfono',
        contact: '55 5989-5526 (Liz Hop)',
      },
      {
        title: 'Yad la Joleh',
        description: 'Ayuda económica para hospitalizaciones',
        type: 'Teléfono',
        contact: '55 4940-6943 (David Esquenazi)',
      },
      {
        title: 'Healthy Cash',
        description: 'Proyecto de educación social y finanzas familiares',
        type: 'Teléfono',
        contact: '55 5990-3311 (Lorein Cassab)',
      },
      {
        title: 'Fondo para la Educación MD',
        description: 'Becas para universidades (Comunidad Maguen David)',
        type: 'Institución',
        contact: 'Contactar a Comunidad Maguen David',
      },
      {
        title: 'Impulso Educativo MS',
        description: 'Becas para universidades (Comunidad Monte Sinai)',
        type: 'Institución',
        contact: 'Contactar a Comunidad Monte Sinai',
      },
      {
        title: 'Yad la Tinok',
        description: 'Ayuda para la llegada de bebés',
        type: 'Teléfono',
        contact: '55 5990-0900 (Gmaj)',
      },
      {
        title: 'Glam',
        description: 'Ropa de segunda mano, vestidos',
        type: 'Teléfono',
        contact: '55 2769-3708 (Sara Hop)',
      },
      {
        title: 'Baby Glam',
        description: 'Ayuda para la llegada de bebés',
        type: 'Teléfono',
        contact: '55 7110-5929 (Odette Hop)',
      },
      {
        title: 'Lemazon',
        description: 'Despensas',
        type: 'Teléfono',
        contact: '55 5990-0900 (Gmaj)',
      },
      {
        title: 'Tik Tov',
        description: 'Comité de ayuda en útiles escolares, mochilas, loncheras',
        type: 'Teléfono',
        contact: '55 5252-5300 (Irene Cohen)',
      },
      {
        title: 'Go Trascend',
        description: 'Impulso para dar sentido a jóvenes con actividades culturales y deportivas',
        type: 'Teléfono',
        contact: '55 1952-3612 (Maguie Penhos)',
      },
      {
        title: 'Go For It Business MS',
        description: 'Centro de negocios',
        type: 'Teléfono',
        contact: '55 5253-1186',
      },
      {
        title: 'Beneficencia a través del Arte',
        description: 'Ayuda económica para niños con enfermedades terminales',
        type: 'Teléfono',
        contact: '55 3026-4974 (Aurora Zaga)',
      },
      {
        title: 'Grupos de Jóvenes (NCSY, BBYO, EPIC)',
        description: 'Emprendimiento y comunidad para jóvenes',
        type: 'Teléfono',
        contact: '55 6628-8655 (David Daniel NCSY) / 55 1951-0164 (Lulu Saadia EPIC) / 55 2136-8103 (Yael Waisser BBYO)',
      },
      {
        title: 'Taglit',
        description: 'Viajes a Israel con sentido',
        type: 'Teléfono',
        contact: '55 5906-4057 (Lina Abadi)',
      },
      {
        title: 'Padres para Padres',
        description: 'Grupo de integración para padres',
        type: 'Teléfono',
        contact: '55 1053-2188 (Jenny)',
      },
      {
        title: 'App del Voluntariado',
        description: 'Aplicación para encontrar oportunidades de voluntariado. Útil cuando el texter se siente solo, desconectado, con demasiado tiempo libre.',
        type: 'App/Web',
        contact: '55 1952-0434 (Ruthy)',
        link: 'http://www.laappdelvoluntario.com',
      },
      {
        title: 'Gmaj - Curso Ocupacional',
        description: 'Curso que acompaña a jóvenes y los ayuda a salir del sistema de apoyo económico comunitario, logrando autosuficiencia.',
        type: 'Teléfono',
        contact: '+1 (310) 254-5816 (Salo Zirdok)',
      },
      {
        title: 'Cadena',
        description: 'Apoyo humanitario en casos de desastres. Compartir si el texter busca oportunidades de trabajo comunitario, quiere conocer personas y ayudar.',
        type: 'Institución',
      },
    ],
  },
  {
    id: 'externos-ansiedad',
    title: 'Recursos Externos - Ansiedad, Estrés y Depresión',
    icon: '😰',
    description: 'Herramientas y recursos para manejar ansiedad, estrés y depresión',
    resources: [
      {
        title: 'CALMA (PDF en español)',
        description: 'Ejercicios rápidos para calmar emociones intensas y recuperar control.',
        type: 'PDF',
        link: 'https://repo.sendachat.com/publico/calma.pdf',
      },
      {
        title: 'Técnicas de Grounding (PDF en español)',
        description: 'Ayuda a volver al presente cuando tienes ansiedad o pensamientos abrumadores.',
        type: 'PDF',
        link: 'https://repo.sendachat.com/publico/grounding.pdf',
      },
      {
        title: 'GIF de Respiración Guiada',
        description: 'GIF que te guía para recuperar tu respiración cuando sientes ansiedad o pánico.',
        type: 'Herramienta',
        link: 'https://cdn.doyou.com/articles/6a-1575918606525.gif=w1080',
      },
      {
        title: 'Acción para la Felicidad',
        description: 'Hábitos diarios para aumentar bienestar, conectarte con otros y sentir más apoyo.',
        type: 'Web (inglés)',
        link: 'https://actionforhappiness.org/',
      },
      {
        title: 'Cómo recuperarte del burnout',
        description: 'Artículo con pasos prácticos para reconocer y recuperarse del burnout.',
        type: 'Artículo (inglés)',
        link: 'https://health.clevelandclinic.org/how-to-recover-from-burnout',
      },
      {
        title: 'Diario de Ira',
        description: 'Ejercicio para entender qué detonó tu enojo y cómo manejarlo mejor.',
        type: 'Herramienta (inglés)',
        link: 'https://www.therapistaid.com/worksheets/anger-diary',
      },
      {
        title: 'ADAA - Asociación de Ansiedad y Depresión',
        description: 'Información para entender y manejar ansiedad, depresión y otros síntomas emocionales.',
        type: 'Web (inglés)',
        link: 'https://adaa.org/',
      },
      {
        title: 'Terapia Dialéctica Conductual - Curso gratuito',
        description: 'Curso que enseña habilidades para manejar emociones difíciles y mejorar relaciones.',
        type: 'Curso (inglés)',
        link: 'https://dialecticalbehaviortherapy.com/',
      },
      {
        title: 'Tolerancia al Malestar (DBT)',
        description: 'PDF para manejar situaciones difíciles sin que tus emociones te rebasen.',
        type: 'PDF (inglés)',
        link: 'https://therapistaid.com/worksheets/dbt-distress-tolerance-skills',
      },
      {
        title: 'HelpGuide.org',
        description: 'Artículos claros para manejar ansiedad, estrés, autoestima y relaciones.',
        type: 'Web (inglés)',
        link: 'https://www.helpguide.org/',
      },
      {
        title: 'KidsHealth en Español',
        description: 'Información clara sobre salud física, emocional y social para adolescentes y familias.',
        type: 'Web (español)',
        link: 'https://kidshealth.org/es/parents/',
      },
      {
        title: 'Medito - App de Meditación',
        description: 'App con meditaciones gratuitas para momentos de estrés, tristeza o ansiedad.',
        type: 'App (inglés)',
        link: 'https://meditofoundation.org/medito-app',
      },
      {
        title: 'Smiling Mind - Meditación',
        description: 'App con meditaciones guiadas para relajarte y mejorar tu bienestar.',
        type: 'App (inglés)',
        link: 'https://www.smilingmind.com.au/smiling-mind-app',
      },
      {
        title: 'My Study Life',
        description: 'App para organizar tareas y mejorar manejo del tiempo escolar.',
        type: 'App (inglés)',
        link: 'https://mystudylife.com/',
      },
      {
        title: 'Guía de Ansiedad Social',
        description: 'Workbook para comprender tu ansiedad social y trabajarla con ejercicios prácticos.',
        type: 'PDF (inglés)',
        link: 'https://www.anxietycanada.com/sites/default/files/adult_hmsocial.pdf',
      },
      {
        title: 'Ayuda para Autolesiones',
        description: 'Información clara y recursos para entender y manejar la autolesión.',
        type: 'Web (inglés)',
        link: 'https://www.selfinjury.bctr.cornell.edu/resources.html',
      },
    ],
  },
  {
    id: 'externos-bullying',
    title: 'Recursos Externos - Bullying y Seguridad Digital',
    icon: '🛡️',
    description: 'Recursos para bullying, acoso en línea y seguridad digital',
    resources: [
      {
        title: '¡Rompe las Etiquetas!',
        description: 'Ayuda con temas de bullying, relaciones, identidad y autoestima.',
        type: 'Web (inglés)',
        link: 'https://ditchthelabel.org/',
      },
      {
        title: 'Línea de Juegos',
        description: 'Apoyo si enfrentas acoso o problemas relacionados con videojuegos.',
        type: 'Web (inglés)',
        link: 'https://gameshotline.org/',
      },
      {
        title: 'Guías Rápidas - Seguridad Digital',
        description: 'Guías sencillas sobre cómo estar seguro en TikTok, Instagram, WhatsApp, etc.',
        type: 'Guías (inglés)',
        link: 'https://connectsafely.org/quickguides/',
      },
      {
        title: 'Detén el Bullying',
        description: 'Qué hacer si tú o alguien que conoces sufre bullying, en la escuela o en línea.',
        type: 'Web (inglés)',
        link: 'https://www.stopbullying.gov/',
      },
      {
        title: 'Alto a la Sextorsión',
        description: 'Información y apoyo si estás lidiando con sextorsión, revenge porn o abuso digital.',
        type: 'Web (inglés)',
        link: 'https://bit.ly/Tss_en',
      },
    ],
  },
  {
    id: 'externos-duelo',
    title: 'Recursos Externos - Duelo y Pérdida',
    icon: '💔',
    description: 'Recursos para procesar duelo y pérdidas',
    resources: [
      {
        title: 'Fundación Hospice - Duelo y Pérdida',
        description: 'Recursos sobre duelo en adultos, adolescentes, pérdida de mascotas, final de vida.',
        type: 'Web (inglés)',
        link: 'https://hospicefoundation.ie/',
      },
      {
        title: 'Friends for Survival',
        description: 'Apoyo para familias que han perdido a alguien por suicidio, con grupos y materiales.',
        type: 'Web (inglés)',
        link: 'https://friendsforsurvival.org/',
      },
      {
        title: 'Glow in the Woods',
        description: 'Foro para familias que han vivido pérdidas como infertilidad o embarazo perdido.',
        type: 'Foro (inglés)',
        link: 'https://www.glowinthewoods.com/',
      },
      {
        title: 'Rainbow Bridge',
        description: 'Comunidad para procesar la pérdida de una mascota.',
        type: 'Web (inglés)',
        link: 'https://www.rainbowsbridge.com/hello.htm',
      },
      {
        title: "What's Your Grief?",
        description: 'Artículos, podcast, cursos y recursos para entender y procesar el duelo.',
        type: 'Web (inglés)',
        link: 'https://whatsyourgrief.com/',
      },
      {
        title: 'Soledad en Jóvenes',
        description: 'Artículo que explica cómo manejar la soledad con ideas simples y prácticas.',
        type: 'Artículo (inglés)',
        link: 'https://mhanational.org/resources/loneliness-is-hard-for-kids-and-teens/',
      },
    ],
  },
  {
    id: 'externos-relaciones',
    title: 'Recursos Externos - Autoestima, Familia y Relaciones',
    icon: '👨‍👩‍👧‍👦',
    description: 'Recursos para autoestima, relaciones y familia',
    resources: [
      {
        title: 'Límites Sanos (en español)',
        description: 'Qué son los límites, cómo ponerlos y cómo pueden ayudarte en tus relaciones.',
        type: 'Artículo (español)',
        link: 'https://www.helpguide.org/es/comunicacion/como-establecer-limites-saludables-en-las-relaciones',
      },
      {
        title: 'Asociación Nacional de Autoestima',
        description: 'Actividades y recursos para fortalecer tu autoestima.',
        type: 'Web (inglés)',
        link: 'https://healthyselfesteem.org/',
      },
      {
        title: 'Guía para Padres - APA',
        description: 'Información clara para manejar retos comunes al criar hijos.',
        type: 'Web (inglés)',
        link: 'https://www.apa.org/topics/parenting/index',
      },
      {
        title: 'Comunicación Asertiva',
        description: 'PDF que enseña cómo comunicarte con más claridad y seguridad.',
        type: 'PDF (inglés)',
        link: 'https://www.therapistaid.com/worksheets/assertive-communication',
      },
      {
        title: 'Familias en Transición',
        description: 'Ayuda para entender y manejar la separación o divorcio de tus padres.',
        type: 'Web (inglés)',
        link: 'https://familieschange.ca.gov/',
      },
      {
        title: 'Cómo ayudar a alguien en relación abusiva',
        description: 'PDF que explica cómo apoyar a un amigo o familiar que vive violencia.',
        type: 'PDF (inglés)',
        link: 'https://wscadv.org/resources/supporting-someone-experiencing-abuse/',
      },
      {
        title: 'Love Is Respect',
        description: 'Información y apoyo para prevenir y entender relaciones abusivas.',
        type: 'Web (inglés)',
        link: 'https://www.loveisrespect.org/',
      },
      {
        title: 'Scarleteen - Sexualidad y Relaciones',
        description: 'Información honesta y clara sobre sexualidad, relaciones y embarazo.',
        type: 'Web (inglés)',
        link: 'https://www.scarleteen.com/',
      },
      {
        title: 'Cómo sobrevivir una ruptura',
        description: 'PDF con estrategias para manejar una ruptura y cuidarte emocionalmente.',
        type: 'PDF (inglés)',
        link: 'https://www.mcgill.ca/counselling/files/counselling/surviving_a_break-up_-_20_strategies_0.pdf',
      },
      {
        title: 'Lo que padres deben saber sobre autolesiones',
        description: 'Recurso para ayudar a padres a entender y manejar el tema de autolesiones en hijos.',
        type: 'PDF (inglés)',
        link: 'https://www.selfinjury.bctr.cornell.edu/perch/resources/parenting-2.pdf',
      },
    ],
  },
  {
    id: 'externos-adicciones',
    title: 'Recursos Externos - Adicciones',
    icon: '🚭',
    description: 'Recursos para adicciones y conductas de riesgo',
    resources: [
      {
        title: 'Al-Anon (en español)',
        description: 'Programa que ayuda a familiares y amigos de personas con alcoholismo.',
        type: 'Web (español)',
        link: 'https://al-anon.org/es/',
      },
      {
        title: 'Alcohólicos Anónimos (en español)',
        description: 'Apoyo si estás lidiando con el consumo de alcohol.',
        type: 'Web (español)',
        link: 'https://www.aa.org/es/the-twelve-steps',
      },
      {
        title: 'Marihuana Anónimos',
        description: 'Programa de 12 pasos para dejar el consumo de marihuana.',
        type: 'Web (inglés)',
        link: 'https://marijuana-anonymous.org/',
      },
      {
        title: 'Nar-Anon',
        description: 'Apoyo a familiares y amigos de personas con adicciones.',
        type: 'Web (inglés)',
        link: 'https://www.nar-anon.org/',
      },
      {
        title: 'To Write Love on Her Arms (TWLOHA)',
        description: 'Apoyo para depresión, autolesiones, adicciones y pensamientos suicidas.',
        type: 'Web (inglés)',
        link: 'https://twloha.com/',
      },
      {
        title: 'Bloom - Apoyo para sobrevivientes',
        description: 'Cursos y apoyo para sanar después de vivir abuso o trauma.',
        type: 'Web (inglés)',
        link: 'https://bloom.chayn.co/',
      },
    ],
  },
];
