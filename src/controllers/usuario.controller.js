import usuarioServices from "../services/usuario.services.js";

const yoController = (req, res) => {
  // el auth middleware hace que req.user sea igual al usuario
  res.json({ usuario: req.user });
};

const perfilController = async (req, res) => {
  // Saca el userId del decoded de la cookie Token (JWT)
  const userId = req.user.id;

  try {
    const perfil = await usuarioServices.perfilService(userId);
    return res.json({ usuario: perfil });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const comprasController = async (req, res) => {
  // Saca el userId del decoded de la cookie Token (JWT)
  const userId = req.user.id;

  try {
    const compras = await usuarioServices.comprasService(userId);
    return res.json(compras);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export default { yoController, perfilController, comprasController };
