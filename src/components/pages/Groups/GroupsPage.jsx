import React, { useEffect, useState } from "react";
import { groupService } from "../../../services/groupService";
import { useToast } from "../../../context/ToastContext";
import { useAuth } from "../../../context/AuthContext";

const currency = (n) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency", currency: "MXN", maximumFractionDigits: 0,
  }).format(n ?? 0);

/* ─── Modal base ─────────────────────────────────────────────────── */
function Modal({ title, onClose, children, maxWidth = 440 }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(13,12,29,.55)", zIndex: 1050,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, animation: "fadeIn .18s ease",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)", borderRadius: "var(--radius-lg)",
          width: "100%", maxWidth,
          boxShadow: "0 16px 48px rgba(13,12,29,.22)",
          overflow: "hidden", animation: "fadeUp .2s ease",
        }}
      >
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderBottom: "1px solid var(--border)",
        }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none",
            cursor: "pointer", color: "var(--muted)", fontSize: 18, lineHeight: 1 }}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div style={{ padding: 20, maxHeight: "80vh", overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
}

/* ─── Modal: crear grupo ─────────────────────────────────────────── */
function NewGroupModal({ onClose, onCreated }) {
  const { push } = useToast();
  const [name, setName]       = useState("");
  const [desc, setDesc]       = useState("");
  const [members, setMembers] = useState(["", ""]);
  const [loading, setLoading] = useState(false);

  const updateMember = (i, v) => setMembers((ms) => ms.map((m, idx) => idx === i ? v : m));

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) return push("El nombre es obligatorio", "warning");
    setLoading(true);
    try {
      const g = await groupService.create({
        name: name.trim(),
        description: desc.trim() || null,
        memberNames: members.map((m) => m.trim()).filter(Boolean),
      });
      onCreated(g);
      push("Grupo creado", "success");
      onClose();
    } catch { push("Error al crear el grupo", "danger"); }
    finally { setLoading(false); }
  }

  return (
    <Modal title="Nuevo grupo" onClose={onClose}>
      <form onSubmit={submit}>
        <div className="mb-3">
          <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>Nombre *</label>
          <input className="form-control" placeholder="Ej: Viaje a Cartagena"
            value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>Descripción (opcional)</label>
          <input className="form-control" placeholder="Ej: Vacaciones julio"
            value={desc} onChange={(e) => setDesc(e.target.value)} />
        </div>
        <div className="mb-4">
          <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>
            Miembros iniciales (aparte de ti)
          </label>
          {members.map((m, i) => (
            <input key={i} className="form-control mb-2" placeholder={`Miembro ${i + 1}`}
              value={m} onChange={(e) => updateMember(i, e.target.value)} />
          ))}
          <button type="button" onClick={() => setMembers((ms) => [...ms, ""])}
            style={{ background: "none", border: "none", color: "var(--accent)",
              fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0, marginTop: 4 }}>
            <i className="bi bi-plus me-1" />Agregar otro
          </button>
        </div>
        <button className="btn btn-primary w-100"
          style={{ background: "var(--accent)", border: "none", fontWeight: 700 }}
          disabled={loading}>
          {loading ? "Creando…" : "Crear grupo"}
        </button>
      </form>
    </Modal>
  );
}

/* ─── Modal: agregar miembro ─────────────────────────────────────── */
function AddMemberModal({ groupId, onClose, onAdded }) {
  const { push } = useToast();
  const [name, setName]     = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const m = await groupService.addMember(groupId, { name: name.trim() });
      onAdded(m);
      push(`${name} agregado al grupo`, "success");
      onClose();
    } catch { push("Error al agregar el miembro", "danger"); }
    finally { setLoading(false); }
  }

  return (
    <Modal title="Agregar miembro" onClose={onClose} maxWidth={380}>
      <form onSubmit={submit}>
        <div className="mb-4">
          <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>Nombre</label>
          <input className="form-control" placeholder="Nombre del miembro"
            value={name} onChange={(e) => setName(e.target.value)} autoFocus required />
        </div>
        <button className="btn btn-primary w-100"
          style={{ background: "var(--accent)", border: "none", fontWeight: 700 }}
          disabled={loading}>
          {loading ? "Agregando…" : "Agregar"}
        </button>
      </form>
    </Modal>
  );
}

