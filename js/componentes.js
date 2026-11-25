/* ==========================================================
   componentes.js — piezas que se repiten en las pantallas
   Cada función devuelve un pedazo de HTML (marca, campo, botón...)
   y UI.activar() les da vida (ojito, código, cuenta regresiva).
   ========================================================== */

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
    flecha: "chevron_right"
  },

  icono(nombre, tamano = 24) {
    const google = this.ICONOS[nombre] || nombre;
    return `<span class="icono material-symbols-rounded" style="--tamano:${tamano}px" aria-hidden="true">${google}</span>`;
  },

  /* Los 4 botones de la navegación inferior del estudiante */
  NAV_ESTUDIANTE: [
    { id: "estudiante-inicio", icono: "inicio", texto: "Inicio" },
    { id: "estudiante-reservas", icono: "calendario", texto: "Reservas" },
    { id: "estudiante-actividades", icono: "trofeo", texto: "Actividades" },
    { id: "estudiante-perfil", icono: "usuario", texto: "Perfil" }
  ],

  /* Barra fija de abajo. "activo" es el id de la pantalla actual */
  navInferior(activo, items = this.NAV_ESTUDIANTE) {
    const botones = items
      .map((item) => {
        const esActivo = item.id === activo;
        return `
        <a class="nav-inferior__item${esActivo ? " nav-inferior__item--activo" : ""}" data-ir="${item.id}">
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

  /* Botón grande. Si lleva "ir", cambia de pantalla al tocarlo */
  boton(texto, { ir = "", tipo = "button" } = {}) {
    const destino = ir ? ` data-ir="${ir}"` : "";
    return `<button type="${tipo}" class="boton"${destino}>${texto}</button>`;
  },

  /* Enlace de texto que lleva a otra pantalla */
  enlace(texto, destino, clases = "") {
    return `<a class="enlace ${clases}" href="#/${destino}" data-ir="${destino}">${texto}</a>`;
  },

  /* Campo de texto con su etiqueta. ojo = true agrega el ojito de contraseña */
  campo({ id, etiqueta, tipo = "text", marcador = "", valor = "", ojo = false, autocompletar = "off", modo = "" }) {
    const botonOjo = ojo
      ? `<button type="button" class="campo__ojo" data-ojo="${id}" aria-label="Mostrar u ocultar contraseña">${this.icono("ojo", 22)}</button>`
      : "";
    const atributoModo = modo ? ` inputmode="${modo}"` : "";
    return `
      <div class="campo">
        <label class="campo__etiqueta" for="${id}">${etiqueta}</label>
        <div class="campo__caja">
          <input class="campo__entrada" id="${id}" name="${id}" type="${tipo}" placeholder="${marcador}" value="${valor}" autocomplete="${autocompletar}"${atributoModo}>
          ${botonOjo}
        </div>
      </div>`;
  },

  /* Seis casillas para el código. "digitos" es lo que ya viene escrito */
  otp(digitos = "") {
    let casillas = "";
    for (let i = 0; i < 6; i++) {
      const digito = digitos[i] || "";
      casillas += `<input class="otp__casilla" type="text" inputmode="numeric" maxlength="1" autocomplete="one-time-code" value="${digito}" aria-label="Dígito ${i + 1} de 6">`;
    }
    return `<div class="otp" role="group" aria-label="Código de 6 dígitos">${casillas}</div>`;
  },

  /* ---------- Vida a las piezas ---------- */

  /* Se llama cada vez que se muestra una pantalla */
  activar(contenedor) {
    clearInterval(this.reloj);
    this.activarOjos(contenedor);
    this.activarCodigo(contenedor);
    this.activarCuentaRegresiva(contenedor);
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
          casilla.value = casilla.value.replace(/\D/g, "").slice(0, 1);
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
        });
      });
    });
  },

  /* "Puedes reenviar el código en 0:45" cuenta hacia atrás de verdad */
  activarCuentaRegresiva(contenedor) {
    const lugar = contenedor.querySelector("[data-cuenta]");
    if (!lugar) return;

    let segundos = Number(lugar.dataset.cuenta);
    const mostrar = () => {
      const minutos = Math.floor(segundos / 60);
      const resto = String(segundos % 60).padStart(2, "0");
      lugar.textContent = `${minutos}:${resto}`;
    };
    mostrar();

    this.reloj = setInterval(() => {
      segundos -= 1;
      if (segundos <= 0) {
        clearInterval(this.reloj);
        const aviso = contenedor.querySelector("[data-reenviar]");
        if (aviso) {
          aviso.innerHTML = `${this.icono("reloj", 16)}<button type="button" class="reenviar__boton">Reenviar código</button>`;
        }
        return;
      }
      mostrar();
    }, 1000);
  }
};
