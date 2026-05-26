export default [
  {
    target: '.page-inventory',
    title: '📦 Inventario',
    content: 'Gestiona tus repuestos: crea, edita, elimina y controla el stock.',
    placement: 'center',
  },
  {
    target: '.btn-new-part',
    title: 'Nuevo Repuesto',
    content: 'Agrega un repuesto al inventario con SKU, nombre, marca, precios de compra y venta.',
  },
  {
    target: '.search-parts',
    title: 'Buscador',
    content: 'Busca repuestos por SKU, nombre o marca.',
  },
  {
    target: '.toggle-low-stock',
    title: 'Filtro Stock Bajo',
    content: 'Activa este toggle para ver solo los repuestos que están por debajo del stock mínimo.',
  },
  {
    target: '.parts-table',
    title: 'Tabla de Repuestos',
    content:
      'SKU, nombre, marca, precio de venta y stock actual. Las filas con stock bajo se marcan en rojo.',
  },
  {
    target: '.form-part-sku',
    title: 'Formulario: SKU',
    content: 'Código único del repuesto. Se convierte a mayúsculas. No puede repetirse.',
  },
  {
    target: '.form-part-stock',
    title: 'Stock y Stock Mínimo',
    content:
      'Define cuántas unidades tienes y el mínimo antes de recibir una alerta de stock bajo.',
  },
];
