import React from "react";
import { useForm } from "../../../hooks/useForm";
import { useMutation } from "../../../hooks/useMutation";
import { userService } from "../../../services/userService";
import FormField from "../../ui/FormField";
import Alert from "../../ui/Alert";
import Spinner from "../../ui/Spinner";

const INITIAL_VALUES = {
  nombre: "",
  edad: "",
  telefono: "",
  correo: "",
  password: "",
  fechaRegistro: "",
  ciudad: "",
};

export default function UserForm() {
  const { values, handleChange, reset } = useForm(INITIAL_VALUES);
  const { mutate, loading, error, success, reset: resetStatus } = useMutation(
    (payload) =>
      userService.create({
        nombre: payload.nombre,
        edad: Number(payload.edad) || null,
        telefono: payload.telefono,
        correo: payload.correo,
        contraseña: payload.password,
        fechaRegistro: payload.fechaRegistro,
        ciudad: payload.ciudad,
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
      <h2 className="h5 mb-4">Registrar nuevo usuario</h2>

      <FormField
        label="Nombre"
        name="nombre"
        value={values.nombre}
        onChange={handleChange}
        required
      />

      <div className="row">
        <div className="col-12 col-md-6">
          <FormField
            label="Edad"
            name="edad"
            type="number"
            min="0"
            value={values.edad}
            onChange={handleChange}
          />
        </div>
        <div className="col-12 col-md-6">
          <FormField
            label="Teléfono"
            name="telefono"
            type="tel"
            value={values.telefono}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-12 col-md-6">
          <FormField
            label="Correo"
            name="correo"
            type="email"
            value={values.correo}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-12 col-md-6">
          <FormField
            label="Contraseña"
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="row">
        <div className="col-12 col-md-6">
          <FormField
            label="Fecha de registro"
            name="fechaRegistro"
            type="date"
            value={values.fechaRegistro}
            onChange={handleChange}
          />
        </div>
        <div className="col-12 col-md-6">
          <FormField
            label="Ciudad"
            name="ciudad"
            value={values.ciudad}
            onChange={handleChange}
          />
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-primary w-100 mt-2"
        disabled={loading}
      >
        {loading ? "Guardando..." : "Registrar usuario"}
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
            Usuario registrado con éxito.
          </Alert>
        )}
      </div>
    </form>
  );
}
