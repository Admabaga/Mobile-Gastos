import React from "react";

/**
 * @param {string}  label     - Etiqueta de la métrica
 * @param {string}  value     - Valor formateado
 * @param {string}  icon      - Clase Bootstrap Icon (ej. "bi-cash-coin")
 * @param {string}  color     - "green" | "blue" | "orange" | "red" | "purple"
 * @param {number}  [change]  - Variación % respecto al periodo anterior
 * @param {string}  [badge]   - Texto adicional del badge (sobreescribe cambio)
 */
export default function StatCard({ label, value, icon, color = "green", change, badge }) {
  const hasBadge = change !== undefined || badge;
  const isUp     = change > 0;
  const isDown   = change < 0;
  const badgeClass = isUp ? "up" : isDown ? "down" : "neutral";
  const badgeText  = badge ?? (change !== undefined
    ? `${isUp ? "▲" : isDown ? "▼" : "—"} ${Math.abs(change).toFixed(1)}%`
    : null);

  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>
        <i className={`bi ${icon}`} aria-hidden="true" />
      </div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {hasBadge && (
          <span className={`stat-badge ${badgeClass}`}>{badgeText}</span>
        )}
      </div>
    </div>
  );
}
