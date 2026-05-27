import React, { useMemo, useState } from "react";
import { useFetch } from "../../../hooks/useFetch";
import { useAuth } from "../../../context/AuthContext";
import { expenseService } from "../../../services/expenseService";
import { groupService } from "../../../services/groupService";
import { debtService } from "../../../services/debtService";

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency", currency: "MXN", maximumFractionDigits: 0,
});

function formatDate(value) {
  if (!value) return "";
  const [y, m, d] = String(value).split("-");
  if (!y || !m || !d) return value;
  return new Date(Number(y), Number(m) - 1, Number(d))
    .toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "2-digit" });
}

const PERIODS = [
  { id: "all",   label: "Todo",      icon: "bi-infinity" },
  { id: "week",  label: "Semana",    icon: "bi-calendar-week" },
  { id: "month", label: "Mes",       icon: "bi-calendar-month" },
  { id: "year",  label: "Año",       icon: "bi-calendar3" },
  { id: "custom",label: "Personalizado", icon: "bi-sliders" },
];

const SORTS = [
  { id: "date_desc",   label: "Más recientes" },
  { id: "date_asc",    label: "Más antiguos" },
  { id: "amount_desc", label: "Mayor monto" },
  { id: "amount_asc",  label: "Menor monto" },
];

const SOURCES = [
  { id: "all",       label: "Todos",    icon: "bi-collection" },
  { id: "personal",  label: "Personal", icon: "bi-person",      color: "var(--accent)" },
  { id: "group",     label: "Grupos",   icon: "bi-people",      color: "var(--info)" },
  { id: "debt",      label: "Deudas",   icon: "bi-arrow-left-right", color: "var(--warning)" },
];

const SOURCE_META = {
  personal:      { color: "var(--accent)",  bg: "rgba(124,111,247,.12)", icon: "bi-person",      label: "Personal" },
  group:         { color: "var(--info)",    bg: "rgba(59,130,246,.12)",  icon: "bi-people",      label: "Grupo" },
  debt_lent:     { color: "var(--warning)", bg: "rgba(245,158,11,.12)",  icon: "bi-arrow-up",    label: "Préstamo" },
  debt_payment:  { color: "var(--danger)",  bg: "rgba(239,68,68,.12)",   icon: "bi-arrow-down",  label: "Pago deuda" },
};

function inRange(dateStr, period, customFrom, customTo) {
  if (!dateStr) return false;
  const [y, m, d] = String(dateStr).split("-").map(Number);
  if (!y || !m || !d) return false;
  const date = new Date(y, m - 1, d);
  const now  = new Date();
  now.setHours(0, 0, 0, 0);

  if (period === "all") return true;
  if (period === "week") {
    const start = new Date(now); start.setDate(now.getDate() - 6);
    return date >= start && date <= now;
  }
  if (period === "month") {
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  }
  if (period === "year") {
    return date.getFullYear() === now.getFullYear();
  }
  if (period === "custom") {
    const from = customFrom ? new Date(customFrom) : null;
    const to   = customTo   ? new Date(customTo)   : null;
    if (from && date < from) return false;
    if (to   && date > to)   return false;
    return true;
  }
  return true;
}

