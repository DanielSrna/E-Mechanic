# E-Mechanic — Roadmap de Mejoras e Ideas

> Generado con las skills: `brainstorm-ideas-existing`, `architecture-designer`, `roadmap-planning`
> Fecha: Mayo 2026

---

## Parte 1: Revisión de Arquitectura Actual

### Lo que está bien

| Aspecto | Evaluación |
|---|---|
| **Separación de responsabilidades** | Controladores delgados, modelos con lógica encapsulada, servicios especializados (email, PDF, storage) |
| **Event-driven architecture** | `EventEmitter` desacopla cierre de orden → factura PDF → email. Bien implementado. |
| **Seguridad** | JWT dual (access + refresh), httpOnly cookie, rate limiting, magic numbers en uploads, Helmet CSP, NoSQL sanitization |
| **Pruebas** | 67 tests de integración con MongoDB en memoria, cobertura ~49% global |
| **Stack moderno** | ES Modules, Vite, Tailwind, Mongoose 8, Express 5, Chart.js, Lucide icons |
| **Configuración tipada** | Zod valida todas las variables de entorno con tipos y refinamientos |

### Áreas de mejora arquitectónica

#### 1. Máquina de estados sin enforcement
**Problema:** `order.model.js` define `VALID_TRANSITIONS` (estado → [estados permitidos]) pero `updateOrderStatus` lo ignora. Cualquier estado puede saltar a cualquier otro.
**Impacto:** Inconsistencia de negocio. Una orden `ingresada` puede ir directo a `entregada` sin pasar por revisión/reparación.
**Solución:** Mover la validación al modelo (`orderSchema.pre('save')`) para que sea imposible violar transiciones desde cualquier punto de entrada (API, seed, migraciones).

#### 2. Listener de stock bajo reusa función de factura
**Problema:** `stock.listeners.js` llama `sendInvoiceEmail()` con datos ficticios (motorcycle fake, invoiceNumber "STOCK-ALERT-..."). Es un hack funcional pero frágil.
**Solución:** Extraer `sendAlertEmail(alertData)` genérico reutilizado tanto por stock alerts como por otras notificaciones.

#### 3. Invoices sin endpoints REST
**Problema:** El modelo `Invoice` existe y se crea vía evento `order:closed`, pero no hay rutas para listar facturas, reenviarlas, o consultarlas.
**Impacto:** El admin no puede ver el historial de facturación desde el frontend.
**Solución:** Agregar `GET /api/invoices` y `POST /api/invoices/:id/resend`.

#### 4. Redis configurado pero no usado
**Problema:** `env.config.js` acepta `REDIS_URL` pero no hay cliente Redis inicializado.
**Oportunidad:** Usar Redis para caché de stats (las agregaciones de MongoDB son costosas), rate limiting distribuido, y colas de trabajos (BullMQ) para emails/PDFs asíncronos.

#### 5. Stripe inicializado pero sin endpoints
**Problema:** `stripe.config.js` existe pero no se usa. No hay checkout, webhooks, ni registro de pagos.
**Oportunidad:** Cobro digital al entregar la moto. El total ya está calculado en la orden.

---

## Parte 2: Lluvia de Ideas — 15 Ideas desde 3 Perspectivas

### Perspectiva Product Manager (Negocio, Estrategia, Cliente)

| # | Idea | Descripción |
|---|---|---|
| **PM1** | **Recordatorios por WhatsApp** | Enviar mensaje automático al cliente cuando su moto cambia de estado (ej: "Tu Honda CB150 está en reparación"). WhatsApp Business API o Twilio. Diferenciador competitivo enorme en Latinoamérica. |
| **PM2** | **Dashboard del Cliente (Portal)** | Link público por orden donde el cliente ve: estado actual, repuestos usados, mano de obra, total estimado, fotos del diagnóstico. Sin login, solo con token único. Reduce llamadas telefónicas al taller. |
| **PM3** | **Métricas de Rentabilidad** | Dashboard que muestre margen bruto por orden (ingresos - costo repuestos - costo mano de obra), ticket promedio, rentabilidad por mecánico, por tipo de moto. Los talleres no saben si ganan o pierden por orden. |
| **PM4** | **Programa de Fidelización** | Los clientes recurrentes acumulan puntos por cada orden cerrada. Canjeables por descuentos en servicios. Simple: 1% del total en puntos. Aumenta retención. |
| **PM5** | **App PWA Móvil** | Convertir el frontend en PWA con Service Worker. Instalable en el celular del mecánico/admin. Notificaciones push, acceso offline a órdenes activas. |

