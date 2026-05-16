import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function OrderForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ motorcycle: '', mechanic: '', entryReason: '', notes: '' });
  const [motorcycles, setMotorcycles] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/motorcycles').then(r => setMotorcycles(r.data.motorcycles)).catch(() => {});
    api.get('/users/me').then(async r => {
      try { await api.get(`/users/${r.data.user._id}`); } catch {}
      setMechanics([r.data.user]);
    }).catch(() => {});
  }, []);

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

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Nueva Orden de Trabajo</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Motocicleta *</label>
          <select value={form.motorcycle} onChange={e => setForm({...form, motorcycle: e.target.value})}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">Seleccionar moto...</option>
            {motorcycles.map(m => <option key={m._id} value={m._id}>{m.plate} - {m.brand} {m.model} ({m.client?.name})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Mecánico asignado *</label>
          <select value={form.mechanic} onChange={e => setForm({...form, mechanic: e.target.value})}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">Seleccionar mecánico...</option>
            {mechanics.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Motivo de ingreso *</label>
          <textarea value={form.entryReason} onChange={e => setForm({...form, entryReason: e.target.value})} rows={3}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            placeholder="Ej: Mantenimiento general, falla eléctrica..." maxLength={1000} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Notas (opcional)</label>
          <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none" maxLength={2000} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50">
            {loading ? 'Creando...' : 'Crear Orden'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
