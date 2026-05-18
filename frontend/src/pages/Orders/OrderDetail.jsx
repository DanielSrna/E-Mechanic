import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const statusMap = {
  ingresada: ['en_revision', 'cancelada'],
  en_revision: ['esperando_aprobacion', 'esperando_repuestos', 'cancelada'],
  esperando_aprobacion: ['en_reparacion', 'cancelada'],
  esperando_repuestos: ['en_reparacion', 'cancelada'],
  en_reparacion: ['lista_entrega', 'cancelada'],
  lista_entrega: ['entregada', 'cancelada'],
  entregada: [], cancelada: [],
};

export default function OrderDetail() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [order, setOrder] = useState(null);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [partId, setPartId] = useState('');
  const [qty, setQty] = useState(1);
  const [laborDesc, setLaborDesc] = useState('');
  const [laborCost, setLaborCost] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [addingPart, setAddingPart] = useState(false);
  const [addingLabor, setAddingLabor] = useState(false);

  const fetch = async () => {
    const { data } = await api.get(`/orders/${id}`);
    setOrder(data.order);
    setLoading(false);
  };

  useEffect(() => { fetch(); api.get('/parts').then(r => setParts(r.data.parts)).catch(() => {}); }, [id]);

  const updateStatus = async () => {
    if (!newStatus) return;
    try { await api.put(`/orders/${id}/status`, { status: newStatus }); toast.success('Estado actualizado'); fetch(); setNewStatus(''); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const addPart = async () => {
    if (!partId || qty < 1) return;
    setAddingPart(true);
    try { await api.put(`/orders/${id}/parts`, { partId, quantity: qty }); toast.success('Repuesto agregado'); fetch(); setPartId(''); setQty(1); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setAddingPart(false);
  };

  const addLabor = async () => {
    if (!laborDesc || !laborCost) return;
    setAddingLabor(true);
    try { await api.put(`/orders/${id}/labor`, { description: laborDesc, cost: Number(laborCost) }); toast.success('Mano de obra agregada'); fetch(); setLaborDesc(''); setLaborCost(''); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setAddingLabor(false);
  };

  const closeOrder = async () => {
    if (!confirm('¿Cerrar esta orden? Se calcularán los totales y se bloqueará.')) return;
    try { await api.put(`/orders/${id}/close`); toast.success('Orden cerrada'); fetch(); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const formatCOP = (n) => `$${Number(n || 0).toLocaleString('es-CO')}`;

  if (loading) return <div className="text-center py-10 text-slate-400">Cargando orden...</div>;
  if (!order) return <div className="text-center py-10 text-slate-400">Orden no encontrada</div>;

  const canModify = !order.isClosed;
  const allowedStatuses = canModify ? (statusMap[order.status] || []) : [];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">OT {order.motorcycle?.plate} - {order.motorcycle?.brand} {order.motorcycle?.model}</h1>
        <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${order.status === 'entregada' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
          {order.status?.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <InfoCard label="Cliente" value={order.client?.name} />
        <InfoCard label="Mecánico" value={order.mechanic?.name} />
        <InfoCard label="Motivo" value={order.entryReason} />
      </div>

      {canModify && allowedStatuses.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-slate-700 mb-3">Cambiar estado</h3>
          <div className="flex flex-wrap gap-2">
            {allowedStatuses.map(s => (
              <button key={s} onClick={() => setNewStatus(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
                  newStatus === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}>
                {s.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
          {newStatus && (
            <button onClick={updateStatus} className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
              Confirmar cambio a "{newStatus.replace(/_/g, ' ')}"
            </button>
          )}
        </div>
      )}

      {canModify && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-slate-700">Agregar repuesto</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <select value={partId} onChange={e => setPartId(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Seleccionar repuesto...</option>
              {parts.filter(p => p.stock > 0).map(p => <option key={p._id} value={p._id}>{p.name} (Stock: {p.stock} | ${p.salePrice?.toLocaleString()})</option>)}
            </select>
            <input type="number" min={1} value={qty} onChange={e => setQty(Number(e.target.value))}
              className="w-24 px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none" />
            <button onClick={addPart} disabled={addingPart}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">Agregar</button>
          </div>
        </div>
      )}

      {canModify && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-slate-700">Agregar mano de obra</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input value={laborDesc} onChange={e => setLaborDesc(e.target.value)} placeholder="Descripción"
              className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-sm outline-none" />
            <input type="number" min={0} value={laborCost} onChange={e => setLaborCost(e.target.value)} placeholder="Costo"
              className="w-32 px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none" />
            <button onClick={addLabor} disabled={addingLabor}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">Agregar</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {order.partsUsed?.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-slate-700 mb-3">Repuestos ({order.partsUsed.length})</h3>
            <div className="space-y-2">
              {order.partsUsed.map((p, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{p.part?.name || 'Repuesto'} x{p.quantity}</span>
                  <span className="font-medium">{formatCOP(p.quantity * p.unitPrice)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {order.labor?.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-slate-700 mb-3">Mano de obra ({order.labor.length})</h3>
            <div className="space-y-2">
              {order.labor.map((l, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{l.description}</span>
                  <span className="font-medium">{formatCOP(l.cost)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {order.isClosed && (
        <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
          <h3 className="font-semibold text-emerald-800 mb-3">Totales</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal Repuestos</span><span className="font-medium">{formatCOP(order.subtotalParts)}</span></div>
            <div className="flex justify-between"><span>Subtotal Labor</span><span className="font-medium">{formatCOP(order.subtotalLabor)}</span></div>
            <div className="flex justify-between"><span>IVA (19%)</span><span className="font-medium">{formatCOP(order.tax)}</span></div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-emerald-200"><span>TOTAL</span><span>{formatCOP(order.total)}</span></div>
          </div>
        </div>
      )}

      {isAdmin && !order.isClosed && ['lista_entrega', 'entregada'].includes(order.status) && (
        <button onClick={closeOrder} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition text-lg">
          Cerrar Orden y Facturar {order.status === 'entregada' ? '(pendiente de cierre)' : ''}
        </button>
      )}
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-medium text-slate-700">{value || '-'}</p>
    </div>
  );
}
