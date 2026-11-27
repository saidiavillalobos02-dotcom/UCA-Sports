/* ==========================================================
   pantallas-externo.js — App del usuario externo
   41 · Inicio                 42 · Reservas
   43 · Calendario y horarios  44 · Solicitud: tus datos
   45 · Solicitud: motivo      46 · Resumen de costo (hoja)
   47 · Solicitud: pago (47a tarjeta y 47b transferencia en hojas)
   48 · Pago realizado · en revisión
   49 · Solicitud aprobada     50 · Solicitud rechazada
   51 · Eventos               52/53 · Evento sin costo / con costo
   54 · Pago de inscripción (54a y 54b en hojas)
   55 · Inscripción confirmada (y 55b sin costo)
   56 · Perfil  (56a editar, 56b foto, 56c aviso)
   57 · Mis solicitudes      58 · Detalle de solicitud
   59 · Pagos y comprobantes
   También las variantes de ping pong (PP), taekwondo (TK) y gimnasio (GM).
   ========================================================== */

(() => {
  const HOY = new Date(DATOS.hoy.getFullYear(), DATOS.hoy.getMonth(), DATOS.hoy.getDate());
  const ULTIMO_DIA = FECHA.sumarDias(FECHA.lunesDe(HOY), DATOS.semanasDisponibles * 7 - 1);
  const E = DATOS.externo;
  const NAV = UI.NAV_EXTERNO;
  // Fotos de las tarjetas pequeñas (las mismas que usa el estudiante en sus listas)
  // Tarjetas del inicio exportadas de Figma (ya traen el nombre escrito)
  const TARJETA = { futbol: "Tarjeta futbol.jpg", voleibol: "Tarjeta voleibol.jpg", basquetbol: "Tarjeta basquetbol.jpg" };
  const FOTO_LISTA = {
    basquetbol: "Cancha de basquetbol.jpg",
    voleibol: "Cancha de voleibol.jpg",
    futbol: "Cancha de futbol.jpg",
    "ping-pong": "Fotografia de la cancha ping pong.jpg"
  };

  /* ---------- Ayudas generales ---------- */
  const dinero = (cantidad) => `$${cantidad.toFixed(2)}`;
  const dineroCorto = (cantidad) => (Number.isInteger(cantidad) ? `$${cantidad}` : dinero(cantidad));
  const personasTexto = (n) => `${n} ${n === 1 ? "persona" : "personas"}`;
  const horasTexto = (n) => `${n} ${n === 1 ? "hora" : "horas"}`;
  const mayuscula = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);
  const sumarHora = (hora, n) => `${String(Number(hora.split(":")[0]) + n).padStart(2, "0")}:00`;
  const numeroHora = (hora) => Number(hora.split(":")[0]);
  const fechaCorta = (fecha) => `${FECHA.DIAS[fecha.getDay()]} ${fecha.getDate()}`; // "Miércoles 18"
  const diaMes = (clave) => {
    const f = FECHA.leer(clave);
    return `${f.getDate()} ${FECHA.MESES_CORTOS[f.getMonth()]}`; // "17 nov"
  };
  const fila = (nombre, valor) => `<div class="resumen__fila"><span class="resumen__nombre">${nombre}</span><span class="resumen__valor">${valor}</span></div>`;
  const caja = (icono, nombre, valor, ajusta = false) =>
    `<div class="dato">${UI.icono(icono, 20)}<p class="dato__nombre">${nombre}</p><p class="dato__valor${ajusta ? " dato__valor--ajusta" : ""}">${valor}</p></div>`;
  const iniciales = (nombre) =>
    nombre
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join("");
  const avatar = (foto = E.foto) =>
    foto ? `<img class="avatar__foto" src="${foto}" alt="Tu foto de perfil">` : `<span class="avatar__iniciales">${iniciales(E.nombre)}</span>`;
  const nuevoCodigo = (prefijo, existentes) => {
    let codigo;
    do codigo = `${prefijo}-${1000 + Math.floor(Math.random() * 9000)}`;
    while (existentes.some((x) => x.codigo === codigo));
    return codigo;
  };
  const conCarga = (boton, texto, alTerminar, espera = 900) => {
    boton.disabled = true;
    boton.classList.add("boton--cargando");
    boton.textContent = texto;
    setTimeout(alTerminar, espera);
  };

  /* Descarga un archivo de texto (comprobantes) */
  function descargar(nombre, lineas) {
    const enlace = document.createElement("a");
    enlace.href = URL.createObjectURL(new Blob([lineas.join("\r\n")], { type: "text/plain;charset=utf-8" }));
    enlace.download = nombre;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
  }

  /* Pestañas (Todas / En revisión / Cerradas) */
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

  /* Filtros de arriba (Todos / Básquetbol...) */
  function activarFiltros(contenedor, alCambiar) {
    contenedor.querySelectorAll("[data-filtro]").forEach((boton) => {
      boton.addEventListener("click", () => {
        contenedor.querySelectorAll("[data-filtro]").forEach((otro) => {
          otro.classList.toggle("filtro--activo", otro === boton);
          otro.setAttribute("aria-pressed", String(otro === boton));
        });
        alCambiar(boton.dataset.filtro);
      });
    });
  }
  const filtros = (lista) => `
    <div class="filtros" aria-label="Filtrar">
      ${lista.map(([valor, texto], i) => `<button type="button" class="filtro${i === 0 ? " filtro--activo" : ""}" data-filtro="${valor}" aria-pressed="${i === 0}">${texto}</button>`).join("")}
    </div>`;

  /* Barra de avance de la solicitud (PASO 1 DE 3 · TUS DATOS) */
  const pasoSolicitud = (numero, texto) => `
    <div class="paso-solicitud">
      <p class="paso-solicitud__texto">PASO ${numero} DE 3 · ${texto}</p>
      <div class="paso-solicitud__barra" role="progressbar" aria-valuemin="0" aria-valuemax="3" aria-valuenow="${numero}" aria-label="Paso ${numero} de 3">
        <span style="width:${(numero / 3) * 100}%"></span>
      </div>
    </div>`;

  /* ==========================================================
     Disponibilidad de los espacios
     Igual que para estudiantes: una hora del día ya está ocupada
     por otra persona (de ejemplo), los domingos y días de
     mantenimiento no hay horarios, y también se ocupan las horas
     reservadas por estudiantes y las solicitudes externas.
     ========================================================== */
  const sePuedeReservar = (fecha) => fecha >= HOY && fecha <= ULTIMO_DIA;
  const horasDeSolicitud = (s) => Array.from({ length: s.horas }, (_, i) => sumarHora(s.hora, i));

  function horariosDe(id, fecha) {
    const cancha = DATOS.canchas[id];
    const clave = FECHA.clave(fecha);
    if (!sePuedeReservar(fecha) || DATOS.diasCerrados.includes(fecha.getDay()) || DATOS.mantenimiento.includes(clave)) return [];
    // Otras personas, otras solicitudes y bloqueos de administración: ver ocupacion.js
    return cancha.horas.map((hora) => {
      const estudiante = UCA.reservas.some((r) => r.cancha === id && r.fecha === clave && r.hora === hora && r.estado === "confirmada");
      const tuya = DATOS.solicitudes.some((s) => s.cancha === id && s.fecha === clave && s.estado !== "rechazada" && horasDeSolicitud(s).includes(hora));
      return { hora, ocupado: estudiante || tuya || OCUPACION.ocupadaPorOtros(id, fecha, hora), tuya };
    });
  }

  function proximosLibres(id, desde, cuantos) {
    const libres = [];
    for (let fecha = desde; fecha <= ULTIMO_DIA && libres.length < cuantos; fecha = FECHA.sumarDias(fecha, 1)) {
      const libre = horariosDe(id, fecha).find((h) => !h.ocupado);
      if (libre) libres.push({ fecha, hora: libre.hora });
    }
    return libres;
  }

  /* ---------- Lo que se está solicitando (pasa de pantalla en pantalla) ----------
     Si se entra directo a un paso, se usa el ejemplo de Figma */
  function solicitudActual() {
    if (!UCA.sesion.solicitud) {
      UCA.sesion.solicitud = {
        cancha: "futbol",
        fecha: "2026-11-18",
        horas: ["15:00", "16:00"],
        personas: 18,
        nombre: E.nombre,
        dui: E.dui,
        organizacion: E.organizacion,
        tipo: "",
        descripcion: "",
        extra: true
      };
    }
    return UCA.sesion.solicitud;
  }

  function costoDe(s) {
    const cancha = DATOS.canchas[s.cancha];
    const uso = s.horas.length * cancha.precioHora;
    const extra = s.extra ? cancha.extra.costo : 0;
    return { cancha, uso, extra, total: uso + extra };
  }

  const finDe = (s) => sumarHora(s.horas[s.horas.length - 1], 1);
  const resumenSolicitud = (s) => {
    const fecha = FECHA.leer(s.fecha);
    return `
      <div class="resumen-espacio">
        <div>
          <p class="resumen-espacio__sobre">${DATOS.canchas[s.cancha].nombre.toUpperCase()}</p>
          <p class="resumen-espacio__texto">${FECHA.mini(fecha)} · ${s.horas[0]} – ${finDe(s)} · ${dinero(costoDe(s).uso)}</p>
        </div>
        ${UI.icono("calendario", 22)}
      </div>`;
  };

  /* Busca una solicitud guardada (o la primera, si el código no existe) */
  const buscarSolicitud = (codigo) => DATOS.solicitudes.find((s) => s.codigo === codigo) || DATOS.solicitudes[0];
  const yaPaso = (s) => FECHA.leer(s.fecha) < HOY;

  const INSIGNIAS_SOLICITUD = {
    revision: ["En revisión", " etiqueta--aviso"],
    aprobada: ["Aprobada", ""],
    rechazada: ["No aprobada", " etiqueta--rechazada"]
  };
  const rutaDeSolicitud = (s) => (s.estado === "aprobada" ? `solicitud-aprobada/${s.codigo}` : s.estado === "rechazada" ? `solicitud-rechazada/${s.codigo}` : `detalle-solicitud/${s.codigo}`);

  /* Línea de pasos: pagada → en revisión → confirmada */
  function estadoPasos(s, claro = false) {
    const transferencia = s.pago.tipo === "transferencia";
    const primero = transferencia ? "Comprobante enviado" : "Pago realizado";
    const paso = (clase, marca, titulo, texto) => `
      <li class="estado-paso${clase}">
        <span class="estado-paso__marca">${marca}</span>
        <span><span class="estado-paso__titulo">${titulo}</span><span class="estado-paso__texto">${texto}</span></span>
      </li>`;
    let tercero;
    if (s.estado === "aprobada") tercero = paso(" estado-paso--hecho", UI.icono("visto", 14), "Reserva confirmada", `Código de acceso ${s.reserva}`);
    else if (s.estado === "rechazada") tercero = paso(" estado-paso--rechazado", UI.icono("close", 14), "No aprobada", "Te devolvemos el pago completo");
    else tercero = paso("", "", "Reserva confirmada", "Recibirás tu código de acceso");

    return `
      <ol class="estado-pasos${claro ? " estado-pasos--claro" : ""}" aria-label="Estado de la solicitud">
        <li class="estado-pasos__sobre estado-pasos__sobre--fila"><span>ESTADO</span>${claro ? "" : `<span class="etiqueta etiqueta--codigo">${s.codigo}</span>`}</li>
        ${paso(" estado-paso--hecho", UI.icono("visto", 14), primero, `${dinero(s.total)} · ${transferencia ? "Transferencia" : s.pago.texto}`)}
        ${paso(s.estado === "revision" ? " estado-paso--actual" : " estado-paso--hecho", s.estado === "revision" ? "" : UI.icono("visto", 14), "En revisión", s.estado === "revision" ? "Respuesta en 1 a 2 días hábiles" : "Revisada por administración")}
        ${tercero}
      </ol>`;
  }

  /* ==========================================================
     Pagos (se usan en la solicitud y en los eventos)
     ========================================================== */
  const concepto = (titulo, texto, monto) => `
    <div class="concepto">
      <div>
        <p class="concepto__titulo">${titulo}</p>
        <p class="concepto__texto">${texto}</p>
      </div>
      <p class="concepto__precio">${dinero(monto)}</p>
    </div>`;

  const metodo = (valor, icono, titulo, texto, elegido) => `
    <label class="opcion metodo${elegido ? " opcion--elegida" : ""}">
      <input class="opcion__entrada" type="radio" name="metodo" value="${valor}"${elegido ? " checked" : ""}>
      <span class="metodo__icono">${UI.icono(icono, 18)}</span>
      <span class="metodo__cuerpo"><span class="opcion__titulo">${titulo}</span><span class="opcion__texto">${texto}</span></span>
      <span class="opcion__radio" aria-hidden="true"></span>
    </label>`;

  const metodos = (textoTransferencia) => `
    <div class="opciones" role="radiogroup" aria-label="Método de pago">
      ${metodo("tarjeta", "credit_card", "Tarjeta de débito o crédito", E.tarjeta ? `${E.tarjeta.marca} •••• ${E.tarjeta.ultimos}` : "Visa, Mastercard", true)}
      ${metodo("transferencia", "account_balance", "Transferencia bancaria", textoTransferencia, false)}
    </div>
    <button type="button" class="enlace enlace--chico otra-tarjeta" data-otra-tarjeta${E.tarjeta ? "" : " hidden"}>Usar otra tarjeta</button>`;

  /* Da vida a la elección de método. Devuelve una función que dice cuál está elegido */
  function activarMetodos(zona, boton, monto) {
    let elegido = "tarjeta";
    zona.querySelectorAll('input[name="metodo"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        elegido = radio.value;
        zona.querySelectorAll(".metodo").forEach((m) => m.classList.toggle("opcion--elegida", m.contains(radio)));
        boton.textContent = elegido === "tarjeta" ? `Pagar ${dinero(monto)}` : "Continuar";
        zona.querySelector("[data-otra-tarjeta]").hidden = elegido !== "tarjeta" || !E.tarjeta;
      });
    });
    return () => elegido;
  }

  /* 47a / 54a · Pago con tarjeta (hoja) */
  function hojaTarjeta({ titulo, texto, monto, alPagar }) {
    const hoja = UI.abrirHoja(
      `
      <h2 class="hoja__titulo">Pago con tarjeta</h2>
      ${concepto(titulo, texto, monto)}
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
        <div class="total"><span>Total</span><strong>${dinero(monto)}</strong></div>
        <button type="submit" class="boton hoja__boton">Pagar ${dinero(monto)}</button>
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
      if (formulario.querySelector(".interruptor__entrada").checked) E.tarjeta = { marca, ultimos };
      alPagar({ tipo: "tarjeta", texto: `${marca} •••• ${ultimos}` }, enviar);
    });
  }

  /* 47b / 54b · Transferencia · Subir comprobante (hoja) */
  function hojaTransferencia({ titulo, texto, monto, referencia, alPagar }) {
    const hoja = UI.abrirHoja(
      `
      <h2 class="hoja__titulo">Pago por transferencia</h2>
      ${concepto(titulo, texto, monto)}
      <p class="hoja__sobre">DATOS PARA TRANSFERIR</p>
      <div class="resumen resumen--banco">
        ${fila("Banco", DATOS.banco.nombre)}
        ${fila("Cuenta", DATOS.banco.cuenta)}
        ${fila("Titular", DATOS.banco.titular)}
        ${fila("Referencia", referencia)}
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
    const cajaArchivo = hoja.querySelector(".archivo");
    const error = hoja.querySelector("[data-error-archivo]");
    const enviar = hoja.querySelector("[data-enviar]");
    const limpiar = () => {
      entrada.value = "";
      cajaArchivo.classList.remove("archivo--cargado");
      hoja.querySelector(".archivo__nombre").textContent = "Sube tu comprobante";
      hoja.querySelector(".archivo__texto").textContent = "Foto o PDF · máximo 5 MB";
      hoja.querySelector(".archivo__visto").hidden = true;
      enviar.disabled = true;
    };
    entrada.addEventListener("change", () => {
      const archivo = entrada.files[0];
      error.innerHTML = "";
      if (!archivo) return;
      if (!/^image\//.test(archivo.type) && archivo.type !== "application/pdf") {
        error.innerHTML = `${UI.icono("alerta", 14)}El comprobante debe ser una foto o un PDF.`;
        limpiar();
        return;
      }
      if (archivo.size > 5 * 1024 * 1024) {
        error.innerHTML = `${UI.icono("alerta", 14)}El archivo pesa más de 5 MB. Elige uno más liviano.`;
        limpiar();
        return;
      }
      const tamano = archivo.size >= 1024 * 1024 ? `${(archivo.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(archivo.size / 1024))} KB`;
      cajaArchivo.classList.add("archivo--cargado");
      hoja.querySelector(".archivo__nombre").textContent = archivo.name;
      hoja.querySelector(".archivo__texto").textContent = `${tamano} · Cargado · Toca para cambiarlo`;
      hoja.querySelector(".archivo__visto").hidden = false;
      enviar.disabled = false;
    });
    enviar.addEventListener("click", () => alPagar({ tipo: "transferencia", texto: "Transferencia" }, enviar));
  }

  /* ==========================================================
     41 · Inicio
     ========================================================== */
  UCA.registrar("externo-inicio", {
    dibujar() {
      const proximo = DATOS.eventosExternos
        .filter((e) => e.tipo === "evento" && FECHA.leer(e.fecha) >= HOY)
        .sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
      // La solicitud más reciente que sigue pendiente o por usarse
      const activa = DATOS.solicitudes.find((s) => !yaPaso(s) && s.estado !== "rechazada");
      const espacios = ["futbol", "voleibol", "basquetbol"];

      return `
        <section class="pantalla pantalla--app">
          ${UI.barraApp()}
          <div class="app-contenido">
            <div>
              <h1 class="inicio__saludo">¡Hola, ${UI.escapar(E.nombreVisible.split(" ")[0])}!</h1>
              <p class="inicio__subtexto">El Polideportivo UCA, abierto para ti.</p>
            </div>

            <a class="destacada destacada--morada" href="#/externo-reservas" data-ir="externo-reservas">
              <p class="destacada__sobre">ABIERTO A LA COMUNIDAD</p>
              <p class="destacada__titulo">Tu actividad,<br>en la UCA.</p>
              <span class="destacada__accion">Solicitar</span>
              <span class="destacada__icono">${UI.icono("calendario", 24)}</span>
            </a>

            <div>
              <div class="encabezado-lista">
                <p class="titulo-seccion">Espacios disponibles</p>
                ${UI.enlace("Ver todos", "externo-reservas")}
              </div>
              <div class="disciplinas">
                ${espacios
                  .map((id) => {
                    const c = DATOS.canchas[id];
                    return `
                  <a class="disciplina${TARJETA[id] ? " disciplina--figma" : ""}" href="#/solicitud-horario/${id}" data-ir="solicitud-horario/${id}">
                    <img src="img/${encodeURI(TARJETA[id] || FOTO_LISTA[id])}" alt="">
                    <span class="${TARJETA[id] ? "sr-only" : "disciplina__nombre"}">${c.corto}</span>
                  </a>`;
                  })
                  .join("")}
              </div>
            </div>

            ${
              proximo
                ? `<div>
              <div class="encabezado-lista">
                <p class="titulo-seccion">Eventos abiertos</p>
                ${UI.enlace("Ver agenda", "externo-eventos")}
              </div>
              <a class="evento-mini" href="#/evento-externo/${proximo.id}" data-ir="evento-externo/${proximo.id}">
                <div class="evento-mini__foto"><img src="img/${encodeURI(proximo.foto)}" alt=""></div>
                <div class="evento-mini__cuerpo">
                  <p class="evento-mini__fecha">${FECHA.leer(proximo.fecha).getDate()} ${FECHA.MESES_CORTOS[FECHA.leer(proximo.fecha).getMonth()].toUpperCase()} · ${proximo.hora}</p>
                  <p class="evento-mini__titulo">${proximo.corto}</p>
                  <p class="evento-mini__texto">${proximo.resumen} · ${proximo.costo ? dinero(proximo.costo) : "Gratis"}</p>
                </div>
                ${UI.icono("flecha", 22)}
              </a>
            </div>`
                : ""
            }

            ${
              activa
                ? `<a class="solicitud-mini" href="#/${rutaDeSolicitud(activa)}" data-ir="${rutaDeSolicitud(activa)}">
              <span class="solicitud-mini__sobre">${activa.estado === "aprobada" ? "TU RESERVA · CONFIRMADA" : "TU SOLICITUD · EN REVISIÓN"}</span>
              <span class="solicitud-mini__titulo">${DATOS.canchas[activa.cancha].nombre}</span>
              <span class="solicitud-mini__titulo">${FECHA.mini(FECHA.leer(activa.fecha))} · ${activa.hora}</span>
              ${UI.icono(activa.estado === "aprobada" ? "visto" : "reloj", 26)}
            </a>`
                : ""
            }

            <div>
              <p class="titulo-seccion">En el polideportivo</p>
              <button type="button" class="tarifas-banner sep-s" data-tarifas>
                <span class="tarifas-banner__sobre">ESPACIOS PARA TODOS</span>
                <span class="tarifas-banner__titulo">Conoce las tarifas por espacio</span>
                <span class="tarifas-banner__texto">Desde ${dinero(Math.min(...Object.values(DATOS.canchas).map((c) => c.precioHora)))} por hora →</span>
              </button>
            </div>
          </div>
          ${UI.navInferior("externo-inicio", NAV)}
        </section>`;
    },
    alMostrar(contenedor) {
      contenedor.querySelector("[data-tarifas]").addEventListener("click", hojaTarifas);
    }
  });

  /* Hoja con las tarifas de referencia */
  function hojaTarifas() {
    const espacios = Object.values(DATOS.canchas)
      .map((c) => fila(c.nombre, `${dinero(c.precioHora)} / hora`) + fila(`<span class="tarifas__extra">+ ${c.extra.nombre}</span>`, `<span class="tarifas__extra">${dinero(c.extra.costo)}</span>`))
      .join("");
    const clases = DATOS.eventosExternos
      .filter((e) => e.tipo === "clase")
      .map((c) => fila(c.corto, `${dinero(c.costo)} por persona`))
      .join("");
    const hoja = UI.abrirHoja(
      `
      <h2 class="hoja__titulo">Tarifas por espacio</h2>
      <p class="hoja__texto">Precios de referencia para usuarios externos. Administración aprueba cada solicitud.</p>
      <p class="hoja__sobre">ESPACIOS</p>
      <div class="resumen resumen--banco">${espacios}</div>
      <p class="hoja__sobre">CLASES</p>
      <div class="resumen resumen--banco">${clases}</div>
      <button type="button" class="boton hoja__boton" data-solicitar>Solicitar un espacio</button>
      <button type="button" class="enlace hoja__enlace" data-cerrar-hoja>Cerrar</button>`,
      "Tarifas por espacio"
    );
    hoja.querySelector("[data-solicitar]").addEventListener("click", () => UCA.ir("externo-reservas"));
  }

  /* ==========================================================
     42 · Reservas (espacios para solicitar)
     ========================================================== */
  UCA.registrar("externo-reservas", {
    dibujar() {
      const horasLibres = (id) => {
        const libres = horariosDe(id, HOY).filter((h) => !h.ocupado).slice(0, 3).map((h) => h.hora);
        return libres.length ? libres.join(" · ") : "Ver otros días";
      };
      const espacio = (id) => {
        const c = DATOS.canchas[id];
        return `
          <a class="cancha cancha--compacta" href="#/solicitud-horario/${id}" data-ir="solicitud-horario/${id}" data-categoria="${id}">
            <div class="cancha__foto"><img src="img/${encodeURI(FOTO_LISTA[id])}" alt="${c.nombre}"></div>
            <div class="cancha__cuerpo">
              <p class="cancha__titulo">${c.nombre}</p>
              <p class="cancha__meta">${c.capacidad} personas · ${dinero(c.precioHora)} por hora</p>
              <div class="cancha__pie">
                <span class="cancha__horario">${horasLibres(id)}</span>
                <span class="cancha__accion">Solicitar</span>
              </div>
            </div>
          </a>`;
      };
      const clase = (id, accion) => {
        const c = DATOS.eventosExternos.find((e) => e.id === id);
        return `
          <a class="cancha cancha--compacta" href="#/evento-externo/${id}" data-ir="evento-externo/${id}" data-categoria="clases">
            <div class="cancha__foto"><img src="img/${encodeURI(c.foto)}" alt="${c.corto}"></div>
            <div class="cancha__cuerpo">
              <p class="cancha__titulo">${c.deporte}</p>
              <p class="cancha__meta">${c.subtitulo.split(" · ")[0]} · ${dinero(c.costo)}</p>
              <div class="cancha__pie">
                <span class="cancha__horario">${c.dias} · ${c.hora}</span>
                <span class="cancha__accion">${accion}</span>
              </div>
            </div>
          </a>`;
      };
      const b = DATOS.canchas.basquetbol;

      return `
        <section class="pantalla pantalla--app">
          ${UI.barraApp()}
          <div class="app-contenido">
            <div>
              <p class="titulo-seccion" style="font-size:var(--texto-pequeno)">UCA SPORTS / RESERVAS</p>
              <h1 class="inicio__saludo sep-s">Encuentra<br>tu espacio</h1>
              <p class="inicio__subtexto">Solicita un espacio para tu actividad.</p>
            </div>
            ${filtros([["todos", "Todos"], ["basquetbol", "Básquetbol"], ["voleibol", "Voleibol"], ["futbol", "Fútbol"], ["ping-pong", "Ping pong"], ["clases", "Clases"]])}

            <a class="cancha cancha--expandida" href="#/solicitud-horario/basquetbol" data-ir="solicitud-horario/basquetbol" data-categoria="basquetbol">
              <img src="img/${encodeURI(FOTO_LISTA.basquetbol)}" alt="${b.nombre}">
              <span class="cancha__estado">Disponible</span>
              <p class="cancha__titulo">${b.nombre}</p>
              <p class="cancha__meta">${b.capacidad} personas · Polideportivo UCA</p>
              <div class="cancha__pie">
                <span class="cancha__horario">${UI.icono("reloj", 16)}Desde las 2:00 p. m.</span>
                <span class="cancha__accion">Solicitar</span>
              </div>
              <span class="cancha__gratis">${dinero(b.precioHora)} por hora</span>
            </a>
            ${espacio("voleibol")}
            ${espacio("futbol")}
            ${espacio("ping-pong")}
            ${clase("clase-taekwondo", "Ver clases")}
            ${clase("clase-gimnasio", "Ver horarios")}
            <p class="lista-vacia" data-vacio hidden>No hay espacios con ese filtro.</p>
          </div>
          ${UI.navInferior("externo-reservas", NAV)}
        </section>`;
    },
    alMostrar(contenedor) {
      activarFiltros(contenedor, (filtro) => {
        let visibles = 0;
        contenedor.querySelectorAll("[data-categoria]").forEach((tarjeta) => {
          const ver = filtro === "todos" || tarjeta.dataset.categoria === filtro;
          tarjeta.hidden = !ver;
          if (ver) visibles += 1;
        });
        contenedor.querySelector("[data-vacio]").hidden = visibles > 0;
      });
    }
  });

  /* ==========================================================
     43 · Calendario y horarios (se pueden elegir hasta 2 horas seguidas)
     ========================================================== */
  const canchaDe = (dato) => (DATOS.canchas[dato] ? dato : "futbol");

  UCA.registrar("solicitud-horario", {
    dibujar(dato) {
      const cancha = DATOS.canchas[canchaDe(dato)];
      return `
        <section class="pantalla pantalla--app pantalla--gris">
          ${UI.barraVolver(`SOLICITUD / ${cancha.nombre.toUpperCase()}`)}
          <div class="app-contenido">
            <h1 class="titulo">¿Cuándo necesitas<br>el espacio?</h1>
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
            <div data-horarios></div>
          </div>
          <div class="app-pie"><button type="button" class="boton" data-principal disabled>Continuar</button></div>
        </section>`;
    },

    alMostrar(contenedor, dato) {
      const id = canchaDe(dato);
      const cancha = DATOS.canchas[id];
      const anterior = UCA.sesion.solicitud;
      // Si la persona vuelve desde el paso siguiente, se mantiene lo que eligió
      const sigue = anterior && anterior.cancha === id && sePuedeReservar(FECHA.leer(anterior.fecha));
      const estado = {
        fecha: sigue ? FECHA.leer(anterior.fecha) : HOY,
        horas: sigue ? [...anterior.horas] : []
      };
      estado.lunes = FECHA.lunesDe(estado.fecha);
      if (sigue && estado.horas.some((h) => (horariosDe(id, estado.fecha).find((x) => x.hora === h) || { ocupado: true }).ocupado)) estado.horas = [];

      const zonaMes = contenedor.querySelector("[data-mes]");
      const zonaDias = contenedor.querySelector("[data-dias]");
      const zonaHorarios = contenedor.querySelector("[data-horarios]");
      const principal = contenedor.querySelector("[data-principal]");
      const flechas = contenedor.querySelectorAll("[data-semana]");

      const pintar = () => {
        const jueves = FECHA.sumarDias(estado.lunes, 3);
        zonaMes.textContent = `${mayuscula(FECHA.MESES[jueves.getMonth()])} ${jueves.getFullYear()}`;
        flechas[0].disabled = estado.lunes <= FECHA.lunesDe(HOY);
        flechas[1].disabled = FECHA.sumarDias(estado.lunes, 7) > ULTIMO_DIA;

        let dias = "";
        for (let i = 0; i < 7; i++) {
          const fecha = FECHA.sumarDias(estado.lunes, i);
          const elegido = FECHA.clave(fecha) === FECHA.clave(estado.fecha);
          dias += `
            <button type="button" class="dia${elegido ? " dia--elegido" : ""}" data-fecha="${FECHA.clave(fecha)}"
              aria-pressed="${elegido}" aria-label="${fechaCorta(fecha)} de ${FECHA.MESES[fecha.getMonth()]}"${sePuedeReservar(fecha) ? "" : " disabled"}>
              <span class="dia__letra">${FECHA.LETRAS[fecha.getDay()]}</span>
              <span class="dia__numero">${fecha.getDate()}</span>
            </button>`;
        }
        zonaDias.innerHTML = dias;

        const horarios = horariosDe(id, estado.fecha);
        if (!horarios.length) {
          const [proximo] = proximosLibres(id, FECHA.sumarDias(estado.fecha, 1), 1);
          zonaHorarios.innerHTML = `
            <p class="horarios__titulo">${fechaCorta(estado.fecha)} · Sin horarios disponibles</p>
            <div class="vacio">
              <span class="vacio__icono">${UI.icono("reloj", 28)}</span>
              <p class="vacio__titulo">No hay horarios este día</p>
              <p class="vacio__texto">${
                DATOS.diasCerrados.includes(estado.fecha.getDay())
                  ? "Los domingos el Polideportivo solo abre para eventos."
                  : `La ${cancha.palabra} está en mantenimiento el ${fechaCorta(estado.fecha).toLowerCase()}.`
              }</p>
              ${proximo ? `<span class="etiqueta">Próximo disponible: ${FECHA.DIAS_CORTOS[proximo.fecha.getDay()]} ${proximo.fecha.getDate()} · ${proximo.hora}</span>` : ""}
            </div>`;
          principal.textContent = "Elegir otra fecha";
          principal.disabled = !proximo;
          principal.dataset.accion = "otra-fecha";
          return;
        }

        const botones = horarios
          .map((h) => {
            const elegida = estado.horas.includes(h.hora);
            const clase = h.ocupado ? " hora--ocupada" : elegida ? " hora--elegida" : "";
            return `<button type="button" class="hora${clase}" data-hora="${h.hora}" aria-pressed="${elegida}" aria-label="${h.ocupado ? `${h.hora}, ocupado` : h.hora}">${h.hora}</button>`;
          })
          .join("");

        const cuantas = estado.horas.length;
        zonaHorarios.innerHTML = `
          <p class="horarios__titulo">${fechaCorta(estado.fecha)} · Horarios disponibles</p>
          <div class="horas">${botones}</div>
          <div class="leyenda" aria-hidden="true">
            <span class="leyenda__item"><span class="leyenda__muestra"></span>Disponible</span>
            <span class="leyenda__item"><span class="leyenda__muestra leyenda__muestra--elegida"></span>Seleccionado</span>
            <span class="leyenda__item"><span class="leyenda__muestra leyenda__muestra--ocupada"></span>Ocupado</span>
          </div>
          ${
            cuantas
              ? `<div class="seleccion">
                  <p class="seleccion__sobre">TU SELECCIÓN</p>
                  <p class="seleccion__titulo">${fechaCorta(estado.fecha)} · ${estado.horas[0]} – ${sumarHora(estado.horas[cuantas - 1], 1)}</p>
                  <p class="seleccion__texto">${cancha.nombre} · ${horasTexto(cuantas)} · ${dinero(cuantas * cancha.precioHora)}</p>
                  ${UI.icono("calendario", 22)}
                </div>
                ${cuantas < DATOS.horasMaximas ? `<p class="horarios__ayuda">Puedes sumar la hora de antes o la de después (máximo ${DATOS.horasMaximas}).</p>` : ""}`
              : `<p class="horarios__ayuda">Toca una hora para elegirla. Puedes pedir hasta ${DATOS.horasMaximas} horas seguidas.</p>`
          }`;
        principal.textContent = "Continuar";
        principal.disabled = !cuantas;
        principal.dataset.accion = "continuar";
      };

      /* Elegir horas: la primera, luego la de antes o la de después */
      const tocarHora = (hora) => {
        const actuales = estado.horas;
        if (actuales.includes(hora)) {
          estado.horas = actuales.filter((h) => h !== hora);
        } else if (
          actuales.length &&
          actuales.length < DATOS.horasMaximas &&
          (numeroHora(hora) === numeroHora(actuales[0]) - 1 || numeroHora(hora) === numeroHora(actuales[actuales.length - 1]) + 1)
        ) {
          estado.horas = [...actuales, hora].sort((a, b) => numeroHora(a) - numeroHora(b));
        } else {
          if (actuales.length >= DATOS.horasMaximas) UI.avisar(`Puedes pedir hasta ${DATOS.horasMaximas} horas seguidas.`);
          estado.horas = [hora];
        }
        pintar();
      };

      contenedor.querySelector(".pantalla").addEventListener("click", (evento) => {
        const botonDia = evento.target.closest("[data-fecha]");
        const botonSemana = evento.target.closest("[data-semana]");
        const botonHora = evento.target.closest("[data-hora]");
        if (botonDia) {
          estado.fecha = FECHA.leer(botonDia.dataset.fecha);
          estado.horas = [];
          pintar();
        } else if (botonSemana) {
          estado.lunes = FECHA.sumarDias(estado.lunes, 7 * Number(botonSemana.dataset.semana));
          estado.fecha = [0, 1, 2, 3, 4, 5, 6].map((i) => FECHA.sumarDias(estado.lunes, i)).find(sePuedeReservar);
          estado.horas = [];
          pintar();
        } else if (botonHora) {
          const info = horariosDe(id, estado.fecha).find((h) => h.hora === botonHora.dataset.hora);
          if (info.ocupado) UI.avisar(info.tuya ? "Ya tienes una solicitud en ese horario." : "Ese horario ya está ocupado. Elige otro.");
          else tocarHora(info.hora);
        }
      });

      principal.addEventListener("click", () => {
        if (principal.dataset.accion === "otra-fecha") {
          const [proximo] = proximosLibres(id, FECHA.sumarDias(estado.fecha, 1), 1);
          if (!proximo) return;
          estado.fecha = proximo.fecha;
          estado.lunes = FECHA.lunesDe(proximo.fecha);
          estado.horas = [proximo.hora];
          pintar();
          UI.avisar(`Elegimos ${fechaCorta(proximo.fecha).toLowerCase()} a las ${proximo.hora}.`);
          return;
        }
        if (!estado.horas.length) return;
        // Se guarda la elección y se conservan los datos ya escritos
        const previa = UCA.sesion.solicitud || {};
        UCA.sesion.solicitud = {
          nombre: E.nombre,
          dui: E.dui,
          organizacion: E.organizacion,
          tipo: "",
          descripcion: "",
          extra: true,
          ...previa,
          cancha: id,
          fecha: FECHA.clave(estado.fecha),
          horas: [...estado.horas],
          personas: Math.min(previa.personas || 1, cancha.capacidad)
        };
        UCA.ir("solicitud-datos");
      });

      pintar();
    }
  });

  /* ==========================================================
     44 · Solicitud · Tus datos (paso 1 de 3)
     ========================================================== */
  UCA.registrar("solicitud-datos", {
    dibujar() {
      const s = solicitudActual();
      const cancha = DATOS.canchas[s.cancha];
      const campo = (id, etiqueta, valor, marcador, extra = "") => `
        <div class="campo">
          <label class="campo__etiqueta" for="${id}">${etiqueta}</label>
          <div class="campo__caja"><input class="campo__entrada" id="${id}" type="text" value="${UI.escapar(valor)}" placeholder="${marcador}" aria-describedby="${id}-error"${extra}></div>
          <p class="campo__error" id="${id}-error" aria-live="polite"></p>
        </div>`;
      return `
        <section class="pantalla pantalla--app pantalla--gris">
          ${UI.barraVolver(`SOLICITUD / ${cancha.nombre.toUpperCase()}`)}
          <div class="app-contenido">
            ${pasoSolicitud(1, "TUS DATOS")}
            <h1 class="titulo">Datos del<br>solicitante</h1>
            ${resumenSolicitud(s)}
            ${campo("sol-nombre", "Nombre completo", s.nombre, "Nombre y apellido", ' autocomplete="name"')}
            ${campo("sol-dui", "DUI", s.dui, "00000000-0", ' inputmode="numeric"')}
            ${campo("sol-organizacion", "Organización (opcional)", s.organizacion, "Club, empresa o grupo", ' autocomplete="organization"')}
            <div class="contador contador--pantalla">
              <div>
                <p class="contador__titulo">Personas</p>
                <p class="contador__texto">Máximo ${cancha.capacidad} en esta ${cancha.palabra}</p>
              </div>
              <div class="contador__control">
                <button type="button" class="contador__boton" data-restar aria-label="Quitar una persona">${UI.icono("menos", 18)}</button>
                <output class="contador__valor" data-personas aria-live="polite">${s.personas}</output>
                <button type="button" class="contador__boton contador__boton--mas" data-sumar aria-label="Agregar una persona">${UI.icono("mas", 18)}</button>
              </div>
            </div>
          </div>
          <div class="app-pie"><button type="button" class="boton" data-continuar>Continuar</button></div>
        </section>`;
    },
    alMostrar(contenedor) {
      const s = solicitudActual();
      const cancha = DATOS.canchas[s.cancha];
      const campos = [
        { entrada: contenedor.querySelector("#sol-nombre"), regla: "nombre" },
        { entrada: contenedor.querySelector("#sol-dui"), regla: "dui" },
        { entrada: contenedor.querySelector("#sol-organizacion"), regla: "" }
      ];
      const continuar = contenedor.querySelector("[data-continuar]");
      const errorDe = ({ entrada, regla }) => {
        if (!regla) return "";
        if (!entrada.value.trim()) return "Este dato es obligatorio.";
        return UI.REGLAS[regla].revisar(entrada.value) ? "" : UI.REGLAS[regla].mensaje;
      };
      const revisar = () => {
        campos.forEach((c) => {
          const error = c.entrada.dataset.tocado ? errorDe(c) : "";
          const cajaCampo = c.entrada.closest(".campo");
          cajaCampo.classList.toggle("campo--error", Boolean(error));
          c.entrada.setAttribute("aria-invalid", String(Boolean(error)));
          cajaCampo.querySelector(".campo__error").innerHTML = error ? `${UI.icono("alerta", 14)}${error}` : "";
        });
        continuar.disabled = campos.some((c) => errorDe(c));
      };
      campos.forEach((c) => {
        c.entrada.addEventListener("input", () => {
          if (c.regla === "dui") c.entrada.value = UI.MASCARAS.dui(c.entrada.value);
          revisar();
        });
        c.entrada.addEventListener("blur", () => {
          if (c.entrada.value) c.entrada.dataset.tocado = "si";
          revisar();
        });
      });

      // Contador de personas (1 hasta la capacidad del espacio)
      const restar = contenedor.querySelector("[data-restar]");
      const sumar = contenedor.querySelector("[data-sumar]");
      const pintarPersonas = () => {
        contenedor.querySelector("[data-personas]").textContent = s.personas;
        restar.disabled = s.personas <= 1;
        sumar.disabled = s.personas >= cancha.capacidad;
      };
      restar.addEventListener("click", () => {
        s.personas = Math.max(1, s.personas - 1);
        pintarPersonas();
      });
      sumar.addEventListener("click", () => {
        s.personas = Math.min(cancha.capacidad, s.personas + 1);
        pintarPersonas();
      });

      continuar.addEventListener("click", () => {
        campos.forEach((c) => (c.entrada.dataset.tocado = "si"));
        revisar();
        if (continuar.disabled) return;
        s.nombre = campos[0].entrada.value.trim();
        s.dui = campos[1].entrada.value;
        s.organizacion = campos[2].entrada.value.trim();
        UCA.ir("solicitud-motivo");
      });

      pintarPersonas();
      revisar();
    }
  });

  /* ==========================================================
     45 · Solicitud · Motivo de uso (paso 2 de 3)
     ========================================================== */
  const MAXIMO_MOTIVO = 300;
  const MINIMO_MOTIVO = 20;

  UCA.registrar("solicitud-motivo", {
    dibujar() {
      const s = solicitudActual();
      const cancha = DATOS.canchas[s.cancha];
      return `
        <section class="pantalla pantalla--app pantalla--gris">
          ${UI.barraVolver(`SOLICITUD / ${cancha.nombre.toUpperCase()}`)}
          <div class="app-contenido">
            ${pasoSolicitud(2, "MOTIVO DE USO")}
            <h1 class="titulo">¿Para qué usarás<br>el espacio?</h1>
            <fieldset class="grupo">
              <legend class="grupo__titulo">Tipo de actividad</legend>
              <div class="chips chips--formulario">
                ${DATOS.tiposActividad
                  .map((t) => `<button type="button" class="chip chip--chico${t === s.tipo ? " chip--elegido" : ""}" data-tipo="${t}" aria-pressed="${t === s.tipo}">${t}</button>`)
                  .join("")}
              </div>
            </fieldset>
            <div class="campo">
              <label class="campo__etiqueta" for="sol-descripcion">Describe tu actividad</label>
              <div class="campo__caja campo__caja--area">
                <textarea class="campo__entrada campo__area" id="sol-descripcion" maxlength="${MAXIMO_MOTIVO}" rows="3"
                  placeholder="Qué harán, quiénes participan y cuántas personas serán." aria-describedby="sol-descripcion-error">${UI.escapar(s.descripcion)}</textarea>
                <span class="campo__contador" data-contador></span>
              </div>
              <p class="campo__error" id="sol-descripcion-error" aria-live="polite"></p>
            </div>
            <div class="caja-morada caja-morada--fila">
              <span class="circulo">${UI.icono("info", 20)}</span>
              <div>
                <p class="caja-morada__sobre">REVISIÓN</p>
                <p class="caja-morada__texto">Administración revisará tu motivo antes de aprobar la reserva.</p>
              </div>
            </div>
          </div>
          <div class="app-pie"><button type="button" class="boton" data-resumen disabled>Ver resumen de costo</button></div>
        </section>`;
    },
    alMostrar(contenedor) {
      const s = solicitudActual();
      const area = contenedor.querySelector("#sol-descripcion");
      const boton = contenedor.querySelector("[data-resumen]");
      const revisar = () => {
        const largo = area.value.trim().length;
        contenedor.querySelector("[data-contador]").textContent = `${area.value.length} / ${MAXIMO_MOTIVO}`;
        const error = area.dataset.tocado && largo < MINIMO_MOTIVO ? `Cuéntanos un poco más (mínimo ${MINIMO_MOTIVO} letras).` : "";
        area.closest(".campo").classList.toggle("campo--error", Boolean(error));
        contenedor.querySelector("#sol-descripcion-error").innerHTML = error ? `${UI.icono("alerta", 14)}${error}` : "";
        boton.disabled = !s.tipo || largo < MINIMO_MOTIVO;
      };
      area.addEventListener("input", () => {
        s.descripcion = area.value;
        revisar();
      });
      area.addEventListener("blur", () => {
        if (area.value) area.dataset.tocado = "si";
        revisar();
      });
      contenedor.querySelectorAll("[data-tipo]").forEach((chip) => {
        chip.addEventListener("click", () => {
          s.tipo = chip.dataset.tipo;
          contenedor.querySelectorAll("[data-tipo]").forEach((otro) => {
            otro.classList.toggle("chip--elegido", otro === chip);
            otro.setAttribute("aria-pressed", String(otro === chip));
          });
          revisar();
        });
      });
      boton.addEventListener("click", () => hojaCosto(s));
      revisar();
    }
  });

  /* ---------- 46 · Resumen de costo (hoja) ---------- */
  function hojaCosto(s) {
    const pintar = () => {
      const c = costoDe(s);
      return `
        <p class="desglose__sobre">${c.cancha.nombre.toUpperCase()} · ${FECHA.mini(FECHA.leer(s.fecha)).toUpperCase()}</p>
        ${fila(`Uso de ${c.cancha.palabra}`, `${s.horas.length} h × ${dinero(c.cancha.precioHora)}`)}
        ${fila("Subtotal", dinero(c.uso))}
        <label class="interruptor desglose__extra">
          <span class="resumen__nombre">${c.cancha.extra.nombre}</span>
          <span class="desglose__extra-derecha">
            <span class="resumen__valor">${s.extra ? dinero(c.cancha.extra.costo) : "No"}</span>
            <input class="interruptor__entrada" type="checkbox" role="switch" data-extra${s.extra ? " checked" : ""} aria-label="Incluir ${c.cancha.extra.nombre.toLowerCase()}">
            <span class="interruptor__pista" aria-hidden="true"></span>
          </span>
        </label>
        <div class="desglose__total"><span>Total</span><strong>${dinero(c.total)}</strong></div>
        <span class="etiqueta">Reembolso total si no se aprueba</span>`;
    };
    const hoja = UI.abrirHoja(
      `
      <h2 class="hoja__titulo">Resumen de costo</h2>
      <div class="desglose" data-desglose>${pintar()}</div>
      <button type="button" class="boton hoja__boton" data-pago>Continuar al pago</button>
      <button type="button" class="enlace hoja__enlace" data-cerrar-hoja>Editar solicitud</button>`,
      "Resumen de costo"
    );
    const desglose = hoja.querySelector("[data-desglose]");
    desglose.addEventListener("change", (evento) => {
      if (!evento.target.matches("[data-extra]")) return;
      s.extra = evento.target.checked;
      desglose.innerHTML = pintar();
    });
    hoja.querySelector("[data-pago]").addEventListener("click", () => UCA.ir("solicitud-pago"));
  }

  /* ==========================================================
     47 · Solicitud · Pago (paso 3 de 3)
     ========================================================== */
  UCA.registrar("solicitud-pago", {
    dibujar() {
      const s = solicitudActual();
      const c = costoDe(s);
      return `
        <section class="pantalla pantalla--app pantalla--gris">
          ${UI.barraVolver(`SOLICITUD / ${c.cancha.nombre.toUpperCase()}`)}
          <div class="app-contenido">
            ${pasoSolicitud(3, "PAGO")}
            <h1 class="titulo">Método<br>de pago</h1>
            <div data-metodos>${metodos("Sube tu comprobante")}</div>
            <div class="total-pagar">
              <div>
                <p class="total-pagar__sobre">TOTAL A PAGAR</p>
                <p class="total-pagar__texto">${c.cancha.nombre} · ${s.horas.length} h${s.extra ? ` + ${c.cancha.extra.nombre.toLowerCase()}` : ""}</p>
              </div>
              <p class="total-pagar__precio">${dinero(c.total)}</p>
            </div>
          </div>
          <div class="app-pie">
            <button type="button" class="boton" data-pagar>Pagar ${dinero(c.total)}</button>
            <p class="pago-seguro">${UI.icono("candado", 14)}Pago seguro · Reembolso total si no se aprueba</p>
          </div>
        </section>`;
    },
    alMostrar(contenedor) {
      const s = solicitudActual();
      const c = costoDe(s);
      const pagar = contenedor.querySelector("[data-pagar]");
      const zona = contenedor.querySelector("[data-metodos]");
      const elegido = activarMetodos(zona, pagar, c.total);
      const referencia = nuevoCodigo("SOL", DATOS.solicitudes);
      const datosPago = {
        titulo: c.cancha.nombre,
        texto: `Solicitud externa · ${horasTexto(s.horas.length)}`,
        monto: c.total,
        referencia,
        alPagar: (pago, boton) => enviarSolicitud(s, referencia, pago, boton)
      };
      zona.querySelector("[data-otra-tarjeta]").addEventListener("click", () => hojaTarjeta(datosPago));
      pagar.addEventListener("click", () => {
        if (elegido() === "transferencia") hojaTransferencia(datosPago);
        else if (E.tarjeta) enviarSolicitud(s, referencia, { tipo: "tarjeta", texto: `${E.tarjeta.marca} •••• ${E.tarjeta.ultimos}` }, pagar);
        else hojaTarjeta(datosPago);
      });
    }
  });

  /* Guarda la solicitud y pasa a la pantalla 48 */
  function enviarSolicitud(s, codigo, pago, boton) {
    conCarga(boton, pago.tipo === "transferencia" ? "Enviando comprobante…" : "Procesando pago…", () => {
      const c = costoDe(s);
      const solicitud = {
        codigo,
        cancha: s.cancha,
        fecha: s.fecha,
        hora: s.horas[0],
        fin: finDe(s),
        horas: s.horas.length,
        personas: s.personas,
        nombre: s.nombre,
        dui: s.dui,
        organizacion: s.organizacion,
        tipo: s.tipo,
        descripcion: s.descripcion.trim(),
        extra: s.extra,
        total: c.total,
        pago: { tipo: pago.tipo, texto: pago.texto, fecha: FECHA.clave(DATOS.hoy) },
        enviada: FECHA.clave(DATOS.hoy),
        estado: "revision"
      };
      DATOS.solicitudes.unshift(solicitud);
      DATOS.avisosExterno.unshift({
        id: `s-${Date.now()}`,
        grupo: "HOY",
        categoria: pago.tipo === "transferencia" ? "pagos" : "solicitudes",
        icono: "reloj",
        titulo: pago.tipo === "transferencia" ? "Comprobante recibido" : "Solicitud en revisión",
        texto: `${c.cancha.nombre} · ${FECHA.mini(FECHA.leer(s.fecha))}, ${solicitud.hora}`,
        tiempo: "Ahora",
        leido: false,
        ir: `detalle-solicitud/${codigo}`
      });
      UCA.sesion.solicitud = null;
      UCA.ir(`solicitud-enviada/${codigo}`);
    });
  }

  /* ==========================================================
     48 · Pago realizado · En revisión
     ========================================================== */
  UCA.registrar("solicitud-enviada", {
    dibujar(dato) {
      const s = buscarSolicitud(dato);
      const transferencia = s.pago.tipo === "transferencia";
      return `
        <section class="pantalla pantalla--oscura">
          ${UI.marca(true)}
          <span class="circulo circulo--grande exito__icono">${UI.icono(transferencia ? "reloj" : "visto", 34)}</span>
          <span class="etiqueta exito__etiqueta">${transferencia ? "COMPROBANTE ENVIADO" : "PAGO REALIZADO"}</span>
          <h1 class="titulo exito__titulo">Tu solicitud está<br>en revisión</h1>
          <p class="parrafo exito__texto">Te avisaremos cuando administración responda.</p>
          ${estadoPasos(s)}
          <div class="al-fondo exito__acciones">
            ${UI.boton("Ver mis solicitudes", { ir: "mis-solicitudes" })}
            ${UI.enlace("Volver al inicio", "externo-inicio", "enlace--claro")}
          </div>
        </section>`;
    }
  });

  /* ==========================================================
     49 · Solicitud aprobada
     ========================================================== */
  UCA.registrar("solicitud-aprobada", {
    dibujar(dato) {
      const s = DATOS.solicitudes.find((x) => x.codigo === dato && x.estado === "aprobada") || DATOS.solicitudes.find((x) => x.estado === "aprobada");
      if (!s) return UCA.pantallas["detalle-solicitud"].dibujar(dato);
      const pasada = yaPaso(s);
      return `
        <section class="pantalla pantalla--oscura">
          ${UI.marca(true)}
          <span class="circulo circulo--grande exito__icono">${UI.icono("visto", 34)}</span>
          <span class="etiqueta exito__etiqueta">SOLICITUD APROBADA</span>
          <h1 class="titulo exito__titulo">${pasada ? "Tu reserva fue<br>aprobada" : "¡Tu reserva está<br>confirmada!"}</h1>
          <p class="parrafo exito__texto">${pasada ? "Esta reserva ya pasó. ¡Gracias por visitar el Polideportivo!" : "Presenta tu código en la entrada del Polideportivo."}</p>
          <div class="tarjeta-reserva">
            <p class="tarjeta-reserva__sobre">TU RESERVA</p>
            <p class="tarjeta-reserva__titulo">${DATOS.canchas[s.cancha].nombre}</p>
            <p class="tarjeta-reserva__dato">${UI.icono("calendario", 16)}${FECHA.mini(FECHA.leer(s.fecha))} · ${s.hora} – ${s.fin}</p>
            <p class="tarjeta-reserva__dato">${UI.icono("personas", 16)}${UI.escapar(s.tipo)} · ${personasTexto(s.personas)}</p>
            <div class="tarjeta-reserva__pie">
              <span>Pagado ${dinero(s.total)}</span>
              <span class="etiqueta">${s.reserva}</span>
            </div>
          </div>
          <div class="al-fondo exito__acciones">
            ${UI.boton("Ver detalle de la reserva", { ir: `detalle-solicitud/${s.codigo}` })}
            ${UI.enlace("Volver al inicio", "externo-inicio", "enlace--claro")}
          </div>
        </section>`;
    }
  });

  /* ==========================================================
     50 · Solicitud rechazada
     ========================================================== */
  UCA.registrar("solicitud-rechazada", {
    dibujar(dato) {
      const s = DATOS.solicitudes.find((x) => x.codigo === dato && x.estado === "rechazada") || DATOS.solicitudes.find((x) => x.estado === "rechazada");
      if (!s) return UCA.pantallas["detalle-solicitud"].dibujar(dato);
      const reembolso = s.reembolso || { estado: "proceso" };
      const acreditado = reembolso.estado === "acreditado";
      const libres = proximosLibres(s.cancha, HOY, 2);
      return `
        <section class="pantalla pantalla--app pantalla--gris">
          ${UI.barraVolver(`MIS SOLICITUDES / ${s.codigo}`)}
          <div class="app-contenido">
            <span class="circulo circulo--peligro circulo--rechazo">${UI.icono("alerta", 30)}</span>
            <div>
              <span class="etiqueta etiqueta--rechazada">No aprobada</span>
              <h1 class="titulo sep-s">Tu solicitud<br>no fue aprobada</h1>
              <p class="detalle__lugar">${DATOS.canchas[s.cancha].nombre} · ${FECHA.mini(FECHA.leer(s.fecha))} · ${s.hora} – ${s.fin}</p>
            </div>
            <div class="motivo-caja">
              <p class="motivo-caja__sobre">MOTIVO DE ADMINISTRACIÓN</p>
              <p>${UI.escapar(s.motivoRechazo || "El horario no estaba disponible.")}</p>
            </div>
            <div class="reembolso-caja">
              <div class="reembolso-caja__cabecera">
                <p class="reembolso-caja__sobre">REEMBOLSO</p>
                <span class="etiqueta${acreditado ? "" : " etiqueta--aviso"}">${acreditado ? "Acreditado" : "En proceso"}</span>
              </div>
              <p class="reembolso-caja__monto">${dinero(s.total)}</p>
              <p class="reembolso-caja__texto">${
                acreditado
                  ? `Se acreditó a tu ${s.pago.tipo === "transferencia" ? "cuenta bancaria" : s.pago.texto} el ${diaMes(reembolso.fecha)}.`
                  : `Se acreditará a tu ${s.pago.tipo === "transferencia" ? "cuenta bancaria" : s.pago.texto} en 3 a 5 días hábiles.`
              }</p>
              ${UI.icono("history", 26)}
            </div>
            ${
              libres.length
                ? `<a class="caja-morada caja-morada--fila horarios-libres" href="#/solicitud-horario/${s.cancha}" data-ir="solicitud-horario/${s.cancha}">
                <div>
                  <p class="caja-morada__sobre">PRÓXIMOS HORARIOS LIBRES</p>
                  <p class="caja-morada__texto">${libres.map((l) => `${FECHA.DIAS_CORTOS[l.fecha.getDay()]} ${l.fecha.getDate()} · ${l.hora}`).join("  ·  ")}</p>
                </div>
                <span class="circulo">${UI.icono("reloj", 20)}</span>
              </a>`
                : ""
            }
          </div>
          <div class="app-pie">
            ${UI.boton("Buscar otro horario", { ir: `solicitud-horario/${s.cancha}` })}
            ${UI.enlace("Ver mis solicitudes", "mis-solicitudes", "app-pie__enlace")}
          </div>
        </section>`;
    }
  });

  /* ==========================================================
     51 · Eventos (y clases) abiertos a la comunidad
     ========================================================== */
  const buscarEvento = (id) => DATOS.eventosExternos.find((e) => e.id === id) || DATOS.eventosExternos[0];
  const esClase = (item) => item.tipo === "clase";
  // Fecha que se muestra: la del evento o la de la próxima clase
  const fechaDeItem = (item) => {
    if (!esClase(item)) return FECHA.leer(item.fecha);
    for (let i = 0; i < 7; i++) {
      const fecha = FECHA.sumarDias(HOY, i);
      if (item.diasNumero.includes(fecha.getDay())) return fecha;
    }
    return HOY;
  };
  const libresDe = (item) => item.cupo.total - item.cupo.inscritos;
  const inscripcionDe = (id) => DATOS.inscripcionesExternas.find((i) => i.id === id);

  UCA.registrar("externo-eventos", {
    dibujar() {
      return `
        <section class="pantalla pantalla--app">
          ${UI.barraApp()}
          <div class="app-contenido">
            <div>
              <p class="titulo-seccion" style="font-size:var(--texto-pequeno)">UCA SPORTS / EVENTOS</p>
              <h1 class="inicio__saludo sep-s">Eventos<br>abiertos</h1>
              <p class="inicio__subtexto">Partidos, clases y encuentros para toda la comunidad.</p>
            </div>
            ${filtros([["todos", "Todos"], ["gratis", "Gratis"], ["costo", "Con costo"], ["clases", "Clases"]])}
            <div class="eventos" data-lista></div>
            <div class="caja-morada">
              <p class="caja-morada__sobre">USUARIOS EXTERNOS</p>
              <p class="caja-morada__texto">Algunos eventos tienen costo de participación para la comunidad.</p>
            </div>
          </div>
          ${UI.navInferior("externo-eventos", NAV)}
        </section>`;
    },
    alMostrar(contenedor) {
      const lista = contenedor.querySelector("[data-lista]");
      const pintar = (filtro) => {
        const items = DATOS.eventosExternos
          .filter((e) => fechaDeItem(e) >= HOY)
          .filter((e) => filtro === "todos" || (filtro === "gratis" && !e.costo) || (filtro === "costo" && e.costo > 0) || (filtro === "clases" && esClase(e)))
          .sort((a, b) => fechaDeItem(a) - fechaDeItem(b));
        lista.innerHTML = items.length
          ? items
              .map((e) => {
                const fecha = fechaDeItem(e);
                return `
              <a class="evento-fila" href="#/evento-externo/${e.id}" data-ir="evento-externo/${e.id}">
                <span class="evento-fila__fecha"><strong>${fecha.getDate()}</strong><small>${FECHA.MESES_CORTOS[fecha.getMonth()].toUpperCase()}</small></span>
                <span class="evento-fila__cuerpo">
                  <span class="evento-fila__sobre">${e.deporte.toUpperCase()} · ${esClase(e) ? e.dias.toUpperCase() : e.hora.toUpperCase()}</span>
                  <span class="evento-fila__titulo">${e.corto}</span>
                  <span class="evento-fila__texto">${inscripcionDe(e.id) ? "Ya estás inscrito" : esClase(e) ? `${e.hora} · ${libresDe(e)} cupos libres` : e.resumen}</span>
                </span>
                <span class="etiqueta${e.costo ? " etiqueta--oscura" : ""}">${e.costo ? dinero(e.costo) : "Gratis"}</span>
              </a>`;
              })
              .join("")
          : `<p class="lista-vacia">No hay eventos con ese filtro.</p>`;
      };
      activarFiltros(contenedor, pintar);
      pintar("todos");
    }
  });

  /* ==========================================================
     52 / 53 / TK / GM · Detalle de evento o clase
     ========================================================== */
  UCA.registrar("evento-externo", {
    dibujar(dato) {
      const item = buscarEvento(dato);
      const clase = esClase(item);
      const cajas = clase
        ? [caja("calendario", "Días", item.dias), caja("reloj", "Hora", item.hora), caja("personas", "Cupo", `${libresDe(item)} libres`)]
        : [caja("calendario", "Fecha", FECHA.mini(FECHA.leer(item.fecha))), caja("reloj", "Hora", item.hora), caja("personas", "Cupo", `${libresDe(item)} libres`)];
      const costo = item.costo
        ? `<div class="costo-caja">
             <p class="costo-caja__sobre">COSTO DE PARTICIPACIÓN</p>
             <div class="costo-caja__fila">
               <p class="costo-caja__precio">${dinero(item.costo)}</p>
               <p class="costo-caja__detalle">por persona · usuarios externos</p>
             </div>
           </div>`
        : `<div class="caja-morada caja-morada--fila">
             <span class="circulo">${UI.icono("visto", 20)}</span>
             <div>
               <p class="caja-morada__sobre">SIN COSTO</p>
               <p class="caja-morada__texto">Inscripción gratuita para todo público.</p>
             </div>
           </div>`;
      let pie;
      if (inscripcionDe(item.id)) {
        pie = `<button type="button" class="boton" disabled>Ya estás inscrito</button>
               ${UI.enlace("Ver mis comprobantes", "pagos-externo", "app-pie__enlace")}`;
      } else if (libresDe(item) <= 0) {
        pie = `<button type="button" class="boton" disabled>Cupo lleno</button>`;
      } else {
        pie = `<button type="button" class="boton" data-inscribir>${item.costo ? "Inscribirme y pagar" : "Inscribirme"}</button>`;
      }
      return `
        <section class="pantalla pantalla--app pantalla--gris">
          ${UI.barraVolver(`${clase ? "CLASES" : "EVENTOS"} / ${item.deporte.toUpperCase()}`)}
          <div class="app-contenido detalle">
            <div class="detalle__foto detalle__foto--evento">
              <img src="img/${encodeURI(item.foto)}" alt="${item.corto}">
              <span class="etiqueta${item.costo ? " etiqueta--oscura" : ""}">${item.costo ? dinero(item.costo) : "Gratis"}</span>
            </div>
            <div>
              <p class="detalle__sobre">${item.sobre}</p>
              <h1 class="titulo">${item.titulo}</h1>
              <p class="detalle__lugar">${item.subtitulo}</p>
            </div>
            <div class="datos">${cajas.join("")}</div>
            ${costo}
          </div>
          <div class="app-pie">${pie}</div>
        </section>`;
    },
    alMostrar(contenedor, dato) {
      const item = buscarEvento(dato);
      const boton = contenedor.querySelector("[data-inscribir]");
      if (!boton) return;
      const codigo = nuevoCodigo("INS", DATOS.inscripcionesExternas);
      boton.addEventListener("click", () => {
        if (!item.costo) inscribir(item, codigo, { tipo: "gratis" }, boton);
        else hojaPagoEvento(item, codigo);
      });
    }
  });

  const cuandoTexto = (item) => (esClase(item) ? `${item.dias} · ${item.hora}` : `${FECHA.mini(FECHA.leer(item.fecha))} · ${item.hora}`);

  /* ---------- 54 · Pago de inscripción (hoja) ---------- */
  function hojaPagoEvento(item, codigo) {
    const hoja = UI.abrirHoja(
      `
      <h2 class="hoja__titulo">Pago de inscripción</h2>
      ${concepto(item.corto, cuandoTexto(item), item.costo)}
      <p class="hoja__sobre">MÉTODO DE PAGO</p>
      <div data-metodos>${metodos("Sube tu comprobante después")}</div>
      <div class="total"><span>Total</span><strong>${dinero(item.costo)}</strong></div>
      <button type="button" class="boton hoja__boton" data-pagar>Pagar ${dinero(item.costo)}</button>
      <p class="pago-seguro">${UI.icono("candado", 14)}Pago seguro · Recibirás tu comprobante por correo.</p>`,
      "Pago de inscripción"
    );
    const pagar = hoja.querySelector("[data-pagar]");
    const zona = hoja.querySelector("[data-metodos]");
    const elegido = activarMetodos(zona, pagar, item.costo);
    const datosPago = {
      titulo: item.corto,
      texto: cuandoTexto(item),
      monto: item.costo,
      referencia: codigo,
      alPagar: (pago, boton) => inscribir(item, codigo, pago, boton)
    };
    zona.querySelector("[data-otra-tarjeta]").addEventListener("click", () => hojaTarjeta(datosPago));
    pagar.addEventListener("click", () => {
      if (elegido() === "transferencia") hojaTransferencia(datosPago);
      else if (E.tarjeta) inscribir(item, codigo, { tipo: "tarjeta", texto: `${E.tarjeta.marca} •••• ${E.tarjeta.ultimos}` }, pagar);
      else hojaTarjeta(datosPago);
    });
  }

  /* Guarda la inscripción y pasa a la pantalla 55 */
  function inscribir(item, codigo, pago, boton) {
    const textos = { gratis: "Inscribiendo…", tarjeta: "Procesando pago…", transferencia: "Enviando comprobante…" };
    conCarga(boton, textos[pago.tipo], () => {
      const enRevision = pago.tipo === "transferencia";
      const inscripcion = {
        codigo,
        id: item.id,
        titulo: item.corto,
        monto: item.costo,
        pago: {
          tipo: pago.tipo,
          texto: pago.tipo === "gratis" ? "Gratis · Sin pago" : `${dinero(item.costo)} · ${pago.texto}`,
          estado: pago.tipo === "gratis" ? "gratis" : enRevision ? "revision" : "aprobado"
        },
        fecha: FECHA.clave(DATOS.hoy)
      };
      item.cupo.inscritos += 1;
      DATOS.inscripcionesExternas.unshift(inscripcion);
      DATOS.avisosExterno.unshift({
        id: `x-${Date.now()}`,
        grupo: "HOY",
        categoria: enRevision ? "pagos" : "eventos",
        icono: enRevision ? "reloj" : "visto",
        titulo: enRevision ? "Comprobante recibido" : "Inscripción confirmada",
        texto: `${item.corto} · ${cuandoTexto(item)}`,
        tiempo: "Ahora",
        leido: false,
        ir: `evento-externo/${item.id}`
      });
      UCA.ir(`inscripcion-externo/${codigo}`);
    });
  }

  /* ==========================================================
     55 / 55b · Inscripción confirmada
     ========================================================== */
  UCA.registrar("inscripcion-externo", {
    dibujar(dato) {
      // Si se entra directo, se muestra el ejemplo de Figma
      const ins = DATOS.inscripcionesExternas.find((i) => i.codigo === dato) || {
        codigo: "INS-3381",
        id: "torneo-abierto",
        titulo: "Torneo de voleibol abierto",
        monto: 5,
        pago: { tipo: "tarjeta", texto: "$5.00 · Visa •••• 1234", estado: "aprobado" },
        fecha: FECHA.clave(DATOS.hoy)
      };
      const item = buscarEvento(ins.id);
      const revision = ins.pago.estado === "revision";
      const insignias = { gratis: "Sin costo", aprobado: "Pago aprobado", revision: "En revisión" };
      const punto = item.hora.endsWith(".") ? "" : ".";
      const texto = revision
        ? "Revisaremos tu pago en 1 día hábil y te avisaremos cuando quede confirmado."
        : `Te esperamos el ${FECHA.diaYNumero(fechaDeItem(item))} a las ${item.hora}${punto}`;
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
            ${fila(esClase(item) ? "Clase" : "Evento", ins.titulo)}
            ${fila("Participante", UI.escapar(E.nombre))}
            ${fila("Pago", ins.pago.texto)}
            ${fila(ins.pago.tipo === "gratis" ? "Fecha de inscripción" : "Fecha de pago", FECHA.corta(FECHA.leer(ins.fecha)))}
            ${fila("Código", ins.codigo)}
          </div>
          <div class="al-fondo exito__acciones">
            ${UI.boton("Ver mis comprobantes", { ir: "pagos-externo" })}
            ${UI.enlace("Volver a eventos", "externo-eventos", "enlace--claro")}
          </div>
        </section>`;
    }
  });

  /* ==========================================================
     56 · Perfil
     ========================================================== */
  // Todo lo que la persona ha pagado o le han devuelto
  function movimientos() {
    const lista = [];
    DATOS.solicitudes.forEach((s) => {
      const nombre = DATOS.canchas[s.cancha].nombre;
      if (s.estado === "rechazada") {
        const acreditado = s.reembolso && s.reembolso.estado === "acreditado";
        lista.push({
          icono: "history", titulo: nombre, monto: s.total, reembolso: true, ir: rutaDeSolicitud(s),
          texto: acreditado ? `Reembolso · ${diaMes(s.reembolso.fecha)}` : "Reembolso en proceso",
          insignia: acreditado ? ["Reembolsado", " etiqueta--gris"] : ["En proceso", " etiqueta--aviso"],
          fecha: acreditado ? s.reembolso.fecha : s.pago.fecha, codigo: s.codigo, concepto: `Reembolso de ${nombre}`
        });
      } else {
        const revisionPago = s.pago.tipo === "transferencia" && s.estado === "revision";
        lista.push({
          icono: "calendario", titulo: nombre, monto: s.total, ir: rutaDeSolicitud(s),
          texto: `${s.reserva || s.codigo} · ${diaMes(s.pago.fecha)}`,
          insignia: revisionPago ? ["En revisión", " etiqueta--aviso"] : ["Pagado", ""],
          fecha: s.pago.fecha, codigo: s.codigo, concepto: `${nombre} · ${FECHA.mini(FECHA.leer(s.fecha))} · ${s.hora} – ${s.fin}`, pago: s.pago.texto
        });
      }
    });
    DATOS.inscripcionesExternas
      .filter((i) => i.monto > 0)
      .forEach((i) => {
        lista.push({
          icono: "trofeo", titulo: i.titulo, monto: i.monto, ir: `evento-externo/${i.id}`,
          texto: `${i.codigo} · ${diaMes(i.fecha)}`,
          insignia: i.pago.estado === "revision" ? ["En revisión", " etiqueta--aviso"] : ["Pagado", ""],
          fecha: i.fecha, codigo: i.codigo, concepto: i.titulo, pago: i.pago.texto
        });
      });
    return lista.sort((a, b) => b.fecha.localeCompare(a.fecha));
  }
  // El total solo cuenta pagos ya confirmados (no los comprobantes en revisión)
  const totalPagado = () => movimientos().filter((m) => !m.reembolso && m.insignia[0] === "Pagado").reduce((suma, m) => suma + m.monto, 0);
  const totalReembolsado = () => movimientos().filter((m) => m.reembolso).reduce((suma, m) => suma + m.monto, 0);

  UCA.registrar("externo-perfil", {
    dibujar() {
      const enRevision = DATOS.solicitudes.filter((s) => s.estado === "revision").length;
      const aprobadas = DATOS.solicitudes.filter((s) => s.estado === "aprobada").length;
      const comprobantes = movimientos().length;
      const sinLeer = DATOS.avisosExterno.filter((a) => !a.leido).length;
      const menu = [
        ["description", "Mis solicitudes", enRevision ? `${enRevision} en revisión` : "Ninguna en revisión", "mis-solicitudes"],
        ["credit_card", "Pagos y comprobantes", `${comprobantes} ${comprobantes === 1 ? "comprobante" : "comprobantes"}`, "pagos-externo"],
        ["campana", "Notificaciones", sinLeer ? `${sinLeer} sin leer` : "Todo al día", "notificaciones"],
        ["usuario", "Datos personales", "Nombre, foto y teléfono", "editar-perfil-externo"]
      ];
      return `
        <section class="pantalla pantalla--app pantalla--gris">
          <div class="app-contenido perfil-pantalla">
            <p class="app-barra__ruta">UCA SPORTS / PERFIL</p>
            <div class="perfil-cabecera">
              <div class="avatar avatar--oscuro">
                ${avatar()}
                <a class="avatar__editar" href="#/editar-perfil-externo" data-ir="editar-perfil-externo" aria-label="Editar foto de perfil">${UI.icono("edit", 16)}</a>
              </div>
              <div class="perfil-cabecera__datos">
                <h1 class="perfil-cabecera__nombre">${UI.escapar(E.nombreVisible)}</h1>
                <p class="perfil-cabecera__texto">${E.correo} · DUI ${E.dui}</p>
                <span class="etiqueta etiqueta--oscura">Usuario externo</span>
              </div>
            </div>
            <div class="resumen-cajas">
              <a class="resumen-caja" href="#/mis-solicitudes" data-ir="mis-solicitudes"><strong>${DATOS.solicitudes.length}</strong>Solicitudes</a>
              <a class="resumen-caja" href="#/mis-solicitudes" data-ir="mis-solicitudes"><strong>${aprobadas}</strong>Aprobadas</a>
              <a class="resumen-caja resumen-caja--morada" href="#/pagos-externo" data-ir="pagos-externo"><strong>${dineroCorto(totalPagado())}</strong>Pagado</a>
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
          ${UI.navInferior("externo-perfil", NAV)}
        </section>`;
    },
    alMostrar(contenedor) {
      contenedor.querySelector("[data-cerrar-sesion]").addEventListener("click", () => {
        const hoja = UI.abrirHoja(
          `
          <h2 class="hoja__titulo">¿Cerrar sesión?</h2>
          <p class="hoja__texto">Tendrás que volver a ingresar con tu correo y contraseña.</p>
          <button type="button" class="boton boton--peligro hoja__boton" data-salir>Sí, cerrar sesión</button>
          <button type="button" class="boton boton--borde hoja__boton-segundo" data-cerrar-hoja>Cancelar</button>`,
          "Cerrar sesión"
        );
        hoja.querySelector("[data-salir]").addEventListener("click", () => UCA.ir("bienvenida"));
      });
    }
  });

  /* ==========================================================
     56a · Editar perfil (56b foto en hoja, 56c aviso)
     ========================================================== */
  const MAXIMO_NOMBRE = 24;

  UCA.registrar("editar-perfil-externo", {
    dibujar() {
      const campo = (id, etiqueta, valor, ayuda, extra = "", contador = false) => `
        <div class="campo">
          <label class="campo__etiqueta" for="${id}">${etiqueta}</label>
          <div class="campo__caja">
            <input class="campo__entrada" id="${id}" type="text" value="${UI.escapar(valor)}" aria-describedby="${id}-ayuda ${id}-error"${extra}>
            ${contador ? '<span class="campo__contador" data-contador></span>' : ""}
          </div>
          <p class="campo__ayuda" id="${id}-ayuda">${ayuda}</p>
          <p class="campo__error" id="${id}-error" aria-live="polite"></p>
        </div>`;
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
            ${campo("ext-visible", "Nombre para mostrar", E.nombreVisible, "Así te verán en tus solicitudes y eventos.", ` maxlength="${MAXIMO_NOMBRE}" autocomplete="nickname"`, true)}
            ${campo("ext-nombre", "Nombre completo", E.nombre, "Como aparece en tu documento de identidad.", ' autocomplete="name"')}
            ${campo("ext-telefono", "Teléfono", E.telefono, "Lo usaremos solo para avisos de tus solicitudes.", ' inputmode="numeric" autocomplete="tel"')}
          </div>
          <div class="app-pie"><button type="button" class="boton" data-guardar disabled>Guardar cambios</button></div>
        </section>`;
    },
    alMostrar(contenedor) {
      const estado = { foto: E.foto };
      const visible = contenedor.querySelector("#ext-visible");
      const nombre = contenedor.querySelector("#ext-nombre");
      const telefono = contenedor.querySelector("#ext-telefono");
      const guardar = contenedor.querySelector("[data-guardar]");
      const reglas = [
        [visible, (v) => (v.trim().length >= 2 ? "" : "Escribe al menos 2 letras.")],
        [nombre, (v) => (UI.REGLAS.nombre.revisar(v) ? "" : UI.REGLAS.nombre.mensaje)],
        [telefono, (v) => (UI.REGLAS.telefono.revisar(v) ? "" : UI.REGLAS.telefono.mensaje)]
      ];
      const revisar = () => {
        contenedor.querySelector("[data-contador]").textContent = `${visible.value.length} / ${MAXIMO_NOMBRE}`;
        let valido = true;
        reglas.forEach(([entrada, regla]) => {
          const error = regla(entrada.value);
          if (error) valido = false;
          const mostrar = error && (entrada.dataset.tocado || entrada === visible) ? error : "";
          entrada.closest(".campo").classList.toggle("campo--error", Boolean(mostrar));
          entrada.closest(".campo").querySelector(".campo__error").innerHTML = mostrar ? `${UI.icono("alerta", 14)}${mostrar}` : "";
        });
        const cambio = visible.value.trim() !== E.nombreVisible || nombre.value.trim() !== E.nombre || telefono.value !== E.telefono || estado.foto !== E.foto;
        guardar.disabled = !valido || !cambio;
        contenedor.querySelector("[data-avatar]").innerHTML = avatar(estado.foto);
      };
      telefono.addEventListener("input", () => {
        telefono.value = UI.MASCARAS.telefono(telefono.value);
      });
      [visible, nombre, telefono].forEach((entrada) => {
        entrada.addEventListener("input", revisar);
        entrada.addEventListener("blur", () => {
          entrada.dataset.tocado = "si";
          revisar();
        });
      });
      contenedor.querySelector("[data-cambiar-foto]").addEventListener("click", () => UI.hojaFoto(estado, revisar));
      guardar.addEventListener("click", () => {
        conCarga(
          guardar,
          "Guardando…",
          () => {
            E.nombreVisible = visible.value.trim();
            E.nombre = nombre.value.trim();
            E.telefono = telefono.value;
            E.foto = estado.foto;
            UCA.ir("externo-perfil");
            // 56c · Perfil actualizado
            UI.avisar("Perfil actualizado. Tus datos ya están guardados.");
          },
          700
        );
      });
      revisar();
    }
  });

  /* ==========================================================
     57 · Mis solicitudes
     ========================================================== */
  UCA.registrar("mis-solicitudes", {
    dibujar() {
      return `
        <section class="pantalla pantalla--app pantalla--gris">
          ${UI.barraVolver("PERFIL / MIS SOLICITUDES")}
          <div class="app-contenido">
            <h1 class="titulo">Mis solicitudes</h1>
            ${pestanas([["todas", "Todas"], ["revision", "En revisión"], ["cerradas", "Cerradas"]], "todas")}
            <div class="lista-tarjetas" data-lista></div>
            <a class="promo-reserva" href="#/externo-reservas" data-ir="externo-reservas">
              <span><span class="promo-reserva__sobre">¿NECESITAS OTRO ESPACIO?</span><span class="promo-reserva__titulo">Haz una nueva solicitud</span></span>
              <span class="promo-reserva__icono">${UI.icono("calendario", 18)}</span>
            </a>
          </div>
        </section>`;
    },
    alMostrar(contenedor) {
      const lista = contenedor.querySelector("[data-lista]");
      const pintar = (pestana) => {
        const elegidas = DATOS.solicitudes
          .filter((s) => pestana === "todas" || (pestana === "revision" && s.estado === "revision") || (pestana === "cerradas" && (s.estado === "rechazada" || (s.estado === "aprobada" && yaPaso(s)))))
          .sort((a, b) => b.fecha.localeCompare(a.fecha));
        if (!elegidas.length) {
          lista.innerHTML = `<p class="lista-vacia">${pestana === "revision" ? "No tienes solicitudes en revisión." : "Aún no tienes solicitudes aquí."}</p>`;
          return;
        }
        lista.innerHTML = elegidas
          .map((s) => {
            const [texto, clase] = INSIGNIAS_SOLICITUD[s.estado];
            const cancha = DATOS.canchas[s.cancha];
            const rechazada = s.estado === "rechazada";
            const pie = rechazada ? `Reembolsado ${dinero(s.total)}` : `${s.reserva || s.codigo} · ${s.pago.tipo === "transferencia" && s.estado === "revision" ? "Comprobante enviado" : `Pagado ${dinero(s.total)}`}`;
            return `
              <a class="solicitud-tarjeta${rechazada ? " solicitud-tarjeta--borde" : ""}" href="#/${rutaDeSolicitud(s)}" data-ir="${rutaDeSolicitud(s)}">
                <span class="solicitud-tarjeta__cuerpo">
                  <span class="etiqueta${clase}">${texto}</span>
                  <span class="solicitud-tarjeta__titulo">${cancha.nombre}</span>
                  <span class="solicitud-tarjeta__fecha">${FECHA.mini(FECHA.leer(s.fecha))} · ${s.hora} – ${s.fin}</span>
                  <span class="solicitud-tarjeta__pie">${pie}</span>
                </span>
                <span class="solicitud-tarjeta__foto"><img src="img/${encodeURI(FOTO_LISTA[s.cancha])}" alt=""></span>
                ${UI.icono("flecha", 22)}
              </a>`;
          })
          .join("");
      };
      activarPestanas(contenedor, pintar);
      pintar("todas");
    }
  });

  /* ==========================================================
     58 · Detalle de solicitud
     ========================================================== */
  function descargarComprobante(s) {
    const cancha = DATOS.canchas[s.cancha];
    descargar(`comprobante-${s.codigo}.txt`, [
      "UCA SPORTS · Polideportivo UCA",
      "COMPROBANTE DE PAGO (prototipo)",
      "",
      `Solicitud: ${s.codigo}${s.reserva ? ` · Reserva ${s.reserva}` : ""}`,
      `Espacio: ${cancha.nombre}`,
      `Fecha: ${FECHA.mini(FECHA.leer(s.fecha))} · ${s.hora} – ${s.fin}`,
      `Solicitante: ${s.nombre} · DUI ${s.dui}`,
      `Pago: ${dinero(s.total)} · ${s.pago.texto} · ${diaMes(s.pago.fecha)}`,
      `Estado: ${INSIGNIAS_SOLICITUD[s.estado][0]}`
    ]);
    UI.avisar("Listo: descargamos tu comprobante.");
  }

  UCA.registrar("detalle-solicitud", {
    dibujar(dato) {
      const s = buscarSolicitud(dato);
      const cancha = DATOS.canchas[s.cancha];
      const [texto, clase] = INSIGNIAS_SOLICITUD[s.estado];
      return `
        <section class="pantalla pantalla--app pantalla--gris">
          ${UI.barraVolver(`MIS SOLICITUDES / ${s.codigo}`)}
          <div class="app-contenido">
            <div>
              <span class="etiqueta${clase}">${texto}</span>
              <h1 class="titulo sep-s">${cancha.nombre}</h1>
              <p class="detalle__lugar">Solicitud ${s.codigo} · enviada el ${diaMes(s.enviada)}</p>
            </div>
            <div class="datos">
              ${caja("calendario", "Fecha", FECHA.mini(FECHA.leer(s.fecha)))}
              ${caja("reloj", "Hora", `${s.hora} – ${s.fin}`, true)}
              ${caja("personas", "Personas", s.personas)}
            </div>
            <div class="motivo-caja">
              <p class="motivo-caja__sobre">MOTIVO · ${UI.escapar(s.tipo).toUpperCase()}</p>
              <p>${UI.escapar(s.descripcion)}</p>
            </div>
            ${estadoPasos(s, true)}
            <div class="total-pagar">
              <div>
                <p class="total-pagar__sobre">${s.estado === "rechazada" ? "REEMBOLSO" : "PAGO"}</p>
                <p class="total-pagar__texto">${s.pago.texto} · ${diaMes(s.pago.fecha)}</p>
              </div>
              <p class="total-pagar__precio">${dinero(s.total)}</p>
            </div>
            <button type="button" class="enlace detalle-solicitud__enlace" data-comprobante>Ver comprobante</button>
          </div>
        </section>`;
    },
    alMostrar(contenedor, dato) {
      const s = buscarSolicitud(dato);
      contenedor.querySelector("[data-comprobante]").addEventListener("click", () => descargarComprobante(s));
    }
  });

  /* ==========================================================
     59 · Pagos y comprobantes
     ========================================================== */
  UCA.registrar("pagos-externo", {
    dibujar() {
      const lista = movimientos();
      return `
        <section class="pantalla pantalla--app pantalla--gris">
          ${UI.barraVolver("PERFIL / PAGOS")}
          <div class="app-contenido">
            <h1 class="titulo">Pagos y<br>comprobantes</h1>
            <div class="pagado-caja">
              <p class="pagado-caja__sobre">TOTAL PAGADO · ${DATOS.hoy.getFullYear()}</p>
              <div class="pagado-caja__fila">
                <p class="pagado-caja__monto">${dinero(totalPagado())}</p>
                <p class="pagado-caja__texto">Reembolsado: ${dinero(totalReembolsado())}</p>
              </div>
            </div>
            <div class="movimientos">
              ${
                lista.length
                  ? lista
                      .map(
                        (m) => `
                <a class="movimiento" href="#/${m.ir}" data-ir="${m.ir}">
                  <span class="menu-perfil__icono">${UI.icono(m.icono, 18)}</span>
                  <span class="movimiento__cuerpo"><span class="movimiento__titulo">${m.titulo}</span><span class="movimiento__texto">${m.texto}</span></span>
                  <span class="movimiento__derecha"><span class="movimiento__monto">${dinero(m.monto)}</span><span class="etiqueta${m.insignia[1]}">${m.insignia[0]}</span></span>
                </a>`
                      )
                      .join("")
                  : `<p class="lista-vacia">Aún no tienes pagos.</p>`
              }
            </div>
            ${lista.length ? `<button type="button" class="enlace detalle-solicitud__enlace" data-descargar>${UI.icono("description", 18)}Descargar todos los comprobantes</button>` : ""}
          </div>
        </section>`;
    },
    alMostrar(contenedor) {
      const boton = contenedor.querySelector("[data-descargar]");
      if (!boton) return;
      boton.addEventListener("click", () => {
        const lineas = ["UCA SPORTS · Polideportivo UCA", `COMPROBANTES DE ${E.nombre.toUpperCase()} (prototipo)`, ""];
        movimientos().forEach((m) => {
          lineas.push(`${diaMes(m.fecha)} · ${m.codigo} · ${m.concepto} · ${m.reembolso ? "-" : ""}${dinero(m.monto)} · ${m.insignia[0]}`);
        });
        lineas.push("", `Total pagado: ${dinero(totalPagado())}`, `Reembolsado: ${dinero(totalReembolsado())}`);
        descargar("comprobantes-UCA-SPORTS.txt", lineas);
        UI.avisar("Listo: descargamos todos tus comprobantes.");
      });
    }
  });
})();
