import axios from "axios";
import { useEffect, useState } from "react";
import usuarioIcono from "../../../img/iconoUsuario.png"
import './CardUsuarios.css'

export default function ListadoUsuarios() {
  const [datosApi, setDatosApi] = useState(null)
  const [respuestaServer, setRespuestaServer] = useState("")
  const [respuestaError, setRespuestaError] = useState(false)
  const [spinner, setSpinner] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setSpinner(true)
      try {
        const respuesta = await axios.get("http://localhost:8000/usuarios")
        setDatosApi(respuesta.data)
        setRespuestaError(false)
      } catch (error) {
        setRespuestaServer(`Error al enviar datos: ${error.message}`)
        setRespuestaError(true)
      } finally {
        setSpinner(false)
      }
    }
    fetchData()
  }, [])
  return (
    <>
      <div className="container my-5">
        <h3 className="text-center mb-4">Usuarios Registrados</h3>
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {datosApi &&
            datosApi.map((usuario) => (
              <div className="col" key={usuario.id}>
                <div className="card h-100 shadow-sm rounded-4">
                  <div className="card-body">
                  <img 
                        src={usuarioIcono} 
                        className="img-fluid  mb-3 "
                    />
                    <h4 className="card-title text-primary mb-2">
                      {usuario.nombre}
                    </h4>
                    <h6 className="card-subtitle mb-3 text-secondary">
                      Ciudad: {usuario.ciudad}
                    </h6>
                    <p className="card-text text-muted">
                      Teléfono: {usuario.telefono}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
        <br />
        <br />
        {spinner ? (
          <div className="d-flex justify-content-center ">
            <div className="spinner-border"></div>
            <span className="m-1"> Cargando...</span>
          </div>
        ) : (
          <>
            {respuestaServer && (
              <p
                className={`respuestaServer ${respuestaError ? "error" : "success"
                  }`}
              >
                {respuestaServer}
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
}
