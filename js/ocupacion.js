/* ==========================================================
   ocupacion.js — Quién ocupa cada espacio y a qué hora.
   Está en un solo lugar para que el estudiante, el usuario
   externo y la administración vean lo mismo:
   - si administración bloquea una hora, nadie la puede reservar;
   - si cancela una reserva, la hora vuelve a quedar libre.
   ========================================================== */

const OCUPACION = (() => {
  // El Polideportivo abre de 6:00 a 20:00 (14 horas)
  const HORAS = Array.from({ length: 14 }, (_, i) => `${String(6 + i).padStart(2, "0")}:00`);
  const NOMBRES = ["Diego Flores", "Sofía Rivas", "Laura Ramos", "José Campos", "Valeria Gómez", "Mario Hernández", "Daniela Cruz"];
  const ACTIVIDADES = ["Partido amistoso", "Entrenamiento", "Práctica libre"];
  const IDS = Object.keys(DATOS.canchas);

  const num = (hora) => Number(String(hora).split(":")[0]);
  const hh = (n) => `${String(n).padStart(2, "0")}:00`;
  const horasDe = (inicio, cuantas) => Array.from({ length: cuantas }, (_, i) => num(inicio) + i);
  const cerrado = (fecha) => DATOS.diasCerrados.includes(fecha.getDay()) || DATOS.mantenimiento.includes(FECHA.clave(fecha));
  const todasSolicitudes = () => [...DATOS.solicitudes, ...DATOS.solicitudesOtras];

  /* La reserva de otro estudiante (de ejemplo) que hay cada día en cada espacio */
  function otraReserva(id, fecha) {
    if (cerrado(fecha)) return null;
    const cancha = DATOS.canchas[id];
    const i = IDS.indexOf(id);
    const hora = cancha.horas[(fecha.getDate() + 4) % cancha.horas.length];
    const codigo = `R-3${String(fecha.getDate()).padStart(2, "0")}${i}`;
    const cancelada = DATOS.reservasCanceladas[codigo];
    return {
      codigo,
      cancha: id,
      nombre: cancha.nombre,
      fecha: FECHA.clave(fecha),
      hora,
      fin: hh(num(hora) + 1),
      actividad: ACTIVIDADES[(fecha.getDate() + i) % ACTIVIDADES.length],
      personas: Math.min(cancha.capacidad, 4 + ((fecha.getDate() + i) % 8)),
      usuario: NOMBRES[(fecha.getDate() + i) % NOMBRES.length],
      estado: cancelada ? "cancelada" : "confirmada",
      motivo: cancelada ? cancelada.motivo : ""
    };
  }

  const bloqueoEn = (id, clave, hora) =>
    DATOS.bloqueos.find((b) => b.cancha === id && b.fecha === clave && horasDe(b.hora, b.horas).includes(num(hora)));

  // Solicitudes externas aprobadas o en revisión (las pendientes también apartan la hora)
  const solicitudEn = (id, clave, hora) =>
    todasSolicitudes().find(
      (s) => s.cancha === id && s.fecha === clave && (s.estado === "aprobada" || s.estado === "revision") && horasDe(s.hora, s.horas).includes(num(hora))
    );

  const reservaEstudianteEn = (id, clave, hora) =>
    UCA.reservas.find((r) => r.cancha === id && r.fecha === clave && r.estado === "confirmada" && num(r.hora) === num(hora));

  /* ¿Alguien más (otro estudiante, un externo o un bloqueo) ocupa esa hora? */
  function ocupadaPorOtros(id, fecha, hora) {
    const otra = otraReserva(id, fecha);
    const clave = FECHA.clave(fecha);
    return Boolean((otra && otra.estado === "confirmada" && num(otra.hora) === num(hora)) || bloqueoEn(id, clave, hora) || solicitudEn(id, clave, hora));
  }

  /* Clases de la universidad en las horas que no se reservan (solo se ven en administración) */
  const claseUCA = (id, fecha, hora) =>
    !DATOS.canchas[id].horas.some((h) => num(h) === num(hora)) && (fecha.getDate() + num(hora) + IDS.indexOf(id)) % 3 !== 0;

  /* Estado de una hora, para administración */
  function estado(id, fecha, hora) {
    const clave = FECHA.clave(fecha);
    if (cerrado(fecha)) {
      return { tipo: "bloqueado", texto: DATOS.diasCerrados.includes(fecha.getDay()) ? "Cerrado · solo eventos" : "Día de mantenimiento" };
    }
    const bloqueo = bloqueoEn(id, clave, hora);
    if (bloqueo) return { tipo: "bloqueado", texto: `Bloqueado · ${bloqueo.motivo}`, bloqueo };
    const propia = reservaEstudianteEn(id, clave, hora);
    if (propia) return { tipo: "ocupado", texto: `${DATOS.estudiante.nombre} · ${propia.actividad}`, codigo: propia.codigo };
    const otra = otraReserva(id, fecha);
    if (otra && otra.estado === "confirmada" && num(otra.hora) === num(hora)) return { tipo: "ocupado", texto: `${otra.usuario} · ${otra.actividad}`, codigo: otra.codigo };
    const solicitud = solicitudEn(id, clave, hora);
    if (solicitud) {
      return solicitud.estado === "revision"
        ? { tipo: "pendiente", texto: `${solicitud.nombre} · Solicitud pendiente`, codigo: solicitud.codigo }
        : { tipo: "ocupado", texto: `${solicitud.nombre} · ${solicitud.tipo}`, codigo: solicitud.reserva || solicitud.codigo };
    }
    if (claseUCA(id, fecha, hora)) return { tipo: "ocupado", texto: "Clases UCA" };
    return { tipo: "libre", texto: "Libre" };
  }

  /* Porcentaje del día ocupado (horas ocupadas o pendientes de 14) */
  function porcentaje(id, fecha) {
    if (cerrado(fecha)) return 0;
    const ocupadas = HORAS.filter((h) => ["ocupado", "pendiente"].includes(estado(id, fecha, h).tipo)).length;
    return Math.round((ocupadas / HORAS.length) * 100);
  }

  /* Todas las reservas de un día, para la lista de administración */
  function reservasDel(fecha) {
    const clave = FECHA.clave(fecha);
    const lista = [];
    IDS.forEach((id) => {
      UCA.reservas
        .filter((r) => r.cancha === id && r.fecha === clave)
        .forEach((r) =>
          lista.push({
            codigo: r.codigo, cancha: id, fecha: clave, hora: r.hora, horas: Math.max(1, num(r.fin) - num(r.hora)),
            tipo: "estudiante", usuario: DATOS.estudiante.nombre, detalle: r.actividad, personas: r.personas,
            estado: r.estado === "cancelada" ? "cancelada" : "confirmada", motivo: r.motivo || "", origen: "propia", fuente: r
          })
        );
      const otra = otraReserva(id, fecha);
      if (otra) {
        lista.push({
          codigo: otra.codigo, cancha: id, fecha: clave, hora: otra.hora, horas: 1,
          tipo: "estudiante", usuario: otra.usuario, detalle: otra.actividad, personas: otra.personas,
          estado: otra.estado, motivo: otra.motivo, origen: "ejemplo", fuente: otra
        });
      }
      todasSolicitudes()
        .filter((s) => s.cancha === id && s.fecha === clave && (s.estado !== "rechazada" || s.canceladaPorAdmin))
        .forEach((s) =>
          lista.push({
            codigo: s.reserva || s.codigo, cancha: id, fecha: clave, hora: s.hora, horas: s.horas,
            tipo: "externo", usuario: s.nombre, detalle: s.organizacion || s.tipo, personas: s.personas,
            estado: s.estado === "aprobada" ? "confirmada" : s.estado === "revision" ? "pendiente" : "cancelada",
            motivo: s.motivoRechazo || "", origen: "solicitud", fuente: s
          })
        );
      DATOS.bloqueos
        .filter((b) => b.cancha === id && b.fecha === clave)
        .forEach((b) =>
          lista.push({
            codigo: b.codigo, cancha: id, fecha: clave, hora: b.hora, horas: b.horas,
            tipo: "bloqueo", usuario: "", detalle: b.motivo, personas: 0, estado: "bloqueo", origen: "bloqueo", fuente: b
          })
        );
    });
    return lista.sort((a, b) => num(a.hora) - num(b.hora) || a.cancha.localeCompare(b.cancha));
  }

  /* Busca una reserva por su código (en este mes y en las listas guardadas) */
  function buscarReserva(codigo) {
    const ejemplo = /^R-3(\d\d)\d$/.exec(codigo || "");
    let fecha = null;
    if (ejemplo) fecha = new Date(DATOS.hoy.getFullYear(), DATOS.hoy.getMonth(), Number(ejemplo[1]));
    const propia = UCA.reservas.find((r) => r.codigo === codigo);
    const solicitud = todasSolicitudes().find((s) => s.reserva === codigo || s.codigo === codigo);
    const bloqueo = DATOS.bloqueos.find((b) => b.codigo === codigo);
    const fuente = propia || solicitud || bloqueo;
    if (fuente) fecha = FECHA.leer(fuente.fecha);
    if (!fecha) return null;
    return reservasDel(fecha).find((r) => r.codigo === codigo) || null;
  }

  return { HORAS, IDS, num, hh, horasDe, cerrado, todasSolicitudes, otraReserva, bloqueoEn, solicitudEn, ocupadaPorOtros, estado, porcentaje, reservasDel, buscarReserva };
})();
