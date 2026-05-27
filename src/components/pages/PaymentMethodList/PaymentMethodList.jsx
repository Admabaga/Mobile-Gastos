import React from "react";
import { useFetch } from "../../../hooks/useFetch";
import { paymentMethodService } from "../../../services/paymentMethodService";
import iconoMetodo from "../../../assets/img/MetodoPago.png";
import Spinner from "../../ui/Spinner";
import Alert from "../../ui/Alert";
import EmptyState from "../../ui/EmptyState";
import Card from "../../ui/Card";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export default function PaymentMethodList() {
  const { data: metodos, loading, error, refetch } = useFetch(
    () => paymentMethodService.list(),
    []
  );

  const isEmpty = !loading && !error && (!metodos || metodos.length === 0);

  return (
    <section>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h5 mb-0">Métodos registrados</h2>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={refetch}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise me-1" aria-hidden="true" />
          Refrescar
        </button>
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {loading && <Spinner />}
      {isEmpty && (
        <EmptyState
          title="No hay métodos de pago"
          description="Registra el primero desde la pestaña 'Registrar método'."
          icon="bi-credit-card"
        />
      )}

      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {metodos?.map((metodo) => (
          <div className="col" key={metodo.id}>
            <Card
              icon={iconoMetodo}
              title={metodo.nombreMetodo}
              subtitle={metodo.descripcion}
              footer={
                metodo.valor != null
                  ? `Valor: ${currencyFormatter.format(metodo.valor)}`
                  : null
              }
            />
          </div>
        ))}
      </div>
    </section>
  );
}
