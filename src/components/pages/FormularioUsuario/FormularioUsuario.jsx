import { useState } from "react";
import axios from 'axios'
import '../RespuestaServer.css'

export default function FormularioUsuario() {
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [fechaRegistro, setFechaRegistro] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [cargando, setCargando] = useState(false)
  const [respuestaServer, setRespuestaServer] = useState("")
  const [respuestaServerError, setRespuestaServerError] = useState(false)

  async function procesarFormulario(evento) {
    evento.preventDefault()
    setCargando(true)
    try {
      const response = await axios.post('http://localhost:8000/usuarios',
        {
          nombre,
          edad,
          telefono,
          correo,
          contraseña: password,
          fechaRegistro,
          ciudad
        })
      setRespuestaServer("Usuario registrado!")
      setRespuestaServerError(false)
    } catch (error) {
      setRespuestaServer(`Error al enviar datos: ${error.response?.data || error.message}`)
      setRespuestaServerError(true)

    } finally {
      setCargando(false)
    }

  }

  return (
    <>
      <div className="container my-5">
        <div className="row">
          <div className="col-12">
            <h3 className="text-center mb-4">Registro de usuario</h3>
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
                className="btn btn-outline-secondary my-3 w-100"
              >
                Registrarse
              </button>
              {cargando ? (
                <div className="d-flex justify-content-center">
                  <div className="spinner-border" ></div>
                  <span className="m-1">Enviando...</span>
                </div>
                
              ) : (<>
                {respuestaServer && (
                  <p className={`respuestaServer ${respuestaServerError ? 'error' : 'success'}`}>
                    {respuestaServer}
                  </p>
                )}</>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
