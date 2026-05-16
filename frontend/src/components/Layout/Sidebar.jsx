import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { useEffect, useState } from 'react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊', adminOnly: true },
  { to: '/clients', label: 'Clientes', icon: '👥', adminOnly: false },
  { to: '/motorcycles', label: 'Motocicletas', icon: '🏍️', adminOnly: false },
  { to: '/orders', label: 'Órdenes', icon: '🔧', adminOnly: false },
  { to: '/inventory', label: 'Inventario', icon: '📦', adminOnly: false },
  { to: '/settings', label: 'Configuración', icon: '⚙️', adminOnly: true },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.get('/settings').then(r => setSettings(r.data.settings)).catch(() => {});
  }, []);

  const visibleItems = navItems.filter(i => !i.adminOnly || isAdmin);

  return (
    <aside
      className={`fixed top-0 left-0 h-full w-64 z-30 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{ background: settings?.secondaryColor || '#1e293b' }}
    >
      <div className="p-5 border-b border-white/10 flex items-center gap-3">
        {settings?.logo ? (
          <img src={settings.logo} alt="Logo" className="w-9 h-9 rounded object-cover" />
        ) : (
          <span className="text-2xl">🏍️</span>
        )}
        <span className="text-white font-bold text-lg truncate">
          {settings?.appName || 'E-Mechanic'}
        </span>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-thin">
        {visibleItems.map((item) => {
          const active = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                active
                  ? 'text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
              style={active ? { background: settings?.primaryColor || '#2563eb' } : {}}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ background: settings?.primaryColor || '#2563eb' }}>
            {user?.name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-white/50 text-xs truncate">{user?.rol}</p>
          </div>
        </div>
        <button onClick={logout} className="w-full py-2 text-white/60 hover:text-white text-sm flex items-center justify-center gap-2 hover:bg-white/10 rounded-lg transition">
          🚪 Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
