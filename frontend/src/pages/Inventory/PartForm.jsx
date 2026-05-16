import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function PartForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ sku: '', name: '', brand: '', description: '', purchasePrice: '', salePrice: '', stock: 0, minStock: 5 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) api.get(`/parts/${id}`).then(r => {
      const p = r.data.part;
      setForm({ sku: p.sku, name: p.name, brand: p.brand || '', description: p.description || '', purchasePrice: p.purchasePrice, salePrice: p.salePrice, stock: p.stock, minStock: p.minStock });
    }).catch(() => navigate('/inventory'));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form, purchasePrice: Number(form.purchasePrice), salePrice: Number(form.salePrice), stock: Number(form.stock), minStock: Number(form.minStock) };
      if (id) { await api.put(`/parts/${id}`, data); toast.success('Actualizado'); }
      else { await api.post('/parts', data); toast.success('Creado'); }
      navigate('/inventory');
    } catch (err) { toast.error(err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const update = (k, v) => setForm({ ...form, [k]: v });

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">{id ? 'Editar' : 'Nuevo'} Repuesto</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <Field label="SKU *" value={form.sku} onChange={v => update('sku', v.toUpperCase())} placeholder="OIL-10W40" />
        <Field label="Nombre *" value={form.name} onChange={v => update('name', v)} />
        <Field label="Marca" value={form.brand} onChange={v => update('brand', v)} />
        <Field label="Descripción" value={form.description} onChange={v => update('description', v)} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Precio compra *" type="number" value={form.purchasePrice} onChange={v => update('purchasePrice', v)} />
          <Field label="Precio venta *" type="number" value={form.salePrice} onChange={v => update('salePrice', v)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Stock" type="number" value={form.stock} onChange={v => update('stock', v)} />
          <Field label="Stock mínimo" type="number" value={form.minStock} onChange={v => update('minStock', v)} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50">
            {loading ? 'Guardando...' : id ? 'Actualizar' : 'Crear'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600">Cancelar</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
        placeholder={placeholder} />
    </div>
  );
}
