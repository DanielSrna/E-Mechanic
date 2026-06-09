import { connectDB } from './src/config/db.config.js';
import User from './src/models/user.model.js';
import Client from './src/models/client.model.js';
import Motorcycle from './src/models/motorcycle.model.js';
import Part from './src/models/part.model.js';
import Order from './src/models/order.model.js';
import Settings from './src/models/settings.model.js';
import { env } from './src/config/env.config.js';
import mongoose from 'mongoose';

async function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function seed() {
  console.log('🌱 Conectando a MongoDB...');
  await connectDB();
  console.log('✅ Conectado');

  const force = process.argv.includes('--force');
  const existing = await User.countDocuments();
  if (existing > 0 && !force) {
    console.log('⚠️  Ya existen usuarios. Saltando seed.');
    console.log('   Usa --force para recargar: node seed.js --force');
    await mongoose.disconnect();
    process.exit(0);
  }
  if (force && existing > 0) {
    console.log('🔄 Force mode: eliminando datos existentes...');
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    console.log('✅ Base de datos limpiada');
  }

  console.log('\n👤 Creando admin...');
  const admin = await User.create({
    name: 'Administrador',
    email: 'admin@emechanic.com',
    cedula: '1234567890',
    password: 'admin123',
    rol: 'admin',
  });

  console.log('👤 Creando mecánicos...');
  const mechanicsData = [
    { name: 'Carlos López', email: 'carlos@emechanic.com', cedula: '0987654321', password: 'mecanico123', rol: 'mecanico' },
    { name: 'María González', email: 'maria@emechanic.com', cedula: '1122334455', password: 'mecanico123', rol: 'mecanico' },
    { name: 'José Ramírez', email: 'jose@emechanic.com', cedula: '2233445566', password: 'mecanico123', rol: 'mecanico' },
    { name: 'Diana Torres', email: 'diana@emechanic.com', cedula: '3344556677', password: 'mecanico123', rol: 'mecanico' },
  ];
  const mechanics = await Promise.all(mechanicsData.map((d) => User.create(d)));

  console.log('👥 Creando clientes...');
  const clients = await Client.insertMany([
    { name: 'Pedro Ramírez', phone: '3001112233', email: 'pedro@email.com', address: 'Carrera 50 #123-45, Bogotá' },
    { name: 'Ana Martínez', phone: '3104445566', email: 'ana@email.com', address: 'Calle 80 #20-30, Medellín' },
    { name: 'Luis Herrera', phone: '3157778899', email: 'luis@email.com', address: 'Av. 68 #10-15, Bogotá' },
    { name: 'Sofía Castro', phone: '3201112233', email: 'sofia@email.com', address: 'Carrera 7 #72-41, Bogotá' },
    { name: 'Jorge Medina', phone: '3005556677', email: 'jorge@email.com' },
    { name: 'Carolina Díaz', phone: '3123334455', email: 'caro@email.com', address: 'Calle 13 #45-67, Cali' },
    { name: 'Andrés Vargas', phone: '3189990011', email: 'andres@email.com', address: 'Carrera 15 #93-20, Bogotá' },
    { name: 'Valentina Ríos', phone: '3057778899', email: 'vale@email.com' },
  ]);

  console.log('🏍️  Registrando motocicletas...');
  const motorcycles = await Motorcycle.insertMany([
    { plate: 'ABC123', brand: 'Yamaha', model: 'FZ 150', year: 2024, mileage: 5000, client: clients[0]._id },
    { plate: 'XYZ789', brand: 'Honda', model: 'CB 160', year: 2025, mileage: 1200, client: clients[1]._id },
    { plate: 'DEF456', brand: 'Suzuki', model: 'Gixxer 150', year: 2023, mileage: 15000, client: clients[2]._id },
    { plate: 'GHI012', brand: 'Bajaj', model: 'Pulsar NS200', year: 2024, mileage: 8000, client: clients[3]._id },
    { plate: 'JKL345', brand: 'AKT', model: 'TT 200', year: 2022, mileage: 25000, client: clients[4]._id },
    { plate: 'MNO678', brand: 'Victory', model: 'MRX 150', year: 2025, mileage: 500, client: clients[5]._id },
    { plate: 'PQR901', brand: 'Yamaha', model: 'XTZ 250', year: 2023, mileage: 12000, client: clients[6]._id },
    { plate: 'STU234', brand: 'Honda', model: 'XR 190', year: 2024, mileage: 6500, client: clients[7]._id },
    { plate: 'VWX567', brand: 'Suzuki', model: 'V-Strom 250', year: 2025, mileage: 2000, client: clients[0]._id },
    { plate: 'YZA890', brand: 'Bajaj', model: 'Dominar 250', year: 2023, mileage: 18000, client: clients[2]._id },
  ]);

  console.log('📦 Creando repuestos...');
  const parts = await Part.insertMany([
    { sku: 'OIL-10W40', name: 'Aceite 10W40', brand: 'Motul', purchasePrice: 25000, salePrice: 45000, stock: 25, minStock: 5 },
    { sku: 'OIL-20W50', name: 'Aceite 20W50', brand: 'Castrol', purchasePrice: 22000, salePrice: 40000, stock: 30, minStock: 5 },
    { sku: 'BRAKE-PAD', name: 'Pastillas de Freno', brand: 'Brembo', purchasePrice: 35000, salePrice: 65000, stock: 12, minStock: 4 },
    { sku: 'OIL-FILTER', name: 'Filtro de Aceite', brand: 'Hiflofiltro', purchasePrice: 15000, salePrice: 28000, stock: 20, minStock: 5 },
    { sku: 'AIR-FILTER', name: 'Filtro de Aire', brand: 'K&N', purchasePrice: 18000, salePrice: 35000, stock: 8, minStock: 3 },
    { sku: 'SPARK-PLUG', name: 'Bujía NGK', brand: 'NGK', purchasePrice: 8000, salePrice: 15000, stock: 16, minStock: 5 },
    { sku: 'CHAIN-428', name: 'Cadena 428', brand: 'DID', purchasePrice: 45000, salePrice: 80000, stock: 6, minStock: 3 },
    { sku: 'SPROCKET-KIT', name: 'Kit de Arrastre', brand: 'JT Sprockets', purchasePrice: 55000, salePrice: 95000, stock: 5, minStock: 2 },
    { sku: 'CLUTCH-CABLE', name: 'Guaya de Embrague', brand: 'OEM', purchasePrice: 12000, salePrice: 25000, stock: 10, minStock: 3 },
    { sku: 'THROTTLE-CABLE', name: 'Guaya de Acelerador', brand: 'OEM', purchasePrice: 10000, salePrice: 22000, stock: 8, minStock: 3 },
    { sku: 'BATTERY-12V', name: 'Batería 12V', brand: 'Yuasa', purchasePrice: 50000, salePrice: 85000, stock: 4, minStock: 2 },
    { sku: 'TIRE-FRONT', name: 'Llanta Delantera 90/90-17', brand: 'Michelin', purchasePrice: 85000, salePrice: 150000, stock: 3, minStock: 2 },
    { sku: 'TIRE-REAR', name: 'Llanta Trasera 130/70-17', brand: 'Pirelli', purchasePrice: 95000, salePrice: 170000, stock: 3, minStock: 2 },
    { sku: 'BRAKE-LEVER', name: 'Manigueta de Freno', brand: 'OEM', purchasePrice: 8000, salePrice: 18000, stock: 7, minStock: 3 },
    { sku: 'MIRROR-SET', name: 'Juego de Espejos', brand: 'OEM', purchasePrice: 15000, salePrice: 30000, stock: 5, minStock: 2 },
  ]);

  console.log('⚙️  Configuración inicial del taller...');
  await Settings.getSettings();

  console.log('📋 Creando 40 órdenes de trabajo...');
  const orderData = [];

  function createOrder(args, mechIdx, clientIdx, motoIdx, status, close, extra) {
    const moto = motorcycles[motoIdx];
    const mech = mechanics[mechIdx];
    const client = clients[clientIdx];
    return {
      motorcycle: moto._id,
      client: client._id,
      mechanic: mech._id,
      entryReason: args.reason,
      notes: args.notes || null,
      status,
      serviceType: args.type || 'medio',
      scheduledDate: args.date,
      estimatedDays: args.days || 1,
      priority: args.priority || 'normal',
      createdAt: args.createdAt,
      updatedAt: args.createdAt,
      ...(close ? {
        isClosed: true,
        closedAt: new Date(args.createdAt.getTime() + (args.days || 1) * 86400000),
        subtotalParts: extra?.subtotalParts || 0,
        subtotalLabor: extra?.subtotalLabor || 0,
        tax: Math.round(((extra?.subtotalParts || 0) + (extra?.subtotalLabor || 0)) * env.TAX_RATE),
        total: Math.round(((extra?.subtotalParts || 0) + (extra?.subtotalLabor || 0)) * 1.19),
        partsUsed: extra?.partsUsed || [],
        labor: extra?.labor || [],
      } : {}),
    };
  }

  const now = new Date();

  // ── MARZO: 10 órdenes (históricas, todas cerradas o canceladas) ──
  const marBase = daysAgo(90);
  const marOrders = [
    createOrder({ reason: 'Mantenimiento general 5000km', type: 'complejo', days: 2, priority: 'normal', date: marBase, createdAt: marBase }, 0, 0, 0, 'entregada', true, { subtotalParts: 140000, subtotalLabor: 80000, labor: [{ description: 'Mano de obra mantenimiento', cost: 80000 }], partsUsed: [{ part: parts[0]._id, quantity: 1, unitPrice: 45000 }, { part: parts[3]._id, quantity: 1, unitPrice: 28000 }, { part: parts[2]._id, quantity: 1, unitPrice: 65000 }] }),
    createOrder({ reason: 'Cambio de aceite y filtro', type: 'rapido', days: 0.5, priority: 'normal', date: new Date('2026-03-05'), createdAt: new Date('2026-03-05') }, 1, 1, 1, 'entregada', true, { subtotalParts: 73000, subtotalLabor: 25000, labor: [{ description: 'Cambio de aceite', cost: 25000 }], partsUsed: [{ part: parts[0]._id, quantity: 1, unitPrice: 45000 }, { part: parts[3]._id, quantity: 1, unitPrice: 28000 }] }),
    createOrder({ reason: 'Cambio de llanta trasera', type: 'medio', days: 1, priority: 'alta', date: new Date('2026-03-07'), createdAt: new Date('2026-03-07') }, 0, 2, 2, 'entregada', true, { subtotalParts: 170000, subtotalLabor: 30000, labor: [{ description: 'Cambio llanta', cost: 30000 }], partsUsed: [{ part: parts[12]._id, quantity: 1, unitPrice: 170000 }] }),
    createOrder({ reason: 'No se presentó el cliente', type: 'rapido', priority: 'baja', date: new Date('2026-03-10'), createdAt: new Date('2026-03-10') }, 2, 3, 3, 'cancelada', false),
    createOrder({ reason: 'Falla eléctrica intermitente', type: 'complejo', days: 3, priority: 'urgente', date: new Date('2026-03-12'), createdAt: new Date('2026-03-12') }, 3, 4, 4, 'entregada', true, { subtotalParts: 235000, subtotalLabor: 120000, labor: [{ description: 'Diagnóstico eléctrico', cost: 50000 }, { description: 'Reparación arnés', cost: 70000 }], partsUsed: [{ part: parts[5]._id, quantity: 1, unitPrice: 15000 }, { part: parts[10]._id, quantity: 1, unitPrice: 85000 }, { part: parts[7]._id, quantity: 1, unitPrice: 95000 }] }),
    createOrder({ reason: 'Cambio de kit de arrastre', type: 'medio', days: 1, priority: 'normal', date: new Date('2026-03-15'), createdAt: new Date('2026-03-15') }, 1, 5, 5, 'entregada', true, { subtotalParts: 175000, subtotalLabor: 45000, labor: [{ description: 'Instalación kit arrastre', cost: 45000 }], partsUsed: [{ part: parts[6]._id, quantity: 1, unitPrice: 80000 }, { part: parts[7]._id, quantity: 1, unitPrice: 95000 }] }),
    createOrder({ reason: 'Cliente canceló por presupuesto', type: 'medio', priority: 'normal', date: new Date('2026-03-18'), createdAt: new Date('2026-03-18') }, 0, 6, 6, 'cancelada', false),
    createOrder({ reason: 'Ajuste de válvulas y sincronización', type: 'complejo', days: 2, priority: 'alta', date: new Date('2026-03-20'), createdAt: new Date('2026-03-20') }, 2, 7, 7, 'entregada', true, { subtotalParts: 93000, subtotalLabor: 90000, labor: [{ description: 'Ajuste de válvulas', cost: 90000 }], partsUsed: [{ part: parts[5]._id, quantity: 1, unitPrice: 15000 }, { part: parts[0]._id, quantity: 1, unitPrice: 45000 }, { part: parts[3]._id, quantity: 1, unitPrice: 28000 }] }),
    createOrder({ reason: 'Cambio de guayas y maniguetas', type: 'rapido', days: 0.5, priority: 'normal', date: new Date('2026-03-22'), createdAt: new Date('2026-03-22') }, 1, 1, 1, 'entregada', true, { subtotalParts: 65000, subtotalLabor: 20000, labor: [{ description: 'Instalación guayas y maniguetas', cost: 20000 }], partsUsed: [{ part: parts[8]._id, quantity: 1, unitPrice: 25000 }, { part: parts[9]._id, quantity: 1, unitPrice: 22000 }, { part: parts[13]._id, quantity: 1, unitPrice: 18000 }] }),
    createOrder({ reason: 'Mantenimiento preventivo 10000km', type: 'complejo', days: 2, priority: 'normal', date: new Date('2026-03-25'), createdAt: new Date('2026-03-25') }, 3, 0, 0, 'entregada', true, { subtotalParts: 163000, subtotalLabor: 60000, labor: [{ description: 'Mano de obra general', cost: 60000 }], partsUsed: [{ part: parts[1]._id, quantity: 2, unitPrice: 40000 }, { part: parts[3]._id, quantity: 1, unitPrice: 28000 }, { part: parts[4]._id, quantity: 1, unitPrice: 35000 }, { part: parts[5]._id, quantity: 1, unitPrice: 15000 }] }),
  ];

  // ── ABRIL: 12 órdenes (8 cerradas, 4 en curso) ──
  const aprBase = daysAgo(60);
  const aprOrders = [
    createOrder({ reason: 'Cambio de batería', type: 'rapido', days: 0.5, priority: 'alta', date: aprBase, createdAt: aprBase }, 0, 2, 2, 'entregada', true, { subtotalParts: 85000, subtotalLabor: 15000, labor: [{ description: 'Instalación batería', cost: 15000 }], partsUsed: [{ part: parts[10]._id, quantity: 1, unitPrice: 85000 }] }),
    createOrder({ reason: 'Moto no enciende — diagnóstico', type: 'complejo', days: 2, priority: 'urgente', date: new Date('2026-04-02'), createdAt: new Date('2026-04-02') }, 2, 4, 4, 'entregada', true, { subtotalParts: 110000, subtotalLabor: 100000, labor: [{ description: 'Diagnóstico eléctrico', cost: 50000 }, { description: 'Reparación sistema encendido', cost: 50000 }], partsUsed: [{ part: parts[5]._id, quantity: 2, unitPrice: 15000 }, { part: parts[10]._id, quantity: 1, unitPrice: 85000 }] }),
    createOrder({ reason: 'Cambio de aceite y filtro de aire', type: 'rapido', days: 0.5, priority: 'normal', date: new Date('2026-04-04'), createdAt: new Date('2026-04-04') }, 1, 3, 3, 'entregada', true, { subtotalParts: 80000, subtotalLabor: 20000, labor: [{ description: 'Cambio de aceite y filtro', cost: 20000 }], partsUsed: [{ part: parts[1]._id, quantity: 1, unitPrice: 40000 }, { part: parts[3]._id, quantity: 1, unitPrice: 28000 }, { part: parts[4]._id, quantity: 1, unitPrice: 35000 }] }),
    createOrder({ reason: 'Cambio de llantas delantera y trasera', type: 'complejo', days: 2, priority: 'alta', date: new Date('2026-04-06'), createdAt: new Date('2026-04-06') }, 3, 5, 5, 'entregada', true, { subtotalParts: 320000, subtotalLabor: 50000, labor: [{ description: 'Instalación ambas llantas', cost: 50000 }], partsUsed: [{ part: parts[11]._id, quantity: 1, unitPrice: 150000 }, { part: parts[12]._id, quantity: 1, unitPrice: 170000 }] }),
    createOrder({ reason: 'Ajuste general cadena y frenos', type: 'medio', days: 1, priority: 'normal', date: new Date('2026-04-08'), createdAt: new Date('2026-04-08') }, 0, 6, 6, 'entregada', true, { subtotalParts: 65000, subtotalLabor: 35000, labor: [{ description: 'Ajuste de cadena', cost: 15000 }, { description: 'Ajuste de frenos', cost: 20000 }], partsUsed: [{ part: parts[2]._id, quantity: 1, unitPrice: 65000 }] }),
    createOrder({ reason: 'Cambio de espejos y manigueta', type: 'rapido', days: 0.5, priority: 'normal', date: new Date('2026-04-10'), createdAt: new Date('2026-04-10') }, 2, 7, 7, 'entregada', true, { subtotalParts: 48000, subtotalLabor: 12000, labor: [{ description: 'Instalación accesorios', cost: 12000 }], partsUsed: [{ part: parts[13]._id, quantity: 1, unitPrice: 18000 }, { part: parts[14]._id, quantity: 1, unitPrice: 30000 }] }),
    createOrder({ reason: 'Reparación de motor — golpe de biela', type: 'especial', days: 3, priority: 'urgente', date: new Date('2026-04-12'), createdAt: new Date('2026-04-12') }, 1, 0, 0, 'entregada', true, { subtotalParts: 390000, subtotalLabor: 250000, labor: [{ description: 'Desmonte y diagnóstico motor', cost: 80000 }, { description: 'Reparación biela y cigüeñal', cost: 170000 }], partsUsed: [{ part: parts[1]._id, quantity: 2, unitPrice: 40000 }, { part: parts[3]._id, quantity: 1, unitPrice: 28000 }, { part: parts[5]._id, quantity: 1, unitPrice: 15000 }, { part: parts[7]._id, quantity: 1, unitPrice: 95000 }, { part: parts[6]._id, quantity: 1, unitPrice: 80000 }, { part: parts[8]._id, quantity: 1, unitPrice: 25000 }] }),
    createOrder({ reason: 'Mantenimiento básico', type: 'rapido', days: 0.5, priority: 'normal', date: new Date('2026-04-14'), createdAt: new Date('2026-04-14') }, 3, 2, 2, 'entregada', true, { subtotalParts: 73000, subtotalLabor: 20000, labor: [{ description: 'Mantenimiento básico', cost: 20000 }], partsUsed: [{ part: parts[0]._id, quantity: 1, unitPrice: 45000 }, { part: parts[3]._id, quantity: 1, unitPrice: 28000 }] }),
    createOrder({ reason: 'Revisión de suspensión delantera', type: 'medio', days: 1, priority: 'normal', date: new Date('2026-04-16'), createdAt: new Date('2026-04-16') }, 0, 4, 4, 'en_reparacion', false),
    createOrder({ reason: 'Cambio de kit de arrastre completo', type: 'medio', days: 1, priority: 'alta', date: new Date('2026-04-18'), createdAt: new Date('2026-04-18') }, 1, 6, 6, 'esperando_repuestos', false),
    createOrder({ reason: 'Fuga de aceite en culata', type: 'complejo', days: 2, priority: 'alta', date: new Date('2026-04-20'), createdAt: new Date('2026-04-20') }, 2, 1, 1, 'en_revision', false),
    createOrder({ reason: 'Alineación y balanceo', type: 'rapido', days: 0.5, priority: 'normal', date: new Date('2026-04-22'), createdAt: new Date('2026-04-22') }, 3, 5, 5, 'ingresada', false),
  ];

  // ── MAYO (actual): 18 órdenes (varios estados) ──
  const mayBase = daysAgo(30);
  const mayOrders = [
    createOrder({ reason: 'Cambio de pastillas traseras', type: 'rapido', days: 0.5, priority: 'normal', date: mayBase, createdAt: mayBase }, 0, 0, 0, 'entregada', true, { subtotalParts: 65000, subtotalLabor: 20000, labor: [{ description: 'Cambio de pastillas', cost: 20000 }], partsUsed: [{ part: parts[2]._id, quantity: 1, unitPrice: 65000 }] }),
    createOrder({ reason: 'Mantenimiento general 15000km', type: 'complejo', days: 2, priority: 'normal', date: new Date('2026-05-03'), createdAt: new Date('2026-05-03') }, 1, 3, 3, 'entregada', true, { subtotalParts: 188000, subtotalLabor: 95000, labor: [{ description: 'Revisión general', cost: 50000 }, { description: 'Ajuste de válvulas', cost: 45000 }], partsUsed: [{ part: parts[1]._id, quantity: 2, unitPrice: 40000 }, { part: parts[3]._id, quantity: 1, unitPrice: 28000 }, { part: parts[4]._id, quantity: 1, unitPrice: 35000 }, { part: parts[5]._id, quantity: 1, unitPrice: 15000 }] }),
    createOrder({ reason: 'Instalación de accesorios LED', type: 'rapido', days: 0.5, priority: 'baja', date: new Date('2026-05-05'), createdAt: new Date('2026-05-05') }, 2, 6, 6, 'entregada', true, { subtotalParts: 30000, subtotalLabor: 15000, labor: [{ description: 'Instalación accesorios', cost: 15000 }], partsUsed: [{ part: parts[14]._id, quantity: 1, unitPrice: 30000 }] }),
    createOrder({ reason: 'Cambio de aceite y diagnóstico general', type: 'medio', days: 1, priority: 'normal', date: new Date('2026-05-07'), createdAt: new Date('2026-05-07') }, 3, 7, 7, 'entregada', true, { subtotalParts: 73000, subtotalLabor: 35000, labor: [{ description: 'Cambio de aceite y diagnóstico', cost: 35000 }], partsUsed: [{ part: parts[0]._id, quantity: 1, unitPrice: 45000 }, { part: parts[3]._id, quantity: 1, unitPrice: 28000 }] }),
    createOrder({ reason: 'No enciende — revisar batería', type: 'medio', days: 1, priority: 'alta', date: new Date('2026-05-08'), createdAt: new Date('2026-05-08') }, 0, 2, 2, 'lista_entrega', false),
    createOrder({ reason: 'Problema de aceleración intermitente', type: 'complejo', days: 2, priority: 'alta', date: new Date('2026-05-09'), createdAt: new Date('2026-05-09') }, 1, 4, 4, 'en_reparacion', false),
    createOrder({ reason: 'Cambio de guayas completo', type: 'rapido', days: 0.5, priority: 'normal', date: new Date('2026-05-10'), createdAt: new Date('2026-05-10') }, 2, 0, 1, 'entregada', true, { subtotalParts: 47000, subtotalLabor: 18000, labor: [{ description: 'Cambio de guayas', cost: 18000 }], partsUsed: [{ part: parts[8]._id, quantity: 1, unitPrice: 25000 }, { part: parts[9]._id, quantity: 1, unitPrice: 22000 }] }),
    createOrder({ reason: 'Ajuste de cadena y lubricación', type: 'rapido', days: 0.5, priority: 'normal', date: new Date('2026-05-11'), createdAt: new Date('2026-05-11') }, 3, 5, 5, 'entregada', true, { subtotalParts: 0, subtotalLabor: 12000, labor: [{ description: 'Ajuste y lubricación de cadena', cost: 12000 }] }),
    createOrder({ reason: 'Reparación de caja de cambios', type: 'especial', days: 3, priority: 'urgente', date: new Date('2026-05-12'), createdAt: new Date('2026-05-12') }, 0, 1, 1, 'en_reparacion', false),
    createOrder({ reason: 'Cambio de filtro de aire y bujía', type: 'rapido', days: 0.5, priority: 'normal', date: new Date('2026-05-13'), createdAt: new Date('2026-05-13') }, 1, 6, 6, 'esperando_repuestos', false),
    createOrder({ reason: 'Pintura de tanque y carenaje', type: 'especial', days: 4, priority: 'normal', date: new Date('2026-05-14'), createdAt: new Date('2026-05-14') }, 2, 3, 3, 'esperando_aprobacion', false),
    createOrder({ reason: 'Cambio de aceite programado', type: 'rapido', days: 0.5, priority: 'normal', date: new Date('2026-05-15'), createdAt: new Date('2026-05-15') }, 3, 7, 7, 'en_revision', false),
    createOrder({ reason: 'Fuga de líquido de frenos', type: 'medio', days: 1, priority: 'alta', date: new Date('2026-05-16'), createdAt: new Date('2026-05-16') }, 0, 0, 2, 'en_revision', false),
    createOrder({ reason: 'Cambio de amortiguador trasero', type: 'medio', days: 1, priority: 'normal', date: new Date('2026-05-17'), createdAt: new Date('2026-05-17') }, 1, 2, 0, 'ingresada', false),
    createOrder({ reason: 'Ajuste de carburador', type: 'rapido', days: 0.5, priority: 'normal', date: new Date('2026-05-18'), createdAt: new Date('2026-05-18') }, 2, 4, 4, 'ingresada', false),
    createOrder({ reason: 'Sonido extraño al frenar', type: 'medio', days: 1, priority: 'alta', date: new Date('2026-05-19'), createdAt: new Date('2026-05-19') }, 3, 5, 5, 'ingresada', false),
    createOrder({ reason: 'Mantenimiento programado 20000km', type: 'complejo', days: 2, priority: 'normal', date: new Date('2026-05-20'), createdAt: new Date('2026-05-20') }, 0, 6, 6, 'ingresada', false),
    createOrder({ reason: 'Cambio de pastillas delanteras', type: 'rapido', days: 0.5, priority: 'normal', date: new Date('2026-05-21'), createdAt: new Date('2026-05-21') }, 1, 1, 3, 'ingresada', false),
  ];

  const allOrders = [...marOrders, ...aprOrders, ...mayOrders];
  await Order.insertMany(allOrders);

  console.log('');
  console.log('✅ SEED COMPLETADO');
  console.log('');
  console.log('📊 Resumen:');
  console.log(`   👤 Admin: 1`);
  console.log(`   👨‍🔧 Mecánicos: ${mechanics.length}`);
  console.log(`   👥 Clientes: ${clients.length}`);
  console.log(`   🏍️  Motocicletas: ${motorcycles.length}`);
  console.log(`   📦 Repuestos: ${parts.length}`);
  console.log(`   📋 Órdenes: ${allOrders.length} (${marOrders.length} marzo, ${aprOrders.length} abril, ${mayOrders.length} mayo)`);
  console.log('');
  console.log('Credenciales:');
  console.log('  Admin:  admin@emechanic.com / admin123');
  console.log('  Mec1:   carlos@emechanic.com / mecanico123');
  console.log('  Mec2:   maria@emechanic.com / mecanico123');
  console.log('  Mec3:   jose@emechanic.com / mecanico123');
  console.log('  Mec4:   diana@emechanic.com / mecanico123');
  console.log('');
  console.log('Ejecuta: npm run dev');
  console.log('Frontend: http://localhost:5173');
  console.log('Swagger:  http://localhost:3000/api-docs');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((e) => {
  console.error('Error en seed:', e.message);
  process.exit(1);
});
