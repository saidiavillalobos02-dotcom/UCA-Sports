/* ==========================================================
   pantallas-reserva.js — Reservar un espacio (estudiante)
   18 · Detalle de la cancha
   19 · Elegir fecha y hora   (incluye el estado 20 · Sin disponibilidad)
   21 · Tu reserva (hoja)     22 · Confirmar reserva (hoja)
   90 · Horario ya reservado (hoja)
   23 · Reserva confirmada
   También sirve para ping pong (pantallas 18-PP a 23-PP):
   cambia solo el dato que va en la dirección, por ejemplo
   #/detalle-cancha/voleibol o #/detalle-cancha/ping-pong
   ========================================================== */

(() => {
  /* ---------- Ayudas de fechas ---------- */
  const LETRAS = ["D", "L", "M", "M", "J", "V", "S"];
  const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const DIAS_CORTOS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const MESES_CORTOS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

  const dia = (fecha) => new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  const sumarDias = (fecha, cantidad) => new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + cantidad);
  const clave = (fecha) => `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
  const desdeClave = (texto) => {
    const [anio, mes, numero] = texto.split("-").map(Number);
    return new Date(anio, mes - 1, numero);
  };
  const lunesDe = (fecha) => sumarDias(dia(fecha), -((fecha.getDay() + 6) % 7));
  const mayuscula = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);
  const finDe = (hora) => `${String(Number(hora.split(":")[0]) + 1).padStart(2, "0")}:00`;

  const HOY = dia(DATOS.hoy);
  const PRIMER_LUNES = lunesDe(HOY);
  const ULTIMO_DIA = sumarDias(PRIMER_LUNES, DATOS.semanasDisponibles * 7 - 1);
  const sePuedeReservar = (fecha) => fecha >= HOY && fecha <= ULTIMO_DIA;

  // "Miércoles 18" · "Miércoles 18 de noviembre" · "Mié 18 nov"
  const fechaCorta = (fecha) => `${DIAS[fecha.getDay()]} ${fecha.getDate()}`;
  const fechaLarga = (fecha) => `${DIAS[fecha.getDay()]} ${fecha.getDate()} de ${MESES[fecha.getMonth()]}`;
  const fechaMini = (fecha) => `${DIAS_CORTOS[fecha.getDay()]} ${fecha.getDate()} ${MESES_CORTOS[fecha.getMonth()]}`;

  /* ---------- Disponibilidad (de ejemplo) ----------
     Cada día hay una hora ya ocupada por otra persona (en Figma, el
     miércoles 18 a las 18:00), los días de mantenimiento no hay
     horarios, y lo que la persona ya reservó también aparece ocupado. */
  function horariosDe(id, fecha) {
    const cancha = DATOS.canchas[id];
    if (!sePuedeReservar(fecha) || DATOS.diasCerrados.includes(fecha.getDay()) || DATOS.mantenimiento.includes(clave(fecha))) return [];
    const deOtraPersona = cancha.horas[(fecha.getDate() + 4) % cancha.horas.length];
    return cancha.horas.map((hora) => {
      const tuya = UCA.reservas.some((r) => r.cancha === id && r.fecha === clave(fecha) && r.hora === hora && r.estado === "confirmada");
      return { hora, ocupado: tuya || hora === deOtraPersona, tuya };
    });
  }

  function proximoDisponible(id, desde) {
    for (let fecha = sumarDias(desde, 1); fecha <= ULTIMO_DIA; fecha = sumarDias(fecha, 1)) {
      const libre = horariosDe(id, fecha).find((h) => !h.ocupado);
      if (libre) return { fecha, hora: libre.hora };
    }
    return null;
  }

  const canchaDe = (dato) => (DATOS.canchas[dato] ? dato : "basquetbol");

  /* ---------- 18 · Detalle de la cancha ---------- */
  UCA.registrar("detalle-cancha", {
    dibujar(dato) {
      const id = canchaDe(dato);
      const cancha = DATOS.canchas[id];
      const datoCaja = (icono, nombre, valor) => `
        <div class="dato">
          ${UI.icono(icono, 20)}
          <p class="dato__nombre">${nombre}</p>
          <p class="dato__valor">${valor}</p>
        </div>`;
      return `
        <section class="pantalla pantalla--app pantalla--gris">
          ${UI.barraVolver(`RESERVAS / ${cancha.corto.toUpperCase()}`)}
          <div class="app-contenido detalle">
            <div class="detalle__foto">
              <img src="img/${encodeURI(cancha.foto)}" alt="${cancha.nombre}">
              <span class="etiqueta">Disponible</span>
            </div>
            <div>
              <h1 class="titulo">${cancha.nombre}</h1>
              <p class="detalle__lugar">${cancha.lugar}</p>
            </div>
            <div class="datos">
              ${datoCaja("personas", "Capacidad", `${cancha.capacidad} personas`)}
              ${datoCaja("reloj", "Horario", cancha.horario)}
              ${datoCaja("etiquetaPrecio", "Costo", "Gratis UCA")}
            </div>
            <div>
              <h2 class="titulo-seccion">Qué incluye</h2>
              <ul class="etiquetas">
                ${cancha.incluye.map((cosa) => `<li class="etiqueta etiqueta--borde">${cosa}</li>`).join("")}
              </ul>
            </div>
            <div>
              <h2 class="titulo-seccion">Normas de uso</h2>
              <p class="detalle__texto">${DATOS.normas}</p>
            </div>
          </div>
          <div class="app-pie">${UI.boton("Ver horarios", { ir: `elegir-horario/${id}` })}</div>
        </section>`;
    }
  });

  /* ---------- 19 · Elegir fecha y hora (y 20 · Sin disponibilidad) ---------- */
  UCA.registrar("elegir-horario", {
    dibujar(dato) {
      const cancha = DATOS.canchas[canchaDe(dato)];
      return `
        <section class="pantalla pantalla--app pantalla--gris">
          ${UI.barraVolver(`RESERVAS / ${cancha.corto.toUpperCase()}`)}
          <div class="app-contenido">
            <h1 class="titulo">¿Cuándo<br>quieres jugar?</h1>
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
          <div class="app-pie"><button type="button" class="boton" data-principal>Continuar</button></div>
        </section>`;
    },

    alMostrar(contenedor, dato) {
      const id = canchaDe(dato);
      const cancha = DATOS.canchas[id];
      const estado = {
        id,
        lunes: PRIMER_LUNES,
        fecha: HOY,
        hora: null,
        uso: DATOS.usos[0].valor,
        otra: "",
        personas: Math.min(2, cancha.capacidad)
      };
      const zonaMes = contenedor.querySelector("[data-mes]");
      const zonaDias = contenedor.querySelector("[data-dias]");
      const zonaHorarios = contenedor.querySelector("[data-horarios]");
      const principal = contenedor.querySelector("[data-principal]");
      const flechas = contenedor.querySelectorAll("[data-semana]");

      const pintar = () => {
        // Semana visible
        const jueves = sumarDias(estado.lunes, 3);
        zonaMes.textContent = `${mayuscula(MESES[jueves.getMonth()])} ${jueves.getFullYear()}`;
        flechas[0].disabled = estado.lunes <= PRIMER_LUNES;
        flechas[1].disabled = sumarDias(estado.lunes, 7) > ULTIMO_DIA;

        let dias = "";
        for (let i = 0; i < 7; i++) {
          const fecha = sumarDias(estado.lunes, i);
          const elegido = clave(fecha) === clave(estado.fecha);
          dias += `
            <button type="button" class="dia${elegido ? " dia--elegido" : ""}" data-fecha="${clave(fecha)}"
              aria-pressed="${elegido}" aria-label="${fechaLarga(fecha)}"${sePuedeReservar(fecha) ? "" : " disabled"}>
              <span class="dia__letra">${LETRAS[fecha.getDay()]}</span>
              <span class="dia__numero">${fecha.getDate()}</span>
            </button>`;
        }
        zonaDias.innerHTML = dias;

        // Horarios del día elegido
        const horarios = horariosDe(id, estado.fecha);
        if (!horarios.length) {
          const proximo = proximoDisponible(id, estado.fecha);
          zonaHorarios.innerHTML = `
            <p class="horarios__titulo">${fechaCorta(estado.fecha)} · Sin horarios disponibles</p>
            <div class="vacio">
              <span class="vacio__icono">${UI.icono("reloj", 28)}</span>
              <p class="vacio__titulo">No hay horarios este día</p>
              <p class="vacio__texto">${
                DATOS.diasCerrados.includes(estado.fecha.getDay())
                  ? "Los domingos el Polideportivo solo abre para eventos."
                  : `La ${cancha.palabra} está reservada o en mantenimiento el ${fechaCorta(estado.fecha).toLowerCase()}.`
              }</p>
              ${proximo ? `<span class="etiqueta">Próximo disponible: ${DIAS_CORTOS[proximo.fecha.getDay()]} ${proximo.fecha.getDate()} · ${proximo.hora}</span>` : ""}
            </div>`;
          principal.textContent = "Elegir otra fecha";
          principal.disabled = !proximo;
          principal.dataset.accion = "otra-fecha";
          return;
        }

        const botonesHora = horarios
          .map((h) => {
            const elegida = h.hora === estado.hora;
            const clase = h.ocupado ? " hora--ocupada" : elegida ? " hora--elegida" : "";
            const texto = h.ocupado ? `${h.hora}, ocupado` : h.hora;
            return `<button type="button" class="hora${clase}" data-hora="${h.hora}" aria-pressed="${elegida}" aria-label="${texto}">${h.hora}</button>`;
          })
          .join("");

        zonaHorarios.innerHTML = `
          <p class="horarios__titulo">${fechaCorta(estado.fecha)} · Horarios disponibles</p>
          <div class="horas">${botonesHora}</div>
          <div class="leyenda" aria-hidden="true">
            <span class="leyenda__item"><span class="leyenda__muestra"></span>Disponible</span>
            <span class="leyenda__item"><span class="leyenda__muestra leyenda__muestra--elegida"></span>Seleccionado</span>
            <span class="leyenda__item"><span class="leyenda__muestra leyenda__muestra--ocupada"></span>Ocupado</span>
          </div>
          ${
            estado.hora
              ? `<div class="seleccion">
                  <p class="seleccion__sobre">TU SELECCIÓN</p>
                  <p class="seleccion__titulo">${fechaCorta(estado.fecha)} · ${estado.hora} – ${finDe(estado.hora)}</p>
                  <p class="seleccion__texto">${cancha.nombre} · 1 hora</p>
                  ${UI.icono("calendario", 22)}
                </div>`
              : `<p class="horarios__ayuda">Toca una hora para elegirla.</p>`
          }`;
        principal.textContent = "Continuar";
        principal.disabled = !estado.hora;
        principal.dataset.accion = "continuar";
      };

      // El oyente vive en la pantalla (no en #app), así no se repite al volver a entrar
      contenedor.querySelector(".pantalla").addEventListener("click", (evento) => {
        const botonDia = evento.target.closest("[data-fecha]");
        const botonSemana = evento.target.closest("[data-semana]");
        const botonHora = evento.target.closest("[data-hora]");

        if (botonDia) {
          estado.fecha = desdeClave(botonDia.dataset.fecha);
          estado.hora = null;
          pintar();
        } else if (botonSemana) {
          // Cambia de semana y elige el primer día que se pueda reservar
          estado.lunes = sumarDias(estado.lunes, 7 * Number(botonSemana.dataset.semana));
          estado.fecha = [0, 1, 2, 3, 4, 5, 6].map((i) => sumarDias(estado.lunes, i)).find(sePuedeReservar);
          estado.hora = null;
          pintar();
        } else if (botonHora) {
          const hora = botonHora.dataset.hora;
          const info = horariosDe(id, estado.fecha).find((h) => h.hora === hora);
          if (info.ocupado) {
            hojaOcupado(estado, hora, info.tuya, pintar);
          } else {
            estado.hora = hora;
            pintar();
          }
        }
      });

      principal.addEventListener("click", () => {
        if (principal.dataset.accion === "otra-fecha") {
          const proximo = proximoDisponible(id, estado.fecha);
          if (!proximo) return;
          estado.fecha = proximo.fecha;
          estado.lunes = lunesDe(proximo.fecha);
          estado.hora = proximo.hora;
          pintar();
          UI.avisar(`Elegimos ${fechaCorta(proximo.fecha).toLowerCase()} a las ${proximo.hora}.`);
        } else if (estado.hora) {
          hojaReserva(estado);
        }
      });

      pintar();
    }
  });

  /* ---------- 21 · Tu reserva (hoja) ---------- */
  function hojaReserva(estado) {
    const cancha = DATOS.canchas[estado.id];
    const opciones = DATOS.usos
      .map((uso) => {
        const elegida = uso.valor === estado.uso;
        return `
          <label class="opcion${elegida ? " opcion--elegida" : ""}">
            <input class="opcion__entrada" type="radio" name="uso" value="${uso.valor}"${elegida ? " checked" : ""}>
            <span class="opcion__radio" aria-hidden="true"></span>
            <span><span class="opcion__titulo">${uso.valor}</span><span class="opcion__texto">${uso.texto}</span></span>
          </label>`;
      })
      .join("");

    const hoja = UI.abrirHoja(
      `
      <h2 class="hoja__titulo">Tu reserva</h2>
      <p class="hoja__texto">¿Para qué usarás la ${cancha.palabra}?</p>
      <div class="opciones" role="radiogroup" aria-label="Uso de la ${cancha.palabra}">${opciones}</div>
      <div class="hoja__otra" data-otra${estado.uso === "Otra actividad" ? "" : " hidden"}>
        ${UI.campo({ id: "otra-actividad", etiqueta: "¿Qué actividad harás?", marcador: "Ej. Práctica de porras", valor: estado.otra })}
      </div>
      <div class="contador">
        <div>
          <p class="contador__titulo">Personas</p>
          <p class="contador__texto">Máximo ${cancha.capacidad} en esta ${cancha.palabra}</p>
        </div>
        <div class="contador__control">
          <button type="button" class="contador__boton" data-restar aria-label="Quitar una persona">${UI.icono("menos", 18)}</button>
          <output class="contador__valor" data-personas aria-live="polite">${estado.personas}</output>
          <button type="button" class="contador__boton contador__boton--mas" data-sumar aria-label="Agregar una persona">${UI.icono("mas", 18)}</button>
        </div>
      </div>
      <button type="button" class="boton hoja__boton" data-seguir>Continuar</button>`,
      "Tu reserva"
    );

    const zonaOtra = hoja.querySelector("[data-otra]");
    const campoOtra = hoja.querySelector("#otra-actividad");
    const restar = hoja.querySelector("[data-restar]");
    const sumar = hoja.querySelector("[data-sumar]");
    const seguir = hoja.querySelector("[data-seguir]");

    const actualizar = () => {
      hoja.querySelector("[data-personas]").textContent = estado.personas;
      restar.disabled = estado.personas <= 1;
      sumar.disabled = estado.personas >= cancha.capacidad;
      seguir.disabled = estado.uso === "Otra actividad" && !estado.otra.trim();
    };

    hoja.querySelectorAll(".opcion__entrada").forEach((radio) => {
      radio.addEventListener("change", () => {
        estado.uso = radio.value;
        hoja.querySelectorAll(".opcion").forEach((opcion) => {
          opcion.classList.toggle("opcion--elegida", opcion.contains(radio));
        });
        zonaOtra.hidden = estado.uso !== "Otra actividad";
        if (!zonaOtra.hidden) campoOtra.focus();
        actualizar();
      });
    });
    campoOtra.addEventListener("input", () => {
      estado.otra = campoOtra.value;
      actualizar();
    });
    restar.addEventListener("click", () => {
      estado.personas = Math.max(1, estado.personas - 1);
      actualizar();
    });
    sumar.addEventListener("click", () => {
      estado.personas = Math.min(cancha.capacidad, estado.personas + 1);
      actualizar();
    });
    seguir.addEventListener("click", () => hojaConfirmar(estado));

    actualizar();
  }

  /* ---------- 22 · Confirmar reserva (hoja) ---------- */
  function hojaConfirmar(estado) {
    const cancha = DATOS.canchas[estado.id];
    const actividad = estado.uso === "Otra actividad" ? estado.otra.trim() : estado.uso;
    const personas = `${estado.personas} ${estado.personas === 1 ? "persona" : "personas"}`;
    const fila = (nombre, valor) => `
      <div class="resumen__fila"><span class="resumen__nombre">${nombre}</span><span class="resumen__valor">${valor}</span></div>`;

    const hoja = UI.abrirHoja(
      `
      <h2 class="hoja__titulo">Confirma tu reserva</h2>
      <div class="resumen">
        <p class="resumen__sobre">RESUMEN</p>
        ${fila(cancha.etiqueta, cancha.nombre)}
        ${fila("Fecha", fechaLarga(estado.fecha))}
        ${fila("Hora", `${estado.hora} – ${finDe(estado.hora)}`)}
        ${fila("Actividad", `${UI.escapar(actividad)} · ${personas}`)}
        <div class="resumen__divisor"></div>
        <div class="resumen__total">
          <div>
            <p class="resumen__total-nombre">Total</p>
            <span class="etiqueta">Sin costo para estudiantes UCA</span>
          </div>
          <p class="resumen__gratis">Gratis</p>
        </div>
      </div>
      <button type="button" class="boton hoja__boton" data-confirmar>Confirmar reserva</button>
      <button type="button" class="enlace hoja__enlace" data-editar>Editar reserva</button>`,
      "Confirma tu reserva"
    );

    hoja.querySelector("[data-editar]").addEventListener("click", () => hojaReserva(estado));

    const confirmar = hoja.querySelector("[data-confirmar]");
    confirmar.addEventListener("click", () => {
      confirmar.disabled = true;
      confirmar.classList.add("boton--cargando");
      confirmar.textContent = "Confirmando…";
      setTimeout(() => {
        const reserva = {
          codigo: `R-${1000 + Math.floor(Math.random() * 9000)}`,
          cancha: estado.id,
          nombre: cancha.nombre,
          fecha: clave(estado.fecha),
          hora: estado.hora,
          fin: finDe(estado.hora),
          actividad,
          personas: estado.personas,
          estado: "confirmada"
        };
        UCA.reservas.unshift(reserva);
        UCA.sesion.reserva = reserva;
        DATOS.avisos.unshift({
          id: `r-${Date.now()}`,
          grupo: "HOY",
          categoria: "reservas",
          icono: "visto",
          titulo: "Reserva confirmada",
          texto: `${cancha.nombre} · ${fechaMini(estado.fecha)}, ${estado.hora}`,
          tiempo: "Ahora",
          leido: false,
          ir: "mis-reservas"
        });
        UCA.ir("reserva-confirmada");
      }, 800);
    });
  }

  /* ---------- 90 · Horario ya reservado (hoja) ---------- */
  function hojaOcupado(estado, hora, esTuya, pintar) {
    const libres = horariosDe(estado.id, estado.fecha).filter((h) => !h.ocupado).map((h) => h.hora);
    let elegida = libres[0] || null;
    const titulo = esTuya ? "Ya reservaste<br>este horario" : "Este horario ya<br>fue reservado";
    const texto = esTuya
      ? `Ya tienes una reserva el ${fechaCorta(estado.fecha).toLowerCase()} a las ${hora}. Puedes verla en Mis reservas.`
      : `Alguien confirmó ${fechaCorta(estado.fecha)} · ${hora} antes que tú. Elige otro horario disponible.`;

    const hoja = UI.abrirHoja(
      `
      <span class="circulo circulo--aviso">${UI.icono("reloj", 26)}</span>
      <h2 class="hoja__titulo sep-s">${titulo}</h2>
      <p class="hoja__texto">${texto}</p>
      ${
        libres.length
          ? `<p class="hoja__sobre">HORARIOS LIBRES ESE DÍA</p>
             <div class="chips">${libres
               .map((h) => `<button type="button" class="chip${h === elegida ? " chip--elegido" : ""}" data-libre="${h}" aria-pressed="${h === elegida}">${h}</button>`)
               .join("")}</div>
             <button type="button" class="boton hoja__boton" data-reservar>Reservar a las ${elegida}</button>`
          : ""
      }
      <button type="button" class="enlace hoja__enlace" data-cerrar-hoja>Elegir otro día</button>`,
      "Horario ocupado"
    );

    hoja.querySelectorAll("[data-libre]").forEach((chip) => {
      chip.addEventListener("click", () => {
        elegida = chip.dataset.libre;
        hoja.querySelectorAll("[data-libre]").forEach((otro) => {
          otro.classList.toggle("chip--elegido", otro === chip);
          otro.setAttribute("aria-pressed", String(otro === chip));
        });
        hoja.querySelector("[data-reservar]").textContent = `Reservar a las ${elegida}`;
      });
    });

    const reservar = hoja.querySelector("[data-reservar]");
    if (reservar) {
      reservar.addEventListener("click", () => {
        estado.hora = elegida;
        pintar();
        hojaReserva(estado);
      });
    }
  }

  /* ---------- 23 · Reserva confirmada ---------- */
  UCA.registrar("reserva-confirmada", {
    dibujar() {
      // Si se entra directo (sin reservar), se muestra el ejemplo de Figma
      const reserva = UCA.sesion.reserva || {
        codigo: "R-4821",
        cancha: "voleibol",
        nombre: "Cancha de voleibol",
        fecha: "2026-11-18",
        hora: "15:00",
        fin: "16:00",
        actividad: "Entrenamiento",
        personas: 8
      };
      const fecha = desdeClave(reserva.fecha);
      const lugar = DATOS.canchas[reserva.cancha] ? DATOS.canchas[reserva.cancha].palabra : "cancha";
      return `
        <section class="pantalla pantalla--oscura">
          ${UI.marca(true)}
          <span class="circulo circulo--grande exito__icono">${UI.icono("visto", 34)}</span>
          <span class="etiqueta exito__etiqueta">RESERVA CONFIRMADA</span>
          <h1 class="titulo exito__titulo">¡Nos vemos<br>en la ${lugar}!</h1>
          <p class="parrafo exito__texto">Te enviamos los detalles a tu correo institucional.</p>
          <div class="tarjeta-reserva">
            <p class="tarjeta-reserva__sobre">TU RESERVA</p>
            <p class="tarjeta-reserva__titulo">${reserva.nombre}</p>
            <p class="tarjeta-reserva__dato">${UI.icono("calendario", 16)}${fechaMini(fecha)} · ${reserva.hora} – ${reserva.fin}</p>
            <p class="tarjeta-reserva__dato">${UI.icono("reloj", 16)}${UI.escapar(reserva.actividad)} · ${reserva.personas} ${reserva.personas === 1 ? "persona" : "personas"}</p>
            <div class="tarjeta-reserva__pie">
              <span>Código de reserva</span>
              <span class="etiqueta">${reserva.codigo}</span>
            </div>
          </div>
          <div class="al-fondo exito__acciones">
            ${UI.boton("Ver mis reservas", { ir: "mis-reservas" })}
            ${UI.enlace("Volver al inicio", "estudiante-inicio", "enlace--claro")}
          </div>
        </section>`;
    }
  });
})();
