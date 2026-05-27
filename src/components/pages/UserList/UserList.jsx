import React from "react";
import { useFetch } from "../../../hooks/useFetch";
import { userService } from "../../../services/userService";
import usuarioIcono from "../../../img/iconoUsuario.png";
import Spinner from "../../ui/Spinner";
import Alert from "../../ui/Alert";
import EmptyState from "../../ui/EmptyState";
import Card from "../../ui/Card";

export default function UserList() {
  const { data: usuarios, loading, error, refetch } = useFetch(
    () => userService.list(),
    []
  );

  const isEmpty = !loading && !error && (!usuarios || usuarios.length === 0);

  return (
    <section>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h5 mb-0">Usuarios registrados</h2>
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
          title="Aún no hay usuarios"
          description="Registra el primer usuario desde la pestaña 'Registrar usuario'."
          icon="bi-people"
        />
      )}

      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {usuarios?.map((usuario) => (
          <div className="col" key={usuario.id}>
            <Card
              icon={usuarioIcono}
              title={usuario.nombre}
              subtitle={usuario.ciudad ? `Ciudad: ${usuario.ciudad}` : null}
              footer={usuario.correo}
            >
              {usuario.telefono && (
                <p className="mb-0 text-muted">
                  <i className="bi bi-telephone me-2" aria-hidden="true" />
                  {usuario.telefono}
                </p>
              )}
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
}
