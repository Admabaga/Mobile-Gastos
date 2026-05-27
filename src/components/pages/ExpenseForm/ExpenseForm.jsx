import React from "react";
import { useForm } from "../../../hooks/useForm";
import { useFetch } from "../../../hooks/useFetch";
import { useMutation } from "../../../hooks/useMutation";
import { expenseService } from "../../../services/expenseService";
import { categoryService } from "../../../services/categoryService";
import { paymentMethodService } from "../../../services/paymentMethodService";
import { useToast } from "../../../context/ToastContext";

const INITIAL = {
  name: "", amount: "", date: "",
  description: "", categoryId: "", paymentMethodId: "", isRecurring: false,
};

export default function ExpenseForm({ onSuccess }) {
  const { push } = useToast();
  const { values, handleChange, reset, setValues } = useForm(INITIAL);

  const { data: categories }     = useFetch(() => categoryService.list(),   [], { initialData: [] });
  const { data: paymentMethods } = useFetch(() => paymentMethodService.list(),  [], { initialData: [] });

  const { mutate, loading } = useMutation((payload) =>
    expenseService.create({
      name:            payload.name,
      amount:          Number(payload.amount) || 0,
      date:            payload.date || null,
      description:     payload.description || null,
      categoryId:      payload.categoryId      ? Number(payload.categoryId)      : null,
      paymentMethodId: payload.paymentMethodId ? Number(payload.paymentMethodId) : null,
      isRecurring:     payload.isRecurring === true || payload.isRecurring === "true",
    })
  );

  async function onSubmit(e) {
    e.preventDefault();
    const result = await mutate(values);
    if (result.ok) {
      push("Gasto registrado correctamente ✓", "success");
      reset();
      onSuccess?.();
    } else {
      push(result.error ?? "No se pudo registrar el gasto", "error");
    }
  }

  return (
    <div className="card-g p-4 p-md-5" style={{ maxWidth: 640 }}>
      <div className="section-title mb-1">Nuevo gasto</div>
      <div className="section-sub">Campos marcados con * son requeridos.</div>

      <form onSubmit={onSubmit} noValidate>
        <div className="mb-3">
          <label className="form-label" htmlFor="name">Nombre del gasto *</label>
          <div className="input-group">
            <span className="input-group-text"><i className="bi bi-tag" /></span>
            <input id="name" name="name" className="form-control"
              placeholder="Ej. Súper semanal" value={values.name}
              onChange={handleChange} required />
          </div>
        </div>

        <div className="row g-3 mb-3">
          <div className="col-12 col-sm-6">
            <label className="form-label" htmlFor="amount">Monto *</label>
            <div className="input-group">
              <span className="input-group-text">$</span>
              <input id="amount" name="amount" type="number" min="0" step="0.01"
                className="form-control" placeholder="0.00"
                value={values.amount} onChange={handleChange} required />
            </div>
          </div>
          <div className="col-12 col-sm-6">
            <label className="form-label" htmlFor="date">Fecha</label>
            <input id="date" name="date" type="date" className="form-control"
              value={values.date} onChange={handleChange} />
          </div>
        </div>

        <div className="row g-3 mb-3">
          <div className="col-12 col-sm-6">
            <label className="form-label" htmlFor="categoryId">Categoría</label>
            <select id="categoryId" name="categoryId" className="form-select"
              value={values.categoryId} onChange={handleChange}>
              <option value="">Sin categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.categoryName}</option>
              ))}
            </select>
          </div>
          <div className="col-12 col-sm-6">
            <label className="form-label" htmlFor="paymentMethodId">Método de pago</label>
            <select id="paymentMethodId" name="paymentMethodId" className="form-select"
              value={values.paymentMethodId} onChange={handleChange}>
              <option value="">Sin método</option>
              {paymentMethods.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="description">Descripción</label>
          <textarea id="description" name="description" className="form-control"
            rows={2} placeholder="Notas adicionales..."
            value={values.description} onChange={handleChange} />
        </div>

        {/* Recurrente — opcional */}
        <label style={{
          display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 20,
          padding: "12px 14px", cursor: "pointer",
          background: values.isRecurring ? "var(--accent-soft)" : "var(--surface-alt)",
          border: `1px solid ${values.isRecurring ? "rgba(124,111,247,.35)" : "var(--border)"}`,
          borderRadius: "var(--radius-sm)", transition: "all .15s",
        }}>
          <input type="checkbox" id="isRecurring"
            checked={!!values.isRecurring}
            onChange={(e) => setValues((v) => ({ ...v, isRecurring: e.target.checked }))}
            style={{ marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>
              <i className="bi bi-arrow-repeat me-1" style={{ color: "var(--accent)" }} />
              Gasto recurrente (mensual)
            </div>
            <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>
              Opcional — moni lo creará automáticamente el día 1 de cada mes.
            </div>
          </div>
        </label>

        <button type="submit" className="btn-accent w-100 justify-content-center" disabled={loading}>
          {loading
            ? <><span className="spinner-accent" style={{ width: 16, height: 16 }} /> Guardando...</>
            : <><i className="bi bi-check-circle" /> Guardar gasto</>}
        </button>
      </form>
    </div>
  );
}
