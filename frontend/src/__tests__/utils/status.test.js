import { describe, it, expect } from 'vitest';
import {
  ORDER_STATUSES,
  VALID_TRANSITIONS,
  KANBAN_COLUMNS,
  PRIORITY_CONFIG,
  SERVICE_TYPE_CONFIG,
  statusLabel,
  statusColor,
  getColumnBgColor,
  getColumnBorderColor,
  getColumnHeaderBg,
} from '../../utils/status';

describe('ORDER_STATUSES', () => {
  it('contiene 8 estados', () => {
    expect(ORDER_STATUSES).toHaveLength(8);
  });

  it('incluye ingresada y entregada', () => {
    expect(ORDER_STATUSES).toContain('ingresada');
    expect(ORDER_STATUSES).toContain('entregada');
  });
});

describe('VALID_TRANSITIONS', () => {
  it('ingresada puede pasar a en_revision', () => {
    expect(VALID_TRANSITIONS.ingresada).toContain('en_revision');
  });

  it('ingresada puede cancelarse', () => {
    expect(VALID_TRANSITIONS.ingresada).toContain('cancelada');
  });

  it('entregada no tiene transiciones', () => {
    expect(VALID_TRANSITIONS.entregada).toEqual([]);
  });

  it('cancelada no tiene transiciones', () => {
    expect(VALID_TRANSITIONS.cancelada).toEqual([]);
  });

  it('en_reparacion puede pasar a lista_entrega', () => {
    expect(VALID_TRANSITIONS.en_reparacion).toContain('lista_entrega');
  });

  it('todos los estados tienen transiciones definidas', () => {
    ORDER_STATUSES.forEach((s) => {
      expect(VALID_TRANSITIONS).toHaveProperty(s);
      expect(Array.isArray(VALID_TRANSITIONS[s])).toBe(true);
    });
  });
});

describe('KANBAN_COLUMNS', () => {
  it('tiene 8 columnas', () => {
    expect(KANBAN_COLUMNS).toHaveLength(8);
  });

  it('cada columna tiene id, label, color', () => {
    KANBAN_COLUMNS.forEach((col) => {
      expect(col).toHaveProperty('id');
      expect(col).toHaveProperty('label');
      expect(col).toHaveProperty('color');
    });
  });

  it('los ids coinciden con ORDER_STATUSES', () => {
    const ids = KANBAN_COLUMNS.map((c) => c.id);
    expect(ids.sort()).toEqual([...ORDER_STATUSES].sort());
  });
});

describe('PRIORITY_CONFIG', () => {
  it('tiene 4 prioridades', () => {
    expect(Object.keys(PRIORITY_CONFIG)).toHaveLength(4);
  });

  it('cada prioridad tiene label, color, icon', () => {
    Object.values(PRIORITY_CONFIG).forEach((p) => {
      expect(p).toHaveProperty('label');
      expect(p).toHaveProperty('color');
      expect(p).toHaveProperty('icon');
    });
  });
});

describe('SERVICE_TYPE_CONFIG', () => {
  it('tiene 4 tipos', () => {
    expect(Object.keys(SERVICE_TYPE_CONFIG)).toHaveLength(4);
  });

  it('cada tipo tiene units y days', () => {
    Object.values(SERVICE_TYPE_CONFIG).forEach((t) => {
      expect(t).toHaveProperty('units');
      expect(t).toHaveProperty('days');
      expect(t).toHaveProperty('color');
    });
  });

  it('las unidades son correctas', () => {
    expect(SERVICE_TYPE_CONFIG.rapido.units).toBe(0.5);
    expect(SERVICE_TYPE_CONFIG.medio.units).toBe(1);
    expect(SERVICE_TYPE_CONFIG.complejo.units).toBe(2);
    expect(SERVICE_TYPE_CONFIG.especial.units).toBe(3);
  });
});

describe('statusLabel', () => {
  it('reemplaza _ por espacio', () => {
    expect(statusLabel('en_revision')).toBe('en revision');
  });

  it('maneja strings sin _', () => {
    expect(statusLabel('ingresada')).toBe('ingresada');
  });

  it('retorna undefined para null', () => {
    expect(statusLabel(null)).toBeUndefined();
  });

  it('retorna undefined para undefined', () => {
    expect(statusLabel(undefined)).toBeUndefined();
  });

  it('maneja múltiples _', () => {
    expect(statusLabel('a_b_c')).toBe('a b c');
  });
});

describe('statusColor', () => {
  it('retorna bg-slug-500 por defecto', () => {
    expect(statusColor('ingresada')).toBe('bg-slate-500');
    expect(statusColor('entregada')).toBe('bg-emerald-500');
  });

  it('retorna clases badge con suffix=badge', () => {
    expect(statusColor('en_reparacion', 'badge')).toBe('bg-blue-100 text-blue-700');
  });

  it('retorna slate para estado desconocido', () => {
    expect(statusColor('inexistente')).toBe('bg-slate-500');
  });
});

describe('getColumnBgColor', () => {
  it('mapea colores a bg-{color}-50', () => {
    expect(getColumnBgColor('blue')).toBe('bg-blue-50');
    expect(getColumnBgColor('red')).toBe('bg-red-50');
  });

  it('retorna slate-50 para desconocido', () => {
    expect(getColumnBgColor('unknown')).toBe('bg-slate-50');
  });
});

describe('getColumnBorderColor', () => {
  it('mapea colores a border-{color}-200', () => {
    expect(getColumnBorderColor('green')).toBe('border-green-200');
  });
});

describe('getColumnHeaderBg', () => {
  it('mapea colores a bg-{color}-500', () => {
    expect(getColumnHeaderBg('emerald')).toBe('bg-emerald-500');
  });
});
