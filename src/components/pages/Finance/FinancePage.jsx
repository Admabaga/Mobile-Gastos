import React, { useState, useMemo } from "react";
import { useFetch } from "../../../hooks/useFetch";
import { useToast } from "../../../context/ToastContext";
import { financeService } from "../../../services/financeService";
import {
  RadialBarChart, RadialBar, PolarAngleAxis,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
  LineChart, Line,
} from "recharts";

/* ── helpers ─────────────────────────────────────────────────────── */
const fmt = (v) =>
  new Intl.NumberFormat("es-CO", { style:"currency", currency:"COP", maximumFractionDigits:0 })
    .format(v ?? 0);
const pct = (v) => `${(v ?? 0).toFixed(1)}%`;

const INCOME_TYPES  = ["SALARY","FREELANCE","BONUS","OTHER"];
const INCOME_LABELS = { SALARY:"Salario", FREELANCE:"Freelance", BONUS:"Bonificación", OTHER:"Otro" };
const INCOME_ICONS  = { SALARY:"bi-briefcase", FREELANCE:"bi-laptop", BONUS:"bi-gift", OTHER:"bi-cash" };
const TYPE_COLORS   = { SALARY:"#7c6ff7", FREELANCE:"#3b82f6", BONUS:"#22c55e", OTHER:"#f59e0b" };

const REPORT_OPTIONS = [
  { id:"NONE",                label:"Sin reportes",         desc:"" },
  { id:"MONTHLY",             label:"Mensual",              desc:"PDF completo el día 1 de cada mes" },
  { id:"MONTHLY_AND_PARTIAL", label:"Mensual + Parcial",    desc:"Parcial día 15 · Completo día 1" },
];

function formatDate(v) {
  if (!v) return "";
  const [y,m,d] = String(v).split("-");
  return new Date(Number(y),Number(m)-1,Number(d))
    .toLocaleDateString("es-CO",{ month:"short", day:"2-digit" });
}

/* ── Gauge de ahorro (RadialBar) ─────────────────────────────────── */
function SavingsGauge({ rate, goal, netSavings }) {
  const clamped = Math.min(Math.max(rate ?? 0, 0), 100);
  const color = clamped >= 20 ? "#22c55e" : clamped >= 10 ? "#f59e0b" : "#ef4444";
  const data = [{ value: clamped, fill: color }];
  return (
    <div style={{ width:"100%", maxWidth:240, margin:"0 auto" }}>
      {/* ── Arco del gauge ── */}
      <div style={{ position:"relative" }}>
        <ResponsiveContainer width="100%" height={130}>
          <RadialBarChart
            cx="50%" cy="100%"
            innerRadius="60%" outerRadius="95%"
            startAngle={180} endAngle={0}
            data={data}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar
              background={{ fill:"var(--border)" }}
              dataKey="value" cornerRadius={6}
              isAnimationActive animationDuration={1200}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        {/* Etiquetas 0% / 100% en las esquinas del diámetro */}
        <div style={{ position:"absolute", bottom:2, left:6,
          fontSize:10, fontWeight:600, color:"var(--muted)" }}>0%</div>
        <div style={{ position:"absolute", bottom:2, right:6,
          fontSize:10, fontWeight:600, color:"var(--muted)" }}>100%</div>
      </div>

      {/* ── Porcentaje y etiqueta DEBAJO del arco ── */}
      <div style={{ textAlign:"center", marginTop:12 }}>
        <div style={{ fontSize:34, fontWeight:900, color, lineHeight:1 }}>
          {pct(clamped)}
        </div>
        <div style={{ fontSize:11, color:"var(--muted)", marginTop:5,
          textTransform:"uppercase", letterSpacing:"0.6px", fontWeight:600 }}>
          Tasa de ahorro
        </div>
        {goal > 0 && (
          <div style={{ fontSize:11, color:"var(--text-light)", marginTop:6,
            background:"var(--surface-alt)", borderRadius:"var(--radius-sm)",
            padding:"5px 10px", display:"inline-block" }}>
            Meta {fmt(goal)} · Ahorrado {fmt(netSavings)}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Tooltip personalizado ───────────────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"var(--surface)", border:"1px solid var(--border)",
      borderRadius:"var(--radius-md)", padding:"10px 14px",
      boxShadow:"var(--shadow-md)", fontSize:12 }}>
      <div style={{ color:"var(--muted)", marginBottom:4 }}>{label}</div>
      {payload.map((p,i) => (
        <div key={i} style={{ color: p.color, fontWeight:700 }}>
          {p.name}: {fmt(p.value)}
        </div>
      ))}
    </div>
  );
}

