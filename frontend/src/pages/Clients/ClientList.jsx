import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function ClientList() {
  const { isAdmin } = useAuth();
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetch = (q = '') => {
    setLoading(true);
    api.get(`/clients${q ? `?search=${q}` : ''}`).then(r => setClients(r.data.clients)).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`¿Eliminar a ${name}?`)) return;
    try { await api.delete(`/clients/${id}`); toast.success('Cliente eliminado'); fetch(search); }
    catch { toast.error('No se pudo eliminar'); }
  };

  return (
    <div className="space-y-4 page-clients">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Clientes</h1>
        <Link to="/clients/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium text-center btn-new-client">
          + Nuevo Cliente
        </Link>
      </div>

      <div className="flex gap-2">
        <input value={search} onChange={e => { setSearch(e.target.value); fetch(e.target.value); }}
          placeholder="Buscar por nombre, teléfono o email..."
          className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm search-clients" />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden clients-table">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-6 py-3 font-medium">Nombre</th>
                <th className="text-left px-6 py-3 font-medium hidden md:table-cell">Teléfono</th>
                <th className="text-left px-6 py-3 font-medium hidden lg:table-cell">Email</th>
                <th className="text-right px-6 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && <tr><td colSpan={4} className="text-center py-8 text-slate-400">Cargando...</td></tr>}
              {!loading && clients.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-slate-400">Sin clientes</td></tr>}
              {clients.map(c => (
                <tr key={c._id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium text-slate-700">{c.name}</td>
                  <td className="px-6 py-3 text-slate-500 hidden md:table-cell">{c.phone}</td>
                  <td className="px-6 py-3 text-slate-500 hidden lg:table-cell">{c.email || '-'}</td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/clients/${c._id}/edit`} className="text-blue-600 hover:text-blue-800 text-xs font-medium btn-edit-client">Editar</Link>
                      {isAdmin && <button onClick={() => handleDelete(c._id, c.name)} className="text-red-500 hover:text-red-700 text-xs font-medium btn-delete-client">Eliminar</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
