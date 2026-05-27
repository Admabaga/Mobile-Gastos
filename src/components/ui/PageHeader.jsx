import React from "react";

export default function PageHeader({ title, subtitle, actions }) {
  return (
    <header className="d-flex flex-column flex-md-row align-items-md-end justify-content-between mb-4 gap-2">
      <div>
        <h1 className="h3 fw-bold mb-1">{title}</h1>
        {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
      </div>
      {actions && <div className="d-flex gap-2">{actions}</div>}
    </header>
  );
}
