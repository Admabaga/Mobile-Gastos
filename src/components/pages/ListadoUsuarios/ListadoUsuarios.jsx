import { useEffect, useState } from "react"

export default function ListadoUsuarios(){
    //dataFake
    const dataFake = [
        {
            id: 1,
            nombre: 'Juan',
            telefono: '871616912', 
            ciudad: 'Medellin'},
        {
            id: 2,
            nombre: 'Andres', 
            telefono: '321', 
            ciudad: 'Medellin'},
        {
            id: 3,
            nombre: 'Felipe', 
            telefono: '151561', 
            ciudad: 'Medellin'},
        {
            id: 4,
            nombre: 'Julian', 
            telefono: '12345648', 
            ciudad: 'Medellin'}
    ]
    return(
        <>
        <br /><br /><br />  
        {}
        <h3>Listado de Usuarios</h3>
        <table>
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Telefono</th>
                    <th>Ciudad</th>
                </tr>
            </thead>
            <tbody>
                {dataFake.map((usuario) => (
                    <tr key={usuario.id}>
                        <td>{usuario.nombre}</td>
                        <td>{usuario.telefono}</td>
                        <td>{usuario.ciudad}</td>
                    </tr>
                ))}
            </tbody>
        </table>

        </>
    )
}