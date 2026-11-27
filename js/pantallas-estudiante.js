/* ==========================================================
   pantallas-estudiante.js — App del estudiante
   Inicio, Reservas y Actividades: lo primero que ve un
   estudiante UCA ya con sesión iniciada. Los números (03, 04,
   05...) son los de Figma. El resto de la sección (reservar
   una cancha paso a paso, inscribirse a un evento, tutorías
   y el perfil) se agrega en los próximos archivos.
   ========================================================== */

/* ---------- 03 · Inicio ---------- */
UCA.registrar("estudiante-inicio", {
  dibujar() {
    return `
      <section class="pantalla pantalla--app">
        ${UI.barraApp()}
        <div class="app-contenido">
          <div>
            <h1 class="inicio__saludo">¡Hola, ${UI.escapar(DATOS.estudiante.nombreVisible.split(" ")[0])}!</h1>
            <p class="inicio__subtexto">Tu comunidad también juega aquí.</p>
          </div>

          <a class="destacada" data-ir="estudiante-reservas">
            <p class="destacada__sobre">LA UCA SE MUEVE</p>
            <p class="destacada__titulo">La cancha te espera.</p>
            <span class="destacada__accion">Reservar ahora</span>
            <span class="destacada__icono">${UI.icono("calendario", 24)}</span>
          </a>

          <div>
            <div class="encabezado-lista">
              <p class="titulo-seccion">Reserva tu espacio</p>
              ${UI.enlace("Ver todos", "estudiante-reservas")}
            </div>
            <div class="disciplinas disciplinas--figma">
              <a class="disciplina" data-ir="detalle-cancha/futbol">
                <img src="img/Tarjeta%20futbol.jpg" alt="">
                <span class="sr-only">Fútbol</span>
              </a>
              <a class="disciplina" data-ir="detalle-cancha/voleibol">
                <img src="img/Tarjeta%20voleibol.jpg" alt="">
                <span class="sr-only">Voleibol</span>
              </a>
              <a class="disciplina" data-ir="detalle-cancha/basquetbol">
                <img src="img/Tarjeta%20basquetbol.jpg" alt="">
                <span class="sr-only">Básquetbol</span>
              </a>
            </div>
          </div>

          <div>
            <div class="encabezado-lista">
              <p class="titulo-seccion">Próximos eventos</p>
              ${UI.enlace("Ver agenda", "calendario-eventos")}
            </div>
            <a class="evento-mini" data-ir="evento/copa-interfacultades">
              <div class="evento-mini__foto"><img src="img/DSC01443%201.jpg" alt="Partido de la copa interfacultades"></div>
              <div class="evento-mini__cuerpo">
                <p class="evento-mini__fecha">20 NOV · 4:00 p. m.</p>
                <p class="evento-mini__titulo">Copa interfacultades</p>
                <p class="evento-mini__texto">Ingeniería vs. Economía</p>
              </div>
              ${UI.icono("flecha", 22)}
            </a>
          </div>

          <a class="banner-tutoria" data-ir="oportunidades-tutoria">
            <div class="banner-tutoria__foto"><img src="img/IMG_0600%201.jpg" alt="Estudiantes practicando deporte"></div>
            <div class="banner-tutoria__cuerpo">
              <p class="banner-tutoria__sobre">TU TALENTO SUMA</p>
              <p class="banner-tutoria__titulo">Comparte deporte.<br>Gana horas sociales.</p>
            </div>
          </a>

          <div>
            <p class="titulo-seccion sep-s">En el polideportivo</p>
            <a class="noticia sep-s" data-ir="detalle-noticia">
              <div class="noticia__cuerpo">
                <p class="noticia__sobre">NUEVAS ACTIVIDADES</p>
                <p class="noticia__titulo">Más movimiento, más comunidad</p>
                <p class="noticia__texto">Descubre los entrenamientos abiertos →</p>
              </div>
              <div class="noticia__foto"><img src="img/image%203.jpg" alt=""></div>
            </a>
          </div>
        </div>
        ${UI.navInferior("estudiante-inicio")}
      </section>`;
  }
});

