# moni — Frontend (Web App)

Aplicación web de **moni**: control financiero personal con registro de gastos, métodos de pago, grupos compartidos, deudas y dashboard analítico.

> **Tu dinero, tu meta. Nosotros te guiamos.**

Proyecto académico — **Adrian Barrera García** · 2026

---

## Stack

- **React 18** (funcional, hooks)
- **Vite** (dev server + bundler)
- **React Router 6** (SPA)
- **Recharts** (gráficos del dashboard)
- **Bootstrap 5 + Bootstrap Icons**
- **Context API** (Auth, Toast, Theme)

---

## Funcionalidades

| Sección | Descripción |
|---|---|
| **Auth** | Login, registro, recuperación de contraseña con código por correo |
| **Dashboard** | KPIs mensuales, gráficos de gastos por categoría, tendencias |
| **Mis Gastos** | CRUD de gastos con filtros, categorías, métodos de pago |
| **Métodos de pago** | Gestión de cuentas, tarjetas, efectivo |
| **Mis Finanzas** | Resumen, presupuesto, tasa de ahorro, sugerencias automáticas |
| **Grupos** | Gastos compartidos entre varios usuarios |
| **Deudas** | Registro de préstamos y deudas |
| **Perfil** | Editar datos, cambiar contraseña, vincular WhatsApp |
| **Panel admin** | Estado del bot, consumo de Claude AI, estadísticas |

---

## Requisitos previos

- Node.js 18+
- El backend (proyecto `gastos`) corriendo en `http://localhost:8080`

---

## Instalación y arranque

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# El valor por defecto VITE_API_URL=http://localhost:8080 funciona en local

# 3. Arrancar el dev server
npm run dev
```

El servidor arranca en **http://localhost:5173**.
Para acceder desde el celular (misma WiFi), usa la URL de **Network** que aparece en la consola.

---

## Estructura del proyecto

```
src/
├── Routes/
│   └── AppRoutes.jsx          # Definición de rutas protegidas/públicas
├── components/
│   ├── layout/                # Sidebar, AppLayout
│   ├── pages/                 # Una carpeta por página/feature
│   │   ├── Auth/              # Login, Register, ForgotPassword
│   │   ├── Dashboard/
│   │   ├── Expenses/
│   │   ├── PaymentMethod/
│   │   ├── Finance/
│   │   ├── Groups/
│   │   ├── Debts/
│   │   ├── Profile/
│   │   └── Admin/
│   └── ui/                    # Componentes reutilizables (StatCard, Spinner...)
├── context/                   # AuthContext, ToastContext, ThemeContext
├── hooks/                     # useFetch, useForm, useMutation
├── lib/
│   └── apiClient.js           # Wrapper de fetch con JWT
├── services/                  # Un servicio por dominio
├── styles/
│   └── theme.css              # Variables CSS + dark/light mode
└── main.jsx
```

---

## Credenciales de prueba

Al arrancar el backend por primera vez se crea un usuario demo:

| Campo | Valor |
|---|---|
| Correo | `demo@moni.app` |
| Contraseña | `Demo2026!` |

---

## Tema oscuro / claro

Botón en la barra superior. La preferencia se guarda en `localStorage`.

---

## Build de producción

```bash
npm run build      # genera /dist
npm run preview    # sirve el build
```

---

## Notas de seguridad

- `.env` excluido del repositorio
- El JWT se guarda en `localStorage` (key `moni_token`)
- Todas las llamadas a `/admin/*`, `/gastos/*`, `/finanzas/*` requieren JWT válido
