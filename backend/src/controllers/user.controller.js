import User from "../models/user.model.js";
import logger from "../utils/logger.js";
import { generateAuthTokens } from "../services/jwt.service.js";

export const register = async (req, res, next) => {

    logger.contexto("Iniciando controlador Register en backend/src/controllers/user.controller.js");

    try {

        const { name, email, cedula, password } = req.body;

        logger.proceso("Creando el nuevo usuario en la base de datos...");
        const newUser = await User.newUser({ 
            name, 
            email, 
            cedula, 
            password 
        });
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

export const login = async (req, res, next) => {

    logger.contexto(`Iniciando controlador Login en backend/src/controllers/user.controller.js`);

    try {

        const { email, password } = req.body;

        logger.proceso("Buscando el usuario en la base de datos...");
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        logger.proceso("Comparando la contraseña proporcionada con la almacenada...");
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        logger.proceso("Iniciando servicio de generación de tokens...");
        const { accessToken, refreshToken } = await generateAuthTokens(user, req.headers['user-agent']);

        logger.contexto("Volviendo al controlador Login en backend/src/controllers/user.controller.js");

        logger.proceso("Configurando la cookie segura para el refresh token...");
        const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 días en milisegundos

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: COOKIE_MAX_AGE
        });

        logger.exito("Inicio de sesión exitoso");
        
        res.status(200).json({ 
            message: "Login successful", 
            accessToken 
        });

    } catch (error) {
        logger.fracaso("Ocurrió un error al iniciar sesión: ", error);
        next(error);
    }   
};