import { z } from "zod";
import "dotenv/config";
import logger from "../utils/logger.js";

logger.proceso("Validando variables de entorno...");

// 1. Definimos cómo deben verse nuestras variables de entorno
const envSchema = z.object({
    PORT: z.string().default("3000"),
    MONGODB_URL: z.string().url("El MONGODB_URL debe ser una conexión válida"),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    FRONTEND_URL: z.string().url("El FRONTEND_URL debe ser una URL válida"),
    // Aquí añadiremos más adelante: JWT_SECRET: z.string().min(10)
});

// 2. Comparamos el esquema con lo que realmente hay en process.env
const envValidation = envSchema.safeParse(process.env);

// 3. Si algo falla, matamos el proceso inmediatamente y mostramos el error
if (!envValidation.success) {
    logger.fracaso("Error crítico: Variables de entorno inválidas o faltantes.");
    // Esto imprime un árbol detallado de exactamente qué variables fallaron
    console.error(envValidation.error.format()); 
    process.exit(1);
}

logger.exito("Variables de entorno validadas correctamente.");

// 4. Exportamos las variables ya validadas y limpias
export const env = envValidation.data;