/* ==========================================================
   pantallas-acceso.js — Acceso y registro
   Splash, bienvenida, iniciar sesión (estudiante, externo y
   administración), elegir perfil, crear cuenta y recuperar
   contraseña. Los números (00, 01, 02...) son los de Figma.
   ========================================================== */

/* ---------- Ayudas que usan varias pantallas de este archivo ---------- */

/* Correo + contraseña + "¿Olvidaste tu contraseña?" + botón (02, 02a y 02b) */
function camposAcceso({ etiquetaCorreo, marcadorCorreo, tipoCorreo = "email" }) {
  return `
    ${UI.campo({ id: "correo", etiqueta: etiquetaCorreo, tipo: tipoCorreo, marcador: marcadorCorreo, autocompletar: "username" })}
    ${UI.campo({ id: "clave", etiqueta: "Contraseña", tipo: "password", marcador: "Ingresa tu contraseña", ojo: true, autocompletar: "current-password" })}
    ${UI.enlace("¿Olvidaste tu contraseña?", "recuperar-contrasena", "enlace--chico acceso__olvido")}
    ${UI.boton("Iniciar sesión", { tipo: "submit" })}`;
}

/* Caja oscura con los requisitos de la contraseña (09 y 14) */
function requisitosClave(titulo) {
  return `
    <div class="requisitos">
      <p class="requisitos__titulo">${titulo}</p>
      <p class="requisitos__item" data-requisito="largo">${UI.icono("visto", 16)}Mínimo 8 caracteres</p>
      <p class="requisitos__item" data-requisito="mezcla">${UI.icono("visto", 16)}Letras y números</p>
    </div>`;
}

/* Revisa la contraseña mientras se escribe: tacha los requisitos
   y, si existe el medidor (pantalla 14), llena las barritas */
function vigilarClave(contenedor) {
  const clave = contenedor.querySelector("#clave");
  const requisitos = contenedor.querySelectorAll("[data-requisito]");
  const barras = contenedor.querySelectorAll(".seguridad__nivel");
  const textoNivel = contenedor.querySelector("[data-nivel]");
  const nombres = ["—", "BAJA", "MEDIA", "ALTA", "MUY ALTA"];

  const revisar = () => {
    const valor = clave.value;
    const cumple = {
      largo: valor.length >= 8,
      mezcla: /[A-Za-z]/.test(valor) && /\d/.test(valor)
    };
    requisitos.forEach((item) => {
      item.classList.toggle("requisitos__item--cumple", cumple[item.dataset.requisito]);
    });

    // Nivel de 0 a 4: un punto por cada cosa buena de la contraseña
    const nivel = [
      valor.length > 0,
      cumple.largo,
      cumple.mezcla,
      valor.length >= 12 && /[^A-Za-z0-9]/.test(valor)
    ].filter(Boolean).length;

    barras.forEach((barra, i) => {
      barra.classList.toggle("seguridad__nivel--activo", i < nivel);
    });
    if (textoNivel) textoNivel.textContent = nombres[nivel];
  };

  clave.addEventListener("input", revisar);
  revisar();
}

/* ---------- 00 · Splash ---------- */
UCA.registrar("splash", {
  dibujar() {
    return `
      <section class="pantalla splash" data-ir="bienvenida" role="button" tabindex="0" aria-label="UCA SPORTS. Toca para continuar">
        <img class="splash__simbolo" src="img/logo-simbolo.svg" alt="" width="140" height="140" onerror="this.remove()">
        <p class="splash__marca"><span class="splash__uca">UCA</span><span class="splash__sports">SPORTS</span></p>
      </section>`;
  },
  alMostrar() {
    // Pasa sola a la bienvenida a los 2.5 segundos (o al tocar la pantalla)
    setTimeout(() => {
      if (UCA.actual === "splash") UCA.ir("bienvenida");
    }, 2500);
  }
});

