import jwt from 'jsonwebtoken';
import config from '../config/index.js';

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) return res.status(401).json({ message: 'No autorizado' });

    try {
        const decoded = jwt.verify(token, config.jwt.secret);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token no valido' });
    };
};

export default authMiddleware;