/* ==========================================================
   componentes.js — piezas que se repiten en las pantallas
   Cada función devuelve un pedazo de HTML (marca, campo, botón...)
   y UI.activar() les da vida (ojito, código, cuenta regresiva,
   revisión de formularios).
   ========================================================== */

/* ---------- Fechas en español (las usan varias pantallas) ---------- */
const FECHA = {
  DIAS: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
  DIAS_CORTOS: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
  LETRAS: ["D", "L", "M", "M", "J", "V", "S"],
  MESES: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
  MESES_CORTOS: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],

  // "2026-11-20" → fecha
  leer(texto) {
    const [anio, mes, dia] = texto.split("-").map(Number);
    return new Date(anio, mes - 1, dia);
  },
  // fecha → "2026-11-20"
  clave(fecha) {
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
  },
  sumarDias(fecha, cantidad) {
    return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + cantidad);
  },
  lunesDe(fecha) {
    return this.sumarDias(new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()), -((fecha.getDay() + 6) % 7));
  },
  // "Vie 20 nov"
  mini(fecha) {
    return `${this.DIAS_CORTOS[fecha.getDay()]} ${fecha.getDate()} ${this.MESES_CORTOS[fecha.getMonth()]}`;
  },
  // "viernes 20"
  diaYNumero(fecha) {
    return `${this.DIAS[fecha.getDay()].toLowerCase()} ${fecha.getDate()}`;
  },
  // "18 nov 2026"
  corta(fecha) {
    return `${fecha.getDate()} ${this.MESES_CORTOS[fecha.getMonth()]} ${fecha.getFullYear()}`;
  },
  // "Noviembre 2026"
  mes(fecha) {
    const nombre = this.MESES[fecha.getMonth()];
    return `${nombre.charAt(0).toUpperCase()}${nombre.slice(1)} ${fecha.getFullYear()}`;
  }
};

