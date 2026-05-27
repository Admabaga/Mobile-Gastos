import React, { useEffect, useState } from "react";
import { debtService } from "../../../services/debtService";
import { useToast } from "../../../context/ToastContext";

const currency = (n) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency", currency: "MXN", maximumFractionDigits: 0,
  }).format(n ?? 0);

const STATUS_LABEL = { ACTIVE: "Activa", PARTIALLY_PAID: "En curso", SETTLED: "Saldada" };
const STATUS_COLOR = {
  ACTIVE:         "var(--accent)",
  PARTIALLY_PAID: "var(--warning)",
  SETTLED:        "var(--success)",
};

/* ─── Modal base ─────────────────────────────────────────────────── */
function Modal({ title, onClose, children }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(13,12,29,.55)",
        zIndex: 1050,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
        animation: "fadeIn .18s ease",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          borderRadius: "var(--radius-lg)",
          width: "100%", maxWidth: 420,
          boxShadow: "0 16px 48px rgba(13,12,29,.22)",
          overflow: "hidden",
          animation: "fadeUp .2s ease",
        }}
      >
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid var(--border)",
        }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer",
            color: "var(--muted)", fontSize: 18, lineHeight: 1 }}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div style={{ padding: "20px" }}>{children}</div>
      </div>
    </div>
  );
}

/* ─── Pill toggle (Presté / Me prestaron) ─────────────────────── */
function TypeToggle({ value, onChange }) {
  const btn = (v, label, icon) => (
    <button
      type="button"
      onClick={() => onChange(v)}
      style={{
        flex: 1, border: "none", cursor: "pointer",
        padding: "8px 12px", borderRadius: "calc(var(--radius-sm) - 2px)",
        fontSize: 13, fontWeight: 600,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        transition: "background .15s, color .15s",
        background: value === v ? "var(--surface)" : "transparent",
        color:      value === v ? "var(--text)"    : "var(--muted)",
        boxShadow:  value === v ? "var(--shadow-sm)" : "none",
      }}
    >
      <i className={`bi ${icon}`} /> {label}
    </button>
  );
  return (
    <div style={{
      display: "flex",
      background: "var(--border)",
      borderRadius: "var(--radius-sm)",
      padding: 3, gap: 2,
      marginBottom: 16,
    }}>
      {btn("LENT",     "Presté",       "bi-arrow-up-circle")}
      {btn("BORROWED", "Me prestaron", "bi-arrow-down-circle")}
    </div>
  );
}

/* ─── Modal: nueva deuda ─────────────────────────────────────────── */
function NewDebtModal({ onClose, onCreated }) {
  const { push } = useToast();
  const [form, setForm] = useState({ type: "LENT", counterpartName: "", totalAmount: "", description: "" });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    if (!form.counterpartName || !form.totalAmount) return push("Completa los campos obligatorios", "warning");
    setLoading(true);
    try {
      const debt = await debtService.create({ ...form, totalAmount: parseFloat(form.totalAmount) });
      onCreated(debt);
      push("Deuda registrada", "success");
      onClose();
    } catch { push("Error al registrar", "danger"); }
    finally { setLoading(false); }
  }

  return (
    <Modal title="Nueva deuda / préstamo" onClose={onClose}>
      <form onSubmit={submit}>
        <TypeToggle value={form.type} onChange={(v) => setForm((f) => ({ ...f, type: v }))} />
        <div className="card-g p-3 mb-3" style={{ fontSize: 12, color: "var(--text-light)", boxShadow: "none" }}>
          {form.type === "LENT"
            ? "💸 Salió de tu bolsillo. Se sumará a tus finanzas."
            : "📥 Recibiste dinero. No afecta tus gastos personales."}
        </div>
        <div className="mb-3">
          <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>
            {form.type === "LENT" ? "¿A quién le prestaste?" : "¿Quién te prestó?"}
          </label>
          <input className="form-control" placeholder="Nombre" value={form.counterpartName} onChange={set("counterpartName")} required />
        </div>
        <div className="mb-3">
          <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>Monto</label>
          <input className="form-control" type="number" placeholder="0" value={form.totalAmount} onChange={set("totalAmount")} required />
        </div>
        <div className="mb-4">
          <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>Descripción (opcional)</label>
          <input className="form-control" placeholder="Ej: para el viaje" value={form.description} onChange={set("description")} />
        </div>
        <button className="btn btn-primary w-100" style={{ background: "var(--accent)", border: "none", fontWeight: 700 }} disabled={loading}>
          {loading ? "Guardando…" : "Registrar"}
        </button>
      </form>
    </Modal>
  );
}

