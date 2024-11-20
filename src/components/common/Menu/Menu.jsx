import './Menu.css'
import React from 'react'
import { Link } from "react-router-dom";

function Menu() {
    return (
        <>
            <nav className="navbar navbar-expand-lg menu navbar-dark fixed-top">
                <div className="container-fluid">
                    <a className="navbar-brand" href="/">
                        Gastos APP
                    </a>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarNav"
                    >
                        <span className="navbar-toggler-icon" />
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <Link className="nav-link" to="/">
                                    Inicio
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className='nav-link' to={'/usuarios'}>
                                    Usuarios
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className='nav-link' to={'/gastos'}>
                                    Gastos
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to={'/metodoPagos'}>
                                    Metodo pago
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to={'/listadoUsuarios'}>
                                    Listado Usuarios
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    )
}

export default Menu