import axios from "axios"
import { useEffect, useState } from "react"
import ListadoGastos from "../ListadoGastos/ListadoGastos"
import '../RespuestaServer.css'

export default function FormularioGastos() {
    const [nombre, setNombreGasto] = useState('')
    const [monto, setMontoGasto] = useState('')
    const [fecha, setFechaGasto] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [cargando, setCargando] = useState(false)
    const [respuestaServer, setRespuestaServer] = useState('')
    const [respuestaError, setRespuestaError] = useState(false)

    useEffect
    async function enviarDatos(evento) {
        evento.preventDefault()
        setCargando(true)
        try {
            const response = await axios.post('http://localhost:8000/gastos',
                {
                    nombre,
                    monto,
                    fecha,
                    descripcion
                }
            )
            setRespuestaServer('Gasto registrado!')
            setRespuestaError(false)
        } catch (error) {
            setRespuestaServer(`Error al enviar datos: ${error.response?.data || error.message}`)
            setRespuestaError(true)
        } finally {
            setCargando(false)
        }

    }

    return (
        <>
            <div className="container my-5">
                <div className="row">
                    <div className="col-12">
                        <h3 className="text-center mb-4">Registro gastos</h3>
                        <form action="" onSubmit={enviarDatos} className="p-5 border rounded shadow">
                            <div className="row">
                                <div className="col-12">
                                    <label className="form-label">Nombre: </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={nombre}
                                        onChange={(nombre) => setNombreGasto(nombre.target.value)} />
                                </div>
                            </div>
                            <div className="row mt-3">
                                <div className="col-12 col-md-6">
                                    <label className="form-label">Monto:</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={monto}
                                        onChange={(monto) => setMontoGasto(monto.target.value)} />
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="form-label">Fecha:</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={fecha}
                                        onChange={(fecha) => setFechaGasto(fecha.target.value)} />
                                </div>
                            </div>
                            <div className="row mt-3">
                                <div className="col-12">
                                    <label className="form-label">Descripcion:</label>
                                    <textarea
                                        className="form-control"
                                        value={descripcion}
                                        onChange={(descripcion) => setDescripcion(descripcion.target.value)} />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-outline-secondary my-3 w-100" >Guardar gasto</button>
                            {cargando ? (
                                <div className="d-flex justify-content-center">
                                    <div className="spinner-border" ></div>
                                    <span className="m-1">Enviando...</span>
                                </div>
                            ) : (<>
                                {respuestaServer && (
                                    <p className={`respuestaServer ${respuestaError ? 'error' : 'success'}`}>
                                        {respuestaServer}
                                    </p>
                                )}</>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}