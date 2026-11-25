/* ==========================================================
   datos.js — la información de ejemplo de la app
   Todo esto es de ejemplo (no hay servidor ni base de datos).
   Aquí se guardan espacios, horarios, instructores, precios, etc.
   Si cambia un dato real (capacidad, horario...), se cambia aquí
   y se actualiza solo en todas las pantallas.
   ========================================================== */

const DATOS = {
  // Espacios y actividades del Polideportivo
  espacios: [
    { id: "basquetbol", nombre: "Básquetbol", tipo: "reserva" },
    { id: "voleibol", nombre: "Voleibol", tipo: "reserva" },
    { id: "futbol", nombre: "Fútbol", tipo: "reserva" },
    { id: "ping-pong", nombre: "Ping pong", tipo: "reserva" }, // solo reserva, sin instructor
    { id: "taekwondo", nombre: "Taekwondo", tipo: "clase" },
    { id: "danza", nombre: "Danza", tipo: "clase" }
  ],

  // Detalle de cada espacio que se puede reservar (pantallas 18 a 23)
  // "palabra" es cómo se le dice en las frases: "la cancha" o "la mesa"
  canchas: {
    basquetbol: {
      nombre: "Cancha de básquetbol",
      corto: "Básquetbol",
      lugar: "Cancha exterior · Polideportivo UCA",
      capacidad: 20,
      horario: "6:00 – 20:00",
      foto: "Fotografia de la cancha.jpg",
      incluye: ["Red", "Balones", "Iluminación", "Bancas"],
      horas: ["14:00", "15:00", "16:00", "17:00", "18:00", "19:00"],
      palabra: "cancha",
      etiqueta: "Cancha",
      precioHora: 15, // usuarios externos (dato de ejemplo)
      extra: { nombre: "Vestidores", costo: 5 }
    },
    voleibol: {
      nombre: "Cancha de voleibol",
      corto: "Voleibol",
      lugar: "Cancha exterior · Polideportivo UCA",
      capacidad: 12,
      horario: "6:00 – 20:00",
      foto: "Cancha de voleibol.jpg",
      incluye: ["Red", "Balones", "Iluminación", "Bancas"],
      horas: ["14:00", "15:00", "16:00", "17:00", "18:00", "19:00"],
      palabra: "cancha",
      etiqueta: "Cancha",
      precioHora: 15, // usuarios externos (dato de ejemplo)
      extra: { nombre: "Vestidores", costo: 5 }
    },
    futbol: {
      nombre: "Cancha de fútbol",
      corto: "Fútbol",
      lugar: "Campo deportivo · Polideportivo UCA",
      capacidad: 22,
      horario: "6:00 – 20:00",
      foto: "Cancha de futbol.jpg",
      incluye: ["Porterías", "Balones", "Iluminación", "Bancas"],
      horas: ["14:00", "15:00", "16:00", "17:00", "18:00", "19:00"],
      palabra: "cancha",
      etiqueta: "Cancha",
      precioHora: 15, // usuarios externos (dato de ejemplo)
      extra: { nombre: "Vestidores", costo: 5 }
    },
    "ping-pong": {
      nombre: "Mesa de ping pong",
      corto: "Ping pong",
      lugar: "Sala interior · Polideportivo UCA",
      capacidad: 4,
      horario: "8:00 – 18:00",
      foto: "Fotografia de la cancha ping pong.jpg",
      incluye: ["Mesa", "Paletas", "Pelotas", "Red"],
      horas: ["14:00", "15:00", "16:00", "17:00"],
      palabra: "mesa",
      etiqueta: "Espacio",
      precioHora: 8, // usuarios externos (dato de ejemplo)
      extra: { nombre: "Paletas y pelotas", costo: 2 }
    }
  },

  normas: "Llega 10 minutos antes, usa calzado deportivo y respeta el tiempo de tu reserva (máximo 2 horas).",

  // Para qué se usará el espacio (hoja 21 · Tu reserva)
  usos: [
    { valor: "Entrenamiento", texto: "Práctica de equipo o personal" },
    { valor: "Partido amistoso", texto: "Juego entre amigos o facultades" },
    { valor: "Otra actividad", texto: "Cuéntanos cuál" }
  ],

  // "Hoy" en el prototipo (como en Figma): miércoles 18 de noviembre de 2026.
  // Se puede reservar desde hoy y hasta 3 semanas.
  hoy: new Date(2026, 10, 18),
  semanasDisponibles: 3,

  // Días en mantenimiento (sin horarios). En Figma: sábado 21.
  mantenimiento: ["2026-11-21"],

  // Los domingos no se reservan canchas: el Polideportivo solo abre para
  // eventos (por eso en Figma, después del sábado 21 el próximo horario
  // es el lunes 23, y el domingo 22 hay "Básquet 3x3 nocturno"). 0 = domingo.
  diasCerrados: [0],

  /* ---------- Eventos (24 a 28) ----------
     "equipo": cuántas personas por equipo (mínimo y máximo).
     "cupo": cuántos equipos van inscritos de cuántos hay. */
  eventos: [
    {
      id: "copa-interfacultades",
      deporte: "Fútbol",
      sobre: "FÚTBOL · COPA UCA",
      titulo: "Copa interfacultades",
      subtitulo: "Ingeniería vs. Economía",
      fecha: "2026-11-20",
      hora: "4:00 p. m.",
      cupo: { inscritos: 18, total: 30 },
      costo: 0,
      equipo: { min: 5, max: 11 },
      foto: "Fotografia.jpg",
      miniatura: "DSC01422 1.jpg",
      confirmacion: "¡Ya estás<br>en la copa!"
    },
    {
      id: "torneo-voleibol",
      deporte: "Voleibol",
      sobre: "VOLEIBOL · TORNEO RELÁMPAGO",
      titulo: "Torneo relámpago de voleibol",
      corto: "Torneo de voleibol",
      subtitulo: "Inscripción por equipo de 4 personas",
      resumen: "Inscripción por equipo",
      fecha: "2026-11-21",
      hora: "5:30 p. m.",
      cupo: { inscritos: 6, total: 12 },
      costo: 3,
      detalleCosto: "por equipo · incluye arbitraje",
      equipo: { min: 4, max: 4 },
      foto: "Fotografia voleibol.jpg",
      miniatura: "DSC01443 2.jpg",
      confirmacion: "¡Ya estás<br>en el torneo!"
    },
    {
      id: "basquet-3x3",
      deporte: "Básquetbol",
      sobre: "BÁSQUETBOL · 3X3",
      titulo: "Básquet 3x3 nocturno",
      subtitulo: "Cupos limitados",
      fecha: "2026-11-22",
      hora: "6:00 p. m.",
      cupo: { inscritos: 13, total: 16 },
      costo: 0,
      equipo: { min: 3, max: 4 },
      foto: "Fotografia basquetbol.jpg",
      confirmacion: "¡Ya estás<br>en el 3x3!"
    }
  ],

  /* ---------- Actividades y clases (33 y 34) ----------
     Son semanales y la inscripción es individual. "libres" = cupos libres. */
  actividades: [
    {
      id: "voleibol-abierto",
      deporte: "Voleibol",
      sobre: "ENTRENAMIENTO · ABIERTO",
      titulo: "Voleibol",
      corto: "Voleibol para todos",
      tipo: "Entrenamiento · abierto",
      subtitulo: "Entrenamiento guiado del Polideportivo",
      dias: "Mar y jue",
      diasLargo: "los martes y jueves",
      hora: "5:00 p. m.",
      libres: 8,
      costo: 0,
      foto: "Fotografia voleibol.jpg",
      miniatura: "image 4.jpg",
      diasNumero: [2, 4],
      boton: "Unirme",
      etiqueta: "Actividad",
      nombre: "Entrenamiento de voleibol",
      confirmacion: "¡Ya estás<br>en el entrenamiento!"
    },
    {
      id: "clinica-futbol",
      deporte: "Fútbol",
      sobre: "CURSO · 4 SEMANAS",
      titulo: "Clínica de fútbol",
      tipo: "Curso · 4 semanas",
      subtitulo: "Técnica, pases y definición",
      dias: "Sábados",
      diasLargo: "los sábados",
      diasNumero: [6],
      hora: "9:00 a. m.",
      libres: 5,
      costo: 5,
      detalleCosto: "pago único · 4 sesiones",
      foto: "Fotografia futbol.jpg",
      boton: "Unirme y pagar",
      etiqueta: "Curso",
      nombre: "Clínica de fútbol",
      confirmacion: "¡Ya estás<br>en la clínica!"
    },
    {
      id: "taekwondo",
      deporte: "Taekwondo",
      sobre: "CLASES · TODOS LOS NIVELES",
      titulo: "Taekwondo",
      tipo: "Clases · Todos los niveles",
      subtitulo: "Clases con instructor del Polideportivo",
      dias: "Lun y mié",
      diasLargo: "los lunes y miércoles",
      diasNumero: [1, 3],
      hora: "5:00 p. m.",
      libres: 10,
      costo: 0,
      instructor: "Prof. Marcos Rivera",
      foto: "Fotografia taekwondo.jpg",
      boton: "Inscribirme a la clase",
      etiqueta: "Clase",
      nombre: "Clase de taekwondo",
      confirmacion: "¡Ya estás<br>en la clase!"
    },
    {
      id: "gimnasio",
      deporte: "Gimnasio",
      sobre: "ENTRENAMIENTO · TODOS LOS NIVELES",
      titulo: "Gimnasio",
      tipo: "Entrenamiento · Todos los niveles",
      subtitulo: "Entrenamiento con instructor del Polideportivo",
      dias: "Mar y jue",
      diasLargo: "los martes y jueves",
      hora: "4:30 p. m.",
      diasNumero: [2, 4],
      libres: 12,
      costo: 0,
      instructor: "Instr. Karla Mejía",
      foto: "Fotografia gimnasio.jpg",
      boton: "Inscribirme a la clase",
      etiqueta: "Actividad",
      nombre: "Entrenamiento de gimnasio",
      confirmacion: "¡Ya estás<br>en la clase!"
    }
  ],

  // Estudiante con sesión iniciada (DATOS DE EJEMPLO)
  // "nombreVisible" y "foto" se pueden cambiar en Editar perfil (35a)
  estudiante: {
    nombre: "Andrea Martínez",
    nombreVisible: "Andrea Martínez",
    foto: "",
    carnet: "00000000",
    carrera: "Ingeniería Informática",
    correo: "00000000@uca.edu.sv"
  },

  /* ---------- Lo que la estudiante ya tiene (como en Figma 35 a 40) ---------- */
  // estado: confirmada, cancelada o completada
  misReservas: [
    { codigo: "R-4821", cancha: "voleibol", nombre: "Cancha de voleibol", fecha: "2026-11-18", hora: "15:00", fin: "16:00", actividad: "Entrenamiento", personas: 8, estado: "confirmada" },
    { codigo: "R-4790", cancha: "basquetbol", nombre: "Cancha de básquetbol", fecha: "2026-11-20", hora: "14:00", fin: "15:00", actividad: "Partido amistoso", personas: 10, estado: "confirmada" },
    { codigo: "R-4652", cancha: "futbol", nombre: "Cancha de fútbol", fecha: "2026-11-07", hora: "9:00", fin: "11:00", actividad: "Entrenamiento", personas: 20, estado: "completada" }
  ],
  misInscripciones: [
    { codigo: "INS-2075", id: "voleibol-abierto", titulo: "Voleibol para todos", equipo: null, pago: { tipo: "gratis", texto: "Gratis · Sin pago", estado: "gratis" }, fecha: "2026-11-12" }
  ],
  // Tutorías: "asignada" (ya es tutora) o "revision" (postulación enviada)
  misTutorias: [
    { tutoria: "basquetbol", disciplina: "Básquetbol", nivel: "Fundamentos", estado: "asignada", horas: 12, estudiantes: 12, proxima: "lunes 23, 4:00 p. m.", dias: ["Lun", "Mié"], fecha: "2026-11-03" }
  ],
  motivosCancelacion: ["Cambio de planes", "Clima", "Lesión", "Otro"],

  /* ---------- Tutorías deportivas (29 a 32) ---------- */
  horasPorCiclo: 40,
  tutorias: [
    { id: "basquetbol", disciplina: "Básquetbol", nivel: "Fundamentos", dias: "Lun y mié", hora: "4:00 p. m.", cupos: 3 },
    { id: "voleibol", disciplina: "Voleibol", nivel: "Iniciación", dias: "Mar y jue", hora: "5:00 p. m.", cupos: 2 },
    { id: "futbol", disciplina: "Fútbol", nivel: "Técnica básica", dias: "Vie", hora: "3:00 p. m.", cupos: 4 }
  ],
  requisitosTutor: [
    "Ser estudiante activo de la UCA",
    "Tener experiencia en la disciplina",
    "Disponibilidad de 4 horas por semana",
    "Asistir a la inducción del Polideportivo"
  ],

  // Cuenta para pagos por transferencia (DATO DE EJEMPLO: cambiar por la real)
  banco: {
    nombre: "Banco Agrícola",
    cuenta: "0000 000000 0 · Corriente",
    titular: "Universidad Centroamericana"
  },

  /* ---------- Avisos (16) ----------
     categoria: reservas, eventos o tutorias. "ir" es la pantalla que abre. */
  avisos: [
    { id: "a1", grupo: "HOY", categoria: "reservas", icono: "visto", titulo: "Reserva confirmada", texto: "Cancha de voleibol · Mié 18, 3:00 p. m.", tiempo: "5 min", leido: false, ir: "mis-reservas" },
    { id: "a2", grupo: "HOY", categoria: "tutorias", icono: "estrella", titulo: "Tu postulación avanzó", texto: "Ya eres tutora de básquetbol.", tiempo: "1 h", leido: false, ir: "mis-tutorias" },
    { id: "a3", grupo: "ESTA SEMANA", categoria: "eventos", icono: "trofeo", titulo: "Nuevo evento disponible", texto: "Copa interfacultades · hasta el 19 nov.", tiempo: "Lun", leido: true, ir: "evento/copa-interfacultades" },
    { id: "a4", grupo: "ESTA SEMANA", categoria: "reservas", icono: "reloj", titulo: "Recordatorio de reserva", texto: "Tu cancha de básquetbol es el viernes.", tiempo: "Dom", leido: true, ir: "mis-reservas" },
    { id: "a5", grupo: "ESTA SEMANA", categoria: "reservas", icono: "calendario", titulo: "Horario bloqueado", texto: "Cancha de fútbol en mantenimiento.", tiempo: "Sáb", leido: true, ir: "detalle-cancha/futbol" }
  ],

  /* ==========================================================
     USUARIO EXTERNO (pantallas 41 a 59) · todo es de ejemplo
     ========================================================== */
  externo: {
    nombre: "Carlos Hernández",
    nombreVisible: "Carlos Hernández",
    foto: "",
    correo: "carlos.hdz@gmail.com",
    dui: "05678912-3",
    telefono: "7890-1234",
    organizacion: "Club Deportivo Los Pinos",
    tarjeta: { marca: "Visa", ultimos: "1234" } // tarjeta guardada (solo marca y últimos 4)
  },

  horasMaximas: 2, // un usuario externo puede pedir hasta 2 horas seguidas
  tiposActividad: ["Entrenamiento", "Torneo", "Evento comunitario", "Otro"],

  // Solicitudes de espacio. estado: "revision", "aprobada" o "rechazada"
  solicitudes: [
    {
      codigo: "SOL-1187", cancha: "futbol", fecha: "2026-11-18", hora: "15:00", fin: "17:00", horas: 2, personas: 18,
      nombre: "Carlos Hernández", dui: "05678912-3", organizacion: "Club Deportivo Los Pinos",
      tipo: "Entrenamiento", descripcion: "Entrenamiento semanal de nuestro equipo juvenil de fútbol: 18 jugadores y 2 entrenadores.",
      extra: true, total: 35, pago: { tipo: "tarjeta", texto: "Visa •••• 1234", fecha: "2026-11-17" },
      enviada: "2026-11-17", estado: "revision"
    },
    {
      codigo: "SOL-1102", reserva: "R-4990", cancha: "voleibol", fecha: "2026-11-07", hora: "9:00", fin: "11:00", horas: 2, personas: 10,
      nombre: "Carlos Hernández", dui: "05678912-3", organizacion: "Club Deportivo Los Pinos",
      tipo: "Torneo", descripcion: "Torneo relámpago de voleibol entre los equipos del club.",
      extra: false, total: 30, pago: { tipo: "tarjeta", texto: "Visa •••• 1234", fecha: "2026-11-05" },
      enviada: "2026-11-04", estado: "aprobada"
    },
    {
      codigo: "SOL-1150", cancha: "basquetbol", fecha: "2026-10-31", hora: "14:00", fin: "15:00", horas: 1, personas: 8,
      nombre: "Carlos Hernández", dui: "05678912-3", organizacion: "",
      tipo: "Entrenamiento", descripcion: "Práctica de tiros y fundamentos con amigos del barrio.",
      extra: false, total: 15, pago: { tipo: "tarjeta", texto: "Visa •••• 1234", fecha: "2026-10-29" },
      enviada: "2026-10-29", estado: "rechazada",
      motivoRechazo: "El espacio fue asignado a una actividad institucional en ese horario.",
      reembolso: { estado: "acreditado", fecha: "2026-11-02" }
    }
  ],

  // Eventos y clases abiertos a la comunidad (51 a 55, TK y GM)
  eventosExternos: [
    {
      id: "copa-comunitaria", tipo: "evento", deporte: "Fútbol", sobre: "FÚTBOL · ABIERTO AL PÚBLICO",
      titulo: "Copa amistosa<br>comunitaria", corto: "Copa amistosa comunitaria", subtitulo: "Equipos invitados de la comunidad",
      resumen: "Abierto al público", fecha: "2026-11-22", hora: "9:00 a. m.", cupo: { inscritos: 20, total: 60 }, costo: 0,
      foto: "Fotografia futbol.jpg", confirmacion: "¡Nos vemos en<br>la copa!"
    },
    {
      id: "torneo-abierto", tipo: "evento", deporte: "Voleibol", sobre: "VOLEIBOL · TORNEO ABIERTO",
      titulo: "Torneo de<br>voleibol abierto", corto: "Torneo de voleibol abierto", subtitulo: "Equipos de 4 personas",
      resumen: "Equipos de 4 personas", fecha: "2026-11-23", hora: "8:00 a. m.", cupo: { inscritos: 6, total: 16 }, costo: 5,
      foto: "Fotografia voleibol.jpg", confirmacion: "¡Nos vemos en<br>el torneo!"
    },
    {
      id: "clinica-basquetbol", tipo: "evento", deporte: "Básquetbol", sobre: "BÁSQUETBOL · CLÍNICA",
      titulo: "Clínica de<br>básquetbol", corto: "Clínica de básquetbol", subtitulo: "Para jóvenes de 12 a 17 años",
      resumen: "Para jóvenes de 12 a 17 años", fecha: "2026-11-29", hora: "10:00 a. m.", cupo: { inscritos: 11, total: 20 }, costo: 8,
      foto: "Fotografia basquetbol.jpg", confirmacion: "¡Nos vemos en<br>la clínica!"
    },
    {
      id: "clase-taekwondo", tipo: "clase", deporte: "Taekwondo", sobre: "TAEKWONDO · CLASES ABIERTAS",
      titulo: "Clases de<br>taekwondo", corto: "Clases de taekwondo", subtitulo: "Clases con instructor · todos los niveles",
      dias: "Lun y mié", diasLargo: "los lunes y miércoles", diasNumero: [1, 3], hora: "5:00 p. m.",
      cupo: { inscritos: 6, total: 16 }, costo: 4, foto: "Fotografia taekwondo.jpg", confirmacion: "¡Nos vemos en<br>la clase!"
    },
    {
      id: "clase-gimnasio", tipo: "clase", deporte: "Gimnasio", sobre: "GIMNASIO · ENTRENAMIENTO ABIERTO",
      titulo: "Entrenamiento<br>de gimnasio", corto: "Entrenamiento de gimnasio", subtitulo: "Entrenamiento con instructor · todos los niveles",
      dias: "Mar y jue", diasLargo: "los martes y jueves", diasNumero: [2, 4], hora: "4:30 p. m.",
      cupo: { inscritos: 8, total: 20 }, costo: 4, foto: "Fotografia gimnasio.jpg", confirmacion: "¡Nos vemos en<br>el gimnasio!"
    }
  ],
  inscripcionesExternas: [],

  avisosExterno: [
    { id: "e1", grupo: "HOY", categoria: "reservas", icono: "reloj", titulo: "Solicitud en revisión", texto: "Cancha de fútbol · Mié 18, 3:00 p. m.", tiempo: "1 h", leido: false, ir: "detalle-solicitud/SOL-1187" },
    { id: "e2", grupo: "ESTA SEMANA", categoria: "eventos", icono: "trofeo", titulo: "Nuevo evento abierto", texto: "Copa amistosa comunitaria · Dom 22 nov.", tiempo: "Lun", leido: true, ir: "evento-externo/copa-comunitaria" },
    { id: "e3", grupo: "ANTERIORES", categoria: "reservas", icono: "visto", titulo: "Solicitud aprobada", texto: "Cancha de voleibol · Sáb 7 nov, 9:00 a. m.", tiempo: "5 nov", leido: true, ir: "solicitud-aprobada/SOL-1102" },
    { id: "e4", grupo: "ANTERIORES", categoria: "reservas", icono: "alerta", titulo: "Solicitud no aprobada", texto: "Reembolso de $15.00 acreditado.", tiempo: "2 nov", leido: true, ir: "solicitud-rechazada/SOL-1150" }
  ],

  // Noticia (17)
  noticia: {
    etiqueta: "NUEVAS ACTIVIDADES",
    titulo: "Más movimiento,<br>más comunidad",
    fecha: "16 NOV 2026 · POLIDEPORTIVO UCA",
    texto: "Este ciclo abrimos nuevos entrenamientos para que más estudiantes se sumen al deporte, sin importar su nivel.",
    foto: "Fotografia de noticia.jpg",
    entrenamientos: ["Voleibol · Mar y jue · 5:00 p. m.", "Básquetbol · Lun y mié · 4:00 p. m.", "Fútbol · Vie · 3:00 p. m."]
  }
};
