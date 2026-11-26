/* ==========================================================
   pantallas-estados.js — Estados de toda la app
   85 · Aviso push (aparece arriba cuando administración responde)
   87 · Cargando (la primera vez que se entra al inicio)
   88 · Sin conexión (aparece sola si se pierde internet)
   89 · Error (si algo falla o la dirección no existe)
   ========================================================== */

(() => {
  const INICIOS = { estudiante: "estudiante-inicio", externo: "externo-inicio", admin: "admin-inicio" };
  const NAVS = { estudiante: () => UI.NAV_ESTUDIANTE, externo: () => UI.NAV_EXTERNO, admin: () => UI.NAV_ADMIN };
  const marco = () => document.querySelector(".marco-telefono");
  const inicioDelRol = () => INICIOS[UCA.rol] || "bienvenida";

  /* ---------- 85 · Aviso push ---------- */
  let temporizadorPush = null;

  UI.mostrarPush = (aviso) => {
    UI.quitarPush();
    const push = document.createElement("div");
    push.className = "push";
    push.setAttribute("role", "status");
    push.innerHTML = `
      <button type="button" class="push__cuerpo" data-abrir-push>
        <span class="push__icono push__icono--${aviso.icono}">${UI.icono(aviso.icono, 20)}</span>
        <span class="push__textos">
          <span class="push__app">UCA SPORTS · ahora</span>
          <span class="push__titulo">${aviso.titulo}</span>
          <span class="push__texto">${UI.escapar(aviso.texto)}</span>
        </span>
      </button>
      <button type="button" class="push__cerrar" data-cerrar-push aria-label="Cerrar aviso">${UI.icono("close", 18)}</button>`;
    marco().appendChild(push);
    requestAnimationFrame(() => push.classList.add("push--visible"));
    push.querySelector("[data-abrir-push]").addEventListener("click", () => {
      aviso.leido = true;
      UI.quitarPush();
      UCA.ir(aviso.ir);
    });
    push.querySelector("[data-cerrar-push]").addEventListener("click", () => UI.quitarPush());
    temporizadorPush = setTimeout(() => UI.quitarPush(), 6000);
  };

  UI.quitarPush = () => {
    clearTimeout(temporizadorPush);
    document.querySelectorAll(".push").forEach((p) => p.remove());
  };

  /* Al entrar a las pantallas de una app, si administración respondió algo
     que la persona aún no ha visto, aparece el aviso arriba */
  UI.revisarPush = (id) => {
    if (!/^(estudiante|externo)-/.test(id)) return;
    const aviso = UCA.avisos.find((a) => a.push && !a.pushVisto && !a.leido);
    if (!aviso) return;
    aviso.pushVisto = true;
    setTimeout(() => {
      if (UCA.actual === id) UI.mostrarPush(aviso);
    }, 700);
  };

  /* ---------- 87 · Cargando ---------- */
  UCA.registrar("cargando", {
    dibujar(destino) {
      const rol = Object.keys(INICIOS).find((r) => INICIOS[r] === destino) || UCA.rol;
      const nav = NAVS[rol] ? UI.navInferior(INICIOS[rol], NAVS[rol]()) : "";
      return `
        <section class="pantalla pantalla--app" aria-busy="true">
          <div class="app-contenido esqueleto" aria-hidden="true">
            <span class="esqueleto__barra" style="width:30%"></span>
            <div class="esqueleto__grupo">
              <span class="esqueleto__barra esqueleto__barra--alta" style="width:48%"></span>
              <span class="esqueleto__barra" style="width:58%"></span>
            </div>
            <div class="esqueleto__tarjeta esqueleto__tarjeta--alta">
              <span class="esqueleto__barra" style="width:40%"></span>
              <span class="esqueleto__barra esqueleto__barra--alta" style="width:55%"></span>
              <span class="esqueleto__boton"></span>
            </div>
            <span class="esqueleto__barra" style="width:38%"></span>
            <div class="esqueleto__fila"><span></span><span></span><span></span></div>
            <span class="esqueleto__barra" style="width:34%"></span>
            <div class="esqueleto__tarjeta"><span class="esqueleto__barra" style="width:35%"></span><span class="esqueleto__barra" style="width:55%"></span></div>
          </div>
          <p class="esqueleto__texto" role="status"><span class="esqueleto__giro" aria-hidden="true"></span>Cargando tu inicio…</p>
          ${nav}
        </section>`;
    }
  });

  /* ---------- 88 · Sin conexión ---------- */
  const sinConexion = (comoCapa) => `
    <section class="pantalla pantalla--gris estado-pantalla${comoCapa ? " estado-pantalla--capa" : ""}" ${comoCapa ? 'role="alertdialog" aria-modal="true" aria-labelledby="titulo-sin-conexion"' : ""}>
      ${UI.marca()}
      <p class="estado-barra">${UI.icono("wifi_off", 18)}Sin conexión a internet</p>
      <div class="estado-pantalla__centro">
        <span class="estado-circulo">${UI.icono("wifi_off", 44)}</span>
        <h1 class="titulo" id="titulo-sin-conexion">Sin conexión</h1>
        <p class="parrafo">Revisa tu wifi o datos móviles e inténtalo de nuevo. No perderás lo que estabas haciendo.</p>
      </div>
      <div class="caja-morada">
        <p class="caja-morada__sobre">CONSEJO</p>
        <p class="caja-morada__texto">Conéctate a una red wifi o activa tus datos móviles.</p>
      </div>
      <div class="al-fondo"><button type="button" class="boton" data-reintentar-conexion>Reintentar</button></div>
    </section>`;

  /* Se pone encima de la pantalla actual, así no se pierde lo que se estaba haciendo */
  UI.sinConexion = (mostrar) => {
    const capa = document.querySelector(".capa-conexion");
    if (!mostrar) {
      if (capa) {
        capa.remove();
        UI.avisar("Volviste a tener conexión.");
      }
      return;
    }
    if (capa) return;
    UI.cerrarHoja(true);
    const nueva = document.createElement("div");
    nueva.className = "capa-conexion";
    nueva.innerHTML = sinConexion(true);
    marco().appendChild(nueva);
    const boton = nueva.querySelector("[data-reintentar-conexion]");
    boton.focus();
    boton.addEventListener("click", () => {
      boton.disabled = true;
      boton.classList.add("boton--cargando");
      boton.textContent = "Reintentando…";
      setTimeout(() => {
        if (navigator.onLine) {
          UI.sinConexion(false);
          return;
        }
        boton.disabled = false;
        boton.classList.remove("boton--cargando");
        boton.textContent = "Reintentar";
        UI.avisar("Todavía no hay conexión.");
      }, 900);
    });
  };

  // Pantalla para mostrar el estado en la presentación (#/sin-conexion)
  UCA.registrar("sin-conexion", {
    dibujar() {
      return sinConexion(false);
    },
    alMostrar(contenedor) {
      const boton = contenedor.querySelector("[data-reintentar-conexion]");
      boton.addEventListener("click", () => {
        boton.disabled = true;
        boton.classList.add("boton--cargando");
        boton.textContent = "Reintentando…";
        setTimeout(() => (navigator.onLine ? UCA.atras() : (boton.disabled = false, boton.classList.remove("boton--cargando"), (boton.textContent = "Reintentar"), UI.avisar("Todavía no hay conexión."))), 900);
      });
    }
  });

  /* ---------- 89 · Error ---------- */
  const ERRORES = {
    404: ["Esta pantalla no existe", "Puede que el enlace esté incompleto o que la pantalla haya cambiado de lugar."],
    500: ["Algo salió mal", "No pudimos cargar la información. Inténtalo de nuevo en unos segundos."]
  };

  UCA.registrar("error", {
    dibujar(dato) {
      const codigo = ERRORES[dato] ? dato : "500";
      const [titulo, texto] = ERRORES[codigo];
      return `
        <section class="pantalla pantalla--gris estado-pantalla">
          ${UI.marca()}
          <div class="estado-pantalla__centro">
            <span class="estado-circulo estado-circulo--rojo">${UI.icono("alerta", 44)}</span>
            <h1 class="titulo">${titulo}</h1>
            <p class="parrafo">${texto}</p>
            <span class="etiqueta etiqueta--oscura">Código de error: ${codigo}</span>
          </div>
          <a class="motivo-caja estado-soporte" href="mailto:${DATOS.administrador.correo}?subject=${encodeURIComponent(`Error ${codigo} en la app UCA SPORTS`)}">
            <p class="motivo-caja__sobre">¿SIGUE FALLANDO?</p>
            <p>Escríbenos a soporte del Polideportivo UCA.</p>
          </a>
          <div class="al-fondo">
            <button type="button" class="boton" data-reintentar>${codigo === "404" ? "Volver atrás" : "Reintentar"}</button>
            <a class="enlace app-pie__enlace" href="#/${inicioDelRol()}" data-ir="${inicioDelRol()}">Volver al inicio</a>
          </div>
        </section>`;
    },
    alMostrar(contenedor) {
      const boton = contenedor.querySelector("[data-reintentar]");
      boton.addEventListener("click", () => {
        boton.disabled = true;
        boton.classList.add("boton--cargando");
        boton.textContent = "Un momento…";
        setTimeout(() => UCA.atras(), 600);
      });
    }
  });
})();