/* ─── Modal: registrar pago ──────────────────────────────────────── */
function PaymentModal({ debt, onClose, onUpdated }) {
  const { push } = useToast();
  const [amount, setAmount] = useState("");
  const [notes,  setNotes]  = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!amount) return;
    setLoading(true);
    try {
      const updated = await debtService.addPayment(debt.id, { amount: parseFloat(amount), notes });
      onUpdated(updated);
      push("Pago registrado", "success");
      onClose();
    } catch { push("Error al registrar el pago", "danger"); }
    finally { setLoading(false); }
  }

  return (
    <Modal title={debt.type === "LENT" ? `${debt.counterpartName} pagó` : `Pagué a ${debt.counterpartName}`} onClose={onClose}>
      <form onSubmit={submit}>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
          Pendiente: <strong style={{ color: "var(--text)" }}>{currency(debt.remainingAmount)}</strong>
        </p>
        <div className="mb-3">
          <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>Monto del pago</label>
          <input className="form-control" type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>Notas (opcional)</label>
          <input className="form-control" placeholder="Ej: transferencia Nequi" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <button className="btn btn-primary w-100" style={{ background: "var(--accent)", border: "none", fontWeight: 700 }} disabled={loading}>
          {loading ? "Guardando…" : "Registrar pago"}
        </button>
      </form>
    </Modal>
  );
}

