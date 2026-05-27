import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND = 'http://localhost:8080'

/**
 * Si el browser hace una navegación directa (F5, barra URL, ctrl+click) el header
 * Accept contiene "text/html". En ese caso Vite debe servir index.html y dejar que
 * React Router maneje la ruta — nunca proxiar al backend.
 * Las llamadas de API desde fetch/axios solo llevan Accept: application/json y sí se proxian.
 */
function spa(req) {
  return (req.headers.accept ?? '').includes('text/html') ? '/index.html' : null
}

/** Genera la config de proxy con SPA-bypass incluido en todas las rutas. */
function route(extraOpts = {}) {
  return { target: BACKEND, changeOrigin: true, bypass: spa, ...extraOpts }
}

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,   // expone en red local → aparece la URL de Network para el cel
    proxy: {
      '/auth':         route(),
      '/resumen':      route(),
      '/usuarios':     route(),
      '/gastos':       route(),
      '/metodoPagos':  route(),
      '/categorias':   route(),
      '/finanzas':     route(),
      '/ingresos':     route(),
      '/grupos':       route(),
      '/deudas':       route(),
      '/prestamos':    route(),
      '/internal':     route(),
      '/admin':        route(),
    },
  },
})
