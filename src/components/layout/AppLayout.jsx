import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useTheme } from "../../context/ThemeContext";

const PAGE_TITLES = {
  "/dashboard":    "Dashboard",
  "/gastos":       "Mis Gastos",
  "/finanzas":     "Mis Finanzas",
  "/grupos":       "Grupos compartidos",
  "/deudas":       "Deudas y préstamos",
  "/metodos-pago": "Métodos de Pago",
  "/perfil":       "Mi Perfil",
};

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();
  const { theme, toggle } = useTheme();

  const title = PAGE_TITLES[location.pathname] ?? "moni";
  const isDark = theme === "dark";

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="app-main">
        {/* Topbar */}
        <header className="topbar">
          <button
            className="btn-outline-g d-md-none"
            style={{ padding: "6px 10px" }}
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            <i className="bi bi-list fs-5" aria-hidden="true" />
          </button>

          <span className="topbar-title">{title}</span>

          {/* Toggle dark mode */}
          <button
            onClick={toggle}
            aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
            title={isDark ? "Tema claro" : "Tema oscuro"}
            style={{
              marginLeft: "auto",
              background: "var(--surface-alt)",
              border: "1px solid var(--border)",
              borderRadius: 999,
              width: 36, height: 36,
              cursor: "pointer",
              color: "var(--text-light)",
              display: "grid", placeItems: "center",
              transition: "all .2s",
            }}
          >
            <i className={`bi ${isDark ? "bi-sun-fill" : "bi-moon-stars-fill"}`}
              style={{ fontSize: 14 }} />
          </button>
        </header>

        <main className="app-content">
          <Outlet />
        </main>

        {/* FAB — Quick add */}
        <button
          onClick={() => navigate("/gastos?tab=registrar")}
          aria-label="Registrar gasto rápido"
          title="Nuevo gasto"
          className="fab-quick"
        >
          <i className="bi bi-plus-lg" />
        </button>
      </div>
    </div>
  );
}
