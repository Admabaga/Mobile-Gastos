import axios from "axios"
import { useEffect, useState } from "react"
import iconoGasto from '../../../assets/img/iconoGasto.png'
import './CardGastos.css'

export default function ListadoGastos({ gastoUsuario }) {
    const [gastos, setGastos] = useState(null)
    const [spinner, setSpinner] = useState(false)
    const [respuestaServer, setRespuestaServer] = useState("")
    const [respuestaError, setRespuestaError] = useState(false)
    const [usuarioId, setUsuarioId] = useState("")
    const [usuarios, setUsuarios] = useState([])

    useEffect(() => {
        const traerUsuarios = async () => {
            try {
                const response = await axios.get('http://localhost:8000/usuarios')
                setUsuarios(response.data)
            } catch (error) {
                console.log('Error al cargar usuarios:', error)
            }
        }
        traerUsuarios()
    }, [])

    const getGastos = () => {
        if (gastoUsuario === "verGastosPorUsuario") {
            if (usuarioId) {
                traerGastosPorUsuario()
            }
        } else {
            traerTodosLosGastos()
        }
    }
    useEffect(() => {
        getGastos()
    }, [gastoUsuario, usuarioId])

    function traerTodosLosGastos() {
        setSpinner(true);
        const traerGastos = async () => {
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
    }

    function traerGastosPorUsuario() {
        setSpinner(true)
        const traerGastos = async () => {
            try {
                const respuesta = await axios.get(`http://localhost:8000/gastos/usuarios/${usuarioId}`)
                setGastos(respuesta.data)
                setRespuestaError(false)
            } catch (error) {
                setRespuestaServer(`Error al obtener datos: ${error.request?.data || error.message}`)
                setRespuestaError(true)
            } finally {
                setSpinner(false)
            }
        }
        traerGastos()
    }

    const refresh = () => {
        setGastos([])
        setRespuestaServer('')
        setRespuestaError(false)
        getGastos()
    }

    return (
        <div className="container my-5">
            <h3 className="text-center mb-4">Gastos Registrados</h3>
            {gastoUsuario === "verGastosPorUsuario" && (
                <div className="row">
                    <div className="col-12">
                        <label className="form-label my-2">Usuario: </label>
                        <select
                            className="form-control mb-4"
                            value={usuarioId}
                            onChange={(e) => setUsuarioId(e.target.value)}
                        >
                            <option value="">Seleccione un usuario</option>
                            {usuarios.map((usuario) => (
                                <option key={usuario.id} value={usuario.id}>{usuario.nombre}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            <div className="row row-cols-1 row-cols-md-3 g-4">
                {gastos && gastos.map((gasto) => (
                    <div className="col" key={gasto.id}>
                        <div className="card h-100 shadow-sm rounded-4 border-0">
                            <div className="card-body">
                                <img
                                    src={iconoGasto}
                                    className="img-fluid  mb-3" />
                                <h3 className="card-title text-primary mb-3">{gasto.nombre}</h3>
                                <h5 className="card-text text-success">Monto: ${gasto.monto}</h5>
                                <h5 className="card-text text-muted">Fecha: {gasto.fecha}</h5>
                                <p className="card-text text-secondary">{gasto.descripcion}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {spinner ? (
                <div className="d-flex justify-content-center">
                    <div className="spinner-border"></div>
                    <span className="m-1">Cargando...</span>
                </div>
            ) : (
                <>
                    {respuestaServer && (
                        <p className={`respuestaServer ${respuestaError ? "error" : "success"}`}>
                            {respuestaServer}
                        </p>
                    )}
                </>
            )}
            <button className="btn btn-outline-secondary w-100 my-4" onClick={refresh}>
                Refrescar
            </button>
        </div>
    )
}