/* ---------- 01 · Bienvenida ---------- */
UCA.registrar("bienvenida", {
  dibujar() {
    return `
      <section class="pantalla pantalla--oscura">
        ${UI.marca(true)}
        <div class="foto bienvenida__foto">
          <span>Foto pendiente</span>
          <img src="img/bienvenida.jpg" alt="Balón de fútbol sobre el pasto" onerror="this.remove()">
        </div>
        <span class="etiqueta bienvenida__lema">TU CAMPUS. TU CANCHA.</span>
        <h1 class="titulo bienvenida__titulo">El deporte también<br>es parte de tu<br>experiencia UCA</h1>
        <p class="parrafo bienvenida__texto">Reserva, juega y conecta con tu comunidad.<br>Todo el deporte de la UCA, en un solo lugar.</p>
        <div class="al-fondo bienvenida__acciones">
          ${UI.boton("Comenzar", { ir: "elegir-perfil" })}
          ${UI.enlace("Ya tengo una cuenta", "iniciar-sesion", "enlace--claro")}
          <a class="bienvenida__admin" href="#/acceso-admin" data-ir="acceso-admin">${UI.icono("escudo", 16)}Acceso administración</a>
        </div>
      </section>`;
  }
});

/* ---------- 02 · Iniciar sesión (estudiante) ---------- */
UCA.registrar("iniciar-sesion", {
  dibujar() {
    return `
      <section class="pantalla pantalla--clara">
        ${UI.marca()}
        ${UI.volver("Volver a bienvenida")}
        <h1 class="titulo bajo-volver">¡Qué bueno<br>tenerte aquí!</h1>
        <p class="subtitulo">Tu próxima jugada empieza aquí.</p>
        <form class="pila acceso__formulario" data-envio="estudiante-inicio" novalidate>
          ${camposAcceso({ etiquetaCorreo: "Correo electrónico", marcadorCorreo: "00000000@uca.edu.sv" })}
          <p class="acceso__registro">¿Aún no tienes cuenta? ${UI.enlace("Regístrate", "elegir-perfil")}</p>
          <div>
            <p class="acceso__sobre">Al registrarte, elige tu perfil</p>
            <div class="acceso__perfiles">
              <button type="button" class="boton-mini boton-mini--morado" data-ir="cuenta-institucional">Estudiante UCA</button>
              <button type="button" class="boton-mini" data-ir="crear-cuenta-datos">Usuario externo</button>
            </div>
          </div>
        </form>
        <p class="acceso__otros">
          <a href="#/iniciar-sesion-externo" data-ir="iniciar-sesion-externo">${UI.icono("usuario", 15)}Soy usuario externo</a>
          <span aria-hidden="true">·</span>
          <a href="#/acceso-admin" data-ir="acceso-admin">${UI.icono("escudo", 15)}Acceso administración</a>
        </p>
      </section>`;
  }
});

/* ---------- 02a · Acceso administración ---------- */
UCA.registrar("acceso-admin", {
  dibujar() {
    return `
      <section class="pantalla pantalla--clara">
        ${UI.marca()}
        ${UI.volver("Volver a bienvenida")}
        <h1 class="titulo bajo-volver">Acceso<br>administración</h1>
        <p class="subtitulo">Solo para personal autorizado del Polideportivo.</p>
        <form class="pila acceso__formulario" data-envio="admin-inicio" novalidate>
          ${camposAcceso({ etiquetaCorreo: "Correo institucional", marcadorCorreo: "admin@uca.edu.sv" })}
          <div class="aviso">
            ${UI.icono("escudo", 26)}
            <p>Las cuentas de administración las asigna el Polideportivo UCA. Si necesitas acceso, solicítalo allí.</p>
          </div>
          <p class="centrado">${UI.enlace("Entrar como estudiante o usuario externo", "iniciar-sesion", "enlace--chico")}</p>
        </form>
      </section>`;
  }
});

