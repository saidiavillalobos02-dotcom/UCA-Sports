/* ==========================================================
   pantallas-perfil.js — Perfil del estudiante
   35 · Perfil                35a · Editar perfil
   35b · Cambiar foto (hoja)  35c · Perfil actualizado (aviso)
   36 · Mis reservas (y 36a con una reserva cancelada)
   37 · Detalle de reserva    38 · Cancelar reserva (hoja)
   38a · Reserva cancelada
   39 · Mis inscripciones     40 · Mis tutorías
   Todo se calcula con lo que la persona tiene en ese momento
   (UCA.reservas, UCA.inscripciones, UCA.postulaciones).
   ========================================================== */

(() => {
  const HOY = new Date(DATOS.hoy.getFullYear(), DATOS.hoy.getMonth(), DATOS.hoy.getDate());
  const dinero = (cantidad) => `$${cantidad.toFixed(2)}`;
  const personasTexto = (n) => `${n} ${n === 1 ? "persona" : "personas"}`;
  const hora2 = (hora) => hora.padStart(5, "0"); // "9:00" → "09:00"

  /* ---------- Ayudas de reservas ---------- */
  const estadoDe = (r) => (r.estado === "cancelada" ? "cancelada" : FECHA.leer(r.fecha) < HOY ? "completada" : r.estado);
  const ordenar = (lista, alReves = false) =>
    [...lista].sort((a, b) => (alReves ? -1 : 1) * `${a.fecha} ${hora2(a.hora)}`.localeCompare(`${b.fecha} ${hora2(b.hora)}`));
  const proximas = () => ordenar(UCA.reservas.filter((r) => estadoDe(r) === "confirmada"));
  const historial = () => ordenar(UCA.reservas.filter((r) => estadoDe(r) !== "confirmada"), true);
  const buscarReserva = (codigo) => UCA.reservas.find((r) => r.codigo === codigo) || UCA.reservas[0];

  const ETIQUETAS_RESERVA = {
    confirmada: ["Confirmada", ""],
    completada: ["Completada", " etiqueta--gris"],
    cancelada: ["Cancelada", " etiqueta--cancelada"]
  };

  const tarjetaReserva = (r) => {
    const estado = estadoDe(r);
    const [texto, clase] = ETIQUETAS_RESERVA[estado];
    return `
      <a class="reserva-tarjeta${estado === "confirmada" ? " reserva-tarjeta--oscura" : ""}" href="#/detalle-reserva/${r.codigo}" data-ir="detalle-reserva/${r.codigo}">
        <span class="etiqueta${clase}">${texto}</span>
        <span class="reserva-tarjeta__titulo">${r.nombre}</span>
        <span class="reserva-tarjeta__fecha">${FECHA.mini(FECHA.leer(r.fecha))} · ${r.hora} – ${r.fin}</span>
        <span class="reserva-tarjeta__detalle">${UI.escapar(r.actividad)} · ${personasTexto(r.personas)}</span>
        ${UI.icono("flecha", 22)}
      </a>`;
  };

  /* ---------- Ayudas del perfil ---------- */
  const iniciales = (nombre) =>
    nombre
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join("");
  const avatar = (foto = DATOS.estudiante.foto) =>
    foto ? `<img class="avatar__foto" src="${foto}" alt="Tu foto de perfil">` : `<span class="avatar__iniciales">${iniciales(DATOS.estudiante.nombre)}</span>`;
  const horasSociales = () => UCA.postulaciones.filter((p) => p.estado === "asignada").reduce((suma, p) => suma + (p.horas || 0), 0);

  /* Pestañas (Próximas / Historial): devuelve el HTML */
  const pestanas = (opciones, activa) => `
    <div class="pestanas" role="tablist">
      ${opciones
        .map(([valor, texto]) => `<button type="button" class="pestana${valor === activa ? " pestana--activa" : ""}" role="tab" aria-selected="${valor === activa}" data-pestana="${valor}">${texto}</button>`)
        .join("")}
    </div>`;

  /* ---------- 35 · Perfil ---------- */
  UCA.registrar("estudiante-perfil", {
    dibujar() {
      const e = DATOS.estudiante;
      const nProximas = proximas().length;
      const sinLeer = DATOS.avisos.filter((a) => !a.leido).length;
      const horas = horasSociales();
      const totalReservas = UCA.reservas.filter((r) => r.estado !== "cancelada").length;
      const menu = [
        ["calendario", "Mis reservas", nProximas ? `${nProximas} ${nProximas === 1 ? "próxima" : "próximas"}` : "Sin reservas próximas", "mis-reservas"],
        ["trofeo", "Mis inscripciones", "Partidos y actividades", "mis-inscripciones"],
        ["estrella", "Mis tutorías y horas sociales", `${horas} de ${DATOS.horasPorCiclo} horas`, "mis-tutorias"],
        ["campana", "Notificaciones", sinLeer ? `${sinLeer} sin leer` : "Todo al día", "notificaciones"],
        ["usuario", "Datos personales", "Nombre, foto y correo", "editar-perfil"]
      ];
      return `
        <section class="pantalla pantalla--app pantalla--gris">
          <div class="app-contenido perfil-pantalla">
            <p class="app-barra__ruta">UCA SPORTS / PERFIL</p>
            <div class="perfil-cabecera">
              <div class="avatar">
                ${avatar()}
                <a class="avatar__editar" href="#/editar-perfil" data-ir="editar-perfil" aria-label="Editar foto de perfil">${UI.icono("edit", 16)}</a>
              </div>
              <div class="perfil-cabecera__datos">
                <h1 class="perfil-cabecera__nombre">${UI.escapar(e.nombreVisible)}</h1>
                <p class="perfil-cabecera__texto">${e.carrera} · ${e.carnet}</p>
                <span class="etiqueta">Estudiante UCA</span>
              </div>
            </div>
            <div class="resumen-cajas">
              <a class="resumen-caja" href="#/mis-reservas" data-ir="mis-reservas"><strong>${totalReservas}</strong>Reservas</a>
              <a class="resumen-caja" href="#/mis-inscripciones" data-ir="mis-inscripciones"><strong>${UCA.inscripciones.length}</strong>Inscripciones</a>
              <a class="resumen-caja resumen-caja--morada" href="#/mis-tutorias" data-ir="mis-tutorias"><strong>${horas} h</strong>Horas sociales</a>
            </div>
            <nav class="menu-perfil" aria-label="Tu cuenta">
              ${menu
                .map(
                  ([icono, titulo, texto, ir]) => `
                <a class="menu-perfil__item" href="#/${ir}" data-ir="${ir}">
                  <span class="menu-perfil__icono">${UI.icono(icono, 18)}</span>
                  <span class="menu-perfil__cuerpo"><span class="menu-perfil__titulo">${titulo}</span><span class="menu-perfil__texto">${texto}</span></span>
                  ${UI.icono("flecha", 20)}
                </a>`
                )
                .join("")}
            </nav>
            <button type="button" class="cerrar-sesion" data-cerrar-sesion>${UI.icono("logout", 18)}Cerrar sesión</button>
          </div>
          ${UI.navInferior("estudiante-perfil")}
        </section>`;
    },
    alMostrar(contenedor) {
      contenedor.querySelector("[data-cerrar-sesion]").addEventListener("click", () => {
        const hoja = UI.abrirHoja(
          `
          <h2 class="hoja__titulo">¿Cerrar sesión?</h2>
          <p class="hoja__texto">Tendrás que volver a ingresar con tu correo institucional.</p>
          <button type="button" class="boton boton--peligro hoja__boton" data-salir>Sí, cerrar sesión</button>
          <button type="button" class="boton boton--borde hoja__boton-segundo" data-cerrar-hoja>Cancelar</button>`,
          "Cerrar sesión"
        );
        hoja.querySelector("[data-salir]").addEventListener("click", () => UCA.ir("bienvenida"));
      });
    }
  });

  /* ---------- 35a · Editar perfil (y 35b · Cambiar foto) ---------- */
  const MAXIMO_NOMBRE = 24;

  UCA.registrar("editar-perfil", {
    dibujar() {
      const e = DATOS.estudiante;
      return `
        <section class="pantalla pantalla--app pantalla--gris">
          ${UI.barraVolver("PERFIL / EDITAR PERFIL")}
          <div class="app-contenido editar-perfil">
            <h1 class="titulo">Editar perfil</h1>
            <div class="editar-foto">
              <div class="avatar avatar--grande" data-avatar>${avatar()}</div>
              <div>
                <p class="editar-foto__titulo">Foto de perfil</p>
                <p class="editar-foto__texto">JPG o PNG · máx. 5 MB</p>
                <button type="button" class="enlace editar-foto__boton" data-cambiar-foto>Cambiar foto</button>
              </div>
            </div>
            <div class="campo">
              <label class="campo__etiqueta" for="nombre-visible">Nombre para mostrar</label>
              <div class="campo__caja">
                <input class="campo__entrada" id="nombre-visible" type="text" maxlength="${MAXIMO_NOMBRE}" value="${UI.escapar(e.nombreVisible)}" autocomplete="nickname" aria-describedby="nombre-visible-ayuda">
                <span class="campo__contador" data-contador></span>
              </div>
              <p class="campo__ayuda" id="nombre-visible-ayuda">Así te verán en reservas, eventos y tutorías.</p>
              <p class="campo__error" data-error-nombre aria-live="polite"></p>
            </div>
            <div class="campo">
              <p class="campo__etiqueta">Nombre completo</p>
              <div class="campo__caja campo__caja--fija">${e.nombre}${UI.icono("candado", 18)}</div>
              <p class="campo__ayuda">Dato institucional · no se puede editar.</p>
            </div>
            <div class="campo">
              <p class="campo__etiqueta">Correo institucional</p>
              <div class="campo__caja campo__caja--fija">${e.correo}${UI.icono("candado", 18)}</div>
            </div>
            <div>
              <p class="campo__etiqueta">Carnet UCA</p>
              <div class="carnet">
                ${UI.icono("badge", 20)}
                <span class="carnet__texto">${e.carnet} · ${e.carrera}</span>
                <span class="carnet__visto" aria-label="Verificado">${UI.icono("visto", 14)}</span>
              </div>
            </div>
          </div>
          <div class="app-pie"><button type="button" class="boton" data-guardar disabled>Guardar cambios</button></div>
        </section>`;
    },
    alMostrar(contenedor) {
      const e = DATOS.estudiante;
      const estado = { nombre: e.nombreVisible, foto: e.foto };
      const entrada = contenedor.querySelector("#nombre-visible");
      const guardar = contenedor.querySelector("[data-guardar]");
      const errorNombre = contenedor.querySelector("[data-error-nombre]");

      const revisar = () => {
        const nombre = estado.nombre.trim();
        const valido = nombre.length >= 2;
        contenedor.querySelector("[data-contador]").textContent = `${estado.nombre.length} / ${MAXIMO_NOMBRE}`;
        errorNombre.innerHTML = valido ? "" : `${UI.icono("alerta", 14)}Escribe al menos 2 letras.`;
        entrada.closest(".campo").classList.toggle("campo--error", !valido);
        const cambio = nombre !== e.nombreVisible || estado.foto !== e.foto;
        guardar.disabled = !valido || !cambio;
        contenedor.querySelector("[data-avatar]").innerHTML = avatar(estado.foto);
      };

      entrada.addEventListener("input", () => {
        estado.nombre = entrada.value;
        revisar();
      });

      contenedor.querySelector("[data-cambiar-foto]").addEventListener("click", () => hojaFoto(estado, revisar));

      guardar.addEventListener("click", () => {
        guardar.disabled = true;
        guardar.classList.add("boton--cargando");
        guardar.textContent = "Guardando…";
        setTimeout(() => {
          e.nombreVisible = estado.nombre.trim();
          e.foto = estado.foto;
          UCA.ir("estudiante-perfil");
          // 35c · Perfil actualizado
          UI.avisar("Perfil actualizado. Tu nombre y foto ya están guardados.");
        }, 700);
      });

      revisar();
    }
  });

  /* ---------- 35b · Cambiar foto (hoja) ---------- */
  function hojaFoto(estado, alCambiar) {
    const hoja = UI.abrirHoja(
      `
      <h2 class="hoja__titulo">Foto de perfil</h2>
      <p class="hoja__texto">Elige cómo quieres actualizar tu foto.</p>
      <div class="lista-opciones">
        <label class="lista-opciones__item">
          <input class="archivo__entrada" type="file" accept="image/jpeg,image/png" capture="user" data-foto>
          <span class="menu-perfil__icono">${UI.icono("photo_camera", 18)}</span>
          <span class="menu-perfil__cuerpo"><span class="menu-perfil__titulo">Tomar una foto</span><span class="menu-perfil__texto">Usa la cámara de tu teléfono</span></span>
        </label>
        <label class="lista-opciones__item">
          <input class="archivo__entrada" type="file" accept="image/jpeg,image/png" data-foto>
          <span class="menu-perfil__icono">${UI.icono("photo_library", 18)}</span>
          <span class="menu-perfil__cuerpo"><span class="menu-perfil__titulo">Elegir de la galería</span><span class="menu-perfil__texto">Selecciona una imagen guardada</span></span>
        </label>
        <button type="button" class="lista-opciones__item lista-opciones__item--peligro" data-quitar${estado.foto ? "" : " disabled"}>
          <span class="menu-perfil__icono">${UI.icono("delete", 18)}</span>
          <span class="menu-perfil__cuerpo"><span class="menu-perfil__titulo">Eliminar foto actual</span><span class="menu-perfil__texto">Volverás a ver tus iniciales</span></span>
        </button>
      </div>
      <p class="campo__error" data-error-foto aria-live="polite"></p>
      <button type="button" class="enlace hoja__enlace" data-cerrar-hoja>Cancelar</button>`,
      "Foto de perfil"
    );

    const error = hoja.querySelector("[data-error-foto]");
    hoja.querySelectorAll("[data-foto]").forEach((entrada) => {
      entrada.addEventListener("change", () => {
        const archivo = entrada.files[0];
        if (!archivo) return;
        if (!/^image\/(jpeg|png)$/.test(archivo.type)) {
          error.innerHTML = `${UI.icono("alerta", 14)}La foto debe ser JPG o PNG.`;
          return;
        }
        if (archivo.size > 5 * 1024 * 1024) {
          error.innerHTML = `${UI.icono("alerta", 14)}La foto pesa más de 5 MB. Elige una más liviana.`;
          return;
        }
        const lector = new FileReader();
        lector.addEventListener("load", () => {
          estado.foto = lector.result;
          alCambiar();
          UI.cerrarHoja();
        });
        lector.readAsDataURL(archivo);
      });
    });
    hoja.querySelector("[data-quitar]").addEventListener("click", () => {
      estado.foto = "";
      alCambiar();
      UI.cerrarHoja();
    });
  }

  /* ---------- 36 · Mis reservas (y 36a) ---------- */
  UCA.registrar("mis-reservas", {
    dibujar() {
      return `
        <section class="pantalla pantalla--app pantalla--gris">
          ${UI.barraVolver("PERFIL / MIS RESERVAS")}
          <div class="app-contenido">
            <h1 class="titulo">Mis reservas</h1>
            ${pestanas([["proximas", "Próximas"], ["historial", "Historial"]], "proximas")}
            <div class="lista-tarjetas" data-lista></div>
            <a class="promo-reserva" href="#/estudiante-reservas" data-ir="estudiante-reservas">
              <span><span class="promo-reserva__sobre">¿TE TOCA JUGAR?</span><span class="promo-reserva__titulo">Haz una nueva reserva</span></span>
              <span class="promo-reserva__icono">${UI.icono("calendario", 18)}</span>
            </a>
          </div>
        </section>`;
    },
    alMostrar(contenedor) {
      const lista = contenedor.querySelector("[data-lista]");
      const pintar = (pestana) => {
        if (pestana === "proximas") {
          const prox = proximas();
          const recientes = historial().slice(0, 2);
          lista.innerHTML = `
            ${prox.length ? prox.map(tarjetaReserva).join("") : `<p class="lista-vacia">No tienes reservas próximas.</p>`}
            ${recientes.length ? `<h2 class="titulo-seccion lista-tarjetas__titulo">Historial reciente</h2>${recientes.map(tarjetaReserva).join("")}` : ""}`;
        } else {
          const todas = historial();
          lista.innerHTML = todas.length ? todas.map(tarjetaReserva).join("") : `<p class="lista-vacia">Aún no tienes reservas pasadas.</p>`;
        }
      };
      activarPestanas(contenedor, pintar);
      pintar("proximas");
    }
  });

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

  /* ---------- 37 · Detalle de reserva ---------- */
  UCA.registrar("detalle-reserva", {
    dibujar(dato) {
      const r = buscarReserva(dato);
      const cancha = DATOS.canchas[r.cancha];
      const estado = estadoDe(r);
      const [texto, clase] = ETIQUETAS_RESERVA[estado];
      const caja = (icono, nombre, valor) => `<div class="dato">${UI.icono(icono, 20)}<p class="dato__nombre">${nombre}</p><p class="dato__valor">${valor}</p></div>`;

      let pie;
      if (estado === "confirmada") {
        pie = `
          <button type="button" class="boton" data-calendario>Agregar a mi calendario</button>
          <button type="button" class="boton boton--borde-rojo hoja__boton-segundo" data-cancelar>Cancelar reserva</button>`;
      } else {
        pie = UI.boton("Reservar de nuevo", { ir: `detalle-cancha/${r.cancha}` });
      }

      return `
        <section class="pantalla pantalla--app pantalla--gris">
          ${UI.barraVolver("MIS RESERVAS / DETALLE")}
          <div class="app-contenido detalle">
            <div class="detalle__foto detalle__foto--reserva">
              <img src="img/${encodeURI(cancha.foto)}" alt="${cancha.nombre}">
              <span class="etiqueta${clase}">${texto}</span>
            </div>
            <div>
              <h1 class="titulo">${r.nombre}</h1>
              <p class="codigo-reserva">Código de reserva <span class="etiqueta etiqueta--oscura etiqueta--lima">${r.codigo}</span></p>
            </div>
            <div class="datos">
              ${caja("calendario", "Fecha", FECHA.mini(FECHA.leer(r.fecha)))}
              ${caja("reloj", "Hora", r.hora)}
              ${caja("personas", "Personas", r.personas)}
            </div>
            ${
              estado === "cancelada"
                ? `<div class="caja-gris"><p class="caja-gris__sobre">RESERVA CANCELADA</p><p>Motivo: ${r.motivo || "Sin motivo"}. El horario quedó libre para otros estudiantes.</p></div>`
                : `<div class="caja-morada caja-morada--estrella">
                     <p class="caja-morada__sobre">ANTES DE LLEGAR</p>
                     <p class="caja-morada__texto caja-morada__texto--ancho">Presenta tu carnet UCA en la entrada del Polideportivo 10 minutos antes de tu horario.</p>
                     ${UI.icono("location_on", 22)}
                   </div>`
            }
          </div>
          <div class="app-pie">${pie}</div>
        </section>`;
    },
    alMostrar(contenedor, dato) {
      const r = buscarReserva(dato);
      const botonCalendario = contenedor.querySelector("[data-calendario]");
      if (botonCalendario) botonCalendario.addEventListener("click", () => descargarCalendario(r));
      const botonCancelar = contenedor.querySelector("[data-cancelar]");
      if (botonCancelar) botonCancelar.addEventListener("click", () => hojaCancelar(r));
    }
  });

  /* "Agregar a mi calendario": descarga un archivo .ics que abre
     el calendario del teléfono o de la computadora */
  function descargarCalendario(r) {
    const fecha = r.fecha.replace(/-/g, "");
    const hora = (h) => `${hora2(h).replace(":", "")}00`;
    const contenido = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//UCA SPORTS//Prototipo//ES",
      "BEGIN:VEVENT",
      `UID:${r.codigo}@ucasports`,
      `DTSTAMP:${fecha}T000000`,
      `DTSTART:${fecha}T${hora(r.hora)}`,
      `DTEND:${fecha}T${hora(r.fin)}`,
      `SUMMARY:${r.nombre} · UCA SPORTS`,
      "LOCATION:Polideportivo UCA",
      `DESCRIPTION:Código ${r.codigo}. Presenta tu carnet UCA 10 minutos antes.`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");
    const enlace = document.createElement("a");
    enlace.href = URL.createObjectURL(new Blob([contenido], { type: "text/calendar" }));
    enlace.download = `reserva-${r.codigo}.ics`;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    UI.avisar("Listo: abre el archivo para agregarla a tu calendario.");
  }

  /* ---------- 38 · Cancelar reserva (hoja) ---------- */
  function hojaCancelar(r) {
    let motivo = DATOS.motivosCancelacion[0];
    const hoja = UI.abrirHoja(
      `
      <span class="circulo circulo--peligro">${UI.icono("alerta", 26)}</span>
      <h2 class="hoja__titulo sep-s">¿Cancelar esta reserva?</h2>
      <p class="hoja__texto">${r.nombre} · ${FECHA.mini(FECHA.leer(r.fecha))} · ${r.hora}. El horario quedará libre para otros estudiantes.</p>
      <p class="hoja__sobre">MOTIVO</p>
      <div class="chips">
        ${DATOS.motivosCancelacion.map((m, i) => `<button type="button" class="chip chip--chico${i === 0 ? " chip--elegido" : ""}" data-motivo="${m}" aria-pressed="${i === 0}">${m}</button>`).join("")}
      </div>
      <button type="button" class="boton boton--peligro hoja__boton" data-confirmar>Sí, cancelar reserva</button>
      <button type="button" class="boton boton--borde hoja__boton-segundo" data-cerrar-hoja>Mantener mi reserva</button>`,
      "Cancelar reserva"
    );

    hoja.querySelectorAll("[data-motivo]").forEach((chip) => {
      chip.addEventListener("click", () => {
        motivo = chip.dataset.motivo;
        hoja.querySelectorAll("[data-motivo]").forEach((otro) => {
          otro.classList.toggle("chip--elegido", otro === chip);
          otro.setAttribute("aria-pressed", String(otro === chip));
        });
      });
    });

    const confirmar = hoja.querySelector("[data-confirmar]");
    confirmar.addEventListener("click", () => {
      confirmar.disabled = true;
      confirmar.classList.add("boton--cargando");
      confirmar.textContent = "Cancelando…";
      setTimeout(() => {
        r.estado = "cancelada";
        r.motivo = motivo;
        DATOS.avisos.unshift({
          id: `c-${Date.now()}`,
          grupo: "HOY",
          categoria: "reservas",
          icono: "calendario",
          titulo: "Reserva cancelada",
          texto: `${r.nombre} · ${FECHA.mini(FECHA.leer(r.fecha))}, ${r.hora}`,
          tiempo: "Ahora",
          leido: false,
          ir: `detalle-reserva/${r.codigo}`
        });
        UCA.ir(`reserva-cancelada/${r.codigo}`);
      }, 800);
    });
  }

  /* ---------- 38a · Reserva cancelada ---------- */
  UCA.registrar("reserva-cancelada", {
    dibujar(dato) {
      const r = buscarReserva(dato);
      const fila = (nombre, valor) => `<div class="resumen__fila"><span class="resumen__nombre">${nombre}</span><span class="resumen__valor">${valor}</span></div>`;
      return `
        <section class="pantalla pantalla--oscura">
          ${UI.marca(true)}
          <span class="circulo circulo--grande exito__icono">${UI.icono("visto", 34)}</span>
          <span class="etiqueta exito__etiqueta">RESERVA CANCELADA</span>
          <h1 class="titulo exito__titulo">Tu reserva<br>fue cancelada</h1>
          <p class="parrafo exito__texto">El horario quedó libre para otros estudiantes.</p>
          <div class="resumen resumen--comprobante">
            <p class="resumen__sobre">RESUMEN</p>
            ${fila("Reserva", `${r.codigo} · ${r.nombre}`)}
            ${fila("Fecha y hora", `${FECHA.mini(FECHA.leer(r.fecha))} · ${r.hora} – ${r.fin}`)}
            ${fila("Horario", "Liberado")}
            ${fila("Costo", "Sin costo")}
          </div>
          <div class="al-fondo exito__acciones">${UI.boton("Volver a mis reservas", { ir: "mis-reservas" })}</div>
        </section>`;
    }
  });

  /* ---------- 39 · Mis inscripciones ---------- */
  const itemDe = (ins) => DATOS.eventos.find((e) => e.id === ins.id) || DATOS.actividades.find((a) => a.id === ins.id);
  // Fecha que se muestra: la del evento, o la próxima clase de la actividad
  const fechaDeItem = (item) => {
    if (item.fecha) return FECHA.leer(item.fecha);
    for (let i = 0; i < 7; i++) {
      const fecha = FECHA.sumarDias(HOY, i);
      if (item.diasNumero.includes(fecha.getDay())) return fecha;
    }
    return HOY;
  };
  const insigniaPago = (ins, item) =>
    ins.pago.estado === "gratis" ? "Gratis · Inscrito" : ins.pago.estado === "revision" ? `${dinero(item.costo)} · En revisión` : `${dinero(item.costo)} · Pagado`;

  UCA.registrar("mis-inscripciones", {
    dibujar() {
      return `
        <section class="pantalla pantalla--app pantalla--gris">
          ${UI.barraVolver("PERFIL / MIS INSCRIPCIONES")}
          <div class="app-contenido">
            <h1 class="titulo">Mis<br>inscripciones</h1>
            ${pestanas([["proximas", "Próximas"], ["pasadas", "Pasadas"]], "proximas")}
            <div class="lista-tarjetas" data-lista></div>
            <a class="buscas-mas" href="#/estudiante-actividades" data-ir="estudiante-actividades">
              <span><span class="buscas-mas__sobre">¿Buscas más?</span><span class="buscas-mas__titulo">Explora partidos y actividades</span></span>
              <span class="buscas-mas__icono">${UI.icono("trofeo", 18)}</span>
            </a>
          </div>
        </section>`;
    },
    alMostrar(contenedor) {
      const lista = contenedor.querySelector("[data-lista]");
      const pintar = (pestana) => {
        const conItem = UCA.inscripciones.map((ins) => ({ ins, item: itemDe(ins) })).filter((x) => x.item);
        const elegidas = conItem
          .filter(({ item }) => (pestana === "pasadas") === (Boolean(item.fecha) && FECHA.leer(item.fecha) < HOY))
          .sort((a, b) => fechaDeItem(a.item) - fechaDeItem(b.item));
        if (!elegidas.length) {
          lista.innerHTML = `<p class="lista-vacia">${pestana === "pasadas" ? "Aún no tienes inscripciones pasadas." : "No tienes inscripciones próximas."}</p>`;
          return;
        }
        lista.innerHTML = elegidas
          .map(({ ins, item }) => {
            const fecha = fechaDeItem(item);
            const esEvento = Boolean(item.fecha);
            return `
              <a class="inscripcion-tarjeta" href="#/evento/${item.id}" data-ir="evento/${item.id}">
                <span class="evento-fila__fecha"><strong>${fecha.getDate()}</strong><small>${FECHA.MESES_CORTOS[fecha.getMonth()].toUpperCase()}</small></span>
                <span class="inscripcion-tarjeta__cuerpo">
                  <span class="evento-fila__sobre">${item.deporte.toUpperCase()} · ${esEvento ? "EVENTO" : "ACTIVIDAD"}</span>
                  <span class="evento-fila__titulo">${ins.titulo}</span>
                  <span class="evento-fila__texto">${esEvento ? `${FECHA.mini(fecha)} · ${item.hora}` : `${item.dias} · ${item.hora}`}</span>
                  <span class="etiqueta etiqueta--suave">${insigniaPago(ins, item)}</span>
                </span>
                <span class="inscripcion-tarjeta__foto"><img src="img/${encodeURI(item.miniatura || item.foto)}" alt=""></span>
              </a>`;
          })
          .join("");
      };
      activarPestanas(contenedor, pintar);
      pintar("proximas");
    }
  });

  /* ---------- 40 · Mis tutorías ---------- */
  UCA.registrar("mis-tutorias", {
    dibujar() {
      const horas = horasSociales();
      const total = DATOS.horasPorCiclo;
      const faltan = Math.max(0, total - horas);
      const activas = UCA.postulaciones.filter((p) => p.estado === "asignada");
      const enRevision = UCA.postulaciones.filter((p) => p.estado === "revision");
      return `
        <section class="pantalla pantalla--app pantalla--gris">
          ${UI.barraVolver("PERFIL / MIS TUTORÍAS")}
          <div class="app-contenido">
            <h1 class="titulo">Mis tutorías</h1>
            <div class="caja-morada caja-morada--estrella horas-caja">
              <p class="caja-morada__sobre">HORAS SOCIALES</p>
              <p class="horas-caja__cifra"><strong>${horas}</strong> de ${total} horas</p>
              <div class="horas-caja__barra" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${horas}" aria-label="Horas sociales">
                <span style="width:${Math.min(100, (horas / total) * 100)}%"></span>
              </div>
              <p class="caja-morada__pie">${faltan ? `Te faltan ${faltan} horas para completar tu servicio social.` : "¡Completaste tus horas sociales de este ciclo!"}</p>
              ${UI.icono("estrella", 26)}
            </div>
            ${
              activas.length
                ? `<div><h2 class="titulo-seccion">Tutoría activa</h2>${activas
                    .map(
                      (t) => `
                  <div class="tutoria-activa">
                    <div class="tutoria-activa__cuerpo">
                      <span class="etiqueta">Asignada</span>
                      <p class="tutoria-activa__titulo">${t.disciplina} · ${t.nivel}</p>
                      <p class="tutoria-activa__texto">${t.dias.join(" y ").toLowerCase().replace(/^./, (l) => l.toUpperCase())} · ${(DATOS.tutorias.find((x) => x.id === t.tutoria) || {}).hora || ""} · ${t.estudiantes} estudiantes</p>
                      <p class="tutoria-activa__proxima">${UI.icono("reloj", 16)}Próxima sesión: ${t.proxima}</p>
                    </div>
                    <span class="tutoria-activa__foto"><img src="img/1.jpg" alt=""></span>
                  </div>`
                    )
                    .join("")}</div>`
                : ""
            }
            <div>
              <h2 class="titulo-seccion">Postulaciones</h2>
              ${
                enRevision.length
                  ? enRevision
                      .map((p) => {
                        const f = FECHA.leer(p.fecha);
                        return `
                    <div class="postulacion-tarjeta">
                      <span class="etiqueta etiqueta--aviso">En revisión</span>
                      <p class="postulacion-tarjeta__titulo">${p.disciplina} · ${p.nivel}</p>
                      <p class="postulacion-tarjeta__texto">Enviada el ${f.getDate()} ${FECHA.MESES_CORTOS[f.getMonth()]} · respuesta en 1 a 3 días</p>
                    </div>`;
                      })
                      .join("")
                  : `<p class="lista-vacia">No tienes postulaciones en revisión.</p>`
              }
            </div>
            <a class="convocatoria__enlace" href="#/oportunidades-tutoria" data-ir="oportunidades-tutoria">Ver más oportunidades ${UI.icono("arrow_forward", 16)}</a>
          </div>
        </section>`;
    }
  });
})();
