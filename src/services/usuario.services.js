import prisma from "../config/database.js";

const comprasService = async (userId) => {
    const compras = await prisma.compra.findMany({
        where: { usuarioId: userId },
        include: {
            producto: {
                select: {
                    nombre: true,
                    precio: true,
                    tipo: true,
                    imagenUrl: true
                }
            }
        }
    });

    if(!compras) throw new Error("No tienes compras");

    return compras;
}

export default { comprasService };