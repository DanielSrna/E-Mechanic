# Plan Maestro - E-Mechanic ERP

Sistema ERP web para gestión integral de talleres mecánicos de motocicletas.

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Node.js + Express 5 (ES Modules) |
| Base de datos | MongoDB + Mongoose 9 |
| Autenticación | JWT (access + refresh tokens en cookies httpOnly) |
| Validación | Zod (entorno) + express-validator (requests) |
| Documentación API | Swagger (swagger-jsdoc + swagger-ui-express) |
| Logger | Winston (niveles: contexto, proceso, exito, fracaso) |
| Email | Nodemailer |
| PDF | pdfkit |
| Arquitectura | Event-Driven (Node.js EventEmitter) |
| Frontend | React + Vite |
| Dashboard | Chart.js + react-chartjs-2 |
| Estilos | Tailwind CSS / shadcn/ui |

---

## Modelo de Datos (MongoDB)

```
User (admin/mecanico)
  │
  │ assigned mechanic
  ▼
WorkOrder ──────────────► Motorcycle ─────► Client
  │                           │
  │ partsUsed[N]              │ plate, brand, model
  ▼                           │
Part (inventario)             ▼
  sku, name, stock         WorkOrder[] (historial clínico)
```

### Roles (RBAC)
- **admin**: Dueño. Puede TODO (crear usuarios, ver finanzas, borrar registros, gestionar inventario).
- **mecanico**: Puede ver clientes/motos, crear/actualizar órdenes, ver inventario. NO puede ver finanzas ni borrar registros.

---

## Fases de Implementación

### Fase 0: Saneamiento y Auth Completo

| # | Tarea | Archivo |
|---|---|---|
| 0.1 | Corregir `server.js` (async/await) | `backend/server.js` |
| 0.2 | `db.config.js`: usar `env.MONGODB_URL` de Zod | `backend/src/config/db.config.js` |
| 0.3 | `user.model.js`: early return en pre-save + verificar password | `backend/src/models/user.model.js` |
| 0.4 | `jwt.model.js`: eliminar bcrypt, guardar JWT tal cual | `backend/src/models/jwt.model.js` |
| 0.5 | Verificar `isActive` en login | `backend/src/controllers/user.controller.js` |
| 0.6 | `sameSite: 'lax'` en cookie | `backend/src/controllers/user.controller.js` |
| 0.7 | Scripts `dev` y `start` en package.json | `backend/package.json` |
| 0.8 | Middlewares `verifyToken` + `requireRole` | `backend/src/middlewares/auth.middleware.js` |
| 0.9 | Refresh token + logout endpoints | `backend/src/controllers/user.controller.js` |
| 0.10 | `GET /api/users/me` | `backend/src/controllers/user.controller.js` |
| 0.11 | Configurar Swagger | `backend/src/config/swagger.config.js` |
| 0.12 | EventEmitter centralizado | `backend/src/events/eventEmitter.js` |

### Fase 1: Módulo de Clientes y Vehículos

**Modelos:**
- `Client`: name, phone, email, address
- `Motorcycle`: plate (único), brand, model, year, mileage, client ref

**Endpoints:**
- CRUD `/api/clients`
- CRUD `/api/motorcycles`
- `GET /api/motorcycles?plate=ABC123` (búsqueda)
- `GET /api/motorcycles/:id/history` (historial clínico)

### Fase 2: Órdenes de Trabajo (OT)

**Modelo `WorkOrder`:**
- motorcycle, client, mechanic (refs)
- status: ingresada → en_revision → esperando_aprobacion → esperando_repuestos → en_reparacion → lista_entrega → entregada / cancelada
- entryReason, diagnosis, notes
- partsUsed: [{ part, quantity, unitPrice }]
- labor: [{ description, cost }]
- subtotalParts, subtotalLabor, tax, total
- closedAt, isClosed

**Endpoints:**
- CRUD + cambio de estado + agregar/quitar repuestos y mano de obra
- Cierre de orden: bloquea ediciones, dispara `order:closed`

**Reglas de negocio:**
- Al agregar repuesto: descuento inmediato de inventario (transacción Mongoose)
- Transiciones de estado validadas (no se puede saltar de ingresada a entregada)
- Al cerrar: calcular totales, generar PDF, enviar email

### Fase 3: Inventario

**Modelo `Part`:**
- sku (único), name, brand, description
- purchasePrice, salePrice
- stock, minStock
- category

**Endpoints:**
- CRUD `/api/parts`
- `GET /api/parts/low-stock` (alertas)

**Eventos:**
- `inventory:low-stock` → alerta cuando stock <= minStock

### Fase 4: Facturación y Notificaciones

- Generación de PDF con pdfkit al cerrar orden
- Envío de email con Nodemailer (PDF adjunto)
- Plantilla HTML para el cuerpo del correo

### Fase 5: Dashboard Admin (Backend)

Endpoints de agregación para Chart.js:
- `GET /api/stats/revenue?period=monthly`
- `GET /api/stats/mechanic-productivity`
- `GET /api/stats/low-stock`
- `GET /api/stats/most-used-parts`

### Fase 6: Frontend (React + Vite)

- Login / Register
- Rutas protegidas con AuthContext
- Dashboard admin con Chart.js
- CRUDs: Clientes, Motos, Órdenes, Inventario
- Interceptor axios para refresh token automático

---

## Eventos del Sistema (EventEmitter)

| Evento | Disparador | Listener |
|---|---|---|
| `order:closed` | Cierre de OT | EmailService.sendInvoice (PDF + email) |
| `order:part-added` | Agregar repuesto a OT | InventoryService.checkLowStock |
| `user:registered` | Registro exitoso | EmailService.sendWelcome (futuro) |

---

## Logger

El proyecto usa Winston con 4 niveles personalizados en español:

| Nivel | Prioridad | Uso |
|---|---|---|
| `fracaso` | 0 | Errores críticos |
| `exito` | 1 | Operaciones exitosas |
| `proceso` | 2 | Pasos intermedios |
| `contexto` | 3 | Trazabilidad de entrada/salida de funciones |

Transportes: Consola (color) + Archivo (`src/logs/app.log`, solo fracaso).

---

## Swagger

Documentación automática desde anotaciones JSDoc en los routers.
Disponible en `GET /api-docs` (development).

---

*Última actualización: 2026-05-13*
