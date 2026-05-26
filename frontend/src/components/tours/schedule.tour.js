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
      'Cada celda muestra cuántas unidades están ocupadas de la capacidad total. Haz clic para ver el detalle de ese día.',
  },
  {
    target: '.schedule-day-detail',
    title: 'Detalle del Día',
    content:
      'Aquí ves todas las órdenes programadas para este día: placa, cliente, tipo de servicio y prioridad.',
  },
  {
    target: '.schedule-capacity-info',
    title: 'Capacidad Diaria',
    content:
      'Capacidad configurada en unidades. Recuerda: Rápido=0.5u, Medio=1u, Complejo=2u, Especial=3u.',
  },
];
