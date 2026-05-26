import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { Store, Bell, Sun, Moon } from 'lucide-react';
import api from '../../api/axios';

export default function Header({ onMenuClick }) {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem('darkMode') === 'true'
  );
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const panelRef = useRef(null);

  useEffect(() => {
    const fetchCount = () => {
      api
        .get('/notifications/unread-count')
        .then((r) => setUnread(r.data.count || 0))
        .catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const togglePanel = async () => {
    if (!open) {
      try {
        const { data } = await api.get('/notifications');
        setNotifications(data.notifications || []);
      } catch {}
    }
    setOpen(!open);
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnread(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 md:px-6 py-3 flex items-center gap-3">
      <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div className="flex items-center gap-2">
        {settings?.logo ? (
          <img src={settings.logo} alt="Logo" className="h-8 w-auto object-contain" />
        ) : (
          <Store className="w-6 h-6 text-slate-500" />
        )}
        <span className="font-semibold text-slate-700 dark:text-slate-200 hidden sm:inline">
          {settings?.appName || 'E-Mechanic'}
        </span>
      </div>
      <div className="flex-1" />

      <div className="relative" ref={panelRef}>
        <button
          onClick={togglePanel}
          className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
        >
          <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unread > 9 ? '!' : unread}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-50 max-h-96 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">
                Notificaciones
              </span>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Marcar todo leído
                </button>
              )}
            </div>
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <p className="text-center py-8 text-sm text-slate-400">
                  Sin notificaciones
                </p>
              ) : (
                notifications.slice(0, 20).map((n) => (
                  <div
                    key={n._id}
                    className={`px-4 py-3 border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition ${
                      !n.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    {n.orderId ? (
                      <Link
                        to={`/orders/${n.orderId}`}
                        onClick={() => setOpen(false)}
                        className="block"
                      >
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          {n.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {n.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(n.createdAt).toLocaleString('es-CO')}
                        </p>
                      </Link>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          {n.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {n.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(n.createdAt).toLocaleString('es-CO')}
                        </p>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => {
          const next = !isDark;
          setIsDark(next);
          localStorage.setItem('darkMode', String(next));
          document.documentElement.classList.toggle('dark', next);
        }}
        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
        title={isDark ? 'Modo claro' : 'Modo oscuro'}
      >
        {isDark ? (
          <Sun className="w-5 h-5 text-amber-400" />
        ) : (
          <Moon className="w-5 h-5 text-slate-500" />
        )}
      </button>

      <span
        className="text-xs px-2 py-1 rounded-full font-medium"
        style={{
          background: settings?.primaryColor + '20' || '#2563eb20',
          color: settings?.primaryColor || '#2563eb',
        }}
      >
        {user?.rol === 'admin' ? 'Administrador' : 'Mecánico'}
      </span>
    </header>
  );
}
