import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { ArrowLeft } from 'lucide-react';
import { statusLabel, statusColor } from '../Orders/status';

export default function MotorcycleOrders() {
  const { id } = useParams();
  const [motorcycle, setMotorcycle] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/motorcycles/${id}/history`)
      .then((r) => {
        setMotorcycle(r.data.motorcycle);
        setOrders(r.data.history);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [id]);

  const formatCOP = (n) => `$${Number(n || 0).toLocaleString('es-CO')}`;

  if (loading) return <div className="text-center py-10 text-slate-400">Cargando...</div>;

  return (
    <div className="space-y-4">
      <Link
        to="/motorcycles"
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a motocicletas
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
          Historial: {motorcycle?.plate}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {motorcycle?.brand} {motorcycle?.model} — {motorcycle?.year} —{' '}
          {Number(motorcycle?.mileage).toLocaleString()} km
        </p>
        {motorcycle?.client && (
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Cliente: {motorcycle.client.name}
          </p>
        )}
      </div>

      {orders.length === 0 ? (
        <p className="text-slate-400 py-8 text-center">Sin órdenes registradas</p>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Fecha</th>
                <th className="text-left px-4 py-3 font-medium">Estado</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Mecánico</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Motivo</th>
                <th className="text-right px-4 py-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {orders.map((o) => (
                <tr key={o._id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {new Date(o.createdAt).toLocaleDateString('es-CO')}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium text-white capitalize ${statusColor(o.status)}`}
                    >
                      {statusLabel(o.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 hidden md:table-cell text-xs">
                    {o.mechanic?.name}
                  </td>
                  <td className="px-4 py-3 text-slate-500 hidden lg:table-cell text-xs truncate max-w-[200px]">
                    {o.entryReason}
                  </td>
                  <td className="px-4 py-3 text-right text-xs font-medium text-slate-700 dark:text-slate-200">
                    {o.isClosed ? formatCOP(o.total) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
