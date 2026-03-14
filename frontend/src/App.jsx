import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Login from './pages/Login';
import Settings         from "./pages/settings/Settings";
import WarehouseSettings from './pages/settings/WarehouseSettings';
import LocationSettings from "./pages/settings/LocationSettings";
import Transfer          from "./pages/Transfer";
import Adjustment        from "./pages/Adjustment";
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            {/* Member 3 will add their routes here */}
            <Route path="/settings/warehouses" element={<WarehouseSettings />} />
            <Route path="/settings/locations" element={<LocationSettings />} />
            <Route path="/transfer" element={<Transfer />} />
            <Route path="/adjustment" element={<Adjustment />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;