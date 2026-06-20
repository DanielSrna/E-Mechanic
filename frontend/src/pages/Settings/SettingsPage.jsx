import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { Store, ChevronDown, ChevronUp } from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUpload, setLogoUpload] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConf, setNewPasswordConf] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [changingEmail, setChangingEmail] = useState(false);
  const [devOpen, setDevOpen] = useState(false);
  const [devLoading, setDevLoading] = useState(false);

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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== newPasswordConf) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Mínimo 6 caracteres');
      return;
    }
    setChangingPass(true);
    try {
      await api.put('/users/change-password', {
        currentPassword,
        newPassword,
        newPasswordConfirmation: newPasswordConf,
      });
      toast.success('Contraseña actualizada');
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConf('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
    setChangingPass(false);
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    setChangingEmail(true);
    try {
      const { data } = await api.put('/users/change-email', {
        currentPassword: emailPassword,
        newEmail,
      });
      toast.success(data.message || 'Email de verificación enviado');
      setNewEmail('');
      setEmailPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
    setChangingEmail(false);
  };

  if (loading) return <div className="text-center py-10 text-slate-400">Cargando...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 page-settings">
      <h1 className="text-2xl font-bold text-slate-800">Configuración del Sistema</h1>

      <div className="settings-logo bg-white rounded-xl shadow-sm p-6 space-y-4">
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

      <div className="settings-name bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-slate-700">Identidad de la App</h2>
        <SettingsField label="Nombre de la App" value={settings?.appName} onChange={v => update('appName', v)} />
      </div>

      <div className="settings-colors bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-slate-700">Colores del Tema</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ColorField label="Color Primario" value={settings?.primaryColor} onChange={v => update('primaryColor', v)} />
          <ColorField label="Color Secundario" value={settings?.secondaryColor} onChange={v => update('secondaryColor', v)} />
          <ColorField label="Color Acento" value={settings?.accentColor} onChange={v => update('accentColor', v)} />
        </div>
      </div>

      <div className="settings-credentials bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-slate-700 dark:text-slate-200">Credenciales del Administrador</h2>
        <p className="text-xs text-slate-400">Sesión actual: {user?.email}</p>

        <form onSubmit={handleChangeEmail} className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300">Cambiar Email</h3>
          <SettingsField label="Nuevo Email" value={newEmail} onChange={setNewEmail} placeholder="nuevo@email.com" />
          <SettingsField label="Contraseña actual" value={emailPassword} onChange={setEmailPassword} placeholder="••••••" type="password" />
          <p className="text-xs text-slate-400">Se enviará un email de verificación al nuevo correo.</p>
          <button type="submit" disabled={changingEmail}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {changingEmail ? 'Enviando...' : 'Cambiar Email'}
          </button>
        </form>

        <form onSubmit={handleChangePassword} className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300">Cambiar Contraseña</h3>
          <SettingsField label="Contraseña actual" value={currentPassword} onChange={setCurrentPassword} placeholder="••••••" type="password" />
          <SettingsField label="Nueva contraseña" value={newPassword} onChange={setNewPassword} placeholder="Mínimo 6 caracteres" type="password" />
          <SettingsField label="Confirmar nueva contraseña" value={newPasswordConf} onChange={setNewPasswordConf} placeholder="Repite la contraseña" type="password" />
          <button type="submit" disabled={changingPass}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {changingPass ? 'Cambiando...' : 'Cambiar Contraseña'}
          </button>
        </form>
      </div>

      <div className="settings-company bg-white rounded-xl shadow-sm p-6 space-y-4">
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
        className="settings-save w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
        {saving ? 'Guardando...' : 'Guardar Configuración'}
      </button>

      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
        <button
          onClick={() => setDevOpen(!devOpen)}
          className="w-full flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition"
        >
          <span>Solo para desarrolladores</span>
          {devOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {devOpen && (
          <div className="mt-3 space-y-2">
            <button
              onClick={async () => {
                setDevLoading(true);
                try { await api.post('/admin/seed-demo'); toast.success('Datos demo recargados'); }
                catch { toast.error('Error al recargar'); }
                setDevLoading(false);
              }}
              disabled={devLoading}
              className="w-full py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              Recargar datos demo
            </button>
            <button
              onClick={async () => {
                if (!confirm('¿Eliminar todos los datos demo? Solo se conservará el administrador y la configuración.')) return;
                setDevLoading(true);
                try { await api.post('/admin/clear-demo'); toast.success('Datos demo eliminados'); }
                catch { toast.error('Error al limpiar'); }
                setDevLoading(false);
              }}
              disabled={devLoading}
              className="w-full py-2 rounded-lg border border-red-300 dark:border-red-700 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
            >
              Limpiar datos demo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsField({ label, value, onChange, type, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{label}</label>
      <input type={type || 'text'} value={value || ''} placeholder={placeholder} onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none" />
    </div>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
      <div className="flex gap-2">
        <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)}
          className="w-10 min-w-[2.5rem] h-10 rounded border cursor-pointer" />
        <input type="text" value={value || ''} onChange={e => onChange(e.target.value)}
          className="flex-1 min-w-0 px-2 py-2 rounded-lg border border-slate-300 text-sm font-mono outline-none" />
      </div>
    </div>
  );
}
