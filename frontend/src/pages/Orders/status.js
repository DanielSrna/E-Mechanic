export const ORDER_STATUSES = [
  'ingresada', 'en_revision', 'esperando_aprobacion',
  'esperando_repuestos', 'en_reparacion', 'lista_entrega',
  'entregada', 'cancelada',
];

export const ALL_STATUSES = ORDER_STATUSES;

export function statusLabel(s) {
  return s?.replace(/_/g, ' ');
}

export function statusColor(s, suffix = '500') {
  const m = {
    ingresada: 'slate', en_revision: 'yellow', esperando_aprobacion: 'orange',
    esperando_repuestos: 'purple', en_reparacion: 'blue',
    lista_entrega: 'green', entregada: 'emerald', cancelada: 'red',
  };
  const c = m[s] || 'slate';
  return suffix === 'badge' ? `bg-${c}-100 text-${c}-700` : `bg-${c}-500`;
}
