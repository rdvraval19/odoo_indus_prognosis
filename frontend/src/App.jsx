import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Settings from "./pages/settings/Settings";
import WarehouseSettings from './pages/settings/WarehouseSettings';
import LocationSettings from "./pages/settings/LocationSettings";
import Transfer from "./pages/Transfer";
import Adjustment from "./pages/Adjustment";

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
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />

            {/* Settings */}
            <Route path="settings" element={<Settings />} />
            <Route path="settings/warehouses" element={<WarehouseSettings />} />
            <Route path="settings/locations" element={<LocationSettings />} />

            {/* Inventory */}
            <Route path="transfer" element={<Transfer />} />
            <Route path="adjustment" element={<Adjustment />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;