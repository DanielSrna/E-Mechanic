import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { useEffect, useState } from 'react';

export default function Header({ onMenuClick }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.get('/settings').then(r => setSettings(r.data.settings)).catch(() => {});
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center gap-3">
      <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div className="flex-1" />
      <span className="text-xs px-2 py-1 rounded-full font-medium" style={{
        background: settings?.primaryColor + '20' || '#2563eb20',
        color: settings?.primaryColor || '#2563eb',
      }}>
        {user?.rol === 'admin' ? 'Administrador' : 'Mecánico'}
      </span>
    </header>
  );
}
