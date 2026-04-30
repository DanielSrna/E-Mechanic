import { env } from "./src/config/env.config.js";
import logger from "./src/utils/logger.js";
import app from "./app.js";
import { connectDB } from "./src/config/db.config.js";

const PORT = env.PORT;

logger.proceso("Iniciando la conexión a la base de datos...");
connectDB()
    .then(() => {
        logger.exito("Conexión a MongoDB Atlas establecida.");
        logger.proceso("Iniciando la conexión al servidor...");
    })
    .then(() => {
        app.listen(PORT, () => {
            logger.exito("Servidor conectado, y escuchando en el puerto %d", PORT);
        });
    })
    .catch((error) => {
        logger.fracaso("Error al conectar a la base de datos: %s", error.message);
        process.exit(1);
    });