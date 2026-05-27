import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import ExpenseForm from "../ExpenseForm/ExpenseForm";
import ExpenseList from "../ExpenseList/ExpenseList";

const TABS = [
  { id: "lista",     label: "Mis gastos",      icon: "bi-list-ul" },
  { id: "registrar", label: "Registrar",        icon: "bi-plus-circle" },
];

export default function Expenses() {
  const location = useLocation();
  const initTab  = new URLSearchParams(location.search).get("tab") ?? "lista";
  const [tab, setTab] = useState(initTab);

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", marginBottom: 2 }}>
            Mis Gastos
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
            Registra y revisa cada uno de tus movimientos.
          </p>
        </div>

        {/* Tabs pill */}
        <div
          style={{
            display: "flex",
            background: "var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: 3,
            gap: 2,
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                border: "none",
                cursor: "pointer",
                padding: "7px 16px",
                borderRadius: "calc(var(--radius-sm) - 2px)",
                fontSize: 13,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "background 0.15s, color 0.15s",
                background: tab === t.id ? "var(--surface)" : "transparent",
                color: tab === t.id ? "var(--text)" : "var(--muted)",
                boxShadow: tab === t.id ? "var(--shadow-sm)" : "none",
              }}
            >
              <i className={`bi ${t.icon}`} aria-hidden="true" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "lista"     && <ExpenseList />}
      {tab === "registrar" && <ExpenseForm onSuccess={() => setTab("lista")} />}
    </div>
  );
}
