import React from "react";

const VARIANTS = {
  success: "alert-success",
  error: "alert-danger",
  warning: "alert-warning",
  info: "alert-info",
};

export default function Alert({ variant = "info", children, onClose }) {
  if (!children) return null;
  return (
    <div
      className={`alert ${VARIANTS[variant] ?? VARIANTS.info} d-flex justify-content-between align-items-center`}
      role="alert"
    >
      <span>{children}</span>
      {onClose && (
        <button
          type="button"
          className="btn-close ms-3"
          aria-label="Cerrar"
          onClick={onClose}
        />
      )}
    </div>
  );
}
