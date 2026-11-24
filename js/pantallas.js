/* ==========================================================
   pantallas.js — el contenido de cada pantalla
   Cada pantalla es un bloque que devuelve su HTML.
   Orden igual al de Figma: acceso, estudiante, externo, admin...
   ========================================================== */

/* Logo provisional. Cuando tengamos el SVG del logo "Impulso", se cambia aquí. */
function logoUCA() {
  return `<span class="logo" aria-label="UCA SPORTS">UCA SPORTS<span class="logo__punto"></span></span>`;
}

/* ---------- 1. Splash: arranca el prototipo ---------- */
UCA.registrar("splash", {
  dibujar() {
    return `
      <section class="pantalla splash" data-ir="bienvenida" aria-label="Inicio">
        ${logoUCA()}
        <p class="splash__frase">Tu cancha, tu momento</p>
      </section>`;
  },
  alMostrar() {
    // Pasa sola a la bienvenida a los 2.5 segundos (o al tocar la pantalla)
    setTimeout(() => {
      if (UCA.actual === "splash") UCA.ir("bienvenida");
    }, 2500);
  }
});

/* ---------- 2. Bienvenida: elegir cómo entrar ---------- */
UCA.registrar("bienvenida", {
  dibujar() {
    return `
      <section class="pantalla bienvenida">
        ${logoUCA()}
        <h1 class="bienvenida__titulo">Reserva, juega y <span>suma</span>.</h1>
        <div class="bienvenida__opciones">
          <button class="boton boton--lima boton--ancho" data-ir="estudiante-inicio">Soy estudiante UCA</button>
          <button class="boton boton--borde boton--ancho" data-ir="externo-inicio">Soy usuario externo</button>
          <button class="boton boton--borde boton--ancho" data-ir="admin-inicio">Administración</button>
        </div>
      </section>`;
  }
});

/* ---------- Pantalla pendiente: se muestra si aún no está programada ---------- */
UCA.registrar("pendiente", {
  dibujar(id) {
    return `
      <section class="pantalla pendiente">
        <span class="etiqueta">En construcción</span>
        <h1>Esta pantalla aún no está lista</h1>
        <p>(${id})</p>
        <button class="boton boton--morado" data-atras>Volver</button>
      </section>`;
  }
});
