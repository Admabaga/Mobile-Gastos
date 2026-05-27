import React from "react";

export default function Spinner({ label = "Cargando..." }) {
  return (
    <div className="d-flex justify-content-center align-items-center py-3" role="status" aria-live="polite">
      <div className="spinner-border text-primary" />
      <span className="ms-2">{label}</span>
    </div>
  );
}
