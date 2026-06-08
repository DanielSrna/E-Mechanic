import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function PartList() {
  const { isAdmin } = useAuth();
  const [parts, setParts] = useState([]);
  const [search, setSearch] = useState('');
  const [lowStock, setLowStock] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    const params = [];
    if (search) params.push(`search=${search}`);
    if (lowStock) params.push('lowStock=true');
    api.get(`/parts${params.length ? '?' + params.join('&') : ''}`).then(r => setParts(r.data.parts)).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [lowStock, search]);
   

  const handleDelete = async (id, name) => {
    if (!confirm(`¿Eliminar ${name}?`)) return;
    try { await api.delete(`/parts/${id}`); toast.success('Eliminado'); fetch(); }
    catch { toast.error('Error'); }
  };

  return (
    <div className="space-y-4 page-inventory">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Inventario</h1>
        {isAdmin && (
          <Link to="/inventory/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium text-center btn-new-part">
            + Nuevo Repuesto
          </Link>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fetch()}
          placeholder="Buscar por nombre, SKU o marca..."
          className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm search-parts" />
        <button onClick={fetch} className="px-4 py-2 bg-slate-100 rounded-lg text-sm hover:bg-slate-200">Buscar</button>
        <button onClick={() => { setLowStock(!lowStock); }} className={`px-4 py-2 rounded-lg text-sm font-medium toggle-low-stock ${lowStock ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
          Stock bajo {lowStock ? '✓' : ''}
        </button>
      </div>

      <div className="overflow-x-auto parts-table">
        <div className="bg-white rounded-xl shadow-sm min-w-[700px]">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">SKU</th>
                <th className="text-left px-4 py-3 font-medium">Nombre</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Marca</th>
                <th className="text-right px-4 py-3 font-medium">Stock</th>
                <th className="text-right px-4 py-3 font-medium hidden lg:table-cell">P. Venta</th>
                <th className="text-right px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && <tr><td colSpan={6} className="text-center py-8 text-slate-400">Cargando...</td></tr>}
              {!loading && parts.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-slate-400">Sin repuestos</td></tr>}
              {parts.map(p => (
                <tr key={p._id} className={`hover:bg-slate-50 ${p.stock <= p.minStock ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-slate-500">{p.sku}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">{p.name}</td>
                  <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{p.brand || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-bold ${p.stock <= p.minStock ? 'text-red-600' : 'text-slate-700'}`}>{p.stock}</span>
                    <span className="text-xs text-slate-400 ml-1">/ {p.minStock}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-600 hidden lg:table-cell">${p.salePrice?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    {isAdmin && (
                      <div className="flex justify-end gap-2">
                        <Link to={`/inventory/${p._id}/edit`} className="text-blue-600 text-xs font-medium hover:underline">Editar</Link>
                        <button onClick={() => handleDelete(p._id, p.name)} className="text-red-500 text-xs font-medium hover:underline">Eliminar</button>
                      </div>
                    )}
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