### Perspectiva Product Designer (UX, Usabilidad, Delight)

| # | Idea | Descripción |
|---|---|---|
| **PD1** | **Kanban Visual de Órdenes** | Vista de tablero Kanban con columnas por estado (ingresada, en revisión, en reparación...). Drag & drop para cambiar estado. Mucho más intuitivo que la tabla actual para el flujo diario del taller. |
| **PD2** | **Pantalla de Carga con Animación** | Skeletons y estados de carga consistentes en todas las páginas. Spinner genérico actual es pobre. Mejora percepción de velocidad y profesionalismo. |
| **PD3** | **Vista de Galería para Motos** | Las imágenes de la moto se suben pero no se ven. Galería con lightbox en el detalle de la moto. Fotos del antes/después de la reparación. Subir desde el celular en el taller. |
| **PD4** | **Notificaciones In-App (Campanita)** | Icono de campana en el header con contador. Notificaciones: "Orden #123 cambió a lista para entrega", "Stock bajo: Aceite 10W40 (3 unidades)". Panel de notificaciones con marca de leído. |
| **PD5** | **Modo Taller / Modo Oficina** | Alternar entre vista simplificada para el mecánico en el taller (tablet, solo ver mis órdenes activas, botones grandes) y vista completa de escritorio para el admin. |

### Perspectiva Software Engineer (Técnico, Datos, Escalabilidad)

| # | Idea | Descripción |
|---|---|---|
| **SE1** | **Validación de Transiciones en el Modelo** | Mover `VALID_TRANSITIONS` a `orderSchema.pre('validate')`. Así se garantiza que NADIE (API, seed, script) pueda violar las reglas de negocio. Una línea de código, alto impacto. |
| **SE2** | **Redis para Caché de Stats** | Las 6 agregaciones del dashboard se ejecutan en cada carga. Con 1000+ órdenes, tardan segundos. Cachear resultados en Redis con TTL de 5-15 minutos. Implementar con patrón "stale-while-revalidate". |
| **SE3** | **Cola de Trabajos con BullMQ** | Email y generación de PDF no deberían bloquear el request HTTP. Encolar `order:closed` → worker genera PDF → worker envía email. Con Redis. Reintentos automáticos, dashboard de monitoreo. |
| **SE4** | **Endpoint de Búsqueda Global** | `GET /api/search?q=honda` busca en clientes, motos, órdenes, repuestos simultáneamente. Tipo "spotlight search" del taller. Índice de texto en MongoDB o usar Atlas Search. |
| **SE5** | **Webhooks / Zapier Integration** | Endpoint para que el taller conecte E-Mechanic con su contabilidad (ej: enviar factura cerrada a Google Sheets, QuickBooks, o Zapier). JSON webhook en `order:closed`. |

---

## Parte 3: Top 5 Ideas Priorizadas

### Criterios de priorización
- **Impacto en negocio:** ¿Genera más ingresos, reduce costos, o retiene clientes?
- **Viabilidad técnica:** ¿Se puede construir con el stack actual en < 2 semanas?
- **Alcance de usuarios:** ¿Cuántos roles/talleres se benefician?
- **Diferenciación:** ¿Es algo que la competencia no tiene?

### 🥇 #1 — Kanban Visual de Órdenes (PD1)
**Qué es:** Vista de tablero con columnas por estado. Drag & drop para mover órdenes entre columnas.

**Por qué #1:**
- Es LA funcionalidad que todo taller mecánico espera ver (visual, táctil, intuitivo)
- Reemplaza la tabla actual que es difícil de usar en un celular/tablet en el taller
- El backend ya soporta cambios de estado (solo necesita el frontend)
- Bajo esfuerzo (~3 días): una librería como `@hello-pangea/dnd` + refactor de OrderList

**Supuestos a validar:**
- Los mecánicos prefieren vista Kanban sobre tabla (A/B testing)
- El drag & drop funciona bien en tablets Android (hardware común en talleres)
- La cantidad de órdenes activas por taller es < 30 (el kanban no escala bien a 100+ tarjetas)

**Esfuerzo estimado:** S (3-5 días)

---

### 🥈 #2 — Dashboard del Cliente / Portal de Orden (PM2)
**Qué es:** Link público tipo `emechanic.com/orden/abc123` donde el cliente ve el estado de su moto, repuestos, costo, y fotos del diagnóstico. Sin registro ni login.