/* ---------- 04 · Reservas ---------- */
UCA.registrar("estudiante-reservas", {
  dibujar() {
    return `
      <section class="pantalla pantalla--app">
        ${UI.barraApp()}
        <div class="app-contenido">
          <div>
            <p class="titulo-seccion" style="font-size:var(--texto-pequeno)">UCA SPORTS / RESERVAS</p>
            <h1 class="inicio__saludo sep-s">Encuentra tu espacio</h1>
            <p class="inicio__subtexto">Haz espacio para lo que te mueve.</p>
          </div>

          <div class="filtros" role="tablist" aria-label="Filtrar espacios">
            <button type="button" class="filtro filtro--activo" data-filtro="todos" aria-pressed="true">Todos</button>
            <button type="button" class="filtro" data-filtro="basquetbol" aria-pressed="false">Básquetbol</button>
            <button type="button" class="filtro" data-filtro="voleibol" aria-pressed="false">Voleibol</button>
            <button type="button" class="filtro" data-filtro="futbol" aria-pressed="false">Fútbol</button>
            <button type="button" class="filtro" data-filtro="ping-pong" aria-pressed="false">Ping pong</button>
          </div>

          <a class="cancha cancha--expandida" data-ir="detalle-cancha/basquetbol" data-categoria="basquetbol">
            <img src="img/Cancha%20de%20basquetbol.jpg" alt="Cancha de básquetbol">
            <span class="cancha__estado">Disponible</span>
            <p class="cancha__titulo">Cancha de básquetbol</p>
            <p class="cancha__meta">20 personas · Polideportivo UCA</p>
            <div class="cancha__pie">
              <span class="cancha__horario">${UI.icono("reloj", 16)}Desde las 2:00 p. m.</span>
              <span class="cancha__accion">Reservar</span>
            </div>
            <span class="cancha__gratis">Sin costo para estudiantes UCA</span>
          </a>

          <a class="cancha cancha--compacta" data-ir="detalle-cancha/voleibol" data-categoria="voleibol">
            <div class="cancha__foto"><img src="img/Cancha%20de%20voleibol.jpg" alt="Cancha de voleibol"></div>
            <div class="cancha__cuerpo">
              <p class="cancha__titulo">Cancha de voleibol</p>
              <p class="cancha__meta">12 personas · Cancha exterior</p>
              <div class="cancha__pie">
                <span class="cancha__horario">16:00 · 17:00 · 18:00</span>
                <span class="cancha__accion">Reservar</span>
              </div>
            </div>
          </a>

          <a class="cancha cancha--compacta" data-ir="detalle-cancha/futbol" data-categoria="futbol">
            <div class="cancha__foto"><img src="img/Cancha%20de%20futbol.jpg" alt="Cancha de fútbol"></div>
            <div class="cancha__cuerpo">
              <p class="cancha__titulo">Cancha de fútbol</p>
              <p class="cancha__meta">22 personas · Campo deportivo</p>
              <div class="cancha__pie">
                <span class="cancha__horario">14:00 · 16:00 · 18:00</span>
                <span class="cancha__accion">Reservar</span>
              </div>
            </div>
          </a>

          <a class="cancha cancha--compacta" data-ir="detalle-cancha/ping-pong" data-categoria="ping-pong">
            <div class="cancha__foto"><img src="img/Fotografia%20de%20la%20cancha%20ping%20pong.jpg" alt="Mesa de ping pong"></div>
            <div class="cancha__cuerpo">
              <p class="cancha__titulo">Mesa de ping pong</p>
              <p class="cancha__meta">4 personas · Sala interior</p>
              <div class="cancha__pie">
                <span class="cancha__horario">14:00 · 15:00 · 16:00</span>
                <span class="cancha__accion">Reservar</span>
              </div>
            </div>
          </a>

          <a class="cancha cancha--compacta" data-ir="evento/taekwondo" data-categoria="clases">
            <div class="cancha__foto"><img src="img/Fotografia%20taekwondo%202.jpg" alt="Clase de taekwondo"></div>
            <div class="cancha__cuerpo">
              <p class="cancha__titulo">Taekwondo</p>
              <p class="cancha__meta">Clases con instructor</p>
              <div class="cancha__pie">
                <span class="cancha__horario">Lun y mié · 5:00 p. m.</span>
                <span class="cancha__accion">Ver clases</span>
              </div>
            </div>
          </a>

          <a class="cancha cancha--compacta" data-ir="evento/gimnasio" data-categoria="clases">
            <div class="cancha__foto"><img src="img/Fotografia%20gimnasio%20pesas.jpg" alt="Gimnasio del polideportivo"></div>
            <div class="cancha__cuerpo">
              <p class="cancha__titulo">Gimnasio</p>
              <p class="cancha__meta">Entrenamiento con instructor</p>
              <div class="cancha__pie">
                <span class="cancha__horario">Mar y jue · 4:30 p. m.</span>
                <span class="cancha__accion">Ver horarios</span>
              </div>
            </div>
          </a>
        </div>
        ${UI.navInferior("estudiante-reservas")}
      </section>`;
  },
  alMostrar(contenedor) {
    // Los filtros muestran solo los espacios del deporte elegido
    const filtros = [...contenedor.querySelectorAll("[data-filtro]")];
    const espacios = [...contenedor.querySelectorAll("[data-categoria]")];
    filtros.forEach((filtro) => {
      filtro.addEventListener("click", () => {
        const elegido = filtro.dataset.filtro;
        filtros.forEach((otro) => {
          otro.classList.toggle("filtro--activo", otro === filtro);
          otro.setAttribute("aria-pressed", String(otro === filtro));
        });
        espacios.forEach((espacio) => {
          espacio.hidden = elegido !== "todos" && espacio.dataset.categoria !== elegido;
        });
      });
    });
  }
});

