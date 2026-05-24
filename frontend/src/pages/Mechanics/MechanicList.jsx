import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function MechanicList() {
  const { isAdmin } = useAuth();
  const [mechanics, setMechanics] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setMechanics(data.users);
      const statsMap = {};
      await Promise.all(
        data.users.map(async (m) => {
          try {
            const s = await api.get(`/stats/mechanics/${m._id}`);
            statsMap[m._id] = s.data;
          } catch (e) { console.error(e); }
        })
      );
      setStats(statsMap);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleFire = async (mechanic) => {
    const confirmMsg = `¿Despedir a ${mechanic.name}?\n\nSus órdenes activas serán reasignadas al mecánico con menos carga.`;
    if (!confirm(confirmMsg)) return;
    try {
      const { data } = await api.put(`/users/${mechanic._id}/fire`, {});
      toast.success(`${mechanic.name} despedido. ${data.reassignedOrders || 0} órdenes reasignadas.`);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al despedir');
    }
  };

  const handleRehire = async (mechanic) => {
    if (!confirm(`¿Recontratar a ${mechanic.name}?`)) return;
    try {
      await api.put(`/users/${mechanic._id}/rehire`, {});
      toast.success(`${mechanic.name} recontratado`);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al recontratar');
    }
  };

  const handlePhotoUpload = async (e, mechanicId) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('photo', file);
    try {
      await api.post(`/users/${mechanicId}/photo`, fd);
      toast.success('Foto actualizada');
      fetch();
    } catch {
      toast.error('Error al subir foto');
    }
  };

  const formatCOP = (n) => `$${Number(n || 0).toLocaleString('es-CO')}`;

  if (loading) return <div className="text-center py-10 text-slate-400">Cargando mecánicos...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Mecánicos</h1>
        <Link to="/mechanics/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium text-center">
          + Nuevo Mecánico
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mechanics.length === 0 && (
          <p className="text-slate-400 col-span-full text-center py-8">Sin mecánicos registrados</p>
        )}
        {mechanics.map((m) => {
          const s = stats[m._id] || {};
          return (
            <div key={m._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
              <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
                <div className="absolute -bottom-8 left-4">
                  <label className="cursor-pointer group" title="Cambiar foto">
                    {m.photo ? (
                      <img src={m.photo} alt={m.name} className="w-16 h-16 rounded-full border-4 border-white object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-full border-4 border-white bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-500">
                        {m.name?.charAt(0)}
                      </div>
                    )}
                    {isAdmin && (
                      <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, m._id)} className="hidden" />
                    )}
                  </label>
                </div>
              </div>
              <div className="pt-10 px-4 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-slate-800">{m.name}</h3>
                    <p className="text-xs text-slate-500">{m.email}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    m.rol === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {m.rol}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <p className="text-xl font-bold text-blue-700">{s.activeOrders ?? '-'}</p>
                    <p className="text-xs text-blue-500">Activas</p>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <p className="text-xl font-bold text-green-700">{s.completedThisMonth ?? '-'}</p>
                    <p className="text-xs text-green-500">Este mes</p>
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-xs text-slate-500">
                  <div className="flex justify-between">
                    <span>Total facturado</span>
                    <span className="font-medium text-slate-700">{formatCOP(s.totalBilled)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Órdenes completadas</span>
                    <span className="font-medium">{s.completedAll ?? '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estado</span>
                    <span className={`font-medium ${m.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {m.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>

                {isAdmin && m.rol !== 'admin' && m.isActive && (
                  <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                    <Link to={`/mechanics/${m._id}/edit`} className="text-blue-600 text-xs hover:underline">Editar</Link>
                    <button onClick={() => handleFire(m)} className="text-red-500 text-xs hover:underline">Despedir</button>
                  </div>
                )}
                {isAdmin && m.rol !== 'admin' && !m.isActive && (
                  <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                    <Link to={`/mechanics/${m._id}/edit`} className="text-blue-600 text-xs hover:underline">Editar</Link>
                    <button onClick={() => handleRehire(m)} className="text-green-600 text-xs hover:underline font-medium">Recontratar</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
