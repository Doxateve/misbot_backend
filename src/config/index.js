import dotenv from 'dotenv';
dotenv.config();

export default {
    port: process.env.PORT || 3000,
    bot: {
        host: 'misbottest.aternos.me',
        port: '18525',
        username: 'MISBot',
        auth: 'offline',
        version: '1.20.4'
    },
    jwt: {
        secret: process.env.JWT || 'AlejoEsGay',
        expiresIn: '10d'
    }
}