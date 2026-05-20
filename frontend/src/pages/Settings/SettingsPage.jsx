import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useSettings } from '../../context/SettingsContext';
import { Store } from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUpload, setLogoUpload] = useState(false);

  useEffect(() => {
    if (settings) setLoading(false);
  }, [settings]);

  const update = (key, value) => updateSettings({ ...settings, [key]: value });

  const handleSave = async () => {
    setSaving(true);
    try { await api.put('/settings', settings); toast.success('Configuración actualizada'); }
    catch { toast.error('Error al guardar'); }
    setSaving(false);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('logo', file);
    setLogoUpload(true);
    try {
      const { data } = await api.post('/settings/logo', fd);
      updateSettings({ ...settings, logo: data.logo });
      toast.success('Logo actualizado');
    } catch { toast.error('Error al subir logo'); }
    setLogoUpload(false);
  };

  if (loading) return <div className="text-center py-10 text-slate-400">Cargando...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Configuración del Sistema</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-slate-700">Logo del Taller</h2>
        <div className="flex items-center gap-4">
          {settings?.logo ? (
            <img src={settings.logo} alt="Logo" className="w-20 h-20 rounded-xl object-cover border" />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <Store className="w-8 h-8 text-slate-400" />
            </div>
          )}
          <label className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm cursor-pointer hover:bg-blue-700">
            {logoUpload ? 'Subiendo...' : 'Cambiar Logo'}
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-slate-700">Identidad de la App</h2>
        <SettingsField label="Nombre de la App" value={settings?.appName} onChange={v => update('appName', v)} />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-slate-700">Colores del Tema</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ColorField label="Color Primario" value={settings?.primaryColor} onChange={v => update('primaryColor', v)} />
          <ColorField label="Color Secundario" value={settings?.secondaryColor} onChange={v => update('secondaryColor', v)} />
          <ColorField label="Color Acento" value={settings?.accentColor} onChange={v => update('accentColor', v)} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-slate-700">Apariencia</h2>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-slate-600">Modo oscuro</span>
          <input
            type="checkbox"
            className="w-5 h-5 rounded"
            defaultChecked={localStorage.getItem('darkMode') === 'true'}
            onChange={(e) => {
              const isDark = e.target.checked;
              localStorage.setItem('darkMode', String(isDark));
              document.documentElement.classList.toggle('dark', isDark);
            }}
          />
        </label>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-slate-700">Datos del Taller (Facturas)</h2>
        <SettingsField label="Nombre de la Empresa" value={settings?.companyName} onChange={v => update('companyName', v)} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SettingsField label="NIT" value={settings?.companyNit} onChange={v => update('companyNit', v)} />
          <SettingsField label="Teléfono" value={settings?.companyPhone} onChange={v => update('companyPhone', v)} />
        </div>
        <SettingsField label="Dirección" value={settings?.companyAddress} onChange={v => update('companyAddress', v)} />
        <SettingsField label="Email" value={settings?.companyEmail} onChange={v => update('companyEmail', v)} />
      </div>

      <button onClick={handleSave} disabled={saving}
        className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
        {saving ? 'Guardando...' : 'Guardar Configuración'}
      </button>
    </div>
  );
}

function SettingsField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
      <input type="text" value={value || ''} onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
    </div>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
      <div className="flex gap-2">
        <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)}
          className="w-10 h-10 rounded border cursor-pointer" />
        <input type="text" value={value || ''} onChange={e => onChange(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono outline-none" />
      </div>
    </div>
  );
}