export default function ExpenseList() {
  const { auth } = useAuth();
  const { data: spents, loading, error, refetch } = useFetch(() => expenseService.list(), []);
  const { data: groups,  refetch: refetchGroups } = useFetch(() => groupService.list(), []);
  const { data: debts,   refetch: refetchDebts  } = useFetch(() => debtService.list(), []);

  const [search, setSearch]       = useState("");
  const [period, setPeriod]       = useState("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo,   setCustomTo]   = useState("");
  const [category, setCategory]   = useState("");
  const [method,   setMethod]     = useState("");
  const [source,   setSource]     = useState("all");
  const [sort,     setSort]       = useState("date_desc");

  // ── Construir movimientos unificados ──────────────────────
  const movements = useMemo(() => {
    const out = [];

    // 1. Gastos personales
    (spents ?? []).forEach((s) => {
      out.push({
        id: `p-${s.id}`,
        source: "personal",
        sourceLabel: "Personal",
        name: s.name,
        date: s.date,
        amount: s.amount ?? 0,
        categoryName: s.categoryName,
        categoryIcon: s.categoryIcon,
        paymentMethodName: s.paymentMethodName,
      });
    });

    // 2. Gastos grupales — efectivo según mismo cálculo del summary
    (groups ?? []).forEach((g) => {
      const myMember = g.members?.find((m) => m.userId === auth?.id);
      if (!myMember) return;
      (g.expenses ?? []).forEach((exp) => {
        const iAmPayer = exp.paidByMemberId === myMember.id;
        const mySplit  = exp.splits?.find((s) => s.memberId === myMember.id);
        let amount = 0;
        let pendiente = false;

        if (iAmPayer) {
          // total - lo saldado por otros
          const settledByOthers = (exp.splits ?? [])
            .filter((s) => s.memberId !== myMember.id && s.settled)
            .reduce((a, s) => a + (s.shareAmount ?? 0), 0);
          amount = (exp.totalAmount ?? 0) - settledByOthers;
        } else if (mySplit) {
          // si pagó otro, mi cuota cuenta solo si la saldé
          amount = mySplit.shareAmount ?? 0;
          pendiente = !mySplit.settled;
        } else {
          return; // no participo en este split
        }

        out.push({
          id: `g-${exp.id}`,
          source: "group",
          sourceLabel: `Grupo: ${g.name}`,
          name: exp.description,
          date: exp.date,
          amount,
          categoryName: exp.category,
          categoryIcon: "bi-people",
          paymentMethodName: iAmPayer ? "Pagado por ti" : `Pagado por ${exp.paidByMemberName}`,
          pendiente,
        });
      });
    });

    // 3. Deudas — LENT como salida; pagos recibidos como devolución
    (debts ?? []).forEach((d) => {
      if (d.type === "LENT") {
        // Yo presté → salida en la fecha de creación
        out.push({
          id: `d-${d.id}`,
          source: "debt_lent",
          sourceLabel: `Préstamo a ${d.counterpartName}`,
          name: d.description || `Préstamo a ${d.counterpartName}`,
          date: d.date,
          amount: d.totalAmount ?? 0,
          categoryName: "Préstamo",
          categoryIcon: "bi-arrow-up-circle",
          paymentMethodName: d.status === "SETTLED" ? "Cobrado" : "Por cobrar",
          pendiente: d.status !== "SETTLED",
        });
      } else if (d.type === "BORROWED") {
        // Pagos hechos por mí para devolverlo cuentan como gasto
        (d.payments ?? []).forEach((p) => {
          out.push({
            id: `dp-${d.id}-${p.id}`,
            source: "debt_payment",
            sourceLabel: `Pago a ${d.counterpartName}`,
            name: p.notes || `Pago: ${d.description || d.counterpartName}`,
            date: p.date,
            amount: p.amount ?? 0,
            categoryName: "Pago de deuda",
            categoryIcon: "bi-arrow-down-circle",
            paymentMethodName: d.counterpartName,
          });
        });
      }
    });

    return out;
  }, [spents, groups, debts, auth?.id]);

  // Catálogos a partir de los datos
  const categories = useMemo(() => {
    const set = new Set();
    movements.forEach((s) => s.categoryName && set.add(s.categoryName));
    return [...set].sort();
  }, [movements]);

  const methods = useMemo(() => {
    const set = new Set();
    movements.forEach((s) => s.paymentMethodName && set.add(s.paymentMethodName));
    return [...set].sort();
  }, [movements]);

  // Filtrado + orden
  const filtered = useMemo(() => {
    let out = movements.filter((s) => {
      if (search) {
        const q = search.toLowerCase();
        if (!s.name?.toLowerCase().includes(q) &&
            !s.categoryName?.toLowerCase().includes(q) &&
            !s.sourceLabel?.toLowerCase().includes(q)) return false;
      }
      if (source !== "all") {
        if (source === "debt") {
          if (s.source !== "debt_lent" && s.source !== "debt_payment") return false;
        } else if (s.source !== source) return false;
      }
      if (category && s.categoryName !== category) return false;
      if (method   && s.paymentMethodName !== method) return false;
      if (!inRange(s.date, period, customFrom, customTo)) return false;
      return true;
    });
    out = [...out].sort((a, b) => {
      switch (sort) {
        case "date_asc":    return (a.date ?? "").localeCompare(b.date ?? "");
        case "amount_desc": return (b.amount ?? 0) - (a.amount ?? 0);
        case "amount_asc":  return (a.amount ?? 0) - (b.amount ?? 0);
        case "date_desc":
        default:            return (b.date ?? "").localeCompare(a.date ?? "");
      }
    });
    return out;
  }, [movements, search, category, method, source, period, customFrom, customTo, sort]);

  const refetchAll = () => { refetch(); refetchGroups(); refetchDebts(); };

  // Estadísticas del filtrado
  const stats = useMemo(() => {
    const total   = filtered.reduce((a, s) => a + (s.amount ?? 0), 0);
    const promedio = filtered.length > 0 ? total / filtered.length : 0;
    const max     = filtered.reduce((m, s) => (s.amount > (m?.amount ?? -1) ? s : m), null);
    return { total, promedio, max, count: filtered.length };
  }, [filtered]);

  const hasActiveFilters = search || category || method || source !== "all" || period !== "all" ||
    (period === "custom" && (customFrom || customTo));

  function clearAll() {
    setSearch(""); setCategory(""); setMethod(""); setSource("all");
    setPeriod("all"); setCustomFrom(""); setCustomTo("");
  }

  return (
    <div>
      {/* ── Filtros ─────────────────────────────────────────────── */}
      <div className="card-g p-3 mb-3" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Período pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {PERIODS.map((p) => (
            <button key={p.id} onClick={() => setPeriod(p.id)}
              style={{
                border: "1px solid var(--border)",
                background: period === p.id ? "var(--accent)" : "transparent",
                color: period === p.id ? "#fff" : "var(--text-light)",
                borderColor: period === p.id ? "var(--accent)" : "var(--border)",
                padding: "6px 14px", borderRadius: 20,
                fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 5,
                transition: "all .15s",
              }}>
              <i className={`bi ${p.icon}`} /> {p.label}
            </button>
          ))}
        </div>

        {/* Origen pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {SOURCES.map((s) => {
            const active = source === s.id;
            return (
              <button key={s.id} onClick={() => setSource(s.id)}
                style={{
                  border: "1px solid var(--border)",
                  background: active ? (s.color ?? "var(--text)") : "transparent",
                  color: active ? "#fff" : "var(--text-light)",
                  borderColor: active ? (s.color ?? "var(--text)") : "var(--border)",
                  padding: "5px 12px", borderRadius: 20,
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 5,
                  transition: "all .15s",
                }}>
                <i className={`bi ${s.icon}`} /> {s.label}
              </button>
            );
          })}
        </div>

        {/* Rango personalizado */}
        {period === "custom" && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 160px" }}>
              <label style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600,
                textTransform: "uppercase", letterSpacing: "0.4px" }}>Desde</label>
              <input type="date" className="form-control" value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)} />
            </div>
            <div style={{ flex: "1 1 160px" }}>
              <label style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600,
                textTransform: "uppercase", letterSpacing: "0.4px" }}>Hasta</label>
              <input type="date" className="form-control" value={customTo}
                onChange={(e) => setCustomTo(e.target.value)} />
            </div>
          </div>
        )}

        {/* Buscar + categoría + método + orden */}
        <div style={{ display: "grid", gap: 8,
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
          <div className="input-group">
            <span className="input-group-text"><i className="bi bi-search" /></span>
            <input className="form-control" placeholder="Buscar..."
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <select className="form-control" value={category}
            onChange={(e) => setCategory(e.target.value)}>
            <option value="">Todas las categorías</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select className="form-control" value={method}
            onChange={(e) => setMethod(e.target.value)}>
            <option value="">Todos los métodos</option>
            {methods.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>

          <select className="form-control" value={sort}
            onChange={(e) => setSort(e.target.value)}>
            {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>

        {/* Acciones */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>
            {stats.count} resultado{stats.count !== 1 ? "s" : ""} ·
            <strong style={{ color: "var(--text)", marginLeft: 4 }}>{currency.format(stats.total)}</strong>
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            {hasActiveFilters && (
              <button className="btn-outline-g" style={{ fontSize: 12, padding: "5px 12px" }}
                onClick={clearAll}>
                <i className="bi bi-x-circle" /> Limpiar
              </button>
            )}
            <button className="btn-outline-g" style={{ fontSize: 12, padding: "5px 12px" }}
              onClick={refetchAll} disabled={loading}>
              <i className="bi bi-arrow-clockwise" /> Refrescar
            </button>
          </div>
        </div>
      </div>

      {/* ── Mini stats del filtrado ─────────────────────────────── */}
      {!loading && filtered.length > 0 && (
        <div className="row g-3 mb-3">
          <div className="col-6 col-md-3">
            <div className="stat-card">
              <div className="stat-icon violet"><i className="bi bi-cash-coin" /></div>
              <div>
                <div className="stat-label">Total</div>
                <div className="stat-value" style={{ fontSize: 16 }}>{currency.format(stats.total)}</div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="stat-card">
              <div className="stat-icon blue"><i className="bi bi-bar-chart" /></div>
              <div>
                <div className="stat-label">Promedio</div>
                <div className="stat-value" style={{ fontSize: 16 }}>{currency.format(stats.promedio)}</div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="stat-card">
              <div className="stat-icon orange"><i className="bi bi-receipt" /></div>
              <div>
                <div className="stat-label">Transacciones</div>
                <div className="stat-value" style={{ fontSize: 16 }}>{stats.count}</div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: "rgba(239,68,68,.12)", color: "var(--danger)" }}>
                <i className="bi bi-lightning-charge" />
              </div>
              <div>
                <div className="stat-label">Mayor gasto</div>
                <div className="stat-value" style={{ fontSize: 14 }}>
                  {stats.max ? currency.format(stats.max.amount) : "—"}
                </div>
                {stats.max && (
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                    {stats.max.name}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="card-g p-3 mb-3" style={{ borderColor: "var(--danger)", color: "var(--danger)", fontSize: 13 }}>
          <i className="bi bi-exclamation-triangle me-2" />{error}
        </div>
      )}

      {loading && (
        <div className="card-g p-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="gasto-item" style={{ opacity: 0.4 }}>
              <div className="gasto-icon" style={{ background: "var(--border)" }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 12, background: "var(--border)", borderRadius: 4, width: "50%", marginBottom: 6 }} />
                <div style={{ height: 10, background: "var(--border)", borderRadius: 4, width: "30%" }} />
              </div>
              <div style={{ height: 14, background: "var(--border)", borderRadius: 4, width: 60 }} />
            </div>
          ))}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="card-g">
          <div className="empty-state">
            <i className="bi bi-cash-coin d-block" />
            <p>{hasActiveFilters
              ? "No hay gastos para los filtros aplicados."
              : "Aún no tienes gastos registrados."}</p>
          </div>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="card-g" style={{ overflow: "hidden" }}>
          {filtered.map((s) => {
            const meta = SOURCE_META[s.source] ?? SOURCE_META.personal;
            return (
              <div className="gasto-item" key={s.id}>
                <div className="gasto-icon" style={{ background: meta.bg, color: meta.color }}>
                  <i className={`bi ${s.categoryIcon ?? "bi-tag"}`} aria-hidden="true" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="gasto-name" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {s.name}
                    {s.pendiente && (
                      <span className="badge-g gray" style={{ fontSize: 10 }}>Pendiente</span>
                    )}
                  </div>
                  <div className="gasto-meta d-flex flex-wrap gap-2 mt-1">
                    {s.date && <span>{formatDate(s.date)}</span>}
                    <span className="badge-g" style={{
                      background: meta.bg, color: meta.color,
                      border: `1px solid ${meta.color}33`,
                    }}>
                      <i className={`bi ${meta.icon}`} aria-hidden="true" />
                      {s.sourceLabel}
                    </span>
                    {s.categoryName && s.source === "personal" && (
                      <span className="badge-g green">
                        <i className={`bi ${s.categoryIcon ?? "bi-tag"}`} aria-hidden="true" />
                        {s.categoryName}
                      </span>
                    )}
                    {s.paymentMethodName && (
                      <span className="badge-g blue">
                        <i className="bi bi-credit-card" aria-hidden="true" />
                        {s.paymentMethodName}
                      </span>
                    )}
                  </div>
                </div>
                <div className="gasto-amount" style={{
                  color: s.pendiente ? "var(--muted)" : undefined,
                }}>
                  {s.amount != null ? currency.format(s.amount) : "—"}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
