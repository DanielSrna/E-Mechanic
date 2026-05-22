export const ORDER_STATUSES = [
  'ingresada',
  'en_revision',
  'esperando_aprobacion',
  'esperando_repuestos',
  'en_reparacion',
  'lista_entrega',
  'entregada',
  'cancelada',
];

export const ALL_STATUSES = ORDER_STATUSES;

export const VALID_TRANSITIONS = {
  ingresada: ['en_revision', 'cancelada'],
  en_revision: ['esperando_aprobacion', 'esperando_repuestos', 'cancelada'],
  esperando_aprobacion: ['en_reparacion', 'cancelada'],
  esperando_repuestos: ['en_reparacion', 'cancelada'],
  en_reparacion: ['lista_entrega', 'cancelada'],
  lista_entrega: ['entregada', 'cancelada'],
  entregada: [],
  cancelada: [],
};

export const KANBAN_COLUMNS = [
  { id: 'ingresada', label: 'Ingresada', color: 'slate' },
  { id: 'en_revision', label: 'En Revisión', color: 'yellow' },
  { id: 'esperando_aprobacion', label: 'Esperando Aprobación', color: 'orange' },
  { id: 'esperando_repuestos', label: 'Esperando Repuestos', color: 'purple' },
  { id: 'en_reparacion', label: 'En Reparación', color: 'blue' },
  { id: 'lista_entrega', label: 'Lista para Entrega', color: 'green' },
  { id: 'entregada', label: 'Entregada', color: 'emerald' },
  { id: 'cancelada', label: 'Cancelada', color: 'red' },
];

export const PRIORITY_CONFIG = {
  urgente: { label: 'Urgente', color: 'red', icon: '🔴' },
  alta: { label: 'Alta', color: 'orange', icon: '🟠' },
  normal: { label: 'Normal', color: 'blue', icon: '🔵' },
  baja: { label: 'Baja', color: 'slate', icon: '⚪' },
};

export const SERVICE_TYPE_CONFIG = {
  rapido: { label: 'Rápido', units: 0.5, days: 0.5, color: 'green' },
  medio: { label: 'Medio', units: 1, days: 1, color: 'blue' },
  complejo: { label: 'Complejo', units: 2, days: 2, color: 'orange' },
  especial: { label: 'Especial', units: 3, days: 3, color: 'purple' },
};

export function statusLabel(s) {
  return s?.replace(/_/g, ' ');
}

export function statusColor(s, suffix = '500') {
  const m = {
    ingresada: 'slate',
    en_revision: 'yellow',
    esperando_aprobacion: 'orange',
    esperando_repuestos: 'purple',
    en_reparacion: 'blue',
    lista_entrega: 'green',
    entregada: 'emerald',
    cancelada: 'red',
  };
  const c = m[s] || 'slate';
  return suffix === 'badge' ? `bg-${c}-100 text-${c}-700` : `bg-${c}-500`;
}

export function getColumnBgColor(color) {
  const m = {
    slate: 'bg-slate-50',
    yellow: 'bg-yellow-50',
    orange: 'bg-orange-50',
    purple: 'bg-purple-50',
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    emerald: 'bg-emerald-50',
    red: 'bg-red-50',
  };
  return m[color] || 'bg-slate-50';
}

export function getColumnBorderColor(color) {
  const m = {
    slate: 'border-slate-200',
    yellow: 'border-yellow-200',
    orange: 'border-orange-200',
    purple: 'border-purple-200',
    blue: 'border-blue-200',
    green: 'border-green-200',
    emerald: 'border-emerald-200',
    red: 'border-red-200',
  };
  return m[color] || 'border-slate-200';
}

export function getColumnHeaderBg(color) {
  const m = {
    slate: 'bg-slate-500',
    yellow: 'bg-yellow-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    emerald: 'bg-emerald-500',
    red: 'bg-red-500',
  };
  return m[color] || 'bg-slate-500';
}
