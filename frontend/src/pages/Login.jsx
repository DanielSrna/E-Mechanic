import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Inicio de sesión exitoso');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      {banner && (
        <div className="fixed bottom-4 right-4 z-50 animate-float">
          <div className="bg-slate-900/90 backdrop-blur rounded-xl px-4 py-3 shadow-lg max-w-[260px]">
            <div className="flex items-start justify-between gap-2">
              <p className="text-white/60 text-[10px] font-medium tracking-wide">
                BIENVENIDO RECLUTADOR
              </p>
              <button
                onClick={() => setBanner(false)}
                className="text-white/40 hover:text-white/80 leading-none text-sm"
              >
                ✕
              </button>
            </div>
            <p className="text-white/80 text-sm mt-1.5">
              Usa estas credenciales:
            </p>
            <div className="mt-1.5 space-y-0.5">
              <p className="text-xs text-white/50">
                Admin:{' '}
                <span className="text-white font-mono">admin@emechanic.com</span>
                <span className="text-white/30 mx-1">/</span>
                <span className="text-white font-mono">admin123</span>
              </p>
              <p className="text-xs text-white/50">
                Mec:{' '}
                <span className="text-white font-mono">carlos@emechanic.com</span>
                <span className="text-white/30 mx-1">/</span>
                <span className="text-white font-mono">mecanico123</span>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800">E-Mechanic</h1>
          <p className="text-slate-500 mt-2">Taller de Motocicletas</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-5">
          <h2 className="text-xl font-semibold text-slate-700">Iniciar sesión</h2>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
            <input
              type="email" required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Contraseña</label>
            <input
              type="password" required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
