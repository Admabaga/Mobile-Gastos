import React from "react";

/**
 * Tabs accesibles controladas.
 * tabs: [{ id, label, icon? }]
 */
export default function SectionTabs({ tabs, value, onChange }) {
  return (
    <ul className="nav nav-pills justify-content-center gap-2 mb-4" role="tablist">
      {tabs.map((tab) => {
        const active = value === tab.id;
        return (
          <li key={tab.id} className="nav-item" role="presentation">
            <button
              type="button"
              role="tab"
              aria-selected={active}
              className={`nav-link ${active ? "active" : ""}`}
              onClick={() => onChange(tab.id)}
            >
              {tab.icon && <i className={`bi ${tab.icon} me-2`} aria-hidden="true" />}
              {tab.label}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