/* ─── Modal: nuevo gasto del grupo ──────────────────────────────── */
function NewExpenseModal({ group, onClose, onAdded }) {
  const { push } = useToast();

  // Selección de miembros — por defecto todos
  const [selected, setSelected] = useState(() =>
    new Set(group.members?.map((m) => m.id) ?? [])
  );
  const [form, setForm] = useState({
    description: "", totalAmount: "", category: "",
    paidByMemberId: group.members?.[0]?.id ?? "",
  });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function toggleMember(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        // Mínimo 2 personas para un gasto compartido
        if (next.size <= 2) { push("Mínimo 2 personas", "warning"); return prev; }
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const count     = selected.size;
  const perPerson = form.totalAmount && count > 0
    ? currency(parseFloat(form.totalAmount) / count)
    : null;

  async function submit(e) {
    e.preventDefault();
    if (!form.description || !form.totalAmount) return push("Completa los campos obligatorios", "warning");
    if (count < 2) return push("Selecciona al menos 2 personas", "warning");
    setLoading(true);
    try {
      const exp = await groupService.addExpense(group.id, {
        ...form,
        totalAmount: parseFloat(form.totalAmount),
        paidByMemberId: parseInt(form.paidByMemberId),
        splitType: "EQUAL",
        memberIds: [...selected],
      });
      onAdded(exp);
      push("Gasto registrado", "success");
      onClose();
    } catch { push("Error al registrar el gasto", "danger"); }
    finally { setLoading(false); }
  }

  return (
    <Modal title={`Nuevo gasto — ${group.name}`} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="mb-3">
          <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>Descripción *</label>
          <input className="form-control" placeholder="Ej: Pizza, taxi, hotel"
            value={form.description} onChange={set("description")} required />
        </div>
        <div className="mb-3">
          <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>Total *</label>
          <input className="form-control" type="number" placeholder="0"
            value={form.totalAmount} onChange={set("totalAmount")} required />
        </div>
        <div className="mb-3">
          <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>¿Quién pagó?</label>
          <select className="form-control" value={form.paidByMemberId} onChange={set("paidByMemberId")}>
            {group.members?.map((m) => (
              <option key={m.id} value={m.id}>{m.name}{m.isOwner ? " (tú)" : ""}</option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>Categoría (opcional)</label>
          <input className="form-control" placeholder="Ej: Comida"
            value={form.category} onChange={set("category")} />
        </div>

        {/* Selección de quiénes participan en este gasto */}
        <div className="mb-4">
          <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>
            ¿Quiénes participan en este gasto?
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {group.members?.map((m) => {
              const isChecked = selected.has(m.id);
              return (
                <label key={m.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 12px",
                    background: isChecked ? "var(--accent-soft)" : "var(--surface-alt)",
                    border: `1px solid ${isChecked ? "rgba(124,111,247,.3)" : "var(--border)"}`,
                    borderRadius: "var(--radius-sm)", cursor: "pointer",
                    transition: "all .15s",
                  }}
                >
                  <input type="checkbox" checked={isChecked}
                    onChange={() => toggleMember(m.id)}
                    style={{ accentColor: "var(--accent)", width: 16, height: 16 }} />
                  <div style={{ width: 26, height: 26, borderRadius: "50%",
                    background: m.isOwner ? "var(--accent)" : "var(--border)",
                    color: m.isOwner ? "#fff" : "var(--muted)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                    {m.name[0].toUpperCase()}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>
                    {m.name}{m.isOwner ? " (tú)" : ""}
                  </span>
                  {isChecked && perPerson && (
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)" }}>
                      {perPerson}
                    </span>
                  )}
                </label>
              );
            })}
          </div>

          {perPerson && (
            <div style={{ marginTop: 10, padding: "8px 12px",
              background: "var(--accent-soft)", borderRadius: "var(--radius-sm)",
              fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>
              <i className="bi bi-people me-2" />
              {count} personas · {perPerson} c/u
            </div>
          )}
        </div>

        <button className="btn btn-primary w-100"
          style={{ background: "var(--accent)", border: "none", fontWeight: 700 }}
          disabled={loading}>
          {loading ? "Guardando…" : "Registrar gasto"}
        </button>
      </form>
    </Modal>
  );
}

/* ─── Vista de detalle de grupo ──────────────────────────────────── */
function GroupDetail({ groupId, onBack }) {
  const { push }   = useToast();
  const { auth }   = useAuth();
  const [group, setGroup]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [showExpense, setShowExpense] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [expandedExp, setExpandedExp] = useState(null);
  const [expSearch, setExpSearch]     = useState("");
  // "" = todos | "YYYY-MM" = mes específico
  const [expMonth, setExpMonth]       = useState(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}`;
  });

  async function load() {
    setLoading(true);
    try { setGroup(await groupService.get(groupId)); }
    catch { push("Error cargando grupo", "danger"); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [groupId]);

  if (loading) return (
    <div className="card-g p-5 text-center">
      <div style={{ display: "inline-block", width: 32, height: 32,
        border: "3px solid var(--border)", borderTopColor: "var(--accent)",
        borderRadius: "50%", animation: "spin .7s linear infinite" }} />
    </div>
  );
  if (!group) return null;

  // Miembro que soy yo en este grupo
  const myMember = group.members?.find((m) => m.userId === auth?.id) ?? null;

  async function handleSettleSplit(splitId) {
    try {
      await groupService.settleSplit(group.id, splitId);
      await load(); // recarga para ver el estado actualizado
      push("Cuota marcada como saldada ✓", "success");
    } catch (err) {
      push(err?.response?.data?.message ?? "Error al saldar", "danger");
    }
  }

  function handleMemberAdded(member) {
    // Refrescar el grupo completo para tener los IDs correctos
    load();
  }

  const balanceColor = group.myBalance > 0 ? "var(--success)"
    : group.myBalance < 0 ? "var(--danger)" : "var(--muted)";
  const balanceText  = group.myBalance === 0 ? "Estás en paz"
    : group.myBalance > 0 ? `Te deben ${currency(group.myBalance)}`
    : `Debes ${currency(Math.abs(group.myBalance))}`;

  // ── Métricas del grupo ──────────────────────────────────────
  const totalGrupo     = (group.expenses ?? []).reduce((a, e) => a + (e.totalAmount ?? 0), 0);
  const numGastos      = group.expenses?.length ?? 0;
  const numMiembros    = group.members?.length ?? 1;
  const promedioGasto  = numGastos > 0 ? totalGrupo / numGastos : 0;
  const promedioPersona = numMiembros > 0 ? totalGrupo / numMiembros : 0;

  // Cuánto pagó cada miembro y cuánto le tocó
  const aportesPorMiembro = {};
  (group.members ?? []).forEach((m) => {
    aportesPorMiembro[m.id] = { name: m.name, pagado: 0, cuota: 0 };
  });
  (group.expenses ?? []).forEach((exp) => {
    const p = aportesPorMiembro[exp.paidByMemberId];
    if (p) p.pagado += exp.totalAmount ?? 0;
    (exp.splits ?? []).forEach((s) => {
      const r = aportesPorMiembro[s.memberId];
      if (r) r.cuota += s.shareAmount ?? 0;
    });
  });
  const aportesArr  = Object.values(aportesPorMiembro);
  const mayorPagador = aportesArr.reduce(
    (max, m) => (m.pagado > (max?.pagado ?? -1) ? m : max), null);

  // Categorías del grupo
  const porCategoria = {};
  (group.expenses ?? []).forEach((e) => {
    const k = e.category || "Sin categoría";
    porCategoria[k] = (porCategoria[k] ?? 0) + (e.totalAmount ?? 0);
  });
  const topCategoria = Object.entries(porCategoria)
    .sort(([, a], [, b]) => b - a)[0] ?? null;

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <button onClick={onBack}
            style={{ background: "none", border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)", padding: "7px 10px",
              cursor: "pointer", color: "var(--text-light)", fontSize: 16 }}>
            <i className="bi bi-arrow-left" />
          </button>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", marginBottom: 2 }}>
              {group.name}
            </h1>
            {group.description && (
              <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>{group.description}</p>
            )}
          </div>
        </div>
        <button onClick={() => setShowExpense(true)}
          style={{ background: "var(--accent)", color: "#fff", border: "none",
            borderRadius: "var(--radius-sm)", padding: "9px 18px",
            fontSize: 14, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6 }}>
          <i className="bi bi-plus-lg" />Nuevo gasto
        </button>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="stat-card">
            <div className="stat-icon" style={{
              background: group.myBalance >= 0 ? "rgba(34,197,94,.12)" : "rgba(239,68,68,.12)",
              color: balanceColor }}>
              <i className="bi bi-balance-scale" />
            </div>
            <div>
              <div className="stat-label">Mi balance</div>
              <div className="stat-value" style={{ fontSize: 16, color: balanceColor }}>{balanceText}</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="stat-card">
            <div className="stat-icon violet"><i className="bi bi-people" /></div>
            <div>
              <div className="stat-label">Miembros</div>
              <div className="stat-value" style={{ fontSize: 18 }}>{group.memberCount}</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="stat-card">
            <div className="stat-icon blue"><i className="bi bi-receipt" /></div>
            <div>
              <div className="stat-label">Gastos</div>
              <div className="stat-value" style={{ fontSize: 18 }}>{group.expenses?.length ?? 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen del grupo */}
      <div className="card-g mb-4" style={{ overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>Resumen del grupo</span>
          {topCategoria && (
            <span className="badge-g violet">
              <i className="bi bi-tag" /> Top: {topCategoria[0]} · {currency(topCategoria[1])}
            </span>
          )}
        </div>
        <div className="row g-0">
          {[
            { label: "Total gastado", value: currency(totalGrupo), icon: "bi-wallet2", color: "var(--accent)" },
            { label: "Por persona",   value: currency(promedioPersona), icon: "bi-person", color: "var(--info)", sub: `${numMiembros} miembros` },
            { label: "Promedio gasto", value: currency(promedioGasto), icon: "bi-graph-up", color: "var(--warning)", sub: `${numGastos} gastos` },
            { label: "Mayor pagador",  value: mayorPagador?.name ?? "—", icon: "bi-trophy", color: "var(--success)", sub: mayorPagador ? currency(mayorPagador.pagado) : "" },
          ].map((m, i) => (
            <div key={m.label} className="col-6 col-md-3"
              style={{
                padding: "16px 18px",
                borderRight: i < 3 ? "1px solid var(--border)" : "none",
                borderTop: i >= 2 ? "1px solid var(--border)" : "none",
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <i className={`bi ${m.icon}`} style={{ color: m.color, fontSize: 14 }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)",
                  textTransform: "uppercase", letterSpacing: "0.4px" }}>{m.label}</span>
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text)", lineHeight: 1.2 }}>
                {m.value}
              </div>
              {m.sub && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{m.sub}</div>}
            </div>
          ))}
        </div>

        {/* Aportes por miembro */}
        {aportesArr.length > 0 && (
          <div style={{ borderTop: "1px solid var(--border)", padding: "14px 18px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)",
              textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 10 }}>
              Aportes por miembro
            </div>
            {aportesArr.map((m) => {
              const pct = totalGrupo > 0 ? (m.pagado / totalGrupo) * 100 : 0;
              const neto = m.pagado - m.cuota; // positivo: le deben | negativo: debe
              return (
                <div key={m.name} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between",
                    fontSize: 12.5, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{m.name}</span>
                    <span style={{ color: "var(--muted)" }}>
                      Pagó <strong style={{ color: "var(--text)" }}>{currency(m.pagado)}</strong> ·
                      le tocó {currency(m.cuota)} ·
                      <span style={{ color: neto > 0 ? "var(--success)" : neto < 0 ? "var(--danger)" : "var(--muted)", marginLeft: 4 }}>
                        {neto > 0 ? "+" : ""}{currency(neto)}
                      </span>
                    </span>
                  </div>
                  <div style={{ height: 6, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%",
                      background: "var(--accent)", transition: "width .3s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Miembros */}
      <div className="card-g mb-4" style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>
            Miembros ({group.members?.length ?? 0})
          </span>
          <button onClick={() => setShowAddMember(true)}
            style={{ background: "none", border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)", padding: "5px 12px",
              fontSize: 12, fontWeight: 600, color: "var(--text-light)",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
            <i className="bi bi-person-plus" />Agregar
          </button>
        </div>
        <div style={{ padding: "14px 18px", display: "flex", flexWrap: "wrap", gap: 8 }}>
          {group.members?.map((m) => (
            <div key={m.id} style={{
              display: "flex", alignItems: "center", gap: 8,
              background: m.id === myMember?.id ? "var(--accent-soft)" : "var(--surface-alt)",
              border: `1px solid ${m.id === myMember?.id ? "rgba(124,111,247,.3)" : "var(--border)"}`,
              borderRadius: 20, padding: "6px 14px",
            }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%",
                background: m.id === myMember?.id ? "var(--accent)" : "var(--border)",
                color: m.id === myMember?.id ? "#fff" : "var(--muted)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700 }}>
                {m.name[0].toUpperCase()}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500 }}>
                {m.name}{m.id === myMember?.id ? " (tú)" : ""}{m.isOwner ? " 👑" : ""}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Gastos */}
      <div className="card-g" style={{ overflow: "hidden" }}>
        <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)" }}>
          {/* Fila 1: título + búsqueda */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
              Gastos ({group.expenses?.length ?? 0})
            </span>
            {(group.expenses?.length ?? 0) > 0 && (
              <div style={{ flex: 1, position: "relative" }}>
                <i className="bi bi-search" style={{
                  position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)",
                  color: "var(--muted)", fontSize: 12, pointerEvents: "none" }} />
                <input className="form-control" style={{ fontSize: 12.5, paddingLeft: 28, height: 32 }}
                  placeholder="Buscar gasto…" value={expSearch}
                  onChange={(e) => setExpSearch(e.target.value)} />
              </div>
            )}
          </div>
          {/* Fila 2: selector de mes personalizado */}
          {(group.expenses?.length ?? 0) > 0 && (() => {
            const now = new Date();
            const opts = [{ value: "", label: "Todos los meses" }];
            for (let i = 0; i < 24; i++) {
              const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
              const val = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
              const lbl = d.toLocaleString("es-CO", { month: "long", year: "numeric" });
              opts.push({ value: val, label: lbl.charAt(0).toUpperCase() + lbl.slice(1) });
            }
            return (
              <select value={expMonth} onChange={(e) => setExpMonth(e.target.value)}
                style={{ height: 30, fontSize: 12, fontWeight: 600,
                  border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
                  padding: "0 10px", background: "var(--surface)",
                  color: "var(--text)", cursor: "pointer", minWidth: 160 }}>
                {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            );
          })()}
        </div>

        {!group.expenses?.length ? (
          <div className="empty-state">
            <i className="bi bi-receipt d-block" />
            <p>Sin gastos aún. ¡Registra el primero!</p>
          </div>
        ) : (() => {
          const visibleExp = group.expenses.filter(e => {
            // Filtro de texto
            if (expSearch && !(
              e.description?.toLowerCase().includes(expSearch.toLowerCase()) ||
              e.category?.toLowerCase().includes(expSearch.toLowerCase())
            )) return false;
            // Filtro de mes (YYYY-MM)
            if (expMonth && e.date) {
              const [y, m] = e.date.split("-");
              if (`${y}-${m}` !== expMonth) return false;
            }
            return true;
          });
          if (visibleExp.length === 0) return (
            <div className="empty-state" style={{ padding: "28px 0" }}>
              <i className="bi bi-funnel d-block" />
              <p>Sin gastos que coincidan.</p>
            </div>
          );
          return visibleExp.map((exp) => {
            // ¿Soy yo el que pagó este gasto?
            const iAmPayer = myMember && exp.paidByMemberId === myMember.id;
            const isExpanded = expandedExp === exp.id;

            return (
              <div key={exp.id} style={{ borderBottom: "1px solid var(--border)" }}>
                {/* Fila principal del gasto — clickeable para expandir */}
                <div
                  className="gasto-item"
                  style={{ cursor: "pointer", userSelect: "none" }}
                  onClick={() => setExpandedExp(isExpanded ? null : exp.id)}
                >
                  <div className="gasto-icon" style={{ background: "rgba(59,130,246,.1)", color: "var(--info)" }}>
                    <i className="bi bi-receipt" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="gasto-name">{exp.description}</div>
                    <div className="gasto-meta d-flex flex-wrap gap-2 mt-1">
                      <span>
                        Pagó <strong style={{ color: iAmPayer ? "var(--accent)" : "inherit" }}>
                          {iAmPayer ? "tú" : exp.paidByMemberName}
                        </strong>
                      </span>
                      {exp.category && <span className="badge-g violet">{exp.category}</span>}
                      {exp.date && <span className="badge-g gray">{exp.date}</span>}
                      <span className="badge-g gray">
                        {exp.splits?.length ?? 0} personas
                      </span>
                    </div>
                  </div>
                  <div className="gasto-amount" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {currency(exp.totalAmount)}
                    <i
                      className={`bi bi-chevron-${isExpanded ? "up" : "down"}`}
                      style={{ fontSize: 14, color: "var(--muted)", transition: "transform .2s" }}
                    />
                  </div>
                </div>

                {/* Splits — cuotas de cada persona (colapsable) */}
                {isExpanded && (
                <div style={{ padding: "0 18px 12px 72px", display: "flex", flexDirection: "column", gap: 6 }}>
                  {exp.splits?.map((s) => {
                    const isMe       = myMember && s.memberId === myMember.id;
                    // Puedo saldar: (a) si soy el pagador y es de otro, (b) si es mi propio split y otro pagó
                    const canSettle  = !s.settled && (
                      (iAmPayer && !isMe) ||
                      (!iAmPayer && isMe)
                    );

                    return (
                      <div key={s.id ?? s.memberId} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "7px 12px",
                        background: isMe ? "var(--accent-soft)" : "var(--surface-alt)",
                        border: `1px solid ${isMe ? "rgba(124,111,247,.2)" : "var(--border)"}`,
                        borderRadius: "var(--radius-sm)",
                      }}>
                        {/* Nombre */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                          <div style={{ width: 22, height: 22, borderRadius: "50%",
                            background: isMe ? "var(--accent)" : "var(--border)",
                            color: isMe ? "#fff" : "var(--muted)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                            {s.memberName[0]}
                          </div>
                          <span style={{ fontWeight: isMe ? 700 : 400 }}>
                            {isMe ? "Tú" : s.memberName}
                          </span>
                        </div>

                        {/* Monto + estado */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 700 }}>
                            {currency(s.shareAmount)}
                          </span>
                          {s.settled ? (
                            <span className="badge-g green">✓ Saldado</span>
                          ) : canSettle ? (
                            <button
                              onClick={() => handleSettleSplit(s.id)}
                              style={{ fontSize: 11, padding: "3px 10px",
                                borderRadius: 12, border: "1px solid var(--success)",
                                background: "transparent", color: "var(--success)",
                                cursor: "pointer", fontWeight: 600 }}>
                              Saldar
                            </button>
                          ) : (
                            <span className="badge-g gray">Pendiente</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                )}
              </div>
            );
          });
        })()}
      </div>

      {showExpense && (
        <NewExpenseModal group={group} onClose={() => setShowExpense(false)}
          onAdded={() => { setShowExpense(false); load(); }} />
      )}
      {showAddMember && (
        <AddMemberModal groupId={group.id} onClose={() => setShowAddMember(false)}
          onAdded={handleMemberAdded} />
      )}
    </div>
  );
}

/* ─── Página principal — lista de grupos ─────────────────────────── */
export default function GroupsPage() {
  const { push }              = useToast();
  const [groups, setGroups]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [groupSearch, setGroupSearch] = useState("");

  async function load() {
    setLoading(true);
    try { setGroups(await groupService.list()); }
    catch { push("Error cargando grupos", "danger"); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  if (selectedId) {
    return <GroupDetail groupId={selectedId} onBack={() => { setSelectedId(null); load(); }} />;
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", marginBottom: 2 }}>
            Grupos compartidos
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
            Divide gastos con amigos, familia o compañeros.
          </p>
        </div>
        <button onClick={() => setShowNew(true)}
          style={{ background: "var(--accent)", color: "#fff", border: "none",
            borderRadius: "var(--radius-sm)", padding: "9px 18px",
            fontSize: 14, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6 }}>
          <i className="bi bi-plus-lg" />Nuevo grupo
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="card-g p-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="gasto-item" style={{ opacity: 0.4 }}>
              <div className="gasto-icon" style={{ background: "var(--border)" }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 12, background: "var(--border)", borderRadius: 4, width: "45%", marginBottom: 6 }} />
                <div style={{ height: 10, background: "var(--border)", borderRadius: 4, width: "30%" }} />
              </div>
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="card-g">
          <div className="empty-state">
            <i className="bi bi-people d-block" />
            <p>Aún no tienes grupos.<br />Crea uno para dividir gastos fácilmente.</p>
            <button onClick={() => setShowNew(true)}
              style={{ background: "var(--accent)", color: "#fff", border: "none",
                borderRadius: "var(--radius-sm)", padding: "9px 18px",
                fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Crear primer grupo
            </button>
          </div>
        </div>
      ) : (
        <div className="card-g" style={{ overflow: "hidden" }}>
          <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
              {groups.length} grupo{groups.length !== 1 ? "s" : ""}
            </span>
            <div style={{ flex: 1, position: "relative" }}>
              <i className="bi bi-search" style={{
                position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)",
                color: "var(--muted)", fontSize: 12, pointerEvents: "none" }} />
              <input className="form-control" style={{ fontSize: 12.5, paddingLeft: 28, height: 32 }}
                placeholder="Buscar grupo…" value={groupSearch}
                onChange={(e) => setGroupSearch(e.target.value)} />
            </div>
          </div>
          {groups.filter(g =>
            !groupSearch || g.name.toLowerCase().includes(groupSearch.toLowerCase())
          ).map((g) => {
            const bal  = g.myBalance ?? 0;
            const balText  = bal === 0 ? null
              : bal > 0 ? `Te deben ${currency(bal)}`
              : `Debes ${currency(Math.abs(bal))}`;
            const balColor = bal > 0 ? "var(--success)" : bal < 0 ? "var(--danger)" : "var(--muted)";

            return (
              <div key={g.id} className="gasto-item" style={{ cursor: "pointer" }}
                onClick={() => setSelectedId(g.id)}>
                <div className="gasto-icon" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
                  <i className="bi bi-people-fill" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="gasto-name">{g.name}</div>
                  <div className="gasto-meta d-flex flex-wrap gap-2 mt-1">
                    <span className="badge-g gray">
                      <i className="bi bi-person me-1" />{g.memberCount} miembros
                    </span>
                    <span className="badge-g gray">
                      <i className="bi bi-receipt me-1" />{g.expenses?.length ?? 0} gastos
                    </span>
                    {g.description && <span className="badge-g gray">{g.description}</span>}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, display: "flex", alignItems: "center", gap: 10 }}>
                  {balText && (
                    <span style={{ fontSize: 12, fontWeight: 700, color: balColor }}>{balText}</span>
                  )}
                  <i className="bi bi-chevron-right" style={{ color: "var(--muted)", fontSize: 13 }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showNew && (
        <NewGroupModal onClose={() => setShowNew(false)}
          onCreated={(g) => { setGroups((p) => [g, ...p]); setSelectedId(g.id); }} />
      )}
    </div>
  );
}
