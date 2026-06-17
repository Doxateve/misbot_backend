import prisma from "../config/database.js";

const comprarItem = async (username, itemName, cantidad) => {
    try{
        const comprador = await prisma.usuario.findUnique({ where: { username: username }, select: { id: true } })
        const producto = await prisma.producto.findUnique({ where: { nombre: itemName }, select: { id: true, precio: true } })

        const total = producto.id * cantidad

        await prisma.compra.create({
            data: {
                usuarioId: comprador.id,
                productoId: producto.id,
                cantidad,
                total
            }
        })

        console.log("creado")
    } catch (e) {
        throw new Error(e)
    }
}

export default { comprarItem }