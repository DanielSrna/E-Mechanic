import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function MotorcycleList() {
  const { isAdmin } = useAuth();
  const [motos, setMotos] = useState([]);
  const [plate, setPlate] = useState('');
  const [loading, setLoading] = useState(true);

  const fetch = (p = '') => {
    setLoading(true);
    api.get(`/motorcycles${p ? `?plate=${p}` : ''}`).then(r => setMotos(r.data.motorcycles)).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id, p) => {
    if (!confirm(`¿Eliminar moto ${p}?`)) return;
    try { await api.delete(`/motorcycles/${id}`); toast.success('Moto eliminada'); fetch(plate); } catch { toast.error('No se pudo eliminar'); }
  };

  return (
    <div className="space-y-4 page-motorcycles">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Motocicletas</h1>
        <Link to="/motorcycles/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium text-center btn-new-moto">
          + Registrar Moto
        </Link>
      </div>

      <input value={plate} onChange={e => { setPlate(e.target.value.toUpperCase()); fetch(e.target.value.toUpperCase()); }}
        placeholder="Buscar por placa..." className="w-full sm:w-64 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm search-motos" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && <p className="text-slate-400 col-span-full text-center py-8">Cargando...</p>}
        {!loading && motos.length === 0 && <p className="text-slate-400 col-span-full text-center py-8">Sin motocicletas</p>}
        {motos.map(m => (
          <div key={m._id} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition moto-card">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{m.plate}</span>
                <h3 className="text-lg font-semibold text-slate-700 mt-1">{m.brand} {m.model}</h3>
              </div>
              <span className="text-xs text-slate-400">{m.year}</span>
            </div>
            <p className="text-sm text-slate-500">{Number(m.mileage).toLocaleString()} km</p>
            {m.client && <p className="text-sm text-slate-400 mt-1 flex items-center gap-1"><User className="w-3 h-3" /> {m.client.name}</p>}
            <div className="flex gap-3 mt-4 pt-3 border-t border-slate-100">
              <Link to={`/motorcycles/${m._id}/edit`} className="text-blue-600 text-xs font-medium hover:underline btn-edit-moto">Editar</Link>
              <Link to={`/motorcycles/${m._id}/orders`} className="text-purple-600 text-xs font-medium hover:underline btn-moto-orders">Órdenes</Link>
              <Link to={`/orders/new?moto=${m._id}`} className="text-green-600 text-xs font-medium hover:underline btn-create-ot">Crear OT</Link>
              {isAdmin && <button onClick={() => handleDelete(m._id, m.plate)} className="text-red-500 text-xs font-medium hover:underline btn-delete-moto">Eliminar</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
