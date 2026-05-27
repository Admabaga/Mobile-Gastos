import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import AppLayout from "../components/layout/AppLayout";
import LoginPage from "../components/pages/Auth/LoginPage";
import RegisterPage from "../components/pages/Auth/RegisterPage";
import ForgotPasswordPage from "../components/pages/Auth/ForgotPasswordPage";
import Dashboard from "../components/pages/Dashboard/Dashboard";
import Expenses from "../components/pages/Expenses/Expenses";
import PaymentMethod from "../components/pages/PaymentMethod/PaymentMethod";
import ProfilePage   from "../components/pages/Profile/ProfilePage";
import DebtsPage    from "../components/pages/Debts/DebtsPage";
import GroupsPage    from "../components/pages/Groups/GroupsPage";
import FinancePage  from "../components/pages/Finance/FinancePage";
import AdminPage     from "../components/pages/Admin/AdminPage";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/login"            element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/register"         element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
      <Route path="/forgot-password"  element={<PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>} />

      {/* Privadas — con AppLayout (sidebar + topbar) */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard"    element={<Dashboard />} />
        <Route path="/gastos"       element={<Expenses />} />
        <Route path="/metodos-pago" element={<PaymentMethod />} />
        <Route path="/perfil"       element={<ProfilePage />} />
        <Route path="/deudas"       element={<DebtsPage />} />
        <Route path="/grupos"       element={<GroupsPage />} />
        <Route path="/finanzas"     element={<FinancePage />} />
        <Route path="/admin"        element={<AdminPage />} />
      </Route>

      {/* Fallbacks */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
