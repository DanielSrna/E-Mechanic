# Despliegue en Producción

## Render (Backend)

1. Crear cuenta en [render.com](https://render.com)
2. New → Web Service → Conectar repo de GitHub
3. Configurar:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/`
4. Agregar variables de entorno (Environment):
   ```
   NODE_ENV=production
   MONGODB_URL=mongodb+srv://...
   JWT_SECRET=<secreto de 64 bytes>
   JWT_REFRESH_SECRET=<otro secreto de 64 bytes>
   FRONTEND_URL=https://tu-app.vercel.app
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=tu-email@gmail.com
   SMTP_PASS=tu-app-password
   ```
   > **Nota:** Para imágenes, configura GCS (Google Cloud Storage) o deja que use almacenamiento local efímero.

5. Deploy

## Vercel (Frontend)

1. Crear cuenta en [vercel.com](https://vercel.com)
2. Importar proyecto → Conectar repo de GitHub
3. Configurar:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Agregar variable de entorno: `VITE_API_URL=https://emechanic-api.onrender.com`
5. Deploy

> **Importante:** Actualiza `FRONTEND_URL` en Render con la URL de Vercel.

## MongoDB Atlas (Base de Datos)

1. Crear cluster gratis en [atlas.mongodb.com](https://atlas.mongodb.com)
2. Database Access → Crear usuario (pofesto / contraseña)
3. Network Access → Allow access from anywhere (0.0.0.0/0)
4. Connect → Drivers → Copiar connection string
5. Pegar en `MONGODB_URL` (reemplazar `<password>`)

## Dominio Personalizado (Opcional)

1. Comprar dominio en Namecheap/GoDaddy (ej: `mitaller.com`)
2. En Vercel: Settings → Domains → Agregar `mitaller.com`
3. En Render: Settings → Custom Domain → Agregar `api.mitaller.com`
4. Configurar DNS:

```
mitaller.com     CNAME  cname.vercel-dns.com
api.mitaller.com CNAME  emechanic-api.onrender.com
```