const UI = {
  /* ---------- Íconos ----------
     Usamos la librería gratuita de Google: Material Symbols (Rounded).
     Aquí se traduce el nombre en español al nombre que usa Google.
     Lista completa de íconos: https://fonts.google.com/icons */
  ICONOS: {
    atras: "arrow_back_ios_new",
    ojo: "visibility",
    ojoCerrado: "visibility_off",
    correo: "mail",
    candado: "lock",
    escudo: "verified_user",
    birrete: "school",
    calendario: "calendar_today",
    trofeo: "emoji_events",
    estrella: "star",
    usuario: "person",
    reloj: "schedule",
    visto: "check",
    inicio: "home",
    campana: "notifications",
    flecha: "chevron_right",
    flechaIzq: "chevron_left",
    alerta: "error",
    personas: "group",
    etiquetaPrecio: "sell",
    mas: "add",
    menos: "remove"
  },

  icono(nombre, tamano = 24) {
    const google = this.ICONOS[nombre] || nombre;
    return `<span class="icono material-symbols-rounded" style="--tamano:${tamano}px" aria-hidden="true">${google}</span>`;
  },

  /* Evita que lo que escribe la persona se interprete como código */
  escapar(texto = "") {
    return String(texto).replace(/[&<>"']/g, (letra) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[letra]));
  },

  /* ---------- Reglas de los campos ----------
     Cada campo puede llevar validar: "nombre", "correo", "correo-uca",
     "dui", "telefono" o "igual-clave". Si el dato no cumple, se muestra
     el mensaje debajo del campo y el botón de enviar no se activa. */
  REGLAS: {
    nombre: {
      revisar: (valor) => valor.trim().split(/\s+/).length >= 2,
      mensaje: "Escribe tu nombre y apellido."
    },
    correo: {
      revisar: (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor.trim()),
      mensaje: "Escribe un correo válido, por ejemplo nombre@correo.com."
    },
    "correo-uca": {
      revisar: (valor) => /^[^\s@]+@uca\.edu\.sv$/i.test(valor.trim()),
      mensaje: "Usa tu correo institucional, el que termina en @uca.edu.sv."
    },
    dui: {
      revisar: (valor) => /^\d{8}-\d$/.test(valor),
      mensaje: "El DUI tiene 9 números: 00000000-0."
    },
    telefono: {
      revisar: (valor) => /^\d{4}-\d{4}$/.test(valor),
      mensaje: "El teléfono tiene 8 números: 0000-0000."
    },
    "igual-clave": {
      revisar: (valor, formulario) => valor === (formulario.querySelector("#clave") || {}).value,
      mensaje: "Las contraseñas no coinciden."
    },
    tarjeta: {
      revisar: (valor) => /^\d{15,16}$/.test(valor.replace(/\s/g, "")),
      mensaje: "El número de tarjeta tiene 16 dígitos."
    },
    vence: {
      // Formato MM / AA, con un mes real y que no esté vencida
      revisar: (valor) => {
        const partes = valor.match(/^(\d{2}) \/ (\d{2})$/);
        if (!partes) return false;
        const mes = Number(partes[1]);
        const anio = 2000 + Number(partes[2]);
        if (mes < 1 || mes > 12) return false;
        const hoy = DATOS.hoy;
        return anio > hoy.getFullYear() || (anio === hoy.getFullYear() && mes >= hoy.getMonth() + 1);
      },
      mensaje: "Revisa la fecha: mes y año (MM / AA), sin estar vencida."
    },
    cvv: {
      revisar: (valor) => /^\d{3,4}$/.test(valor),
      mensaje: "El CVV son los 3 números de atrás de la tarjeta."
    },
    equipo: {
      revisar: (valor) => valor.trim().length >= 3,
      mensaje: "El nombre del equipo debe tener al menos 3 letras."
    }
  },

  /* Formato automático mientras se escribe (pone el guion solo) */
  MASCARAS: {
    dui(valor) {
      const numeros = valor.replace(/\D/g, "").slice(0, 9);
      return numeros.length > 8 ? `${numeros.slice(0, 8)}-${numeros.slice(8)}` : numeros;
    },
    telefono(valor) {
      const numeros = valor.replace(/\D/g, "").slice(0, 8);
      return numeros.length > 4 ? `${numeros.slice(0, 4)}-${numeros.slice(4)}` : numeros;
    },
    tarjeta(valor) {
      return valor.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
    },
    vence(valor) {
      const numeros = valor.replace(/\D/g, "").slice(0, 4);
      return numeros.length > 2 ? `${numeros.slice(0, 2)} / ${numeros.slice(2)}` : numeros;
    },
    cvv(valor) {
      return valor.replace(/\D/g, "").slice(0, 4);
    }
  },

  /* ---------- Navegación de la app del estudiante ---------- */

  /* Los 4 botones de la navegación inferior del estudiante */
  NAV_ESTUDIANTE: [
    { id: "estudiante-inicio", icono: "inicio", texto: "Inicio" },
    { id: "estudiante-reservas", icono: "calendario", texto: "Reservas" },
    { id: "estudiante-actividades", icono: "trofeo", texto: "Actividades" },
    { id: "estudiante-perfil", icono: "usuario", texto: "Perfil" }
  ],

  /* Los 4 botones de la navegación inferior del usuario externo */
  NAV_EXTERNO: [
    { id: "externo-inicio", icono: "inicio", texto: "Inicio" },
    { id: "externo-reservas", icono: "calendario", texto: "Reservas" },
    { id: "externo-eventos", icono: "trofeo", texto: "Eventos" },
    { id: "externo-perfil", icono: "usuario", texto: "Perfil" }
  ],

  /* Los 4 botones de la navegación inferior de administración */
  NAV_ADMIN: [
    { id: "admin-inicio", icono: "inicio", texto: "Panel" },
    { id: "admin-reservas", icono: "calendario", texto: "Reservas" },
    { id: "admin-eventos", icono: "trofeo", texto: "Eventos" },
    { id: "admin-tutorias", icono: "usuario", texto: "Tutorías" }
  ],

  /* Barra fija de abajo. "activo" es el id de la pantalla actual */
  navInferior(activo, items = this.NAV_ESTUDIANTE) {
    const botones = items
      .map((item) => {
        const esActivo = item.id === activo;
        return `
        <a class="nav-inferior__item${esActivo ? " nav-inferior__item--activo" : ""}" href="#/${item.id}" data-ir="${item.id}"${esActivo ? ' aria-current="page"' : ""}>
          ${esActivo ? '<span class="nav-inferior__indicador"></span>' : ""}
          ${this.icono(item.icono, 24)}
          <span class="nav-inferior__texto">${item.texto}</span>
        </a>`;
      })
      .join("");
    return `<nav class="nav-inferior" aria-label="Navegación principal">${botones}</nav>`;
  },

  /* Barra superior fija de las pantallas con sesión iniciada */
  barraApp() {
    return `
      <div class="app-barra">
        <p class="app-barra__marca">UCA SPORTS</p>
        <button type="button" class="app-barra__campana" data-ir="notificaciones" aria-label="Notificaciones">${this.icono("campana", 24)}</button>
      </div>`;
  },

  /* Barra de las pantallas internas: flecha de volver + ruta (ej. "RESERVAS / VOLEIBOL") */
  barraVolver(ruta) {
    return `
      <div class="app-barra app-barra--volver">
        ${this.volver()}
        <p class="app-barra__ruta">${ruta}</p>
      </div>`;
  },

  /* ---------- Hoja que sube desde abajo ----------
     Se cierra al tocar fuera de ella, con la tecla Esc o con un
     botón que tenga data-cerrar-hoja. Devuelve la hoja para darle vida. */
  abrirHoja(contenido, etiqueta = "Hoja") {
    this.cerrarHoja(true);
    const marco = document.querySelector(".marco-telefono");
    const avisoAnterior = marco.querySelector(".aviso-flotante");
    if (avisoAnterior) avisoAnterior.remove();
    const fondo = document.createElement("div");
    fondo.className = "hoja-fondo";
    fondo.innerHTML = `
      <section class="hoja" role="dialog" aria-modal="true" aria-label="${etiqueta}">
        <span class="hoja__asa" aria-hidden="true"></span>
        ${contenido}
      </section>`;
    fondo.addEventListener("click", (evento) => {
      if (evento.target === fondo) this.cerrarHoja();
    });
    fondo.querySelectorAll("[data-cerrar-hoja]").forEach((boton) => {
      boton.addEventListener("click", () => this.cerrarHoja());
    });
    marco.appendChild(fondo);
    this.hojaAbierta = fondo;
    return fondo.querySelector(".hoja");
  },

  cerrarHoja(inmediato = false) {
    const fondo = this.hojaAbierta;
    if (!fondo) return;
    this.hojaAbierta = null;
    if (inmediato) {
      fondo.remove();
      return;
    }
    fondo.classList.add("hoja-fondo--saliendo");
    setTimeout(() => fondo.remove(), 200);
  },

  /* ---------- Piezas de pantalla ---------- */

  /* Marca "UCA SPORTS". Con lema = true agrega "POLIDEPORTIVO · UCA" */
  marca(lema = false) {
    return `
      <header>
        <div class="marca" aria-label="UCA SPORTS">
          <span class="marca__uca">UCA</span><span class="marca__sports">SPORTS</span>
        </div>
        ${lema ? '<p class="marca__lema">POLIDEPORTIVO · UCA</p>' : ""}
      </header>`;
  },

  /* Flecha para volver a la pantalla anterior */
  volver(texto = "Volver") {
    return `<button type="button" class="volver" data-atras aria-label="${texto}">${this.icono("atras")}</button>`;
  },

  /* Botón grande. "ir" cambia de pantalla al tocarlo.
     "cargando" es el texto que muestra mientras "procesa" (ej. "Iniciando sesión…") */
  boton(texto, { ir = "", tipo = "button", cargando = "" } = {}) {
    const destino = ir ? ` data-ir="${ir}"` : "";
    const espera = cargando ? ` data-cargando="${cargando}"` : "";
    return `<button type="${tipo}" class="boton"${destino}${espera}>${texto}</button>`;
  },

  /* Enlace de texto que lleva a otra pantalla */
  enlace(texto, destino, clases = "") {
    return `<a class="enlace ${clases}" href="#/${destino}" data-ir="${destino}">${texto}</a>`;
  },

  /* Campo de texto con su etiqueta y su mensaje de error.
     ojo = true agrega el ojito de contraseña; validar = regla de REGLAS */
  campo({ id, etiqueta, tipo = "text", marcador = "", valor = "", ojo = false, autocompletar = "off", modo = "", validar = "" }) {
    const botonOjo = ojo
      ? `<button type="button" class="campo__ojo" data-ojo="${id}" aria-label="Mostrar u ocultar contraseña">${this.icono("ojo", 22)}</button>`
      : "";
    const atributoModo = modo ? ` inputmode="${modo}"` : "";
    const atributoValidar = validar ? ` data-validar="${validar}"` : "";
    return `
      <div class="campo">
        <label class="campo__etiqueta" for="${id}">${etiqueta}</label>
        <div class="campo__caja">
          <input class="campo__entrada" id="${id}" name="${id}" type="${tipo}" placeholder="${marcador}" value="${this.escapar(valor)}" autocomplete="${autocompletar}" aria-describedby="${id}-error"${atributoModo}${atributoValidar}>
          ${botonOjo}
        </div>
        <p class="campo__error" id="${id}-error" aria-live="polite"></p>
      </div>`;
  },

  /* Seis casillas vacías para el código de verificación */
  otp() {
    let casillas = "";
    for (let i = 0; i < 6; i++) {
      casillas += `<input class="otp__casilla" type="text" inputmode="numeric" maxlength="1" autocomplete="one-time-code" aria-label="Dígito ${i + 1} de 6">`;
    }
    return `<div class="otp" role="group" aria-label="Código de 6 dígitos">${casillas}</div>`;
  },

  /* Mensaje flotante que aparece abajo unos segundos (ej. "Te enviamos un código nuevo") */
  avisar(texto) {
    const marco = document.querySelector(".marco-telefono");
    if (!marco) return;
    const anterior = marco.querySelector(".aviso-flotante");
    if (anterior) anterior.remove();
    const aviso = document.createElement("p");
    aviso.className = "aviso-flotante";
    aviso.setAttribute("role", "status");
    aviso.textContent = texto;
    marco.appendChild(aviso);
    setTimeout(() => aviso.remove(), 2600);
  },

  /* ---------- Vida a las piezas ---------- */

  /* Se llama cada vez que se muestra una pantalla */
  activar(contenedor) {
    clearInterval(this.reloj);
    this.activarOjos(contenedor);
    this.activarCodigo(contenedor);
    this.activarCuentaRegresiva(contenedor);
    this.activarFormularios(contenedor);
  },

  /* El ojito muestra u oculta la contraseña */
  activarOjos(contenedor) {
    contenedor.querySelectorAll("[data-ojo]").forEach((boton) => {
      boton.addEventListener("click", () => {
        const entrada = contenedor.querySelector("#" + boton.dataset.ojo);
        const estabaOculta = entrada.type === "password";
        entrada.type = estabaOculta ? "text" : "password";
        boton.setAttribute("aria-pressed", String(estabaOculta));
        boton.querySelector(".icono").textContent = this.ICONOS[estabaOculta ? "ojoCerrado" : "ojo"];
      });
    });
  },

  /* El código salta de casilla en casilla, y acepta pegar los 6 números */
  activarCodigo(contenedor) {
    contenedor.querySelectorAll(".otp").forEach((grupo) => {
      const casillas = [...grupo.querySelectorAll(".otp__casilla")];

      casillas.forEach((casilla, i) => {
        casilla.addEventListener("input", () => {
          casilla.value = casilla.value.replace(/\D/g, "").slice(-1);
          if (casilla.value && casillas[i + 1]) casillas[i + 1].focus();
        });

        casilla.addEventListener("keydown", (evento) => {
          if (evento.key === "Backspace" && !casilla.value && casillas[i - 1]) {
            casillas[i - 1].focus();
          }
        });

        casilla.addEventListener("paste", (evento) => {
          evento.preventDefault();
          const numeros = (evento.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6);
          [...numeros].forEach((numero, j) => {
            if (casillas[j]) casillas[j].value = numero;
          });
          const siguiente = casillas[Math.min(numeros.length, 5)];
          if (siguiente) siguiente.focus();
          // Avisa al formulario que el código cambió (para activar el botón)
          grupo.dispatchEvent(new Event("input", { bubbles: true }));
        });
      });
    });
  },

  /* "Puedes reenviar el código en 0:45": cuenta hacia atrás de verdad.
     Al llegar a 0 aparece "Reenviar código", que borra las casillas
     y vuelve a empezar la cuenta. */
  activarCuentaRegresiva(contenedor) {
    const aviso = contenedor.querySelector("[data-reenviar]");
    if (!aviso) return;
    const total = Number(aviso.dataset.reenviar) || 45;

    const empezar = () => {
      let segundos = total;
      aviso.innerHTML = `${this.icono("reloj", 16)}<span>Puedes reenviar el código en <span data-cuenta></span></span>`;
      const lugar = aviso.querySelector("[data-cuenta]");
      const mostrar = () => {
        lugar.textContent = `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, "0")}`;
      };
      mostrar();

      clearInterval(this.reloj);
      this.reloj = setInterval(() => {
        segundos -= 1;
        if (segundos > 0) {
          mostrar();
          return;
        }
        clearInterval(this.reloj);
        aviso.innerHTML = `${this.icono("reloj", 16)}<button type="button" class="reenviar__boton">Reenviar código</button>`;
        aviso.querySelector("button").addEventListener("click", () => {
          const formulario = aviso.closest("form");
          formulario.querySelectorAll(".otp__casilla").forEach((casilla) => {
            casilla.value = "";
          });
          formulario.dispatchEvent(new Event("input", { bubbles: true }));
          formulario.querySelector(".otp__casilla").focus();
          this.avisar("Te enviamos un código nuevo.");
          empezar();
        });
      }, 1000);
    };

    empezar();
  },

  /* El botón de "enviar" solo se activa cuando TODO el formulario
     tiene sentido: cada campo cumple su regla, los requisitos de la
     contraseña se cumplen, la casilla "acepto" está marcada y el
     código tiene sus 6 dígitos. Los errores se muestran debajo de
     cada campo cuando la persona ya escribió algo y salió del campo. */
  activarFormularios(contenedor) {
    contenedor.querySelectorAll("form[data-envio], form[data-formulario]").forEach((formulario) => {
      const boton = formulario.querySelector('button[type="submit"]');
      if (!boton) return;
      const campos = [...formulario.querySelectorAll(".campo__entrada")];

      // Devuelve el problema del campo, o "" si está bien
      const errorDe = (campo) => {
        if (!campo.value.trim()) return "Este dato es obligatorio.";
        const regla = this.REGLAS[campo.dataset.validar];
        if (regla && !regla.revisar(campo.value, formulario)) return regla.mensaje;
        return "";
      };

      // Muestra (o quita) el error debajo del campo
      const pintar = (campo) => {
        const caja = campo.closest(".campo");
        const error = campo.dataset.tocado ? errorDe(campo) : "";
        caja.classList.toggle("campo--error", Boolean(error));
        campo.setAttribute("aria-invalid", String(Boolean(error)));
        caja.querySelector(".campo__error").innerHTML = error ? `${this.icono("alerta", 14)}${error}` : "";
      };

      const listo = () => {
        if (campos.some((campo) => errorDe(campo))) return false;

        const requisitos = [...formulario.querySelectorAll("[data-requisito]")];
        if (requisitos.some((item) => !item.classList.contains("requisitos__item--cumple"))) return false;

        const aceptos = [...formulario.querySelectorAll(".aceptar__entrada")];
        if (aceptos.some((caja) => !caja.checked)) return false;

        const casillas = [...formulario.querySelectorAll(".otp__casilla")];
        if (casillas.some((casilla) => !casilla.value)) return false;

        return true;
      };

      const revisar = () => {
        campos.forEach(pintar);
        boton.disabled = !listo();
      };

      campos.forEach((campo) => {
        const mascara = this.MASCARAS[campo.dataset.validar];
        if (mascara) {
          campo.addEventListener("input", () => {
            campo.value = mascara(campo.value);
          });
        }
        // Al salir del campo con algo escrito, ya se puede mostrar su error
        campo.addEventListener("blur", () => {
          if (campo.value) campo.dataset.tocado = "si";
          revisar();
        });
      });

      formulario.addEventListener("input", revisar);
      formulario.addEventListener("change", revisar);
      revisar();
    });
  }
};
