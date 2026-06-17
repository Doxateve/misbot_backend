import dotenv from 'dotenv';
dotenv.config();

export default {
    port: process.env.PORT || 3000,
    bot: {
        host: '127.0.0.1',
        //port: '27497',
        username: 'MISBot',
        auth: 'offline',
        version: '1.20.4'
    },
    jwt: {
        secret: process.env.JWT || 'AlejoEsGay',
        expiresIn: '10d'
    }
}