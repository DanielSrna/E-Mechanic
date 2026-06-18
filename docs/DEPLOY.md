# Guía de Despliegue 🚀

> Elige tu método: Docker (local) o Vercel + Render (internet).

---

## Docker (rápido, local)

```bash
git clone https://github.com/DanielSrna/E-Mechanic.git
cd E-Mechanic
cp backend/.env.example backend/.env
# Edita backend/.env:
#   MONGODB_URL=mongodb://mongo:27017/e_mechanic
#   JWT_SECRET=genera_un_secreto_de_64_bytes
#   JWT_REFRESH_SECRET=genera_otro_secreto_de_64_bytes
docker compose up -d
# App en http://localhost, con datos demo y banner de reclutador
```

Para produccion con Docker:
```bash
docker compose up -d
docker compose exec backend npm run setup:prod    # Solo 1 admin, sin datos demo
```

---

## Despliegue en Internet (Vercel + Render)

---

## 1. MongoDB Atlas (Base de datos)

1. Ve a [https://atlas.mongodb.com](https://atlas.mongodb.com) y crea una cuenta gratis
2. Crea un cluster **M0** (gratis, 512 MB)
3. En **Database Access**, crea un usuario con contraseña (ej: `emechanic` / `password123`)
4. En **Network Access**, agrega `0.0.0.0/0` (permitir todo — en producción limita a la IP de Render)
5. En **Clusters**, haz clic en **Connect** → **Drivers** → copia la connection string

---

## 2. Render (Backend)

1. Ve a [https://render.com](https://render.com) y crea cuenta gratis
2. Crea un **Web Service** → conectar repositorio de GitHub
3. Configuración:

| Campo | Valor |
|---|---|
| Name | `emechanic-api` |
| Root Directory | `backend` |
| Runtime | Node |
| Build Command | `npm ci` |
| Start Command | `node server.js` |
| Instance Type | Free |

4. En **Environment Variables**, agrega:

```
MONGODB_URL=mongodb+srv://emechanic:password123@cluster.mongodb.net/e_mechanic
JWT_SECRET=genera_un_secreto_de_64_bytes_aleatorio
JWT_REFRESH_SECRET=genera_otro_secreto_de_64_bytes_aleatorio
FRONTEND_URL=https://tudominio.vercel.app
NODE_ENV=production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=e.mechanic98@gmail.com
SMTP_PASS=tu-app-password-de-16-caracteres
```

5. Health check: Render usará automáticamente `/api/health`
6. Haz clic en **Deploy**

---

## 3. Vercel (Frontend)

1. Ve a [https://vercel.com](https://vercel.com) y crea cuenta gratis
2. Importa el repositorio de GitHub
3. Configuración:

| Campo | Valor |
|---|---|
| Framework Preset | Vite |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

4. En **Environment Variables**:

```
VITE_API_URL=https://emechanic-api.onrender.com
```

5. Haz clic en **Deploy**

---

## 4. Dominio (opcional)

1. Compra un dominio en [Namecheap](https://namecheap.com) o [Porkbun](https://porkbun.com)
2. **Vercel**: ve a tu proyecto → Settings → Domains → agrega `tudominio.com`
3. **Render**: ve a tu servicio → Settings → Custom Domain → agrega `api.tudominio.com`
4. Configura los DNS en tu proveedor:

| Tipo | Nombre | Valor |
|---|---|---|
| A | @ | IP de Vercel (la dan en Domains) |
| CNAME | www | `cname.vercel-dns.com` |
| CNAME | api | `emechanic-api.onrender.com` |

5. SSL: Vercel y Render lo gestionan automático (Let's Encrypt)

---

## 5. Gmail SMTP (Correo)

1. Ya está configurado con `e.mechanic98@gmail.com`
2. Verifica que la cuenta tenga verificación en 2 pasos activada
3. La contraseña de aplicación ya está en las env vars de Render
4. **Límite:** 500 emails/día (gratis)

---

## 6. Verificar

- [ ] `https://tudominio.com` carga el login
- [ ] Login admin funciona: `admin@emechanic.com` / `admin123`
- [ ] Login mecánico funciona: `carlos@emechanic.com` / `mecanico123`
- [ ] Órdenes y agenda cargan datos (correr `npm run seed:force` debe ejecutarse desde el backend)
- [ ] Cerrar una orden → llega email con factura PDF
- [ ] Notificaciones funcionan (campanita en header)
- [ ] Swagger: `https://emechanic-api.onrender.com/api-docs` (si NODE_ENV=development)

---

## Demo vs Producción

**Demo** (banner + datos que se resetean cada hora):
- Render env: `DEMO_RESET_ENABLED=true`, `NODE_ENV=development`
- Vercel env: `VITE_DEMO_MODE=true`
- Corre `npm run seed:force` una vez

**Producción** (sin banner, sin datos demo):
- Render env: `NODE_ENV=production` (NO agregues DEMO_RESET_ENABLED)
- Vercel env: no pongas VITE_DEMO_MODE
- Corre `npm run setup:prod` (1 admin, sin 40 órdenes)
- Cambia credenciales del admin desde Configuración
