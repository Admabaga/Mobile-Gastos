import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { getErrorMessage } from "../../../lib/apiClient";
import MoniLogo from "../../ui/MoniLogo";

export default function LoginPage() {
  const { login } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  function handle(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      push("¡Bienvenido de vuelta!", "success");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      push(getErrorMessage(err, "Correo o contraseña incorrectos"), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-brand">
        <div className="auth-pill">
          <i className="bi bi-stars me-1" /> Control financiero inteligente
        </div>
        <img src="/moni-icon.svg" alt="moni" className="auth-brand-logo" style={{ background: "transparent", filter: "drop-shadow(0 0 18px rgba(124,111,247,.6))" }} />
        <MoniLogo size={42} />
        <p style={{ marginTop: 12 }}>Tu dinero, tu meta. <span style={{ color: "#a78bfa", fontWeight: 600 }}>Nosotros te guiamos.</span></p>

        <div className="auth-features">
          {[
            { icon: "bi-bar-chart-line", text: "Analítica mensual en tiempo real" },
            { icon: "bi-shield-check", text: "Tu ambiente personal y privado" },
            { icon: "bi-tag", text: "Categorización de gastos" },
          ].map(({ icon, text }) => (
            <div className="auth-feature-item" key={text}>
              <i className={`bi ${icon}`} aria-hidden="true" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <h2>Iniciar sesión</h2>
          <p className="auth-sub">Ingresa a tu espacio financiero personal.</p>

          <form onSubmit={onSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label" htmlFor="email">Correo electrónico</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-envelope" aria-hidden="true" />
                </span>
                <input
                  id="email" name="email" type="email" className="form-control"
                  placeholder="tu@correo.com" value={form.email} onChange={handle}
                  required autoFocus autoComplete="email" />
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label mb-0" htmlFor="password">Contraseña</label>

              </div>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-lock" aria-hidden="true" />
                </span>
                <input
                  id="password" name="password"
                  type={showPwd ? "text" : "password"}
                  className="form-control" placeholder="••••••••"
                  value={form.password} onChange={handle}
                  required autoComplete="current-password" />
                <button type="button" className="input-group-text"
                  style={{ cursor: "pointer", background: "none", border: "1.5px solid var(--border)", borderLeft: "none" }}
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? "Ocultar contraseña" : "Ver contraseña"}>
                  <i className={`bi ${showPwd ? "bi-eye-slash" : "bi-eye"}`} aria-hidden="true" />
                </button>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "15px" }}>
                <Link
                  to="/forgot-password"
                  style={{
                    fontSize: 13,
                    color: "var(--accent)",
                    textDecoration: "none",
                    fontWeight: 600
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>
            <button type="submit" className="btn-accent w-100 justify-content-center" disabled={loading}>
              {loading
                ? <><span className="spinner-accent" style={{ width: 16, height: 16 }} /> Ingresando...</>
                : <><i className="bi bi-arrow-right-circle" aria-hidden="true" /> Ingresar</>}
            </button>
          </form>

          <p className="mt-4 text-center" style={{ fontSize: 13, color: "var(--muted)" }}>
            ¿No tienes cuenta?{" "}
            <Link to="/register" style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
