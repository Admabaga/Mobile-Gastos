import axios from "axios";
import { useEffect, useState } from "react";

export default function ListadoUsuarios() {
  const [datosApi, setDatosApi] = useState(null);
  const [respuestaServer, setRespuestaServer] = useState("");
  const [respuestaError, setRespuestaError] = useState(false);
  const [spinner, setSpinner] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setSpinner(true);
      try {
        const respuesta = await axios.get("http://localhost:8000/usuarios");
        setDatosApi(respuesta.data);
        setRespuestaError(false);
      } catch (error) {
        setRespuestaServer(`Error al enviar datos: ${error.message}`);
        setRespuestaError(true);
      } finally {
        setSpinner(false);
      }
    };
    fetchData();
  }, []);
  return (
    <>
      <br />
      <br />
      <br />
      <div className="container">
        <h3>Listado de Usuarios</h3>
        <div className="row row-cols-1 row-cols-md-3 g-3">
          {datosApi &&
            datosApi.map((usuario) => (
              <div className="col" key={usuario.id}>
                <div className="card h-100 shadow p-5">
                  <h4>Nombre: {usuario.nombre}</h4>
                  <h5>Ciudad: {usuario.ciudad}</h5>
                  <h5>Telefono: {usuario.telefono}</h5>
                </div>
              </div>
            ))}
        </div>
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
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
                className={`respuestaServer ${
                  respuestaError ? "error" : "success"
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
