import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function MechanicForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', cedula: '', password: '', rol: 'mecanico' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/users', form);
      toast.success('Mecánico creado exitosamente');
      navigate('/mechanics');
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Error al crear');
    } finally {
      setLoading(false);
    }
  };

  const update = (k, v) => setForm({ ...form, [k]: v });

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Nuevo Usuario</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <Field label="Nombre completo *" value={form.name} onChange={v => update('name', v)} placeholder="Juan Pérez" />
        <Field label="Email *" type="email" value={form.email} onChange={v => update('email', v)} />
        <Field label="Cédula *" value={form.cedula} onChange={v => update('cedula', v)} placeholder="1234567890" />
        <Field label="Contraseña *" type="password" value={form.password} onChange={v => update('password', v)} placeholder="Mínimo 6 caracteres" />
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Rol</label>
          <select value={form.rol} onChange={e => update('rol', e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="mecanico">Mecánico</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50">
            {loading ? 'Creando...' : 'Crear Usuario'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600">Cancelar</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
      <input type={type} required value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
        placeholder={placeholder} />
    </div>
  );
}
