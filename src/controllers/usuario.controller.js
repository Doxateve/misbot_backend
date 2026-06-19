import usuarioServices from "../services/usuario.services.js";

const yoController = (req, res) => {
    // el auth middleware hace que req.user sea igual al usuario
    res.json({ usuario: req.user });
};

const comprasController = async (req, res) => {
    const userId = req.user.id;

    try {
        const compras = await usuarioServices.comprasService(userId);
        return res.json(compras);
    } catch (e) {
        return res.status(500).json({ message: e.message });
    };
};

export default { yoController, comprasController };