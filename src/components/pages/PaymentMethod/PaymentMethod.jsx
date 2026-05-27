import React, { useState } from "react";
import { useForm } from "../../../hooks/useForm";
import { useFetch } from "../../../hooks/useFetch";
import { useMutation } from "../../../hooks/useMutation";
import { paymentMethodService } from "../../../services/paymentMethodService";
import { useToast } from "../../../context/ToastContext";

const INITIAL = { name: "", value: "", description: "" };

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency", currency: "MXN", maximumFractionDigits: 0,
});

const METHOD_ICONS = {
  efectivo:     "bi-cash",
  débito:       "bi-credit-card",
  debito:       "bi-credit-card",
  crédito:      "bi-credit-card-2-front",
  credito:      "bi-credit-card-2-front",
  transferencia:"bi-bank",
  paypal:       "bi-paypal",
};

function getMethodIcon(name) {
  const lower = (name ?? "").toLowerCase();
  for (const [key, icon] of Object.entries(METHOD_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return "bi-wallet2";
}

export default function PaymentMethod() {
  const [tab, setTab] = useState("lista");
  const { push } = useToast();
  const { values, handleChange, reset } = useForm(INITIAL);

  const { data: methods, loading: loadingList, refetch } = useFetch(
    () => paymentMethodService.list(), [], { initialData: [] }
  );

  const { mutate, loading: saving } = useMutation((payload) =>
    paymentMethodService.create({
      name:        payload.name,
      value:       Number(payload.value) || null,
      description: payload.description || null,
    })
  );

  async function onSubmit(e) {
    e.preventDefault();
    const result = await mutate(values);
    if (result.ok) {
      push("Método de pago registrado ✓", "success");
      reset();
      refetch();
      setTab("lista");
    } else {
      push(result.error ?? "No se pudo guardar", "error");
    }
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", marginBottom: 2 }}>
            Métodos de Pago
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
            Centraliza los medios con los que realizas tus pagos.
          </p>
        </div>
        <div style={{ display: "flex", background: "var(--border)", borderRadius: "var(--radius-sm)", padding: 3, gap: 2 }}>
          {[
            { id: "lista",     icon: "bi-credit-card", label: "Ver métodos" },
            { id: "registrar", icon: "bi-plus-circle",  label: "Registrar"  },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                border: "none", cursor: "pointer", padding: "7px 16px",
                borderRadius: "calc(var(--radius-sm) - 2px)", fontSize: 13, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 6,
                background: tab === t.id ? "var(--surface)" : "transparent",
                color: tab === t.id ? "var(--text)" : "var(--muted)",
                boxShadow: tab === t.id ? "var(--shadow-sm)" : "none",
              }}>
              <i className={`bi ${t.icon}`} aria-hidden="true" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "lista" && (
        <div>
          <div className="d-flex justify-content-end mb-3">
            <button className="btn-outline-g" onClick={refetch} disabled={loadingList}>
              <i className="bi bi-arrow-clockwise" /> Refrescar
            </button>
          </div>

          {loadingList && (
            <div className="card-g p-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="gasto-item" style={{ opacity: 0.4 }}>
                  <div className="gasto-icon" style={{ background: "var(--border)" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 12, background: "var(--border)", borderRadius: 4, width: "40%", marginBottom: 6 }} />
                    <div style={{ height: 10, background: "var(--border)", borderRadius: 4, width: "25%" }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loadingList && methods.length === 0 && (
            <div className="card-g">
              <div className="empty-state">
                <i className="bi bi-credit-card d-block" />
                <p>Aún no tienes métodos de pago registrados.</p>
              </div>
            </div>
          )}

          {!loadingList && methods.length > 0 && (
            <div className="row g-3">
              {methods.map((m) => (
                <div className="col-12 col-sm-6 col-lg-4" key={m.id}>
                  <div className="card-g p-4 d-flex align-items-center gap-3">
                    <div className="stat-icon blue" style={{ borderRadius: "var(--radius-sm)" }}>
                      <i className={`bi ${getMethodIcon(m.name)}`} aria-hidden="true" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                        {m.name}
                      </div>
                      {m.description && (
                        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{m.description}</div>
                      )}
                      {m.value != null && m.value > 0 && (
                        <span className="badge-g green" style={{ marginTop: 6 }}>
                          {currency.format(m.value)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "registrar" && (
        <div className="card-g p-4 p-md-5" style={{ maxWidth: 520 }}>
          <div className="section-title mb-1">Nuevo método de pago</div>
          <div className="section-sub">Agrega un medio de pago a tu cuenta.</div>

          <form onSubmit={onSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label" htmlFor="pm-name">Nombre del método *</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-credit-card" /></span>
                <input id="pm-name" name="name" className="form-control"
                  placeholder="Ej. Tarjeta de débito" value={values.name}
                  onChange={handleChange} required />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="pm-value">Límite / Saldo (opcional)</label>
              <div className="input-group">
                <span className="input-group-text">$</span>
                <input id="pm-value" name="value" type="number" min="0" step="0.01"
                  className="form-control" placeholder="0.00"
                  value={values.value} onChange={handleChange} />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label" htmlFor="pm-desc">Descripción</label>
              <textarea id="pm-desc" name="description" className="form-control"
                rows={2} placeholder="Notas adicionales..."
                value={values.description} onChange={handleChange} />
            </div>

            <button type="submit" className="btn-accent w-100 justify-content-center" disabled={saving}>
              {saving
                ? <><span className="spinner-accent" style={{ width: 16, height: 16 }} /> Guardando...</>
                : <><i className="bi bi-check-circle" /> Guardar método</>}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
