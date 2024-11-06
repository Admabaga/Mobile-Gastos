import { Routes, Route } from "react-router-dom";
import React from 'react'
import Menu from "../components/common/Menu/Menu.jsx";
import Home from "../components/pages/Home/Home.jsx";
import Usuarios from "../components/pages/Usuarios/Usuarios.jsx";
import Gastos from "../components/pages/Gastos/Gastos.jsx";
import MetodoPago from "../components/pages/MetodoPago/MetodoPago.jsx";

function Rutas() {
  return (
    <>
        <Menu />
        <Routes>
            <Route path="/" element={ <Home /> } />
            <Route path="/usuarios" element={ <Usuarios /> } />
            <Route path="/gastos" element={ <Gastos /> } />
            <Route path="/metodoPagos" element={ <MetodoPago /> } />
        </Routes>
    </>
  )
}

export default Rutas