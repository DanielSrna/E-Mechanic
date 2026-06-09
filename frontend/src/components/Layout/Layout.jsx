import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import AppTour from '../AppTour';
import { useState, useEffect, useCallback, useMemo } from 'react';

import dashboardSteps from '../tours/dashboard.tour';
import clientsSteps from '../tours/clients.tour';
import motorcyclesSteps from '../tours/motorcycles.tour';
import mechanicsSteps from '../tours/mechanics.tour';
import ordersSteps from '../tours/orders.tour';
import inventorySteps from '../tours/inventory.tour';
import scheduleSteps from '../tours/schedule.tour';
import settingsSteps from '../tours/settings.tour';

const TOUR_MAP = {
  '/': { key: 'dashboard', steps: dashboardSteps },
  '/clients': { key: 'clients', steps: clientsSteps },
  '/motorcycles': { key: 'motorcycles', steps: motorcyclesSteps },
  '/mechanics': { key: 'mechanics', steps: mechanicsSteps },
  '/orders': { key: 'orders', steps: ordersSteps },
  '/inventory': { key: 'inventory', steps: inventorySteps },
  '/schedule': { key: 'schedule', steps: scheduleSteps },
  '/settings': { key: 'settings', steps: settingsSteps },
};

function getTourKey(path) {
  for (const prefix of Object.keys(TOUR_MAP)) {
    if (path === prefix || path.startsWith(prefix + '/')) {
      return TOUR_MAP[prefix];
    }
  }
  return null;
}

export default function Layout() {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tourSteps, setTourSteps] = useState([]);
  const [tourRun, setTourRun] = useState(false);
  const [tourKey, setTourKey] = useState(null);
  const [tourForce, setTourForce] = useState(false);

  const pageTour = useMemo(() => getTourKey(location.pathname), [location.pathname]);

  useEffect(() => {
    const dark = localStorage.getItem('darkMode') === 'true';
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  useEffect(() => {
    if (!tourRun || !tourKey || !pageTour) return;
    if (tourKey !== pageTour.key) {
      localStorage.setItem(`tour-done-${tourKey}`, 'true');
      setTourRun(false);
    }
  }, [pageTour?.key, tourKey, tourRun]);

  useEffect(() => {
    if (!user || loading || tourRun || !pageTour || !isAdmin) return;
    const done = localStorage.getItem(`tour-done-${pageTour.key}`) === 'true';
    if (done) return;
    const key = pageTour.key;
    const steps = pageTour.steps;
    const timer = setTimeout(() => {
      setTourSteps(steps);
      setTourKey(key);
      setTourRun(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [user, loading, tourRun, pageTour?.key]);

  const handleTourFinish = useCallback(() => {
    setTourRun(false);
    if (tourKey) {
      localStorage.setItem(`tour-done-${tourKey}`, 'true');
    }
    setTourForce(false);
  }, [tourKey, tourForce]);

  const handleRepeatTour = useCallback(() => {
    const t = pageTour || getTourKey('/');
    if (t) {
      localStorage.removeItem(`tour-done-${t.key}`);
      setTourRun(false);
      setTourKey(null);
      setTimeout(() => {
        setTourSteps(t.steps);
        setTourKey(t.key);
        setTourForce(true);
        setTourRun(true);
      }, 100);
    }
  }, [pageTour]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <div
        className={`fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onRepeatTour={handleRepeatTour}
        isAdmin={isAdmin}
      />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
        <footer className="py-3 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          Desarrollado por{' '}
          <span className="font-medium text-slate-500 dark:text-slate-300">
            Daniel Felipe Serna López
          </span>{' '}
          &copy; {new Date().getFullYear()}
        </footer>
      </div>

      <AppTour steps={tourSteps} run={tourRun} onFinish={handleTourFinish} />
    </div>
  );
}
