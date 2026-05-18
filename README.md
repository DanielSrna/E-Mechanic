# E-Mechanic

ERP para gestión integral de talleres de motocicletas.

## Stack

| Capa | Tecnología |
|---|---|
| Backend | Node.js 22+ / Express 5 / Mongoose 9 |
| Frontend | React 19 / Vite 8 / Tailwind CSS |
| Base de datos | MongoDB (Atlas o local) |
| Auth | JWT (access + refresh tokens httpOnly) |
| Testing | Jest + Supertest + MongoDB Memory Server |
| Email | Nodemailer (Gmail, Outlook, SMTP genérico) |
| Storage | Google Cloud Storage (opcional, fallback a local) |
| PDF | pdfkit (facturas electrónicas) |
| Dashboard | Chart.js (ingresos, productividad, estados) |

## Instalación rápida

```bash
git clone https://github.com/DanielSrna/E-Mechanic.git
cd E-Mechanic

# Opción A: Docker (recomendado)
cp backend/.env.example backend/.env
# Editar backend/.env con tus datos
docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.dev.yml exec api npm run seed
# Abrir http://localhost:3000/api-docs

# Opción B: Manual
cd backend && npm install && cp .env.example .env
# Editar .env con tu MONGODB_URL
npm run seed    # Datos demo + admin
npm run dev     # Backend en :3000

cd ../frontend && npm install
npm run dev     # Frontend en :5173
```

## Credenciales default (seed)

| Rol | Email | Contraseña |
|---|---|---|
| Admin | admin@emechanic.com | admin123 |
| Mecánico | carlos@emechanic.com | mecanico123 |
| Mecánico | maria@emechanic.com | mecanico123 |

## Scripts

### Backend (`cd backend`)

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor con hot reload |
| `npm start` | Servidor producción |
| `npm run seed` | Poblar BD con datos demo |
| `npm test` | Tests con cobertura |
| `npm run lint` | ESLint |

### Frontend (`cd frontend`)

| Comando | Descripción |
|---|---|
| `npm run dev` | Dev server :5173 |
| `npm run build` | Build producción |
| `npm run preview` | Preview del build |

## Variables de entorno

Ver `backend/.env.example` para la lista completa.

**Mínimas requeridas:**

```env
MONGODB_URL=mongodb+srv://...
JWT_SECRET=<64 bytes aleatorios>
JWT_REFRESH_SECRET=<64 bytes aleatorios>
NODE_ENV=production
FRONTEND_URL=https://tu-frontend.vercel.app
```

**Opcionales:**
- `SMTP_HOST/USER/PASS` — para enviar facturas por email
- `GCS_PROJECT_ID/BUCKET_NAME/...` — para almacenar imágenes en Google Cloud
- `STRIPE_SECRET_KEY` — para pagos (futuro)

## Despliegue

Ver `docs/deploy.md` para guías de Render, Railway y Vercel.

## Licencia

MIT © 2026 Daniel Felipe Serna López
