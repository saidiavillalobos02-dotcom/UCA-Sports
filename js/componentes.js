/* ==========================================================
   componentes.js — piezas que se repiten en las pantallas
   Cada función devuelve un pedazo de HTML (marca, campo, botón...)
   y UI.activar() les da vida (ojito, código, cuenta regresiva).
   ========================================================== */

const UI = {
  /* ---------- Íconos ----------
     Estos íconos son provisionales (dibujos de línea simples).
     Cuando exportemos los de Figma a img/iconos/, se cambian aquí. */
  ICONOS: {
    atras: '<path d="M15 18l-6-6 6-6"/>',
    ojo: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    correo: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 6L2 7"/>',
    candado: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    escudo: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
    birrete: '<path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>',
    calendario: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    trofeo: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.7V17c0 .6-.5 1-1 1.2-1.2.6-2 2-2 3.8M14 14.7V17c0 .6.5 1 1 1.2 1.2.6 2 2 2 3.8M18 2H6v7a6 6 0 0 0 12 0V2z"/>',
    estrella: '<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21.1 7 14.2 2 9.3l6.9-1L12 2z"/>',
    usuario: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    reloj: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    visto: '<path d="M20 6L9 17l-5-5"/>'
  },

  icono(nombre, tamano = 24) {
    return `<svg class="icono" width="${tamano}" height="${tamano}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${this.ICONOS[nombre]}</svg>`;
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
