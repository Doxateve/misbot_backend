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

const comprasService = async (userId) => {
  const compras = await prisma.compra.findMany({
    where: { usuarioId: userId },
    include: {
      producto: {
        select: {
          nombre: true,
          precio: true,
          tipo: true,
          imagenUrl: true,
        },
      },
    },
  });

  if (!compras) throw new Error("No tienes compras");

  return compras;
};

export default { perfilService, comprasService };
