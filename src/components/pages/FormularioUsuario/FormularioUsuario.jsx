import { useState } from "react";

export default function FormularioUsuario() {
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [fechaRegistro, setFechaRegistro] = useState("");
  const [ciudad, setCiudad] = useState("");

  function procesarFormulario(evento){
    evento.preventDefault()
    let usuario = {
        nombre,
        edad,
        telefono,
        correo,
        contraseña:password,
        fechaRegistro,
        ciudad
    }
    console.log(usuario)

  }

  return (
    <>
      <br />
      <div className="container my-5">
        <div className="row">
          <div className="col-12">
            <h3>Registro de usuario:</h3>
            <form action="" className="p-5 border rounded shadow" onSubmit={procesarFormulario}>
              <div className="row">
                <div className="col-12">
                  <label className="form-label">Nombre:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={nombre}
                    onChange={(nombre) => setNombre(nombre.target.value)}
                  />
                </div>
              </div>
              <div className="row mt-3">
                <div className="col-12 col-md-6">
                  <label className="form-label">Edad:</label>
                  <input
                    type="number"
                    className="form-control"
                    value={edad}
                    onChange={(edad) => setEdad(edad.target.value)}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Telefono:</label>
                  <input
                    type="number"
                    className="form-control"
                    value={telefono}
                    onChange={(telefono) => setTelefono(telefono.target.value)}
                  />
                </div>
              </div>
              <div className="row mt-3">
                <div className="col-12 col-md-6">
                  <label className="form-label">Correo:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={correo}
                    onChange={(correo) => setCorreo(correo.target.value)}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Contraseña:</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(password) => setPassword(password.target.value)}
                  />
                </div>
              </div>
              <div className="row mt-3">
                <div className="col-12 col-md-6">
                  <label className="form-label">Fecha Registro:</label>
                  <input
                    type="date"
                    className="form-control"
                    value={fechaRegistro}
                    onChange={(fecha) => setFechaRegistro(fecha.target.value)}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Ciudad:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={ciudad}
                    onChange={(ciudad) => setCiudad(ciudad.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-outline-success my-3 w-100"
              >
                Registrarse
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