**Por qué #2:**
- Reduce drásticamente llamadas y WhatsApps al taller ("¿Cómo va mi moto?")
- Diferenciador de venta: "Con nosotros, seguí tu reparación en tiempo real"
- Técnicamente simple: endpoint público con token único en la URL, página estática
- El backend ya tiene todos los datos (order con populate completo)

**Supuestos a validar:**
- Los clientes de taller realmente consultan el portal (medir tasa de apertura del link)
- El token público no expone datos sensibles (no incluir costo de compra de repuestos)
- Los mecánicos actualizan el estado frecuentemente (si no, el portal muestra datos viejos)

**Esfuerzo estimado:** M (1-2 semanas)

---

### 🥉 #3 — Recordatorios por WhatsApp (PM1)
**Qué es:** Integración con WhatsApp Business API (o Twilio) para enviar mensajes automáticos al cambiar el estado de una orden: "Tu moto ya está lista para entrega", "Necesitamos aprobación para cambiar X repuesto".

**Por qué #3:**
- WhatsApp es el canal #1 de comunicación en Latinoamérica (95%+ de penetración en talleres)
- Elimina la fricción de llamar por teléfono
- Aumenta la velocidad de aprobación de repuestos (el cliente responde "sí" por WhatsApp → el mecánico avanza)
- El evento `order:closed` ya existe; solo se necesita un listener nuevo

**Supuestos a validar:**
- Los clientes aceptan recibir mensajes del taller (opt-in al crear orden)
- El taller tiene un número de WhatsApp Business (gratuito)
- La API de Meta no bloquea el número por volumen de mensajes

**Esfuerzo estimado:** M-L (2-3 semanas, requiere aprobación de Meta Business)

---

### #4 — Validación de Transiciones en el Modelo (SE1) + Notificaciones In-App (PD4)
**Qué es:** (a) Forzar la máquina de estados desde el modelo Mongoose. (b) Campanita de notificaciones en el header con eventos del sistema.

**Por qué #4:**
- (a) Es un bug de arquitectura: 2 líneas de código arreglan la integridad de datos de todo el sistema
- (b) Sin notificaciones, el mecánico tiene que refrescar la página para ver cambios. Con notificaciones, el sistema se siente "vivo"
- Ambos son rápidos de implementar y tienen alto retorno

**Supuestos a validar:**
- Los cambios de estado actuales no violan las transiciones (si hay datos existentes, la migración debe ser suave)
- Las notificaciones in-app no saturan (límite de 50, las más viejas se archivan)

**Esfuerzo estimado:** S-M (1 semana combinado)

---

### #5 — Redis: Caché + Colas (SE2 + SE3)
**Qué es:** Agregar Redis para (a) cachear resultados de agregaciones del dashboard (TTL 10 min), (b) encolar generación de PDF y envío de emails con BullMQ.

**Por qué #5:**
- El dashboard se vuelve lento con 1000+ órdenes (las agregaciones son pesadas)
- Los emails bloquean el request HTTP (el cliente espera a que se genere PDF + se envíe email antes de ver "orden cerrada")
- Redis ya está en el stack (configurado en env), solo falta inicializarlo

**Supuestos a validar:**
- El taller tiene suficientes órdenes para justificar Redis (si tiene < 100, no se nota la diferencia)
- Redis no añade complejidad operativa excesiva en Render (Render tiene Redis managed)
- BullMQ no requiere worker separado en Render (puede usar el mismo proceso)

**Esfuerzo estimado:** M (2-3 semanas)

---

## Parte 4: Roadmap Now / Next / Later

### 🟢 NOW (Mayo-Junio 2026) — Experiencia del Taller

| Epic | Hipótesis | Éxito | Esfuerzo |
|---|---|---|---|
| **Kanban de Órdenes** | Si mostramos las órdenes como tarjetas en columnas por estado, los mecánicos gestionarán su día 40% más rápido que con la tabla actual | Tiempo promedio entre cambio de estado < 30 min | S (3-5d) |
| **Validación de Transiciones** | Si forzamos la máquina de estados en el modelo, eliminaremos inconsistencias de datos y el sistema reflejará fielmente el proceso del taller | 0% de órdenes con transiciones inválidas | S (1d) |
| **Notificaciones In-App** | Si los mecánicos reciben alertas cuando una orden cambia de estado, reducirán el tiempo de respuesta en un 50% | Tasa de clic en notificaciones > 60% | S (3d) |
| **Galería de Imágenes de Moto** | Si mostramos las fotos del antes/después en una galería, los clientes confiarán más en el diagnóstico | Fotos vistas por orden > 2 en promedio | S (2d) |

