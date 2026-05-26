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
    target: '.form-service-type',
    title: 'Tipo de Trabajo',
    content:
      'Selecciona el tipo: Rápido (0.5 unidades), Medio (1), Complejo (2) o Especial (3). Esto afecta la capacidad del taller.',
  },
  {
    target: '.form-scheduled-date',
    title: 'Fecha Programada',
    content:
      'Elige la fecha de ingreso. El sistema verifica automáticamente si hay capacidad ese día.',
  },
  {
    target: '.form-priority',
    title: 'Prioridad',
    content:
      'Normal, Alta, Urgente o Baja. Las urgentes se muestran con badge rojo en el Kanban.',
  },
  {
    target: '.order-detail-status',
    title: 'Panel de Estados',
    content:
      'Dentro del detalle de una orden, aquí puedes cambiar manualmente el estado o cerrar la orden.',
  },
];
