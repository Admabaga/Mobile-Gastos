import React, { useEffect, useState, useCallback } from "react";
import QRCode from "react-qr-code";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { adminService } from "../../../services/adminService";
import { useToast } from "../../../context/ToastContext";

// ── WhatsApp status helpers ───────────────────────────────────────────────────
const STATUS_COLOR = { CONNECTED: "var(--success)", QR_READY: "#f59e0b", DISCONNECTED: "var(--danger)" };
const STATUS_LABEL = { CONNECTED: "Conectado", QR_READY: "Esperando escaneo", DISCONNECTED: "Desconectado" };
const STATUS_ICON  = { CONNECTED: "bi-check-circle-fill", QR_READY: "bi-qr-code", DISCONNECTED: "bi-x-circle-fill" };

// ── Cost chart colors ─────────────────────────────────────────────────────────
const OP_COLORS = { OCR_IMAGE: "#6366f1", OCR_PDF: "#22d3ee", CATEGORY_SUGGESTION: "#f59e0b" };
const PIE_COLORS = ["#6366f1", "#22d3ee", "#f59e0b", "#10b981"];

// ── Formatters ────────────────────────────────────────────────────────────────
const fmtUsd  = (v) => `$${Number(v).toFixed(4)}`;
const fmtDate = (d) => { const [, m, day] = d.split("-"); return `${day}/${m}`; };

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color = "var(--accent)" }) {
  return (
    <div style={{
      background: "var(--card)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-sm)", padding: "16px 20px",
      display: "flex", alignItems: "center", gap: 14,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: "var(--radius-sm)",
        background: color + "20", display: "grid", placeItems: "center", flexShrink: 0,
      }}>
        <i className={`bi ${icon}`} style={{ color, fontSize: 18 }} />
      </div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { push } = useToast();

  // ── WhatsApp state ──────────────────────────────────────────────────────────
  const [wa,      setWa]      = useState(null);
  const [waLoad,  setWaLoad]  = useState(true);
  const [polling, setPolling] = useState(false);

  // ── Claude usage state ──────────────────────────────────────────────────────
  const [usage,      setUsage]      = useState(null);
  const [usageLoad,  setUsageLoad]  = useState(true);

  // ── Fetch WA status ─────────────────────────────────────────────────────────
  const fetchStatus = useCallback(async () => {
    try {
      setWa(await adminService.whatsappStatus());
    } catch {
      push("No se pudo obtener el estado del bot", "danger");
    } finally {
      setWaLoad(false);
    }
  }, []);

  // ── Fetch Claude usage ──────────────────────────────────────────────────────
  const fetchUsage = useCallback(async () => {
    try {
      setUsage(await adminService.claudeUsage());
    } catch {
      push("No se pudo obtener el uso de Claude", "danger");
    } finally {
      setUsageLoad(false);
    }
  }, []);

  useEffect(() => { fetchStatus(); fetchUsage(); }, [fetchStatus, fetchUsage]);

  // Auto-polling WhatsApp
  useEffect(() => {
    if (!wa || wa.status === "CONNECTED") return;
    setPolling(true);
    const id = setInterval(fetchStatus, 5000);
    return () => { clearInterval(id); setPolling(false); };
  }, [wa?.status, fetchStatus]);

  const color = STATUS_COLOR[wa?.status] ?? "var(--muted)";

  // ── Prepare chart data ──────────────────────────────────────────────────────
  const dailyData = (usage?.daily ?? []).map((d) => ({
    date:    fmtDate(d.date),
    costo:   parseFloat(d.costUsd.toFixed(6)),
    llamadas: d.calls,
  }));

  const pieData = (usage?.byOperation ?? []).map((op) => ({
    name:  op.label,
    value: parseFloat(op.costUsd.toFixed(6)),
    pct:   op.pct,
  }));

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="mb-4">
        <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", marginBottom: 2 }}>
          Panel de administración
        </h1>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
          Configuración y estado interno de moni.
        </p>
      </div>

      {/* ══ WhatsApp Bot ══════════════════════════════════════════════════════ */}
      <div className="card-g p-4 mb-4">
        <div className="d-flex align-items-center gap-2 mb-4">
          <div style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)",
            background: "rgba(37,211,102,.15)", display: "grid", placeItems: "center" }}>
            <i className="bi bi-whatsapp" style={{ color: "#25D366", fontSize: 18 }} />
          </div>
          <div>
            <div className="section-title" style={{ marginBottom: 0 }}>Bot de WhatsApp</div>
            <div className="section-sub" style={{ marginBottom: 0, fontSize: 11 }}>
              Sidecar Baileys — número del bot: +57 305 430 5869
            </div>
          </div>
        </div>

        {waLoad ? <Spinner /> : (
          <>
            <div style={{
              display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
              background: color + "15", border: `1px solid ${color}40`,
              borderRadius: "var(--radius-sm)", marginBottom: 20,
            }}>
              <i className={`bi ${STATUS_ICON[wa?.status] ?? "bi-circle"}`} style={{ fontSize: 22, color }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color }}>{STATUS_LABEL[wa?.status] ?? wa?.status}</div>
                {polling && wa?.status !== "CONNECTED" && (
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                    Actualizando automáticamente cada 5 s…
                  </div>
                )}
              </div>
              <button onClick={fetchStatus} className="btn-outline-g ms-auto" style={{ fontSize: 12 }}>
                <i className="bi bi-arrow-clockwise" /> Actualizar
              </button>
            </div>

            {wa?.status === "QR_READY" && wa?.qr && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>
                  Escanea este QR con el WhatsApp del número <strong>+57 305 430 5869</strong>
                </div>
                <div style={{ display: "inline-block", padding: 20,
                  background: "#fff", borderRadius: "var(--radius-md)", boxShadow: "0 4px 24px rgba(0,0,0,.15)" }}>
                  <QRCode value={wa.qr} size={220} />
                </div>
                <div style={{ marginTop: 14, fontSize: 12, color: "var(--muted)" }}>
                  Abre WhatsApp en el celular del bot → Dispositivos vinculados → Vincular dispositivo
                </div>
              </div>
            )}
            {wa?.status === "CONNECTED" && (
              <p style={{ fontSize: 13, color: "var(--text-light)", margin: 0 }}>
                El bot está activo y recibiendo mensajes. Los usuarios pueden registrar gastos
                enviando mensajes al número <strong>+57 305 430 5869</strong>.
              </p>
            )}
            {wa?.status === "DISCONNECTED" && (
              <p style={{ fontSize: 13, color: "var(--text-light)", margin: 0 }}>
                El sidecar no está corriendo o está intentando reconectarse. Revisa los logs del servidor.
              </p>
            )}
          </>
        )}
      </div>

      {/* ══ Claude API — Costos ═══════════════════════════════════════════════ */}
      <div className="card-g p-4 mb-4">
        <div className="d-flex align-items-center gap-2 mb-4">
          <div style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)",
            background: "rgba(99,102,241,.15)", display: "grid", placeItems: "center" }}>
            <i className="bi bi-cpu" style={{ color: "#6366f1", fontSize: 18 }} />
          </div>
          <div>
            <div className="section-title" style={{ marginBottom: 0 }}>Uso de Claude AI</div>
            <div className="section-sub" style={{ marginBottom: 0, fontSize: 11 }}>
              Tokens consumidos y costo en USD · claude-haiku-4-5
            </div>
          </div>
          <button onClick={fetchUsage} className="btn-outline-g ms-auto" style={{ fontSize: 12 }}>
            <i className="bi bi-arrow-clockwise" /> Actualizar
          </button>
        </div>

        {usageLoad ? <Spinner /> : !usage ? (
          <p style={{ color: "var(--muted)", fontSize: 13 }}>Sin datos disponibles.</p>
        ) : (
          <>
            {/* ── Alerta ── */}
            {usage.alert && (
              <div style={{
                background: "#f59e0b15", border: "1px solid #f59e0b40",
                borderRadius: "var(--radius-sm)", padding: "12px 16px",
                fontSize: 13, color: "#b45309", marginBottom: 20,
              }}>
                <i className="bi bi-exclamation-triangle-fill me-2" style={{ color: "#f59e0b" }} />
                Costo promedio de los últimos 7 días supera <strong>$1 USD/día</strong>.
                Revisá las sugerencias al pie.
              </div>
            )}

            {/* ── Stat cards ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))", gap: 12, marginBottom: 28 }}>
              <StatCard icon="bi-currency-dollar" label="Costo total acumulado" color="#6366f1"
                value={`$${Number(usage.totalCostUsd).toFixed(4)}`} sub="USD" />
              <StatCard icon="bi-activity" label="Promedio últimos 7 días" color="#22d3ee"
                value={`$${Number(usage.avg7DayUsd).toFixed(4)}`} sub="USD/día" />
              <StatCard icon="bi-lightning-charge" label="Total de llamadas" color="#10b981"
                value={usage.totalCalls.toLocaleString()} />
              <StatCard icon="bi-arrow-down-circle" label="Tokens de entrada" color="#a78bfa"
                value={Number(usage.totalInputTokens ?? 0).toLocaleString()}
                sub={`${usage.inputPct ?? 0}% del total`} />
              <StatCard icon="bi-arrow-up-circle" label="Tokens de salida" color="#f59e0b"
                value={Number(usage.totalOutputTokens ?? 0).toLocaleString()}
                sub={`${usage.outputPct ?? 0}% del total`} />
            </div>

            {/* ── Ratio input vs output ── */}
            {usage.totalTokens > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6, fontWeight: 600 }}>
                  Distribución tokens — entrada vs salida
                </div>
                <div style={{ display: "flex", height: 10, borderRadius: 99, overflow: "hidden", gap: 2 }}>
                  <div style={{ flex: usage.inputPct, background: "#a78bfa", borderRadius: "99px 0 0 99px" }} />
                  <div style={{ flex: usage.outputPct, background: "#f59e0b", borderRadius: "0 99px 99px 0" }} />
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 6, fontSize: 11, color: "var(--muted)" }}>
                  <span><span style={{ color: "#a78bfa", fontWeight: 700 }}>●</span> Entrada {usage.inputPct}%</span>
                  <span><span style={{ color: "#f59e0b", fontWeight: 700 }}>●</span> Salida {usage.outputPct}%</span>
                  <span style={{ marginLeft: "auto" }}>
                    ratio {usage.totalOutputTokens > 0
                      ? (usage.totalInputTokens / usage.totalOutputTokens).toFixed(1)
                      : "—"}:1 in/out
                  </span>
                </div>
              </div>
            )}

            {/* ── Gráfico diario ── */}
            {dailyData.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>
                  Costo diario — últimos 30 días
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={dailyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--muted)" }} tickFormatter={(v) => `$${v}`} width={52} />
                    <Tooltip
                      contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                      formatter={(v, name) => [fmtUsd(v), name === "costo" ? "Costo USD" : "Llamadas"]}
                    />
                    <Area type="monotone" dataKey="costo" stroke="#6366f1" fill="url(#costGrad)" strokeWidth={2} dot={false} name="costo" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* ── Desglose por operación ── */}
            {usage.byOperation.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>
                  Desglose por tipo de operación
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "center" }}>
                  {/* Pie */}
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                        innerRadius={50} outerRadius={80} paddingAngle={3}>
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                        formatter={(v) => fmtUsd(v)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Tabla */}
                  <div>
                    {usage.byOperation.map((op, i) => (
                      <div key={op.operation} style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 10, height: 10, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                            <span style={{ fontSize: 12, color: "var(--text)", fontWeight: 600 }}>{op.label}</span>
                          </div>
                          <span style={{ fontSize: 12, color: "var(--muted)" }}>{op.pct}%</span>
                        </div>
                        <div style={{ background: "var(--border)", borderRadius: 4, height: 4, overflow: "hidden" }}>
                          <div style={{ width: `${op.pct}%`, height: "100%", background: PIE_COLORS[i % PIE_COLORS.length], borderRadius: 4 }} />
                        </div>
                        <div style={{ display: "flex", gap: 16, marginTop: 3 }}>
                          <span style={{ fontSize: 10, color: "var(--muted)" }}>{op.calls} llamadas</span>
                          <span style={{ fontSize: 10, color: "var(--muted)" }}>{fmtUsd(op.costUsd)} USD</span>
                          <span style={{ fontSize: 10, color: "var(--muted)" }}>{(op.inputTokens + op.outputTokens).toLocaleString()} tokens</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Llamadas por día (barras) ── */}
            {dailyData.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>
                  Llamadas a Claude por día
                </div>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={dailyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--muted)" }} allowDecimals={false} width={32} />
                    <Tooltip
                      contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                      formatter={(v) => [v, "Llamadas"]}
                    />
                    <Bar dataKey="llamadas" fill="#22d3ee" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* ── Sugerencias ── */}
            {usage.suggestions?.length > 0 && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>
                  Análisis y sugerencias
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {usage.suggestions.map((s, i) => (
                    <div key={i} style={{
                      background: "var(--surface)", border: "1px solid var(--border)",
                      borderRadius: "var(--radius-sm)", padding: "10px 14px",
                      fontSize: 13, color: "var(--text)", lineHeight: 1.5,
                    }}>
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ height: 80, display: "grid", placeItems: "center" }}>
      <div style={{ width: 28, height: 28, border: "3px solid var(--border)",
        borderTopColor: "var(--accent)", borderRadius: "50%",
        animation: "spin .7s linear infinite" }} />
    </div>
  );
}
