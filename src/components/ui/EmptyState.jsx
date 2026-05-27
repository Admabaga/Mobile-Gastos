import React from "react";

export default function EmptyState({
  title = "No hay información disponible",
  description = "Aún no se ha registrado nada en esta sección.",
  icon = "bi-inbox",
}) {
  return (
    <div className="text-center text-muted py-5">
      <i className={`bi ${icon}`} style={{ fontSize: "3rem" }} aria-hidden="true" />
      <h5 className="mt-3 mb-1">{title}</h5>
      <p className="mb-0">{description}</p>
    </div>
  );
}
