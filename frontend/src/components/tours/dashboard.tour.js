export default [
  {
    target: 'body',
    title: '👋 ¡Bienvenido a E-Mechanic!',
    content:
      'El sistema de gestión para tu taller de motocicletas. Te guiaré por la aplicación paso a paso. Haz clic en Siguiente.',
    placement: 'center',
  },
  {
    target: 'aside',
    title: '📂 Barra Lateral',
    content:
      'A la izquierda está tu menú principal. Desde aquí accedes a todas las secciones del sistema.',
    placement: 'right',
  },
  {
    target: '.sidebar-clients',
    title: '👥 Clientes',
    content: 'Registra y gestiona los datos de tus clientes: nombre, teléfono, email y dirección.',
    placement: 'right',
  },
  {
    target: '.sidebar-motorcycles',
    title: '🏍️ Motocicletas',
    content: 'Registra las motos de tus clientes con placa, marca, modelo, año y kilometraje.',
    placement: 'right',
  },
  {
    target: '.sidebar-mechanics',
    title: '👨‍🔧 Mecánicos',
    content: 'Gestiona tu equipo: contrata, revisa estadísticas, despide o recontrata mecánicos.',
    placement: 'right',
  },
  {
    target: '.sidebar-orders',
    title: '🔧 Órdenes de Trabajo',
    content: 'El tablero Kanban donde gestionas todas las órdenes. Arrastra tarjetas entre columnas.',
    placement: 'right',
  },
  {
    target: '.sidebar-schedule',
    title: '📅 Agenda',
    content: 'Calendario de capacidad del taller. Programa órdenes sin sobrecargar días.',
    placement: 'right',
  },
  {
    target: '.sidebar-inventory',
    title: '📦 Inventario',
    content: 'Control de repuestos: stock, precios, alertas de stock bajo y búsqueda por SKU.',
    placement: 'right',
  },
  {
    target: '.sidebar-settings',
    title: '⚙️ Configuración',
    content: 'Personaliza E-Mechanic: logo, colores, datos del taller y credenciales del admin.',
    placement: 'right',
  },
  {
    target: 'header',
    title: '🔔 Header',
    content: 'Arriba tienes la campanita de notificaciones, el botón de modo oscuro y tu rol actual.',
    placement: 'bottom',
  },
  {
    target: '.page-dashboard',
    title: '📊 Panel Principal',
    content: 'Aquí en el centro ves las métricas de tu taller: clientes, órdenes, ingresos y gráficas.',
    placement: 'center',
  },
  {
    target: '.stat-card-clients',
    title: 'Total de Clientes',
    content: 'Número total de clientes registrados. Haz clic en Clientes en la barra lateral para verlos.',
  },
  {
    target: '.stat-card-orders',
    title: 'Órdenes Totales',
    content: 'Todas las órdenes creadas. Ve a Órdenes para gestionarlas con el tablero Kanban.',
  },
  {
    target: '.stat-card-pending',
    title: 'Órdenes Pendientes',
    content: 'Órdenes que aún no están cerradas ni canceladas. Es tu backlog actual de trabajo.',
  },
  {
    target: '.stat-card-revenue',
    title: 'Ingresos del Mes',
    content: 'Dinero facturado en el mes actual. Proviene de las órdenes que ya han sido cerradas.',
  },
  {
    target: '.chart-revenue',
    title: 'Ingresos Mensuales',
    content: 'Gráfico que muestra tus ingresos mes a mes. Ideal para ver tendencias de crecimiento.',
    placement: 'top',
  },
  {
    target: '.chart-mechanics',
    title: 'Productividad por Mecánico',
    content: 'Cuánto ha facturado cada mecánico. Identifica quién genera más ingresos para el taller.',
    placement: 'top',
  },
  {
    target: '.chart-parts',
    title: 'Repuestos Más Vendidos',
    content: 'Los repuestos que más se usan en tu taller. Así sabes cuáles mantener siempre en stock.',
    placement: 'left',
  },
  {
    target: '.sidebar-clients',
    title: '👥 Siguiente: Clientes',
    content: 'Ahora haz clic en Clientes en la barra lateral para continuar el recorrido.',
    placement: 'right',
  },
];
