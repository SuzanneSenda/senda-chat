export interface ToolboxItem {
  title: string;
  content: string;
}

export interface ToolboxSection {
  id: string;
  title: string;
  description: string;
  items: ToolboxItem[];
}

export const toolboxData: ToolboxSection[] = [
  {
    id: 'bienvenida',
    title: '👋 Bienvenida y Orientación',
    description: 'Introducción a Senda Chat y nuestros valores',
    items: [
      {
        title: '¿Qué es Senda Chat?',
        content: `Senda Chat ofrece apoyo de salud mental e intervención de crisis de alta calidad, por medio de mensajes de texto, de manera gratuita, las 24 horas del día, los 7 días de la semana, a través de una comunidad de voluntarios capacitados para apoyar a las personas cuando más lo necesitan.

Nuestro objetivo es apoyar en cualquier tipo de crisis, para ayudar al texter a pasar de un momento acalorado a uno de calma.

**En la línea de crisis, creemos que cada persona tiene derecho:**
• Al reconocimiento de su identidad
• A ser respetada, incluida y no ser discriminada
• A recibir ayuda sin juicio
• A desarrollarse como persona`
      },
      {
        title: '¿Por qué es importante?',
        content: `Las personas de la Comunidad merecen apoyo discreto y culturalmente competente. Las investigaciones y estadísticas en las que nos respaldamos incrementan el apoyo que reciben nuestros usuarios, mientras iluminan los problemas de salud mental que los impactan.

En la comunidad es común estigmatizar el buscar ayuda en cuidados de salud mental, lo que puede impedir que algunas personas busquen los servicios que necesitan. El acceso a la atención de salud mental es esencial para una vida física, mental y emocionalmente sana.

**Dato importante:** El 74% de quienes solicitan ayuda emocional a una línea de crisis por mensajería, tienen 24 años o menos.`
      },
      {
        title: '¿Quiénes nos contactan?',
        content: `Cualquier miembro comunitario, sin importar su edad, género, comunidad de la que provenga, estatus económico ni grado de religiosidad, puede ser un usuario de nuestro servicio.

Tienen nacionalidades e identidades diversas, con distintas necesidades e inquietudes y buscan apoyo o intervención de crisis empático, competente culturalmente y discreto.`
      },
      {
        title: 'Colectivismo vs Individualismo',
        content: `Muchas comunidades judías están arraigadas en el colectivismo. Entender la diferencia entre el individualismo y el colectivismo nos permite apreciar los valores y los ideales que pueden afectar el comportamiento de una persona.

**Individualismo:** Hace énfasis en las metas individuales y en los derechos de una persona específica. Los valores individualistas son prevalentes en la cultura occidental.

**Colectivismo:** Se enfoca en las metas grupales, en lo que es mejor para el colectivo y en las relaciones interpersonales. Son de gran importancia la familia, las amistades, el colegio, el templo, las personas conocidas, la religión y la comunidad.

Los valores colectivistas son prevalentes en las comunidades hispanohablantes y más aún en las comunidades judías.`
      }
    ]
  },
  {
    id: 'cinco-etapas',
    title: '📋 Las 5 Etapas de una Conversación',
    description: 'Estructura de cada conversación con los texters',
    items: [
      {
        title: 'Etapa 1: Construir Confianza',
        content: `**Objetivo:** Construir conexión y confianza con el texter.

**Ejemplo:**
Texter: "Yo simplemente no quiero vivir más. Después de todos los tratamientos, estoy aún peor que antes."

Voluntario: "Hola, soy Luisa. Suena como que te sientes desesperanzado ahora mismo. Estoy aquí para escuchar. Cuéntame más acerca de lo que te está causando sentirte tan exhausto."

**Tips:**
• Preséntate con tu nombre
• Refleja el sentimiento que expresan
• Invita a compartir más con una pregunta abierta`
      },
      {
        title: 'Etapa 2: Explorar',
        content: `**Objetivo:** Explora la situación, el riesgo y el impacto.

**Ejemplo:**
Texter: "Mi pareja y yo acabamos de ser desalojados de nuestra casa. Todo se está cayendo a pedazos."

Voluntario: "Que te desalojen puede ser una experiencia tan devastadora, y suena como que esto ha sido abrumador. Es comprensible que sientas inseguridad sobre a dónde recurrir."

**Tips:**
• Usa frases como "es comprensible" para validar
• Explora qué les llevó a contactarnos
• No asumas - pregunta`
      },
      {
        title: 'Etapa 3: Identificar el Objetivo',
        content: `**Objetivo:** Identifica en qué te puedes concentrar durante la conversación.

Algunas veces, los texters dejarán su objetivo claro durante la exploración. En otras ocasiones, necesitamos preguntar.

**Ejemplo:**
Texter: "Todo se está cayendo a pedazos. Me está yendo mal en mis clases y mi novia me dejó y mis padres siempre están encima de mí sobre alguna cosa."

Voluntario: "Es comprensible que te estés sintiendo abrumado con tantas cosas difíciles al mismo tiempo. ¿Qué crees que sería útil para que nos enfoquemos hoy día?"

**Tips:**
• Deja que el texter lidere
• Parafrasea y pregunta si entendiste bien
• No asumas qué será más útil para ellos`
      },
      {
        title: 'Etapa 4: Descubre los Próximos Pasos',
        content: `**Objetivo:** Descubre el apoyo social, las estrategias de afrontamiento, y los recursos.

**Ejemplo:**
Texter: "No puedo estar sola un momento más y nadie me responde los textos."

Voluntario: "Lidiar con sentimientos de aislamiento toma valentía. Algunas personas encuentran que estar cerca de otras personas es útil aún si no las conocen. ¿Cómo crees que eso te haría sentir?"

**Áreas a explorar:**
• Apoyo social (familia, amigos, comunidad)
• Estrategias de afrontamiento que les han funcionado antes
• Recursos comunitarios disponibles`
      },
      {
        title: 'Etapa 5: Terminar la Conversación',
        content: `**Objetivo:** Termina haciendo un chequeo y confirmando los siguientes pasos.

**Ejemplo de cierre:**
"Demuestra fortaleza que te hayas comunicado y elaborado un plan para reducir tu ansiedad esta noche. Si estás en crisis y quisieras hablar otra vez, estamos aquí 24 horas al día, 7 días de la semana para apoyarte. Cuídate."

**Mensajes de chequeo:**
• "Ha pasado algún tiempo desde la última vez que supe de ti. Estoy aquí si todavía quieres hablar."
• "Tú mereces sentir apoyo, y fue una buena idea que establecieras contacto. ¿Es todavía un buen momento para hablar?"

**Cierre cálido (si no responden):**
"Parece que ahora no es el mejor momento para hablar. Voy a terminar esta conversación, pero estamos aquí 24 horas al día, 7 días a la semana si estás en crisis otra vez. Cuídate."`
      }
    ]
  },
  {
    id: 'tecnicas',
    title: '💬 Técnicas de Buena Comunicación',
    description: 'Habilidades para crear conexión y confianza',
    items: [
      {
        title: 'Reflexiones',
        content: `Las reflexiones muestran a los texters que estás escuchando a través de parafrasear lo que han compartido contigo.

**Ejemplo:**
Texter: "Estoy tan sola y la pelea con mi novio me está realmente enojando y ahora ni siquiera puedo hablar con él acerca de las cosas que me están pasando."

Voluntario: "Suena como que ya te sentías aislada y la pelea de hoy solo le agregó leña al fuego."

**Tips:**
• Refleja cómo se está sintiendo (sola)
• Refleja por qué se están sintiendo así (la pelea)
• Usa tus propias palabras, no repitas exactamente`
      },
      {
        title: 'Palabras de Sentimientos Fuertes',
        content: `Las palabras de sentimientos fuertes nos ayudan a captar la singularidad del dolor del texter.

**Ejemplo:**
Texter: "Me cansé de mi trabajo. Hoy fue todo una mierda; me culparon de algo que no hice, pero nadie me creyó."

Voluntario: "Parece ser que está furiosa porque la trataron injustamente y su jefe no confía en usted."

**Lista de palabras fuertes:**
Asustado, Agitada, Enojado, Ansioso, Avergonzado, Confundida, Derrotada, Deprimido, Decepcionada, Desanimado, Angustiada, Frágil, Frustrado, Furioso, Culpable, Indefensa, Desesperanzado, Horrorizado, Humillada, Dolida, Impotente, Rechazada, Aterrorizado, Vulnerable, Aislado, Agotado`
      },
      {
        title: 'Tentafíos',
        content: `Los tentafíos nos permiten compartir de qué pensamos que se trata la crisis, mientras le damos la oportunidad de corregirnos.

**Ejemplo:**
Texter: "Mi mejor amiga intentó suicidarse hace 3 meses y las cosas han estado realmente delicadas desde entonces."

Voluntario: "Tengo la sensación de que estás preocupada de que ella está muy frágil para hablar después de lo que sucedió."

**Lista de tentafíos:**
• Parece que…
• Me pregunto si…
• Suena como que…
• Estoy escuchando que…
• Tengo curiosidad de saber si…
• Tengo la sensación de que…
• Si estoy entendiendo bien…
• Me da la impresión…`
      },
      {
        title: 'Validaciones',
        content: `Las validaciones muestran a los texters que aceptamos sus emociones sin juzgarles.

**Ejemplo:**
Texter: "Es estúpido sentirme de esta manera, ellos ignoran lo que quiero todo el tiempo."

Voluntario: "Es normal que estés frustrado con tus padres cuando ellos no te escuchan."

**Lista de validaciones:**
• Es normal que…
• Es comprensible que te sientas…
• Tiene sentido que…
• Es natural que…
• Es razonable que…
• Esa es una situación difícil
• Puede ser abrumador el…
• Eso es mucho para una sola persona manejarlo…`
      },
      {
        title: 'Identificación de Fortalezas',
        content: `La identificación de fortalezas nos da la oportunidad de decirles a los texters acerca de sus cualidades positivas.

**Ejemplo:**
Texter: "Estoy aterrorizada ahora mismo. Mi tío fue diagnosticado con cáncer."

Voluntario: "Estoy honestamente impresionado con tu fortaleza. Te importa mucho tu tío y estás cargando el peso de su dolor. Pareces ser una persona considerada."

**Lista de fortalezas:**
• Se necesita ser realmente valiente… para textear cuando te estás sintiendo así
• Se necesita fuerza de verdad… para hacer que tu bienestar sea una prioridad
• Eres resiliente… por lidiar con esto por tanto tiempo
• Aprecio tu valentía… Yo sé que no es fácil compartir estas cosas`
      },
      {
        title: 'Preguntas Abiertas',
        content: `Las preguntas abiertas dan a los texters la oportunidad de compartir más en sus propios términos.

**Ejemplo correcto:**
"¿Qué ha hecho ella para hacerte sentir frustrado?"

**Evita preguntas "por qué":**
❌ "¿Por qué te hace sentir tan molesto?" (puede sonar acusador)

**Evita preguntas cerradas:**
❌ "¿Te hizo algo ella?" (resulta en sí/no)

**Lista de preguntas abiertas:**
• ¿Con qué has intentado lidiar?
• ¿Cómo te hizo sentir el hacer eso?
• ¿Qué sueles hacer cuando…?
• ¿Cómo te ha estado afectando?
• ¿A quién acudes usualmente para recibir consejo?`
      }
    ]
  },
  {
    id: 'ansiedad',
    title: '😰 Ansiedad y Estrés',
    description: 'Apoyo para texters con ansiedad',
    items: [
      {
        title: 'Entendiendo la Ansiedad',
        content: `La ansiedad es una respuesta natural del cuerpo ante situaciones de estrés. Sin embargo, cuando es excesiva o persistente, puede interferir con la vida diaria.

**Síntomas comunes:**
• Preocupación excesiva
• Dificultad para concentrarse
• Tensión muscular
• Problemas para dormir
• Irritabilidad
• Síntomas físicos (dolor de pecho, taquicardia, sudoración)

**Consideración cultural:**
Los texters pueden describir los síntomas de ansiedad como nerviosismo o como dolencias físicas (dolor de pecho, de cabeza, etc.). Es fundamental ser consciente de esto.`
      },
      {
        title: 'Técnicas de Grounding',
        content: `Las técnicas de grounding ayudan a traer al texter al momento presente.

**Técnica 5-4-3-2-1:**
"¿Te gustaría intentar un ejercicio conmigo? Nombra 5 cosas que puedes ver, 4 que puedes tocar, 3 que puedes escuchar, 2 que puedes oler, y 1 que puedes saborear."

**Respiración 4-4-4:**
"¿Te gustaría intentar un ejercicio de respiración conmigo? Inhala contando hasta 4, sostén por 4, y exhala contando hasta 4. Lo hacemos juntos."

**Tips:**
• Ofrece, no impongas las técnicas
• Hazlo junto con ellos si aceptan
• Valida si no quieren intentarlo`
      }
    ]
  },
  {
    id: 'depresion',
    title: '😔 Depresión y Tristeza',
    description: 'Apoyo para texters con depresión',
    items: [
      {
        title: 'Entendiendo la Depresión',
        content: `La depresión es la principal causa de discapacidad en el mundo, y la cuarta causa principal de muerte entre los jóvenes de 15 a 29 años.

**Síntomas comunes:**
• Tristeza persistente
• Pérdida de interés en actividades
• Cambios en el apetito o sueño
• Fatiga
• Sentimientos de inutilidad o culpa
• Dificultad para concentrarse
• Pensamientos de muerte o suicidio

**Consideración cultural:**
Los texters pueden describir síntomas como nerviosismo, cansancio o dolencias físicas. Algunos pueden sentir vergüenza por necesitar ayuda debido al estigma en la comunidad.`
      },
      {
        title: 'Cómo Apoyar',
        content: `**No minimices sus sentimientos:**
❌ "Tienes muchas cosas buenas en tu vida"
✅ "Es comprensible que te sientas así dado todo lo que has compartido"

**Evita consejos no solicitados:**
❌ "Deberías hacer ejercicio"
✅ "¿Qué te ha ayudado a sentirte mejor en el pasado?"

**Valida su experiencia:**
"Es normal sentirse abrumado cuando cargas con tanto. Mereces apoyo."

**Explora apoyo social:**
"¿Hay alguien en tu vida con quien te sientas cómodo compartiendo cómo te sientes?"`
      }
    ]
  },
  {
    id: 'autolesion',
    title: '🩹 Autolesiones',
    description: 'Apoyo para texters que se autolesionan',
    items: [
      {
        title: 'Entendiendo la Autolesión',
        content: `La autolesión consiste en cualquier acto que cause daño a propósito a su propio cuerpo, **sin la intención de morir**. Los texters que se autolesionan no están tratando de matarse.

**Palabras comunes que usan:**
Cortar, impulso, rasuradora, cuchilla, en recaída, cicatriz, castigo

**Sentimientos asociados:**
Sentirse asustado, aburrido, estresado

**Importante:**
La autolesión constituye aproximadamente un 12% de las conversaciones. Muchas veces es una forma de lidiar con emociones intensas o sentir control.`
      },
      {
        title: 'Cómo Explorar',
        content: `**Si se están autolesionando activamente:**

1. **Separar de los mecanismos:**
"Mereces estar segura. ¿Estarías dispuesta a guardar tus tijeras mientras hablamos?"

2. **Preguntar si hay intención de morir:**
"Quiero checar, ¿te estás cortando porque quieres acabar con tu vida?"

**Si NO hay intención de morir:**
Continúa explorando la crisis (la autolesión como mecanismo de afrontamiento).

"¿Me podrías contar más sobre lo que sentías antes de empezar a cortarte?"

**Si SÍ hay intención de morir:**
Trata como conversación de suicidio (ver sección de Suicidio).`
      },
      {
        title: 'Explorando Más Profundo',
        content: `**Ejemplo de conversación:**

Voluntario: "Tiene sentido que quieras sentir alivio. Me pregunto si estás buscando algo de control en tu vida."

Texter: "Sí, en el momento hace que me sienta bajo control y contenta, pero luego hay más caos porque tengo que esconder las cicatrices."

Voluntario: "Estoy escuchando que aunque te brinda algo de control, solo es momentáneo. Te mereces algo de paz. ¿Me podrías contar más sobre lo que sentías antes de empezar a cortarte?"

**Tips:**
• No juzgues
• Explora qué les llevó a ese punto
• Busca alternativas que les brinden la misma sensación`
      }
    ]
  },
  {
    id: 'suicidio',
    title: '🆘 Suicidio',
    description: 'Evaluación de riesgo y apoyo',
    items: [
      {
        title: 'Consideraciones Culturales',
        content: `Los pensamientos y comportamientos suicidas han aumentado significativamente, particularmente entre jóvenes de 15 a 25 años.

**Barreras en la comunidad:**
• Actitudes negativas ligadas a religión ("es un pecado")
• Vergüenza familiar por hablar de salud mental
• Comentarios invalidantes ("no tienes razón para estar triste")
• Expectativas de género (hombres deben ser "fuertes")

**El suicidio suele ser un acto impulsivo:**
El periodo de riesgo agudo pasa en horas, o incluso minutos. 9 de cada 10 personas que sobreviven a intentos de suicidio no mueren por suicidio.`
      },
      {
        title: 'Proceso de Evaluación de Riesgo',
        content: `Cuando un texter menciona suicidio, evaluamos usando 4 pasos:

**1. PENSAMIENTOS**
"Con todo este dolor, ¿has llegado al punto en el que has pensado en el suicidio?"

**2. PLAN**
"¿Cómo es tu plan para terminar con tu vida?"

**3. MECANISMOS**
"¿Tienes acceso a lo que necesitas para llevar a cabo tu plan?"

**4. PERIODO DE TIEMPO**
"¿Cuándo planeas llevar a cabo tu plan?"

**Riesgo Inminente = Los 4 criterios + periodo dentro de 48 horas**
→ Alerta a tu supervisor inmediatamente`
      },
      {
        title: 'Método de Expresión de Preocupación',
        content: `Para preguntar sobre suicidio, usamos el método de "Expresión de Preocupación":

1. Muestra que escuchas mencionando su crisis
2. Pregunta sobre riesgo expresando preocupación por su seguridad

**Ejemplo:**
"Con todo este conflicto familiar que tienes a tu alrededor, solo quiero asegurarme de que estés seguro. ¿Has tenido pensamientos sobre suicidarte?"

**Si responden NO:**
"Gracias por ser honesto. Quiero que sepas que si en cualquier momento lo estás considerando, siempre nos puedes contar."

**NUNCA digas:**
❌ "¡Qué bien!" o "¡Gracias a Dios!"
(Esto puede hacer que no compartan en el futuro)`
      },
      {
        title: 'Cuando Hay Riesgo Inminente',
        content: `Si el texter cumple los 4 criterios:

**1. Aleja de los mecanismos:**
"Mereces estar a salvo. ¿Podrías guardar la pistola en otro cuarto mientras hablamos?"

**2. Continúa explorando:**
"¿Me puedes contar más sobre lo que sucede que te hace sentir de esta manera?"

**3. Valida:**
"Es comprensible que te sientas de esa manera dado todo lo que ha pasado."

**4. Descubre próximos pasos de seguridad:**
"¿Qué crees que puedes hacer para sentir un poco de alivio?"

**Rescate Activo:**
Si no puede pensar en pasos para mantenerse a salvo, o deja de responder, tu supervisor puede contactar a autoridades. Necesitarás: nombre completo, dirección exacta, y fecha de nacimiento.`
      }
    ]
  },
  {
    id: 'abuso',
    title: '⚠️ Abuso',
    description: 'Cómo explorar situaciones de abuso',
    items: [
      {
        title: 'Tipos de Abuso',
        content: `El abuso existe en muchas formas:
• **Físico:** Golpes, empujones, estrangulamiento
• **Emocional:** Insultos, humillación, control
• **Sexual:** Contacto no consentido
• **Negligencia:** Falta de cuidado básico
• **Financiero:** Control del dinero, explotación

**Importante:**
Los texters no siempre usan la palabra "abuso". Sin importar la forma, tomamos en serio sus preocupaciones y creemos que el dolor que sienten es real.`
      },
      {
        title: 'Consideraciones Culturales',
        content: `**Ejemplo 1:** En algunas familias, puede haber expectativa de que los hijos usen sus ingresos para ayudar en el hogar.

**Ejemplo 2:** Los padres pueden esperar que hijos mayores cuiden a hermanos menores. Estas tareas cargan desproporcionadamente a mujeres y niñas.

**Ejemplo 3:** Explotación financiera por empleador o familiar.

**Importante:**
No podemos hacer suposiciones sobre la experiencia de abuso del texter. Usamos la Filosofía de Cinco Etapas y Técnicas de Buena Comunicación para apoyarles donde se encuentren.`
      },
      {
        title: 'Cuándo Reportar',
        content: `**Responsabilidad de reportar:**
Si un texter comparte su nombre completo, fecha de nacimiento y dirección completa, estamos obligados a hacer un reporte.

**Cómo comunicarlo:**
"Debido a que soy un adulto en una línea de crisis, tengo la responsabilidad de tomar acción si la seguridad de alguien está en riesgo. Si estás dispuesta a darme tu información, puedo hacer un reporte."

**Si no quieren compartir:**
"Es tu decisión compartir esa información. Estoy aquí para apoyarte sin importar lo que decidas."

**Posibles miedos del texter:**
• No le crean
• Consecuencias a él o su familia
• Ser separado de su familia

Validamos estos temores y respetamos su decisión.`
      }
    ]
  },
  {
    id: 'relaciones',
    title: '💔 Relaciones',
    description: 'Conflictos familiares, rupturas, aislamiento',
    items: [
      {
        title: 'Conflictos Familiares',
        content: `**Ejemplo de conversación:**

Texter: "Yo ni siquiera sé cómo se supone que tenga una vida. Mis padres no me dejan tener amigos ni salir y solo quieren que estudie todo el tiempo."

Voluntario: "No poder elegir cómo pasas el tiempo hace parecer como que uno no tiene una vida propia. ¿Cómo te hace sentir cuando ellos quieren que tú solo estudies todo el tiempo?"

**Tips:**
• Valida la frustración
• No tomes partido
• Explora cómo les afecta emocionalmente`
      },
      {
        title: 'Rupturas y Relaciones Tóxicas',
        content: `**Ejemplo de conversación:**

Texter: "Le dije exactamente lo que estaba haciendo. Salí a comer y me tomé dos tragos. Él me dice que confía en mí y luego exige una foto."

Voluntario: "Me pregunto si te sientes frustrada ahora que él está exigiendo que le muestres pruebas de que realmente hiciste lo que le dijiste. Es normal sentirse insegura acerca de relaciones a las que les falta confianza."

**Tips:**
• No juzgues a la pareja
• Valida sus sentimientos
• Explora qué quieren de la conversación`
      },
      {
        title: 'Aislamiento y Soledad',
        content: `**Ejemplo de conversación:**

Texter: "No puedo estar sola un momento más y nadie me responde los textos."

Voluntario: "Lidiar con sentimientos de aislamiento toma valentía. Algunas personas encuentran que estar cerca de otras personas es útil aún si no las conocen. ¿Cómo crees que eso te haría sentir?"

**Importante:**
La soledad y el aislamiento son síntomas de pensamientos suicidas, ansiedad y depresión. Ofrecer conexión puede ser lo más positivo que podemos hacer.`
      }
    ]
  },
  {
    id: 'genero',
    title: '🏳️‍🌈 Género y Sexualidad',
    description: 'Apoyo para diversidad de género y orientación sexual',
    items: [
      {
        title: 'Identidad de Género',
        content: `La identidad de género es la sensación que tiene una persona sobre sí misma y el género con el que se identifica.

La campaña 'Libres e Iguales' de las Naciones Unidas la define como:
"La identidad de género refleja un sentido profundo y experimentado del propio género de la persona. Todo el mundo tiene una identidad de género que es integral a su identidad en sentido general."

**Importante:**
La identidad de género no es lo mismo que la orientación sexual o las características sexuales.`
      },
      {
        title: 'Lenguaje Inclusivo',
        content: `**Cuándo usar lenguaje inclusivo:**
• Si el texter usa "elle" o se identifica como no-binario
• Si no es claro su género
• Ante la duda, siempre es mejor preguntar o ser incluyente

**Ejemplo - Género NO visibilizado:**
Texter: "Estoy pensando en todo lo que tengo que hacer y es muy abrumador"
Voluntario: "Puedo ver que estás cargando mucho en este momento y es normal la sensación de agotamiento que describes."

**Ejemplo - Género visibilizado:**
Texter: "me siento muy ansiosa"
Voluntario: "Es entendible que estés nerviosa de tener una conversación tan importante."

**NUNCA asumimos género por el tema.** La depresión, ansiedad, autolesión, desordenes alimenticios son temas de todos los géneros.`
      },
      {
        title: 'Consideraciones LGBTQ+',
        content: `**Posibles retos:**
• Rechazo familiar por orientación sexual
• Expectativas de género ("los hombres deben ser fuertes")
• Baja autoestima y exclusión social

**Ejemplo:**
Un hombre gay puede no ser aceptado por su familia debido a expectativas de machismo. Experimentar exclusión puede conducir a pensamientos de suicidio.

**Cómo apoyar:**
• No asumas nada sobre su familia o comunidad
• Valida sus sentimientos
• Explora su red de apoyo
• Ofrece recursos específicos LGBTQ+ si lo desean`
      }
    ]
  },
  {
    id: 'alimentacion',
    title: '🍽️ Alimentación e Imagen Corporal',
    description: 'Trastornos alimenticios y apoyo',
    items: [
      {
        title: 'Entendiendo los Trastornos Alimenticios',
        content: `Los trastornos alimenticios afectan a personas de todas las edades, géneros y contextos.

**Tipos comunes:**
• Anorexia: restricción extrema de alimentos
• Bulimia: atracones seguidos de purgas
• Trastorno por atracón: comer en exceso sin control

**Señales:**
• Preocupación excesiva por peso/comida
• Cambios drásticos en hábitos alimenticios
• Aislamiento durante comidas
• Ejercicio excesivo

**Importante:**
Nunca ofrecemos consejos médicos ni de dieta. Escuchamos y validamos su experiencia.`
      },
      {
        title: 'Cómo Apoyar',
        content: `**Ejemplo de conversación:**

Texter: "No sé qué más hacer. He tratado tantas cosas para dejar de hacerme vomitar."

Voluntario: "Es difícil cuando nada parece estar funcionando. ¿Quiere que hablemos sobre recursos adicionales que podrían ayudarle con la bulimia?"

**Tips:**
• No juzgues sus comportamientos
• Valida lo difícil que es
• Pregunta antes de ofrecer recursos
• Explora qué apoyo tienen actualmente`
      }
    ]
  },
  {
    id: 'sustancias',
    title: '🚬 Uso de Sustancias',
    description: 'Apoyo para adicciones',
    items: [
      {
        title: 'Entendiendo el Uso de Sustancias',
        content: `El uso de sustancias puede ser una forma de lidiar con dolor emocional o trauma.

**No juzgamos:**
• El uso de sustancias en sí
• Las razones por las que usan
• Sus intentos previos de dejar

**Exploramos:**
• Qué les llevó a contactarnos hoy
• Cómo se sienten respecto al uso
• Qué apoyo tienen o necesitan`
      },
      {
        title: 'Cómo Apoyar',
        content: `**Ejemplo de conversación:**

Texter: "No sé qué más hacer."

Voluntario: "Si te parece bien, puedo compartir un recurso contigo que podría ayudarte a conseguir más apoyo para tu adicción."

**Tips:**
• Pide permiso antes de ofrecer recursos
• Valida lo difícil que es pedir ayuda
• No presiones para que dejen de usar
• Enfócate en su bienestar general`
      }
    ]
  },
  {
    id: 'espiritualidad',
    title: '🕊️ Espiritualidad y Religión',
    description: 'Respeto a creencias y grado de religiosidad',
    items: [
      {
        title: 'Principio Fundamental',
        content: `**Respetamos el grado de religiosidad de cada persona.**

Cualquier miembro comunitario puede contactarnos, sin importar su grado de religiosidad. No asumimos ni imponemos creencias.

**Importante:**
• No menciones el templo/religión a menos que ellos lo hagan primero
• Si lo mencionan, puedes explorarlo como fuente de apoyo
• Respeta si la religión es fuente de conflicto para ellos`
      },
      {
        title: 'Religión como Fortaleza',
        content: `**Factores de protección:**
Las identidades religiosas y espirituales pueden servir como fuentes de fortaleza. Los rezos y ceremonias religiosas pueden crear sistemas de apoyo importantes.

**Ejemplo:**
Voluntario: "Hace un rato mencionó que ir al templo usualmente le ayuda a aclarar su mente. Me pregunto si existe la posibilidad de que comparta lo que siente con alguien del templo. ¿Qué piensa?"

**Tips:**
• Solo menciona religión si ellos la mencionaron primero
• Explora cómo les ayuda o les afecta
• Respeta su perspectiva sin juzgar`
      },
      {
        title: 'Religión como Fuente de Conflicto',
        content: `**Posibles conflictos:**
• La religión puede afectar cómo se ve la salud mental (como "síntoma espiritual" en lugar de condición médica)
• Presión para "rezar" en lugar de buscar ayuda profesional
• Estigma por necesitar apoyo
• Conflicto entre creencias religiosas y orientación sexual

**Ejemplo:**
Texter: "Mis familiares no entienden por qué estoy deprimida, solo me piden rezar."

Voluntario: "Aunque has podido compartir tus sentimientos, parece que sientes que tu familia no va a ser receptiva. Fuera de tu familia, ¿con quién más te has sentido cómoda para compartir lo que estás sintiendo?"

**Tips:**
• No invalides la importancia de su fe
• Explora otras fuentes de apoyo
• Valida la dificultad de su situación`
      }
    ]
  },
  {
    id: 'lenguaje',
    title: '🗣️ Lenguaje y Dialectos',
    description: 'GTD: Género, Tono y Dialecto',
    items: [
      {
        title: 'Tono (Tú vs Usted)',
        content: `**Regla general:** Usamos el tono informal "tú".

**Excepción:** Si el texter usa "usted", continuamos con "usted" para demostrar respeto.

**Siempre intentamos reflejar el tono del texter.**

**Ejemplos de usted:**
• "Gracias por su honestidad"
• "¿Cómo le hizo sentir eso?"
• "Usted merece sentirse apoyado"`
      },
      {
        title: 'Dialectos y Aclaraciones',
        content: `Debido a la diversidad cultural, los voluntarios tendrán interacciones con diversos dialectos y palabras que no podrán entender.

**Ejemplo 1:**
Texter: "Estoy muy bajoneado"
Voluntario: "Quiero asegurarme que te entiendo bien, ¿qué quieres decir con bajoneado?"

**Ejemplo 2:**
Texter: "Me mola mogollón ese plan"
Voluntario: "Para estar segura, ¿me podrías aclarar qué significa mola mogollón?"

**Regla:** Nunca asumas o adivines, mejor confirma. Es una gran oportunidad para demostrar interés.`
      }
    ]
  },
  {
    id: 'emergencias',
    title: '🚨 Situaciones de Emergencia',
    description: 'Homicidio, emergencias médicas, rescates',
    items: [
      {
        title: 'Homicidio',
        content: `Si un texter expresa ideas homicidas con plan, mecanismos y objetivo, alerta a tu supervisor.

**Evaluación de riesgo:**
1. "¿Está pensando en matar a alguien?"
2. "¿Cuál es su plan para matar a alguien?"
3. "¿Tiene acceso a lo que usaría?"
4. "¿Tiene a alguna persona en mente?"
5. "¿Cuándo tiene pensado hacerlo?"

**Importante:**
• Usa técnicas de buena comunicación
• Enfócate en explorar sus sentimientos (ira, dolor, confusión)
• Descubre próximos pasos (sistemas de apoyo, estrategias de afrontamiento)
• Tu supervisor decidirá si se realiza rescate activo`
      },
      {
        title: 'Emergencias Médicas',
        content: `Las emergencias médicas son situaciones inmediatas que amenazan la vida.

**Alerta a tu supervisor si:**
• El texter tiene una emergencia que podría resultar en su muerte
• No puede comunicarse con servicios de emergencia
• Hacerlo pondría en riesgo su vida

**NUNCA ofrecemos:**
• Consejos médicos específicos
• Información sobre seguros o costos

**Sí hacemos:**
• Validar y usar técnicas de buena comunicación
• Apoyar mientras llega ayuda`
      },
      {
        title: 'Rescates Activos',
        content: `Un Rescate Activo es cuando un supervisor contacta autoridades para asegurar el bienestar físico de un texter.

**Sucede cuando:**
1. Texter en riesgo inminente de suicidio sin plan de seguridad
2. Texter en riesgo inminente que deja de responder

**Mensaje a enviar:**
"Tal vez tengamos que comunicarnos con Servicios de Emergencia pero sólo como último recurso si no podemos trabajar en conjunto para pensar en maneras de mantenerte a salvo."

**Información necesaria:**
• Nombre completo
• Calle, número exterior e interior
• Colonia, municipio/alcaldía
• Estado

**Importante:**
Reconoce que el contacto con autoridades puede aumentar miedo y ansiedad. Valida estos sentimientos.`
      }
    ]
  }
];