/* ── Consejos financieros avanzados ──────────────────────────────── */
function buildAdvice(income, expenses, savings, rate, goal, goalPct, allIncomes) {
  if (!income || income === 0) return [{
    icon:"bi-bar-chart-line", tone:"info",
    title:"Registra tus ingresos para comenzar",
    body:"Sin datos de ingresos no puedo calcular tu salud financiera. El primer paso es registrar tu salario mensual.",
  }];

  const tips = [];
  const monthlyProjection = savings * 12;
  const savingsInCOP = savings;

  // 1. Diagnóstico principal
  if (rate < 0) {
    tips.push({ icon:"bi-exclamation-triangle", tone:"danger",
      title:`Déficit de ${fmt(Math.abs(savings))} este mes`,
      body:`Gastas más de lo que ganas. Identifica gastos no esenciales: suscripciones, comer fuera o compras impulsivas. La regla de emergencia es recortar hasta estabilizar.`,
    });
  } else if (rate < 10) {
    tips.push({ icon:"bi-dash-circle", tone:"warning",
      title:`Tasa de ahorro baja: ${pct(rate)}`,
      body:`La regla 50/30/20 recomienda destinar 20% al ahorro. Con tus ingresos de ${fmt(income)}, deberías ahorrar mínimo ${fmt(income*0.2)}/mes. Actualmente ahorras ${fmt(savings)}.`,
    });
  } else if (rate < 20) {
    tips.push({ icon:"bi-graph-up", tone:"warning",
      title:`Ahorro en progreso: ${pct(rate)} — meta: 20%`,
      body:`Vas bien pero hay margen. Para llegar al 20% necesitas reducir gastos en ${fmt(income*0.2 - savings)}/mes. Revisa el rubro de mayor gasto en tu Dashboard.`,
    });
  } else if (rate < 30) {
    tips.push({ icon:"bi-check2-circle", tone:"success",
      title:`Buen ahorro: ${pct(rate)} — superas el mínimo recomendado`,
      body:`Cumples la regla 50/30/20. Considera destinar el excedente a: fondo de emergencia (3-6 meses de gastos = ${fmt(expenses*4.5)}), CDTs o fondos de inversión.`,
    });
  } else {
    tips.push({ icon:"bi-trophy", tone:"success",
      title:`Ahorro excelente: ${pct(rate)} — nivel de experto`,
      body:`Ahorras más del 30%. Con ${fmt(savingsInCOP)}/mes acumularías ${fmt(monthlyProjection)} en 12 meses. Es momento de diversificar: ETFs, fondos de renta variable o bienes raíces.`,
    });
  }

  // 2. Proyección anual
  if (savings > 0) {
    const cdtRate = 0.12;
    const cdtYield = monthlyProjection * cdtRate;
    tips.push({ icon:"bi-calendar2-check", tone:"info",
      title:`Proyección: ${fmt(monthlyProjection)} en 12 meses`,
      body:`Si mantienes este ritmo, en 1 año tendrías ${fmt(monthlyProjection)}. En un CDT al 12% anual generarías ${fmt(cdtYield)} adicionales en intereses.`,
    });
  }

  // 3. Meta de ahorro
  if (goal > 0) {
    const progress = Math.min((savings / goal) * 100, 100);
    const missing  = Math.max(goal - savings, 0);
    if (progress >= 100) {
      tips.push({ icon:"bi-bullseye", tone:"success",
        title:"Meta de ahorro alcanzada este mes",
        body:`Superaste tu objetivo de ${fmt(goal)}. El excedente de ${fmt(savings - goal)} debería ir a un fondo de emergencia o inversión.`,
      });
    } else {
      tips.push({ icon:"bi-bullseye", tone:"warning",
        title:`Meta al ${pct(progress)} — faltan ${fmt(missing)}`,
        body:`Para alcanzar ${fmt(goal)}, necesitas reducir gastos en ${fmt(missing)} este mes. Revisa los gastos variables primero.`,
      });
    }
  }

  // 4. Fondo de emergencia
  const emergencyFund = expenses * 6;
  tips.push({ icon:"bi-shield-check", tone:"info",
    title:`Fondo de emergencia recomendado: ${fmt(emergencyFund)}`,
    body:`Los expertos recomiendan tener 6 meses de gastos disponibles (${fmt(expenses)}/mes × 6). Este fondo debe estar en una cuenta de alto rendimiento o CDT a 30 días.`,
  });

  // 5. Consejo de diversificación si ahorra bien
  if (rate >= 20 && income > 0) {
    tips.push({ icon:"bi-pie-chart", tone:"success",
      title:"Regla de diversificación de inversiones",
      body:`Con tu nivel de ahorro sugiero: 50% liquidez (CDTs 30-90 días), 30% renta variable (fondos o ETFs), 20% crecimiento (finca raíz o emprendimiento). Consulta un asesor certificado.`,
    });
  }

  return tips.slice(0, 5);
}

// Tones → clases CSS definidas en theme.css (se adaptan a dark/light automáticamente)

