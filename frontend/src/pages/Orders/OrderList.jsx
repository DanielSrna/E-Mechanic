import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { ORDER_STATUSES } from './status';

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const fetch = (s = '') => {
    setLoading(true);
    api.get(`/orders${s ? `?status=${s}` : ''}`).then(r => setOrders(r.data.orders)).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const statusColors = {
    ingresada: 'bg-slate-100 text-slate-700',
    en_revision: 'bg-yellow-100 text-yellow-700',
    esperando_aprobacion: 'bg-orange-100 text-orange-700',
    esperando_repuestos: 'bg-purple-100 text-purple-700',
    en_reparacion: 'bg-blue-100 text-blue-700',
    lista_entrega: 'bg-green-100 text-green-700',
    entregada: 'bg-emerald-100 text-emerald-700',
    cancelada: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Órdenes de Trabajo</h1>
        <Link to="/orders/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium text-center">
          + Nueva Orden
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => { setStatus(''); fetch(''); }} className={`px-3 py-1.5 rounded-full text-xs font-medium ${!status ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>Todas</button>
        {ORDER_STATUSES.map(s => (
          <button key={s} onClick={() => { setStatus(s); fetch(s); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize ${status === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <div className="bg-white rounded-xl shadow-sm min-w-[700px]">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Moto</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Cliente</th>
                <th className="text-left px-4 py-3 font-medium">Estado</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Mecánico</th>
                <th className="text-right px-4 py-3 font-medium">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && <tr><td colSpan={5} className="text-center py-8 text-slate-400">Cargando...</td></tr>}
              {!loading && orders.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-slate-400">Sin órdenes</td></tr>}
              {orders.map(o => (
                <tr key={o._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-700">{o.motorcycle?.plate}</span>
                    <span className="text-slate-400 ml-1 text-xs">{o.motorcycle?.brand}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{o.client?.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[o.status] || ''}`}>
                      {o.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">{o.mechanic?.name}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/orders/${o._id}`} className="text-blue-600 hover:underline text-xs font-medium">Ver</Link>
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
