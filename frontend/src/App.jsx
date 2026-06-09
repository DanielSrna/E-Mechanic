import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import Layout from './components/Layout/Layout';
import AdminRoute from './components/Layout/AdminRoute';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';

const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const ClientList = lazy(() => import('./pages/Clients/ClientList'));
const ClientForm = lazy(() => import('./pages/Clients/ClientForm'));
const MotorcycleList = lazy(() => import('./pages/Motorcycles/MotorcycleList'));
const MotorcycleForm = lazy(() => import('./pages/Motorcycles/MotorcycleForm'));
const OrderList = lazy(() => import('./pages/Orders/OrderList'));
const OrderDetail = lazy(() => import('./pages/Orders/OrderDetail'));
const OrderForm = lazy(() => import('./pages/Orders/OrderForm'));
const PartList = lazy(() => import('./pages/Inventory/PartList'));
const PartForm = lazy(() => import('./pages/Inventory/PartForm'));
const SettingsPage = lazy(() => import('./pages/Settings/SettingsPage'));
const MechanicList = lazy(() => import('./pages/Mechanics/MechanicList'));
const MechanicForm = lazy(() => import('./pages/Mechanics/MechanicForm'));
const SchedulePage = lazy(() => import('./pages/Schedule/SchedulePage'));
const MotorcycleOrders = lazy(() => import('./pages/Motorcycles/MotorcycleOrders'));

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <Suspense fallback={<Spinner />}>
            <ErrorBoundary>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<Layout />}>
                <Route path="/" element={<AdminRoute><Dashboard /></AdminRoute>} />
                <Route path="/clients" element={<ClientList />} />
                <Route path="/clients/new" element={<AdminRoute><ClientForm /></AdminRoute>} />
                <Route path="/clients/:id/edit" element={<AdminRoute><ClientForm /></AdminRoute>} />
                <Route path="/motorcycles" element={<MotorcycleList />} />
                <Route path="/motorcycles/new" element={<AdminRoute><MotorcycleForm /></AdminRoute>} />
                <Route path="/motorcycles/:id/edit" element={<AdminRoute><MotorcycleForm /></AdminRoute>} />
                <Route path="/motorcycles/:id/orders" element={<MotorcycleOrders />} />
                <Route path="/orders" element={<OrderList />} />
                <Route path="/orders/new" element={<AdminRoute><OrderForm /></AdminRoute>} />
                <Route path="/orders/:id" element={<OrderDetail />} />
                <Route path="/schedule" element={<AdminRoute><SchedulePage /></AdminRoute>} />
                <Route path="/inventory" element={<PartList />} />
                <Route path="/inventory/new" element={<AdminRoute><PartForm /></AdminRoute>} />
                <Route path="/inventory/:id/edit" element={<AdminRoute><PartForm /></AdminRoute>} />
                <Route path="/settings" element={<AdminRoute><SettingsPage /></AdminRoute>} />
                <Route path="/mechanics" element={<AdminRoute><MechanicList /></AdminRoute>} />
                <Route path="/mechanics/new" element={<AdminRoute><MechanicForm /></AdminRoute>} />
                <Route path="/mechanics/:id/edit" element={<AdminRoute><MechanicForm /></AdminRoute>} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
            </ErrorBoundary>
          </Suspense>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
