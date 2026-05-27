import React, { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

let _id = 0;

/**
 * Proveedor de toasts. Renderiza una pila de notificaciones en la esquina
 * inferior-derecha usando Bootstrap 5 toast markup (sin JS de Bootstrap —
 * lo manejamos nosotros para mayor control).
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, variant = "success") => {
    const id = ++_id;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}

      {/* Toast container */}
      <div
        className="toast-container position-fixed bottom-0 end-0 p-3"
        style={{ zIndex: 9999 }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast show align-items-center text-bg-${variantClass(t.variant)} border-0 mb-2`}
            role="alert"
            aria-live="assertive"
          >
            <div className="d-flex">
              <div className="toast-body d-flex align-items-center gap-2">
                <i className={`bi ${variantIcon(t.variant)} fs-5`} aria-hidden="true" />
                <span>{t.message}</span>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                aria-label="Cerrar"
                onClick={() => dismiss(t.id)}
              />
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function variantClass(variant) {
  switch (variant) {
    case "error":   return "danger";
    case "warning": return "warning";
    case "info":    return "info";
    default:        return "success";
  }
}

function variantIcon(variant) {
  switch (variant) {
    case "error":   return "bi-x-circle-fill";
    case "warning": return "bi-exclamation-triangle-fill";
    case "info":    return "bi-info-circle-fill";
    default:        return "bi-check-circle-fill";
  }
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
}
