import prisma from '../config/database.js';
import jwt from 'jsonwebtoken'

import config from '../config/index.js';

const registerService = async (nombre, username, email, contraseña) => {
    if(!nombre || !username || !email || !contraseña){
        throw new Error('Hacen falta datos')
    }

    try {
        // Lo crea en la db
        await prisma.usuario.create({ data: {
            nombre,
            username,
            email,
            contraseña
        } });

        console.log(`[+] Usuario creado: ${username} (${email})`);
    } catch(e) {
        if(e.code === 'P2002') {
            const mensaje = e.meta.driverAdapterError.cause.originalMessage;

            if (mensaje.includes('username')) throw new Error('Ya hay una cuenta con ese usuario de Minecraft.');
            if (mensaje.includes('email')) throw new Error('El email ya está en uso');

            throw new Error('Dato duplicado');
        }
    }
}

const loginService = async ({ email, contraseña }, res) => {
    if(!email || !contraseña){
        throw new Error('Hacen falta datos')
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario) throw new Error('El usuario no existe');

    if(usuario.contraseña !== contraseña) throw new Error('Contraseña incorrecta');

    const token = jwt.sign(
        { id: usuario.id, username: usuario.username, rol: usuario.rol },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
    );

    return { usuario, token }
}

export default { registerService, loginService };