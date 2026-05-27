import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { profileService } from "../../../services/profileService";
import { whatsappService } from "../../../services/whatsappService";
import { getErrorMessage } from "../../../lib/apiClient";

const MONTHS = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];

function formatDate(d) {
  if (!d) return "—";
  const [y, m, day] = String(d).split("-");
  return `${Number(day)} ${MONTHS[Number(m)-1]} ${y}`;
}

export default function ProfilePage() {
  const { auth } = useAuth();
  const { push } = useToast();

  const [profile, setProfile]         = useState(null);
  const [loadingProfile, setLoading]  = useState(true);

  const [info, setInfo]         = useState({ name: "", city: "", phone: "" });
  const [savingInfo, setSaving] = useState(false);

  const [pwd, setPwd]               = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [showPwds, setShowPwds]     = useState({ current: false, newPwd: false });
  const [savingPwd, setSavingPwd]   = useState(false);

  useEffect(() => {
    profileService.get()
      .then((data) => {
        setProfile(data);
        setInfo({ name: data.name ?? "", city: data.city ?? "", phone: data.phone ?? "" });
      })
      .catch(() => push("No se pudo cargar el perfil", "error"))
      .finally(() => setLoading(false));
  }, []);

  async function onSaveInfo(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await profileService.update({ name: info.name, city: info.city, phone: info.phone });
      setProfile(updated);
      push("Perfil actualizado correctamente ✓", "success");
    } catch (err) {
      push(getErrorMessage(err, "No se pudo actualizar"), "error");
    } finally {
      setSaving(false);
    }
  }

  async function onSavePwd(e) {
    e.preventDefault();
    if (pwd.newPassword !== pwd.confirm) {
      push("Las contraseñas no coinciden", "warning");
      return;
    }
    if (pwd.newPassword.length < 6) {
      push("Mínimo 6 caracteres", "warning");
      return;
    }
    setSavingPwd(true);
    try {
      await profileService.update({
        name:            info.name,
        currentPassword: pwd.currentPassword,
        newPassword:     pwd.newPassword,
      });
      push("Contraseña actualizada ✓", "success");
      setPwd({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      push(getErrorMessage(err, "No se pudo cambiar la contraseña"), "error");
    } finally {
      setSavingPwd(false);
    }
  }

  const initials = auth?.name
    ? auth.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "?";

  if (loadingProfile) return <ProfileSkeleton />;

  return (
    <div>
      <div className="mb-4">
        <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", marginBottom: 2 }}>Mi Perfil</h1>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
          Gestiona tu información personal y seguridad de cuenta.
        </p>
      </div>

      <div className="row g-4">
        {/* Tarjeta identidad */}
        <div className="col-12 col-lg-4">
          <div className="card-g p-4 text-center">
            <div style={{
              width: 80, height: 80, borderRadius: "50%", background: "var(--accent)",
              display: "grid", placeItems: "center", fontSize: 28, fontWeight: 800,
              color: "#fff", margin: "0 auto 16px",
            }}>
              {initials}
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text)" }}>{profile?.name}</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 3 }}>{profile?.email}</div>

            <hr style={{ borderColor: "var(--border)", margin: "16px 0" }} />

            <div className="d-flex flex-column gap-2" style={{ textAlign: "left" }}>
              <InfoRow icon="bi-geo-alt"    label="Ciudad"         value={profile?.city ?? "—"} />
              <InfoRow icon="bi-phone"      label="Teléfono"       value={profile?.phone ?? "—"} />
              <InfoRow icon="bi-calendar3"  label="Miembro desde"  value={formatDate(profile?.registryDate)} />
            </div>
          </div>
        </div>

        {/* Formularios */}
        <div className="col-12 col-lg-8 d-flex flex-column gap-4">
          {/* Info personal */}
          <div className="card-g p-4">
            <div className="section-title mb-1">Información personal</div>
            <div className="section-sub">Actualiza tu nombre, ciudad y teléfono.</div>

            <form onSubmit={onSaveInfo} noValidate>
              <div className="row g-3 mb-3">
                <div className="col-12">
                  <label className="form-label" htmlFor="p-name">Nombre completo</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-person" /></span>
                    <input id="p-name" className="form-control" value={info.name}
                      onChange={(e) => setInfo((p) => ({ ...p, name: e.target.value }))} required />
                  </div>
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label" htmlFor="p-city">Ciudad</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-geo-alt" /></span>
                    <input id="p-city" className="form-control" value={info.city}
                      placeholder="Tu ciudad"
                      onChange={(e) => setInfo((p) => ({ ...p, city: e.target.value }))} />
                  </div>
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label" htmlFor="p-phone">Teléfono</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-phone" /></span>
                    <input id="p-phone" className="form-control" value={info.phone}
                      placeholder="3001234567"
                      onChange={(e) => setInfo((p) => ({ ...p, phone: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-end">
                <button type="submit" className="btn-accent" disabled={savingInfo}>
                  {savingInfo
                    ? <><span className="spinner-accent" style={{ width: 14, height: 14 }} /> Guardando...</>
                    : <><i className="bi bi-check-circle" /> Guardar cambios</>}
                </button>
              </div>
            </form>
          </div>

          {/* Seguridad */}
          <div className="card-g p-4">
            <div className="section-title mb-1">Seguridad</div>
            <div className="section-sub">Cambia tu contraseña de acceso.</div>

            <form onSubmit={onSavePwd} noValidate>
              <div className="row g-3 mb-3">
                <div className="col-12">
                  <label className="form-label">Contraseña actual</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-lock" /></span>
                    <input type={showPwds.current ? "text" : "password"}
                      className="form-control" placeholder="••••••••"
                      value={pwd.currentPassword}
                      onChange={(e) => setPwd((p) => ({ ...p, currentPassword: e.target.value }))} required />
                    <button type="button" className="input-group-text"
                      style={{ cursor: "pointer", background: "none", border: "1.5px solid var(--border)", borderLeft: "none" }}
                      onClick={() => setShowPwds((p) => ({ ...p, current: !p.current }))}>
                      <i className={`bi ${showPwds.current ? "bi-eye-slash" : "bi-eye"}`} />
                    </button>
                  </div>
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label">Nueva contraseña</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-lock-fill" /></span>
                    <input type={showPwds.newPwd ? "text" : "password"}
                      className="form-control" placeholder="Mínimo 6 caracteres"
                      value={pwd.newPassword}
                      onChange={(e) => setPwd((p) => ({ ...p, newPassword: e.target.value }))} required />
                    <button type="button" className="input-group-text"
                      style={{ cursor: "pointer", background: "none", border: "1.5px solid var(--border)", borderLeft: "none" }}
                      onClick={() => setShowPwds((p) => ({ ...p, newPwd: !p.newPwd }))}>
                      <i className={`bi ${showPwds.newPwd ? "bi-eye-slash" : "bi-eye"}`} />
                    </button>
                  </div>
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label">Confirmar contraseña</label>
                  <input type="password" className="form-control" placeholder="Repite la contraseña"
                    value={pwd.confirm}
                    onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))} required />
                </div>
              </div>

              {pwd.newPassword && <PasswordStrength value={pwd.newPassword} />}

              <div className="d-flex justify-content-end mt-3">
                <button type="submit" className="btn-accent" disabled={savingPwd || !pwd.currentPassword || !pwd.newPassword}>
                  {savingPwd
                    ? <><span className="spinner-accent" style={{ width: 14, height: 14 }} /> Cambiando...</>
                    : <><i className="bi bi-shield-lock" /> Cambiar contraseña</>}
                </button>
              </div>
            </form>
          </div>

          {/* WhatsApp */}
          <WhatsAppLinkCard />

          {/* Cuenta (solo lectura) */}
          <div className="card-g p-4">
            <div className="section-title mb-3">Información de cuenta</div>
            <div className="row g-2">
              <div className="col-12 col-sm-6">
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>
                  Correo electrónico
                </div>
                <div className="d-flex align-items-center gap-2"
                  style={{ background: "var(--surface-alt)", borderRadius: "var(--radius-sm)", padding: "9px 12px", fontSize: 13.5 }}>
                  <i className="bi bi-envelope" style={{ color: "var(--muted)" }} />
                  {profile?.email}
                </div>
              </div>
              <div className="col-12 col-sm-6">
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>
                  Miembro desde
                </div>
                <div className="d-flex align-items-center gap-2"
                  style={{ background: "var(--surface-alt)", borderRadius: "var(--radius-sm)", padding: "9px 12px", fontSize: 13.5 }}>
                  <i className="bi bi-calendar3" style={{ color: "var(--muted)" }} />
                  {formatDate(profile?.registryDate)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── WhatsApp Link Card ───────────────────────────────────────────── */
const BOT_NUMBER = "+57 305 430 5869";

function WhatsAppLinkCard() {
  const { push } = useToast();
  const [status,    setStatus]    = useState({ linked: false, number: "" });
  const [loading,   setLoading]   = useState(true);
  const [code,      setCode]      = useState(null);   // { code, expiryMinutes }
  const [genLoading, setGenLoading] = useState(false);
  const [unlinking,  setUnlinking]  = useState(false);

  function loadStatus() {
    return whatsappService.status()
      .then(setStatus)
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadStatus(); }, []);

  async function generateCode() {
    setGenLoading(true);
    try {
      const res = await whatsappService.generateCode();
      setCode(res);
    } catch (err) {
      push(getErrorMessage(err, "No se pudo generar el código"), "error");
    } finally { setGenLoading(false); }
  }

  async function unlink() {
    if (!window.confirm("¿Desvincular WhatsApp?")) return;
    setUnlinking(true);
    try {
      await whatsappService.unlink();
      setStatus({ linked: false, number: "" });
      setCode(null);
      push("WhatsApp desvinculado", "info");
    } catch (err) {
      push(getErrorMessage(err, "Error al desvincular"), "error");
    } finally { setUnlinking(false); }
  }

  if (loading) return <div className="card-g p-4" style={{ height: 120, opacity: 0.4 }} />;

  return (
    <div className="card-g p-4" style={{
      background: status.linked
        ? "linear-gradient(135deg, rgba(37,211,102,.06) 0%, var(--surface) 60%)"
        : "var(--surface)",
      borderColor: status.linked ? "rgba(37,211,102,.3)" : "var(--border)",
    }}>
      {/* Header */}
      <div className="d-flex align-items-start justify-content-between mb-3 gap-3 flex-wrap">
        <div>
          <div className="section-title mb-1">
            <i className="bi bi-whatsapp" style={{ color: "#25D366", marginRight: 8 }} />
            Bot de WhatsApp
          </div>
          <div className="section-sub" style={{ marginBottom: 0 }}>
            Registra gastos y recibe reportes enviando mensajes al bot.
          </div>
        </div>
        <span className={`badge-g ${status.linked ? "green" : "gray"}`} style={{ flexShrink: 0 }}>
          {status.linked
            ? <><i className="bi bi-check-circle-fill" /> Vinculado</>
            : <><i className="bi bi-circle" /> Sin vincular</>}
        </span>
      </div>

      {status.linked ? (
        /* ── Vinculado ── */
        <div>
          <div style={{
            background: "rgba(37,211,102,.1)", border: "1px solid rgba(37,211,102,.25)",
            borderRadius: "var(--radius-sm)", padding: "12px 16px",
            display: "flex", alignItems: "center", gap: 10, marginBottom: 14,
          }}>
            <i className="bi bi-shield-check" style={{ color: "#25D366", fontSize: 18 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Tu número está conectado</div>
              {status.number && (
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                  Número: <strong>{status.number}</strong>
                </div>
              )}
            </div>
          </div>
          <button onClick={unlink} disabled={unlinking} className="btn-outline-g"
            style={{ borderColor: "var(--danger)", color: "var(--danger)", fontSize: 13 }}>
            <i className="bi bi-x-circle" /> {unlinking ? "Desvinculando…" : "Desvincular"}
          </button>
        </div>
      ) : (
        /* ── Sin vincular ── */
        <div>
          {!code ? (
            /* Paso 1 — generar código */
            <div>
              <div style={{
                background: "var(--surface-alt)", borderRadius: "var(--radius-sm)",
                padding: "12px 14px", marginBottom: 14, fontSize: 12.5,
                color: "var(--text-light)", lineHeight: 1.6,
              }}>
                <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
                  Cómo vincular tu número:
                </div>
                <ol style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
                  <li>Genera un código de 6 dígitos con el botón de abajo.</li>
                  <li>
                    Abre WhatsApp y escribe al bot{" "}
                    <strong style={{ color: "var(--text)" }}>{BOT_NUMBER}</strong>.
                  </li>
                  <li>Envía el código. El bot confirma la vinculación automáticamente.</li>
                </ol>
              </div>
              <button onClick={generateCode} disabled={genLoading} className="btn-accent"
                style={{ fontSize: 13 }}>
                {genLoading
                  ? <><span className="spinner-accent" style={{ width: 13, height: 13 }} /> Generando…</>
                  : <><i className="bi bi-qr-code me-1" /> Generar código</>}
              </button>
            </div>
          ) : (
            /* Paso 2 — mostrar código */
            <div>
              <div style={{ fontSize: 12.5, color: "var(--text-light)", marginBottom: 10 }}>
                Envía este código al bot{" "}
                <strong style={{ color: "var(--text)" }}>{BOT_NUMBER}</strong>{" "}
                por WhatsApp (expira en {code.expiryMinutes} min):
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: 12, marginBottom: 14,
              }}>
                <div style={{
                  fontSize: 36, fontWeight: 900, letterSpacing: 8,
                  color: "var(--accent)", fontFamily: "monospace",
                  background: "var(--surface-alt)", padding: "10px 20px",
                  borderRadius: "var(--radius-sm)", border: "2px dashed var(--accent)",
                }}>
                  {code.code}
                </div>
                <button type="button" onClick={() => {
                  navigator.clipboard.writeText(code.code);
                  push("Código copiado", "info");
                }} style={{ background: "none", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)", padding: "8px 12px",
                  cursor: "pointer", color: "var(--muted)", fontSize: 16 }}>
                  <i className="bi bi-clipboard" />
                </button>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                <button onClick={() => { setCode(null); loadStatus(); }}
                  className="btn-accent" style={{ fontSize: 13 }}>
                  <i className="bi bi-arrow-clockwise me-1" /> Ya lo envié — verificar
                </button>
                <button onClick={() => setCode(null)} className="btn-outline-g" style={{ fontSize: 13 }}>
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="d-flex align-items-center gap-2" style={{ fontSize: 13 }}>
      <i className={`bi ${icon}`} style={{ color: "var(--accent)", width: 16, flexShrink: 0 }} />
      <span style={{ color: "var(--muted)", minWidth: 80 }}>{label}</span>
      <span style={{ color: "var(--text)", fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function PasswordStrength({ value }) {
  const len   = value.length >= 8;
  const upper = /[A-Z]/.test(value);
  const num   = /[0-9]/.test(value);
  const score = [len, upper, num].filter(Boolean).length;
  const label = ["Débil", "Regular", "Fuerte"][score - 1] ?? "Muy débil";
  const color = ["var(--danger)", "var(--warning)", "var(--accent)"][score - 1] ?? "var(--border)";

  return (
    <div style={{ marginBottom: 4 }}>
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

function ProfileSkeleton() {
  return (
    <div className="row g-4" style={{ opacity: 0.5 }}>
      <div className="col-12 col-lg-4">
        <div className="card-g p-4 text-center">
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--border)", margin: "0 auto 16px" }} />
          <div style={{ height: 16, background: "var(--border)", borderRadius: 4, width: "60%", margin: "0 auto 8px" }} />
          <div style={{ height: 12, background: "var(--border)", borderRadius: 4, width: "80%", margin: "0 auto" }} />
        </div>
      </div>
      <div className="col-12 col-lg-8">
        <div className="card-g p-4" style={{ height: 200 }} />
      </div>
    </div>
  );
}