/* ---------- 02b · Iniciar sesión (usuario externo) ---------- */
UCA.registrar("iniciar-sesion-externo", {
  dibujar() {
    return `
      <section class="pantalla pantalla--clara">
        ${UI.marca()}
        ${UI.volver("Volver a bienvenida")}
        <h1 class="titulo bajo-volver">¡Qué bueno<br>tenerte aquí!</h1>
        <p class="subtitulo">Ingresa con el correo con el que te registraste.</p>
        <form class="pila acceso__formulario" data-envio="externo-inicio" novalidate>
          ${camposAcceso({ etiquetaCorreo: "Correo electrónico", marcadorCorreo: "nombre@correo.com" })}
          <p class="acceso__registro">¿Aún no tienes cuenta? ${UI.enlace("Regístrate", "crear-cuenta-datos")}</p>
          <p class="centrado">${UI.enlace("Entrar como estudiante UCA", "iniciar-sesion", "enlace--chico")}</p>
        </form>
      </section>`;
  }
});

/* ---------- 06 · Elegir perfil ---------- */
UCA.registrar("elegir-perfil", {
  dibujar() {
    return `
      <section class="pantalla pantalla--oscura">
        ${UI.marca(true)}
        ${UI.volver("Volver a bienvenida")}
        <div class="pila">
          <span class="etiqueta">ELIGE TU PERFIL</span>
          <h1 class="titulo">¿Cómo vas a vivir<br>el deporte UCA?</h1>
          <p class="parrafo">Elige cómo vas a usar UCA SPORTS.</p>
        </div>
        <div class="pila sep-m" role="radiogroup" aria-label="Tu perfil">
          <button type="button" class="perfil perfil--elegido" role="radio" aria-checked="true" data-destino="cuenta-institucional">
            <span class="perfil__sobre">Comunidad UCA</span>
            <span class="perfil__marca">${UI.icono("visto", 16)}</span>
            <span class="perfil__titulo">Soy estudiante<br>UCA</span>
            <span class="perfil__texto">Entra con tu cuenta institucional.</span>
          </button>
          <button type="button" class="perfil" role="radio" aria-checked="false" data-destino="crear-cuenta-datos">
            <span class="perfil__sobre">Visitante</span>
            <span class="perfil__marca">${UI.icono("visto", 16)}</span>
            <span class="perfil__titulo">Soy usuario<br>externo</span>
            <span class="perfil__texto">Solicita reservas, justifica el uso y paga en línea.</span>
          </button>
        </div>
        <div class="al-fondo">${UI.boton("Continuar")}</div>
      </section>`;
  },
  alMostrar(contenedor) {
    const perfiles = [...contenedor.querySelectorAll(".perfil")];
    let elegido = perfiles[0];

    // Al tocar un perfil, queda marcado y el otro se apaga
    perfiles.forEach((perfil) => {
      perfil.addEventListener("click", () => {
        elegido = perfil;
        perfiles.forEach((otro) => {
          const activo = otro === perfil;
          otro.classList.toggle("perfil--elegido", activo);
          otro.setAttribute("aria-checked", String(activo));
        });
      });
    });

    // "Continuar" lleva al registro del perfil elegido
    contenedor.querySelector(".boton").addEventListener("click", () => {
      UCA.ir(elegido.dataset.destino);
    });
  }
});

/* ---------- 07 · Cuenta institucional ---------- */
UCA.registrar("cuenta-institucional", {
  dibujar() {
    return `
      <section class="pantalla pantalla--clara">
        ${UI.marca()}
        ${UI.volver()}
        <h1 class="titulo bajo-volver">Ya eres parte<br>del equipo</h1>
        <p class="subtitulo">Como estudiante UCA no necesitas registrarte.</p>
        <div class="pila pila--amplia sep-m">
          <div class="tarjeta">
            <div class="tarjeta__cabecera">
              <p class="tarjeta__sobre">Cuenta institucional</p>
              ${UI.icono("birrete", 26)}
            </div>
            <p class="tarjeta__titulo">Entra con tu<br>correo UCA</p>
            <p class="correo-uca">${UI.icono("correo", 16)}00000000@uca.edu.sv<span class="etiqueta">Verificada</span></p>
          </div>
          <section aria-labelledby="beneficios">
            <h2 class="titulo-seccion" id="beneficios">Con tu cuenta puedes</h2>
            <div class="beneficios">
              <p class="beneficio">${UI.icono("calendario")}<span>Reservar<br>sin costo</span></p>
              <p class="beneficio">${UI.icono("trofeo")}<span>Inscribirte<br>a eventos</span></p>
              <p class="beneficio">${UI.icono("estrella")}<span>Sumar horas<br>sociales</span></p>
            </div>
          </section>
          ${UI.boton("Iniciar sesión", { ir: "iniciar-sesion" })}
          <p class="centrado acceso__registro acceso__registro--centrado">¿No eres estudiante? ${UI.enlace("Crea una cuenta", "crear-cuenta-datos")}</p>
        </div>
      </section>`;
  }
});

