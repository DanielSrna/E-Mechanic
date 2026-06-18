import { connectDB } from './src/config/db.config.js';
import User from './src/models/user.model.js';
import Settings from './src/models/settings.model.js';
import mongoose from 'mongoose';

async function setupProd() {
  console.log('🔧 Conectando a MongoDB...');
  await connectDB();
  console.log('✅ Conectado');

  const existingAdmin = await User.findOne({ rol: 'admin' });
  if (existingAdmin) {
    console.log('⚠️  Ya existe un admin. Saltando setup.');
    await mongoose.disconnect();
    process.exit(0);
  }

  console.log('👤 Creando administrador inicial...');
  await User.create({
    name: 'Administrador',
    email: 'admin@emechanic.com',
    cedula: '1234567890',
    password: 'admin123',
    rol: 'admin',
  });

  console.log('⚙️  Configuración inicial del taller...');
  await Settings.getSettings();

  console.log('');
  console.log('✅ SETUP DE PRODUCCIÓN COMPLETADO');
  console.log('');
  console.log('Credenciales:');
  console.log('  Admin: admin@emechanic.com / admin123');
  console.log('');
  console.log('⚠️  Cambia estas credenciales desde Configuración al iniciar sesión.');
  console.log('');

  await mongoose.disconnect();
  process.exit(0);
}

setupProd().catch((e) => {
  console.error('Error en setup:', e.message);
  process.exit(1);
});
