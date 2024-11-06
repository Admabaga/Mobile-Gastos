import axios from "axios"
import { useState } from "react"

export default function FormularioMetodoPago() {
    const [nombreMetodo, setNombreMetodo] = useState('')
    const [valor, setValor] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [cargando, setCargando] = useState(false)
    const [respuestaServer, setRespuestaServer] = useState('')
    const [respuestaError, setRespuestaError] = useState(false)

    async function sendData(evento) {
        evento.preventDefault()
        setCargando(true)
        try {
            const response = await axios.post('http://localhost:8000/metodoPagos',
                {
                    nombreMetodo,
                    valor,
                    descripcion
                }
            )
            setRespuestaServer('Pago registrado!')
            setRespuestaError(false)
        } catch (error) {
            setRespuestaServer(`Error al enviar datos: ${error.response?.data || error.message}`)
            setRespuestaError(true)
        }
        finally {
            setCargando(false)
        }

    }
    return (
        <>
            <br />
            <div className="container my-5">
                <div className="row">
                    <div className="col-12">
                        <h3>Registro Metodo de pago:</h3>
                        <form action="" onSubmit={sendData} className="p-5 border rounded shadow">
                            <div className="row">
                                <div className="col-12 ">
                                    <label className="form-label">Tipo de metodo:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={nombreMetodo}
                                        onChange={(nombre) => setNombreMetodo(nombre.target.value)} />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-12 col-md-6">
                                    <label className="form-label">Valor:</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={valor}
                                        onChange={(valor) => setValor(valor.target.value)} />
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="form-label">Descripcion:</label>
                                    <textarea
                                        className="form-control"
                                        value={descripcion}
                                        onChange={(descripcion) => setDescripcion(descripcion.target.value)} />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-outline-secondary my-3 w-100">Guardar pago</button>
                            {cargando ? (
                                <div className="d-flex justify-content-center">
                                    <div className="spinner-border" ></div>
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