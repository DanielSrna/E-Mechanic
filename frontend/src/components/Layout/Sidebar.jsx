import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import {
  LayoutDashboard, Users, Gauge, UserCog, Wrench,
  Package, Settings, Store, LogOut, CalendarDays,
} from 'lucide-react';
import HelpButton from '../HelpButton';
import AssistButton from '../AssistButton';

const navItems = [
  { to: '/', label: 'Dashboard', Icon: LayoutDashboard, adminOnly: true, cls: 'sidebar-dashboard' },
  { to: '/clients', label: 'Clientes', Icon: Users, adminOnly: false, cls: 'sidebar-clients' },
  { to: '/motorcycles', label: 'Motocicletas', Icon: Gauge, adminOnly: false, cls: 'sidebar-motorcycles' },
  { to: '/mechanics', label: 'Mecánicos', Icon: UserCog, adminOnly: true, cls: 'sidebar-mechanics' },
  { to: '/orders', label: 'Órdenes', Icon: Wrench, adminOnly: false, cls: 'sidebar-orders' },
  { to: '/schedule', label: 'Agenda', Icon: CalendarDays, adminOnly: true, cls: 'sidebar-schedule' },
  { to: '/inventory', label: 'Inventario', Icon: Package, adminOnly: false, cls: 'sidebar-inventory' },
  { to: '/settings', label: 'Configuración', Icon: Settings, adminOnly: true, cls: 'sidebar-settings' },
];

export default function Sidebar({ open, onClose, onRepeatTour }) {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const { settings } = useSettings();

  const visibleItems = navItems.filter((i) => !i.adminOnly || isAdmin);

  return (
    <aside
      className={`fixed top-0 left-0 h-full w-64 z-30 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{ background: settings?.secondaryColor || '#1e293b' }}
      aria-label="Barra lateral"
    >
      <div className="p-5 border-b border-white/10 flex items-center gap-3">
        {settings?.logo ? (
          <img src={settings.logo} alt="Logo" className="w-9 h-9 rounded object-cover" />
        ) : (
          <Store className="w-8 h-8 text-white" />
        )}
        <span className="text-white font-bold text-lg truncate">
          {settings?.appName || 'E-Mechanic'}
        </span>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-thin" aria-label="Navegación principal">
        {visibleItems.map((item) => {
          const active =
            item.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={`${item.cls || ''} flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                active
                  ? 'text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
              style={active ? { background: settings?.primaryColor || '#2563eb' } : {}}
            >
              <item.Icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ background: settings?.primaryColor || '#2563eb' }}
          >
            {user?.name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-white/50 text-xs truncate">{user?.rol}</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={logout}
            className="flex-[7] py-2.5 rounded-lg text-sm font-medium transition bg-red-500/20 hover:bg-red-500/40 text-red-300 hover:text-white flex items-center justify-center gap-2"
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
          <div className="flex-[3]">
            {isAdmin ? (
              <HelpButton onRepeatTour={onRepeatTour} />
            ) : (
              <AssistButton />
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
