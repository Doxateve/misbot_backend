import dotenv from 'dotenv';
dotenv.config();

export default {
    port: process.env.PORT || 3000,
    bot: {
        host: process.env.SERVER || '127.0.0.1',
        port: process.env.SERVER_PORT || '25565',
        username: 'MISBot',
        auth: 'offline',
        version: '1.20.4'
    },
    jwt: {
        secret: process.env.JWT || 'AlejoEsGay',
        expiresIn: '10d'
    }
}