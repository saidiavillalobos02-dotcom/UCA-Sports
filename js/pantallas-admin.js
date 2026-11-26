/* ==========================================================
   pantallas-admin.js — Panel de administración
   60 · Panel de control
   61 · Reservas  62 · Filtrar (hoja)  63 · Detalle
   64 · Cancelar (hoja)  65 · Reserva cancelada
   66 · Solicitudes externas  67 · Detalle  68 · Rechazar (hoja)
   69 · Solicitud aprobada  70 · Solicitud rechazada
   71 · Ocupación  72 · Calendario  73 · Bloquear (hoja)  74 · Bloqueado
   75 · Actividades y eventos  76 · Crear (y editar) evento
   77 · Evento publicado  78 · Detalle  79 · Inscritos
   80 · Tutorías  81 · Postulación  82 · Registrar horas  83 · Registradas
   Todo lo que se hace aquí cambia lo que ven el estudiante y el
   usuario externo (reservas, solicitudes, horarios, eventos y horas).
   ========================================================== */

(() => {
  const HOY = new Date(DATOS.hoy.getFullYear(), DATOS.hoy.getMonth(), DATOS.hoy.getDate());
  const NAV = UI.NAV_ADMIN;
  const O = OCUPACION;

  /* ---------- Ayudas generales ---------- */
  const dinero = (cantidad) => `$${cantidad.toFixed(2)}`;
  const mayuscula = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);
  const iniciales = (nombre) =>
    nombre
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join("");
  const fechaLarga = (fecha) => `${FECHA.DIAS[fecha.getDay()]} ${fecha.getDate()} de ${FECHA.MESES[fecha.getMonth()]}`;
  const fechaMedia = (fecha) => `${FECHA.DIAS[fecha.getDay()]} ${fecha.getDate()} ${FECHA.MESES_CORTOS[fecha.getMonth()]}`;
  const fila = (nombre, valor) => `<div class="resumen__fila"><span class="resumen__nombre">${nombre}</span><span class="resumen__valor">${valor}</span></div>`;
  const caja = (icono, nombre, valor) => `<div class="dato">${UI.icono(icono, 20)}<p class="dato__nombre">${nombre}</p><p class="dato__valor">${valor}</p></div>`;
  const ruta = (texto) => `<p class="app-barra__ruta">${texto}</p>`;
  const recortar = (texto, largo) => (texto.length > largo ? `${texto.slice(0, largo).trim()}…` : texto);
  const conCarga = (boton, texto, alTerminar, espera = 800) => {
    boton.disabled = true;
    boton.classList.add("boton--cargando");
    boton.textContent = texto;
    setTimeout(alTerminar, espera);
  };
  const nuevoCodigo = (prefijo, usados) => {
    let codigo;
    do codigo = `${prefijo}-${1000 + Math.floor(Math.random() * 9000)}`;
    while (usados.includes(codigo));
    return codigo;
  };
  const horaFin = (hora, horas) => O.hh(O.num(hora) + horas);
  const rango = (hora, horas) => `${O.hh(O.num(hora))} – ${horaFin(hora, horas)}`;

  /* Avisos para el estudiante y para el usuario externo */
  const avisarEstudiante = (aviso) => DATOS.avisos.unshift({ id: `adm-${Date.now()}`, grupo: "HOY", tiempo: "Ahora", leido: false, ...aviso });
  const avisarExterno = (aviso) => DATOS.avisosExterno.unshift({ id: `adm-${Date.now()}`, grupo: "HOY", tiempo: "Ahora", leido: false, ...aviso });
  const esDeCarlos = (s) => DATOS.solicitudes.includes(s);

  /* Chips de una sola opción */
  const chipsUnicos = (nombre, opciones, elegida) =>
    opciones
      .map(([valor, texto]) => `<button type="button" class="chip chip--chico${valor === elegida ? " chip--elegido" : ""}" data-${nombre}="${valor}" aria-pressed="${valor === elegida}">${texto}</button>`)
      .join("");
  function activarChips(zona, nombre, alElegir) {
    zona.querySelectorAll(`[data-${nombre}]`).forEach((chip) => {
      chip.addEventListener("click", () => {
        if (chip.disabled) return;
        zona.querySelectorAll(`[data-${nombre}]`).forEach((otro) => {
          otro.classList.toggle("chip--elegido", otro === chip);
          otro.setAttribute("aria-pressed", String(otro === chip));
        });
        alElegir(chip.dataset[nombre]);
      });
    });
  }

  /* Pestañas */
  const pestanas = (opciones, activa) => `
    <div class="pestanas" role="tablist">
      ${opciones
        .map(([valor, texto]) => `<button type="button" class="pestana${valor === activa ? " pestana--activa" : ""}" role="tab" aria-selected="${valor === activa}" data-pestana="${valor}">${texto}</button>`)
        .join("")}
    </div>`;
  function activarPestanas(contenedor, pintar) {
    contenedor.querySelectorAll("[data-pestana]").forEach((boton) => {
      boton.addEventListener("click", () => {
        contenedor.querySelectorAll("[data-pestana]").forEach((otra) => {
          otra.classList.toggle("pestana--activa", otra === boton);
          otra.setAttribute("aria-selected", String(otra === boton));
        });
        pintar(boton.dataset.pestana);
      });
    });
  }

  /* Contador (− número +) */
  const contador = (titulo, texto, valor, nombre) => `
    <div class="contador contador--pantalla">
      <div>
        <p class="contador__titulo">${titulo}</p>
        <p class="contador__texto">${texto}</p>
      </div>
      <div class="contador__control">
        <button type="button" class="contador__boton" data-menos="${nombre}" aria-label="Menos ${titulo.toLowerCase()}">${UI.icono("menos", 18)}</button>
        <output class="contador__valor" data-valor="${nombre}" aria-live="polite">${valor}</output>
        <button type="button" class="contador__boton contador__boton--mas" data-mas="${nombre}" aria-label="Más ${titulo.toLowerCase()}">${UI.icono("mas", 18)}</button>
      </div>
    </div>`;
  function activarContador(zona, nombre, obtener, poner, minimo, maximo, alCambiar = () => {}) {
    const menos = zona.querySelector(`[data-menos="${nombre}"]`);
    const mas = zona.querySelector(`[data-mas="${nombre}"]`);
    const pintar = () => {
      zona.querySelector(`[data-valor="${nombre}"]`).textContent = obtener();
      menos.disabled = obtener() <= minimo();
      mas.disabled = obtener() >= maximo();
    };
    menos.addEventListener("click", () => {
      poner(Math.max(minimo(), obtener() - 1));
      pintar();
      alCambiar();
    });
    mas.addEventListener("click", () => {
      poner(Math.min(maximo(), obtener() + 1));
      pintar();
      alCambiar();
    });
    pintar();
    return pintar;
  }

  /* Hoja de confirmación con motivo y mensaje (cancelar, rechazar) */
  function hojaMotivo({ titulo, texto, motivos, sugerencia, boton, alConfirmar }) {
    let motivo = motivos[0];
    let escrito = false;
    const hoja = UI.abrirHoja(
      `
      <span class="circulo circulo--peligro">${UI.icono("alerta", 26)}</span>
      <h2 class="hoja__titulo sep-s">${titulo}</h2>
      <p class="hoja__texto">${texto}</p>
      <p class="hoja__sobre">MOTIVO</p>
      <div class="chips" data-motivos>${chipsUnicos("motivo", motivos.map((m) => [m, m]), motivo)}</div>
      <div class="campo sep-s">
        <label class="sr-only" for="mensaje-motivo">Mensaje para el usuario</label>
        <div class="campo__caja campo__caja--area">
          <textarea class="campo__entrada campo__area" id="mensaje-motivo" maxlength="200" rows="3">${UI.escapar(sugerencia(motivo))}</textarea>
        </div>
        <p class="campo__error" data-error-mensaje aria-live="polite"></p>
      </div>
      <button type="button" class="boton boton--peligro hoja__boton" data-confirmar>${boton}</button>
      <button type="button" class="boton boton--borde hoja__boton-segundo" data-cerrar-hoja>Volver</button>`,
      titulo
    );
    const area = hoja.querySelector("#mensaje-motivo");
    const confirmar = hoja.querySelector("[data-confirmar]");
    const revisar = () => {
      const corto = area.value.trim().length < 10;
      confirmar.disabled = corto;
      hoja.querySelector("[data-error-mensaje]").innerHTML = corto ? `${UI.icono("alerta", 14)}Escribe un mensaje de al menos 10 letras para el usuario.` : "";
    };
    area.addEventListener("input", () => {
      escrito = true;
      revisar();
    });
    activarChips(hoja.querySelector("[data-motivos]"), "motivo", (valor) => {
      motivo = valor;
      // Si la persona no ha escrito su propio mensaje, se cambia la sugerencia
      if (!escrito) area.value = sugerencia(motivo);
      revisar();
    });
    confirmar.addEventListener("click", () => conCarga(confirmar, "Notificando…", () => alConfirmar(motivo, area.value.trim())));
    revisar();
  }

  const salir = () => {
    const hoja = UI.abrirHoja(
      `
      <h2 class="hoja__titulo">¿Cerrar sesión?</h2>
      <p class="hoja__texto">Tendrás que volver a ingresar con tu correo institucional.</p>
      <button type="button" class="boton boton--peligro hoja__boton" data-salir>Sí, cerrar sesión</button>
      <button type="button" class="boton boton--borde hoja__boton-segundo" data-cerrar-hoja>Cancelar</button>`,
      "Cerrar sesión"
    );
    hoja.querySelector("[data-salir]").addEventListener("click", () => UCA.ir("bienvenida"));
  };

  /* ==========================================================
     Solicitudes externas: ayudas
     ========================================================== */
  const buscarSolicitud = (codigo) => O.todasSolicitudes().find((s) => s.codigo === codigo) || O.todasSolicitudes()[0];
  const contactoDe = (s) => ({
    telefono: s.telefono || (esDeCarlos(s) ? DATOS.externo.telefono : ""),
    correo: s.correo || (esDeCarlos(s) ? DATOS.externo.correo : "")
  });
  const pendientes = () =>
    O.todasSolicitudes()
      .filter((s) => s.estado === "revision")
      .sort((a, b) => `${a.fecha}${O.hh(O.num(a.hora))}`.localeCompare(`${b.fecha}${O.hh(O.num(b.hora))}`));

  /* ¿Choca la solicitud con algo más? Devuelve el texto del choque o "" */
  function conflictoDe(s) {
    const fecha = FECHA.leer(s.fecha);
    if (O.cerrado(fecha)) return "Ese día el Polideportivo no presta espacios";
    for (const n of O.horasDe(s.hora, s.horas)) {
      const hora = O.hh(n);
      const bloqueo = O.bloqueoEn(s.cancha, s.fecha, hora);
      if (bloqueo) return `Bloqueado por ${bloqueo.motivo.toLowerCase()} a las ${hora}`;
      const propia = UCA.reservas.find((r) => r.cancha === s.cancha && r.fecha === s.fecha && r.estado === "confirmada" && O.num(r.hora) === n);
      if (propia) return `Reserva de ${DATOS.estudiante.nombre} a las ${hora}`;
      const otra = O.otraReserva(s.cancha, fecha);
      if (otra && otra.estado === "confirmada" && O.num(otra.hora) === n) return `Reserva de ${otra.usuario} a las ${hora}`;
      const otraSolicitud = O.todasSolicitudes().find(
        (x) => x !== s && x.cancha === s.cancha && x.fecha === s.fecha && x.estado === "aprobada" && O.horasDe(x.hora, x.horas).includes(n)
      );
      if (otraSolicitud) return `Reserva de ${otraSolicitud.nombre} a las ${hora}`;
    }
    return "";
  }

  /* Rechazar (o cancelar) una solicitud externa: reembolso y aviso */
  function rechazarSolicitud(s, motivo, mensaje, porCancelacion = false) {
    s.estado = "rechazada";
    s.motivoAdmin = motivo;
    s.motivoRechazo = mensaje;
    s.reembolso = { estado: "proceso" };
    if (porCancelacion) s.canceladaPorAdmin = true;
    if (esDeCarlos(s)) {
      avisarExterno({
        categoria: "reservas",
        icono: "alerta",
        titulo: porCancelacion ? "Administración canceló tu reserva" : "Solicitud no aprobada",
        texto: `${DATOS.canchas[s.cancha].nombre} · Reembolso de ${dinero(s.total)} en proceso.`,
        ir: `solicitud-rechazada/${s.codigo}`
      });
    }
  }

  /* Cancelar cualquier reserva (de estudiante, de ejemplo o externa) */
  function cancelarReserva(r, motivo, mensaje) {
    const cancha = DATOS.canchas[r.cancha];
    if (r.origen === "propia") {
      r.fuente.estado = "cancelada";
      r.fuente.motivo = motivo;
      avisarEstudiante({
        categoria: "reservas",
        icono: "alerta",
        titulo: "Administración canceló tu reserva",
        texto: `${cancha.nombre} · ${FECHA.mini(FECHA.leer(r.fecha))}. ${mensaje}`,
        ir: `detalle-reserva/${r.codigo}`
      });
    } else if (r.origen === "ejemplo") {
      DATOS.reservasCanceladas[r.codigo] = { motivo, mensaje };
    } else if (r.origen === "solicitud") {
      rechazarSolicitud(r.fuente, motivo, mensaje, true);
    }
  }

  /* ==========================================================
     60 · Panel de control
     ========================================================== */
  UCA.registrar("admin-inicio", {
    dibujar() {
      const deHoy = O.reservasDel(HOY).filter((r) => r.tipo !== "bloqueo" && r.estado !== "cancelada");
      const porEspacio = O.IDS.map((id) => [id, O.porcentaje(id, HOY)]);
      const promedio = Math.round(porEspacio.reduce((suma, [, p]) => suma + p, 0) / porEspacio.length);
      const lista = pendientes();
      return `
        <section class="pantalla pantalla--app pantalla--gris">
          <div class="app-contenido">
            ${ruta("UCA SPORTS / ADMINISTRACIÓN")}
            <div class="admin-cabecera">
              <h1 class="titulo">Panel de<br>control</h1>
              <button type="button" class="admin-salir" data-salir>Cerrar sesión</button>
            </div>
            <p class="detalle__lugar admin-fecha">${mayuscula(fechaLarga(HOY))} · Polideportivo UCA</p>
            <div class="resumen-cajas">
              <a class="resumen-caja" href="#/admin-reservas" data-ir="admin-reservas"><strong>${deHoy.length}</strong>Reservas hoy</a>
              <a class="resumen-caja resumen-caja--morada" href="#/admin-solicitudes" data-ir="admin-solicitudes"><strong>${lista.length}</strong>Solicitudes pendientes</a>
              <a class="resumen-caja" href="#/admin-ocupacion" data-ir="admin-ocupacion"><strong>${promedio}%</strong>Ocupación de hoy</a>
            </div>
            <div>
              <div class="encabezado-lista">
                <p class="titulo-seccion">Ocupación de hoy</p>
                ${UI.enlace("Ver espacios", "admin-ocupacion")}
              </div>
              <div class="barras-ocupacion sep-s">
                ${porEspacio
                  .map(
                    ([id, p]) => `
                  <div class="barra-ocupacion">
                    <span class="barra-ocupacion__nombre">${DATOS.canchas[id].corto}</span>
                    <span class="barra-ocupacion__pista" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p}" aria-label="${DATOS.canchas[id].nombre}"><span style="width:${p}%"></span></span>
                    <span class="barra-ocupacion__valor">${p}%</span>
                  </div>`
                  )
                  .join("")}
              </div>
            </div>
            <div>
              <div class="encabezado-lista">
                <p class="titulo-seccion">Solicitudes pendientes</p>
                ${UI.enlace("Ver todas", "admin-solicitudes")}
              </div>
              <div class="lista-tarjetas sep-s">
                ${lista.length ? lista.slice(0, 2).map(tarjetaSolicitud).join("") : `<p class="lista-vacia">No hay solicitudes por revisar. ¡Todo al día!</p>`}
              </div>
            </div>
          </div>
          ${UI.navInferior("admin-inicio", NAV)}
        </section>`;
    },
    alMostrar(contenedor) {
      contenedor.querySelector("[data-salir]").addEventListener("click", salir);
    }
  });

  function tarjetaSolicitud(s) {
    const insignias = { revision: ["Pendiente", " etiqueta--aviso"], aprobada: ["Aprobada", ""], rechazada: ["Rechazada", " etiqueta--rechazada"] };
    const [texto, clase] = insignias[s.estado];
    const pago = s.pago.tipo === "transferencia" && s.estado === "revision" ? `Comprobante ${dinero(s.total)}` : s.estado === "rechazada" ? `Reembolso ${dinero(s.total)}` : `Pagado ${dinero(s.total)}`;
    return `
      <a class="solicitud-admin" href="#/admin-solicitud/${s.codigo}" data-ir="admin-solicitud/${s.codigo}">
        <span class="solicitud-admin__arriba"><span class="etiqueta${clase}">${texto}</span><span class="solicitud-admin__pago">${pago}</span></span>
        <span class="solicitud-admin__nombre">${UI.escapar(s.nombre)}</span>
        <span class="solicitud-admin__texto">${DATOS.canchas[s.cancha].nombre} · ${FECHA.mini(FECHA.leer(s.fecha))} · ${s.hora}</span>
        <span class="solicitud-admin__cita">“${UI.escapar(recortar(s.descripcion, 42))}”</span>
        ${UI.icono("flecha", 22)}
      </a>`;
  }

  /* ==========================================================
     61 · Reservas (y 62 · Filtrar)
     ========================================================== */
  const FILTRO_INICIAL = { rango: "hoy", espacio: "todos", usuario: "todos", estado: "todos" };
  const filtro = () => UCA.sesion.filtroAdmin || (UCA.sesion.filtroAdmin = { ...FILTRO_INICIAL });

  function diasDel(rango) {
    if (rango === "hoy") return [HOY];
    if (rango === "semana") {
      const lunes = FECHA.lunesDe(HOY);
      return Array.from({ length: 7 }, (_, i) => FECHA.sumarDias(lunes, i));
    }
    const dias = new Date(HOY.getFullYear(), HOY.getMonth() + 1, 0).getDate();
    return Array.from({ length: dias }, (_, i) => new Date(HOY.getFullYear(), HOY.getMonth(), i + 1));
  }

  function reservasFiltradas(f) {
    return diasDel(f.rango)
      .flatMap((fecha) => O.reservasDel(fecha))
      .filter((r) => f.espacio === "todos" || r.cancha === f.espacio)
      .filter((r) => f.usuario === "todos" || r.tipo === f.usuario)
      .filter((r) => f.estado === "todos" || r.estado === f.estado || (f.estado === "confirmada" && r.estado === "bloqueo"));
  }

  const textoRango = (rango) => {
    if (rango === "hoy") return fechaLarga(HOY);
    if (rango === "semana") {
      const lunes = FECHA.lunesDe(HOY);
      const domingo = FECHA.sumarDias(lunes, 6);
      return `${lunes.getDate()} – ${domingo.getDate()} ${FECHA.MESES_CORTOS[domingo.getMonth()]}`;
    }
    return `${FECHA.MESES[HOY.getMonth()]} ${HOY.getFullYear()}`;
  };

  function filaReserva(r) {
    const cancha = DATOS.canchas[r.cancha];
    let insignia;
    if (r.estado === "pendiente") insignia = `<span class="etiqueta etiqueta--aviso">Pendiente</span>`;
    else if (r.estado === "cancelada") insignia = `<span class="etiqueta etiqueta--cancelada">Cancelada</span>`;
    else if (r.tipo === "bloqueo") insignia = `<span class="etiqueta etiqueta--gris">Bloqueo</span>`;
    else if (r.tipo === "externo") insignia = `<span class="etiqueta etiqueta--oscura">Externo</span>`;
    else insignia = `<span class="etiqueta">Estudiante</span>`;
    const ir = r.tipo === "bloqueo" ? `admin-calendario/${r.cancha}` : r.estado === "pendiente" ? `admin-solicitud/${r.fuente.codigo}` : `admin-reserva/${r.codigo}`;
    return `
      <a class="reserva-fila${r.tipo === "bloqueo" || r.estado === "cancelada" ? " reserva-fila--apagada" : ""}" href="#/${ir}" data-ir="${ir}">
        <span class="reserva-fila__hora"><strong>${O.hh(O.num(r.hora))}</strong><small>${r.horas} h</small></span>
        <span class="reserva-fila__cuerpo">
          <span class="reserva-fila__titulo">${cancha.nombre}</span>
          <span class="reserva-fila__texto">${r.tipo === "bloqueo" ? r.detalle : `${UI.escapar(r.usuario)} · ${UI.escapar(r.detalle)}`}</span>
        </span>
        ${insignia}
      </a>`;
  }

  UCA.registrar("admin-reservas", {
    dibujar() {
      const f = filtro();
      return `
        <section class="pantalla pantalla--app pantalla--gris">
          <div class="app-contenido">
            ${ruta("UCA SPORTS / RESERVAS")}
            <h1 class="titulo">Todas las<br>reservas</h1>
            <div class="admin-filtros">
              <div class="chips">${chipsUnicos("rango", [["hoy", "Hoy"], ["semana", "Semana"], ["mes", "Mes"]], f.rango)}</div>
              <button type="button" class="admin-filtros__boton" data-filtros>${UI.icono("filter_list", 18)}Filtros<span class="admin-filtros__punto" data-punto hidden></span></button>
            </div>
            <p class="admin-conteo" data-conteo></p>
            <div class="lista-tarjetas" data-lista></div>
          </div>
          ${UI.navInferior("admin-reservas", NAV)}
        </section>`;
    },
    alMostrar(contenedor) {
      const f = filtro();
      const pintar = () => {
        const lista = reservasFiltradas(f);
        const reservas = lista.filter((r) => r.tipo !== "bloqueo").length;
        contenedor.querySelector("[data-conteo]").textContent = `${reservas} ${reservas === 1 ? "reserva" : "reservas"} · ${textoRango(f.rango)}`;
        contenedor.querySelector("[data-punto]").hidden = f.espacio === "todos" && f.usuario === "todos" && f.estado === "todos";
        if (!lista.length) {
          contenedor.querySelector("[data-lista]").innerHTML = `<p class="lista-vacia">No hay reservas con estos filtros.</p>`;
          return;
        }
        let dia = "";
        contenedor.querySelector("[data-lista]").innerHTML = lista
          .map((r) => {
            let cabecera = "";
            if (f.rango !== "hoy" && r.fecha !== dia) {
              dia = r.fecha;
              cabecera = `<p class="admin-dia">${mayuscula(fechaMedia(FECHA.leer(r.fecha)))}</p>`;
            }
            return cabecera + filaReserva(r);
          })
          .join("");
      };
      activarChips(contenedor, "rango", (valor) => {
        f.rango = valor;
        pintar();
      });
      contenedor.querySelector("[data-filtros]").addEventListener("click", () =>
        hojaFiltros(f, () => {
          contenedor.querySelectorAll("[data-rango]").forEach((chip) => {
            chip.classList.toggle("chip--elegido", chip.dataset.rango === f.rango);
            chip.setAttribute("aria-pressed", String(chip.dataset.rango === f.rango));
          });
          pintar();
        })
      );
      pintar();
    }
  });

  /* ---------- 62 · Filtrar reservas (hoja) ---------- */
  function hojaFiltros(f, alAplicar) {
    const borrador = { ...f };
    const grupos = [
      ["espacio", "ESPACIO", [["todos", "Todos"], ...O.IDS.map((id) => [id, DATOS.canchas[id].corto])]],
      ["usuario", "TIPO DE USUARIO", [["todos", "Todos"], ["estudiante", "Estudiantes"], ["externo", "Externos"], ["bloqueo", "Bloqueos"]]],
      ["estado", "ESTADO", [["todos", "Todos"], ["confirmada", "Confirmada"], ["pendiente", "Pendiente"], ["cancelada", "Cancelada"]]],
      ["rango", "FECHA", [["hoy", "Hoy"], ["semana", "Esta semana"], ["mes", "Este mes"]]]
    ];
    const hoja = UI.abrirHoja(
      `
      <h2 class="hoja__titulo">Filtrar reservas</h2>
      ${grupos.map(([clave, titulo, opciones]) => `<p class="hoja__sobre">${titulo}</p><div class="chips" data-grupo="${clave}">${chipsUnicos(clave, opciones, borrador[clave])}</div>`).join("")}
      <button type="button" class="boton hoja__boton" data-aplicar></button>
      <button type="button" class="enlace hoja__enlace" data-limpiar>Limpiar filtros</button>`,
      "Filtrar reservas"
    );
    const aplicar = hoja.querySelector("[data-aplicar]");
    const contar = () => {
      const n = reservasFiltradas(borrador).length;
      aplicar.textContent = `Aplicar filtros · ${n} ${n === 1 ? "resultado" : "resultados"}`;
    };
    grupos.forEach(([clave]) =>
      activarChips(hoja.querySelector(`[data-grupo="${clave}"]`), clave, (valor) => {
        borrador[clave] = valor;
        contar();
      })
    );
    aplicar.addEventListener("click", () => {
      Object.assign(f, borrador);
      UI.cerrarHoja();
      alAplicar();
    });
    hoja.querySelector("[data-limpiar]").addEventListener("click", () => {
      Object.assign(f, FILTRO_INICIAL);
      UI.cerrarHoja();
      alAplicar();
    });
    contar();
  }

  /* ==========================================================
     63 · Detalle de reserva (y 64 · Cancelar, 65 · Cancelada)
     ========================================================== */
  function datosUsuario(r) {
    if (r.tipo === "externo") {
      const s = r.fuente;
      const c = contactoDe(s);
      return { nombre: s.nombre, texto: [s.organizacion, c.telefono].filter(Boolean).join(" · ") || `DUI ${s.dui}`, correo: c.correo, tipo: "Externo" };
    }
    if (r.origen === "propia") {
      const e = DATOS.estudiante;
      return { nombre: e.nombre, texto: `${e.carrera} · ${e.carnet}`, correo: e.correo, tipo: "Estudiante" };
    }
    const correo = `${r.usuario.split(" ")[0].toLowerCase()}.${r.codigo.toLowerCase()}@uca.edu.sv`;
    return { nombre: r.usuario, texto: "Estudiante UCA · reserva gratuita", correo, tipo: "Estudiante" };
  }

  const tarjetaUsuario = (u) => `
    <div class="usuario-tarjeta">
      <span class="inicial${u.tipo === "Externo" ? " inicial--oscura" : ""}">${iniciales(u.nombre)}</span>
      <span class="usuario-tarjeta__cuerpo"><span class="usuario-tarjeta__nombre">${UI.escapar(u.nombre)}</span><span class="usuario-tarjeta__texto">${UI.escapar(u.texto)}</span></span>
      <span class="etiqueta${u.tipo === "Externo" ? " etiqueta--oscura" : ""}">${u.tipo}</span>
    </div>`;

  UCA.registrar("admin-reserva", {
    dibujar(dato) {
      const r = O.buscarReserva(dato) || O.reservasDel(HOY).find((x) => x.tipo !== "bloqueo");
      const cancha = DATOS.canchas[r.cancha];
      const u = datosUsuario(r);
      const cancelada = r.estado === "cancelada";
      const futura = FECHA.leer(r.fecha) >= HOY;
      const linea = r.tipo === "externo" ? `${r.codigo} · Pagada ${dinero(r.fuente.total)} · ${r.fuente.pago.texto}` : `${r.codigo} · Sin costo · Estudiante UCA`;
      const motivo =
        r.tipo === "externo"
          ? `<div class="motivo-caja"><p class="motivo-caja__sobre">MOTIVO · ${UI.escapar(r.fuente.tipo).toUpperCase()}</p><p>${UI.escapar(r.fuente.descripcion)}</p></div>`
          : `<div class="motivo-caja"><p class="motivo-caja__sobre">ACTIVIDAD</p><p>${UI.escapar(r.detalle)}</p></div>`;
      let pie = "";
      if (!cancelada && futura) {
        pie = `<div class="app-pie">
            <a class="boton" href="mailto:${u.correo}?subject=${encodeURIComponent(`Tu reserva ${r.codigo} en el Polideportivo UCA`)}">Contactar al usuario</a>
            <button type="button" class="boton boton--borde-rojo hoja__boton-segundo" data-cancelar>Cancelar reserva</button>
          </div>`;
      }
      return `
        <section class="pantalla pantalla--app pantalla--gris">
          ${UI.barraVolver(`RESERVAS / ${r.codigo}`)}
          <div class="app-contenido detalle">
            <div class="detalle__foto detalle__foto--reserva">
              <img src="img/${encodeURI(cancha.foto)}" alt="${cancha.nombre}">
              <span class="etiqueta${cancelada ? " etiqueta--cancelada" : ""}">${cancelada ? "Cancelada" : futura ? "Confirmada" : "Completada"}</span>
            </div>
            <div>
              <h1 class="titulo">${cancha.nombre}</h1>
              <p class="detalle__lugar">${linea}</p>
            </div>
            ${tarjetaUsuario(u)}
            <div class="datos">
              ${caja("calendario", "Fecha", FECHA.mini(FECHA.leer(r.fecha)))}
              ${caja("reloj", "Hora", `${O.hh(O.num(r.hora))} · ${r.horas} h`)}
              ${caja("personas", "Personas", r.personas)}
            </div>
            ${motivo}
            ${cancelada ? `<div class="caja-gris"><p class="caja-gris__sobre">RESERVA CANCELADA</p><p>Motivo: ${UI.escapar(r.motivo || "Cancelada")}.</p></div>` : ""}
          </div>
          ${pie}
        </section>`;
    },
    alMostrar(contenedor, dato) {
      const boton = contenedor.querySelector("[data-cancelar]");
      if (!boton) return;
      const r = O.buscarReserva(dato) || O.reservasDel(HOY).find((x) => x.tipo !== "bloqueo");
      const cancha = DATOS.canchas[r.cancha];
      const u = datosUsuario(r);
      const dia = FECHA.diaYNumero(FECHA.leer(r.fecha));
      const sugerencias = {
        Mantenimiento: `La ${cancha.nombre.toLowerCase()} estará en mantenimiento el ${dia}.`,
        "Evento institucional": `El ${dia} el espacio se usará para un evento institucional de la UCA.`,
        Clima: `Por el clima no es seguro usar la ${cancha.nombre.toLowerCase()} el ${dia}.`,
        Otro: ""
      };
      boton.addEventListener("click", () =>
        hojaMotivo({
          titulo: `Cancelar reserva ${r.codigo}`,
          texto: r.tipo === "externo" ? `Se notificará a ${UI.escapar(u.nombre)}. Como pagó ${dinero(r.fuente.total)}, se generará un reembolso automático.` : `Se notificará a ${UI.escapar(u.nombre)} y el horario quedará libre.`,
          motivos: DATOS.motivosCancelarAdmin,
          sugerencia: (m) => sugerencias[m],
          boton: "Cancelar y notificar",
          alConfirmar: (motivo, mensaje) => {
            cancelarReserva(r, motivo, mensaje);
            UCA.ir(`admin-reserva-cancelada/${r.codigo}`);
          }
        })
      );
    }
  });

  UCA.registrar("admin-reserva-cancelada", {
    dibujar(dato) {
      const r = O.buscarReserva(dato);
      if (!r) return UCA.pantallas["admin-reservas"].dibujar();
      const u = datosUsuario(r);
      return `
        <section class="pantalla pantalla--oscura">
          ${UI.marca(true)}
          <span class="circulo circulo--grande exito__icono">${UI.icono("visto", 34)}</span>
          <span class="etiqueta exito__etiqueta">RESERVA CANCELADA</span>
          <h1 class="titulo exito__titulo">Se notificó<br>al usuario</h1>
          <p class="parrafo exito__texto">${r.tipo === "externo" ? "El horario quedó libre y el reembolso está en proceso." : "El horario quedó libre para otras personas."}</p>
          <div class="resumen resumen--comprobante">
            <p class="resumen__sobre">RESUMEN</p>
            ${fila("Reserva", `${r.codigo} · ${DATOS.canchas[r.cancha].nombre}`)}
            ${fila("Usuario", UI.escapar(u.nombre))}
            ${fila("Motivo", UI.escapar(r.tipo === "externo" ? r.fuente.motivoAdmin || "Cancelada" : r.motivo || "Cancelada"))}
            ${fila("Reembolso", r.tipo === "externo" ? `${dinero(r.fuente.total)} · En proceso` : "No aplica · sin costo")}
          </div>
          <div class="al-fondo exito__acciones">${UI.boton("Volver a reservas", { ir: "admin-reservas" })}</div>
        </section>`;
    }
  });

  /* ==========================================================
     66 · Solicitudes externas
     ========================================================== */
  UCA.registrar("admin-solicitudes", {
    dibujar() {
      return `
        <section class="pantalla pantalla--app pantalla--gris">
          ${UI.barraVolver("PANEL / SOLICITUDES")}
          <div class="app-contenido">
            <h1 class="titulo">Solicitudes<br>externas</h1>
            ${pestanas([["revision", `Pendientes (${pendientes().length})`], ["aprobada", "Aprobadas"], ["rechazada", "Rechazadas"]], "revision")}
            <div class="lista-tarjetas" data-lista></div>
          </div>
        </section>`;
    },
    alMostrar(contenedor) {
      const pintar = (estado) => {
        const lista = estado === "revision" ? pendientes() : O.todasSolicitudes().filter((s) => s.estado === estado).sort((a, b) => b.fecha.localeCompare(a.fecha));
        const vacios = { revision: "No hay solicitudes por revisar.", aprobada: "Aún no hay solicitudes aprobadas.", rechazada: "No hay solicitudes rechazadas." };
        contenedor.querySelector("[data-lista]").innerHTML = lista.length ? lista.map(tarjetaSolicitud).join("") : `<p class="lista-vacia">${vacios[estado]}</p>`;
      };
      activarPestanas(contenedor, pintar);
      pintar("revision");
    }
  });

  /* ==========================================================
     67 · Detalle de solicitud (68 · Rechazar en hoja)
     ========================================================== */
  UCA.registrar("admin-solicitud", {
    dibujar(dato) {
      const s = buscarSolicitud(dato);
      const cancha = DATOS.canchas[s.cancha];
      const c = contactoDe(s);
      const pendiente = s.estado === "revision";
      const choque = pendiente ? conflictoDe(s) : "";
      const insignias = { revision: ["Pendiente de revisión", " etiqueta--aviso"], aprobada: [`Aprobada · ${s.reserva}`, ""], rechazada: ["Rechazada", " etiqueta--rechazada"] };
      const [texto, clase] = insignias[s.estado];
      const pago = s.pago.tipo === "transferencia" ? "Transferencia · comprobante adjunto" : s.pago.texto;
      let pie;
      if (pendiente) {
        pie = `<button type="button" class="boton" data-aprobar${choque ? " disabled" : ""}>Aprobar solicitud</button>
               <button type="button" class="boton boton--borde-rojo hoja__boton-segundo" data-rechazar>Rechazar</button>`;
      } else {
        pie = UI.boton("Volver a solicitudes", { ir: "admin-solicitudes" });
      }
      return `
        <section class="pantalla pantalla--app pantalla--gris">
          ${UI.barraVolver(`SOLICITUDES / ${s.codigo}`)}
          <div class="app-contenido">
            <div>
              <span class="etiqueta${clase}">${texto}</span>
              <h1 class="titulo sep-s">${cancha.nombre}</h1>
            </div>
            ${tarjetaUsuario({ nombre: s.nombre, texto: `DUI ${s.dui}${s.organizacion ? ` · ${s.organizacion}` : ""}${c.telefono ? ` · ${c.telefono}` : ""}`, tipo: "Externo" })}
            <div class="datos">
              ${caja("calendario", "Fecha", FECHA.mini(FECHA.leer(s.fecha)))}
              ${caja("reloj", "Hora", `${O.hh(O.num(s.hora))} · ${s.horas} h`)}
              ${caja("personas", "Personas", s.personas)}
            </div>
            <div class="motivo-caja">
              <p class="motivo-caja__sobre">MOTIVO · ${UI.escapar(s.tipo).toUpperCase()}</p>
              <p>${UI.escapar(s.descripcion)}</p>
            </div>
            <div class="dos-cajas">
              <div class="dos-cajas__caja">
                <p class="dos-cajas__sobre">${s.estado === "rechazada" ? "REEMBOLSO" : "PAGO"}</p>
                <p class="dos-cajas__valor">${dinero(s.total)}</p>
                <p class="dos-cajas__texto">${pago}</p>
              </div>
              ${
                s.estado === "rechazada"
                  ? `<div class="dos-cajas__caja dos-cajas__caja--gris"><p class="dos-cajas__sobre">MOTIVO</p><p class="dos-cajas__valor dos-cajas__valor--chico">${UI.escapar(s.motivoAdmin || "Rechazada")}</p><p class="dos-cajas__texto">${UI.escapar(recortar(s.motivoRechazo || "", 40))}</p></div>`
                  : `<div class="dos-cajas__caja ${choque ? "dos-cajas__caja--roja" : "dos-cajas__caja--lima"}">
                      <p class="dos-cajas__sobre">HORARIO</p>
                      <p class="dos-cajas__valor">${choque ? "Ocupado" : s.estado === "aprobada" ? "Reservado" : "Libre"}</p>
                      <p class="dos-cajas__texto">${choque || (s.estado === "aprobada" ? "Ya es una reserva" : "Sin conflictos")}</p>
                      <span class="dos-cajas__icono">${UI.icono(choque ? "alerta" : "visto", 16)}</span>
                    </div>`
              }
            </div>
            ${choque ? `<p class="admin-nota">${UI.icono("info", 16)}Hay un choque de horario: no se puede aprobar. Rechaza la solicitud y explica el motivo.</p>` : ""}
            ${s.estado === "rechazada" && s.motivoRechazo ? `<div class="caja-gris"><p class="caja-gris__sobre">MENSAJE ENVIADO</p><p>${UI.escapar(s.motivoRechazo)}</p></div>` : ""}
          </div>
          <div class="app-pie">${pie}</div>
        </section>`;
    },
    alMostrar(contenedor, dato) {
      const s = buscarSolicitud(dato);
      const aprobar = contenedor.querySelector("[data-aprobar]");
      if (aprobar) {
        aprobar.addEventListener("click", () =>
          conCarga(aprobar, "Aprobando…", () => {
            const usados = [...UCA.reservas.map((r) => r.codigo), ...O.todasSolicitudes().map((x) => x.reserva).filter(Boolean)];
            s.estado = "aprobada";
            s.reserva = nuevoCodigo("R", usados);
            if (esDeCarlos(s)) {
              avisarExterno({
                categoria: "reservas",
                icono: "visto",
                titulo: "¡Solicitud aprobada!",
                texto: `${DATOS.canchas[s.cancha].nombre} · ${FECHA.mini(FECHA.leer(s.fecha))}. Tu código: ${s.reserva}.`,
                ir: `solicitud-aprobada/${s.codigo}`
              });
            }
            UCA.ir(`admin-solicitud-aprobada/${s.codigo}`);
          })
        );
      }
      const rechazar = contenedor.querySelector("[data-rechazar]");
      if (rechazar) {
        const dia = FECHA.diaYNumero(FECHA.leer(s.fecha));
        const sugerencias = {
          "Evento institucional": "El espacio fue asignado a una actividad institucional en ese horario.",
          "Horario ocupado": `Ese horario del ${dia} ya está ocupado. Te invitamos a elegir otro.`,
          "Motivo no válido": "El motivo de uso no cumple con las normas del Polideportivo.",
          Otro: ""
        };
        rechazar.addEventListener("click", () =>
          hojaMotivo({
            titulo: "Rechazar solicitud",
            texto: `Se notificará a ${UI.escapar(s.nombre)} y se le reembolsarán ${dinero(s.total)}.`,
            motivos: DATOS.motivosRechazo,
            sugerencia: (m) => sugerencias[m],
            boton: "Rechazar y reembolsar",
            alConfirmar: (motivo, mensaje) => {
              rechazarSolicitud(s, motivo, mensaje);
              UCA.ir(`admin-solicitud-rechazada/${s.codigo}`);
            }
          })
        );
      }
    }
  });

  /* 69 · Solicitud aprobada */
  UCA.registrar("admin-solicitud-aprobada", {
    dibujar(dato) {
      const s = buscarSolicitud(dato);
      return `
        <section class="pantalla pantalla--oscura">
          ${UI.marca(true)}
          <span class="circulo circulo--grande exito__icono">${UI.icono("visto", 34)}</span>
          <span class="etiqueta exito__etiqueta">SOLICITUD APROBADA</span>
          <h1 class="titulo exito__titulo">Reserva<br>confirmada</h1>
          <p class="parrafo exito__texto">${UI.escapar(s.nombre)} recibió su código de acceso.</p>
          <div class="tarjeta-reserva">
            <p class="tarjeta-reserva__sobre">RESERVA GENERADA</p>
            <p class="tarjeta-reserva__titulo">${DATOS.canchas[s.cancha].nombre}</p>
            <p class="tarjeta-reserva__dato">${UI.icono("calendario", 16)}${FECHA.mini(FECHA.leer(s.fecha))} · ${s.hora} – ${s.fin}</p>
            <p class="tarjeta-reserva__dato">${UI.icono("personas", 16)}${UI.escapar(s.organizacion || s.tipo)} · ${s.personas} personas</p>
            <div class="tarjeta-reserva__pie">
              <span>Pagado ${dinero(s.total)}</span>
              <span class="etiqueta">${s.reserva || s.codigo}</span>
            </div>
          </div>
          <div class="al-fondo exito__acciones">${UI.boton("Volver a solicitudes", { ir: "admin-solicitudes" })}</div>
        </section>`;
    }
  });

  /* 70 · Solicitud rechazada */
  UCA.registrar("admin-solicitud-rechazada", {
    dibujar(dato) {
      const s = buscarSolicitud(dato);
      return `
        <section class="pantalla pantalla--oscura">
          ${UI.marca(true)}
          <span class="circulo circulo--grande circulo--peligro exito__icono">${UI.icono("alerta", 34)}</span>
          <span class="etiqueta etiqueta--rechazada exito__etiqueta">SOLICITUD RECHAZADA</span>
          <h1 class="titulo exito__titulo">Se notificó<br>al solicitante</h1>
          <p class="parrafo exito__texto">El reembolso se generó automáticamente.</p>
          <div class="resumen resumen--comprobante">
            <p class="resumen__sobre">RESUMEN</p>
            ${fila("Solicitud", `${s.codigo} · ${DATOS.canchas[s.cancha].nombre}`)}
            ${fila("Solicitante", UI.escapar(s.nombre))}
            ${fila("Motivo", UI.escapar(s.motivoAdmin || "Rechazada"))}
            ${fila("Reembolso", `${dinero(s.total)} · En proceso`)}
          </div>
          <div class="al-fondo exito__acciones">${UI.boton("Volver a solicitudes", { ir: "admin-solicitudes" })}</div>
        </section>`;
    }
  });

  /* ==========================================================
     71 · Ocupación de espacios
     ========================================================== */
  const franjas = (id, fecha) =>
    O.HORAS.map((hora) => {
      const e = O.estado(id, fecha, hora);
      return `<button type="button" class="franja franja--${e.tipo}" data-franja="${id}|${FECHA.clave(fecha)}|${hora}" aria-label="${hora}: ${e.texto}"></button>`;
    }).join("");

  function explicarFranja(boton) {
    const [id, clave, hora] = boton.dataset.franja.split("|");
    const e = O.estado(id, FECHA.leer(clave), hora);
    UI.avisar(`${DATOS.canchas[id].corto} · ${hora}: ${e.texto}`);
  }

  UCA.registrar("admin-ocupacion", {
    dibujar() {
      return `
        <section class="pantalla pantalla--app pantalla--gris">
          ${UI.barraVolver("PANEL / OCUPACIÓN")}
          <div class="app-contenido">
            <h1 class="titulo">Ocupación de<br>espacios</h1>
            <div class="filtros">
              ${[["todos", "Todos"], ...O.IDS.map((id) => [id, DATOS.canchas[id].corto])]
                .map(([valor, texto], i) => `<button type="button" class="filtro${i === 0 ? " filtro--activo" : ""}" data-filtro="${valor}" aria-pressed="${i === 0}">${texto}</button>`)
                .join("")}
            </div>
            <div>
              <p class="admin-dia">HOY · ${fechaMedia(HOY).toUpperCase()}</p>
              ${leyenda()}
            </div>
            ${O.IDS.map(
              (id) => `
              <div class="ocupacion-tarjeta" data-espacio="${id}">
                <div class="ocupacion-tarjeta__arriba">
                  <p class="ocupacion-tarjeta__nombre">${DATOS.canchas[id].nombre}</p>
                  <span class="etiqueta">${O.porcentaje(id, HOY)}%</span>
                </div>
                <div class="franjas">${franjas(id, HOY)}</div>
                <div class="ocupacion-tarjeta__abajo">
                  <span>6:00 – 20:00</span>
                  <a class="ocupacion-tarjeta__enlace" href="#/admin-calendario/${id}" data-ir="admin-calendario/${id}">Ver semana ${UI.icono("arrow_forward", 14)}</a>
                </div>
              </div>`
            ).join("")}
          </div>
          <div class="app-pie"><button type="button" class="boton" data-bloquear>Bloquear un horario</button></div>
        </section>`;
    },
    alMostrar(contenedor) {
      contenedor.querySelectorAll("[data-filtro]").forEach((boton) => {
        boton.addEventListener("click", () => {
          contenedor.querySelectorAll("[data-filtro]").forEach((otro) => {
            otro.classList.toggle("filtro--activo", otro === boton);
            otro.setAttribute("aria-pressed", String(otro === boton));
          });
          contenedor.querySelectorAll("[data-espacio]").forEach((tarjeta) => {
            tarjeta.hidden = boton.dataset.filtro !== "todos" && tarjeta.dataset.espacio !== boton.dataset.filtro;
          });
        });
      });
      contenedor.querySelector(".pantalla").addEventListener("click", (evento) => {
        const franja = evento.target.closest("[data-franja]");
        if (franja) explicarFranja(franja);
      });
      contenedor.querySelector("[data-bloquear]").addEventListener("click", () => hojaBloquear({ cancha: "basquetbol", fecha: HOY }));
    }
  });

  const leyenda = () => `
    <div class="leyenda" aria-hidden="true">
      <span class="leyenda__item"><span class="leyenda__muestra"></span>Libre</span>
      <span class="leyenda__item"><span class="leyenda__muestra leyenda__muestra--elegida"></span>Ocupado</span>
      <span class="leyenda__item"><span class="leyenda__muestra leyenda__muestra--pendiente"></span>Pendiente</span>
      <span class="leyenda__item"><span class="leyenda__muestra leyenda__muestra--ocupada"></span>Bloqueado</span>
    </div>`;

  /* ==========================================================
     72 · Calendario de ocupación de un espacio
     ========================================================== */
  UCA.registrar("admin-calendario", {
    dibujar(dato) {
      const id = DATOS.canchas[dato] ? dato : "basquetbol";
      const cancha = DATOS.canchas[id];
      return `
        <section class="pantalla pantalla--app pantalla--gris">
          ${UI.barraVolver(`OCUPACIÓN / ${cancha.corto.toUpperCase()}`)}
          <div class="app-contenido">
            <div class="admin-cabecera">
              <h1 class="titulo">${cancha.nombre}</h1>
              <span class="etiqueta" data-semanal></span>
            </div>
            ${pestanas([["dia", "Día"], ["semana", "Semana"]], "semana")}
            <div class="calendario__cabecera">
              <p class="admin-dia" data-titulo></p>
              <div class="calendario__flechas">
                <button type="button" class="calendario__flecha" data-semana="-1" aria-label="Semana anterior">${UI.icono("flechaIzq", 22)}</button>
                <button type="button" class="calendario__flecha" data-semana="1" aria-label="Semana siguiente">${UI.icono("flecha", 22)}</button>
              </div>
            </div>
            <div data-vista></div>
            ${leyenda()}
            <div class="resumen-semana" data-resumen></div>
          </div>
          <div class="app-pie"><button type="button" class="boton" data-bloquear>Bloquear horario</button></div>
        </section>`;
    },
    alMostrar(contenedor, dato) {
      const id = DATOS.canchas[dato] ? dato : "basquetbol";
      const estado = { vista: "semana", lunes: FECHA.lunesDe(HOY), dia: HOY };
      const limiteAtras = FECHA.sumarDias(FECHA.lunesDe(HOY), -21);
      const limiteAdelante = FECHA.sumarDias(FECHA.lunesDe(HOY), 21);
      const flechas = contenedor.querySelectorAll("[data-semana]");

      const pintar = () => {
        const dias = Array.from({ length: 7 }, (_, i) => FECHA.sumarDias(estado.lunes, i));
        const domingo = dias[6];
        contenedor.querySelector("[data-titulo]").textContent =
          estado.vista === "semana" ? `${dias[0].getDate()} – ${domingo.getDate()} ${FECHA.MESES[domingo.getMonth()].toUpperCase()}` : fechaMedia(estado.dia).toUpperCase();
        flechas[0].disabled = estado.lunes <= limiteAtras;
        flechas[1].disabled = estado.lunes >= limiteAdelante;
        const promedio = Math.round(dias.reduce((suma, f) => suma + O.porcentaje(id, f), 0) / 7);
        contenedor.querySelector("[data-semanal]").textContent = `${promedio}% esta semana`;

        if (estado.vista === "semana") {
          const cabecera = dias
            .map((f) => `<span class="semana-grilla__dia${FECHA.clave(f) === FECHA.clave(HOY) ? " semana-grilla__dia--hoy" : ""}">${FECHA.LETRAS[f.getDay()]}<small>${f.getDate()}</small></span>`)
            .join("");
          const filas = O.HORAS.map(
            (hora, i) => `
              <span class="semana-grilla__hora">${i % 2 === 0 ? hora : ""}</span>
              ${dias
                .map((f) => {
                  const e = O.estado(id, f, hora);
                  return `<button type="button" class="franja franja--${e.tipo}" data-dia="${FECHA.clave(f)}" aria-label="${fechaMedia(f)}, ${hora}: ${e.texto}"></button>`;
                })
                .join("")}`
          ).join("");
          contenedor.querySelector("[data-vista]").innerHTML = `<div class="semana-grilla"><span></span>${cabecera}${filas}</div>`;
        } else {
          const chips = dias
            .map((f) => {
              const elegido = FECHA.clave(f) === FECHA.clave(estado.dia);
              return `<button type="button" class="dia${elegido ? " dia--elegido" : ""}" data-dia="${FECHA.clave(f)}" aria-pressed="${elegido}"><span class="dia__letra">${FECHA.LETRAS[f.getDay()]}</span><span class="dia__numero">${f.getDate()}</span></button>`;
            })
            .join("");
          const horas = O.HORAS.map((hora) => {
            const e = O.estado(id, estado.dia, hora);
            return `
              <button type="button" class="hora-admin hora-admin--${e.tipo}" data-hora-admin="${hora}">
                <span class="hora-admin__hora">${hora}</span>
                <span class="hora-admin__texto">${UI.escapar(e.texto)}</span>
                ${e.tipo === "libre" ? `<span class="hora-admin__accion">Bloquear</span>` : ""}
              </button>`;
          }).join("");
          contenedor.querySelector("[data-vista]").innerHTML = `<div class="calendario__dias">${chips}</div><div class="horas-admin">${horas}</div>`;
        }

        // Resumen de la semana para este espacio
        const semana = dias.flatMap((f) => O.reservasDel(f)).filter((r) => r.cancha === id);
        const reservas = semana.filter((r) => r.tipo !== "bloqueo" && r.estado === "confirmada").length;
        const bloqueos = semana.filter((r) => r.tipo === "bloqueo").length;
        const externos = semana.filter((r) => r.tipo === "externo" && r.estado === "confirmada").reduce((suma, r) => suma + r.fuente.total, 0);
        contenedor.querySelector("[data-resumen]").innerHTML = `
          <p class="resumen-semana__sobre">RESUMEN DE LA SEMANA</p>
          <div class="resumen-semana__fila">
            <p><strong>${reservas}</strong>reservas</p>
            <p><strong>${bloqueos}</strong>bloqueos</p>
            <p><strong>${dinero(externos)}</strong>externos</p>
          </div>`;
      };

      activarPestanas(contenedor, (vista) => {
        estado.vista = vista;
        pintar();
      });
      contenedor.querySelector(".pantalla").addEventListener("click", (evento) => {
        const semana = evento.target.closest("[data-semana]");
        const dia = evento.target.closest("[data-dia]");
        const hora = evento.target.closest("[data-hora-admin]");
        if (semana) {
          estado.lunes = FECHA.sumarDias(estado.lunes, 7 * Number(semana.dataset.semana));
          estado.dia = estado.lunes;
          pintar();
        } else if (dia) {
          // Tocar un día (o una casilla de la semana) abre la vista de ese día
          estado.dia = FECHA.leer(dia.dataset.dia);
          if (estado.vista === "semana") {
            estado.vista = "dia";
            contenedor.querySelectorAll("[data-pestana]").forEach((p) => {
              p.classList.toggle("pestana--activa", p.dataset.pestana === "dia");
              p.setAttribute("aria-selected", String(p.dataset.pestana === "dia"));
            });
          }
          pintar();
        } else if (hora) {
          const e = O.estado(id, estado.dia, hora.dataset.horaAdmin);
          if (e.tipo === "libre") hojaBloquear({ cancha: id, fecha: estado.dia, hora: hora.dataset.horaAdmin }, pintar);
          else UI.avisar(`${hora.dataset.horaAdmin}: ${e.texto}`);
        }
      });
      contenedor.querySelector("[data-bloquear]").addEventListener("click", () => hojaBloquear({ cancha: id, fecha: estado.vista === "dia" ? estado.dia : HOY }));
      pintar();
    }
  });

  /* ==========================================================
     73 · Bloquear horario (hoja) y 74 · Horario bloqueado
     ========================================================== */
  function afectadasPor(cancha, clave, horas) {
    return O.reservasDel(FECHA.leer(clave)).filter(
      (r) => r.cancha === cancha && r.tipo !== "bloqueo" && (r.estado === "confirmada" || r.estado === "pendiente") && O.horasDe(r.hora, r.horas).some((n) => horas.includes(n))
    );
  }

  function hojaBloquear(inicial) {
    const fechas = Array.from({ length: 10 }, (_, i) => FECHA.sumarDias(HOY, i)).filter((f) => !O.cerrado(f));
    const estado = {
      cancha: inicial.cancha,
      fecha: fechas.some((f) => FECHA.clave(f) === FECHA.clave(inicial.fecha)) ? FECHA.clave(inicial.fecha) : FECHA.clave(fechas[0]),
      desde: inicial.hora ? O.num(inicial.hora) : null,
      hasta: inicial.hora ? O.num(inicial.hora) : null,
      motivo: DATOS.motivosCancelarAdmin[0]
    };
    const hoja = UI.abrirHoja(
      `
      <h2 class="hoja__titulo">Bloquear horario</h2>
      <p class="hoja__sobre">ESPACIO</p>
      <div class="chips" data-zona-cancha>${chipsUnicos("cancha", O.IDS.map((id) => [id, DATOS.canchas[id].corto]), estado.cancha)}</div>
      <p class="hoja__sobre">FECHA</p>
      <div class="chips chips--desliza" data-zona-fecha>${chipsUnicos("fecha", fechas.map((f) => [FECHA.clave(f), `${FECHA.DIAS_CORTOS[f.getDay()]} ${f.getDate()}`]), estado.fecha)}</div>
      <p class="hoja__sobre">HORARIO <span class="hoja__ayuda">· toca la primera y la última hora</span></p>
      <div class="horas horas--admin" data-zona-horas></div>
      <p class="hoja__sobre">MOTIVO</p>
      <div class="chips" data-zona-motivo>${chipsUnicos("motivo", DATOS.motivosCancelarAdmin.map((m) => [m, m]), estado.motivo)}</div>
      <div data-afectadas></div>
      <button type="button" class="boton hoja__boton" data-confirmar disabled>Elige un horario</button>`,
      "Bloquear horario"
    );
    const confirmar = hoja.querySelector("[data-confirmar]");
    const seleccion = () => (estado.desde === null ? [] : Array.from({ length: estado.hasta - estado.desde + 1 }, (_, i) => estado.desde + i));

    const pintar = () => {
      const fecha = FECHA.leer(estado.fecha);
      const elegidas = seleccion();
      hoja.querySelector("[data-zona-horas]").innerHTML = O.HORAS.map((hora) => {
        const n = O.num(hora);
        const bloqueada = O.estado(estado.cancha, fecha, hora).tipo === "bloqueado";
        const elegida = elegidas.includes(n);
        return `<button type="button" class="hora${bloqueada ? " hora--ocupada" : elegida ? " hora--elegida" : ""}" data-hora-bloqueo="${n}"${bloqueada ? " disabled" : ""} aria-pressed="${elegida}">${hora}</button>`;
      }).join("");
      const afectadas = elegidas.length ? afectadasPor(estado.cancha, estado.fecha, elegidas) : [];
      hoja.querySelector("[data-afectadas]").innerHTML = elegidas.length
        ? afectadas.length
          ? `<p class="aviso-amarillo">${UI.icono("alerta", 18)}${afectadas.length} ${afectadas.length === 1 ? "reserva afectada" : "reservas afectadas"} · se ${afectadas.length === 1 ? "notificará al usuario" : "notificará a cada usuario"}</p>`
          : `<p class="admin-nota">${UI.icono("info", 16)}Ninguna reserva afectada.</p>`
        : "";
      confirmar.disabled = !elegidas.length;
      confirmar.textContent = elegidas.length ? `Bloquear ${rango(O.hh(estado.desde), elegidas.length)}` : "Elige un horario";
    };

    activarChips(hoja.querySelector("[data-zona-cancha]"), "cancha", (valor) => {
      estado.cancha = valor;
      estado.desde = estado.hasta = null;
      pintar();
    });
    activarChips(hoja.querySelector("[data-zona-fecha]"), "fecha", (valor) => {
      estado.fecha = valor;
      estado.desde = estado.hasta = null;
      pintar();
    });
    activarChips(hoja.querySelector("[data-zona-motivo]"), "motivo", (valor) => (estado.motivo = valor));

    hoja.querySelector("[data-zona-horas]").addEventListener("click", (evento) => {
      const boton = evento.target.closest("[data-hora-bloqueo]");
      if (!boton || boton.disabled) return;
      const n = Number(boton.dataset.horaBloqueo);
      if (estado.desde === null || estado.desde !== estado.hasta) {
        // Primera hora (o se empieza de nuevo)
        estado.desde = estado.hasta = n;
      } else if (n === estado.desde) {
        estado.desde = estado.hasta = null;
      } else {
        const desde = Math.min(estado.desde, n);
        const hasta = Math.max(estado.desde, n);
        const fecha = FECHA.leer(estado.fecha);
        const cruzaBloqueo = Array.from({ length: hasta - desde + 1 }, (_, i) => O.hh(desde + i)).some((h) => O.estado(estado.cancha, fecha, h).tipo === "bloqueado");
        if (cruzaBloqueo) {
          UI.avisar("En medio hay una hora ya bloqueada. Elige un rango sin bloqueos.");
          estado.desde = estado.hasta = n;
        } else {
          estado.desde = desde;
          estado.hasta = hasta;
        }
      }
      pintar();
    });

    confirmar.addEventListener("click", () => {
      const horas = seleccion();
      if (!horas.length) return;
      conCarga(confirmar, "Bloqueando…", () => {
        const afectadas = afectadasPor(estado.cancha, estado.fecha, horas);
        const codigo = nuevoCodigo("B", DATOS.bloqueos.map((b) => b.codigo));
        const mensaje = `El ${FECHA.diaYNumero(FECHA.leer(estado.fecha))} de ${O.hh(horas[0])} a ${horaFin(O.hh(horas[0]), horas.length)} la ${DATOS.canchas[estado.cancha].nombre.toLowerCase()} no estará disponible (${estado.motivo.toLowerCase()}).`;
        afectadas.forEach((r) => cancelarReserva(r, estado.motivo, mensaje));
        DATOS.bloqueos.push({ codigo, cancha: estado.cancha, fecha: estado.fecha, hora: O.hh(horas[0]), horas: horas.length, motivo: estado.motivo, afectadas: afectadas.length });
        UCA.ir(`admin-bloqueo/${codigo}`);
      });
    });

    pintar();
  }

  UCA.registrar("admin-bloqueo", {
    dibujar(dato) {
      const b = DATOS.bloqueos.find((x) => x.codigo === dato) || DATOS.bloqueos[DATOS.bloqueos.length - 1];
      const cancha = DATOS.canchas[b.cancha];
      return `
        <section class="pantalla pantalla--oscura">
          ${UI.marca(true)}
          <span class="circulo circulo--grande exito__icono">${UI.icono("candado", 34)}</span>
          <span class="etiqueta exito__etiqueta">HORARIO BLOQUEADO</span>
          <h1 class="titulo exito__titulo">${cancha.nombre}<br>bloqueada</h1>
          <p class="parrafo exito__texto">Nadie podrá reservar en ese horario.</p>
          <div class="resumen resumen--comprobante">
            <p class="resumen__sobre">RESUMEN</p>
            ${fila("Espacio", cancha.nombre)}
            ${fila("Fecha", mayuscula(fechaMedia(FECHA.leer(b.fecha))))}
            ${fila("Horario", rango(b.hora, b.horas))}
            ${fila("Motivo", b.motivo)}
            ${fila("Reservas afectadas", b.afectadas ? `${b.afectadas} · ${b.afectadas === 1 ? "notificada" : "notificadas"}` : "Ninguna")}
          </div>
          <div class="al-fondo exito__acciones">${UI.boton("Volver a ocupación", { ir: "admin-ocupacion" })}</div>
        </section>`;
    }
  });

  /* ==========================================================
     75 a 79 · Actividades y eventos
     Se juntan los eventos de estudiantes, las actividades, los
     eventos para externos y los que crea administración.
     ========================================================== */
  const LUGAR = { Básquetbol: "basquetbol", Voleibol: "voleibol", Fútbol: "futbol", "Ping pong": "ping-pong" };
  const FOTO = { Básquetbol: "Fotografia basquetbol.jpg", Voleibol: "Fotografia voleibol.jpg", Fútbol: "Fotografia futbol.jpg", "Ping pong": "Fotografia de la cancha ping pong.jpg" };
  const lugarDe = (deporte) => (LUGAR[deporte] ? DATOS.canchas[LUGAR[deporte]].nombre : deporte === "Taekwondo" ? "Salón de taekwondo" : deporte === "Gimnasio" ? "Gimnasio UCA" : "Polideportivo UCA");
  const proximaClase = (diasNumero) => {
    for (let i = 0; i < 7; i++) {
      const f = FECHA.sumarDias(HOY, i);
      if (diasNumero.includes(f.getDay())) return f;
    }
    return HOY;
  };

  function eventosAdmin() {
    const lista = [];
    const copias = (id) => [...DATOS.eventos, ...DATOS.eventosExternos].filter((e) => e.creado === id);
    DATOS.eventos
      .filter((e) => !e.creado)
      .forEach((e) => lista.push({ id: `e-${e.id}`, origen: "e", fuente: e, deporte: e.deporte, titulo: e.corto || e.titulo, fecha: e.fecha, hora: e.hora, inscritos: e.cupo.inscritos, total: e.cupo.total, costo: e.costo, abierto: ["estudiantes"], foto: e.foto }));
    DATOS.actividades.forEach((a) => {
      const total = a.cupoTotal || 30;
      lista.push({ id: `a-${a.id}`, origen: "a", fuente: a, deporte: a.deporte, titulo: a.corto || a.nombre || a.titulo, dias: a.dias, diasNumero: a.diasNumero, hora: a.hora, inscritos: total - a.libres, total, costo: a.costo, abierto: ["estudiantes"], foto: a.foto });
    });
    DATOS.eventosExternos
      .filter((e) => !e.creado)
      .forEach((e) =>
        lista.push({
          id: `x-${e.id}`, origen: "x", fuente: e, deporte: e.deporte, titulo: e.corto, fecha: e.tipo === "clase" ? null : e.fecha,
          dias: e.dias, diasNumero: e.diasNumero, hora: e.hora, inscritos: e.cupo.inscritos, total: e.cupo.total, costo: e.costo, abierto: ["externos"], foto: e.foto
        })
      );
    DATOS.eventosCreados.forEach((c) => {
      const [copia] = copias(c.id);
      lista.push({ id: `c-${c.id}`, origen: "c", fuente: c, deporte: c.deporte, titulo: c.titulo, fecha: c.fecha, hora: c.hora, inscritos: copia ? copia.cupo.inscritos : c.cupo.inscritos, total: c.cupo.total, costo: c.costo, abierto: c.abierto, foto: c.foto });
    });
    return lista.map((e) => ({ ...e, cuando: e.fecha ? FECHA.leer(e.fecha) : proximaClase(e.diasNumero), terminado: Boolean(e.fecha) && FECHA.leer(e.fecha) < HOY }));
  }
  const buscarEvento = (id) => eventosAdmin().find((e) => e.id === id) || eventosAdmin()[0];
  const fechaEvento = (e) => (e.fecha ? `${FECHA.mini(FECHA.leer(e.fecha))}` : e.dias);

  UCA.registrar("admin-eventos", {
    dibujar() {
      return `
        <section class="pantalla pantalla--app pantalla--gris">
          <div class="app-contenido">
            ${ruta("UCA SPORTS / EVENTOS")}
            <div class="admin-cabecera">
              <h1 class="titulo">Actividades<br>y eventos</h1>
              <a class="admin-crear" href="#/admin-crear-evento" data-ir="admin-crear-evento">${UI.icono("mas", 18)}Crear</a>
            </div>
            ${pestanas([["proximos", "Próximos"], ["finalizados", "Finalizados"]], "proximos")}
            <div class="lista-tarjetas" data-lista></div>
          </div>
          ${UI.navInferior("admin-eventos", NAV)}
        </section>`;
    },
    alMostrar(contenedor) {
      const pintar = (pestana) => {
        const lista = eventosAdmin()
          .filter((e) => (pestana === "finalizados") === e.terminado)
          .sort((a, b) => (pestana === "finalizados" ? b.cuando - a.cuando : a.cuando - b.cuando));
        contenedor.querySelector("[data-lista]").innerHTML = lista.length
          ? lista
              .map((e) => {
                const p = Math.round((e.inscritos / e.total) * 100);
                return `
              <a class="evento-admin" href="#/admin-evento/${e.id}" data-ir="admin-evento/${e.id}">
                <span class="evento-admin__arriba">
                  <span class="evento-admin__sobre">${e.deporte.toUpperCase()} · ${fechaEvento(e).toUpperCase()}</span>
                  <span class="etiqueta${e.costo ? " etiqueta--codigo" : ""}">${e.costo ? dinero(e.costo) : "Gratis"}</span>
                </span>
                <span class="evento-admin__titulo">${UI.escapar(e.titulo)}</span>
                <span class="evento-admin__fila"><span>${e.inscritos} de ${e.total} inscritos · ${e.abierto.length === 2 ? "Todos" : e.abierto[0] === "externos" ? "Externos" : "Estudiantes"}</span><span class="evento-admin__porcentaje">${p}%</span></span>
                <span class="evento-admin__barra"><span style="width:${Math.min(100, p)}%"></span></span>
              </a>`;
              })
              .join("")
          : `<p class="lista-vacia">${pestana === "finalizados" ? "Aún no hay eventos finalizados." : "No hay eventos próximos. Crea uno nuevo."}</p>`;
      };
      activarPestanas(contenedor, pintar);
      pintar("proximos");
    }
  });

  /* ---------- 76 · Crear (o editar) evento ---------- */
  const DISCIPLINAS = ["Básquetbol", "Voleibol", "Fútbol", "Ping pong"];
  const horaA24 = (texto) => {
    const m = /(\d+):(\d+)\s*([ap])/.exec(texto || "");
    if (!m) return "";
    let h = Number(m[1]) % 12;
    if (m[3] === "p") h += 12;
    return `${String(h).padStart(2, "0")}:${m[2]}`;
  };
  const horaA12 = (valor) => {
    const [h, min] = valor.split(":").map(Number);
    return `${h % 12 || 12}:${String(min).padStart(2, "0")} ${h < 12 ? "a. m." : "p. m."}`;
  };

  UCA.registrar("admin-crear-evento", {
    dibujar(dato) {
      const editar = dato ? buscarEvento(dato) : null;
      if (editar && !editar.fecha) return UCA.pantallas["admin-evento"].dibujar(dato); // las clases semanales no se editan aquí
      const e = editar || { titulo: "", deporte: "Voleibol", fecha: "", hora: "", total: 20, costo: 0, abierto: ["estudiantes", "externos"], origen: "c" };
      const fijo = editar && editar.origen !== "c"; // en eventos que ya existían no se cambia la disciplina ni el público
      const minimo = FECHA.clave(HOY);
      const maximo = FECHA.clave(FECHA.sumarDias(HOY, 90));
      return `
        <section class="pantalla pantalla--app pantalla--gris">
          ${UI.barraVolver(editar ? "EVENTOS / EDITAR" : "EVENTOS / NUEVO")}
          <div class="app-contenido editar-perfil">
            <h1 class="titulo">${editar ? "Editar evento" : "Crear evento"}</h1>
            <div class="campo">
              <label class="campo__etiqueta" for="ev-nombre">Nombre del evento</label>
              <div class="campo__caja"><input class="campo__entrada" id="ev-nombre" type="text" maxlength="40" value="${UI.escapar(e.titulo.replace(/<br>/g, " "))}" placeholder="Ej. Torneo de voleibol abierto"></div>
              <p class="campo__error" data-error="nombre" aria-live="polite"></p>
            </div>
            <fieldset class="grupo">
              <legend class="grupo__titulo">Disciplina</legend>
              <div class="chips" data-zona-deporte>${DISCIPLINAS.map((d) => `<button type="button" class="chip chip--chico${d === e.deporte ? " chip--elegido" : ""}" data-deporte="${d}" aria-pressed="${d === e.deporte}"${fijo ? " disabled" : ""}>${d}</button>`).join("")}</div>
            </fieldset>
            <div class="campos-dos">
              <div class="campo">
                <label class="campo__etiqueta" for="ev-fecha">Fecha</label>
                <div class="campo__caja">${UI.icono("calendario", 18)}<input class="campo__entrada" id="ev-fecha" type="date" min="${minimo}" max="${maximo}" value="${e.fecha || ""}"></div>
              </div>
              <div class="campo">
                <label class="campo__etiqueta" for="ev-hora">Hora</label>
                <div class="campo__caja">${UI.icono("reloj", 18)}<input class="campo__entrada" id="ev-hora" type="time" min="06:00" max="19:30" value="${horaA24(e.hora)}"></div>
              </div>
            </div>
            <p class="campo__error" data-error="fecha" aria-live="polite"></p>
            ${contador("Cupo", editar ? `Personas máximas · ya hay ${editar.inscritos} inscritas` : "Personas máximas", e.total, "cupo")}
            <div>
              <p class="campo__etiqueta">Costo</p>
              <div class="costo-elegir">
                <div class="pestanas pestanas--chicas" role="radiogroup" aria-label="Costo">
                  <button type="button" class="pestana${e.costo ? "" : " pestana--activa"}" data-costo="gratis" aria-pressed="${!e.costo}">Gratis</button>
                  <button type="button" class="pestana${e.costo ? " pestana--activa" : ""}" data-costo="pago" aria-pressed="${Boolean(e.costo)}">Con costo</button>
                </div>
                <div class="campo__caja costo-elegir__precio" data-zona-precio${e.costo ? "" : " hidden"}>
                  ${UI.icono("sell", 18)}<span>$</span><input class="campo__entrada" id="ev-precio" type="text" inputmode="decimal" maxlength="6" value="${e.costo ? e.costo.toFixed(2) : ""}" placeholder="0.00" aria-label="Precio por persona"><span class="costo-elegir__por">/ persona</span>
                </div>
              </div>
              <p class="campo__error" data-error="precio" aria-live="polite"></p>
            </div>
            <fieldset class="grupo">
              <legend class="grupo__titulo">Abierto a</legend>
              <div class="chips">${[["estudiantes", "Estudiantes UCA"], ["externos", "Usuarios externos"]].map(([v, t]) => `<button type="button" class="chip chip--chico${e.abierto.includes(v) ? " chip--elegido" : ""}" data-abierto="${v}" aria-pressed="${e.abierto.includes(v)}"${fijo ? " disabled" : ""}>${t}</button>`).join("")}</div>
              <p class="campo__error" data-error="abierto" aria-live="polite"></p>
            </fieldset>
          </div>
          <div class="app-pie"><button type="button" class="boton" data-publicar disabled>${editar ? "Guardar cambios" : "Publicar evento"}</button></div>
        </section>`;
    },
    alMostrar(contenedor, dato) {
      const publicar = contenedor.querySelector("[data-publicar]");
      if (!publicar) return;
      const editar = dato ? buscarEvento(dato) : null;
      const estado = {
        deporte: editar ? editar.deporte : "Voleibol",
        total: editar ? editar.total : 20,
        conCosto: editar ? editar.costo > 0 : false,
        abierto: new Set(editar ? editar.abierto : ["estudiantes", "externos"])
      };
      const nombre = contenedor.querySelector("#ev-nombre");
      const fecha = contenedor.querySelector("#ev-fecha");
      const hora = contenedor.querySelector("#ev-hora");
      const precio = contenedor.querySelector("#ev-precio");
      const tocado = new Set();
      const errores = () => {
        const valor = Number(precio.value.replace(",", "."));
        return {
          nombre: nombre.value.trim().length < 4 ? "Escribe un nombre de al menos 4 letras." : "",
          fecha: !fecha.value || !hora.value ? "Elige la fecha y la hora." : fecha.value < FECHA.clave(HOY) ? "La fecha ya pasó." : hora.value < "06:00" || hora.value > "19:30" ? "El Polideportivo abre de 6:00 a. m. a 8:00 p. m." : "",
          precio: estado.conCosto && !(valor > 0 && valor <= 100) ? "Escribe un precio entre $0.01 y $100.00." : "",
          abierto: estado.abierto.size ? "" : "Elige al menos un público."
        };
      };
      const revisar = () => {
        const e = errores();
        Object.entries(e).forEach(([clave, texto]) => {
          const mostrar = tocado.has(clave) ? texto : "";
          contenedor.querySelector(`[data-error="${clave}"]`).innerHTML = mostrar ? `${UI.icono("alerta", 14)}${mostrar}` : "";
        });
        publicar.disabled = Object.values(e).some(Boolean);
      };
      nombre.addEventListener("input", revisar);
      nombre.addEventListener("blur", () => (tocado.add("nombre"), revisar()));
      [fecha, hora].forEach((campo) => campo.addEventListener("change", () => (tocado.add("fecha"), revisar())));
      precio.addEventListener("input", () => {
        precio.value = precio.value.replace(/[^\d.,]/g, "");
        revisar();
      });
      precio.addEventListener("blur", () => (tocado.add("precio"), revisar()));
      activarChips(contenedor.querySelector("[data-zona-deporte]"), "deporte", (valor) => (estado.deporte = valor));
      contenedor.querySelectorAll("[data-abierto]").forEach((chip) => {
        chip.addEventListener("click", () => {
          const v = chip.dataset.abierto;
          if (estado.abierto.has(v)) estado.abierto.delete(v);
          else estado.abierto.add(v);
          chip.classList.toggle("chip--elegido", estado.abierto.has(v));
          chip.setAttribute("aria-pressed", String(estado.abierto.has(v)));
          tocado.add("abierto");
          revisar();
        });
      });
      contenedor.querySelectorAll("[data-costo]").forEach((boton) => {
        boton.addEventListener("click", () => {
          estado.conCosto = boton.dataset.costo === "pago";
          contenedor.querySelectorAll("[data-costo]").forEach((b) => {
            b.classList.toggle("pestana--activa", b === boton);
            b.setAttribute("aria-pressed", String(b === boton));
          });
          contenedor.querySelector("[data-zona-precio]").hidden = !estado.conCosto;
          if (estado.conCosto) precio.focus();
          revisar();
        });
      });
      activarContador(contenedor, "cupo", () => estado.total, (v) => (estado.total = v), () => Math.max(2, editar ? editar.inscritos : 2), () => 200);

      publicar.addEventListener("click", () => {
        Object.keys(errores()).forEach((k) => tocado.add(k));
        revisar();
        if (publicar.disabled) return;
        const datos = {
          titulo: nombre.value.trim(),
          fecha: fecha.value,
          hora: horaA12(hora.value),
          total: estado.total,
          costo: estado.conCosto ? Math.round(Number(precio.value.replace(",", ".")) * 100) / 100 : 0
        };
        conCarga(publicar, editar ? "Guardando…" : "Publicando…", () => {
          const id = editar ? guardarEvento(editar, datos) : crearEvento({ ...datos, deporte: estado.deporte, abierto: [...estado.abierto] });
          if (editar) {
            UCA.ir(`admin-evento/${id}`);
            UI.avisar("Evento actualizado. Los cambios ya se ven en la app.");
          } else {
            UCA.ir(`admin-evento-publicado/${id}`);
          }
        });
      });
      revisar();
    }
  });

  /* Crea el evento y lo publica para estudiantes y/o externos */
  function crearEvento(d) {
    const base = d.titulo
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    let id = base || "evento";
    let n = 2;
    while ([...DATOS.eventosCreados, ...DATOS.eventos, ...DATOS.eventosExternos].some((e) => e.id === id)) id = `${base}-${n++}`;
    const cupo = { inscritos: 0, total: d.total }; // el mismo cupo se comparte entre estudiantes y externos
    const foto = FOTO[d.deporte];
    DATOS.eventosCreados.push({ id, deporte: d.deporte, titulo: d.titulo, fecha: d.fecha, hora: d.hora, cupo, costo: d.costo, abierto: d.abierto, foto });
    publicarCopias(DATOS.eventosCreados[DATOS.eventosCreados.length - 1]);
    return `c-${id}`;
  }

  function publicarCopias(c) {
    // Se quitan las copias anteriores y se vuelven a poner con los datos nuevos
    [DATOS.eventos, DATOS.eventosExternos].forEach((lista) => {
      for (let i = lista.length - 1; i >= 0; i--) if (lista[i].creado === c.id) lista.splice(i, 1);
    });
    const sobre = `${c.deporte.toUpperCase()} · EVENTO UCA`;
    if (c.abierto.includes("estudiantes")) {
      DATOS.eventos.push({
        id: c.id, creado: c.id, deporte: c.deporte, sobre, titulo: c.titulo, corto: c.titulo,
        subtitulo: "Evento del Polideportivo UCA", resumen: "Inscripción individual", fecha: c.fecha, hora: c.hora,
        cupo: c.cupo, costo: c.costo, detalleCosto: "por persona", equipo: null, foto: c.foto, confirmacion: "¡Ya estás<br>inscrito!"
      });
    }
    if (c.abierto.includes("externos")) {
      DATOS.eventosExternos.push({
        id: c.id, creado: c.id, tipo: "evento", deporte: c.deporte, sobre: `${c.deporte.toUpperCase()} · ABIERTO AL PÚBLICO`,
        titulo: c.titulo, corto: c.titulo, subtitulo: "Abierto a la comunidad", resumen: "Abierto al público",
        fecha: c.fecha, hora: c.hora, cupo: c.cupo, costo: c.costo, foto: c.foto, confirmacion: "¡Nos vemos en<br>el evento!"
      });
    }
  }

  /* Guarda los cambios en el evento original (y en sus copias) */
  function guardarEvento(e, d) {
    const f = e.fuente;
    if (e.origen === "c") {
      Object.assign(f, { titulo: d.titulo, fecha: d.fecha, hora: d.hora, costo: d.costo });
      f.cupo.total = d.total;
      publicarCopias(f);
    } else {
      f.titulo = d.titulo;
      f.corto = d.titulo;
      f.fecha = d.fecha;
      f.hora = d.hora;
      f.costo = d.costo;
      f.cupo.total = d.total;
    }
    return e.id;
  }

  /* ---------- 77 · Evento publicado ---------- */
  UCA.registrar("admin-evento-publicado", {
    dibujar(dato) {
      const e = buscarEvento(dato);
      const publico = e.abierto.length === 2 ? "Estudiantes y externos" : e.abierto[0] === "estudiantes" ? "Estudiantes UCA" : "Usuarios externos";
      return `
        <section class="pantalla pantalla--oscura">
          ${UI.marca(true)}
          <span class="circulo circulo--grande exito__icono">${UI.icono("visto", 34)}</span>
          <span class="etiqueta exito__etiqueta">EVENTO PUBLICADO</span>
          <h1 class="titulo exito__titulo">${UI.escapar(e.titulo)}</h1>
          <p class="parrafo exito__texto">Ya es visible para ${publico.toLowerCase()}.</p>
          <div class="resumen resumen--morado">
            <p class="resumen__sobre">RESUMEN</p>
            ${fila("Fecha", `${fechaEvento(e)} · ${e.hora}`)}
            ${fila("Cupo", `${e.total} personas`)}
            ${fila("Costo", e.costo ? `${dinero(e.costo)} por persona` : "Gratis")}
            ${fila("Abierto a", publico)}
          </div>
          <div class="al-fondo exito__acciones">
            ${UI.boton("Ver evento", { ir: `admin-evento/${e.id}` })}
            ${UI.enlace("Volver a eventos", "admin-eventos", "enlace--claro")}
          </div>
        </section>`;
    }
  });

  /* ---------- 79 · Lista de inscritos (se arma con las inscripciones reales y de ejemplo) ---------- */
  const NOMBRES_A = ["Andrea", "Diego", "Sofía", "Luis", "María José", "Carlos", "Valeria", "José", "Daniela", "Kevin", "Paola", "Mario", "Laura", "Ernesto", "Camila", "Rodrigo"];
  const APELLIDOS = ["Martínez", "Flores", "Rivas", "Gómez", "Pérez", "Hernández", "López", "Ramos", "Campos", "Méndez", "Cruz", "Orellana", "Molina", "Torres"];

  function inscritosDe(e) {
    const lista = [];
    const idFuente = e.fuente.id;
    // Andrea (si se inscribió) y Carlos (si se inscribió)
    UCA.inscripciones
      .filter((i) => i.id === idFuente && ["e", "a", "c"].includes(e.origen))
      .forEach((i) => lista.push({ nombre: DATOS.estudiante.nombre, tipo: "estudiante", pago: i.pago.estado === "revision" ? "Pendiente" : e.costo ? "Pagado" : "Gratis", codigo: i.codigo }));
    DATOS.inscripcionesExternas
      .filter((i) => i.id === idFuente && ["x", "c"].includes(e.origen))
      .forEach((i) => lista.push({ nombre: DATOS.externo.nombre, tipo: "externo", pago: i.pago.estado === "revision" ? "Pendiente" : e.costo ? "Pagado" : "Gratis", codigo: i.codigo }));
    const semilla = [...idFuente].reduce((s, l) => s + l.charCodeAt(0), 0);
    for (let i = 0; lista.length < e.inscritos; i++) {
      const nombre = `${NOMBRES_A[(semilla + i * 5) % NOMBRES_A.length]} ${APELLIDOS[(semilla * 3 + i * 7) % APELLIDOS.length]}`;
      const tipo = e.abierto.length === 2 ? (i % 2 ? "externo" : "estudiante") : e.abierto[0] === "externos" ? "externo" : "estudiante";
      const pago = !e.costo ? "Gratis" : i % 6 === 5 ? "Pendiente" : "Pagado";
      lista.push({ nombre, tipo, pago, codigo: `INS-${2000 + ((semilla + i * 13) % 7000)}` });
    }
    return lista;
  }

  /* ---------- 78 · Detalle de actividad o evento ---------- */
  UCA.registrar("admin-evento", {
    dibujar(dato) {
      const e = buscarEvento(dato);
      const inscritos = inscritosDe(e);
      const recaudado = inscritos.filter((i) => i.pago === "Pagado").length * e.costo;
      const externos = inscritos.filter((i) => i.tipo === "externo").length;
      const p = Math.round((e.inscritos / e.total) * 100);
      const editable = Boolean(e.fecha) && !e.terminado;
      return `
        <section class="pantalla pantalla--app pantalla--gris">
          ${UI.barraVolver(`EVENTOS / ${recortar(e.titulo.toUpperCase(), 22)}`)}
          <div class="app-contenido detalle">
            <div class="detalle__foto detalle__foto--evento">
              <img src="img/${encodeURI(e.foto)}" alt="${UI.escapar(e.titulo)}">
              <span class="etiqueta${e.terminado ? " etiqueta--gris" : ""}">${e.terminado ? "Finalizado" : "Publicado"}</span>
            </div>
            <div>
              <h1 class="titulo">${UI.escapar(e.titulo)}</h1>
              <p class="detalle__lugar">${fechaEvento(e)} · ${e.hora} · ${lugarDe(e.deporte)}</p>
            </div>
            <div class="datos">
              ${caja("personas", "Inscritos", `${e.inscritos} de ${e.total}`)}
              ${caja("sell", "Recaudado", dinero(recaudado))}
              ${caja("personas", "Externos", externos)}
            </div>
            <div class="caja-morada">
              <p class="caja-morada__sobre">INSCRIPCIONES</p>
              <p class="horas-caja__cifra"><strong>${p}%</strong> del cupo</p>
              <div class="horas-caja__barra" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p}" aria-label="Cupo ocupado"><span style="width:${Math.min(100, p)}%"></span></div>
            </div>
          </div>
          <div class="app-pie">
            ${UI.boton("Ver lista de inscritos", { ir: `admin-inscritos/${e.id}` })}
            ${editable ? `<a class="boton boton--borde hoja__boton-segundo" href="#/admin-crear-evento/${e.id}" data-ir="admin-crear-evento/${e.id}">Editar evento</a>` : ""}
          </div>
        </section>`;
    }
  });

  UCA.registrar("admin-inscritos", {
    dibujar(dato) {
      const e = buscarEvento(dato);
      return `
        <section class="pantalla pantalla--app pantalla--gris">
          ${UI.barraVolver(`${recortar(e.titulo.toUpperCase(), 20)} / INSCRITOS`)}
          <div class="app-contenido">
            <div class="admin-cabecera">
              <h1 class="titulo">Inscritos</h1>
              <span class="etiqueta etiqueta--oscura etiqueta--lima">${e.inscritos} de ${e.total}</span>
            </div>
            <div class="campo__caja buscador">
              ${UI.icono("search", 20)}
              <input class="campo__entrada" type="search" data-buscar placeholder="Buscar por nombre o código" aria-label="Buscar inscritos">
            </div>
            ${pestanas([["todos", "Todos"], ["estudiante", "Estudiantes"], ["externo", "Externos"]], "todos")}
            <div class="inscritos" data-lista></div>
            <button type="button" class="enlace detalle-solicitud__enlace" data-exportar>${UI.icono("description", 18)}Exportar lista de inscritos</button>
          </div>
        </section>`;
    },
    alMostrar(contenedor, dato) {
      const e = buscarEvento(dato);
      const todos = inscritosDe(e);
      const estado = { tipo: "todos", texto: "" };
      const INSIGNIA = { Gratis: " etiqueta--gris", Pagado: "", Pendiente: " etiqueta--aviso" };
      const pintar = () => {
        const buscar = estado.texto
          .toLowerCase()
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "");
        const lista = todos.filter(
          (i) =>
            (estado.tipo === "todos" || i.tipo === estado.tipo) &&
            `${i.nombre} ${i.codigo}`
              .toLowerCase()
              .normalize("NFD")
              .replace(/[̀-ͯ]/g, "")
              .includes(buscar)
        );
        contenedor.querySelector("[data-lista]").innerHTML = lista.length
          ? lista
              .map(
                (i) => `
            <div class="inscrito">
              <span class="inicial${i.tipo === "externo" ? " inicial--oscura" : ""}">${iniciales(i.nombre)}</span>
              <span class="usuario-tarjeta__cuerpo"><span class="usuario-tarjeta__nombre">${i.nombre}</span><span class="usuario-tarjeta__texto">${i.tipo === "externo" ? "Usuario externo" : "Estudiante UCA"} · ${i.codigo}</span></span>
              <span class="etiqueta${INSIGNIA[i.pago]}">${i.pago}</span>
            </div>`
              )
              .join("")
          : `<p class="lista-vacia">No encontramos inscritos con esa búsqueda.</p>`;
      };
      contenedor.querySelector("[data-buscar]").addEventListener("input", (evento) => {
        estado.texto = evento.target.value;
        pintar();
      });
      activarPestanas(contenedor, (tipo) => {
        estado.tipo = tipo;
        pintar();
      });
      contenedor.querySelector("[data-exportar]").addEventListener("click", () => {
        const filas = [["Nombre", "Tipo", "Pago", "Código"], ...todos.map((i) => [i.nombre, i.tipo === "externo" ? "Usuario externo" : "Estudiante UCA", i.pago, i.codigo])];
        const texto = "﻿" + filas.map((f) => f.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");
        const enlace = document.createElement("a");
        enlace.href = URL.createObjectURL(new Blob([texto], { type: "text/csv;charset=utf-8" }));
        enlace.download = `inscritos-${e.fuente.id}.csv`;
        document.body.appendChild(enlace);
        enlace.click();
        enlace.remove();
        UI.avisar("Listo: la lista se descargó (se abre en Excel).");
      });
      pintar();
    }
  });

  /* ==========================================================
     80 a 83 · Tutorías
     Andrea (la estudiante de la app) aparece con sus datos reales:
     si administración la aprueba o le registra horas, ella lo ve.
     ========================================================== */
  const tutoriaDe = (id) => DATOS.tutorias.find((t) => t.id === id);
  function tutores() {
    const e = DATOS.estudiante;
    const propios = UCA.postulaciones
      .filter((p) => p.estado === "asignada")
      .map((p) => ({ id: `A-${p.tutoria}`, nombre: e.nombre, carrera: e.carrera, carnet: e.carnet, tutoria: p.tutoria, horas: p.horas || 0, estudiantes: p.estudiantes || 0, fuente: p, propio: true }));
    return [...propios, ...DATOS.tutoresAdmin.map((t) => ({ ...t, fuente: t, propio: false }))];
  }
  function postulaciones() {
    const e = DATOS.estudiante;
    const propias = UCA.postulaciones
      .filter((p) => p.estado === "revision")
      .map((p) => ({ id: `A-${p.tutoria}`, nombre: e.nombre, carrera: e.carrera, carnet: e.carnet, tutoria: p.tutoria, experiencia: p.experiencia || "Sin texto.", dias: p.dias || [], fecha: p.fecha, fuente: p, propio: true }));
    return [...propias, ...DATOS.postulacionesAdmin.filter((p) => p.estado === "revision").map((p) => ({ ...p, fuente: p, propio: false }))];
  }
  const buscarTutor = (id) => tutores().find((t) => t.id === id) || tutores()[0];

  UCA.registrar("admin-tutorias", {
    dibujar() {
      const lista = postulaciones();
      const activos = tutores();
      const horas = activos.reduce((suma, t) => suma + t.horas, 0);
      return `
        <section class="pantalla pantalla--app pantalla--gris">
          <div class="app-contenido">
            ${ruta("UCA SPORTS / TUTORÍAS")}
            <h1 class="titulo">Tutorías</h1>
            <div class="resumen-cajas">
              <div class="resumen-caja resumen-caja--morada"><strong>${lista.length}</strong>Postulaciones nuevas</div>
              <div class="resumen-caja"><strong>${activos.length}</strong>Tutores activos</div>
              <div class="resumen-caja"><strong>${horas} h</strong>Horas registradas</div>
            </div>
            <div>
              <p class="titulo-seccion">Postulaciones pendientes</p>
              <div class="lista-tarjetas sep-s">
                ${
                  lista.length
                    ? lista
                        .map((p) => {
                          const t = tutoriaDe(p.tutoria);
                          return `
                  <a class="postulante" href="#/admin-postulacion/${p.id}" data-ir="admin-postulacion/${p.id}">
                    <span class="inicial">${iniciales(p.nombre)}</span>
                    <span class="usuario-tarjeta__cuerpo">
                      <span class="usuario-tarjeta__nombre">${p.nombre}</span>
                      <span class="postulante__disciplina">${t.disciplina} · ${t.nivel}</span>
                      <span class="usuario-tarjeta__texto">${p.carrera}</span>
                    </span>
                    ${UI.icono("flecha", 22)}
                  </a>`;
                        })
                        .join("")
                    : `<p class="lista-vacia">No hay postulaciones por revisar.</p>`
                }
              </div>
            </div>
            <div>
              <p class="titulo-seccion">Tutores activos</p>
              <div class="lista-tarjetas sep-s">
                ${activos
                  .map((t) => {
                    const completo = t.horas >= DATOS.horasPorCiclo;
                    return `
                  <div class="tutor-tarjeta">
                    <div class="tutor-tarjeta__arriba">
                      <span class="inicial inicial--oscura">${iniciales(t.nombre)}</span>
                      <span class="usuario-tarjeta__cuerpo">
                        <span class="usuario-tarjeta__nombre">${t.nombre}</span>
                        <span class="usuario-tarjeta__texto">${tutoriaDe(t.tutoria).disciplina} · ${t.horas} de ${DATOS.horasPorCiclo} h</span>
                      </span>
                    </div>
                    <div class="tutor-tarjeta__barra"><span style="width:${Math.min(100, (t.horas / DATOS.horasPorCiclo) * 100)}%"></span></div>
                    ${
                      completo
                        ? `<p class="tutor-tarjeta__listo">${UI.icono("visto", 16)}Completó sus horas</p>`
                        : `<a class="tutor-tarjeta__accion" href="#/admin-registrar-horas/${t.id}" data-ir="admin-registrar-horas/${t.id}">${UI.icono("mas", 16)}Registrar horas</a>`
                    }
                  </div>`;
                  })
                  .join("")}
              </div>
            </div>
          </div>
          ${UI.navInferior("admin-tutorias", NAV)}
        </section>`;
    }
  });

  /* ---------- 81 · Detalle de postulación ---------- */
  UCA.registrar("admin-postulacion", {
    dibujar(dato) {
      const p = postulaciones().find((x) => x.id === dato);
      if (!p) return UCA.pantallas["admin-tutorias"].dibujar();
      const t = tutoriaDe(p.tutoria);
      return `
        <section class="pantalla pantalla--app pantalla--gris">
          ${UI.barraVolver("TUTORÍAS / POSTULACIÓN")}
          <div class="app-contenido">
            <span class="etiqueta etiqueta--aviso">Pendiente de revisión</span>
            <div class="postulante postulante--grande">
              <span class="inicial inicial--grande">${iniciales(p.nombre)}</span>
              <span class="usuario-tarjeta__cuerpo">
                <span class="usuario-tarjeta__nombre">${p.nombre}</span>
                <span class="usuario-tarjeta__texto">${p.carrera} · ${p.carnet}</span>
              </span>
              ${UI.icono("badge", 22)}
            </div>
            <div>
              <p class="campo__etiqueta">Disciplina</p>
              <span class="etiqueta etiqueta--morada">${t.disciplina} · ${t.nivel}</span>
            </div>
            <div class="motivo-caja">
              <p class="motivo-caja__sobre">EXPERIENCIA</p>
              <p>${UI.escapar(p.experiencia)}</p>
            </div>
            <div>
              <p class="campo__etiqueta">Disponibilidad</p>
              <div class="chips">${["Lun", "Mar", "Mié", "Jue", "Vie"].map((d) => `<span class="chip chip--chico${p.dias.includes(d) ? " chip--elegido" : ""}">${d}</span>`).join("")}</div>
            </div>
            <div class="requisitos-caja">
              <p class="motivo-caja__sobre">REQUISITOS</p>
              ${DATOS.requisitosTutor.map((r) => `<p class="requisitos-caja__item">${UI.icono("visto", 14)}${r}</p>`).join("")}
            </div>
          </div>
          <div class="app-pie">
            <button type="button" class="boton" data-aprobar>Aprobar y asignar tutoría</button>
            <button type="button" class="boton boton--borde-rojo hoja__boton-segundo" data-rechazar>Rechazar</button>
          </div>
        </section>`;
    },
    alMostrar(contenedor, dato) {
      const p = postulaciones().find((x) => x.id === dato);
      if (!p) return;
      const t = tutoriaDe(p.tutoria);
      const aprobar = contenedor.querySelector("[data-aprobar]");
      aprobar.addEventListener("click", () =>
        conCarga(aprobar, "Asignando…", () => {
          if (p.propio) {
            Object.assign(p.fuente, { estado: "asignada", horas: 0, estudiantes: 0, proxima: `${t.dias} · ${t.hora}`, dias: p.dias.length ? p.dias : t.dias.split(" y ") });
            avisarEstudiante({ categoria: "tutorias", icono: "estrella", titulo: "¡Postulación aprobada!", texto: `Ya eres tutora de ${t.disciplina.toLowerCase()}.`, ir: "mis-tutorias" });
          } else {
            p.fuente.estado = "aprobada";
            DATOS.tutoresAdmin.push({ id: `T-${p.id}`, nombre: p.nombre, carrera: p.carrera, carnet: p.carnet, tutoria: p.tutoria, horas: 0, estudiantes: 0 });
          }
          UCA.ir("admin-tutorias");
          UI.avisar(`${p.nombre} ya tiene asignada la tutoría de ${t.disciplina.toLowerCase()}.`);
        })
      );
      contenedor.querySelector("[data-rechazar]").addEventListener("click", () =>
        hojaMotivo({
          titulo: "Rechazar postulación",
          texto: `Se notificará a ${p.nombre} en la app.`,
          motivos: DATOS.motivosRechazoTutor,
          sugerencia: (m) =>
            ({ "Cupos llenos": `Los cupos de tutoría de ${t.disciplina.toLowerCase()} ya están llenos este ciclo.`, "No cumple requisitos": "Por ahora no cumples con todos los requisitos para ser tutor.", Otro: "" })[m],
          boton: "Rechazar postulación",
          alConfirmar: (motivo, mensaje) => {
            p.fuente.estado = "rechazada";
            p.fuente.motivo = mensaje;
            if (p.propio) avisarEstudiante({ categoria: "tutorias", icono: "alerta", titulo: "Postulación no aprobada", texto: mensaje, ir: "oportunidades-tutoria" });
            UCA.ir("admin-tutorias");
            UI.avisar(`Se notificó a ${p.nombre}.`);
          }
        })
      );
    }
  });

  /* ---------- 82 · Registrar horas sociales ---------- */
  const NUMERO_DIA = { lun: 1, mar: 2, mié: 3, mie: 3, jue: 4, vie: 5, sáb: 6, sab: 6 };
  function sesionesDe(tutoria) {
    const dias = tutoriaDe(tutoria)
      .dias.toLowerCase()
      .split(/\s*y\s*|,\s*/)
      .map((d) => NUMERO_DIA[d.slice(0, 3)])
      .filter(Boolean);
    const fechas = [];
    for (let i = 0; i < 14 && fechas.length < 2; i++) {
      const f = FECHA.sumarDias(HOY, -i);
      if (dias.includes(f.getDay())) fechas.push(f);
    }
    return fechas;
  }

  UCA.registrar("admin-registrar-horas", {
    dibujar(dato) {
      const t = buscarTutor(dato);
      const disciplina = tutoriaDe(t.tutoria).disciplina;
      const sesiones = sesionesDe(t.tutoria);
      const p = Math.min(100, (t.horas / DATOS.horasPorCiclo) * 100);
      return `
        <section class="pantalla pantalla--app pantalla--gris">
          ${UI.barraVolver(`TUTORES / ${t.nombre.toUpperCase()}`)}
          <div class="app-contenido editar-perfil">
            <h1 class="titulo">Registrar<br>horas sociales</h1>
            <div class="caja-morada">
              <span class="etiqueta">Tutor asignado</span>
              <div class="tutor-resumen">
                <p class="caja-morada__texto">${t.nombre} · ${disciplina}</p>
                <p class="tutor-resumen__horas">${t.horas} de ${DATOS.horasPorCiclo} h</p>
              </div>
              <div class="horas-caja__barra"><span style="width:${p}%"></span></div>
            </div>
            <fieldset class="grupo">
              <legend class="grupo__titulo">Sesión</legend>
              <div class="chips" data-zona-sesion>
                ${sesiones.map((f, i) => `<button type="button" class="chip chip--chico${i === 0 ? " chip--elegido" : ""}" data-sesion="${FECHA.clave(f)}" aria-pressed="${i === 0}">${FECHA.DIAS_CORTOS[f.getDay()]} ${f.getDate()} ${FECHA.MESES_CORTOS[f.getMonth()]}</button>`).join("")}
                <button type="button" class="chip chip--chico${sesiones.length ? "" : " chip--elegido"}" data-sesion="otra" aria-pressed="${!sesiones.length}">Otra fecha</button>
              </div>
              <div class="campo sep-s" data-zona-otra${sesiones.length ? " hidden" : ""}>
                <label class="sr-only" for="sesion-otra">Fecha de la sesión</label>
                <div class="campo__caja">${UI.icono("calendario", 18)}<input class="campo__entrada" id="sesion-otra" type="date" min="${FECHA.clave(FECHA.sumarDias(HOY, -30))}" max="${FECHA.clave(HOY)}"></div>
              </div>
            </fieldset>
            ${contador("Horas", "Duración de la sesión", 2, "horas")}
            ${contador("Asistentes", "Estudiantes en la tutoría", t.estudiantes || 10, "asistentes")}
            <div class="campo">
              <label class="campo__etiqueta" for="nota-horas">Nota (opcional)</label>
              <div class="campo__caja campo__caja--area">
                <textarea class="campo__entrada campo__area" id="nota-horas" maxlength="200" rows="2" placeholder="¿Qué trabajaron en la sesión?"></textarea>
              </div>
            </div>
          </div>
          <div class="app-pie"><button type="button" class="boton" data-registrar></button></div>
        </section>`;
    },
    alMostrar(contenedor, dato) {
      const t = buscarTutor(dato);
      const faltan = Math.max(0, DATOS.horasPorCiclo - t.horas);
      const sesiones = sesionesDe(t.tutoria);
      const estado = { sesion: sesiones.length ? FECHA.clave(sesiones[0]) : "otra", horas: Math.min(2, faltan), asistentes: t.estudiantes || 10 };
      const boton = contenedor.querySelector("[data-registrar]");
      const otra = contenedor.querySelector("#sesion-otra");
      const revisar = () => {
        const fecha = estado.sesion === "otra" ? otra.value : estado.sesion;
        boton.disabled = !faltan || !fecha || estado.horas < 1;
        boton.textContent = faltan ? `Registrar ${estado.horas} ${estado.horas === 1 ? "hora" : "horas"}` : "Ya completó sus horas";
      };
      activarChips(contenedor.querySelector("[data-zona-sesion]"), "sesion", (valor) => {
        estado.sesion = valor;
        contenedor.querySelector("[data-zona-otra]").hidden = valor !== "otra";
        revisar();
      });
      otra.addEventListener("change", revisar);
      activarContador(contenedor, "horas", () => estado.horas, (v) => (estado.horas = v), () => Math.min(1, faltan), () => Math.min(4, faltan), revisar);
      activarContador(contenedor, "asistentes", () => estado.asistentes, (v) => (estado.asistentes = v), () => 1, () => 30);
      boton.addEventListener("click", () => {
        const fecha = estado.sesion === "otra" ? otra.value : estado.sesion;
        if (boton.disabled || !fecha) return;
        conCarga(boton, "Registrando…", () => {
          t.fuente.horas = (t.fuente.horas || 0) + estado.horas;
          t.fuente.estudiantes = estado.asistentes;
          DATOS.registrosHoras.unshift({ tutor: t.id, fecha, horas: estado.horas, asistentes: estado.asistentes, nota: contenedor.querySelector("#nota-horas").value.trim() });
          if (t.propio) {
            avisarEstudiante({
              categoria: "tutorias",
              icono: "estrella",
              titulo: "Horas sociales registradas",
              texto: `Sumaste ${estado.horas} ${estado.horas === 1 ? "hora" : "horas"}. Llevas ${t.fuente.horas} de ${DATOS.horasPorCiclo}.`,
              ir: "mis-tutorias"
            });
          }
          UCA.ir(`admin-horas-registradas/${t.id}`);
        });
      });
      revisar();
    }
  });

  /* ---------- 83 · Horas registradas ---------- */
  UCA.registrar("admin-horas-registradas", {
    dibujar(dato) {
      const t = buscarTutor(dato);
      const r = DATOS.registrosHoras.find((x) => x.tutor === t.id) || { fecha: FECHA.clave(HOY), horas: 0, asistentes: 0 };
      const p = Math.min(100, (t.horas / DATOS.horasPorCiclo) * 100);
      return `
        <section class="pantalla pantalla--oscura">
          ${UI.marca(true)}
          <span class="circulo circulo--grande exito__icono">${UI.icono("estrella", 34)}</span>
          <span class="etiqueta exito__etiqueta">HORAS REGISTRADAS</span>
          <h1 class="titulo exito__titulo">+${r.horas} ${r.horas === 1 ? "hora" : "horas"} para<br>${t.nombre}</h1>
          <p class="parrafo exito__texto">Se notificó al estudiante en la app.</p>
          <div class="caja-morada horas-caja">
            <p class="caja-morada__sobre">HORAS SOCIALES</p>
            <p class="horas-caja__cifra"><strong>${t.horas}</strong> de ${DATOS.horasPorCiclo} horas</p>
            <div class="horas-caja__barra"><span style="width:${p}%"></span></div>
            <p class="caja-morada__pie">Sesión del ${FECHA.diaYNumero(FECHA.leer(r.fecha))} ${FECHA.MESES_CORTOS[FECHA.leer(r.fecha).getMonth()]} · ${r.asistentes} asistentes</p>
          </div>
          <div class="al-fondo exito__acciones">${UI.boton("Volver a tutorías", { ir: "admin-tutorias" })}</div>
        </section>`;
    }
  });
})();
