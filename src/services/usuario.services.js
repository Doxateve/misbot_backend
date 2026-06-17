import prisma from "../config/database.js";

const comprasService = async (userId) => {
    const compras = await prisma.usuario.findUnique({
            where: {
                id: userId
            }, select: {
                nombre: true,
            include: {
                compras: true
            }
            }
    })

    if(!compras) throw new Error("No tienes compras")

    return compras
}

export default { comprasService }