import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { formatCOP } from '../../utils/format';
import { Users, Wrench, Clock, DollarSign } from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title,
  Tooltip, Legend, ArcElement, PointElement, LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const COLORS = ['#2563eb', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];

export default function Dashboard() {
  const { isAdmin } = useAuth();
  const [overview, setOverview] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [mechanics, setMechanics] = useState(null);
  const [statusDist, setStatusDist] = useState(null);
  const [mostUsedParts, setMostUsedParts] = useState(null);

  useEffect(() => {
    if (!isAdmin) return;
    api.get('/stats/overview').then(r => setOverview(r.data)).catch(e => console.error(e));
    api.get('/stats/revenue?period=monthly').then(r => setRevenue(r.data)).catch(e => console.error(e));
    api.get('/stats/mechanic-productivity').then(r => setMechanics(r.data)).catch(e => console.error(e));
    api.get('/stats/order-status-distribution').then(r => setStatusDist(r.data)).catch(e => console.error(e));
    api.get('/stats/most-used-parts').then(r => setMostUsedParts(r.data)).catch(e => console.error(e));
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <Wrench className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-600">Panel de Mecánico</h2>
        <p className="text-slate-400 mt-2">Usa el menú lateral para gestionar órdenes y clientes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Clientes" value={overview?.totalClients} Icon={Users} color="blue" />
        <StatCard label="Órdenes Totales" value={overview?.totalOrders} Icon={Wrench} color="green" />
        <StatCard label="Pendientes" value={overview?.pendingOrders} Icon={Clock} color="amber" />
        <StatCard label="Ingresos del Mes" value={formatCOP(overview?.revenueThisMonth)} Icon={DollarSign} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Ingresos Mensuales</h3>
          {revenue && (
            <Line
              data={{
                labels: revenue.labels,
                datasets: [{
                  label: 'Ingresos', data: revenue.revenue,
                  borderColor: '#2563eb', backgroundColor: '#2563eb20',
                  fill: true, tension: 0.4,
                }],
              }}
              options={{ responsive: true, plugins: { legend: { display: false } } }}
            />
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Productividad por Mecánico</h3>
          {mechanics && (
            <Bar
              data={{
                labels: mechanics.mechanics?.map(m => m.name),
                datasets: [{
                  label: 'Facturado', data: mechanics.mechanics?.map(m => m.totalBilled),
                  backgroundColor: COLORS,
                }],
              }}
              options={{ responsive: true, plugins: { legend: { display: false } } }}
            />
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Distribución de Estados</h3>
          {statusDist && (
            <Pie
              data={{
                labels: statusDist.labels,
                datasets: [{ data: statusDist.data, backgroundColor: COLORS }],
              }}
              options={{ responsive: true }}
            />
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Repuestos Más Vendidos del Mes</h3>
          {mostUsedParts && mostUsedParts.parts?.length > 0 ? (
            <div className="space-y-3">
              {mostUsedParts.parts.slice(0, 8).map((p) => (
                <div key={p.partId} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{p.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      x{p.totalQuantity} vendidos · {formatCOP(p.totalRevenue)} generado
                    </p>
                  </div>
                  <div className="ml-3 text-right shrink-0">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Stock: {p.currentStock}</p>
                    {p.currentStock <= p.minStock && (
                      <p className="text-xs text-red-500 font-medium">⚠ Bajo</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">Sin datos de ventas aún</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, Icon, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  };
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-5">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{value ?? '-'}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{label}</p>
    </div>
  );
}
