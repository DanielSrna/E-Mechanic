export default [
  {
    target: '.page-schedule',
    title: '📅 Agenda de Capacidad',
    content:
      'El calendario muestra cuánta capacidad tiene tu taller cada día. Así evitas sobrecargar días y dejar otros vacíos.',
    placement: 'center',
  },
  {
    target: '.schedule-nav',
    title: 'Navegación del Calendario',
    content:
      'Usa las flechas para cambiar de mes y el botón "Hoy" para volver al mes actual.',
  },
  {
    target: '.schedule-legend',
    title: 'Leyenda de Capacidad',
    content:
      '🟢 Verde: menos del 60% ocupado. 🟡 Amarillo: entre 60-90%. 🔴 Rojo: más del 90%. ⚪ Blanco: fin de semana.',
  },
  {
    target: '.schedule-day',
    title: 'Día del Calendario',
    content:
      'Cada celda muestra cuántas unidades están ocupadas. Haz clic en un día para ver sus órdenes.',
  },
  {
    target: '.sidebar-inventory',
    title: '📦 Siguiente: Inventario',
    content: 'Ahora haz clic en Inventario para gestionar tus repuestos y stock.',
    placement: 'right',
  },
];
