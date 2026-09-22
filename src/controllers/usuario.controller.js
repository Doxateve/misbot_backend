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

const editarPerfil = async (req, res) => {
  // Saca el userId del decoded de la cookie Token (JWT)
  const userId = req.user.id;

  const imagenUrl = req.body.imagenUrl;
  const nombre = req.body.nombre;
  const descripcion = req.body.descripcion

  try {
    await usuarioServices.editarPerfilService(userId, {
      imagenUrl,
      nombre,
      descripcion,
    });
    return res.status(200).json({ message: "Campos actualizados correctamente" })
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const editarCuenta = async (req, res) => {
  // Saca el userId del decoded de la cookie Token (JWT)
  const userId = req.user.id;

  const nombre = req.body.nombre
  const username = req.body.username
  const email = req.body.email
  const contraseña = req.body.contraseña
  
  try {
    await usuarioServices.editarCuentaService(userId, {
      nombre,
      username,
      email,
      contraseña
    });
    return res.status(200).json({ message: "Campos actualizados correctamente" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const comprasController = async (req, res) => {
  // Saca el userId del decoded de la cookie Token (JWT)
  const userId = req.user.id;

  try {
    const compras = await usuarioServices.comprasService(userId);
    return res.json({ compras: compras });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export default { yoController, perfilController, editarPerfil, editarCuenta, comprasController };
