/* ==========================================================
   datos.js — la información de ejemplo de la app
   Todo esto es de ejemplo (no hay servidor ni base de datos).
   Aquí se guardarán espacios, horarios, instructores, precios, etc.
   ========================================================== */

const DATOS = {
  // Espacios y actividades del Polideportivo
  espacios: [
    { id: "basquetbol", nombre: "Básquetbol", tipo: "reserva" },
    { id: "voleibol", nombre: "Voleibol", tipo: "reserva" },
    { id: "futbol", nombre: "Fútbol", tipo: "reserva" },
    { id: "ping-pong", nombre: "Ping pong", tipo: "reserva" }, // solo reserva, sin instructor
    { id: "taekwondo", nombre: "Taekwondo", tipo: "clase" },
    { id: "danza", nombre: "Danza", tipo: "clase" }
  ]
};
