import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../../services/authService";
import { useToast } from "../../../context/ToastContext";
import { getErrorMessage } from "../../../lib/apiClient";

const STEPS = { EMAIL: "email", TOKEN: "token", SUCCESS: "success" };

export default function ForgotPasswordPage() {
  const { push }  = useToast();
  const navigate  = useNavigate();

  const [step, setStep]         = useState(STEPS.EMAIL);
  const [email, setEmail]       = useState("");
  const [token, setToken]       = useState(["", "", "", ""]);
  const [newPwd, setNewPwd]     = useState("");
  const [confirmPwd, setConfirm]= useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);

  const digitRefs = [useRef(), useRef(), useRef(), useRef()];

  // ── Step 1: send email ────────────────────────────────────────────────────
  async function onSendEmail(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      push("Código enviado a tu correo 📨", "success");
      setStep(STEPS.TOKEN);
    } catch (err) {
      push(getErrorMessage(err, "No se pudo enviar el correo"), "error");
    } finally {
      setLoading(false);
    }
  }

  // ── OTP input handlers ────────────────────────────────────────────────────
  function onDigitChange(idx, val) {
    const clean = val.replace(/\D/g, "").slice(-1);
    const next  = [...token];
    next[idx]   = clean;
    setToken(next);
    if (clean && idx < 3) digitRefs[idx + 1].current?.focus();
  }

  function onDigitKeyDown(idx, e) {
    if (e.key === "Backspace" && !token[idx] && idx > 0) {
      digitRefs[idx - 1].current?.focus();
    }
  }

  function onDigitPaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pasted.length === 4) {
      setToken(pasted.split(""));
      digitRefs[3].current?.focus();
    }
  }

  // ── Step 2: verify token + new password ──────────────────────────────────
  async function onResetPassword(e) {
    e.preventDefault();
    const otp = token.join("");
    if (otp.length < 4) { push("Ingresa el código completo", "warning"); return; }
    if (newPwd !== confirmPwd) { push("Las contraseñas no coinciden", "warning"); return; }
    if (newPwd.length < 6)    { push("Mínimo 6 caracteres", "warning"); return; }

    setLoading(true);
    try {
      await authService.resetPassword({ email, token: otp, newPassword: newPwd });
      setStep(STEPS.SUCCESS);
    } catch (err) {
      push(getErrorMessage(err, "Código inválido o expirado"), "error");
      setToken(["", "", "", ""]);
      digitRefs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      {/* Brand panel */}
      <div className="auth-brand">
        <div className="auth-pill">
          <i className="bi bi-shield-lock me-1" /> Recuperación segura
        </div>
        <img src="/moni-icon.png" alt="moni" className="auth-brand-logo" style={{ background: "transparent", boxShadow: "0 0 28px rgba(124,111,247,.45)" }} />
        <h1>moni</h1>
        <p>Te ayudamos a recuperar el acceso a tu cuenta de forma segura.</p>

        {/* Stepper visual */}
        <div className="auth-features" style={{ marginTop: 48 }}>
          {[
            { icon: "bi-envelope-at",   text: "Ingresa tu correo registrado", done: step !== STEPS.EMAIL },
            { icon: "bi-123",           text: "Verifica el código de 4 dígitos", done: step === STEPS.SUCCESS },
            { icon: "bi-lock-fill",     text: "Crea tu nueva contraseña", done: false },
          ].map(({ icon, text, done }, i) => (
            <div className="auth-feature-item" key={i}>
              <i
                className={`bi ${done ? "bi-check-circle-fill" : icon}`}
                style={{ color: done ? "var(--accent)" : undefined }}
                aria-hidden="true"
              />
              <span style={{ textDecoration: done ? "line-through" : "none", opacity: done ? 0.5 : 1 }}>
                {text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">

          {/* ── Step 1: email ─────────────────────────────────────────── */}
          {step === STEPS.EMAIL && (
            <>
              <div style={{ marginBottom: 6 }}>
                <span style={{
                  background: "var(--accent-soft)", color: "var(--accent)",
                  fontSize: 11, fontWeight: 700, padding: "4px 10px",
                  borderRadius: 99, textTransform: "uppercase", letterSpacing: "0.5px"
                }}>
                  Paso 1 de 2
                </span>
              </div>
              <h2>¿Olvidaste tu contraseña?</h2>
              <p className="auth-sub">
                Ingresa tu correo y te enviamos un código de 4 dígitos al instante.
              </p>

              <form onSubmit={onSendEmail} noValidate>
                <div className="mb-4">
                  <label className="form-label" htmlFor="fp-email">Correo electrónico</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-envelope" aria-hidden="true" />
                    </span>
                    <input
                      id="fp-email" type="email" className="form-control"
                      placeholder="tu@correo.com" value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required autoFocus autoComplete="email" />
                  </div>
                </div>

                <button type="submit" className="btn-accent w-100 justify-content-center" disabled={loading}>
                  {loading
                    ? <><span className="spinner-accent" style={{ width: 16, height: 16 }} /> Enviando código...</>
                    : <><i className="bi bi-send" /> Enviar código</>}
                </button>
              </form>

              <p className="mt-4 text-center" style={{ fontSize: 13, color: "var(--muted)" }}>
                <Link to="/login" style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>
                  <i className="bi bi-arrow-left me-1" />Volver al login
                </Link>
              </p>
            </>
          )}

          {/* ── Step 2: OTP + new password ────────────────────────────── */}
          {step === STEPS.TOKEN && (
            <>
              <div style={{ marginBottom: 6 }}>
                <span style={{
                  background: "var(--accent-soft)", color: "var(--accent)",
                  fontSize: 11, fontWeight: 700, padding: "4px 10px",
                  borderRadius: 99, textTransform: "uppercase", letterSpacing: "0.5px"
                }}>
                  Paso 2 de 2
                </span>
              </div>
              <h2>Verifica tu identidad</h2>
              <p className="auth-sub">
                Ingresa el código de 4 dígitos que enviamos a{" "}
                <strong style={{ color: "var(--text)" }}>{email}</strong>
              </p>

              <form onSubmit={onResetPassword} noValidate>
                {/* OTP boxes */}
                <div className="mb-4">
                  <label className="form-label">Código de verificación</label>
                  <div className="d-flex gap-3 justify-content-center mb-2">
                    {token.map((d, i) => (
                      <input
                        key={i}
                        ref={digitRefs[i]}
                        type="text" inputMode="numeric" maxLength={1}
                        value={d}
                        onChange={(e) => onDigitChange(i, e.target.value)}
                        onKeyDown={(e) => onDigitKeyDown(i, e)}
                        onPaste={onDigitPaste}
                        autoFocus={i === 0}
                        style={{
                          width: 56, height: 64, textAlign: "center",
                          fontSize: 28, fontWeight: 800, color: "var(--primary)",
                          border: `2px solid ${d ? "var(--accent)" : "var(--border)"}`,
                          borderRadius: "var(--radius-md)",
                          background: d ? "var(--accent-soft)" : "var(--surface)",
                          outline: "none", transition: "border-color 0.15s, background 0.15s",
                          boxShadow: d ? "0 0 0 3px rgba(0,200,150,.15)" : "none",
                        }}
                      />
                    ))}
                  </div>
                  <p style={{ fontSize: 11.5, color: "var(--muted)", textAlign: "center", margin: 0 }}>
                    ⏱ El código expira en 15 minutos
                  </p>
                </div>

                {/* New password */}
                <div className="mb-3">
                  <label className="form-label" htmlFor="new-pwd">Nueva contraseña</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-lock-fill" /></span>
                    <input
                      id="new-pwd" type={showPwd ? "text" : "password"}
                      className="form-control" placeholder="Mínimo 6 caracteres"
                      value={newPwd} onChange={(e) => setNewPwd(e.target.value)} required />
                    <button type="button" className="input-group-text"
                      style={{ cursor: "pointer", background: "none", border: "1.5px solid var(--border)", borderLeft: "none" }}
                      onClick={() => setShowPwd((v) => !v)}>
                      <i className={`bi ${showPwd ? "bi-eye-slash" : "bi-eye"}`} />
                    </button>
                  </div>
                  {newPwd && <PasswordStrength value={newPwd} />}
                </div>

                <div className="mb-4">
                  <label className="form-label" htmlFor="confirm-pwd">Confirmar contraseña</label>
                  <input
                    id="confirm-pwd" type="password" className="form-control"
                    placeholder="Repite la contraseña"
                    value={confirmPwd} onChange={(e) => setConfirm(e.target.value)} required />
                  {confirmPwd && newPwd !== confirmPwd && (
                    <div style={{ fontSize: 11.5, color: "var(--danger)", marginTop: 4, fontWeight: 600 }}>
                      <i className="bi bi-x-circle me-1" />Las contraseñas no coinciden
                    </div>
                  )}
                  {confirmPwd && newPwd === confirmPwd && (
                    <div style={{ fontSize: 11.5, color: "var(--accent)", marginTop: 4, fontWeight: 600 }}>
                      <i className="bi bi-check-circle me-1" />Las contraseñas coinciden
                    </div>
                  )}
                </div>

                <button type="submit" className="btn-accent w-100 justify-content-center" disabled={loading}>
                  {loading
                    ? <><span className="spinner-accent" style={{ width: 16, height: 16 }} /> Verificando...</>
                    : <><i className="bi bi-shield-check" /> Restablecer contraseña</>}
                </button>
              </form>

              <p className="mt-3 text-center" style={{ fontSize: 12.5, color: "var(--muted)" }}>
                ¿No recibiste el código?{" "}
                <button
                  onClick={() => { setStep(STEPS.EMAIL); setToken(["","","",""]); }}
                  style={{ background: "none", border: "none", color: "var(--accent)", fontWeight: 600, cursor: "pointer", fontSize: 12.5, padding: 0 }}>
                  Reenviar
                </button>
              </p>
            </>
          )}

          {/* ── Step 3: success ───────────────────────────────────────── */}
          {step === STEPS.SUCCESS && (
            <div className="text-center">
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: "var(--accent-soft)", display: "grid",
                placeItems: "center", margin: "0 auto 20px", fontSize: 36,
              }}>
                ✅
              </div>
              <h2 style={{ marginBottom: 8 }}>¡Contraseña restablecida!</h2>
              <p style={{ fontSize: 13.5, color: "var(--muted)", marginBottom: 32, lineHeight: 1.6 }}>
                Tu contraseña fue actualizada correctamente.<br />
                Ya puedes iniciar sesión con tu nueva contraseña.
              </p>
              <button
                className="btn-accent w-100 justify-content-center"
                onClick={() => navigate("/login", { replace: true })}>
                <i className="bi bi-arrow-right-circle" /> Ir al login
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function PasswordStrength({ value }) {
  const len   = value.length >= 8;
  const upper = /[A-Z]/.test(value);
  const num   = /[0-9]/.test(value);
  const score = [len, upper, num].filter(Boolean).length;
  const labels = ["Débil", "Regular", "Fuerte"];
  const colors = ["var(--danger)", "var(--warning)", "var(--accent)"];
  const label  = labels[score - 1] ?? "Muy débil";
  const color  = colors[score - 1] ?? "var(--border)";

  return (
    <div style={{ marginTop: 6 }}>
      <div className="d-flex gap-1 mb-1">
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 99,
            background: i < score ? color : "var(--border)",
            transition: "background 0.2s",
          }} />
        ))}
      </div>
      <div style={{ fontSize: 11, color, fontWeight: 600 }}>{label}</div>
    </div>
  );
}
