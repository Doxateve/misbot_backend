const adminMiddleware = (req, res, next) => {
    if (req.user?.rol !== 'admin') {
        return res.status(403).json({ message: 'No tienes permisos de administrador' });
    }
    next();
};

export default adminMiddleware;