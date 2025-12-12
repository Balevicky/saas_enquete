import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import InviteListPage from "./pages/InviteListPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SignupTenantPage from "./pages/SignupTenantPage";

import AppNavbar from "./components/common/Navbar";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
// import DepartementList from "./components/geo/DepartementList";
import RegionPage from "./pages/RegionPage";
import SectorPage from "./pages/SectorPage";
import VillagePage from "./pages/VallagePage";
import DepartementPage from "./pages/DepartementPage";

// ----------------------
// Route privée tenant-aware
// ----------------------
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { token, tenantSlug } = useAuth();

  if (!token) {
    // 🔥 Redirection tenant-aware
    if (tenantSlug) return <Navigate to={`/t/${tenantSlug}/login`} replace />;
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// ----------------------
// Vérification tenantSlug
// ----------------------
const TenantWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();

  if (!tenantSlug) return <div>Tenant missing in URL</div>;

  return <>{children}</>;
};

// ----------------------
// Route multi-tenant combinée
// ----------------------
const TenantRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => (
  <PrivateRoute>
    <TenantWrapper>{element}</TenantWrapper>
  </PrivateRoute>
);

// ----------------------
// App principale
// ----------------------
const App: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppNavbar />

      <Routes>
        {/* Routes publiques globales */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupTenantPage />} />

        {/* Route login tenant-aware */}
        <Route path="/t/:tenantSlug/login" element={<LoginPage />} />

        {/* Register tenant-aware */}
        <Route path="/t/:tenantSlug/register" element={<RegisterPage />} />

        {/* Routes multi-tenant protégées */}
        <Route
          path="/t/:tenantSlug/dashboard"
          element={<TenantRoute element={<Dashboard />} />}
        />
        <Route
          path="/t/:tenantSlug/region"
          element={<TenantRoute element={<RegionPage />} />}
        />
        <Route
          path="/t/:tenantSlug/departement"
          element={<TenantRoute element={<DepartementPage />} />}
        />
        <Route
          path="/t/:tenantSlug/secteur"
          element={<TenantRoute element={<SectorPage />} />}
        />
        <Route
          path="/t/:tenantSlug/village"
          element={<TenantRoute element={<VillagePage />} />}
        />
        <Route
          path="/t/:tenantSlug/invite"
          element={<TenantRoute element={<InviteListPage />} />}
        />
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
