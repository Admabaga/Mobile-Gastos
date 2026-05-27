import React from "react";
import { useForm } from "../../../hooks/useForm";
import { useMutation } from "../../../hooks/useMutation";
import { paymentMethodService } from "../../../services/paymentMethodService";
import FormField from "../../ui/FormField";
import Alert from "../../ui/Alert";
import Spinner from "../../ui/Spinner";

const INITIAL_VALUES = {
  nombreMetodo: "",
  valor: "",
  descripcion: "",
};

export default function PaymentMethodForm() {
  const { values, handleChange, reset } = useForm(INITIAL_VALUES);
  const { mutate, loading, error, success, reset: resetStatus } = useMutation(
    (payload) =>
      paymentMethodService.create({
        nombreMetodo: payload.nombreMetodo,
        valor: Number(payload.valor) || 0,
        descripcion: payload.descripcion,
      })
  );

  async function onSubmit(event) {
    event.preventDefault();
    const result = await mutate(values);
    if (result.ok) reset();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white p-4 p-md-5 border rounded-4 shadow-sm"
      noValidate
    >
      <h2 className="h5 mb-4">Registrar método de pago</h2>

      <FormField
        label="Tipo de método"
        name="nombreMetodo"
        value={values.nombreMetodo}
        onChange={handleChange}
        placeholder="Ej. Tarjeta de crédito"
        required
      />

      <div className="row">
        <div className="col-12 col-md-6">
          <FormField
            label="Valor"
            name="valor"
            type="number"
            min="0"
            value={values.valor}
            onChange={handleChange}
          />
        </div>
        <div className="col-12 col-md-6">
          <FormField
            label="Descripción"
            name="descripcion"
            type="textarea"
            value={values.descripcion}
            onChange={handleChange}
          />
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-primary w-100 mt-2"
        disabled={loading}
      >
        {loading ? "Guardando..." : "Guardar método"}
      </button>

      <div className="mt-3">
        {loading && <Spinner label="Enviando..." />}
        {error && (
          <Alert variant="error" onClose={resetStatus}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" onClose={resetStatus}>
            Método de pago registrado.
          </Alert>
        )}
      </div>
    </form>
  );
}
