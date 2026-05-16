import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', cedula: '', password: '', passwordConfirmation: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.passwordConfirmation) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success('Cuenta creada. Ahora inicia sesión.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0]?.msg || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const update = (key, value) => setForm({ ...form, [key]: value });

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">E-Mechanic</h1>
          <p className="text-slate-500 mt-1">Crear cuenta nueva</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-4">
          <Input label="Nombre completo" value={form.name} onChange={v => update('name', v)} placeholder="Juan Pérez" />
          <Input label="Email" type="email" value={form.email} onChange={v => update('email', v)} placeholder="juan@email.com" />
          <Input label="Cédula" value={form.cedula} onChange={v => update('cedula', v)} placeholder="1234567890" />
          <Input label="Contraseña" type="password" value={form.password} onChange={v => update('password', v)} placeholder="Mínimo 6 caracteres" />
          <Input label="Confirmar contraseña" type="password" value={form.passwordConfirmation} onChange={v => update('passwordConfirmation', v)} placeholder="Repite la contraseña" />
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50">
            {loading ? 'Creando...' : 'Crear cuenta'}
          </button>
          <p className="text-center text-sm text-slate-500">
            ¿Ya tienes cuenta? <Link to="/login" className="text-blue-600 hover:underline font-medium">Inicia sesión</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function Input({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
      <input type={type} required value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
        placeholder={placeholder} />
    </div>
  );
}
