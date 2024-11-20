import { useEffect, useState } from "react"

export default function ListadoUsuarios() {
    //dataFake
    const dataFake = [
        {
            id: 1,
            nombre: 'Juan',
            telefono: '871616912',
            ciudad: 'Medellin'
        },
        {
            id: 2,
            nombre: 'Andres',
            telefono: '321',
            ciudad: 'Medellin'
        },
        {
            id: 3,
            nombre: 'Felipe',
            telefono: '151561',
            ciudad: 'Medellin'
        },
        {
            id: 4,
            nombre: 'Julian',
            telefono: '12345648',
            ciudad: 'Medellin'
        }
    ]

    const [datosApi, setDatosApi] = useState(null);
    const [estadoCarga, setEstadoCarga] = useState(true);
    // Programo el use effect para garantizar que llamara el servicio y voy a traer los datos
    useEffect(() => {
        const fetchData = async () => {
            setDatosApi(dataFake);
            setEstadoCarga(false);
        };
        fetchData();
    }, []);
    return (
        <>
            <br /><br /><br />
            { }
            
            <div className="container">
            <h3>Listado de Usuarios</h3>
                <div className="row row-cols-1 row-cols-md-3 g-3">
                    {datosApi && datosApi.map(usuario => (
                        <div className="col" key={usuario.id}>
                            <div className="card h-100 shadow p-5">
                                <h5>Nombre: {usuario.nombre}</h5>
                                <h4>Ciudad: {usuario.ciudad}</h4>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </>
    )
}