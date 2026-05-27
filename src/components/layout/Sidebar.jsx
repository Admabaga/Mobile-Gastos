import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import MoniLogo from "../ui/MoniLogo";

const ADMIN_EMAIL = "admabaga@outlook.com";

const NAV_SECTIONS = [
  {
    label: "Principal",
    items: [
      { to: "/dashboard",    icon: "bi-grid-1x2",    label: "Dashboard"       },
      { to: "/gastos",       icon: "bi-cash-coin",   label: "Mis Gastos"      },
      { to: "/metodos-pago", icon: "bi-credit-card", label: "Métodos de pago" },
    ],
  },
  {
    label: "Finanzas",
    items: [
      { to: "/finanzas", icon: "bi-wallet2",        label: "Mis Finanzas"      },
    ],
  },
  {
    label: "Social",
    items: [
      { to: "/grupos", icon: "bi-people",           label: "Grupos compartidos" },
      { to: "/deudas", icon: "bi-arrow-left-right", label: "Deudas y préstamos" },
    ],
  },
];

export default function Sidebar({ open, onClose }) {
  const { auth, logout } = useAuth();
  const isAdmin = auth?.email === ADMIN_EMAIL;
  const { push }         = useToast();
  const navigate         = useNavigate();

  function handleLogout() {
    logout();
    push("Sesión cerrada correctamente", "info");
    navigate("/login", { replace: true });
  }

  const initials = auth?.name
    ? auth.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "?";

  return (
    <>
      {open && (
        <div
          className="d-md-none position-fixed top-0 start-0 w-100 h-100"
          style={{ background: "rgba(0,0,0,.45)", zIndex: 1039 }}
          onClick={onClose}
        />
      )}

      <aside className={`sidebar${open ? " open" : ""}`}>
        <div className="sidebar-brand">
          <img
            src="/moni-icon.png"
            alt="moni"
            width={36}
            height={36}
            style={{ borderRadius: "var(--radius-sm)", boxShadow: "0 0 14px rgba(124,111,247,.4)", flexShrink: 0 }}
          />
          <div>
            <MoniLogo size={18} dot="#a78bfa" />
            <div className="sidebar-brand-tagline">Tu dinero, tu meta.</div>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Navegación principal">
          {NAV_SECTIONS.map(({ label, items }) => (
            <React.Fragment key={label}>
              <div className="sidebar-section-label">{label}</div>
              {items.map(({ to, icon, label: lbl }) => (
                <NavLink
                  key={to} to={to} onClick={onClose}
                  className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
                >
                  <i className={`bi ${icon}`} aria-hidden="true" />
                  {lbl}
                </NavLink>
              ))}
            </React.Fragment>
          ))}

          {/* Sección admin — solo visible para el administrador */}
          {isAdmin && (
            <>
              <div className="sidebar-section-label">Admin</div>
              <NavLink to="/admin" onClick={onClose}
                className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}>
                <i className="bi bi-shield-lock" aria-hidden="true" />
                Panel admin
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <NavLink
            to="/perfil"
            onClick={onClose}
            className="sidebar-user"
            style={{ textDecoration: "none", cursor: "pointer" }}
          >
            <div className="sidebar-avatar">{initials}</div>
            <div style={{ overflow: "hidden", flex: 1 }}>
              <div className="sidebar-user-name">{auth?.name ?? "Usuario"}</div>
              <div className="sidebar-user-email">{auth?.email ?? ""}</div>
            </div>
            <i className="bi bi-pencil-square" style={{ color: "rgba(255,255,255,.3)", fontSize: 13, flexShrink: 0 }} />
          </NavLink>
          <button className="btn-sidebar-logout" onClick={handleLogout}>
            <i className="bi bi-box-arrow-left" aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
