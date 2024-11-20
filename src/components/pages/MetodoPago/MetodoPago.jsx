import FormularioMetodoPago from "../FormularioMetodoPago/FormularioMetodoPago"
import ListadoMetodos from "../ListadoMetodoPago/ListadoMetodoPago"
import { useState } from "react"
export default function MetodoPago(){
    const [infoMain, setInfoMain] = useState("")
    const cambiarMain = (valorCambio)=>{
        setInfoMain(valorCambio)
    }
    return (
        <>
        <br /><br /><br />
            <div className="container text-center">
                <div className="row">
                    <div
                     className="col border p-2 m-3 rounded-4"
                     onClick={()=>cambiarMain("registrarUsuario")}
                     >
                        Registrar metodo
                    </div>
                    <div
                     className="col border p-2 m-3 rounded-4"
                     onClick={()=>cambiarMain("verUsuarios")}
                     >
                        Ver Metodos
                    </div>
                </div>
            </div>
            {infoMain == "registrarUsuario" && <FormularioMetodoPago/>}
            {infoMain == "verUsuarios" && <ListadoMetodos/>}
            
        </>
    )
}