import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { financeService } from "../../../services/financeService";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar,
} from "recharts";
import { useAuth } from "../../../context/AuthContext";
import { useFetch } from "../../../hooks/useFetch";
import { summaryService } from "../../../services/summaryService";
import { expenseService } from "../../../services/expenseService";
import { groupService } from "../../../services/groupService";
import { debtService } from "../../../services/debtService";
import StatCard from "../../ui/StatCard";

/* ── helpers ─────────────────────────────────────────────────── */
const currency = new Intl.NumberFormat("es-MX", {
  style: "currency", currency: "MXN", maximumFractionDigits: 0,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 18) return "Buenas tardes";
  return "Buenas noches";
}

/** Agrupa gastos por día (YYYY-MM-DD → total) del mes en curso */
function buildDailyTrend(gastos) {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth();

  // Mapa día → total
  const map = {};
  (gastos ?? []).forEach((g) => {
    const d = new Date(g.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const key = d.getDate();
      map[key] = (map[key] ?? 0) + g.amount;
    }
  });

  // Generar array día 1 → hoy
  const today = now.getDate();
  return Array.from({ length: today }, (_, i) => ({
    day: i + 1,
    total: map[i + 1] ?? 0,
  }));
}

/* ── paleta de colores para el pie ─────────────────────────────── */
const PIE_COLORS = ["#7c6ff7", "#a89bf9", "#6a5cf5", "#c4b9fd", "#4f3de0", "#d4cbff", "#3a2db8", "#e8e4ff"];

/* ── Tooltip custom del AreaChart ───────────────────────────────── */
function AreaTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)", padding: "10px 14px",
      boxShadow: "var(--shadow-md)", fontSize: 12,
    }}>
      <div style={{ color: "var(--muted)", marginBottom: 4 }}>Día {label}</div>
      <div style={{ fontWeight: 700, color: "var(--accent)" }}>
        {currency.format(payload[0].value)}
      </div>
    </div>
  );
}

