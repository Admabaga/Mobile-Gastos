import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Rutas from './Routes/Rutas'
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.js"; 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Rutas />
    </BrowserRouter>,
  </StrictMode>,
)
