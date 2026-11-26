# UCA SPORTS — Prototipo interactivo

App móvil para el Polideportivo de la UCA: reservas de canchas, eventos, clases y tutorías deportivas.
Este es el prototipo hecho con **HTML, CSS y JavaScript** (solo la parte visual, sin servidor).

## Cómo verlo

Abre `index.html` con doble clic. No necesita instalar nada.

## Cómo publicarlo en GitHub Pages

1. Sube esta carpeta a un repositorio de GitHub.
2. En el repositorio: **Settings → Pages**.
3. En "Branch" elige `main` y la carpeta `/ (root)`. Guarda.
4. En un par de minutos queda en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPOSITORIO/`.

## Cómo está organizado

```
index.html              La página principal (solo tiene un marco vacío)
css/base.css            Colores, tipografía y reglas generales
css/componentes.css     Botones, campos, tarjetas... (el UI Kit en código)
css/pantallas.css       Estilos propios de cada pantalla
js/datos.js             Información de ejemplo (espacios, horarios, precios)
js/componentes.js       Piezas que se repiten (marca, campo, botón, íconos)
js/app.js               El motor: cambia de pantalla y maneja "atrás"
js/pantallas.js         Pantalla "en construcción"
js/pantallas-acceso.js  Acceso y registro (pantallas 00 a 15 de Figma)
js/pantallas-estudiante.js  App del estudiante: inicio, reservas y actividades (03, 04, 05)
img/                    Fotos y logo (las 28 fotos están pendientes)
```

## Qué pantallas están listas

- Acceso y registro: splash, bienvenida, iniciar sesión (estudiante, externo y administración), elegir perfil, cuenta institucional, crear cuenta (2 pasos), verificar correo, cuenta creada, recuperar contraseña, código, nueva contraseña y contraseña actualizada.
- App del estudiante (completa):
  - Inicio, Reservas (lista de espacios) y Actividades, con la barra de abajo (Inicio / Reservas / Actividades / Perfil).
  - Reservar una cancha: detalle, elegir día y hora, tu reserva, confirmar y reserva confirmada (16 a 23, y 90 · horario ocupado).
  - Comunidad: notificaciones, noticia, calendario de eventos, detalle de eventos y clases, inscripción con equipo, pago con tarjeta o transferencia e inscripción confirmada (24 a 34).
  - Tutorías: oportunidades, postulación, requisitos y postulación enviada (29 a 32).
  - Perfil: perfil, editar perfil y foto, mis reservas, detalle de reserva, cancelar reserva, reserva cancelada, mis inscripciones y mis tutorías (35 a 40).
- App del usuario externo (completa):
  - Inicio, Reservas, Eventos y Perfil, con su propia barra de abajo (Inicio / Reservas / Eventos / Perfil).
  - Solicitar un espacio en 3 pasos: horario (hasta 2 horas seguidas), tus datos, motivo de uso, resumen de costo y pago con tarjeta o transferencia (41 a 48).
  - Respuesta de administración: solicitud aprobada y no aprobada con reembolso (49 y 50).
  - Eventos y clases con costo para la comunidad, pago e inscripción confirmada (51 a 55, taekwondo y gimnasio).
  - Perfil, editar perfil y foto, mis solicitudes, detalle de solicitud y pagos y comprobantes (56 a 59).
- Panel de administración (completo):
  - Panel de control con reservas de hoy, solicitudes pendientes y ocupación (60).
  - Reservas con filtros, detalle, cancelar con motivo y aviso al usuario (61 a 65).
  - Solicitudes externas: aprobar (genera el código de reserva) o rechazar con reembolso (66 a 70).
  - Ocupación de espacios por día y por semana, y bloqueo de horarios (71 a 74).
  - Actividades y eventos: crear, editar, ver inscritos y exportarlos a Excel (75 a 79).
  - Tutorías: aprobar o rechazar postulaciones y registrar horas sociales (80 a 83).

## Cómo se comporta (como una app de verdad)

- **Los botones solo funcionan cuando los datos tienen sentido.** Mientras falte algo, el botón se ve apagado y no avanza:
  - *Iniciar sesión (estudiante y administración):* correo que termine en `@uca.edu.sv` y contraseña escrita. *Usuario externo:* cualquier correo válido.
  - *Crear cuenta:* nombre y apellido, DUI de 9 números, correo válido y teléfono de 8 números (el guion del DUI y del teléfono se pone solo). Luego, las dos contraseñas iguales, con los requisitos cumplidos y la casilla de normas marcada.
  - *Códigos de verificación:* las 6 casillas vacías al entrar; el botón se activa al llenar las 6. "Reenviar código" aparece cuando termina la cuenta regresiva, borra las casillas y vuelve a contar.
- **Mensajes de error debajo de cada campo** cuando lo escrito no cumple (por ejemplo, "Las contraseñas no coinciden").
- **Al enviar**, el botón muestra un momento "Iniciando sesión…", "Verificando…", etc., como una app real.
- **Recuerda lo que escribes**: la pantalla del código muestra el correo que pusiste en el paso anterior.
- **Barras fijas**: en la app del estudiante, la barra de arriba y la de abajo no se mueven; solo se desplaza el contenido de en medio.
- **Filtros de Reservas**: Todos / Básquetbol / Voleibol / Fútbol / Ping pong muestran solo esos espacios.
- **Todo queda conectado**: lo que reservas, cancelas, te inscribes o te postulas aparece en tu perfil, en notificaciones y en las horas ocupadas del calendario (mientras no recargues la página).
- **Perfil editable**: puedes cambiar tu nombre para mostrar (2 a 24 letras) y tu foto (JPG o PNG de hasta 5 MB). "Guardar cambios" solo se enciende si cambiaste algo.
- **Cancelar una reserva** libera ese horario para otros, y "Agregar a mi calendario" descarga un archivo que abre el calendario del teléfono o la computadora.
- **Usuario externo**: elige hasta 2 horas seguidas, el costo se calcula solo ($15.00 por hora en canchas y $8.00 en ping pong, más vestidores o paletas si los quiere), y puede pagar con su tarjeta guardada, con otra tarjeta o por transferencia. Sus solicitudes, pagos y avisos se guardan aparte de los del estudiante.
- **Todo está conectado entre las tres apps**: lo que hace administración (aprobar, rechazar, cancelar, bloquear horarios, crear eventos o registrar horas) lo ven al instante el estudiante y el usuario externo, con su aviso en notificaciones. El cálculo de qué horas están ocupadas está en un solo archivo: `js/ocupacion.js`.
- Esta lógica está en `js/componentes.js` (`UI.REGLAS` y `UI.activarFormularios`) y `js/app.js`.

## Íconos

Usamos **Material Symbols (Rounded)**, la librería gratuita de íconos de Google.
Se carga desde internet en `index.html`. Los nombres están en `js/componentes.js`
(sección "Íconos"). Para buscar otro ícono: https://fonts.google.com/icons

## Imágenes

Las imágenes de `img/` son **de ejemplo**: un degradado morado con el nombre del archivo escrito.
Tienen el mismo nombre que la capa de la imagen en Figma (sin tildes, para evitar problemas
en GitHub Pages). Para cambiarlas, guarda la foto real **con el mismo nombre** encima de la de ejemplo.

| Archivo | Pantalla de Figma |
| --- | --- |
| `image 2.jpg` | 01 · Bienvenida |
| `DSC01443 1.jpg`, `image 3.jpg` | 03 · Inicio |
| `Cancha de basquetbol.jpg`, `Cancha de voleibol.jpg`, `Cancha de futbol.jpg` | 04 · Reservas |
| `IMG_0600 1.jpg`, `DSC01418 1.jpg`, `DSC01443 2.jpg` | 05 · Actividades |
| `Fotografia de la cancha ping pong.jpg`, `Fotografia taekwondo.jpg`, `Fotografia.jpg` | 04 · Reservas (ping pong, taekwondo, gimnasio) |
| `Fotografia de noticia.jpg` | 17 · Detalle de noticia |
| `Fotografia de la cancha.jpg` | 18, 37, 38, 63, 64 · Detalle de la cancha / reserva |
| `Fotografia de la cancha ping pong.jpg` | 18-PP · Ping pong |
| `Fotografia.jpg` | 25 a 34, 52 a 54, 78 · Eventos y actividades |
| `Fotografia taekwondo.jpg`, `Fotografia danza.jpg` | Pantallas TK y DZ |
| `DSC01422 1.jpg`, `DSC01443 2.jpg`, `image 4.jpg` | 39 · Mis inscripciones |
| `Fotografia voleibol.jpg`, `Fotografia basquetbol.jpg`, `Fotografia futbol.jpg`, `Fotografia gimnasio.jpg` | 18 y 37 · Detalle de cada cancha |
| `1.jpg` | 40 · Mis tutorías (tutoría activa) |
| `Simbolo.svg` | 00 · Splash (símbolo del logo; exportarlo de Figma como SVG) |

Consejo: exporta las fotos en JPG, de unos 1000 px de ancho, para que la página cargue rápido.

## Identidad visual

- Morado `#5f31c5` · Verde lima `#c7f04a` · Negro `#101114`
- Tipografía: Host Grotesk
- Logo: propuesta 12, "Impulso"

## Notas

- Todos los datos (horarios, instructores, precios, datos bancarios) son de ejemplo.
- El logo y las fotos son espacios provisionales hasta tener los archivos finales.
