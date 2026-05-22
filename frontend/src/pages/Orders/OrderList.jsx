import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import OrderKanban from './OrderKanban';
import { statusLabel } from './status';

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetch = useCallback(() => {
    setLoading(true);
    api
      .get('/orders')
      .then((r) => setOrders(r.data.orders))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleStatusChange = useCallback(
    async (orderId, newStatus, oldStatus) => {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, status: newStatus } : o
        )
      );

      try {
        await api.put(`/orders/${orderId}/status`, { status: newStatus });
        toast.success(`Estado: ${statusLabel(newStatus)}`);
      } catch (err) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderId ? { ...o, status: oldStatus } : o
          )
        );
        toast.error(
          err.response?.data?.message || 'Error al cambiar estado'
        );
      }
    },
    []
  );

  const filteredOrders = search
    ? orders.filter(
        (o) =>
          o.motorcycle?.plate?.toLowerCase().includes(search.toLowerCase()) ||
          o.client?.name?.toLowerCase().includes(search.toLowerCase()) ||
          o.mechanic?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : orders;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-400 text-sm">Cargando órdenes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
          Órdenes de Trabajo
        </h1>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Buscar por placa, cliente o mecánico..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
          />
          <Link
            to="/orders/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium whitespace-nowrap"
          >
            + Nueva Orden
          </Link>
        </div>
      </div>

      <OrderKanban orders={filteredOrders} onStatusChange={handleStatusChange} />
    </div>
  );
}
