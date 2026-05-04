import User from "./user.model.js";
import logger from "../../utils/logger.js";

export const createUser = async (req, res, next) => {
    logger.proceso(`==========================================
                     Empezando proceso de creación de usuario
                    ==========================================`);
    try {
        logger.proceso("Validando los datos de entrada para crear el usuario...");
        const { name, email, cedula, password } = req.body;
        if (!name || !email || !cedula || !password) {
            logger.fracaso("Faltan campos requeridos para crear el usuario");
            return res.status(400).json({ message: "All fields are required" });
        }

        logger.proceso("Validando que el usuario no exista ya...");
        const existingUser = await User.findOne({ 
            $or: [{ email }, { cedula }] 
        });
        if (existingUser) {
            logger.fracaso("El usuario con esta cédula ya existe");
            return res.status(400).json({ message: "User already exists" });
        }

        logger.proceso("Creando el nuevo usuario en la base de datos...");
        const newUser = new User({ name, email, cedula, password });
        await newUser.save();
        logger.exito("Usuario creado exitosamente");

        res.status(201).json({ 
            message: "User created successfully", 
            user: {
                email: newUser.email,
                name: newUser.name,
            } 
        });
    } catch (error) {
        logger.fracaso("Ocurrió un error al crear el usuario: ", error);
        next(error);
    }
};