/* ── CalendarTab ─────────────────────────────────────────────────── */
function CalendarTab({ allIncomes }) {
  const today = new Date();
  const [calYear,  setCalYear]  = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth() + 1); // 1-indexed
  const [selected, setSelected] = useState(null); // day number selected

  const { data: spents, loading: loadingS } = useFetch(
    () => financeService.getCalendarSpents(calYear, calMonth),
    [calYear, calMonth]
  );

  const prevMonth = () => {
    if (calMonth === 1) { setCalYear(y => y - 1); setCalMonth(12); }
    else setCalMonth(m => m - 1);
    setSelected(null);
  };
  const nextMonth = () => {
    if (calMonth === 12) { setCalYear(y => y + 1); setCalMonth(1); }
    else setCalMonth(m => m + 1);
    setSelected(null);
  };

  const daysInMonth = new Date(calYear, calMonth, 0).getDate();
  // 0=Dom, shift to Mon-first
  const rawFirst   = new Date(calYear, calMonth - 1, 1).getDay();
  const firstOffset = rawFirst === 0 ? 6 : rawFirst - 1; // Mon=0, ..., Sun=6

  // Agregados por día
  const spentByDay = useMemo(() => {
    const map = {};
    (spents ?? []).forEach(s => {
      if (!s.date) return;
      const d = parseInt(s.date.split("-")[2], 10);
      if (!map[d]) map[d] = { total: 0, items: [] };
      map[d].total += s.amount ?? 0;
      map[d].items.push(s);
    });
    return map;
  }, [spents]);

  const incomeByDay = useMemo(() => {
    const map = {};
    (allIncomes ?? []).forEach(inc => {
      if (!inc.date) return;
      const [y, m, d] = inc.date.split("-").map(Number);
      if (y === calYear && m === calMonth) {
        if (!map[d]) map[d] = { total: 0, items: [] };
        map[d].total += inc.amount ?? 0;
        map[d].items.push(inc);
      }
    });
    return map;
  }, [allIncomes, calYear, calMonth]);

  const maxSpent = useMemo(() =>
    Math.max(...Object.values(spentByDay).map(v => v.total), 1), [spentByDay]);

  const monthName = new Date(calYear, calMonth - 1, 1)
    .toLocaleString("es-CO", { month: "long", year: "numeric" });
  const DAYS = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];

  const selectedSpents  = selected ? (spentByDay[selected]?.items ?? [])  : [];
  const selectedIncomes = selected ? (incomeByDay[selected]?.items ?? []) : [];

  return (
    <div>
      {/* ── Navegación mes ── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <button onClick={prevMonth} style={{ background:"var(--surface-alt)", border:"1px solid var(--border)",
          borderRadius:"var(--radius-sm)", cursor:"pointer", width:34, height:34,
          display:"grid", placeItems:"center", color:"var(--muted)", fontSize:16 }}>
          <i className="bi bi-chevron-left" />
        </button>
        <div style={{ fontSize:15, fontWeight:800, color:"var(--text)", textTransform:"capitalize" }}>
          {monthName}
        </div>
        <button onClick={nextMonth} style={{ background:"var(--surface-alt)", border:"1px solid var(--border)",
          borderRadius:"var(--radius-sm)", cursor:"pointer", width:34, height:34,
          display:"grid", placeItems:"center", color:"var(--muted)", fontSize:16 }}>
          <i className="bi bi-chevron-right" />
        </button>
      </div>

      {/* ── Cabecera días ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:6 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign:"center", fontSize:10.5, fontWeight:700,
            color:"var(--muted)", paddingBottom:6, letterSpacing:"0.3px" }}>{d}</div>
        ))}
      </div>

      {/* ── Grid días ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
        {/* Offsets vacíos */}
        {Array.from({ length: firstOffset }).map((_, i) => <div key={`off${i}`} />)}

        {/* Días del mes */}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const daySpent   = spentByDay[day];
          const dayIncome  = incomeByDay[day];
          const isToday    = day === today.getDate() && calMonth === today.getMonth() + 1 && calYear === today.getFullYear();
          const isSelected = selected === day;
          const heatOpacity = daySpent ? Math.max(0.08, (daySpent.total / maxSpent) * 0.4) : 0;

          return (
            <button key={day} onClick={() => setSelected(isSelected ? null : day)}
              style={{
                border: isSelected ? "2px solid var(--accent)" : isToday ? "2px solid var(--accent)" : "1px solid transparent",
                borderRadius:10, cursor:"pointer", padding:"6px 2px",
                display:"flex", flexDirection:"column", alignItems:"center", gap:2,
                background: isSelected ? "var(--accent-soft)" :
                  isToday ? "var(--accent-soft)" :
                  daySpent ? `rgba(239,68,68,${heatOpacity})` : "transparent",
                transition:"all .15s", minHeight:54, position:"relative",
              }}>
              <span style={{ fontSize:13, fontWeight: isToday ? 800 : 500,
                color: isToday || isSelected ? "var(--accent)" : "var(--text)", lineHeight:1 }}>
                {day}
              </span>
              {daySpent && (
                <span style={{ fontSize:9, fontWeight:700, color:"var(--danger)",
                  lineHeight:1, maxWidth:"100%", overflow:"hidden", textOverflow:"ellipsis",
                  whiteSpace:"nowrap", paddingInline:2 }}>
                  {fmt(daySpent.total).replace("$","").replace(".000","k")}
                </span>
              )}
              {/* Dots: ingreso (verde) */}
              {(daySpent || dayIncome) && (
                <div style={{ display:"flex", gap:2, alignItems:"center" }}>
                  {dayIncome && <span style={{ width:5, height:5, borderRadius:"50%", background:"var(--success)", display:"inline-block" }} />}
                  {daySpent  && <span style={{ width:5, height:5, borderRadius:"50%", background:"var(--danger)",  display:"inline-block" }} />}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Leyenda ── */}
      <div style={{ display:"flex", gap:16, marginTop:12, fontSize:11, color:"var(--muted)", flexWrap:"wrap" }}>
        <span style={{ display:"flex", alignItems:"center", gap:4 }}>
          <span style={{ width:7, height:7, borderRadius:"50%", background:"var(--success)", display:"inline-block" }} />
          Ingreso
        </span>
        <span style={{ display:"flex", alignItems:"center", gap:4 }}>
          <span style={{ width:7, height:7, borderRadius:"50%", background:"var(--danger)", display:"inline-block" }} />
          Gasto
        </span>
        <span style={{ display:"flex", alignItems:"center", gap:4 }}>
          <span style={{ width:14, height:7, borderRadius:3, background:"rgba(239,68,68,0.35)", border:"1px solid transparent", display:"inline-block" }} />
          Más gastado
        </span>
      </div>

      {/* ── Panel de detalle del día ── */}
      {selected && (
        <div style={{ marginTop:16, borderRadius:12, border:"1px solid var(--border)",
          background:"var(--surface-alt)", overflow:"hidden",
          animation:"fadeIn .2s ease" }}>
          <div style={{ padding:"12px 16px", borderBottom:"1px solid var(--border)",
            display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontWeight:700, fontSize:14 }}>
              {new Date(calYear, calMonth - 1, selected)
                .toLocaleDateString("es-CO", { weekday:"long", day:"numeric", month:"long" })}
            </span>
            <button onClick={() => setSelected(null)}
              style={{ background:"none", border:"none", cursor:"pointer", color:"var(--muted)", fontSize:18 }}>
              <i className="bi bi-x" />
            </button>
          </div>

          {selectedIncomes.length === 0 && selectedSpents.length === 0 && (
            <div style={{ padding:"20px 16px", textAlign:"center", color:"var(--muted)", fontSize:13 }}>
              Sin movimientos este día.
            </div>
          )}

          {selectedIncomes.map(inc => (
            <div key={inc.id} style={{ padding:"10px 16px", borderBottom:"1px solid var(--border)",
              display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:"rgba(34,197,94,.15)",
                  display:"grid", placeItems:"center", color:"var(--success)", fontSize:14 }}>
                  <i className="bi bi-arrow-down-circle" />
                </div>
                <div>
                  <div style={{ fontWeight:600, fontSize:13 }}>{inc.name}</div>
                  <div style={{ fontSize:11, color:"var(--muted)" }}>Ingreso</div>
                </div>
              </div>
              <span style={{ fontWeight:800, color:"var(--success)", fontSize:14 }}>+{fmt(inc.amount)}</span>
            </div>
          ))}

          {selectedSpents.map(s => (
            <div key={s.id} style={{ padding:"10px 16px", borderBottom:"1px solid var(--border)",
              display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:"rgba(239,68,68,.12)",
                  display:"grid", placeItems:"center", color:"var(--danger)", fontSize:14 }}>
                  <i className="bi bi-arrow-up-circle" />
                </div>
                <div>
                  <div style={{ fontWeight:600, fontSize:13 }}>{s.name}</div>
                  <div style={{ fontSize:11, color:"var(--muted)" }}>
                    {s.categoryName ?? "Sin categoría"}
                    {s.paymentMethodName ? ` · ${s.paymentMethodName}` : ""}
                  </div>
                </div>
              </div>
              <span style={{ fontWeight:800, color:"var(--danger)", fontSize:14 }}>-{fmt(s.amount)}</span>
            </div>
          ))}

          {(selectedSpents.length > 0 || selectedIncomes.length > 0) && (
            <div style={{ padding:"10px 16px", display:"flex", justifyContent:"space-between",
              fontSize:12.5, color:"var(--muted)" }}>
              <span>Balance del día</span>
              <span style={{ fontWeight:800,
                color: (selectedIncomes.reduce((s,i) => s + i.amount, 0) - selectedSpents.reduce((s,i) => s + i.amount, 0)) >= 0
                  ? "var(--success)" : "var(--danger)" }}>
                {fmt(selectedIncomes.reduce((s,i) => s + i.amount, 0) - selectedSpents.reduce((s,i) => s + i.amount, 0))}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── TendenciaTab ─────────────────────────────────────────────────── */
function TendenciaTab() {
  const { data: trend, loading } = useFetch(() => financeService.getTrend(), []);

  if (loading) return (
    <div style={{ display:"flex", justifyContent:"center", padding:40 }}>
      <div style={{ width:28, height:28, border:"3px solid var(--border)",
        borderTopColor:"var(--accent)", borderRadius:"50%", animation:"spin .7s linear infinite" }} />
    </div>
  );

  if (!trend?.length) return (
    <div className="empty-state"><i className="bi bi-graph-up d-block"/><p>Sin datos aún.</p></div>
  );

  const maxVal = Math.max(...trend.flatMap(t => [t.income, t.expenses])) * 1.1;

  return (
    <div>
      <div className="section-title mb-1">Tendencia de 6 meses</div>
      <div className="section-sub" style={{ marginBottom:20 }}>
        Ingresos vs Gastos — {trend[0]?.label} → {trend[trend.length-1]?.label}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={trend} margin={{ top:5, right:10, left:0, bottom:5 }}>
          <defs>
            <linearGradient id="gIncome"   x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="gExpenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.25}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="gSavings"  x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#7c6ff7" stopOpacity={0.25}/>
              <stop offset="95%" stopColor="#7c6ff7" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="label" tick={{ fontSize:12, fill:"var(--muted)" }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={v => `$${(v/1000000).toFixed(1)}M`}
            tick={{ fontSize:10, fill:"var(--muted)" }} axisLine={false} tickLine={false} width={52}
            domain={[0, maxVal]} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="income"   name="Ingresos"
            stroke="#22c55e" fill="url(#gIncome)"   strokeWidth={2.5} dot={{ r:3, fill:"#22c55e" }} />
          <Area type="monotone" dataKey="expenses" name="Gastos"
            stroke="#ef4444" fill="url(#gExpenses)" strokeWidth={2.5} dot={{ r:3, fill:"#ef4444" }} />
          <Area type="monotone" dataKey="savings"  name="Ahorro"
            stroke="#7c6ff7" fill="url(#gSavings)"  strokeWidth={2} strokeDasharray="5 4"
            dot={{ r:3, fill:"#7c6ff7" }} />
        </AreaChart>
      </ResponsiveContainer>

      {/* Resumen tabla */}
      <div style={{ marginTop:16, display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
        {[
          { label:"Mejor mes (ingresos)", value: fmt(Math.max(...trend.map(t=>t.income))), color:"var(--success)" },
          { label:"Peor mes (gastos)",    value: fmt(Math.max(...trend.map(t=>t.expenses))), color:"var(--danger)" },
          { label:"Ahorro acumulado",     value: fmt(trend.reduce((s,t)=>s+Math.max(t.savings,0),0)), color:"var(--accent)" },
        ].map(s => (
          <div key={s.label} style={{ background:"var(--surface-alt)", borderRadius:"var(--radius-sm)",
            padding:"10px 12px", textAlign:"center" }}>
            <div style={{ fontSize:14, fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:10, color:"var(--muted)", marginTop:3 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
export default function FinancePage() {
  const { push } = useToast();
  const { data:summary, loading, refetch }           = useFetch(() => financeService.getSummary(), []);
  const { data:allIncomes, refetch:refetchIncomes }  = useFetch(() => financeService.listIncomes(), []);

  const [showIncome,   setShowIncome]   = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [waLoading,    setWaLoading]    = useState(false);
  const [chartTab,     setChartTab]     = useState("resumen"); // "resumen" | "tendencia" | "calendario"

  // Filtros de la lista de ingresos
  const [incomeSearch, setIncomeSearch] = useState("");
  const [incomeType,   setIncomeType]   = useState("ALL");
  // "" = todos | "YYYY-MM" = mes específico
  const [incomeMonth,  setIncomeMonth]  = useState(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}`;
  });

  const reload = () => { refetch(); refetchIncomes(); };

  // Opciones del selector de mes: mes actual + 11 meses atrás + "Todos"
  const monthOptions = useMemo(() => {
    const opts = [{ value:"", label:"Todos" }];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      const label = d.toLocaleString("es-CO", { month:"long", year:"numeric" });
      opts.push({ value: val, label: label.charAt(0).toUpperCase() + label.slice(1) });
    }
    return opts;
  }, []);

  // Ingresos filtrados para la lista y la gráfica
  const filteredIncomes = useMemo(() => {
    return (allIncomes ?? []).filter((inc) => {
      if (incomeType !== "ALL" && inc.type !== incomeType) return false;
      if (incomeSearch && !inc.name.toLowerCase().includes(incomeSearch.toLowerCase())) return false;
      if (incomeMonth && inc.date) {
        const [y, m] = inc.date.split("-");
        if (`${y}-${m}` !== incomeMonth) return false;
      }
      return true;
    });
  }, [allIncomes, incomeType, incomeSearch, incomeMonth]);

  const filteredIncomeTotal = filteredIncomes.reduce((s, i) => s + (i.amount ?? 0), 0);

  // Datos para PieChart — refleja el filtro activo
  const incomeByType = useMemo(() => {
    const map = {};
    filteredIncomes.forEach(i => {
      map[i.type] = (map[i.type] ?? 0) + (i.amount ?? 0);
    });
    return Object.entries(map).map(([type,total]) => ({
      name: INCOME_LABELS[type] ?? type, total, fill: TYPE_COLORS[type] ?? "#8b7df8",
    }));
  }, [filteredIncomes]);

  // Área chart: últimos 6 meses simulados desde los ingresos disponibles
  const advice = useMemo(() => buildAdvice(
    summary?.totalIncome, summary?.totalExpenses,
    summary?.netSavings, summary?.savingsRate,
    summary?.savingsGoal, summary?.savingsGoalPct,
    allIncomes,
  ), [summary, allIncomes]);

  async function sendTest() {
    setWaLoading(true);
    try {
      await financeService.sendWaReport();
      push("Reporte enviado a tu WhatsApp", "success");
    } catch (e) {
      push(e?.response?.data?.message ?? "Error — vincula tu WhatsApp primero", "danger");
    } finally { setWaLoading(false); }
  }

  if (loading) return (
    <div className="card-g p-5 text-center">
      <div style={{ display:"inline-block", width:32, height:32,
        border:"3px solid var(--border)", borderTopColor:"var(--accent)",
        borderRadius:"50%", animation:"spin .7s linear infinite" }} />
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h1 style={{ fontSize:20, fontWeight:800, color:"var(--text)", marginBottom:2 }}>
            Mis Finanzas
          </h1>
          <p style={{ fontSize:13, color:"var(--muted)", margin:0 }}>
            Ingresos · Ahorros · Salud financiera
          </p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button onClick={sendTest} disabled={waLoading} className="btn-outline-g" style={{ fontSize:13 }}>
            <i className="bi bi-whatsapp me-1" style={{ color:"#25d366" }} />
            {waLoading ? "Generando..." : "Enviar reporte"}
          </button>
          <button onClick={() => setShowSettings(true)} className="btn-outline-g" style={{ fontSize:13 }}>
            <i className="bi bi-gear" /> Configurar
          </button>
          <button onClick={() => setShowIncome(true)}
            style={{ background:"var(--accent)", color:"#fff", border:"none",
              borderRadius:"var(--radius-sm)", padding:"9px 18px",
              fontSize:14, fontWeight:700, cursor:"pointer",
              display:"flex", alignItems:"center", gap:6 }}>
            <i className="bi bi-plus-lg" /> Ingreso
          </button>
        </div>
      </div>

      {/* Call-to-action si no hay ingresos */}
      {!summary?.totalIncome && (
        <div className="card-g p-4 mb-4" style={{
          background:"linear-gradient(135deg,#0d0c1d,#1a1840)",
          borderColor:"rgba(124,111,247,.3)" }}>
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div style={{ width:48, height:48, borderRadius:"var(--radius-sm)",
            background:"rgba(124,111,247,.2)", display:"grid", placeItems:"center" }}>
            <i className="bi bi-bar-chart-line" style={{ fontSize:22, color:"var(--accent)" }} />
          </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:15, fontWeight:800, color:"#fff", marginBottom:4 }}>
                Registra tus ingresos para empezar
              </div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,.5)" }}>
                moni calcula tu tasa de ahorro, proyección anual y consejos personalizados con base en tus datos reales.
              </div>
            </div>
            <button onClick={() => setShowIncome(true)}
              style={{ background:"var(--accent)", color:"#fff", border:"none",
                borderRadius:"var(--radius-sm)", padding:"10px 20px",
                fontSize:13, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
              Registrar salario
            </button>
          </div>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div className="row g-3 mb-4">
        {[
          { label:"Ingresos del mes",  value:fmt(summary?.totalIncome),  icon:"bi-arrow-down-circle",
            color:"var(--success)", bg:"rgba(34,197,94,.1)" },
          { label:"Gastos del mes",    value:fmt(summary?.totalExpenses), icon:"bi-arrow-up-circle",
            color:"var(--danger)", bg:"rgba(239,68,68,.1)" },
          { label:"Ahorro neto",       value:fmt(summary?.netSavings),    icon:"bi-piggy-bank",
            color:(summary?.netSavings??0)>=0?"var(--success)":"var(--danger)",
            bg:(summary?.netSavings??0)>=0?"rgba(34,197,94,.1)":"rgba(239,68,68,.1)" },
          { label:"Libre disponible",
            value: fmt(Math.max((summary?.netSavings??0) - (summary?.savingsGoal??0), 0)),
            icon:"bi-wallet2", color:"var(--accent)", bg:"var(--accent-soft)",
            sub: summary?.savingsGoal > 0 ? `meta: ${fmt(summary.savingsGoal)}` : "sin meta configurada" },
        ].map((s) => (
          <div key={s.label} className="col-6 col-md-3">
            <div className="stat-card">
              <div className="stat-icon" style={{ background:s.bg, color:s.color }}>
                <i className={`bi ${s.icon}`} />
              </div>
              <div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ fontSize:15, color:s.color }}>{s.value}</div>
                {s.sub && <div style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>{s.sub}</div>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs de análisis ── */}
      <div className="card-g mb-4" style={{ overflow:"hidden" }}>

        {/* Tab bar */}
        <div style={{ display:"flex", borderBottom:"1px solid var(--border)",
          overflowX:"auto", scrollbarWidth:"none" }}>
          {[
            { id:"resumen",    icon:"bi-bar-chart-line", label:"Resumen"    },
            { id:"tendencia",  icon:"bi-graph-up",       label:"Tendencia"  },
            { id:"calendario", icon:"bi-calendar3",      label:"Calendario" },
            { id:"analisis",   icon:"bi-lightbulb",      label:"Análisis"   },
          ].map(tab => (
            <button key={tab.id} onClick={() => setChartTab(tab.id)}
              style={{
                border:"none", background:"none", cursor:"pointer", whiteSpace:"nowrap",
                padding:"12px 18px", fontSize:13, fontWeight:600, display:"flex",
                alignItems:"center", gap:6, transition:"all .15s",
                color: chartTab === tab.id ? "var(--accent)" : "var(--muted)",
                borderBottom: chartTab === tab.id ? "2px solid var(--accent)" : "2px solid transparent",
                marginBottom:-1,
              }}>
              <i className={`bi ${tab.icon}`} style={{ fontSize:14 }} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ padding:20 }}>

          {/* ── Resumen ── */}
          {chartTab === "resumen" && (
            <div className="row g-3">
              {/* Gauge ahorro */}
              <div className="col-12 col-md-4">
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                  <div className="section-title mb-1 text-center w-100">Tasa de ahorro</div>
                  <div className="section-sub text-center w-100" style={{ marginBottom:12 }}>
                    {(summary?.savingsRate??0) >= 20 ? "Superas el 20% recomendado" :
                     (summary?.savingsRate??0) >= 10 ? "En progreso — meta: 20%" : "Crítico — reducí gastos"}
                  </div>
                  <SavingsGauge rate={summary?.savingsRate} goal={summary?.savingsGoal} netSavings={summary?.netSavings} />
                  {summary?.savingsGoal > 0 && (
                    <div style={{ width:"100%", marginTop:14 }}>
                      <div className="d-flex justify-content-between" style={{ fontSize:11, marginBottom:4 }}>
                        <span style={{ color:"var(--muted)" }}>Meta mensual</span>
                        <span style={{ fontWeight:700, color:"var(--accent)" }}>{pct(summary.goalProgress)}</span>
                      </div>
                      <div style={{ height:7, background:"var(--border)", borderRadius:4, overflow:"hidden" }}>
                        <div style={{ width:`${Math.min(summary.goalProgress??0,100)}%`, height:"100%",
                          background:"linear-gradient(90deg,var(--accent),#a89bf9)",
                          transition:"width .8s cubic-bezier(.4,0,.2,1)", borderRadius:4 }} />
                      </div>
                      <div className="d-flex justify-content-between" style={{ fontSize:10, marginTop:3, color:"var(--muted)" }}>
                        <span>{fmt(summary.netSavings)}</span><span>{fmt(summary.savingsGoal)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pie fuentes ingreso */}
              <div className="col-12 col-md-4">
                <div className="section-title mb-1">Fuentes de ingreso</div>
                <div className="section-sub">Distribución por tipo</div>
                {incomeByType.length === 0 ? (
                  <div className="empty-state" style={{ padding:"20px 0" }}>
                    <i className="bi bi-pie-chart d-block"/><p>Sin ingresos</p>
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={140}>
                      <PieChart>
                        <Pie data={incomeByType} dataKey="total" nameKey="name"
                          cx="50%" cy="50%" innerRadius={40} outerRadius={62}
                          paddingAngle={3} strokeWidth={0} isAnimationActive animationDuration={1000}>
                          {incomeByType.map((e,i) => <Cell key={i} fill={e.fill}/>)}
                        </Pie>
                        <Tooltip formatter={v=>[fmt(v)]}
                          contentStyle={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:"var(--radius-md)",fontSize:12}}/>
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                      {incomeByType.map(t => (
                        <div key={t.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", fontSize:12 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <div style={{ width:9, height:9, borderRadius:"50%", background:t.fill }} />
                            <span>{t.name}</span>
                          </div>
                          <span style={{ fontWeight:700 }}>{fmt(t.total)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Balance barras */}
              <div className="col-12 col-md-4">
                <div className="section-title mb-1">Balance del mes</div>
                <div className="section-sub">Ingresos vs Gastos</div>
                <div style={{ marginTop:14, display:"flex", flexDirection:"column", gap:12 }}>
                  {[
                    { label:"Ingresos", value:summary?.totalIncome??0,   color:"#22c55e" },
                    { label:"Gastos",   value:summary?.totalExpenses??0,  color:"#ef4444" },
                    { label:"Ahorro",   value:Math.max(summary?.netSavings??0,0), color:"#7c6ff7" },
                  ].map(row => {
                    const max = Math.max(summary?.totalIncome??1, 1);
                    const w   = Math.min((row.value/max)*100, 100);
                    return (
                      <div key={row.label}>
                        <div className="d-flex justify-content-between" style={{ fontSize:12, marginBottom:4 }}>
                          <span style={{ fontWeight:600 }}>{row.label}</span>
                          <span style={{ fontWeight:800, color:row.color }}>{fmt(row.value)}</span>
                        </div>
                        <div style={{ height:10, background:"var(--border)", borderRadius:5, overflow:"hidden" }}>
                          <div style={{ width:`${w}%`, height:"100%", borderRadius:5,
                            background:`linear-gradient(90deg,${row.color}99,${row.color})`,
                            transition:"width 1s cubic-bezier(.4,0,.2,1)" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop:16, display:"flex", flexDirection:"column", gap:6 }}>
                  {[
                    { label:"Gastos / Ingresos",
                      value:pct(((summary?.totalExpenses??0)/(summary?.totalIncome||1))*100),
                      color:(summary?.totalExpenses??0)/(summary?.totalIncome||1)>0.8?"var(--danger)":"var(--success)" },
                    { label:"Proyección anual", value:fmt((summary?.netSavings??0)*12), color:"var(--accent)" },
                  ].map(s => (
                    <div key={s.label} style={{ padding:"8px 12px", background:"var(--surface-alt)",
                      borderRadius:"var(--radius-sm)", display:"flex", justifyContent:"space-between" }}>
                      <span style={{ fontSize:11.5, color:"var(--muted)" }}>{s.label}</span>
                      <span style={{ fontSize:13, fontWeight:800, color:s.color }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Tendencia ── */}
          {chartTab === "tendencia" && <TendenciaTab />}

          {/* ── Calendario ── */}
          {chartTab === "calendario" && <CalendarTab allIncomes={allIncomes} />}

          {/* ── Análisis ── */}
          {chartTab === "analisis" && (
            <div>
              <div className="d-flex align-items-center gap-2 mb-3">
                <div style={{ width:32, height:32, borderRadius:"var(--radius-sm)",
                  background:"linear-gradient(135deg,#7c6ff7,#5b50d4)",
                  display:"grid", placeItems:"center", color:"#fff", fontSize:16 }}>
                  <i className="bi bi-lightbulb"/>
                </div>
                <div>
                  <div className="section-title" style={{ marginBottom:0 }}>Análisis financiero</div>
                  <div className="section-sub" style={{ marginBottom:0, fontSize:11 }}>
                    Regla 50/30/20 · CDTs · Fondo de emergencia · Inversión
                  </div>
                </div>
              </div>
              <div className="row g-3">
                {advice.map((tip, i) => (
                  <div key={i} className="col-12 col-lg-6">
                    <div className={`tip-card ${tip.tone ?? "info"}`}>
                      <div className={`tip-icon ${tip.tone ?? "info"}`}>
                        <i className={`bi ${tip.icon}`}/>
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div className="tip-title">{tip.title}</div>
                        <div className="tip-body">{tip.body}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Mis ingresos ── */}
      <div className="card-g" style={{ overflow:"hidden" }}>
        {/* Header */}
        <div style={{ padding:"14px 18px", borderBottom:"1px solid var(--border)",
          display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <span style={{ fontSize:13, fontWeight:700 }}>
              Mis ingresos ({filteredIncomes.length}
              {filteredIncomes.length !== (allIncomes?.length ?? 0) ? ` de ${allIncomes?.length ?? 0}` : ""})
            </span>
            {filteredIncomeTotal > 0 && (
              <span style={{ marginLeft:10, fontSize:12, color:"var(--success)", fontWeight:700 }}>
                Total: {fmt(filteredIncomeTotal)}
              </span>
            )}
          </div>
          <button onClick={() => setShowIncome(true)}
            style={{ background:"none", border:"1px solid var(--border)",
              borderRadius:"var(--radius-sm)", padding:"5px 12px",
              fontSize:12, fontWeight:600, cursor:"pointer",
              color:"var(--text-light)", display:"flex", alignItems:"center", gap:5 }}>
            <i className="bi bi-plus" /> Agregar
          </button>
        </div>

        {/* Filtros */}
        <div style={{ padding:"12px 18px", borderBottom:"1px solid var(--border)",
          display:"flex", flexWrap:"wrap", gap:8, alignItems:"center" }}>
          {/* Selector de mes */}
          <select value={incomeMonth} onChange={(e) => setIncomeMonth(e.target.value)}
            style={{ height:32, fontSize:12.5, fontWeight:600, border:"1px solid var(--border)",
              borderRadius:"var(--radius-sm)", padding:"0 10px", background:"var(--surface)",
              color:"var(--text)", cursor:"pointer", minWidth:150 }}>
            {monthOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {/* Tipo */}
          <div style={{ display:"flex", background:"var(--border)", borderRadius:"var(--radius-sm)", padding:3, gap:2 }}>
            {[["ALL","Todos"],["SALARY","Salario"],["FREELANCE","Freelance"],["BONUS","Bonif."],["OTHER","Otro"]].map(([v,l]) => (
              <button key={v} onClick={() => setIncomeType(v)}
                style={{ border:"none", cursor:"pointer", padding:"5px 10px",
                  borderRadius:"calc(var(--radius-sm) - 2px)", fontSize:12, fontWeight:600,
                  background: incomeType===v ? (TYPE_COLORS[v] ?? "var(--surface)") : "transparent",
                  color:      incomeType===v ? (v==="ALL" ? "var(--text)" : "#fff")  : "var(--muted)",
                  boxShadow:  incomeType===v ? "var(--shadow-sm)" : "none",
                  transition:"all .15s" }}>
                {l}
              </button>
            ))}
          </div>
          {/* Búsqueda */}
          <div style={{ flex:1, minWidth:160, position:"relative" }}>
            <i className="bi bi-search" style={{
              position:"absolute", left:9, top:"50%", transform:"translateY(-50%)",
              color:"var(--muted)", fontSize:12, pointerEvents:"none" }} />
            <input className="form-control" style={{ fontSize:12.5, paddingLeft:28, height:32 }}
              placeholder="Buscar ingreso…" value={incomeSearch}
              onChange={(e) => setIncomeSearch(e.target.value)} />
          </div>
        </div>

        {!allIncomes?.length ? (
          <div className="empty-state">
            <i className="bi bi-briefcase d-block" />
            <p>Sin ingresos registrados.</p>
          </div>
        ) : filteredIncomes.length === 0 ? (
          <div className="empty-state" style={{ padding:"32px 0" }}>
            <i className="bi bi-funnel d-block" />
            <p>Sin resultados para estos filtros.</p>
          </div>
        ) : filteredIncomes.map((inc) => (
          <div key={inc.id} className="gasto-item" style={{ borderBottom:"1px solid var(--border)" }}>
            <div className="gasto-icon"
              style={{ background:`${TYPE_COLORS[inc.type] ?? "#7c6ff7"}20`,
                color: TYPE_COLORS[inc.type] ?? "var(--accent)" }}>
              <i className={`bi ${INCOME_ICONS[inc.type] ?? "bi-cash"}`} />
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div className="gasto-name">{inc.name}</div>
              <div className="gasto-meta d-flex flex-wrap gap-2 mt-1">
                {inc.date && <span>{formatDate(inc.date)}</span>}
                <span className="badge-g" style={{
                  background:`${TYPE_COLORS[inc.type]}20`, color:TYPE_COLORS[inc.type],
                  border:`1px solid ${TYPE_COLORS[inc.type]}40` }}>
                  {INCOME_LABELS[inc.type] ?? inc.type}
                </span>
                {inc.isRecurring && (
                  <span className="badge-g green">
                    <i className="bi bi-arrow-repeat" /> Día {inc.dayOfMonth} c/mes
                  </span>
                )}
                {inc.notes && <span style={{ color:"var(--muted)", fontSize:11 }}>{inc.notes}</span>}
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div className="gasto-amount" style={{ color:"var(--success)", fontWeight:800 }}>
                +{fmt(inc.amount)}
              </div>
              <button onClick={async () => {
                  await financeService.deleteIncome(inc.id);
                  push("Ingreso eliminado","success"); reload();
                }}
                style={{ background:"none", border:"none", cursor:"pointer",
                  color:"var(--muted)", fontSize:15, padding:4 }}
                title="Eliminar">
                <i className="bi bi-trash" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showIncome && (
        <IncomeModal onClose={() => setShowIncome(false)}
          onSaved={() => { setShowIncome(false); reload(); push("Ingreso registrado ✓","success"); }} />
      )}
      {showSettings && (
        <SettingsModal current={summary} onClose={() => setShowSettings(false)}
          onSaved={() => { setShowSettings(false); reload(); push("Configuración guardada ✓","success"); }} />
      )}
    </div>
  );
}

/* ─── Modal Ingreso ───────────────────────────────────────────────── */
function IncomeModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    name:"", amount:"", type:"SALARY", date:"", notes:"",
    isRecurring:false, dayOfMonth:"1",
  });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    if (!form.name || !form.amount) return;
    setLoading(true);
    try {
      await financeService.addIncome({
        name:form.name, amount:parseFloat(form.amount), type:form.type,
        date:(!form.isRecurring && form.date) ? form.date : null,
        notes:form.notes || null,
        isRecurring:form.isRecurring,
        dayOfMonth:form.isRecurring ? parseInt(form.dayOfMonth) : null,
      });
      onSaved();
    } catch {} finally { setLoading(false); }
  }

  return (
    <ModalWrap title="Registrar ingreso" onClose={onClose}>
      <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <div>
          <label className="form-label">Nombre *</label>
          <input className="form-control" placeholder="Ej: Salario enero" value={form.name} onChange={set("name")} required />
        </div>
        <div className="row g-2">
          <div className="col-6">
            <label className="form-label">Monto *</label>
            <div className="input-group">
              <span className="input-group-text">$</span>
              <input className="form-control" type="number" min="0" placeholder="0"
                value={form.amount} onChange={set("amount")} required />
            </div>
          </div>
          <div className="col-6">
            <label className="form-label">Tipo</label>
            <select className="form-control" value={form.type} onChange={set("type")}>
              {INCOME_TYPES.map(t => <option key={t} value={t}>{INCOME_LABELS[t]}</option>)}
            </select>
          </div>
        </div>

        {/* Toggle recurrente */}
        <label style={{
          display:"flex", alignItems:"flex-start", gap:10, padding:"12px 14px",
          cursor:"pointer",
          background:form.isRecurring ? "rgba(34,197,94,.1)" : "var(--surface-alt)",
          border:`1px solid ${form.isRecurring ? "rgba(34,197,94,.4)" : "var(--border)"}`,
          borderRadius:"var(--radius-sm)", transition:"all .15s",
        }}>
          <input type="checkbox" checked={form.isRecurring}
            onChange={(e) => setForm(f => ({ ...f, isRecurring:e.target.checked }))}
            style={{ marginTop:3 }} />
          <div>
            <div style={{ fontSize:13, fontWeight:600 }}>
              <i className="bi bi-arrow-repeat me-1" style={{ color:"var(--success)" }} />
              Se repite cada mes
            </div>
            <div style={{ fontSize:11.5, color:"var(--muted)", marginTop:2 }}>
              moni lo registrará automáticamente en el día de pago.
            </div>
          </div>
        </label>

        {form.isRecurring ? (
          <div>
            <label className="form-label">Día de pago del mes</label>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <input className="form-control" type="number" min="1" max="28"
                value={form.dayOfMonth} onChange={set("dayOfMonth")} style={{ maxWidth:90 }} />
              <span style={{ fontSize:12.5, color:"var(--muted)" }}>
                de cada mes (máx. 28)
              </span>
            </div>
          </div>
        ) : (
          <div>
            <label className="form-label">Fecha</label>
            <input className="form-control" type="date" value={form.date} onChange={set("date")} />
          </div>
        )}

        <div>
          <label className="form-label">Notas (opcional)</label>
          <input className="form-control" placeholder="..." value={form.notes} onChange={set("notes")} />
        </div>

        <button type="submit" disabled={loading}
          style={{ background:"var(--accent)", color:"#fff", border:"none",
            borderRadius:"var(--radius-sm)", padding:"11px", fontSize:14,
            fontWeight:700, cursor:"pointer" }}>
          {loading ? "Guardando..." : "Guardar ingreso"}
        </button>
      </form>
    </ModalWrap>
  );
}

/* ─── Modal Configuración ─────────────────────────────────────────── */
function SettingsModal({ current, onClose, onSaved }) {
  const [form, setForm] = useState({
    savingsGoalPct:   current?.savingsGoalPct   ?? "",
    savingsGoalFixed: current?.savingsGoalFixed ?? "",
    reportType:       current?.reportType       ?? "NONE",
    debtReminders:    current?.debtReminders    ?? false,
  });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await financeService.saveSettings({
        savingsGoalPct:   form.savingsGoalPct   ? parseFloat(form.savingsGoalPct)   : null,
        savingsGoalFixed: form.savingsGoalFixed ? parseFloat(form.savingsGoalFixed) : null,
        reportType:       form.reportType,
        debtReminders:    form.debtReminders,
      });
      onSaved();
    } catch {} finally { setLoading(false); }
  }

  return (
    <ModalWrap title="Configuración financiera" onClose={onClose}>
      <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
        <div>
          <div style={{ fontSize:12, fontWeight:700, color:"var(--muted)",
            textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:8 }}>
            Meta de ahorro mensual
          </div>
          <div className="row g-2">
            <div className="col-6">
              <label className="form-label" style={{ fontSize:12 }}>% del ingreso</label>
              <div className="input-group">
                <input className="form-control" type="number" min="0" max="100"
                  placeholder="20" value={form.savingsGoalPct} onChange={set("savingsGoalPct")} />
                <span className="input-group-text">%</span>
              </div>
            </div>
            <div className="col-6">
              <label className="form-label" style={{ fontSize:12 }}>O monto fijo ($)</label>
              <input className="form-control" type="number" min="0"
                placeholder="500000" value={form.savingsGoalFixed} onChange={set("savingsGoalFixed")} />
            </div>
          </div>
          <div style={{ fontSize:11, color:"var(--muted)", marginTop:4 }}>
            Si configuras ambos, se usa el monto fijo. Recomendado: 20% (regla 50/30/20).
          </div>
        </div>

        <div>
          <div style={{ fontSize:12, fontWeight:700, color:"var(--muted)",
            textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:8 }}>
            Reportes automáticos por WhatsApp
          </div>
          {REPORT_OPTIONS.map(o => (
            <label key={o.id} style={{ display:"flex", alignItems:"center", gap:10,
              padding:"10px 14px", marginBottom:6, cursor:"pointer",
              background:form.reportType===o.id ? "var(--accent-soft)" : "var(--surface-alt)",
              border:`1px solid ${form.reportType===o.id ? "rgba(124,111,247,.4)" : "var(--border)"}`,
              borderRadius:"var(--radius-sm)" }}>
              <input type="radio" name="reportType" value={o.id}
                checked={form.reportType===o.id} onChange={set("reportType")} />
              <div>
                <div style={{ fontSize:13, fontWeight:600 }}>{o.label}</div>
                {o.desc && <div style={{ fontSize:11, color:"var(--muted)" }}>{o.desc}</div>}
              </div>
            </label>
          ))}
        </div>

        <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
          <input type="checkbox" checked={form.debtReminders}
            onChange={(e) => setForm(f => ({ ...f, debtReminders:e.target.checked }))} />
          <div>
            <div style={{ fontSize:13, fontWeight:600 }}>Recordatorios de deudas y grupos</div>
            <div style={{ fontSize:11, color:"var(--muted)" }}>
              Notificaciones por WhatsApp de cuotas y deudas pendientes.
            </div>
          </div>
        </label>

        <button type="submit" disabled={loading}
          style={{ background:"var(--accent)", color:"#fff", border:"none",
            borderRadius:"var(--radius-sm)", padding:"11px", fontSize:14,
            fontWeight:700, cursor:"pointer" }}>
          {loading ? "Guardando..." : "Guardar configuración"}
        </button>
      </form>
    </ModalWrap>
  );
}

/* ─── Modal wrapper ───────────────────────────────────────────────── */
function ModalWrap({ title, onClose, children }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)",
      display:"flex", alignItems:"center", justifyContent:"center",
      zIndex:1000, padding:16 }}>
      <div className="card-g" style={{ width:"100%", maxWidth:480,
        maxHeight:"90vh", overflowY:"auto", padding:24 }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 style={{ fontSize:17, fontWeight:800, margin:0 }}>{title}</h2>
          <button onClick={onClose}
            style={{ background:"none", border:"none", cursor:"pointer",
              color:"var(--muted)", fontSize:22 }}>
            <i className="bi bi-x" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
