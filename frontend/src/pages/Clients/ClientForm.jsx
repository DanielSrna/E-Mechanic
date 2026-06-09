import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import Field from '../../components/ui/Field';
import toast from 'react-hot-toast';

export default function ClientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) api.get(`/clients/${id}`).then(r => setForm({ name: r.data.client.name, phone: r.data.client.phone, email: r.data.client.email || '', address: r.data.client.address || '' })).catch(() => navigate('/clients'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) { await api.put(`/clients/${id}`, form); toast.success('Cliente actualizado'); }
      else { await api.post('/clients', form); toast.success('Cliente creado'); }
      navigate('/clients');
    } catch (err) { toast.error(err.response?.data?.errors?.[0]?.msg || 'Error'); }
    finally { setLoading(false); }
  };

  const update = (k, v) => setForm({ ...form, [k]: v });

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">{id ? 'Editar' : 'Nuevo'} Cliente</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <Field label="Nombre *" value={form.name} onChange={v => update('name', v)} />
        <Field label="Teléfono *" value={form.phone} onChange={v => update('phone', v)} placeholder="3001234567" />
        <Field label="Email" type="email" value={form.email} onChange={v => update('email', v)} />
        <Field label="Dirección" value={form.address} onChange={v => update('address', v)} />
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50">
            {loading ? 'Guardando...' : id ? 'Actualizar' : 'Crear Cliente'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium text-slate-600">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