/* ─── Modal: historial de pagos ──────────────────────────────────── */
function HistoryModal({ debt, onClose }) {
  return (
    <Modal title={`Historial — ${debt.counterpartName}`} onClose={onClose}>
      {!debt.payments?.length ? (
        <div className="empty-state" style={{ padding: "24px 0" }}>
          <i className="bi bi-clock-history d-block" style={{ fontSize: 32, marginBottom: 8 }} />
          <p style={{ margin: 0 }}>Sin pagos registrados</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {debt.payments.map((p) => (
            <div key={p.id} className="gasto-item" style={{ borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", padding: "12px 16px" }}>
              <div className="gasto-icon" style={{ background: "rgba(34,197,94,.12)", color: "var(--success)" }}>
                <i className="bi bi-check-circle" />
              </div>
              <div style={{ flex: 1 }}>
                <div className="gasto-name">{currency(p.amount)}</div>
                {p.notes && <div className="gasto-meta">{p.notes}</div>}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{p.date}</div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

/* ─── Tarjeta de deuda ───────────────────────────────────────────── */
function DebtCard({ debt, onPayment, onSettle, onHistory }) {
  const isLent    = debt.type === "LENT";
  const isSettled = debt.status === "SETTLED";
  const pct       = Math.min(100, ((debt.paidAmount ?? 0) / debt.totalAmount) * 100);

  const iconBg    = isLent ? "rgba(34,197,94,.12)"  : "rgba(239,68,68,.10)";
  const iconColor = isLent ? "var(--success)"        : "var(--danger)";
  const iconName  = isLent ? "bi-arrow-up-circle"    : "bi-arrow-down-circle";
  const typeLabel = isLent ? "Presté"                : "Me prestaron";

  return (
    <div className="card-g" style={{ overflow: "hidden" }}>
      {/* Main row */}
      <div
        className="gasto-item"
        style={{ cursor: "pointer", borderBottom: isSettled ? "none" : "1px solid var(--border)" }}
        onClick={() => onHistory(debt)}
      >
        <div className="gasto-icon" style={{ background: iconBg, color: iconColor }}>
          <i className={`bi ${iconName}`} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="gasto-name">{debt.counterpartName}</div>
          <div className="gasto-meta d-flex flex-wrap gap-2 mt-1">
            <span className={`badge-g ${isLent ? "green" : "red"}`} style={{ background: iconBg, color: iconColor }}>
              {typeLabel}
            </span>
            <span className="badge-g gray">{STATUS_LABEL[debt.status]}</span>
            {debt.description && <span className="badge-g gray">{debt.description}</span>}
          </div>
          {/* Barra de progreso */}
          {!isSettled && (
            <div style={{ marginTop: 8 }}>
              <div style={{ height: 4, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`,
                  background: isLent ? "var(--success)" : "var(--accent)",
                  borderRadius: 4, transition: "width .4s" }} />
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>
                Pagado {pct.toFixed(0)}% · Pendiente {currency(debt.remainingAmount)}
              </div>
            </div>
          )}
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div className="gasto-amount">{currency(debt.totalAmount)}</div>
          {isSettled && (
            <div style={{ fontSize: 11, color: "var(--success)", fontWeight: 600, marginTop: 2 }}>✓ Saldada</div>
          )}
        </div>
      </div>

      {/* Acciones */}
      {!isSettled && (
        <div style={{ display: "flex", gap: 0, borderTop: "1px solid var(--border)" }}>
          <button
            onClick={() => onPayment(debt)}
            style={{ flex: 1, border: "none", background: "none", padding: "10px", fontSize: 13,
              fontWeight: 600, color: "var(--accent)", cursor: "pointer",
              borderRight: "1px solid var(--border)", transition: "background .15s" }}
            onMouseEnter={(e) => (e.target.style.background = "var(--surface-alt)")}
            onMouseLeave={(e) => (e.target.style.background = "none")}
          >
            <i className="bi bi-plus-circle me-1" />Registrar pago
          </button>
          <button
            onClick={() => onSettle(debt.id)}
            style={{ flex: 1, border: "none", background: "none", padding: "10px", fontSize: 13,
              fontWeight: 600, color: "var(--success)", cursor: "pointer", transition: "background .15s" }}
            onMouseEnter={(e) => (e.target.style.background = "rgba(34,197,94,.06)")}
            onMouseLeave={(e) => (e.target.style.background = "none")}
          >
            <i className="bi bi-check-circle me-1" />Saldar
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Página principal ───────────────────────────────────────────── */
export default function DebtsPage() {
  const { push }      = useToast();
  const [debts, setDebts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("all");
  const [typeFilter, setTypeFilter] = useState("ALL"); // ALL | LENT | BORROWED
  const [search, setSearch]   = useState("");
  const [showNew, setShowNew]     = useState(false);
  const [payTarget, setPayTarget] = useState(null);
  const [histTarget, setHistTarget] = useState(null);

  async function load() {
    setLoading(true);
    try { setDebts(await debtService.list()); }
    catch { push("Error cargando deudas", "danger"); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleSettle(id) {
    try {
      const updated = await debtService.settle(id);
      setDebts((ds) => ds.map((d) => (d.id === id ? updated : d)));
      push("Deuda saldada ✓", "success");
    } catch { push("Error al saldar", "danger"); }
  }

  function handleUpdated(updated) {
    setDebts((ds) => ds.map((d) => (d.id === updated.id ? updated : d)));
  }

  const filtered = debts.filter((d) => {
    if (filter === "active"  && d.status === "SETTLED") return false;
    if (filter === "settled" && d.status !== "SETTLED") return false;
    if (typeFilter !== "ALL" && d.type !== typeFilter)  return false;
    if (search && !d.counterpartName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const lentTotal     = debts.filter((d) => d.type === "LENT"     && d.status !== "SETTLED").reduce((s, d) => s + d.remainingAmount, 0);
  const borrowedTotal = debts.filter((d) => d.type === "BORROWED" && d.status !== "SETTLED").reduce((s, d) => s + d.remainingAmount, 0);
  const net           = lentTotal - borrowedTotal;

  const TABS = [
    { id: "all",     label: "Todas" },
    { id: "active",  label: "Activas" },
    { id: "settled", label: "Saldadas" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", marginBottom: 2 }}>
            Deudas y préstamos
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
            Lleva el control de lo que te deben y lo que debes.
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          style={{
            background: "var(--accent)", color: "#fff", border: "none",
            borderRadius: "var(--radius-sm)", padding: "9px 18px",
            fontSize: 14, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          <i className="bi bi-plus-lg" />Nueva
        </button>
      </div>

      {/* Stat cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="stat-card">
            <div className="stat-icon green"><i className="bi bi-arrow-up-circle" /></div>
            <div>
              <div className="stat-label">Te deben</div>
              <div className="stat-value" style={{ fontSize: 20 }}>{currency(lentTotal)}</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="stat-card">
            <div className="stat-icon red"><i className="bi bi-arrow-down-circle" /></div>
            <div>
              <div className="stat-label">Debes</div>
              <div className="stat-value" style={{ fontSize: 20 }}>{currency(borrowedTotal)}</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: net >= 0 ? "rgba(34,197,94,.12)" : "rgba(239,68,68,.12)", color: net >= 0 ? "var(--success)" : "var(--danger)" }}>
              <i className="bi bi-balance-scale" />
            </div>
            <div>
              <div className="stat-label">Neto a favor</div>
              <div className="stat-value" style={{ fontSize: 20, color: net >= 0 ? "var(--success)" : "var(--danger)" }}>
                {currency(Math.abs(net))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Barra de filtros ─────────────────────────────────── */}
      <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
        {/* Búsqueda */}
        <div style={{ flex: 1, minWidth: 180, position: "relative" }}>
          <i className="bi bi-search" style={{
            position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
            color: "var(--muted)", fontSize: 13, pointerEvents: "none",
          }} />
          <input
            className="form-control"
            style={{ fontSize: 13, paddingLeft: 30 }}
            placeholder="Buscar por nombre…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {/* Tipo */}
        <div style={{ display: "flex", background: "var(--border)", borderRadius: "var(--radius-sm)", padding: 3, gap: 2 }}>
          {[["ALL","Todos"],["LENT","Presté"],["BORROWED","Me prestaron"]].map(([v, l]) => (
            <button key={v} onClick={() => setTypeFilter(v)}
              style={{ border: "none", cursor: "pointer", padding: "6px 12px",
                borderRadius: "calc(var(--radius-sm) - 2px)", fontSize: 12.5, fontWeight: 600,
                background: typeFilter === v ? "var(--surface)" : "transparent",
                color:      typeFilter === v ? "var(--text)"    : "var(--muted)",
                boxShadow:  typeFilter === v ? "var(--shadow-sm)" : "none",
                transition: "all .15s" }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Resumen filtrado */}
      {(search || typeFilter !== "ALL") && filtered.length > 0 && (() => {
        const fLent     = filtered.filter(d => d.type === "LENT"     && d.status !== "SETTLED").reduce((s, d) => s + d.remainingAmount, 0);
        const fBorrowed = filtered.filter(d => d.type === "BORROWED" && d.status !== "SETTLED").reduce((s, d) => s + d.remainingAmount, 0);
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, padding: "10px 16px", marginBottom: 16,
            background: "var(--surface-alt)", borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)", fontSize: 13 }}>
            <span><span style={{ color: "var(--muted)" }}>Resultados: </span><strong>{filtered.length}</strong></span>
            {fLent     > 0 && <span><span style={{ color: "var(--muted)" }}>Por cobrar: </span><strong style={{ color: "var(--success)" }}>{currency(fLent)}</strong></span>}
            {fBorrowed > 0 && <span><span style={{ color: "var(--muted)" }}>Por pagar: </span><strong style={{ color: "var(--danger)" }}>{currency(fBorrowed)}</strong></span>}
          </div>
        );
      })()}

      {/* Tabs pill */}
      <div style={{ display: "flex", background: "var(--border)", borderRadius: "var(--radius-sm)", padding: 3, gap: 2, marginBottom: 20, width: "fit-content" }}>
        {TABS.map((t) => (
          <button
            key={t.id} onClick={() => setFilter(t.id)}
            style={{
              border: "none", cursor: "pointer",
              padding: "7px 16px", borderRadius: "calc(var(--radius-sm) - 2px)",
              fontSize: 13, fontWeight: 600, transition: "background .15s, color .15s",
              background: filter === t.id ? "var(--surface)" : "transparent",
              color:      filter === t.id ? "var(--text)"    : "var(--muted)",
              boxShadow:  filter === t.id ? "var(--shadow-sm)" : "none",
            }}
          >{t.label}</button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="card-g p-4">
          {[1,2,3].map((n) => (
            <div key={n} className="gasto-item" style={{ opacity: 0.4 }}>
              <div className="gasto-icon" style={{ background: "var(--border)" }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 12, background: "var(--border)", borderRadius: 4, width: "40%", marginBottom: 6 }} />
                <div style={{ height: 10, background: "var(--border)", borderRadius: 4, width: "25%" }} />
              </div>
              <div style={{ height: 14, background: "var(--border)", borderRadius: 4, width: 70 }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-g">
          <div className="empty-state">
            <i className="bi bi-journal-x d-block" />
            <p>{filter === "settled" ? "No hay deudas saldadas aún." : "No tienes deudas activas."}</p>
            {filter !== "settled" && (
              <button
                onClick={() => setShowNew(true)}
                style={{ background: "var(--accent)", color: "#fff", border: "none",
                  borderRadius: "var(--radius-sm)", padding: "9px 18px",
                  fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                Registrar primera
              </button>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((d) => (
            <DebtCard key={d.id} debt={d}
              onPayment={setPayTarget}
              onSettle={handleSettle}
              onHistory={setHistTarget}
            />
          ))}
        </div>
      )}

      {showNew    && <NewDebtModal  onClose={() => setShowNew(false)}    onCreated={(d) => setDebts((p) => [d, ...p])} />}
      {payTarget  && <PaymentModal  debt={payTarget}  onClose={() => setPayTarget(null)}  onUpdated={handleUpdated} />}
      {histTarget && <HistoryModal  debt={histTarget} onClose={() => setHistTarget(null)} />}
    </div>
  );
}