/* ---------- 08 · Crear cuenta · Tus datos ---------- */
UCA.registrar("crear-cuenta-datos", {
  dibujar() {
    return `
      <section class="pantalla pantalla--clara">
        ${UI.marca()}
        ${UI.volver()}
        <div class="progreso bajo-volver" role="progressbar" aria-valuemin="0" aria-valuemax="2" aria-valuenow="1" aria-label="Paso 1 de 2">
          <p class="progreso__texto">Paso 1 de 2 · Tus datos</p>
          <div class="progreso__barra"><div class="progreso__avance" style="--avance:50%"></div></div>
        </div>
        <h1 class="titulo sep-s">Crea tu cuenta</h1>
        <form class="pila sep-m" data-envio="crear-cuenta-seguridad" novalidate>
          <div class="aviso-externo">
            <div>
              <p class="aviso-externo__sobre">USUARIO EXTERNO</p>
              <p class="aviso-externo__texto">Tus reservas requieren justificar el uso y pagar.</p>
            </div>
            ${UI.icono("usuario", 22)}
          </div>
          ${UI.campo({ id: "nombre", etiqueta: "Nombre completo", marcador: "Ej. María López", autocompletar: "name" })}
          ${UI.campo({ id: "dui", etiqueta: "DUI", marcador: "00000000-0", modo: "numeric" })}
          ${UI.campo({ id: "correo", etiqueta: "Correo electrónico", tipo: "email", marcador: "tu.correo@gmail.com", autocompletar: "email" })}
          ${UI.campo({ id: "telefono", etiqueta: "Teléfono", tipo: "tel", marcador: "0000-0000", autocompletar: "tel", modo: "tel" })}
          ${UI.boton("Continuar", { tipo: "submit" })}
        </form>
      </section>`;
  }
});

/* ---------- 09 · Crear cuenta · Seguridad ---------- */
UCA.registrar("crear-cuenta-seguridad", {
  dibujar() {
    return `
      <section class="pantalla pantalla--clara">
        ${UI.marca()}
        ${UI.volver()}
        <div class="progreso bajo-volver" role="progressbar" aria-valuemin="0" aria-valuemax="2" aria-valuenow="2" aria-label="Paso 2 de 2">
          <p class="progreso__texto">Paso 2 de 2 · Seguridad</p>
          <div class="progreso__barra"><div class="progreso__avance" style="--avance:100%"></div></div>
        </div>
        <h1 class="titulo sep-s">Protege tu<br>cuenta</h1>
        <form class="pila sep-m" data-envio="verificar-correo" novalidate>
          ${UI.campo({ id: "clave", etiqueta: "Contraseña", tipo: "password", marcador: "Crea tu contraseña", ojo: true, autocompletar: "new-password" })}
          ${UI.campo({ id: "clave2", etiqueta: "Confirmar contraseña", tipo: "password", marcador: "Repite tu contraseña", ojo: true, autocompletar: "new-password" })}
          ${requisitosClave("Tu contraseña debe tener")}
          <label class="aceptar">
            <input class="aceptar__entrada" type="checkbox" checked>
            <span class="aceptar__caja">${UI.icono("visto", 14)}</span>
            <span>Acepto las ${UI.enlace("normas de uso del Polideportivo", "crear-cuenta-seguridad", "enlace--chico")}</span>
          </label>
          ${UI.boton("Crear cuenta", { tipo: "submit" })}
        </form>
      </section>`;
  },
  alMostrar(contenedor) {
    vigilarClave(contenedor);
  }
});

