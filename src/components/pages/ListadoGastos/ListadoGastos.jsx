import axios from "axios"
import { useEffect, useState } from "react"
import './CardGastos.css'

export default function ListadoGastos() {

    const [gastos, setGastos] = useState(null)
    const [spinner, setSpinner] = useState(false)
    const [respuestaServer, setRespuestaServer] = useState("")
    const [respuestaError, setRespuestaError] = useState(false)

    useEffect(() => {
        const traerGastos = async () => {
            setSpinner(true)
            try {
                const respuesta = await axios.get('http://localhost:8000/gastos')
                setGastos(respuesta.data)
                setRespuestaError(false)
            } catch (error) {
                setRespuestaServer(`Error al enviar datos: ${error.message}`)
                setRespuestaError(true)
            } finally {
                setSpinner(false)
            }
        }
        traerGastos()
    }, [])

    return (
        <>
            <div className="container my-5">
                <h3 className="text-center mb-4">Gastos Registrados</h3>
                <div className="row row-cols-1 row-cols-md-3 g-4">
                    {gastos &&
                        gastos.map((gasto) => (
                            <div className="col" key={`${gasto.id}-${gasto.nombre}`}>
                                <div className="card h-100 shadow-sm rounded-4 border-0">
                                    <div className="card-body">
                                        <h3 className="card-title text-primary mb-3">{gasto.nombre}</h3>
                                        <h5 className="card-text text-success">Monto: ${gasto.monto}</h5>
                                        <h5 className="card-text text-muted">Fecha: {gasto.fecha}</h5>
                                        <p className="card-text text-secondary"> {gasto.descripcion}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
                <br /><br />
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
    )
}