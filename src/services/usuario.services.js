import prisma from "../config/database.js";

const perfilService = async (userId) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id: userId },
    // Para que no muestre la contraseña
    omit: {
      contraseña: true,
    },
  });

  if (!usuario) throw new Error("Usuario no encontrado");

  return usuario;
};

const editarPerfilService = async (
  userId,
  { imagenUrl, nombre, descripcion },
) => {
  try {
    await prisma.usuario.update({
      where: { id: userId },
      data: {
        imagenUrl: imagenUrl,
        nombre: nombre,
        descripcion: descripcion,
      },
    });
  } catch (error) {
    throw new Error(error);
  }
};

const editarCuentaService = async (
  userId,
  { nombre, username, email, contraseña },
) => {
  try {
    await prisma.usuario.update({
      where: { id: userId },
      data: {
        nombre: nombre,
        username: username,
        email: email,
        contraseña: contraseña,
      },
    });
  } catch (error) {
    throw new Error(error);
  }
};

const comprasService = async (userId) => {
  const compras = await prisma.compra.findMany({
    where: { usuarioId: userId },
    include: {
      producto: {
        select: {
          id: true,
          nombre: true,
          precio: true,
          tipo: true,
          imagenUrl: true,
        }
      },
    },
  });

  if (!compras) throw new Error("No tienes compras");

  return compras;
};

export default { perfilService, editarPerfilService, editarCuentaService, comprasService };
