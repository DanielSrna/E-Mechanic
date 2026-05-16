import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import ClientList from './pages/Clients/ClientList';
import ClientForm from './pages/Clients/ClientForm';
import MotorcycleList from './pages/Motorcycles/MotorcycleList';
import MotorcycleForm from './pages/Motorcycles/MotorcycleForm';
import OrderList from './pages/Orders/OrderList';
import OrderDetail from './pages/Orders/OrderDetail';
import OrderForm from './pages/Orders/OrderForm';
import PartList from './pages/Inventory/PartList';
import PartForm from './pages/Inventory/PartForm';
import SettingsPage from './pages/Settings/SettingsPage';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<ClientList />} />
            <Route path="/clients/new" element={<ClientForm />} />
            <Route path="/clients/:id/edit" element={<ClientForm />} />
            <Route path="/motorcycles" element={<MotorcycleList />} />
            <Route path="/motorcycles/new" element={<MotorcycleForm />} />
            <Route path="/motorcycles/:id/edit" element={<MotorcycleForm />} />
            <Route path="/orders" element={<OrderList />} />
            <Route path="/orders/new" element={<OrderForm />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/inventory" element={<PartList />} />
            <Route path="/inventory/new" element={<PartForm />} />
            <Route path="/inventory/:id/edit" element={<PartForm />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
