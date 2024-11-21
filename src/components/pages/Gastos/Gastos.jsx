import { useState } from "react"
import FormularioGastos from "../FormularioGastos/FormularioGastos"
import ListadoGastos from "../ListadoGastos/ListadoGastos"

export default function Gastos(){
    const [infoMain, setInfoMain] = useState("")

    const cambiarInfo = (valor)=>{
        setInfoMain(valor)
    }
    return(
        <>
        <br /><br /><br />
            <div className="container text-center">
                <div className="row">
                    <div
                     className="col border p-2 m-3 rounded-4 text-center"
                     onClick={()=>cambiarInfo("registrarGasto")}
                     >
                        Registrar gasto
                    </div>
                    <div
                     className="col border p-2 m-3 rounded-4"
                     onClick={()=>cambiarInfo("verGastos")}
                     >
                        Ver gastos
                    </div>
                    <div
                     className="col border p-2 m-3 rounded-4"
                     onClick={()=>cambiarInfo("verGastosPorUsuario")}
                     >
                        Ver gastos por usuario
                    </div>
                </div>
            </div>
            {infoMain == "registrarGasto" && <FormularioGastos/>}
            {infoMain == "verGastos" && <ListadoGastos/>}
            {infoMain == "verGastosPorUsuario" && <ListadoGastos gastoUsuario={infoMain}/>}
        </>
    )
}