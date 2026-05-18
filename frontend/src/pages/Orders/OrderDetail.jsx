import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const ALL_STATUSES = ['ingresada', 'en_revision', 'esperando_aprobacion', 'esperando_repuestos', 'en_reparacion', 'lista_entrega', 'entregada', 'cancelada'];

const statusLabel = (s) => s?.replace(/_/g, ' ');
const statusColor = (s) => {
  const m = {
    ingresada: 'bg-slate-500', en_revision: 'bg-yellow-500', esperando_aprobacion: 'bg-orange-500',
    esperando_repuestos: 'bg-purple-500', en_reparacion: 'bg-blue-500',
    lista_entrega: 'bg-green-500', entregada: 'bg-emerald-500', cancelada: 'bg-red-500',
  };
  return m[s] || 'bg-slate-500';
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
  const [findingTitle, setFindingTitle] = useState('');
  const [findingDesc, setFindingDesc] = useState('');

  const fetch = async () => {
    const { data } = await api.get(`/orders/${id}`);
    setOrder(data.order);
    setLoading(false);
  };

  useEffect(() => { fetch(); api.get('/parts').then(r => setParts(r.data.parts)).catch(() => {}); }, [id]);

  const updateStatus = async (status) => {
    try { await api.put(`/orders/${id}/status`, { status }); toast.success('Estado actualizado'); fetch(); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const addPart = async () => {
    if (!partId || qty < 1) return;
    try { await api.put(`/orders/${id}/parts`, { partId, quantity: qty }); toast.success('Repuesto agregado'); fetch(); setPartId(''); setQty(1); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const addLabor = async () => {
    if (!laborDesc || !laborCost) return;
    try { await api.put(`/orders/${id}/labor`, { description: laborDesc, cost: Number(laborCost) }); toast.success('MO agregada'); fetch(); setLaborDesc(''); setLaborCost(''); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const addFinding = async () => {
    if (!findingTitle) return;
    try { await api.put(`/orders/${id}/findings`, { title: findingTitle, description: findingDesc }); toast.success('Hallazgo agregado'); fetch(); setFindingTitle(''); setFindingDesc(''); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const removeFinding = async (index) => {
    try { await api.delete(`/orders/${id}/findings`, { data: { index } }); toast.success('Hallazgo eliminado'); fetch(); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const closeOrder = async () => {
    if (!confirm('¿Cerrar esta orden? Se calcularán los totales y se bloqueará.')) return;
    try { await api.put(`/orders/${id}/close`); toast.success('Orden cerrada'); fetch(); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const formatCOP = (n) => `$${Number(n || 0).toLocaleString('es-CO')}`;
  const canModify = !order?.isClosed;

  if (loading) return <div className="text-center py-10 text-slate-400">Cargando orden...</div>;
  if (!order) return <div className="text-center py-10 text-slate-400">Orden no encontrada</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 space-y-6 min-w-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-800">OT {order.motorcycle?.plate} — {order.motorcycle?.brand} {order.motorcycle?.model}</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-medium text-white capitalize ${statusColor(order.status)}`}>
            {statusLabel(order.status)}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <InfoCard label="Cliente" value={order.client?.name} />
          <InfoCard label="Mecánico" value={order.mechanic?.name} />
          <InfoCard label="Motivo" value={order.entryReason} />
        </div>

        {canModify && (
          <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
            <h3 className="font-semibold text-slate-700 text-sm">Agregar repuesto</h3>
            <div className="flex flex-wrap gap-2">
              <select value={partId} onChange={e => setPartId(e.target.value)}
                className="flex-1 min-w-[180px] px-3 py-2 rounded-lg border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar repuesto...</option>
                {parts.filter(p => p.stock > 0).map(p => <option key={p._id} value={p._id}>{p.name} (Stock: {p.stock})</option>)}
              </select>
              <input type="number" min={1} value={qty} onChange={e => setQty(Number(e.target.value))}
                className="w-16 px-2 py-2 rounded-lg border border-slate-300 text-xs outline-none" />
              <button onClick={addPart} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700">Agregar</button>
            </div>
          </div>
        )}

        {isAdmin && canModify && (
          <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
            <h3 className="font-semibold text-slate-700 text-sm">Agregar mano de obra</h3>
            <div className="flex flex-wrap gap-2">
              <input value={laborDesc} onChange={e => setLaborDesc(e.target.value)} placeholder="Descripción"
                className="flex-1 min-w-[150px] px-3 py-2 rounded-lg border border-slate-300 text-xs outline-none" />
              <input type="number" min={0} value={laborCost} onChange={e => setLaborCost(e.target.value)} placeholder="Costo"
                className="w-24 px-2 py-2 rounded-lg border border-slate-300 text-xs outline-none" />
              <button onClick={addLabor} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700">Agregar</button>
            </div>
          </div>
        )}

        {canModify && (
          <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
            <h3 className="font-semibold text-slate-700 text-sm">Agregar hallazgo</h3>
            <div className="flex flex-wrap gap-2">
              <input value={findingTitle} onChange={e => setFindingTitle(e.target.value)} placeholder="Título del hallazgo *"
                className="flex-1 min-w-[150px] px-3 py-2 rounded-lg border border-slate-300 text-xs outline-none" />
              <input value={findingDesc} onChange={e => setFindingDesc(e.target.value)} placeholder="Descripción (opcional)"
                className="flex-1 min-w-[150px] px-3 py-2 rounded-lg border border-slate-300 text-xs outline-none" />
              <button onClick={addFinding} className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs hover:bg-indigo-700">Agregar</button>
            </div>
          </div>
        )}

        {order.findings?.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-slate-700 text-sm mb-3">Reparación de los siguientes hallazgos</h3>
            <div className="space-y-2">
              {order.findings.map((f, i) => (
                <div key={i} className="flex justify-between items-start p-3 bg-indigo-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{f.title}</p>
                    {f.description && <p className="text-xs text-slate-500 mt-0.5">{f.description}</p>}
                  </div>
                  {canModify && <button onClick={() => removeFinding(i)} className="text-red-500 text-xs hover:underline ml-2 shrink-0">✕</button>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {order.partsUsed?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-semibold text-slate-700 text-sm mb-2">Repuestos</h3>
              {order.partsUsed.map((p, i) => (
                <div key={i} className="flex justify-between text-xs py-1"><span>{p.part?.name} x{p.quantity}</span><span className="font-mono font-medium">{formatCOP(p.quantity * p.unitPrice)}</span></div>
              ))}
            </div>
          )}
          {order.labor?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-semibold text-slate-700 text-sm mb-2">Mano de obra</h3>
              {order.labor.map((l, i) => (
                <div key={i} className="flex justify-between text-xs py-1"><span>{l.description}</span><span className="font-mono font-medium">{formatCOP(l.cost)}</span></div>
              ))}
            </div>
          )}
        </div>

        {order.isClosed && (
          <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200">
            <h3 className="font-semibold text-emerald-800 text-sm mb-2">Totales</h3>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between"><span>Subtotal Repuestos</span><span>{formatCOP(order.subtotalParts)}</span></div>
              <div className="flex justify-between"><span>Subtotal Labor</span><span>{formatCOP(order.subtotalLabor)}</span></div>
              <div className="flex justify-between"><span>IVA (19%)</span><span>{formatCOP(order.tax)}</span></div>
              <div className="flex justify-between text-base font-bold pt-2 border-t border-emerald-200 mt-1"><span>TOTAL</span><span>{formatCOP(order.total)}</span></div>
            </div>
          </div>
        )}

        {isAdmin && !order.isClosed && ['lista_entrega', 'entregada'].includes(order.status) && (
          <button onClick={closeOrder} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition">
            Cerrar y Facturar {order.status === 'entregada' ? '(pendiente)' : ''}
          </button>
        )}
      </div>

      <div className="w-full lg:w-56 shrink-0">
        <div className="bg-white rounded-xl shadow-sm p-4 lg:sticky lg:top-4">
          <h3 className="font-semibold text-slate-700 text-sm mb-3">Cambiar estado</h3>
          {canModify ? (
            <div className="space-y-1.5">
              {ALL_STATUSES.filter(s => s !== order.status && s !== 'cancelada').map(s => (
                <button key={s} onClick={() => updateStatus(s)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs capitalize transition border border-transparent hover:bg-slate-100 ${order.status === s ? 'bg-slate-100 font-medium' : 'text-slate-600'}`}>
                  {statusLabel(s)}
                </button>
              ))}
              <hr className="my-2" />
              {order.status !== 'cancelada' && (
                <button onClick={() => {
                  if (confirm('¿Cancelar esta orden? Esta acción no se puede deshacer.')) updateStatus('cancelada');
                }} className="w-full px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200">
                  Cancelar orden
                </button>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400">Orden cerrada. No se puede modificar estado.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-3">
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-slate-700 truncate">{value || '-'}</p>
    </div>
  );
}
