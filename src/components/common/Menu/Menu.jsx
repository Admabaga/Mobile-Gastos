import './Menu.css'
import React from 'react'
import { Link } from "react-router-dom";

function Menu() {
  return (
    <>
        <nav className="navbar navbar-expand-lg menu navbar-dark fixed-top">
            <div className="container-fluid">
                <a className="navbar-brand" href="#">
                Gastos APP
                </a>
                <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarNav"
                aria-controls="navbarNav"
                aria-expanded="false"
                aria-label="Toggle navigation"
                >
                <span className="navbar-toggler-icon" />
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav">
                    <li className="nav-item">
                    <Link className="nav-link" aria-current="page" to="/">
                        Inicio
                    </Link>
                    </li>
                    <li className="nav-item">
                    <Link className='nav-link' to={'/usuarios'}>
                        Usuarios
                    </Link>
                    </li>
                    <li className="nav-item">
                    <a className="nav-link" href="#">
                        Pricing
                    </a>
                    </li>
                    <li className="nav-item">
                    <a className="nav-link disabled" aria-disabled="true">
                        Disabled
                    </a>
                    </li>
                </ul>
                </div>
            </div>
        </nav>
    </>
  )
}

export default Menu