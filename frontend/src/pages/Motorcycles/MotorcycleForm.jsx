import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function MotorcycleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ plate: '', brand: '', model: '', year: new Date().getFullYear(), mileage: 0, client: '' });
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [imgUpload, setImgUpload] = useState(false);

  useEffect(() => {
    api.get('/clients').then(r => setClients(r.data.clients)).catch((e) => console.error(e));
    if (id) {
      api.get(`/motorcycles/${id}`).then(r => {
        const m = r.data.motorcycle;
        setForm({ plate: m.plate, brand: m.brand, model: m.model, year: m.year, mileage: m.mileage, client: m.client?._id || '' });
        setImages(m.images || []);
      }).catch(() => navigate('/motorcycles'));
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) { await api.put(`/motorcycles/${id}`, form); toast.success('Moto actualizada'); }
      else { await api.post('/motorcycles', form); toast.success('Moto registrada'); }
      navigate('/motorcycles');
    } catch (err) { toast.error(err.response?.data?.errors?.[0]?.msg || 'Error'); }
    finally { setLoading(false); }
  };

  const handleUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async (e) => {
      const fd = new FormData();
      [...e.target.files].forEach(f => fd.append('images', f));
      setImgUpload(true);
      try {
        const { data } = await api.post(`/motorcycles/${id}/images`, fd);
        setImages(data.motorcycle.images);
        toast.success('Imágenes subidas');
      } catch { toast.error('Error al subir'); }
      setImgUpload(false);
    };
    input.click();
  };

  const update = (k, v) => setForm({ ...form, [k]: v });

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">{id ? 'Editar' : 'Registrar'} Motocicleta</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <Field label="Placa *" value={form.plate} onChange={v => update('plate', v.toUpperCase())} placeholder="ABC123" />
        <Field label="Marca *" value={form.brand} onChange={v => update('brand', v)} />
        <Field label="Modelo *" value={form.model} onChange={v => update('model', v)} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Año *" type="number" value={form.year} onChange={v => update('year', Number(v))} />
          <Field label="Kilometraje *" type="number" value={form.mileage} onChange={v => update('mileage', Number(v))} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Cliente *</label>
          <select value={form.client} onChange={e => update('client', e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">Seleccionar cliente...</option>
            {clients.map(c => <option key={c._id} value={c._id}>{c.name} - {c.phone}</option>)}
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50">
            {loading ? 'Guardando...' : id ? 'Actualizar' : 'Registrar'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600">Cancelar</button>
        </div>
      </form>

      {id && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-700">Imágenes ({images.length})</h3>
            <button onClick={handleUpload} disabled={imgUpload} className="text-sm text-blue-600 hover:underline disabled:opacity-50">
              {imgUpload ? 'Subiendo...' : '+ Subir imágenes'}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative group">
                <img src={img} alt={`Moto ${i}`} className="w-full h-24 object-cover rounded-lg" />
              </div>
            ))}
            {images.length === 0 && <p className="text-slate-400 text-sm col-span-full">Sin imágenes</p>}
          </div>
        </div>
      )}
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
