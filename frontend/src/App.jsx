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
import Receipts from "./pages/Receipt";       // file is Receipt.jsx not Receipts.jsx
import Deliveries from "./pages/Deliveries";
import MoveHistory from "./pages/Movehistory"; // file must be MoveHistory.jsx

// ─────────────────────────────────────────────
// ProtectedRoute — if no token, redirect to login
// ─────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ── PUBLIC ROUTES ─────────────────── */}
          <Route path="/login"           element={<Login />} />
          <Route path="/signup"          element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* ── PROTECTED ROUTES ──────────────── */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard — default page at / */}
            <Route index element={<Dashboard />} />

            {/* Products */}
            <Route path="products" element={<Products />} />

            {/* Inventory Flow */}
            <Route path="receipts"    element={<Receipts />} />
            <Route path="deliveries"  element={<Deliveries />} />
            <Route path="transfer"    element={<Transfer />} />
            <Route path="adjustment"  element={<Adjustment />} />

            {/* Move History — ledger of all stock movements */}
            <Route path="move-history" element={<MoveHistory />} />

            {/* Settings */}
            <Route path="settings"            element={<Settings />} />
            <Route path="settings/warehouses" element={<WarehouseSettings />} />
            <Route path="settings/locations"  element={<LocationSettings />} />

          </Route>

          {/* ── CATCH ALL — redirect unknown URLs to home */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;