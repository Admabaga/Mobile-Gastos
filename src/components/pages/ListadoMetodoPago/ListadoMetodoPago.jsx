import axios from "axios"
import { useEffect, useState } from "react"
import iconoMetodo from "../../../assets/img/MetodoPago.png"

import '../ListadoGastos/CardGastos.css'
export default function ListadoMetodos(){
    const [metodos, setMetodos] = useState(null)
    const [spinner, setSpinner] = useState(false)
    const [respuestaServer, setRespuestaServer] = useState("")
    const [respuestaError, setRespuestaError] = useState(false)

    useEffect(()=>{
        const traerMetodos = async ()=>{
            setSpinner(true)
            try{
                const respuesta = await axios.get('http://localhost:8000/metodoPagos')
                setMetodos(respuesta.data)
                setRespuestaError(false)
            }catch(error){
                setRespuestaServer(`Error al enviar datos: ${error.message}`)
                setRespuestaError(true)
            }finally{
                setSpinner(false)
            }
        }
        traerMetodos()
    },[])
    return(
        <>
        <div className="container my-5">
            <h3 className="text-center mb-4">Metodos Registrados</h3>
            <div className="row row-cols-1 row-cols-md-3 g-4">
                {metodos &&
                    metodos.map((metodo) => (
                        <div className="col" key={metodo.id}>
                            <div className="card h-100 shadow-sm rounded-4 border-0">
                                <div className="card-body">
                                    <img 
                                    src={iconoMetodo}
                                    className="img-fluid  mb-3"/>
                                    <h3 className="card-title text-primary mb-3">{metodo.nombreMetodo}</h3>
                                    <h5 className="card-text text-success">Valor: ${metodo.valor}</h5>
                                    <p className="card-text text-secondary"> {metodo.descripcion}</p>
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