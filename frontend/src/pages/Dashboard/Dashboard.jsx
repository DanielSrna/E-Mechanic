import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { formatCOP } from '../../utils/format';
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

  useEffect(() => {
    if (!isAdmin) return;
    api.get('/stats/overview').then(r => setOverview(r.data)).catch((e) => console.error(e));
    api.get('/stats/revenue?period=monthly').then(r => setRevenue(r.data)).catch((e) => console.error(e));
    api.get('/stats/mechanic-productivity').then(r => setMechanics(r.data)).catch((e) => console.error(e));
    api.get('/stats/order-status-distribution').then(r => setStatusDist(r.data)).catch((e) => console.error(e));
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <span className="text-5xl mb-4 block">🔧</span>
        <h2 className="text-xl font-semibold text-slate-600">Panel de Mecánico</h2>
        <p className="text-slate-400 mt-2">Usa el menú lateral para gestionar órdenes y clientes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Clientes" value={overview?.totalClients} icon="👥" color="blue" />
        <StatCard label="Órdenes Totales" value={overview?.totalOrders} icon="🔧" color="green" />
        <StatCard label="Pendientes" value={overview?.pendingOrders} icon="⏳" color="amber" />
        <StatCard label="Ingresos del Mes" value={formatCOP(overview?.revenueThisMonth)} icon="💰" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Ingresos Mensuales</h3>
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

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Productividad por Mecánico</h3>
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

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Distribución de Estados</h3>
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

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickLink href="/orders/new" label="Nueva Orden" icon="🔧" />
            <QuickLink href="/clients/new" label="Nuevo Cliente" icon="👤" />
            <QuickLink href="/motorcycles/new" label="Registrar Moto" icon="🏍️" />
            <QuickLink href="/inventory/new" label="Nuevo Repuesto" icon="📦" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  const colors = { blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600', amber: 'bg-amber-50 text-amber-600', purple: 'bg-purple-50 text-purple-600' };
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3 ${colors[color]}`}>{icon}</div>
      <p className="text-2xl font-bold text-slate-800">{value ?? '-'}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </div>
  );
}

function QuickLink({ href, label, icon }) {
  return (
    <Link to={href} className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition group">
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-medium text-slate-600 group-hover:text-blue-600">{label}</span>
    </Link>
  );
}