### 🟡 NEXT (Julio-Agosto 2026) — Experiencia del Cliente

| Epic | Hipótesis | Éxito | Esfuerzo |
|---|---|---|---|
| **Portal del Cliente** | Si los clientes pueden ver el estado de su moto online, las llamadas al taller se reducirán un 60% | Tasa de apertura del link > 40% | M (1-2sem) |
| **Recordatorios WhatsApp** | Si notificamos por WhatsApp, los clientes aprobarán repuestos 3x más rápido que por llamada | Tiempo de aprobación < 2 horas | M-L (2-3sem) |
| **Skeletons & Estados de Carga** | Si mostramos skeletons en vez de spinners, la percepción de velocidad mejorará notablemente | Lighthouse Performance > 90 | S (1sem) |
| **PWA Móvil** | Si el frontend es instalable, los mecánicos lo usarán 3x más en el taller | Instalaciones PWA > 50% de usuarios | M (2sem) |

### 🔵 LATER (Septiembre 2026+) — Escalabilidad y Monetización

| Epic | Hipótesis | Éxito | Esfuerzo |
|---|---|---|---|
| **Redis (Caché + Colas)** | Si cacheamos stats y encolamos emails, el dashboard cargará en < 500ms y los cierres de orden serán instantáneos | P95 dashboard < 500ms | M (2-3sem) |
| **Búsqueda Global** | Si unificamos la búsqueda, los admins encontrarán cualquier cosa en < 3 segundos | Tiempo medio de búsqueda < 3s | M (1sem) |
| **Dashboard de Rentabilidad** | Si mostramos margen bruto por orden, los talleres tomarán mejores decisiones de precio | Talleres que ajustan precios tras ver márgenes > 30% | M (2sem) |
| **Integración Stripe (Cobro Digital)** | Si permitimos cobrar con tarjeta al entregar, el ticket promedio subirá un 15% | % de órdenes pagadas con tarjeta > 25% | L (3-4sem) |
| **Webhooks / Zapier** | Si permitimos integraciones, los talleres conectarán E-Mechanic con su contabilidad | Talleres con al menos 1 webhook activo > 20% | M (2sem) |
| **Programa de Fidelización** | Si recompensamos clientes recurrentes, la retención a 6 meses subirá un 20% | Tasa de retorno a 6 meses > 40% | M (2sem) |
| **Modo Taller / Oficina** | Si ofrecemos una vista simplificada para tablet, los mecánicos la usarán como herramienta principal | Uso diario del modo taller > 80% de mecánicos | M (1-2sem) |

---

## Parte 5: Recomendaciones Arquitectónicas (ADR)

### ADR-001: Usar `pre('validate')` para la máquina de estados

**Estado:** Propuesto
**Decisión:** Mover `VALID_TRANSITIONS` del modelo estático al hook `orderSchema.pre('validate')`.
**Alternativas:** (a) Validar en el controlador (actual - inconsistente), (b) Validar en una función middleware de ruta.
**Consecuencias:** Cualquier operación que cambie `status` (API, seed, test, migración) respetará las reglas de negocio.

### ADR-002: Extraer `sendAlertEmail` de `sendInvoiceEmail`

**Estado:** Propuesto
**Decisión:** Refactorizar `email.service.js` para tener funciones separadas por tipo de correo (invoice, alert, notification).
**Alternativas:** Mantener el hack actual donde stock listener reusa invoice email con datos dummy.
**Consecuencias:** Código más mantenible. Posibilidad de templates HTML distintos por tipo de correo.

### ADR-003: Introducir Redis gradualmente

**Estado:** Propuesto
**Decisión:** Primero cachear stats (bajo riesgo, alto impacto), luego mover emails/PDFs a BullMQ.
**Alternativas:** (a) No usar Redis, optimizar agregaciones con índices, (b) Ir directo a BullMQ sin cache.
**Consecuencias:** Nueva dependencia operativa (Redis). Render ofrece Redis managed por ~$10/mes. Alternativa: memoria LRU cache sin dependencia externa.

---

## Resumen ejecutivo

**Quick Wins (1-2 días, alto impacto):**
- Validación de transiciones en el modelo (SE1)
- Galería de imágenes de motos (PD3)

**Próxima semana:**
- Kanban visual de órdenes (PD1) ← **la feature que más vende el producto**
- Notificaciones in-app (PD4)

**Este mes:**
- Portal del cliente (PM2) + WhatsApp (PM1)

**Siguiente trimestre:**
- Redis, búsqueda global, rentabilidad, Stripe
