export default [
  {
    target: '.page-orders',
    title: '🔧 Órdenes de Trabajo (Kanban)',
    content:
      'Este es el tablero Kanban. Cada columna representa un estado. Arrastra las tarjetas entre columnas para cambiar el estado.',
    placement: 'center',
  },
  {
    target: '.btn-new-order',
    title: 'Nueva Orden',
    content: 'Crea una orden desde cero. Selecciona moto, mecánico, tipo de trabajo y fecha.',
  },
  {
    target: '.search-orders',
    title: 'Buscador',
    content: 'Busca órdenes por placa de moto, nombre de cliente o mecánico.',
  },
  {
    target: '.kanban-column-ingresada',
    title: 'Columna: Ingresada',
    content: 'Órdenes recién creadas. Arrástralas a "En Revisión" cuando empieces a trabajar.',
    placement: 'right',
  },
  {
    target: '.kanban-column-en_reparacion',
    title: 'Columna: En Reparación',
    content: 'Trabajo en curso. Las tarjetas que están aquí son las que se están reparando ahora.',
    placement: 'right',
  },
  {
    target: '.kanban-column-lista_entrega',
    title: 'Columna: Lista para Entrega',
    content: 'Trabajo terminado. Estas órdenes están listas para ser cerradas y facturadas.',
    placement: 'right',
  },
  {
    target: '.card-drag-handle',
    title: 'Parche de Arrastre',
    content:
      'Este recuadro con puntitos es el agarre. Solo puedes arrastrar la tarjeta desde aquí. El resto de la tarjeta te lleva al detalle.',
  },
  {
    target: '.sidebar-schedule',
    title: '📅 Siguiente: Agenda',
    content: 'Ahora haz clic en Agenda para ver el calendario de capacidad del taller.',
    placement: 'right',
  },
];
