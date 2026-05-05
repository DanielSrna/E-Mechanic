import mongoose from "mongoose";
import { env } from "../config/env.config.js";
import bcrypt from "bcryptjs";

const jwtSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: [ 'refresh', 'resetPassword', 'verifyEmail' ],
        required: true,
    },
    deviceInfo: {
        type: String,
        required: false,
    },
    expiresAt: {
        type: Date,
        required: true,
        expires: 0,
    },
}, { timestamps: true });

/*=======================
*      Middlewares
*======================*/

// Middleware para hashear el token antes de guardarlo
jwtSchema.pre("findOneAndUpdate", async function () {
    const update = this.getUpdate();

    // Buscamos el token en la raíz o dentro del $set
    const tokenToHash = update.token || (update.$set && update.$set.token);

    if (tokenToHash) {
        const salt = await bcrypt.genSalt(env.BCRYPT_SALT_ROUNDS);
        const hashedToken = await bcrypt.hash(tokenToHash, salt);

        // Reemplazamos el token original con el hasheado en el lugar correcto
        if (update.token) {
            update.token = hashedToken;
        } else {
            update.$set.token = hashedToken;
        }
    }
});


/*=======================
*        Metodos
*======================*/

// Método para comparar el token con un token sin hashear
jwtSchema.methods.compareToken = async function (candidateToken) {
    return await bcrypt.compare(candidateToken, this.token);
};

// Método para guardar o actualizar un token (upsert) basado en userId, deviceInfo y type
jwtSchema.statics.saveToken = async function (userId, token, type, deviceInfo, expiresIn) {
    const expiresAt = new Date(Date.now() + expiresIn);
    
    return await this.findOneAndUpdate(
        { userId, deviceInfo, type }, // Criterio de búsqueda (nuestro índice único)
        { token, expiresAt },          // Datos a actualizar
        { 
            upsert: true,              // Si no existe, lo crea
            returnDocument: 'after',                 // Devuelve el documento actualizado
            runValidators: true,       // Valida el Schema
            setDefaultsOnInsert: true 
        }
    );
};

// Método para eliminar un token por usuario y deviceInfo
jwtSchema.statics.deleteToken = async function (userId, deviceInfo, type) {
    return await this.deleteOne({ userId, deviceInfo, type });
};

// Método para eliminar tokens por usuario y tipo
jwtSchema.statics.deleteTokens = async function (userId, type) {
    return await this.deleteMany({ userId, type });
};

/*=======================
*    Composición final
*======================*/

jwtSchema.index({ userId: 1, deviceInfo: 1, type: 1 }, { unique: true });
const JWT = mongoose.model('JWT', jwtSchema);
export default JWT;