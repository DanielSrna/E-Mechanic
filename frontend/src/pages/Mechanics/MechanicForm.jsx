import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function MechanicForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({
    name: '', email: '', cedula: '', password: '', passwordConfirmation: '', rol: 'mecanico',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (id) {
      setFetching(true);
      api.get(`/users/${id}`).then(r => {
        const u = r.data.user;
        setForm({
          name: u.name || '', email: u.email || '', cedula: u.cedula || '',
          password: '', passwordConfirmation: '', rol: u.rol || 'mecanico',
        });
      }).catch(() => {
        toast.error('Usuario no encontrado');
        navigate('/mechanics');
      }).finally(() => setFetching(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEdit && form.password !== form.passwordConfirmation) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form };
      if (isEdit && !payload.password) {
        delete payload.password;
      }
      if (isEdit) {
        delete payload.passwordConfirmation;
      }
      if (isEdit) {
        await api.put(`/users/${id}`, payload);
        toast.success('Usuario actualizado');
      } else {
        await api.post('/users', payload);
        toast.success('Mecánico creado exitosamente');
      }
      navigate('/mechanics');
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const update = (k, v) => setForm({ ...form, [k]: v });

  if (fetching) return <div className="text-center py-10 text-slate-400">Cargando usuario...</div>;

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">{isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <Field label="Nombre completo *" value={form.name} onChange={v => update('name', v)} placeholder="Juan Pérez" />
        <Field label="Email *" type="email" value={form.email} onChange={v => update('email', v)} />
        <Field label="Cédula *" value={form.cedula} onChange={v => update('cedula', v)} placeholder="1234567890" />
        <Field label={isEdit ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *'} type="password" value={form.password} onChange={v => update('password', v)} placeholder={isEdit ? 'Opcional' : 'Mínimo 6 caracteres'} required={!isEdit} />
        {!isEdit && <Field label="Confirmar contraseña *" type="password" value={form.passwordConfirmation} onChange={v => update('passwordConfirmation', v)} placeholder="Repite la contraseña" />}
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
            {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Usuario'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600">Cancelar</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, type = 'text', value, onChange, placeholder, required = true }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
      <input type={type} required={required} value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
        placeholder={placeholder} />
    </div>
  );
}