/* ---------- 10 · Verificar correo ---------- */
UCA.registrar("verificar-correo", {
  dibujar() {
    return `
      <section class="pantalla pantalla--clara">
        ${UI.marca()}
        ${UI.volver()}
        <div class="tarjeta encabezado-codigo bajo-volver">
          <span class="circulo">${UI.icono("correo", 22)}</span>
          <p class="tarjeta__sobre">Revisa tu bandeja</p>
          <p class="tarjeta__titulo">Te enviamos un código</p>
          <p class="tarjeta__texto">Escríbelo para verificar tu.correo@gmail.com</p>
        </div>
        <form class="pila sep-m" data-envio="cuenta-creada" novalidate>
          <h2 class="titulo-seccion">Código de 6 dígitos</h2>
          ${UI.otp("482")}
          <p class="reenviar" data-reenviar>${UI.icono("reloj", 16)}<span>Puedes reenviar el código en <span data-cuenta="45">0:45</span></span></p>
          ${UI.boton("Verificar", { tipo: "submit" })}
          <p class="centrado">${UI.enlace("Cambiar correo", "crear-cuenta-datos")}</p>
        </form>
      </section>`;
  }
});

/* ---------- 11 · Cuenta creada ---------- */
UCA.registrar("cuenta-creada", {
  dibujar() {
    return `
      <section class="pantalla pantalla--oscura">
        ${UI.marca(true)}
        <span class="circulo circulo--grande exito__icono">${UI.icono("visto", 34)}</span>
        <span class="etiqueta exito__etiqueta">CUENTA CREADA</span>
        <h1 class="titulo exito__titulo">¡Ya eres parte<br>de UCA SPORTS!</h1>
        <p class="parrafo exito__texto">Ahora puedes solicitar reservas en el Polideportivo UCA.</p>
        <section class="pasos" aria-labelledby="como-funciona">
          <h2 class="pasos__sobre" id="como-funciona">Así funcionan tus reservas</h2>
          <div class="paso"><span class="paso__numero">1</span><div><p class="paso__titulo">Elige espacio y horario</p><p class="paso__detalle">Básquetbol, voleibol o fútbol</p></div></div>
          <div class="paso"><span class="paso__numero">2</span><div><p class="paso__titulo">Justifica el uso</p><p class="paso__detalle">Cuéntanos qué actividad harás</p></div></div>
          <div class="paso"><span class="paso__numero">3</span><div><p class="paso__titulo">Paga y espera la aprobación</p><p class="paso__detalle">Te avisamos cuando esté lista</p></div></div>
        </section>
        <div class="al-fondo">${UI.boton("Ir al inicio", { ir: "externo-inicio" })}</div>
      </section>`;
  }
});

/* ---------- 12 · Recuperar contraseña ---------- */
UCA.registrar("recuperar-contrasena", {
  dibujar() {
    return `
      <section class="pantalla pantalla--clara">
        ${UI.marca()}
        ${UI.volver()}
        <h1 class="titulo bajo-volver">¿Olvidaste tu<br>contraseña?</h1>
        <p class="subtitulo">No pasa nada, te ayudamos a volver a la cancha.</p>
        <div class="tarjeta tarjeta--fila sep-l">
          <span class="circulo">${UI.icono("candado", 22)}</span>
          <div class="tarjeta__cuerpo">
            <p class="tarjeta__sobre">Recupera tu acceso</p>
            <p>Te enviaremos un código<br>a tu correo.</p>
          </div>
        </div>
        <form class="pila sep-m" data-envio="codigo-verificacion" novalidate>
          ${UI.campo({ id: "correo", etiqueta: "Correo electrónico", tipo: "email", marcador: "00000000@uca.edu.sv", autocompletar: "username" })}
          ${UI.boton("Enviar código", { tipo: "submit" })}
          <p class="centrado">${UI.enlace("Volver a iniciar sesión", "iniciar-sesion")}</p>
        </form>
      </section>`;
  }
});

