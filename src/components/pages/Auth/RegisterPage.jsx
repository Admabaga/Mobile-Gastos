import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { getErrorMessage } from "../../../lib/apiClient";
import MoniLogo from "../../ui/MoniLogo";

const INITIAL = { name: "", email: "", password: "", city: "", phone: "" };

export default function RegisterPage() {
  const { register } = useAuth();
  const { push }     = useToast();
  const navigate     = useNavigate();

  const [form, setForm]       = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  function handle(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      push("¡Cuenta creada! Bienvenido/a 🎉", "success");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      push(getErrorMessage(err, "No se pudo crear la cuenta"), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-brand">
        <div className="auth-pill">
          <i className="bi bi-person-plus me-1" /> Únete gratis hoy
        </div>
        <img src="/moni-icon.svg" alt="moni" className="auth-brand-logo" style={{ background: "transparent", filter: "drop-shadow(0 0 18px rgba(124,111,247,.6))" }} />
        <h1>Empieza ahora</h1>
        <p>Crea tu perfil y toma el control de tus finanzas en segundos.</p>

        <div className="auth-features">
          {[
            { icon: "bi-graph-up-arrow", text: "Visualiza tendencias de gasto" },
            { icon: "bi-wallet2",        text: "Registra ilimitados gastos"    },
            { icon: "bi-lock",           text: "Datos 100% privados"          },
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
          <h2>Crear cuenta</h2>
          <p className="auth-sub">Solo tarda un minuto, prometido.</p>

          <form onSubmit={onSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label" htmlFor="name">Nombre completo</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-person" /></span>
                <input id="name" name="name" className="form-control"
                  placeholder="Ana García" value={form.name} onChange={handle}
                  required autoFocus autoComplete="name" />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="reg-email">Correo electrónico</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-envelope" /></span>
                <input id="reg-email" name="email" type="email" className="form-control"
                  placeholder="tu@correo.com" value={form.email} onChange={handle}
                  required autoComplete="email" />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="reg-password">Contraseña</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-lock" /></span>
                <input id="reg-password" name="password"
                  type={showPwd ? "text" : "password"}
                  className="form-control" placeholder="Mínimo 6 caracteres"
                  value={form.password} onChange={handle}
                  required autoComplete="new-password" />
                <button type="button" className="input-group-text"
                  style={{ cursor: "pointer", background: "none", border: "1.5px solid var(--border)", borderLeft: "none" }}
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? "Ocultar" : "Ver"}>
                  <i className={`bi ${showPwd ? "bi-eye-slash" : "bi-eye"}`} />
                </button>
              </div>
            </div>

            <div className="row g-2 mb-4">
              <div className="col-7">
                <label className="form-label" htmlFor="city">Ciudad</label>
                <input id="city" name="city" className="form-control"
                  placeholder="Medellín" value={form.city} onChange={handle} />
              </div>
              <div className="col-5">
                <label className="form-label" htmlFor="phone">Teléfono</label>
                <input id="phone" name="phone" className="form-control"
                  placeholder="3001234567" value={form.phone} onChange={handle} />
              </div>
            </div>

            <button type="submit" className="btn-accent w-100 justify-content-center" disabled={loading}>
              {loading
                ? <><span className="spinner-accent" style={{ width: 16, height: 16 }} /> Creando cuenta...</>
                : <><i className="bi bi-person-check" /> Crear cuenta</>}
            </button>
          </form>

          <p className="mt-4 text-center" style={{ fontSize: 13, color: "var(--muted)" }}>
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
