export default [
  {
    target: '.page-dashboard',
    title: '📊 Dashboard',
    content:
      'Bienvenido al panel principal. Aquí puedes ver todas las métricas de tu taller en un solo lugar.',
    placement: 'center',
  },
  {
    target: '.stat-card-clients',
    title: 'Total de Clientes',
    content:
      'Número total de clientes registrados en el sistema. Haz clic en Clientes en la barra lateral para verlos todos.',
  },
  {
    target: '.stat-card-orders',
    title: 'Órdenes Totales',
    content:
      'Todas las órdenes de trabajo creadas. Ve a la sección de Órdenes para gestionarlas con el tablero Kanban.',
  },
  {
    target: '.stat-card-pending',
    title: 'Órdenes Pendientes',
    content:
      'Órdenes que aún no están cerradas ni canceladas. Es tu backlog actual de trabajo.',
  },
  {
    target: '.stat-card-revenue',
    title: 'Ingresos del Mes',
    content:
      'Dinero facturado en el mes actual. Proviene de las órdenes que ya han sido cerradas.',
  },
  {
    target: '.chart-revenue',
    title: 'Ingresos Mensuales',
    content:
      'Gráfico de líneas que muestra tus ingresos mes a mes. Ideal para ver tendencias de crecimiento.',
    placement: 'top',
  },
  {
    target: '.chart-mechanics',
    title: 'Productividad por Mecánico',
    content:
      'Cuánto ha facturado cada mecánico. Te ayuda a identificar quién genera más ingresos para el taller.',
    placement: 'top',
  },
  {
    target: '.chart-parts',
    title: 'Repuestos Más Vendidos',
    content:
      'Los repuestos que más se usan en tu taller. Así sabes cuáles mantener siempre en stock.',
    placement: 'left',
  },
];
