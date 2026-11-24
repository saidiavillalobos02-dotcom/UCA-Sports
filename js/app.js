/* ==========================================================
   app.js — el "motor" del prototipo
   Se encarga de mostrar la pantalla correcta según la dirección
   (#/splash, #/bienvenida, ...) y de los botones "ir a" y "atrás".
   ========================================================== */

const UCA = {
  pantallas: {},        // todas las pantallas registradas
  historial: [],        // por dónde ha pasado la persona (para el botón "atrás")
  actual: null,

  /* Registra una pantalla nueva. Se usa desde pantallas.js */
  registrar(id, pantalla) {
    this.pantallas[id] = pantalla;
  },

  /* Muestra una pantalla en el marco */
  mostrar(id) {
    const contenedor = document.getElementById("app");
    const pantalla = this.pantallas[id] || this.pantallas["pendiente"];

    // Limpiar lo anterior y dibujar la pantalla nueva
    contenedor.innerHTML = pantalla.dibujar(id);
    contenedor.scrollTop = 0;
    this.actual = id;

    // Cada pantalla puede tener su propio comportamiento (opcional)
    if (typeof pantalla.alMostrar === "function") {
      pantalla.alMostrar(contenedor);
    }
  },

  /* Cambia de pantalla (actualiza la dirección y el historial) */
  ir(id) {
    if (this.actual) this.historial.push(this.actual);
    window.location.hash = "/" + id;
  },

  /* Vuelve a la pantalla anterior */
  atras() {
    const anterior = this.historial.pop();
    window.location.hash = "/" + (anterior || "bienvenida");
  },

  /* Lee la dirección y muestra la pantalla que corresponde */
  leerDireccion() {
    const id = window.location.hash.replace("#/", "") || "splash";
    this.mostrar(id);
  },

  /* Arranque */
  iniciar() {
    // Un solo "oyente" para todos los botones con data-ir y data-atras
    document.addEventListener("click", (evento) => {
      const destino = evento.target.closest("[data-ir]");
      if (destino) {
        evento.preventDefault();
        this.ir(destino.dataset.ir);
        return;
      }
      if (evento.target.closest("[data-atras]")) {
        evento.preventDefault();
        this.atras();
      }
    });

    window.addEventListener("hashchange", () => this.leerDireccion());
    this.leerDireccion();
  }
};

document.addEventListener("DOMContentLoaded", () => UCA.iniciar());
