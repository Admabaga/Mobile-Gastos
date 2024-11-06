import { Routes, Route } from "react-router-dom";
import React from 'react'
import Menu from "../components/common/Menu/Menu.jsx";
import Home from "../components/pages/Home/Home.jsx";
import Usuarios from "../components/pages/Usuarios/Usuarios.jsx";

function Rutas() {
  return (
    <>
        <Menu />
        <Routes>
            <Route path="/" element={ <Home /> } />
            <Route path="/usuarios" element={ <Usuarios /> } />
        </Routes>
    </>
  )
}

export default Rutas