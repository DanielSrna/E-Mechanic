#!/bin/sh
set -e

echo "🔍 Verificando si la base de datos tiene datos..."
ADMIN_COUNT=$(node -e "
import('mongoose').then(async (mongoose) => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, { serverSelectionTimeoutMS: 10000 });
    const db = mongoose.connection.db;
    const count = await db.collection('users').countDocuments({ rol: 'admin' });
    console.log(count);
  } catch (e) {
    console.log('0');
  } finally {
    process.exit(0);
  }
}).catch(() => { console.log('0'); process.exit(0); })
")

if [ "$ADMIN_COUNT" = "0" ]; then
  echo "📦 Base de datos vacía. Ejecutando seed..."
  node seed.js
  echo "✅ Seed completado"
elif [ "$DEMO_RESET_ENABLED" = "true" ]; then
  echo "🔄 DEMO_RESET_ENABLED activo. Ejecutando seed..."
  node seed.js
  echo "✅ Seed completado"
else
  echo "✅ Datos existentes detectados. Saltando seed."
fi

echo "🚀 Iniciando servidor..."
exec node server.js
