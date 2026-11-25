/* ==========================================================
   pantallas.js — pantallas generales
   Aquí vive la pantalla "en construcción", que se muestra
   cuando un botón lleva a una pantalla que todavía no está lista.
   Las pantallas reales están en los archivos pantallas-*.js
   ========================================================== */

UCA.registrar("pendiente", {
  dibujar() {
    return `
      <section class="pantalla pantalla--oscura pendiente">
        <span class="etiqueta">En construcción</span>
        <h1 class="titulo">Esta pantalla aún no está lista</h1>
        <p class="parrafo">La estamos programando. Vuelve pronto.</p>
        <div class="pendiente__accion"><button type="button" class="boton" data-atras>Volver</button></div>
      </section>`;
  }
});
