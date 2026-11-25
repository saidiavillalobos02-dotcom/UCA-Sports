/* ==========================================================
   app.js — el "motor" del prototipo
   Muestra la pantalla correcta según la dirección (#/splash,
   #/bienvenida, ...) y se encarga de los botones "ir a" y "atrás".
   ========================================================== */

const UCA = {
  pantallas: {},   // todas las pantallas registradas
  pasos: 0,        // cuántas pantallas lleva la persona dentro de la app
  actual: null,
  sesion: {},      // lo que la persona escribió (correo, nombre...) mientras usa el prototipo
  // Lo que la persona tiene (empieza con los ejemplos de datos.js y crece al usar la app)
  reservas: DATOS.misReservas,
  inscripciones: DATOS.misInscripciones,
  postulaciones: DATOS.misTutorias,

  /* Registra una pantalla nueva. Se usa desde los archivos pantallas-*.js */
  registrar(id, pantalla) {
    this.pantallas[id] = pantalla;
  },

  /* Muestra una pantalla en el marco.
     "dato" es lo que va después de la barra en la dirección: en
     #/detalle-cancha/voleibol, la pantalla es "detalle-cancha" y el dato "voleibol" */
  mostrar(id, dato = "") {
    const contenedor = document.getElementById("app");
    const pantalla = this.pantallas[id] || this.pantallas["pendiente"];

    UI.cerrarHoja(true); // si había una hoja abierta, se cierra al cambiar de pantalla
    contenedor.innerHTML = pantalla.dibujar(dato);
    contenedor.scrollTop = 0;
    this.actual = id;

    // Da vida a los campos, el código, la cuenta regresiva...
    UI.activar(contenedor);

    // Cada pantalla puede tener su propio comportamiento (opcional)
    if (typeof pantalla.alMostrar === "function") {
      pantalla.alMostrar(contenedor, dato);
    }
  },

  /* Cambia de pantalla */
  ir(id) {
    this.pasos += 1;
    window.location.hash = "/" + id;
  },

  /* Vuelve a la pantalla anterior (o a la bienvenida si no hay anterior) */
  atras() {
    if (this.pasos > 0) {
      this.pasos -= 1;
      window.history.back();
    } else {
      window.location.hash = "/bienvenida";
    }
  },

  /* Lee la dirección y muestra la pantalla que corresponde */
  leerDireccion() {
    const ruta = decodeURIComponent(window.location.hash.replace("#/", "")) || "splash";
    const [id, dato = ""] = ruta.split("/");
    this.mostrar(id, dato);
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

    // Los formularios (data-envio) pasan a la pantalla siguiente al enviarse,
    // pero solo si su botón está activo (es decir, si los datos tienen sentido)
    document.addEventListener("submit", (evento) => {
      const formulario = evento.target.closest("[data-envio]");
      if (!formulario) return;
      evento.preventDefault();

      const boton = formulario.querySelector('button[type="submit"]');
      if (!boton || boton.disabled) return;

      // Guarda lo escrito (ej. el correo) para usarlo en las pantallas siguientes
      new FormData(formulario).forEach((valor, nombre) => {
        if (!/clave/.test(nombre)) this.sesion[nombre] = String(valor).trim();
      });

      // Simula que "procesa" un momento, como una app real
      boton.disabled = true;
      boton.classList.add("boton--cargando");
      boton.textContent = boton.dataset.cargando || "Un momento…";
      setTimeout(() => this.ir(formulario.dataset.envio), 700);
    });

    // La tecla Esc cierra la hoja que esté abierta
    document.addEventListener("keydown", (evento) => {
      if (evento.key === "Escape") UI.cerrarHoja();
    });

    window.addEventListener("hashchange", () => this.leerDireccion());
    this.leerDireccion();
  }
};

document.addEventListener("DOMContentLoaded", () => UCA.iniciar());
