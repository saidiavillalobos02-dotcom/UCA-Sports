/* ==========================================================
   pantallas-comunidad.js — Avisos, noticias, eventos y actividades
   16 · Notificaciones           17 · Detalle de noticia
   24 · Calendario de eventos
   25 · Evento sin costo  26 · Evento con costo   (#/evento/<id>)
   33 · Actividad sin costo  34 · Actividad con costo (misma pantalla)
   Hoja "Tu equipo" (eventos por equipo)
   27 · Pago de inscripción · 27a · Pago con tarjeta · 27b · Transferencia
   28 · Inscripción confirmada (con pago, sin costo o en revisión)
   Los datos (eventos, actividades, avisos) están en datos.js
   ========================================================== */

(() => {
  const HOY = new Date(DATOS.hoy.getFullYear(), DATOS.hoy.getMonth(), DATOS.hoy.getDate());
  const dinero = (cantidad) => `$${cantidad.toFixed(2)}`;
  const buscar = (id) => DATOS.eventos.find((e) => e.id === id) || DATOS.actividades.find((a) => a.id === id);
  const esEvento = (item) => DATOS.eventos.includes(item);
  const yaInscrito = (id) => UCA.inscripciones.some((i) => i.id === id);
  const nuevoCodigo = () => `INS-${1000 + Math.floor(Math.random() * 9000)}`;
  const personasTexto = (n) => `${n} ${n === 1 ? "persona" : "personas"}`;

  // "Vie 20 nov · 4:00 p. m." (evento) o "Mar y jue · 5:00 p. m." (actividad)
  const cuando = (item) => (esEvento(item) ? `${FECHA.mini(FECHA.leer(item.fecha))} · ${item.hora}` : `${item.dias} · ${item.hora}`);

  /* ---------- 16 · Notificaciones ---------- */
  const FILTROS_AVISOS = [
    ["todos", "Todos"],
    ["reservas", "Reservas"],
    ["eventos", "Eventos"],
    ["tutorias", "Tutorías"]
  ];

  UCA.registrar("notificaciones", {
    dibujar() {
      return `
        <section class="pantalla pantalla--app pantalla--gris">
          ${UI.barraVolver("UCA SPORTS / AVISOS")}
          <div class="app-contenido">
            <h1 class="titulo">Tus avisos</h1>
            <div class="filtros" aria-label="Filtrar avisos">
              ${FILTROS_AVISOS.map(([valor, texto], i) => `<button type="button" class="filtro${i === 0 ? " filtro--activo" : ""}" data-filtro="${valor}" aria-pressed="${i === 0}">${texto}</button>`).join("")}
            </div>
            <div class="avisos" data-lista></div>
          </div>
        </section>`;
    },
    alMostrar(contenedor) {
      let filtro = "todos";
      const lista = contenedor.querySelector("[data-lista]");

      const pintar = () => {
        const avisos = DATOS.avisos.filter((a) => filtro === "todos" || a.categoria === filtro);
        if (!avisos.length) {
          lista.innerHTML = `<p class="avisos__vacio">No tienes avisos de este tipo.</p>`;
          return;
        }
        const grupos = [...new Set(avisos.map((a) => a.grupo))];
        lista.innerHTML = grupos
          .map(
            (grupo) => `
            <p class="avisos__grupo">${grupo}</p>
            ${avisos
              .filter((a) => a.grupo === grupo)
              .map(
                (a) => `
                <a class="aviso-item${a.leido ? "" : " aviso-item--nuevo"}" href="#/${a.ir}" data-aviso="${a.id}">
                  <span class="aviso-item__icono">${UI.icono(a.icono, 18)}</span>
                  <span class="aviso-item__cuerpo">
                    <span class="aviso-item__titulo">${a.titulo}</span>
                    <span class="aviso-item__texto">${UI.escapar(a.texto)}</span>
                  </span>
                  <span class="aviso-item__tiempo">${a.tiempo}</span>
                  ${a.leido ? "" : '<span class="aviso-item__punto"><span class="sr-only">Sin leer</span></span>'}
                </a>`
              )
              .join("")}`
          )
          .join("");
      };

      contenedor.querySelector(".pantalla").addEventListener("click", (evento) => {
        const botonFiltro = evento.target.closest("[data-filtro]");
        if (botonFiltro) {
          filtro = botonFiltro.dataset.filtro;
          contenedor.querySelectorAll("[data-filtro]").forEach((otro) => {
            otro.classList.toggle("filtro--activo", otro === botonFiltro);
            otro.setAttribute("aria-pressed", String(otro === botonFiltro));
          });
          pintar();
          return;
        }
        const enlace = evento.target.closest("[data-aviso]");
        if (enlace) {
          // Al abrir un aviso, queda como leído
          evento.preventDefault();
          const aviso = DATOS.avisos.find((a) => a.id === enlace.dataset.aviso);
          aviso.leido = true;
          UCA.ir(aviso.ir);
        }
      });

      pintar();
    }
  });

  /* ---------- 17 · Detalle de noticia ---------- */
  UCA.registrar("detalle-noticia", {
    dibujar() {
      const n = DATOS.noticia;
      return `
        <section class="pantalla pantalla--app pantalla--gris">
          ${UI.barraVolver("UCA SPORTS / NOTICIAS")}
          <div class="app-contenido detalle">
            <div class="detalle__foto detalle__foto--noticia">
              <img src="img/${encodeURI(n.foto)}" alt="Entrenamiento en el Polideportivo">
              <span class="etiqueta">${n.etiqueta}</span>
            </div>
            <div>
              <h1 class="titulo">${n.titulo}</h1>
              <p class="detalle__sobre detalle__sobre--gris">${n.fecha}</p>
              <p class="detalle__texto detalle__texto--oscuro">${n.texto}</p>
            </div>
            <div class="caja-morada">
              <p class="caja-morada__sobre">ENTRENAMIENTOS ABIERTOS</p>
              <ul class="lista-visto">
                ${n.entrenamientos.map((e) => `<li>${UI.icono("visto", 16)}${e}</li>`).join("")}
              </ul>
            </div>
          </div>
          <div class="app-pie">${UI.boton("Ver actividades", { ir: "estudiante-actividades" })}</div>
        </section>`;
    }
  });

  /* ---------- 24 · Calendario de eventos ---------- */
  const FILTROS_EVENTOS = [
    ["todos", "Todos"],
    ["gratis", "Gratis"],
    ["costo", "Con costo"],
    ["Fútbol", "Fútbol"],
    ["Voleibol", "Voleibol"],
    ["Básquetbol", "Básquetbol"]
  ];

  UCA.registrar("calendario-eventos", {
    dibujar() {
      return `
        <section class="pantalla pantalla--app pantalla--gris">
          ${UI.barraVolver("COMUNIDAD / EVENTOS")}
          <div class="app-contenido">
            <h1 class="titulo">Próximos<br>eventos</h1>
            <div class="filtros" aria-label="Filtrar eventos">
              ${FILTROS_EVENTOS.map(([valor, texto], i) => `<button type="button" class="filtro${i === 0 ? " filtro--activo" : ""}" data-filtro="${valor}" aria-pressed="${i === 0}">${texto}</button>`).join("")}
            </div>
            <div class="calendario">
              <div class="calendario__cabecera">
                <p class="titulo-seccion" data-mes></p>
                <div class="calendario__flechas">
                  <button type="button" class="calendario__flecha" data-semana="-1" aria-label="Semana anterior">${UI.icono("flechaIzq", 24)}</button>
                  <button type="button" class="calendario__flecha" data-semana="1" aria-label="Semana siguiente">${UI.icono("flecha", 24)}</button>
                </div>
              </div>
              <div class="calendario__dias" data-dias></div>
            </div>
            <div class="eventos" data-lista></div>
          </div>
        </section>`;
    },
    alMostrar(contenedor) {
      const primerLunes = FECHA.lunesDe(HOY);
      const ultimoLunes = FECHA.sumarDias(primerLunes, 7 * (DATOS.semanasDisponibles - 1));
      const estado = { filtro: "todos", lunes: primerLunes, fecha: HOY };

      const pasaFiltro = (e) => {
        if (estado.filtro === "todos") return true;
        if (estado.filtro === "gratis") return !e.costo;
        if (estado.filtro === "costo") return e.costo > 0;
        return e.deporte === estado.filtro;
      };

      const pintar = () => {
        contenedor.querySelector("[data-mes]").textContent = FECHA.mes(FECHA.sumarDias(estado.lunes, 3));
        const [atras, adelante] = contenedor.querySelectorAll("[data-semana]");
        atras.disabled = estado.lunes <= primerLunes;
        adelante.disabled = estado.lunes >= ultimoLunes;

        let dias = "";
        for (let i = 0; i < 7; i++) {
          const fecha = FECHA.sumarDias(estado.lunes, i);
          const elegido = FECHA.clave(fecha) === FECHA.clave(estado.fecha);
          const conEvento = DATOS.eventos.some((e) => e.fecha === FECHA.clave(fecha) && pasaFiltro(e));
          dias += `
            <button type="button" class="dia${elegido ? " dia--elegido" : ""}" data-fecha="${FECHA.clave(fecha)}" aria-pressed="${elegido}"
              aria-label="${FECHA.DIAS[fecha.getDay()]} ${fecha.getDate()}${conEvento ? ", con eventos" : ""}"${fecha < HOY ? " disabled" : ""}>
              <span class="dia__letra">${FECHA.LETRAS[fecha.getDay()]}</span>
              <span class="dia__numero">${fecha.getDate()}</span>
              ${conEvento ? '<span class="dia__punto"></span>' : ""}
            </button>`;
        }
        contenedor.querySelector("[data-dias]").innerHTML = dias;

        // Eventos desde el día elegido, con el filtro activo
        const eventos = DATOS.eventos
          .filter((e) => FECHA.leer(e.fecha) >= estado.fecha && pasaFiltro(e))
          .sort((a, b) => a.fecha.localeCompare(b.fecha));

        contenedor.querySelector("[data-lista]").innerHTML = eventos.length
          ? eventos
              .map((e) => {
                const fecha = FECHA.leer(e.fecha);
                return `
                  <a class="evento-fila" href="#/evento/${e.id}" data-ir="evento/${e.id}">
                    <span class="evento-fila__fecha"><strong>${fecha.getDate()}</strong><small>${FECHA.MESES_CORTOS[fecha.getMonth()].toUpperCase()}</small></span>
                    <span class="evento-fila__cuerpo">
                      <span class="evento-fila__sobre">${e.deporte.toUpperCase()} · ${e.hora.toUpperCase()}</span>
                      <span class="evento-fila__titulo">${e.corto || e.titulo}</span>
                      <span class="evento-fila__texto">${yaInscrito(e.id) ? "Ya estás inscrito" : e.resumen || e.subtitulo}</span>
                    </span>
                    <span class="etiqueta${e.costo ? " etiqueta--oscura" : ""}">${e.costo ? dinero(e.costo) : "Gratis"}</span>
                  </a>`;
              })
              .join("")
          : `<div class="vacio vacio--suave">
               <span class="vacio__icono">${UI.icono("trofeo", 28)}</span>
               <p class="vacio__titulo">No hay eventos</p>
               <p class="vacio__texto">No encontramos eventos desde este día con ese filtro. Prueba con otro.</p>
             </div>`;
      };

      contenedor.querySelector(".pantalla").addEventListener("click", (evento) => {
        const filtro = evento.target.closest("[data-filtro]");
        const dia = evento.target.closest("[data-fecha]");
        const semana = evento.target.closest("[data-semana]");
        if (filtro) {
          estado.filtro = filtro.dataset.filtro;
          contenedor.querySelectorAll("[data-filtro]").forEach((otro) => {
            otro.classList.toggle("filtro--activo", otro === filtro);
            otro.setAttribute("aria-pressed", String(otro === filtro));
          });
        } else if (dia) {
          estado.fecha = FECHA.leer(dia.dataset.fecha);
        } else if (semana) {
          estado.lunes = FECHA.sumarDias(estado.lunes, 7 * Number(semana.dataset.semana));
          estado.fecha = estado.lunes < HOY ? HOY : estado.lunes;
        } else {
          return;
        }
        pintar();
      });

      pintar();
    }
  });

  /* ---------- 25, 26, 33 y 34 · Detalle de evento o actividad ---------- */
  UCA.registrar("evento", {
    dibujar(dato) {
      const item = buscar(dato) || DATOS.eventos[0];
      const evento = esEvento(item);
      const cajas = evento
        ? [["calendario", "Fecha", FECHA.mini(FECHA.leer(item.fecha))], ["reloj", "Hora", item.hora], ["personas", "Cupo", `${item.cupo.inscritos} de ${item.cupo.total}`]]
        : [["calendario", "Días", item.dias], ["reloj", "Hora", item.hora], ["personas", "Cupo", `${item.libres} libres`]];

      const costo = item.costo
        ? `<div class="costo-caja">
             <p class="costo-caja__sobre">COSTO DE PARTICIPACIÓN</p>
             <div class="costo-caja__fila">
               <p class="costo-caja__precio">${dinero(item.costo)}</p>
               <p class="costo-caja__detalle">${item.detalleCosto}</p>
             </div>
           </div>`
        : `<div class="caja-morada caja-morada--fila">
             <span class="circulo">${UI.icono("visto", 20)}</span>
             <div>
               <p class="caja-morada__sobre">SIN COSTO</p>
               <p class="caja-morada__texto">${evento ? "Inscripción gratuita para estudiantes UCA." : "Actividad gratuita para estudiantes UCA."}</p>
             </div>
           </div>`;

      const lleno = evento ? item.cupo.inscritos >= item.cupo.total : item.libres <= 0;
      const textoBoton = evento ? (item.costo ? "Inscribirme y pagar" : "Inscribirme") : item.boton;
      let pie;
      if (yaInscrito(item.id)) {
        pie = `<button type="button" class="boton" disabled>Ya estás inscrito</button>
               ${UI.enlace("Ver mis inscripciones", "mis-inscripciones", "app-pie__enlace")}`;
      } else if (lleno) {
        pie = `<button type="button" class="boton" disabled>Cupo lleno</button>`;
      } else {
        pie = `<button type="button" class="boton" data-inscribir>${textoBoton}</button>`;
      }

      return `
        <section class="pantalla pantalla--app pantalla--gris">
          ${UI.barraVolver(`${evento ? "EVENTOS" : "ACTIVIDADES"} / ${item.deporte.toUpperCase()}`)}
          <div class="app-contenido detalle">
            <div class="detalle__foto detalle__foto--evento">
              <img src="img/${encodeURI(item.foto)}" alt="${item.titulo}">
              <span class="etiqueta${item.costo ? " etiqueta--oscura" : ""}">${item.costo ? dinero(item.costo) : "Gratis"}</span>
            </div>
            <div>
              <p class="detalle__sobre">${item.sobre}</p>
              <h1 class="titulo">${item.titulo}</h1>
              <p class="detalle__lugar">${item.subtitulo}</p>
            </div>
            <div class="datos">
              ${cajas
                .map(
                  ([icono, nombre, valor]) => `
                <div class="dato">
                  ${UI.icono(icono, 20)}
                  <p class="dato__nombre">${nombre}</p>
                  <p class="dato__valor">${valor}</p>
                </div>`
                )
                .join("")}
            </div>
            ${costo}
          </div>
          <div class="app-pie">${pie}</div>
        </section>`;
    },
    alMostrar(contenedor, dato) {
      const item = buscar(dato) || DATOS.eventos[0];
      const boton = contenedor.querySelector("[data-inscribir]");
      if (!boton) return;
      const estado = { item, equipo: "", personas: item.equipo ? item.equipo.min : 1, referencia: nuevoCodigo() };
      boton.addEventListener("click", () => {
        if (item.equipo) hojaEquipo(estado);
        else if (item.costo) hojaPago(estado);
        else confirmar(estado, { tipo: "gratis" }, boton);
      });
    }
  });

  /* ---------- Hoja · Tu equipo (eventos por equipo) ---------- */
  function hojaEquipo(estado) {
    const { item } = estado;
    const { min, max } = item.equipo;
    const fijo = min === max;
    const hoja = UI.abrirHoja(
      `
      <h2 class="hoja__titulo">Inscribe a tu equipo</h2>
      <p class="hoja__texto">${item.corto || item.titulo} · ${cuando(item)}</p>
      <form class="hoja__formulario" data-formulario novalidate>
        ${UI.campo({ id: "equipo", etiqueta: "Nombre del equipo", marcador: "Ej. Los Búhos", valor: estado.equipo, validar: "equipo" })}
        ${
          fijo
            ? `<p class="hoja__nota">${UI.icono("personas", 18)}Equipos de ${min} personas</p>`
            : `<div class="contador">
                 <div>
                   <p class="contador__titulo">Integrantes</p>
                   <p class="contador__texto">De ${min} a ${max} personas</p>
                 </div>
                 <div class="contador__control">
                   <button type="button" class="contador__boton" data-restar aria-label="Quitar un integrante">${UI.icono("menos", 18)}</button>
                   <output class="contador__valor" data-personas aria-live="polite">${estado.personas}</output>
                   <button type="button" class="contador__boton contador__boton--mas" data-sumar aria-label="Agregar un integrante">${UI.icono("mas", 18)}</button>
                 </div>
               </div>`
        }
        <button type="submit" class="boton hoja__boton">${item.costo ? "Continuar al pago" : "Confirmar inscripción"}</button>
      </form>`,
      "Tu equipo"
    );

    const formulario = hoja.querySelector("form");
    UI.activarFormularios(hoja);

    const restar = hoja.querySelector("[data-restar]");
    const sumar = hoja.querySelector("[data-sumar]");
    const actualizarContador = () => {
      if (!restar) return;
      hoja.querySelector("[data-personas]").textContent = estado.personas;
      restar.disabled = estado.personas <= min;
      sumar.disabled = estado.personas >= max;
    };
    if (restar) {
      restar.addEventListener("click", () => {
        estado.personas = Math.max(min, estado.personas - 1);
        actualizarContador();
      });
      sumar.addEventListener("click", () => {
        estado.personas = Math.min(max, estado.personas + 1);
        actualizarContador();
      });
      actualizarContador();
    }

    formulario.addEventListener("submit", (evento) => {
      evento.preventDefault();
      const enviar = formulario.querySelector('button[type="submit"]');
      if (enviar.disabled) return;
      estado.equipo = formulario.querySelector("#equipo").value.trim();
      if (item.costo) hojaPago(estado);
      else confirmar(estado, { tipo: "gratis" }, enviar);
    });
  }

  /* Tarjeta blanca con lo que se paga (27, 27a, 27b) */
  const concepto = (item) => `
    <div class="concepto">
      <div>
        <p class="concepto__titulo">${item.corto || item.titulo}</p>
        <p class="concepto__texto">${cuando(item)}</p>
      </div>
      <p class="concepto__precio">${dinero(item.costo)}</p>
    </div>`;

  /* ---------- 27 · Pago de inscripción (hoja) ---------- */
  function hojaPago(estado) {
    const { item } = estado;
    const guardada = UCA.sesion.tarjeta;
    const metodo = (valor, icono, titulo, texto, elegido) => `
      <label class="opcion metodo${elegido ? " opcion--elegida" : ""}">
        <input class="opcion__entrada" type="radio" name="metodo" value="${valor}"${elegido ? " checked" : ""}>
        <span class="metodo__icono">${UI.icono(icono, 18)}</span>
        <span class="metodo__cuerpo"><span class="opcion__titulo">${titulo}</span><span class="opcion__texto">${texto}</span></span>
        <span class="opcion__radio" aria-hidden="true"></span>
      </label>`;

    const hoja = UI.abrirHoja(
      `
      <h2 class="hoja__titulo">Pago de inscripción</h2>
      ${concepto(item)}
      <p class="hoja__sobre">MÉTODO DE PAGO</p>
      <div class="opciones" role="radiogroup" aria-label="Método de pago">
        ${metodo("tarjeta", "credit_card", "Tarjeta de débito o crédito", guardada ? `${guardada.marca} •••• ${guardada.ultimos}` : "Visa o Mastercard", true)}
        ${metodo("transferencia", "account_balance", "Transferencia bancaria", "Sube tu comprobante después", false)}
      </div>
      <div class="total"><span>Total</span><strong>${dinero(item.costo)}</strong></div>
      <button type="button" class="boton hoja__boton" data-pagar>Pagar ${dinero(item.costo)}</button>
      <p class="pago-seguro">${UI.icono("candado", 14)}Pago seguro · Recibirás tu comprobante por correo.</p>`,
      "Pago de inscripción"
    );

    let elegido = "tarjeta";
    const pagar = hoja.querySelector("[data-pagar]");
    hoja.querySelectorAll('input[name="metodo"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        elegido = radio.value;
        hoja.querySelectorAll(".metodo").forEach((m) => m.classList.toggle("opcion--elegida", m.contains(radio)));
        pagar.textContent = elegido === "tarjeta" ? `Pagar ${dinero(item.costo)}` : "Continuar";
      });
    });

    pagar.addEventListener("click", () => {
      if (elegido === "transferencia") hojaTransferencia(estado);
      else if (guardada) confirmar(estado, { tipo: "tarjeta", texto: `${dinero(item.costo)} · ${guardada.marca} •••• ${guardada.ultimos}` }, pagar);
      else hojaTarjeta(estado);
    });
  }

  /* ---------- 27a · Pago con tarjeta (hoja) ---------- */
  function hojaTarjeta(estado) {
    const { item } = estado;
    const hoja = UI.abrirHoja(
      `
      <h2 class="hoja__titulo">Pago con tarjeta</h2>
      ${concepto(item)}
      <form class="hoja__formulario" data-formulario novalidate>
        ${UI.campo({ id: "numero-tarjeta", etiqueta: "Número de tarjeta", marcador: "0000 0000 0000 0000", modo: "numeric", validar: "tarjeta" })}
        ${UI.campo({ id: "titular", etiqueta: "Nombre del titular", marcador: "Como aparece en la tarjeta", validar: "nombre" })}
        <div class="campos-dos">
          ${UI.campo({ id: "vence", etiqueta: "Vence", marcador: "MM / AA", modo: "numeric", validar: "vence" })}
          ${UI.campo({ id: "cvv", etiqueta: "CVV", tipo: "password", marcador: "•••", modo: "numeric", validar: "cvv" })}
        </div>
        <label class="interruptor">
          <span>Guardar tarjeta para próximos pagos</span>
          <input class="interruptor__entrada" type="checkbox" role="switch" checked>
          <span class="interruptor__pista" aria-hidden="true"></span>
        </label>
        <div class="total"><span>Total</span><strong>${dinero(item.costo)}</strong></div>
        <button type="submit" class="boton hoja__boton">Pagar ${dinero(item.costo)}</button>
      </form>
      <p class="pago-seguro">${UI.icono("candado", 14)}Pago seguro · Recibirás tu comprobante por correo</p>
      <p class="pago-aviso">Es un prototipo: no escribas los datos de una tarjeta real.</p>`,
      "Pago con tarjeta"
    );

    const formulario = hoja.querySelector("form");
    UI.activarFormularios(hoja);
    formulario.addEventListener("submit", (evento) => {
      evento.preventDefault();
      const enviar = formulario.querySelector('button[type="submit"]');
      if (enviar.disabled) return;
      const numero = formulario.querySelector("#numero-tarjeta").value.replace(/\s/g, "");
      const marca = numero.startsWith("4") ? "Visa" : numero.startsWith("5") ? "Mastercard" : "Tarjeta";
      const ultimos = numero.slice(-4);
      // Solo se guardan la marca y los últimos 4 números, nunca la tarjeta completa
      if (formulario.querySelector(".interruptor__entrada").checked) UCA.sesion.tarjeta = { marca, ultimos };
      confirmar(estado, { tipo: "tarjeta", texto: `${dinero(item.costo)} · ${marca} •••• ${ultimos}` }, enviar);
    });
  }

  /* ---------- 27b · Transferencia · Subir comprobante (hoja) ---------- */
  function hojaTransferencia(estado) {
    const { item } = estado;
    const fila = (nombre, valor) => `<div class="resumen__fila"><span class="resumen__nombre">${nombre}</span><span class="resumen__valor">${valor}</span></div>`;
    const hoja = UI.abrirHoja(
      `
      <h2 class="hoja__titulo">Pago por transferencia</h2>
      ${concepto(item)}
      <p class="hoja__sobre">DATOS PARA TRANSFERIR</p>
      <div class="resumen resumen--banco">
        ${fila("Banco", DATOS.banco.nombre)}
        ${fila("Cuenta", DATOS.banco.cuenta)}
        ${fila("Titular", DATOS.banco.titular)}
        ${fila("Referencia", estado.referencia)}
      </div>
      <p class="hoja__sobre">COMPROBANTE DE PAGO</p>
      <label class="archivo">
        <input class="archivo__entrada" type="file" accept="image/*,application/pdf">
        <span class="archivo__icono">${UI.icono("upload_file", 22)}</span>
        <span class="archivo__cuerpo">
          <span class="archivo__nombre">Sube tu comprobante</span>
          <span class="archivo__texto">Foto o PDF · máximo 5 MB</span>
        </span>
        <span class="archivo__visto" hidden>${UI.icono("visto", 14)}</span>
      </label>
      <p class="campo__error" data-error-archivo aria-live="polite"></p>
      <button type="button" class="boton hoja__boton" data-enviar disabled>Enviar comprobante</button>
      <p class="pago-seguro">${UI.icono("candado", 14)}Revisaremos tu pago en 1 día hábil</p>`,
      "Pago por transferencia"
    );

    const entrada = hoja.querySelector(".archivo__entrada");
    const caja = hoja.querySelector(".archivo");
    const error = hoja.querySelector("[data-error-archivo]");
    const enviar = hoja.querySelector("[data-enviar]");

    entrada.addEventListener("change", () => {
      const archivo = entrada.files[0];
      error.innerHTML = "";
      if (!archivo) return;
      if (archivo.size > 5 * 1024 * 1024) {
        error.innerHTML = `${UI.icono("alerta", 14)}El archivo pesa más de 5 MB. Elige uno más liviano.`;
        entrada.value = "";
        caja.classList.remove("archivo--cargado");
        hoja.querySelector(".archivo__nombre").textContent = "Sube tu comprobante";
        hoja.querySelector(".archivo__texto").textContent = "Foto o PDF · máximo 5 MB";
        hoja.querySelector(".archivo__visto").hidden = true;
        enviar.disabled = true;
        return;
      }
      const tamano = archivo.size >= 1024 * 1024 ? `${(archivo.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(archivo.size / 1024))} KB`;
      caja.classList.add("archivo--cargado");
      hoja.querySelector(".archivo__nombre").textContent = archivo.name;
      hoja.querySelector(".archivo__texto").textContent = `${tamano} · Cargado · Toca para cambiarlo`;
      hoja.querySelector(".archivo__visto").hidden = false;
      enviar.disabled = false;
    });

    enviar.addEventListener("click", () => {
      confirmar(estado, { tipo: "transferencia", texto: `${dinero(item.costo)} · Transferencia` }, enviar);
    });
  }

  /* Guarda la inscripción y pasa a la pantalla 28 */
  function confirmar(estado, pago, boton) {
    const textos = { gratis: "Inscribiendo…", tarjeta: "Procesando pago…", transferencia: "Enviando comprobante…" };
    boton.disabled = true;
    boton.classList.add("boton--cargando");
    boton.textContent = textos[pago.tipo];

    setTimeout(() => {
      const { item } = estado;
      const evento = esEvento(item);
      const enRevision = pago.tipo === "transferencia";
      const inscripcion = {
        codigo: estado.referencia,
        id: item.id,
        titulo: item.corto || item.titulo,
        equipo: item.equipo ? { nombre: estado.equipo, personas: estado.personas } : null,
        pago: {
          tipo: pago.tipo,
          texto: pago.tipo === "gratis" ? "Gratis · Sin pago" : pago.texto,
          estado: pago.tipo === "gratis" ? "gratis" : enRevision ? "revision" : "aprobado"
        },
        fecha: FECHA.clave(DATOS.hoy)
      };
      if (evento) item.cupo.inscritos += 1;
      else item.libres -= 1;

      UCA.inscripciones.unshift(inscripcion);
      UCA.sesion.inscripcion = inscripcion;
      DATOS.avisos.unshift({
        id: `i-${Date.now()}`,
        grupo: "HOY",
        categoria: "eventos",
        icono: enRevision ? "reloj" : "visto",
        titulo: enRevision ? "Comprobante recibido" : "Inscripción confirmada",
        texto: `${inscripcion.titulo} · ${cuando(item)}`,
        tiempo: "Ahora",
        leido: false,
        ir: "mis-inscripciones"
      });
      UCA.ir("inscripcion-confirmada");
    }, 900);
  }

  /* ---------- 28 · Inscripción confirmada ---------- */
  UCA.registrar("inscripcion-confirmada", {
    dibujar() {
      // Si se entra directo, se muestra el ejemplo de Figma
      const ins = UCA.sesion.inscripcion || {
        codigo: "INS-2093",
        id: "torneo-voleibol",
        titulo: "Torneo de voleibol",
        equipo: { nombre: "Los Búhos", personas: 4 },
        pago: { tipo: "tarjeta", texto: "$3.00 · Visa •••• 4821", estado: "aprobado" },
        fecha: FECHA.clave(DATOS.hoy)
      };
      const item = buscar(ins.id);
      const evento = esEvento(item);
      const revision = ins.pago.estado === "revision";
      const insignias = { gratis: "Sin costo", aprobado: "Pago aprobado", revision: "En revisión" };
      const fila = (nombre, valor) => `<div class="resumen__fila"><span class="resumen__nombre">${nombre}</span><span class="resumen__valor">${valor}</span></div>`;

      // "p. m." ya termina en punto: no se agrega otro
      const punto = item.hora.endsWith(".") ? "" : ".";
      const texto = revision
        ? "Revisaremos tu pago en 1 día hábil y te avisaremos cuando quede confirmado."
        : evento
          ? `Te esperamos el ${FECHA.diaYNumero(FECHA.leer(item.fecha))} a las ${item.hora}${punto}`
          : `Te esperamos ${item.diasLargo} a las ${item.hora}${punto}`;

      return `
        <section class="pantalla pantalla--oscura">
          ${UI.marca(true)}
          <span class="circulo circulo--grande exito__icono">${UI.icono(revision ? "reloj" : "visto", 34)}</span>
          <span class="etiqueta exito__etiqueta">${revision ? "INSCRIPCIÓN EN REVISIÓN" : "INSCRIPCIÓN CONFIRMADA"}</span>
          <h1 class="titulo exito__titulo">${revision ? "¡Recibimos tu<br>comprobante!" : item.confirmacion}</h1>
          <p class="parrafo exito__texto">${texto}</p>
          <div class="resumen resumen--comprobante">
            <div class="resumen__cabecera">
              <p class="resumen__sobre">COMPROBANTE</p>
              <span class="etiqueta${revision ? " etiqueta--aviso" : ""}">${insignias[ins.pago.estado]}</span>
            </div>
            ${evento ? fila("Evento", ins.titulo) : fila(item.etiqueta, item.nombre)}
            ${ins.equipo ? fila("Equipo", `${UI.escapar(ins.equipo.nombre)} · ${personasTexto(ins.equipo.personas)}`) : ""}
            ${!evento && item.instructor ? fila("Instructor", item.instructor) : ""}
            ${fila("Pago", ins.pago.texto)}
            ${fila(ins.pago.tipo === "gratis" ? "Fecha de inscripción" : "Fecha de pago", FECHA.corta(FECHA.leer(ins.fecha)))}
            ${fila("Código", ins.codigo)}
          </div>
          <div class="al-fondo exito__acciones">
            ${UI.boton("Ver mis inscripciones", { ir: "mis-inscripciones" })}
            ${UI.enlace("Volver a actividades", "estudiante-actividades", "enlace--claro")}
          </div>
        </section>`;
    }
  });
})();