/* ---------- 05 · Actividades ---------- */
UCA.registrar("estudiante-actividades", {
  dibujar() {
    return `
      <section class="pantalla pantalla--app">
        ${UI.barraApp()}
        <div class="app-contenido">
          <div>
            <p class="titulo-seccion" style="font-size:var(--texto-pequeno)">UCA SPORTS / COMUNIDAD</p>
            <h1 class="inicio__saludo sep-s">Juega en comunidad</h1>
            <p class="inicio__subtexto">Un equipo, muchas formas de participar.</p>
          </div>

          <div>
            <p class="titulo-seccion">Próximos partidos y eventos</p>
            <a class="evento-grande sep-s" data-ir="evento/copa-interfacultades">
              <img src="img/DSC01443%202.jpg" alt="Partido de la copa interfacultades">
              <p class="evento-grande__sobre">FÚTBOL · COPA UCA</p>
              <p class="evento-grande__titulo">Copa interfacultades</p>
              <p class="evento-grande__texto">Ingeniería vs. Economía</p>
              <p class="evento-grande__fecha">20 nov · 4:00 p. m.</p>
              <span class="evento-grande__accion"><span>Inscribirme</span></span>
            </a>
          </div>

          <a class="banner-grande" data-ir="oportunidades-tutoria">
            <div class="banner-grande__foto"><img src="img/DSC01418%201.jpg" alt="Tutor acompañando una práctica"></div>
            <p class="banner-grande__sobre">HORAS SOCIALES</p>
            <p class="banner-grande__titulo">Imparte tutorías.<br>Haz crecer al equipo.</p>
            <span class="banner-grande__accion">Ver oportunidades →</span>
          </a>

          <div>
            <p class="titulo-seccion">Actividades deportivas</p>
            <a class="tarjeta-entrenamiento sep-s" data-ir="evento/voleibol-abierto">
              <div class="tarjeta-entrenamiento__foto"><img src="img/IMG_0600%201.jpg" alt="Entrenamiento abierto de voleibol"></div>
              <div class="tarjeta-entrenamiento__cuerpo">
                <p class="tarjeta-entrenamiento__titulo">Voleibol para todos</p>
                <p class="tarjeta-entrenamiento__meta">Entrenamiento · abierto</p>
                <p class="tarjeta-entrenamiento__horario">Mar y jue · 5:00 p. m.</p>
                <span class="tarjeta-entrenamiento__enlace">Conocer más →</span>
              </div>
            </a>
          </div>

          <div class="oportunidad">
            <p class="oportunidad__titulo">Comparte lo que sabes</p>
            <p class="oportunidad__texto">Participa como tutor y suma horas sociales. Consulta los requisitos antes de postularte.</p>
            <a class="tutoria-mini" data-ir="postulacion-tutor/basquetbol">
              <p class="tutoria-mini__titulo">Básquetbol · Fundamentos</p>
              <p class="tutoria-mini__texto">Tutor estudiantil · Convocatoria abierta</p>
              <span class="tutoria-mini__enlace">Quiero impartir tutorías →</span>
            </a>
            <a class="tutoria-mini" data-ir="postulacion-tutor/voleibol">
              <p class="tutoria-mini__titulo">Voleibol · Iniciación</p>
              <p class="tutoria-mini__texto">Tutor estudiantil · Convocatoria abierta</p>
              <span class="tutoria-mini__enlace">Quiero impartir tutorías →</span>
            </a>
          </div>

          <div>
            <a class="tarjeta-entrenamiento" data-ir="evento/clinica-futbol">
              <div class="tarjeta-entrenamiento__cuerpo">
                <p class="tarjeta-entrenamiento__titulo">Clínica de fútbol</p>
                <p class="tarjeta-entrenamiento__meta">Curso · 4 semanas · $5.00</p>
                <p class="tarjeta-entrenamiento__horario">Sábados · 9:00 a. m.</p>
                <span class="tarjeta-entrenamiento__enlace">Conocer más →</span>
              </div>
            </a>
            <a class="tarjeta-entrenamiento sep-s" data-ir="evento/taekwondo">
              <div class="tarjeta-entrenamiento__cuerpo">
                <p class="tarjeta-entrenamiento__titulo">Taekwondo</p>
                <p class="tarjeta-entrenamiento__meta">Clases · Todos los niveles</p>
                <p class="tarjeta-entrenamiento__horario">Lun y mié · 5:00 p. m.</p>
                <span class="tarjeta-entrenamiento__enlace">Conocer más →</span>
              </div>
            </a>
            <a class="tarjeta-entrenamiento sep-s" data-ir="evento/gimnasio">
              <div class="tarjeta-entrenamiento__cuerpo">
                <p class="tarjeta-entrenamiento__titulo">Gimnasio</p>
                <p class="tarjeta-entrenamiento__meta">Entrenamiento · Todos los niveles</p>
                <p class="tarjeta-entrenamiento__horario">Mar y jue · 4:30 p. m.</p>
                <span class="tarjeta-entrenamiento__enlace">Conocer más →</span>
              </div>
            </a>
          </div>
        </div>
        ${UI.navInferior("estudiante-actividades")}
      </section>`;
  }
});