/* ---------- 13 · Código de verificación ---------- */
UCA.registrar("codigo-verificacion", {
  dibujar() {
    return `
      <section class="pantalla pantalla--clara">
        ${UI.marca()}
        ${UI.volver()}
        <div class="tarjeta tarjeta--grafito encabezado-codigo bajo-volver">
          <span class="circulo">${UI.icono("escudo", 22)}</span>
          <p class="tarjeta__sobre">Código de seguridad</p>
          <p class="tarjeta__titulo">Revisa tu correo</p>
          <p class="tarjeta__texto">Lo enviamos a 00000000@uca.edu.sv</p>
        </div>
        <form class="pila sep-m" data-envio="nueva-contrasena" novalidate>
          <h2 class="titulo-seccion">Código de 6 dígitos</h2>
          ${UI.otp("715936")}
          <p class="reenviar" data-reenviar>${UI.icono("reloj", 16)}<span>Puedes reenviar el código en <span data-cuenta="32">0:32</span></span></p>
          ${UI.boton("Continuar", { tipo: "submit" })}
        </form>
      </section>`;
  }
});

/* ---------- 14 · Nueva contraseña ---------- */
UCA.registrar("nueva-contrasena", {
  dibujar() {
    return `
      <section class="pantalla pantalla--clara">
        ${UI.marca()}
        ${UI.volver()}
        <h1 class="titulo bajo-volver">Crea una nueva<br>contraseña</h1>
        <p class="subtitulo">Que sea fácil de recordar para ti y difícil para los demás.</p>
        <form class="pila sep-m" data-envio="contrasena-actualizada" novalidate>
          ${UI.campo({ id: "clave", etiqueta: "Nueva contraseña", tipo: "password", marcador: "••••••••••", ojo: true, autocompletar: "new-password" })}
          ${UI.campo({ id: "clave2", etiqueta: "Confirmar contraseña", tipo: "password", marcador: "••••••••••", ojo: true, autocompletar: "new-password" })}
          <div class="seguridad">
            <p class="seguridad__texto">Seguridad: <span data-nivel>—</span></p>
            <div class="seguridad__niveles">
              <span class="seguridad__nivel"></span><span class="seguridad__nivel"></span><span class="seguridad__nivel"></span><span class="seguridad__nivel"></span>
            </div>
          </div>
          ${requisitosClave("Tu contraseña tiene")}
          ${UI.boton("Guardar contraseña", { tipo: "submit" })}
        </form>
      </section>`;
  },
  alMostrar(contenedor) {
    vigilarClave(contenedor);
  }
});

/* ---------- 15 · Contraseña actualizada ---------- */
UCA.registrar("contrasena-actualizada", {
  dibujar() {
    return `
      <section class="pantalla pantalla--oscura">
        ${UI.marca(true)}
        <span class="circulo circulo--grande exito__icono">${UI.icono("visto", 34)}</span>
        <span class="etiqueta exito__etiqueta">TODO LISTO</span>
        <h1 class="titulo exito__titulo">Tu contraseña<br>fue actualizada</h1>
        <p class="parrafo exito__texto">Ya puedes volver a reservar, inscribirte y jugar.</p>
        <div class="tarjeta tarjeta--fila sep-l">
          <span class="circulo">${UI.icono("escudo", 22)}</span>
          <div class="tarjeta__cuerpo">
            <p class="tarjeta__sobre">Consejo</p>
            <p>No compartas tu contraseña<br>con nadie.</p>
          </div>
        </div>
        <div class="al-fondo">${UI.boton("Iniciar sesión", { ir: "iniciar-sesion" })}</div>
      </section>`;
  }
});