/* ── Tooltip custom del Pie ──────────────────────────────────────── */
function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)", padding: "10px 14px",
      boxShadow: "var(--shadow-md)", fontSize: 12,
    }}>
      <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{p.name}</div>
      <div style={{ color: "var(--muted)" }}>{p.payload.percentage}% · {currency.format(p.payload.total)}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const { auth } = useAuth();
  const { data: summary, loading, error } = useFetch(() => summaryService.get(), []);
  const { data: gastos, loading: loadingG  } = useFetch(() => expenseService.list(), []);
  const { data: grupos  } = useFetch(() => groupService.list(), []);
  const { data: deudas  } = useFetch(() => debtService.list({ status: "ACTIVE" }), []);
  const { data: history } = useFetch(() => summaryService.history(6), []);
  const { data: finSummary } = useFetch(() => financeService.getSummary(), []);
  const { data: trend }      = useFetch(() => financeService.getTrend(), []);
  const [dashTab, setDashTab] = useState("gastos"); // "gastos" | "finanzas" | "social"

  const firstName  = auth?.name?.split(" ")[0] ?? "usuario";
  const dailyData  = useMemo(() => buildDailyTrend(gastos), [gastos]);
  const categories = summary?.expensesByCategory ?? [];

  // Balance grupal: suma de myBalance de todos los grupos
  const grupalBalance = useMemo(() =>
    (grupos ?? []).reduce((acc, g) => acc + (g.myBalance ?? 0), 0), [grupos]);

  // Deudas activas
  const teDebenTotal  = useMemo(() =>
    (deudas ?? []).filter(d => d.type === "LENT")
      .reduce((a, d) => a + (d.remainingAmount ?? 0), 0), [deudas]);
  const debesTotal    = useMemo(() =>
    (deudas ?? []).filter(d => d.type === "BORROWED")
      .reduce((a, d) => a + (d.remainingAmount ?? 0), 0), [deudas]);

  // Insights inteligentes
  const insights = useMemo(() => buildInsights(summary, history, grupos, deudas), [summary, history, grupos, deudas]);

  // Datos del gráfico mes vs mes (último mes resaltado)
  const histData = useMemo(() => (history ?? []).map((h, i, arr) => ({
    ...h,
    isCurrent: i === arr.length - 1,
  })), [history]);

  return (
    <div>
      {/* ── Header ── */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3 animate-fade-up">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>
            {greeting()}, {firstName}
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
            Resumen financiero · {new Date().toLocaleDateString("es-MX", { month: "long", year: "numeric" })}
          </p>
        </div>
        <Link to="/gastos" className="btn-accent" style={{ textDecoration: "none" }}>
          <i className="bi bi-plus-circle" /> Registrar gasto
        </Link>
      </div>

      {error && (
        <div className="card-g p-3 mb-4 animate-fade-in"
          style={{ borderColor: "var(--danger)", color: "var(--danger)", fontSize: 13 }}>
          <i className="bi bi-exclamation-triangle me-2" />
          No se pudo cargar el resumen.
        </div>
      )}

      {/* ── Stat cards ── */}
      <div className="row g-3 mb-4">
        {[
          {
            label: "Gasto este mes", icon: "bi-cash-coin", color: "violet",
            value: loading ? "—" : currency.format(summary?.currentMonthTotal ?? 0),
            change: loading ? undefined : summary?.changePercentage,
          },
          {
            label: "Mes anterior", icon: "bi-calendar3", color: "blue",
            value: loading ? "—" : currency.format(summary?.previousMonthTotal ?? 0),
          },
          {
            label: "Promedio diario", icon: "bi-graph-up", color: "orange",
            value: loading ? "—" : currency.format(summary?.dailyAverage ?? 0),
          },
          {
            label: "Transacciones", icon: "bi-receipt", color: "purple",
            value: loading ? "—" : String(summary?.transactionCount ?? 0),
            badge: summary?.transactionCount != null ? "este mes" : undefined,
          },
        ].map((props, i) => (
          <div key={props.label} className={`col-12 col-sm-6 col-xl-3 animate-fade-up anim-d${i + 1}`}>
            <StatCard {...props} />
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="card-g mb-4" style={{ overflow:"hidden" }}>
        {/* Tab bar */}
        <div style={{ display:"flex", borderBottom:"1px solid var(--border)" }}>
          {[
            { id:"gastos",   icon:"bi-cash-coin",    label:"Gastos"   },
            { id:"finanzas", icon:"bi-piggy-bank",   label:"Finanzas" },
            { id:"social",   icon:"bi-people",       label:"Social"   },
          ].map(t => (
            <button key={t.id} onClick={() => setDashTab(t.id)}
              style={{ border:"none", background:"none", cursor:"pointer", padding:"12px 20px",
                fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:6,
                color: dashTab === t.id ? "var(--accent)" : "var(--muted)",
                borderBottom: dashTab === t.id ? "2px solid var(--accent)" : "2px solid transparent",
                marginBottom:-1, whiteSpace:"nowrap", transition:"all .15s" }}>
              <i className={`bi ${t.icon}`} style={{ fontSize:14 }} />
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ padding:20 }}>

        {/* ── Tab Gastos ── */}
        {dashTab === "gastos" && (
          <div>
            <div className="row g-3 mb-3">
              {/* Area chart diario */}
              <div className="col-12 col-lg-7">
                <div className="card-g p-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div>
                      <div className="section-title">Tendencia diaria</div>
                      <div className="section-sub" style={{ marginBottom:0 }}>Gastos acumulados del mes</div>
                    </div>
                    {!loadingG && dailyData.length > 0 && (
                      <span className="badge-g violet"><i className="bi bi-bar-chart-line" /> {dailyData.length} días</span>
                    )}
                  </div>
                  {loadingG ? <SkeletonChart /> : dailyData.length === 0 ? (
                    <div className="empty-state" style={{ padding:"32px 0" }}>
                      <i className="bi bi-graph-up d-block" /><p>Sin gastos este mes</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={dailyData} margin={{ top:4, right:4, bottom:0, left:0 }}>
                        <defs>
                          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#7c6ff7" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#7c6ff7" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="day" tick={{ fontSize:11, fill:"var(--muted)" }}
                          tickLine={false} axisLine={false} interval={Math.ceil(dailyData.length/8)-1} />
                        <YAxis hide />
                        <Tooltip content={<AreaTooltip />} />
                        <Area type="monotone" dataKey="total" stroke="#7c6ff7" strokeWidth={2.5}
                          fill="url(#areaGrad)" dot={false} activeDot={{ r:5, fill:"#7c6ff7", strokeWidth:0 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
              {/* Pie */}
              <div className="col-12 col-lg-5">
                <div className="card-g p-4">
                  <div className="section-title mb-1">Por categoría</div>
                  <div className="section-sub">Distribución del mes</div>
                  {loading ? <SkeletonChart /> : categories.length === 0 ? (
                    <div className="empty-state" style={{ padding:"32px 0" }}>
                      <i className="bi bi-pie-chart d-block"/><p>Sin categorías este mes</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={210}>
                      <PieChart>
                        <Pie data={categories} dataKey="total" nameKey="category"
                          cx="50%" cy="50%" innerRadius={55} outerRadius={82}
                          paddingAngle={3} strokeWidth={0}>
                          {categories.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                        <Legend iconType="circle" iconSize={8}
                          formatter={v => <span style={{ fontSize:11.5, color:"var(--text-light)" }}>{v}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom: ranking + stats */}
            <div className="row g-3">
              <div className="col-12 col-lg-5">
                <div className="card-g p-4 h-100">
                  <div className="section-title mb-1">Ranking de categorías</div>
                  <div className="section-sub">% sobre el total mensual</div>
                  {loading && <SkeletonCats />}
                  {!loading && categories.length === 0 && (
                    <div className="empty-state" style={{ padding:"24px 0" }}>
                      <i className="bi bi-bar-chart d-block"/><p>Sin datos aún</p>
                    </div>
                  )}
                  {!loading && categories.map((cat, i) => (
                    <div className="cat-row" key={cat.category} style={{ animationDelay:`${i*60}ms` }}>
                      <div className="cat-icon"><i className={`bi ${cat.icon}`} /></div>
                      <div className="cat-bar-wrap">
                        <div className="d-flex justify-content-between">
                          <div className="cat-name">{cat.category}</div>
                          <div style={{ fontSize:11.5, color:"var(--muted)" }}>{currency.format(cat.total)}</div>
                        </div>
                        <div className="cat-bar">
                          <div className="cat-bar-fill" style={{ width:`${cat.percentage}%` }} />
                        </div>
                      </div>
                      <div className="cat-pct">{cat.percentage}%</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-12 col-lg-7">
                <div className="row g-3">
                  <div className="col-12">
                    <div className="card-g p-4 d-flex align-items-center gap-4"
                      style={{ background:"linear-gradient(135deg,#0d0c1d 0%,#1a1840 100%)" }}>
                      <div style={{ width:52, height:52, borderRadius:"var(--radius-md)",
                        background:"rgba(124,111,247,.25)", display:"grid", placeItems:"center",
                        fontSize:24, color:"#a89bf9", flexShrink:0 }}>
                        <i className="bi bi-trophy" />
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:10, fontWeight:600, color:"rgba(255,255,255,.4)",
                          letterSpacing:"0.6px", textTransform:"uppercase", marginBottom:4 }}>
                          Mayor gasto del mes
                        </div>
                        <div style={{ fontSize:18, fontWeight:800, color:"#fff" }}>
                          {loading ? "—" : (summary?.topCategory ?? "Sin datos")}
                        </div>
                        {!loading && summary?.topCategoryAmount != null && (
                          <div style={{ fontSize:12, color:"#a89bf9", marginTop:2 }}>
                            {currency.format(summary.topCategoryAmount)} gastados
                          </div>
                        )}
                      </div>
                      {!loading && summary?.changePercentage != null && (
                        <div style={{ textAlign:"center", flexShrink:0 }}>
                          <div style={{ fontSize:20, fontWeight:800,
                            color: summary.changePercentage > 0 ? "#fca5a5" : "#86efac" }}>
                            {summary.changePercentage > 0 ? "▲" : "▼"} {Math.abs(summary.changePercentage).toFixed(1)}%
                          </div>
                          <div style={{ fontSize:10, color:"rgba(255,255,255,.35)", marginTop:2 }}>vs mes anterior</div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-6">
                    <MetricMini icon="bi-calendar-check" label="Días con gasto"
                      value={loadingG ? "—" : String(new Set(dailyData.filter(d=>d.total>0).map(d=>d.day)).size)}
                      sub={`de ${new Date().getDate()} días`} />
                  </div>
                  <div className="col-6">
                    <MetricMini icon="bi-lightning-charge" label="Día más caro"
                      value={loadingG||dailyData.length===0 ? "—" : `Día ${dailyData.reduce((a,b)=>a.total>=b.total?a:b).day}`}
                      sub={loadingG||dailyData.length===0 ? "" : currency.format(Math.max(...dailyData.map(d=>d.total)))} />
                  </div>
                  <div className="col-12">
                    <div className="card-g p-4">
                      <div className="section-title mb-3">Acciones rápidas</div>
                      <div className="d-flex flex-wrap gap-2">
                        <Link to="/gastos" className="btn-accent" style={{ textDecoration:"none", fontSize:13 }}>
                          <i className="bi bi-plus-circle" /> Nuevo gasto
                        </Link>
                        <Link to="/gastos" className="btn-outline-g" style={{ textDecoration:"none", fontSize:13 }}>
                          <i className="bi bi-list-ul" /> Ver todos
                        </Link>
                        <Link to="/metodos-pago" className="btn-outline-g" style={{ textDecoration:"none", fontSize:13 }}>
                          <i className="bi bi-credit-card" /> Métodos de pago
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab Finanzas ── */}
        {dashTab === "finanzas" && (
          <div>
            {/* KPIs financieros */}
            <div className="row g-3 mb-3">
              {[
                { label:"Ingresos del mes",  value: currency.format(finSummary?.totalIncome  ?? 0), icon:"bi-arrow-down-circle", color:"var(--success)", bg:"rgba(34,197,94,.1)" },
                { label:"Tasa de ahorro",    value: `${(finSummary?.savingsRate ?? 0).toFixed(1)}%`,  icon:"bi-piggy-bank",       color:"var(--accent)",  bg:"var(--accent-soft)" },
                { label:"Ahorro neto",       value: currency.format(finSummary?.netSavings   ?? 0), icon:"bi-safe",             color:(finSummary?.netSavings??0)>=0?"var(--success)":"var(--danger)", bg:"rgba(34,197,94,.1)" },
                { label:"Proyección anual",  value: currency.format((finSummary?.netSavings ?? 0)*12), icon:"bi-graph-up-arrow", color:"var(--accent)",  bg:"var(--accent-soft)" },
              ].map(s => (
                <div key={s.label} className="col-6 col-md-3">
                  <div style={{ background:"var(--surface-alt)", border:"1px solid var(--border)",
                    borderRadius:"var(--radius-md)", padding:"16px", display:"flex", gap:12, alignItems:"center" }}>
                    <div style={{ width:38, height:38, borderRadius:"var(--radius-sm)", background:s.bg,
                      display:"grid", placeItems:"center", color:s.color, fontSize:18, flexShrink:0 }}>
                      <i className={`bi ${s.icon}`} />
                    </div>
                    <div>
                      <div style={{ fontSize:11, color:"var(--muted)", marginBottom:2 }}>{s.label}</div>
                      <div style={{ fontSize:16, fontWeight:800, color:s.color }}>{s.value}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Meta de ahorro */}
            {finSummary?.savingsGoal > 0 && (
              <div className="card-g p-4 mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <div className="section-title" style={{ marginBottom:0 }}>Meta de ahorro mensual</div>
                    <div className="section-sub" style={{ marginBottom:0 }}>
                      {currency.format(finSummary.netSavings)} de {currency.format(finSummary.savingsGoal)}
                    </div>
                  </div>
                  <span style={{ fontSize:18, fontWeight:900,
                    color: (finSummary.goalProgress??0) >= 100 ? "var(--success)" : "var(--accent)" }}>
                    {(finSummary.goalProgress??0).toFixed(0)}%
                  </span>
                </div>
                <div style={{ height:10, background:"var(--border)", borderRadius:5, overflow:"hidden" }}>
                  <div style={{ width:`${Math.min(finSummary.goalProgress??0, 100)}%`, height:"100%",
                    background:"linear-gradient(90deg,var(--accent),#a89bf9)",
                    transition:"width 1s ease", borderRadius:5 }} />
                </div>
              </div>
            )}

            {/* Tendencia 6 meses */}
            {trend?.length > 0 && (
              <div className="card-g p-4">
                <div className="section-title mb-1">Tendencia: ingresos vs gastos</div>
                <div className="section-sub" style={{ marginBottom:16 }}>
                  Últimos 6 meses — {trend[0]?.label} → {trend[trend.length-1]?.label}
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={trend} margin={{ top:4, right:4, bottom:0, left:0 }}>
                    <defs>
                      <linearGradient id="gI" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize:11, fill:"var(--muted)" }} tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={v=>`$${(v/1000000).toFixed(1)}M`}
                      tick={{ fontSize:10, fill:"var(--muted)" }} tickLine={false} axisLine={false} width={50} />
                    <Tooltip contentStyle={{ background:"var(--surface)", border:"1px solid var(--border)",
                      borderRadius:"var(--radius-md)", fontSize:12 }} formatter={v=>[currency.format(v)]} />
                    <Area type="monotone" dataKey="income"   name="Ingresos"
                      stroke="#22c55e" fill="url(#gI)" strokeWidth={2.5} dot={{ r:3, fill:"#22c55e" }} />
                    <Area type="monotone" dataKey="expenses" name="Gastos"
                      stroke="#ef4444" fill="url(#gE)" strokeWidth={2.5} dot={{ r:3, fill:"#ef4444" }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* ── Tab Social ── */}
        {dashTab === "social" && (
          <div>
            <div className="row g-3 mb-3">
              {[
                { icon:"bi-people",            label:"Balance grupal",
                  value: `${grupalBalance>=0?"+":""}${currency.format(grupalBalance)}`,
                  sub: grupalBalance>=0 ? "te deben en grupos" : "debes en grupos",
                  color: grupalBalance>=0 ? "var(--success)" : "var(--danger)" },
                { icon:"bi-arrow-up-circle",   label:"Te deben",
                  value: currency.format(teDebenTotal), sub:"préstamos pendientes",
                  color:"var(--success)" },
                { icon:"bi-arrow-down-circle", label:"Debes",
                  value: currency.format(debesTotal), sub:"deudas activas",
                  color: debesTotal>0 ? "var(--danger)" : "var(--text)" },
              ].map(s => (
                <div key={s.label} className="col-12 col-sm-4">
                  <div style={{ background:"var(--surface-alt)", border:"1px solid var(--border)",
                    borderRadius:"var(--radius-md)", padding:"18px 20px" }}>
                    <div style={{ fontSize:11, fontWeight:600, color:"var(--muted)",
                      textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:8 }}>
                      <i className={`bi ${s.icon} me-1`} /> {s.label}
                    </div>
                    <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.value}</div>
                    <div style={{ fontSize:12, color:"var(--muted)", marginTop:3 }}>{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Insights */}
            <div className="card-g p-4 mb-3">
              <div className="d-flex align-items-center gap-2 mb-3">
                <div style={{ width:32, height:32, borderRadius:"var(--radius-sm)",
                  background:"linear-gradient(135deg,#7c6ff7,#a89bf9)",
                  display:"grid", placeItems:"center", color:"#fff", fontSize:16 }}>
                  <i className="bi bi-stars" />
                </div>
                <div>
                  <div className="section-title" style={{ marginBottom:0 }}>Análisis del mes</div>
                  <div className="section-sub" style={{ marginBottom:0, fontSize:11 }}>Resumen inteligente</div>
                </div>
              </div>
              {insights.length === 0 ? (
                <div className="empty-state" style={{ padding:"20px 0" }}>
                  <i className="bi bi-lightbulb d-block"/><p>Registra más gastos para ver tu análisis.</p>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {insights.map((ins, i) => <InsightItem key={i} {...ins} />)}
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="d-flex gap-2 flex-wrap">
              <Link to="/grupos" className="btn-outline-g" style={{ textDecoration:"none", fontSize:13 }}>
                <i className="bi bi-people" /> Ver grupos
              </Link>
              <Link to="/deudas" className="btn-outline-g" style={{ textDecoration:"none", fontSize:13 }}>
                <i className="bi bi-arrow-left-right" /> Mis deudas
              </Link>
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  );
}

/* ── Insights engine ─────────────────────────────────────────────── */
function buildInsights(summary, history, grupos, deudas) {
  if (!summary) return [];
  const out = [];

  // 1. Cambio vs mes anterior
  if (summary.changePercentage != null && summary.previousMonthTotal > 0) {
    const pct = Math.abs(summary.changePercentage);
    if (pct >= 5) {
      const up = summary.changePercentage > 0;
      out.push({
        icon: up ? "bi-arrow-up-right" : "bi-arrow-down-right",
        tone: up ? "danger" : "success",
        title: `${up ? "Gastaste" : "Ahorraste"} ${pct.toFixed(0)}% ${up ? "más" : "menos"} que el mes pasado`,
        text: `${currency.format(summary.currentMonthTotal)} vs ${currency.format(summary.previousMonthTotal)}`,
      });
    } else {
      out.push({
        icon: "bi-check-circle",
        tone: "info",
        title: "Tu gasto se mantiene estable",
        text: `Variación de solo ${pct.toFixed(1)}% vs mes anterior.`,
      });
    }
  }

  // 2. Top categoría
  if (summary.topCategory && summary.topCategoryAmount > 0 && summary.currentMonthTotal > 0) {
    const pct = (summary.topCategoryAmount / summary.currentMonthTotal) * 100;
    if (pct > 35) {
      out.push({
        icon: "bi-pie-chart",
        tone: "warning",
        title: `${summary.topCategory} concentra el ${pct.toFixed(0)}% de tu gasto`,
        text: `Considera diversificar o revisar este rubro.`,
      });
    }
  }

  // 3. Promedio histórico
  if (history && history.length >= 3) {
    const prev = history.slice(0, -1);
    const avg  = prev.reduce((a, h) => a + (h.total ?? 0), 0) / prev.length;
    if (avg > 0 && summary.currentMonthTotal > avg * 1.2) {
      const pct = ((summary.currentMonthTotal - avg) / avg) * 100;
      out.push({
        icon: "bi-graph-up-arrow",
        tone: "danger",
        title: `Estás ${pct.toFixed(0)}% sobre tu promedio histórico`,
        text: `Promedio últimos ${prev.length} meses: ${currency.format(avg)}.`,
      });
    } else if (avg > 0 && summary.currentMonthTotal < avg * 0.8) {
      out.push({
        icon: "bi-piggy-bank",
        tone: "success",
        title: `¡Buen mes! Estás bajo tu promedio`,
        text: `Llevas ${currency.format(summary.currentMonthTotal)} vs promedio de ${currency.format(avg)}.`,
      });
    }
  }

  // 4. Deudas pendientes
  const debes = (deudas ?? []).filter(d => d.type === "BORROWED")
    .reduce((a, d) => a + (d.remainingAmount ?? 0), 0);
  if (debes > 0) {
    out.push({
      icon: "bi-exclamation-triangle",
      tone: "warning",
      title: `Tienes ${currency.format(debes)} en deudas activas`,
      text: `Considera priorizarlas para evitar acumular intereses mentales.`,
    });
  }

  // 5. Por cobrar
  const teDeben = (deudas ?? []).filter(d => d.type === "LENT")
    .reduce((a, d) => a + (d.remainingAmount ?? 0), 0);
  if (teDeben > 0) {
    out.push({
      icon: "bi-cash-stack",
      tone: "info",
      title: `Te deben ${currency.format(teDeben)}`,
      text: `Recuérdale a tus contactos pendientes.`,
    });
  }

  // 6. Balance grupal
  const balanceGrupal = (grupos ?? []).reduce((a, g) => a + (g.myBalance ?? 0), 0);
  if (balanceGrupal < -5000) {
    out.push({
      icon: "bi-people",
      tone: "warning",
      title: `Debes ${currency.format(Math.abs(balanceGrupal))} en grupos`,
      text: `Salda tus cuotas para no quedar moroso.`,
    });
  }

  return out.slice(0, 5);
}

const TONE_STYLES = {
  success: { bg: "rgba(34,197,94,.10)",  color: "var(--success)" },
  danger:  { bg: "rgba(239,68,68,.10)",  color: "var(--danger)" },
  warning: { bg: "rgba(245,158,11,.10)", color: "var(--warning)" },
  info:    { bg: "rgba(59,130,246,.10)", color: "var(--info)" },
};

function InsightItem({ icon, tone, title, text }) {
  const s = TONE_STYLES[tone] ?? TONE_STYLES.info;
  return (
    <div style={{
      display: "flex", gap: 10, padding: 12,
      background: s.bg, borderRadius: "var(--radius-sm)",
      borderLeft: `3px solid ${s.color}`,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        background: s.color, color: "#fff",
        display: "grid", placeItems: "center", flexShrink: 0, fontSize: 14,
      }}>
        <i className={`bi ${icon}`} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", lineHeight: 1.3 }}>
          {title}
        </div>
        <div style={{ fontSize: 11.5, color: "var(--text-light)", marginTop: 2 }}>
          {text}
        </div>
      </div>
    </div>
  );
}

function MonthTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)", padding: "10px 14px",
      boxShadow: "var(--shadow-md)", fontSize: 12,
    }}>
      <div style={{ color: "var(--muted)", marginBottom: 4 }}>{p.label} {p.month?.slice(0,4)}</div>
      <div style={{ fontWeight: 700, color: "var(--accent)" }}>{currency.format(p.total)}</div>
      <div style={{ color: "var(--muted)", fontSize: 11, marginTop: 2 }}>
        {p.transactions} transaccion{p.transactions !== 1 ? "es" : ""}
      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────── */
function MetricMini({ icon, label, value, sub }) {
  return (
    <div className="card-g p-3" style={{ height: "100%" }}>
      <div className="d-flex align-items-center gap-2 mb-2">
        <div style={{
          width: 32, height: 32, borderRadius: "var(--radius-sm)",
          background: "var(--accent-soft)", color: "var(--accent)",
          display: "grid", placeItems: "center", fontSize: 15,
        }}>
          <i className={`bi ${icon}`} />
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {label}
        </div>
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function SkeletonChart() {
  return (
    <div style={{ height: 220, display: "flex", alignItems: "flex-end", gap: 6, opacity: 0.35 }}>
      {[40, 70, 55, 90, 60, 80, 45, 95, 50, 75].map((h, i) => (
        <div key={i} style={{ flex: 1, height: `${h}%`, background: "var(--border)", borderRadius: 4 }} />
      ))}
    </div>
  );
}

function SkeletonCats() {
  return (
    <div style={{ opacity: 0.45 }}>
      {[1, 2, 3].map((n) => (
        <div key={n} className="cat-row">
          <div className="cat-icon" style={{ background: "var(--border)" }} />
          <div className="cat-bar-wrap">
            <div style={{ height: 10, background: "var(--border)", borderRadius: 4, width: "60%", marginBottom: 6 }} />
            <div className="cat-bar">
              <div className="cat-bar-fill" style={{ width: `${n * 25}%` }} />
            </div>
          </div>
          <div className="cat-pct">—</div>
        </div>
      ))}
    </div>
  );
}
