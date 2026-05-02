import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from "../../config/env.config.js";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 255,
        trim: true,
    },
    cedula: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: /^[0-9]{6,10}$/,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: /.+\@.+\..+/,
    },
    password: {
        type: String,
        required: true,
    },
    rol: {
        type: String,
        enum: ['admin', 'mecanico'],
        default: 'mecanico'
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true }
);

/*=======================
*      Middlewares
*======================*/

// Middleware para capitalizar el nombre antes de guardarlo
userSchema.pre('save', function (next) {
    if (this.name) {
        this.name = this.name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    next();
});

// Middleware para encriptar la contraseña antes de guardarla
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(env.BCRYPT_SALT_ROUNDS);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

/*=======================
*        Metodos
*======================*/
// Método para comparar contraseñas
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;