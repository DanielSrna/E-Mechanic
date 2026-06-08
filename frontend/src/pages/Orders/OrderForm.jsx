import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const SERVICE_TYPES = [
  { name: 'rapido', label: 'Rápido', units: 0.5, days: 0.5, examples: 'Cambio de aceite, ajuste de cadena, cambio de guaya' },
  { name: 'medio', label: 'Medio', units: 1, days: 1, examples: 'Cambio de pastillas, cambio de llanta, ajuste de válvulas' },
  { name: 'complejo', label: 'Complejo', units: 2, days: 2, examples: 'Falla eléctrica, transmisión, mantenimiento general' },
  { name: 'especial', label: 'Especial', units: 3, days: 3, examples: 'Restauración, pintura, motor completo' },
];

const PRIORITIES = [
  { name: 'baja', label: 'Baja', color: 'slate' },
  { name: 'normal', label: 'Normal', color: 'blue' },
  { name: 'alta', label: 'Alta', color: 'orange' },
  { name: 'urgente', label: 'Urgente', color: 'red' },
];

export default function OrderForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    motorcycle: '',
    mechanic: '',
    entryReason: '',
    notes: '',
    serviceType: 'medio',
    priority: 'normal',
    scheduledDate: '',
    estimatedDays: 1,
  });
  const [motorcycles, setMotorcycles] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [capacityCheck, setCapacityCheck] = useState(null);
  const [checkingCapacity, setCheckingCapacity] = useState(false);

  useEffect(() => {
    api.get('/motorcycles').then(r => setMotorcycles(r.data.motorcycles)).catch((e) => console.error(e));
    api.get('/users').then(r => setMechanics(r.data.users.filter(u => u.isActive))).catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    const selected = SERVICE_TYPES.find(s => s.name === form.serviceType);
    if (selected) {
      setForm(f => ({ ...f, estimatedDays: selected.days }));
    }
  }, [form.serviceType]);

  useEffect(() => {
    if (!form.scheduledDate || !form.serviceType) {
      setCapacityCheck(null);
      return;
    }
    setCheckingCapacity(true);
    const timeout = setTimeout(() => {
      api
        .get(`/schedule/check?date=${form.scheduledDate}&serviceType=${form.serviceType}`)
        .then(r => setCapacityCheck(r.data))
        .catch(() => setCapacityCheck(null))
        .finally(() => setCheckingCapacity(false));
    }, 500);
    return () => clearTimeout(timeout);
  }, [form.scheduledDate, form.serviceType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/orders', form);
      toast.success('Orden creada');
      navigate('/orders');
    } catch (err) { toast.error(err.response?.data?.errors?.[0]?.msg || 'Error'); }
    finally { setLoading(false); }
  };

  const selectedType = SERVICE_TYPES.find(s => s.name === form.serviceType);

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">Nueva Orden de Trabajo</h1>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Motocicleta *</label>
          <select value={form.motorcycle} onChange={e => setForm({...form, motorcycle: e.target.value})}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">Seleccionar moto...</option>
            {motorcycles.map(m => <option key={m._id} value={m._id}>{m.plate} - {m.brand} {m.model} ({m.client?.name})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Mecánico asignado *</label>
          <select value={form.mechanic} onChange={e => setForm({...form, mechanic: e.target.value})}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">Seleccionar mecánico...</option>
            {mechanics.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>
        </div>

        <div className="form-service-type">
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Tipo de trabajo *</label>
          <div className="grid grid-cols-2 gap-2">
            {SERVICE_TYPES.map(st => (
              <button
                key={st.name}
                type="button"
                onClick={() => setForm({...form, serviceType: st.name})}
                className={`px-3 py-2 rounded-lg border text-sm font-medium transition ${
                  form.serviceType === st.name
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-blue-300'
                }`}
              >
                {st.label}
                <span className="block text-xs text-slate-400 mt-0.5">{st.units}u · {st.days}d</span>
              </button>
            ))}
          </div>
          {selectedType && (
            <p className="text-xs text-slate-400 mt-1">{selectedType.examples}</p>
          )}
        </div>

        <div className="form-priority">
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Prioridad</label>
          <div className="flex gap-2">
            {PRIORITIES.map(p => (
              <button
                key={p.name}
                type="button"
                onClick={() => setForm({...form, priority: p.name})}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition ${
                  form.priority === p.name
                    ? `border-${p.color}-500 bg-${p.color}-50 text-${p.color}-700 dark:bg-${p.color}-900/30 dark:text-${p.color}-300`
                    : 'border-slate-200 dark:border-slate-600 text-slate-500 hover:border-slate-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-scheduled-date">
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Fecha programada *</label>
          <input
            type="date"
            value={form.scheduledDate}
            onChange={e => setForm({...form, scheduledDate: e.target.value})}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {checkingCapacity && (
            <p className="text-xs text-slate-400 mt-1">Verificando capacidad...</p>
          )}
          {capacityCheck && !checkingCapacity && (
            <div className={`mt-2 px-3 py-2 rounded-lg text-sm ${
              capacityCheck.canFit
                ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
            }`}>
              <p>{capacityCheck.message}</p>
              {capacityCheck.suggestedDate && (
                <button
                  type="button"
                  onClick={() => setForm({...form, scheduledDate: capacityCheck.suggestedDate})}
                  className="mt-1 text-xs underline hover:no-underline"
                >
                  Usar fecha sugerida: {capacityCheck.suggestedDate}
                </button>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Días estimados</label>
          <input
            type="number"
            value={form.estimatedDays}
            onChange={e => setForm({...form, estimatedDays: Number(e.target.value)})}
            min={0.5}
            max={30}
            step={0.5}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Motivo de ingreso *</label>
          <textarea value={form.entryReason} onChange={e => setForm({...form, entryReason: e.target.value})} rows={3}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            placeholder="Ej: Mantenimiento general, falla eléctrica..." maxLength={1000} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Notas (opcional)</label>
          <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none" maxLength={2000} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50">
            {loading ? 'Creando...' : 'Crear Orden'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
