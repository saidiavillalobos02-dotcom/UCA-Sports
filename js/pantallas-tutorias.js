/* ==========================================================
   pantallas-tutorias.js — Tutorías deportivas (estudiante)
   29 · Oportunidades de tutoría
   30 · Postulación de tutor          (#/postulacion-tutor/<disciplina>)
   31 · Requisitos y horas sociales (hoja)
   32 · Postulación enviada
   ========================================================== */

(() => {
  const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie"];
  const MINIMO_EXPERIENCIA = 20;
  const MAXIMO_EXPERIENCIA = 300;
  const postulacionDe = (id) => UCA.postulaciones.find((p) => p.tutoria === id);

  /* ---------- 29 · Oportunidades de tutoría ---------- */
  UCA.registrar("oportunidades-tutoria", {
    dibujar() {
      const tarjetas = DATOS.tutorias
        .map((t) => {
          const enviada = postulacionDe(t.id);
          return `
            <div class="convocatoria">
              <div class="convocatoria__cabecera">
                <p class="convocatoria__titulo">${t.disciplina} · ${t.nivel}</p>
                <span class="etiqueta${enviada ? " etiqueta--oscura" : ""}">${enviada ? (enviada.estado === "asignada" ? "Asignada" : "En revisión") : "Abierta"}</span>
              </div>
              <p class="convocatoria__texto">${t.dias} · ${t.hora} · ${t.cupos} cupos</p>
              ${
                enviada
                  ? `<a class="convocatoria__enlace" href="#/mis-tutorias" data-ir="mis-tutorias">${enviada.estado === "asignada" ? "Ver mi tutoría" : "Ver mi postulación"} ${UI.icono("arrow_forward", 16)}</a>`
                  : `<a class="convocatoria__enlace" href="#/postulacion-tutor/${t.id}" data-ir="postulacion-tutor/${t.id}">Quiero impartir tutorías ${UI.icono("arrow_forward", 16)}</a>`
              }
            </div>`;
        })
        .join("");

      return `
        <section class="pantalla pantalla--app pantalla--gris">
          ${UI.barraVolver("COMUNIDAD / TUTORÍAS")}
          <div class="app-contenido">
            <div>
              <h1 class="titulo">Comparte lo<br>que sabes</h1>
              <p class="detalle__lugar">Imparte tutorías y suma horas sociales.</p>
            </div>
            <div class="caja-morada caja-morada--estrella">
              <p class="caja-morada__sobre">HORAS SOCIALES</p>
              <p class="caja-morada__titulo">Hasta ${DATOS.horasPorCiclo} horas</p>
              <p class="caja-morada__pie">por ciclo como tutor deportivo</p>
              ${UI.icono("estrella", 26)}
            </div>
            <div>
              <h2 class="titulo-seccion">Convocatorias abiertas</h2>
              <div class="convocatorias">${tarjetas}</div>
            </div>
          </div>
        </section>`;
    }
  });

  /* ---------- 30 · Postulación de tutor ---------- */
  UCA.registrar("postulacion-tutor", {
    dibujar(dato) {
      const elegida = DATOS.tutorias.find((t) => t.id === dato) || DATOS.tutorias[0];
      const e = DATOS.estudiante;
      return `
        <section class="pantalla pantalla--app pantalla--gris">
          ${UI.barraVolver("TUTORÍAS / POSTULACIÓN")}
          <div class="app-contenido postulacion">
            <h1 class="titulo">Postúlate<br>como tutor</h1>

            <fieldset class="grupo">
              <legend class="grupo__titulo">Disciplina</legend>
              <div class="chips chips--formulario">
                ${DATOS.tutorias
                  .map((t) => `<button type="button" class="chip chip--chico${t.id === elegida.id ? " chip--elegido" : ""}" data-disciplina="${t.id}" aria-pressed="${t.id === elegida.id}">${t.disciplina}</button>`)
                  .join("")}
              </div>
            </fieldset>

            <div class="campo">
              <label class="campo__etiqueta" for="experiencia">Tu experiencia</label>
              <div class="campo__caja campo__caja--area">
                <textarea class="campo__entrada campo__area" id="experiencia" maxlength="${MAXIMO_EXPERIENCIA}" rows="3"
                  placeholder="Cuéntanos dónde has jugado o entrenado y por cuánto tiempo." aria-describedby="experiencia-error"></textarea>
                <span class="campo__contador" data-contador>0 / ${MAXIMO_EXPERIENCIA}</span>
              </div>
              <p class="campo__error" id="experiencia-error" aria-live="polite"></p>
            </div>

            <fieldset class="grupo">
              <legend class="grupo__titulo">Disponibilidad</legend>
              <div class="chips chips--formulario">
                ${DIAS_SEMANA.map((d) => `<button type="button" class="chip chip--chico" data-dia="${d}" aria-pressed="false">${d}</button>`).join("")}
              </div>
              <p class="grupo__ayuda">Elige al menos un día.</p>
            </fieldset>

            <div>
              <p class="grupo__titulo">Carnet UCA</p>
              <div class="carnet">
                ${UI.icono("badge", 20)}
                <span class="carnet__texto">${e.carnet} · ${e.carrera}</span>
                <span class="carnet__visto" aria-label="Verificado">${UI.icono("visto", 14)}</span>
              </div>
            </div>
          </div>
          <div class="app-pie">
            <button type="button" class="boton" data-enviar disabled>Enviar postulación</button>
            <a class="enlace app-pie__enlace" href="#/mis-tutorias" data-ir="mis-tutorias" data-ver-tutorias hidden>Ver mis tutorías</a>
          </div>
        </section>`;
    },

    alMostrar(contenedor, dato) {
      const enviar = contenedor.querySelector("[data-enviar]");
      const estado = {
        tutoria: (DATOS.tutorias.find((t) => t.id === dato) || DATOS.tutorias[0]).id,
        experiencia: "",
        dias: new Set(),
        tocado: false
      };
      const area = contenedor.querySelector("#experiencia");
      const error = contenedor.querySelector("#experiencia-error");
      const caja = area.closest(".campo");

      const revisar = () => {
        const corta = estado.experiencia.trim().length < MINIMO_EXPERIENCIA;
        const mensaje = estado.tocado && corta ? `${UI.icono("alerta", 14)}Cuéntanos un poco más (mínimo ${MINIMO_EXPERIENCIA} letras).` : "";
        error.innerHTML = mensaje;
        caja.classList.toggle("campo--error", Boolean(mensaje));
        contenedor.querySelector("[data-contador]").textContent = `${estado.experiencia.length} / ${MAXIMO_EXPERIENCIA}`;
        // Si ya se postuló a esa disciplina, no se puede enviar otra vez
        const tutoria = DATOS.tutorias.find((t) => t.id === estado.tutoria);
        const anterior = postulacionDe(estado.tutoria);
        const yaEnviada = Boolean(anterior);
        enviar.textContent = !anterior
          ? "Enviar postulación"
          : anterior.estado === "asignada"
            ? `Ya das tutorías de ${tutoria.disciplina.toLowerCase()}`
            : `Ya te postulaste a ${tutoria.disciplina.toLowerCase()}`;
        enviar.disabled = yaEnviada || corta || estado.dias.size === 0;
        contenedor.querySelector("[data-ver-tutorias]").hidden = !yaEnviada;
      };

      area.addEventListener("input", () => {
        estado.experiencia = area.value;
        revisar();
      });
      area.addEventListener("blur", () => {
        if (area.value) estado.tocado = true;
        revisar();
      });

      contenedor.querySelector(".pantalla").addEventListener("click", (evento) => {
        const disciplina = evento.target.closest("[data-disciplina]");
        const dia = evento.target.closest("[data-dia]");
        if (disciplina) {
          // Cambia la disciplina sin perder lo que ya escribió
          estado.tutoria = disciplina.dataset.disciplina;
          contenedor.querySelectorAll("[data-disciplina]").forEach((otra) => {
            otra.classList.toggle("chip--elegido", otra === disciplina);
            otra.setAttribute("aria-pressed", String(otra === disciplina));
          });
          revisar();
        } else if (dia) {
          const activo = !estado.dias.has(dia.dataset.dia);
          if (activo) estado.dias.add(dia.dataset.dia);
          else estado.dias.delete(dia.dataset.dia);
          dia.classList.toggle("chip--elegido", activo);
          dia.setAttribute("aria-pressed", String(activo));
          revisar();
        }
      });

      enviar.addEventListener("click", () => hojaRequisitos(estado));
      revisar();
    }
  });

  /* ---------- 31 · Requisitos y horas sociales (hoja) ---------- */
  function hojaRequisitos(estado) {
    const hoja = UI.abrirHoja(
      `
      <h2 class="hoja__titulo">Antes de enviar</h2>
      <p class="hoja__texto">Revisa los requisitos para ser tutor deportivo.</p>
      <ul class="requisitos-tutor">
        ${DATOS.requisitosTutor.map((r) => `<li><span class="requisitos-tutor__visto">${UI.icono("visto", 14)}</span>${r}</li>`).join("")}
      </ul>
      <div class="caja-lima">
        <p class="caja-lima__sobre">HORAS SOCIALES</p>
        <p class="caja-lima__texto">Cada hora de tutoría suma<br>1 hora social.</p>
        ${UI.icono("estrella", 26)}
      </div>
      <button type="button" class="boton hoja__boton" data-aceptar>Acepto y envío mi postulación</button>
      <button type="button" class="enlace hoja__enlace" data-cerrar-hoja>Volver al formulario</button>`,
      "Requisitos para ser tutor"
    );

    const aceptar = hoja.querySelector("[data-aceptar]");
    aceptar.addEventListener("click", () => {
      aceptar.disabled = true;
      aceptar.classList.add("boton--cargando");
      aceptar.textContent = "Enviando postulación…";
      setTimeout(() => {
        const tutoria = DATOS.tutorias.find((t) => t.id === estado.tutoria);
        const postulacion = {
          tutoria: tutoria.id,
          disciplina: tutoria.disciplina,
          nivel: tutoria.nivel,
          experiencia: estado.experiencia.trim(),
          dias: DIAS_SEMANA.filter((d) => estado.dias.has(d)),
          fecha: FECHA.clave(DATOS.hoy),
          estado: "revision"
        };
        UCA.postulaciones.unshift(postulacion);
        UCA.sesion.postulacion = postulacion;
        DATOS.avisos.unshift({
          id: `t-${Date.now()}`,
          grupo: "HOY",
          categoria: "tutorias",
          icono: "estrella",
          titulo: "Postulación enviada",
          texto: `Tutoría de ${tutoria.disciplina.toLowerCase()} · en revisión.`,
          tiempo: "Ahora",
          leido: false,
          ir: "mis-tutorias"
        });
        UCA.ir("postulacion-enviada");
      }, 900);
    });
  }

  /* ---------- 32 · Postulación enviada ---------- */
  UCA.registrar("postulacion-enviada", {
    dibujar() {
      const p = UCA.sesion.postulacion || { disciplina: "Básquetbol", fecha: FECHA.clave(DATOS.hoy) };
      const fecha = FECHA.leer(p.fecha);
      return `
        <section class="pantalla pantalla--oscura">
          ${UI.marca(true)}
          <span class="circulo circulo--grande exito__icono">${UI.icono("visto", 34)}</span>
          <span class="etiqueta exito__etiqueta">POSTULACIÓN ENVIADA</span>
          <h1 class="titulo exito__titulo">¡Gracias por<br>postularte!</h1>
          <p class="parrafo exito__texto">Administración revisará tu postulación de ${p.disciplina.toLowerCase()} y te avisará.</p>
          <ol class="estado-pasos" aria-label="Estado de la postulación">
            <li class="estado-pasos__sobre" aria-hidden="true">ESTADO</li>
            <li class="estado-paso estado-paso--hecho">
              <span class="estado-paso__marca">${UI.icono("visto", 14)}</span>
              <span><span class="estado-paso__titulo">Enviada</span><span class="estado-paso__texto">Hoy, ${fecha.getDate()} ${FECHA.MESES_CORTOS[fecha.getMonth()]}</span></span>
            </li>
            <li class="estado-paso estado-paso--actual">
              <span class="estado-paso__marca"></span>
              <span><span class="estado-paso__titulo">En revisión</span><span class="estado-paso__texto">1 a 3 días hábiles</span></span>
            </li>
            <li class="estado-paso">
              <span class="estado-paso__marca"></span>
              <span><span class="estado-paso__titulo">Tutoría asignada</span><span class="estado-paso__texto">Empieza a sumar horas sociales</span></span>
            </li>
          </ol>
          <div class="al-fondo exito__acciones">
            ${UI.boton("Ver mis tutorías", { ir: "mis-tutorias" })}
            ${UI.enlace("Volver a actividades", "estudiante-actividades", "enlace--claro")}
          </div>
        </section>`;
    }
  });
})();
