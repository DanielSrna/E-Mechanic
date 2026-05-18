import { connectDB } from './src/config/db.config.js';
import User from './src/models/user.model.js';
import Client from './src/models/client.model.js';
import Motorcycle from './src/models/motorcycle.model.js';
import Part from './src/models/part.model.js';
import Order from './src/models/order.model.js';
import Settings from './src/models/settings.model.js';
import mongoose from 'mongoose';

async function seed() {
  console.log('🌱 Conectando a MongoDB...');
  await connectDB();
  console.log('✅ Conectado');

  const existing = await User.countDocuments();
  if (existing > 0) {
    console.log('⚠️  Ya existen usuarios. Saltando seed.');
    await mongoose.disconnect();
    process.exit(0);
  }

  console.log('👤 Creando admin...');
  const admin = await User.create({
    name: 'Administrador',
    email: 'admin@emechanic.com',
    cedula: '1234567890',
    password: 'admin123',
    rol: 'admin',
  });

  console.log('👤 Creando mecánicos de demo...');
  const mec1 = await User.create({
    name: 'Carlos López',
    email: 'carlos@emechanic.com',
    cedula: '0987654321',
    password: 'mecanico123',
    rol: 'mecanico',
  });
  const mec2 = await User.create({
    name: 'María González',
    email: 'maria@emechanic.com',
    cedula: '1122334455',
    password: 'mecanico123',
    rol: 'mecanico',
  });

  console.log('👥 Creando clientes de demo...');
  const c1 = await Client.create({
    name: 'Pedro Ramírez',
    phone: '3001112233',
    email: 'pedro@email.com',
    address: 'Carrera 50 #123-45',
  });
  const c2 = await Client.create({
    name: 'Ana Martínez',
    phone: '3104445566',
    email: 'ana@email.com',
  });

  console.log('🏍️  Registrando motocicletas...');
  const m1 = await Motorcycle.create({
    plate: 'ABC123',
    brand: 'Yamaha',
    model: 'FZ 150',
    year: 2024,
    mileage: 5000,
    client: c1._id,
  });
  const m2 = await Motorcycle.create({
    plate: 'XYZ789',
    brand: 'Honda',
    model: 'CB 160',
    year: 2025,
    mileage: 1200,
    client: c2._id,
  });

  console.log('📦 Creando repuestos de demo...');
  await Part.create({
    sku: 'OIL-10W40',
    name: 'Aceite 10W40',
    brand: 'Motul',
    purchasePrice: 25000,
    salePrice: 45000,
    stock: 20,
    minStock: 5,
  });
  await Part.create({
    sku: 'BRAKE-PAD',
    name: 'Pastillas de Freno',
    brand: 'Brembo',
    purchasePrice: 35000,
    salePrice: 65000,
    stock: 10,
    minStock: 4,
  });
  await Part.create({
    sku: 'OIL-FILTER',
    name: 'Filtro de Aceite',
    brand: 'Hiflofiltro',
    purchasePrice: 15000,
    salePrice: 28000,
    stock: 15,
    minStock: 5,
  });
  await Part.create({
    sku: 'SPARK-PLUG',
    name: 'Bujía NGK',
    brand: 'NGK',
    purchasePrice: 8000,
    salePrice: 15000,
    stock: 8,
    minStock: 5,
  });

  console.log('⚙️  Configuración inicial del taller...');
  await Settings.getSettings();

  console.log('');
  console.log('✅ SEED COMPLETADO');
  console.log('');
  console.log('Credenciales:');
  console.log('  Admin:  admin@emechanic.com / admin123');
  console.log('  Mec1:   carlos@emechanic.com / mecanico123');
  console.log('  Mec2:   maria@emechanic.com / mecanico123');
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
