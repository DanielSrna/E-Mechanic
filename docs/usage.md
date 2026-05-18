# Guía de Uso — E-Mechanic

## Primeros pasos

1. Después del seed, inicia sesión con `admin@emechanic.com` / `admin123`
2. Ve a **Configuración** y personaliza:
   - Nombre de tu taller
   - Logo (sube una imagen PNG)
   - Colores del tema (se aplican al sidebar, header, dashboard)
   - Datos de la empresa para facturas (NIT, dirección, teléfono, email)

## Flujo de trabajo diario

### 1. Registrar cliente
Ve a **Clientes → Nuevo Cliente**. Llena nombre y teléfono. Email y dirección son opcionales.

### 2. Registrar motocicleta
Ve a **Motocicletas → Registrar Moto**. Asigna placa, marca, modelo, año, kilometraje y el cliente dueño. Puedes subir fotos después.

### 3. Crear orden de trabajo
Ve a **Órdenes → Nueva Orden**. Selecciona la moto, asigna un mecánico, y describe el motivo de ingreso. La orden empieza en estado "ingresada".

### 4. Gestionar la reparación
Abre el detalle de la orden y:
- **Agregar repuestos:** Selecciona del inventario, se descuenta automáticamente
- **Agregar mano de obra:** Solo el admin puede hacerlo
- **Agregar hallazgos:** Título + descripción de lo encontrado
- **Cambiar estado:** Usa el panel derecho para avanzar o retroceder

### 5. Cerrar y facturar
Cuando la orden llegue a "lista_entrega" (o "entregada"), el botón **"Cerrar y Facturar"** calculará los totales:
- Subtotal de repuestos
- Subtotal de mano de obra
- IVA (19%)
- **TOTAL**
- Se genera un PDF y se envía por email al cliente (si hay SMTP configurado)

### 6. Inventario
En **Inventario** puedes:
- Agregar/editar/eliminar repuestos
- Filtrar por **stock bajo** (productos que necesitan reorden)
- Buscar por nombre, SKU o marca

## Dashboard (Admin)

En el Dashboard ves:
- **KPIs:** Clientes, órdenes totales, pendientes, ingresos del mes
- **Ingresos mensuales:** Gráfica de línea
- **Productividad por mecánico:** Barras comparativas
- **Distribución de estados:** Gráfica de pastel
- **Acciones rápidas:** Atajos a crear órdenes, clientes, etc.

## Mecánicos

En **Mecánicos** puedes:
- Crear nuevos usuarios (admin o mecánico)
- Ver estadísticas de cada uno (órdenes activas, completadas, facturado)
- Subir foto de perfil
- **Despedir:** Al despedir un mecánico, sus órdenes activas se reasignan automáticamente

## Consejos

- **Email:** Configura SMTP en `.env` para que las facturas lleguen por correo. Sin SMTP, las facturas se generan pero no se envían.
- **Imágenes:** Sin GCS configurado, las imágenes se guardan en disco local. En producción, configura Google Cloud Storage.
- **Backups:** MongoDB Atlas tiene backups automáticos en planes de pago.
