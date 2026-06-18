# E-Mechanic

ERP para talleres de motocicletas — Express + React + MongoDB

![Tests](https://github.com/DanielSrna/E-Mechanic/actions/workflows/test.yml/badge.svg)

## Características

- 🔐 Autenticación JWT con refresh token rotado + RBAC (admin/mecánico)
- 📋 Tablero Kanban drag-and-drop para órdenes de trabajo
- 📅 Calendario de capacidad del taller
- 📦 Gestión de inventario con alertas de stock bajo
- 📊 Dashboard con métricas y gráficos (Chart.js)
- 🔔 Notificaciones en tiempo real
- 📧 Facturas por email con PDF adjunto
- 🛒 Webhooks con firma HMAC-SHA256
- 🌗 Modo oscuro
- 🎓 Tutorial interactivo (React Joyride)

## Stack

| Capa | Tecnología |
|---|---|
| Backend | Node 24, Express 5, Mongoose 9 |
| Frontend | React 19, Vite 8, Tailwind 4 |
| Base de datos | MongoDB (Atlas o local) |
| Email | Nodemailer + Gmail SMTP |
| Tests | Jest 30 + Supertest + mongodb-memory-server |

## Arranque rápido

```bash
# 1. Clonar
git clone https://github.com/DanielSrna/E-Mechanic.git
cd E-Mechanic

# 2. Backend
cd backend
cp .env.example .env   # Edita MONGODB_URL y JWT_SECRET
npm install
npm run seed:force
npm run dev             # http://localhost:3000

# 3. Frontend (otra terminal)
cd frontend
npm install
npm run dev             # http://localhost:5173
```

**Credenciales demo:**
- Admin: `admin@emechanic.com` / `admin123`
- Mecánico: `carlos@emechanic.com` / `mecanico123`

## Scripts

### Backend (`/backend`)

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor con hot reload |
| `npm test` | Tests con cobertura |
| `npm run test:ci` | Tests para CI (sin cobertura) |
| `npm run lint` | ESLint |
| `npm run seed` | Datos de prueba (40 órdenes) |
| `npm run seed:force` | Borrar y recargar datos |

### Frontend (`/frontend`)

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor Vite (HMR) |
| `npm run build` | Build producción |
| `npm run lint` | ESLint |

## Docker

```bash
docker compose up -d
```

Esto levanta MongoDB, backend (:3000) y frontend (:80) en contenedores.

## Despliegue

Ver [docs/DEPLOY.md](docs/DEPLOY.md) para la guía paso a paso.

## API Docs

Swagger disponible en `http://localhost:3000/api-docs` (solo desarrollo).

## Tests

```
Test Suites: 14 passed, 14 total
Tests:       133 passed, 133 total
```
