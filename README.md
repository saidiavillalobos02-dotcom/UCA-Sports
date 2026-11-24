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
img/                    Fotos y logo (las 28 fotos están pendientes)
```

## Qué pantallas están listas

- Acceso y registro: splash, bienvenida, iniciar sesión (estudiante, externo y administración), elegir perfil, cuenta institucional, crear cuenta (2 pasos), verificar correo, cuenta creada, recuperar contraseña, código, nueva contraseña y contraseña actualizada.
- Falta: app del estudiante, app del usuario externo, panel de administración, avisos del sistema, pagos y perfil, y nuevos espacios.

## Archivos que faltan poner en `img/`

Se exportan desde Figma y se guardan con estos nombres:

- `logo-simbolo.svg`: el símbolo del logo "Impulso" (se ve en el splash).
- `bienvenida.jpg`: la foto de la pantalla de bienvenida.

Mientras no estén, el prototipo muestra un espacio reservado y sigue funcionando.

## Identidad visual

- Morado `#5f31c5` · Verde lima `#c7f04a` · Negro `#101114`
- Tipografía: Host Grotesk
- Logo: propuesta 12, "Impulso"

## Notas

- Todos los datos (horarios, instructores, precios, datos bancarios) son de ejemplo.
- El logo y las fotos son espacios provisionales hasta tener los archivos finales.
