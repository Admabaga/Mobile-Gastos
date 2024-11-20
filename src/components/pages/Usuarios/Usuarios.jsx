import { useState } from "react";
import FormularioUsuario from "../FormularioUsuario/FormularioUsuario";
import ListadoUsuarios from "../ListadoUsuarios/ListadoUsuarios";

export default function Usuarios() {

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
                        Registrar usuario
                    </div>
                    <div
                     className="col border p-2 m-3 rounded-4"
                     onClick={()=>cambiarMain("verUsuarios")}
                     >
                        Ver usuarios
                    </div>
                </div>
            </div>
            {infoMain == "registrarUsuario" && <FormularioUsuario></FormularioUsuario>}
            {infoMain == "verUsuarios" && <ListadoUsuarios/>}
            
        </>
    )
}