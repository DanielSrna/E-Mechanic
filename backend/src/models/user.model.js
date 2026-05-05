import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from "../config/env.config.js";

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
        trim: true,
        match: /^[0-9]{6,10}$/,
    },
    email: {
        type: String,
        required: true,
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
userSchema.pre('save', function () {
    if (this.name) {
        this.name = this.name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
});

// Middleware para encriptar la contraseña antes de guardarla
userSchema.pre('save', async function () {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(env.BCRYPT_SALT_ROUNDS);
        this.password = await bcrypt.hash(this.password, salt);
    }
});

/*=======================
*        Metodos
*======================*/

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Método para crear un nuevo usuario
userSchema.statics.newUser = async function (userData) {
    const user = new this(userData);
    return await user.save();
};

/*=======================
*    Composición final
*======================*/

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ cedula: 1 }, { unique: true });
const User = mongoose.model('User', userSchema);
export default User;