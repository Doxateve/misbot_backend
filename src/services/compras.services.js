// CAMBIAR DESPUES:
// en vez de pasar itemName, mejor itemId para que sea mas facil

import prisma from "../config/database.js";

import botServices from "./bot.services.js";

const comprarItem = async (username, items) => {
    try{
        const comprador = await prisma.usuario.findUnique({ where: { username: username }, select: { id: true } })

        if(!comprador) throw new Error("No existe ese usuario en la base de datos")

        // Busca en la DB los productos que tengan el nombre de cada item del array del body
        const productos = await prisma.producto.findMany({
            where: { nombre: { in: items.map(i => i.itemName) } }
        });

        // Los manda al juego
        await botServices.entregarObjeto(username, items)

        const compras = items.map(item => {
            // Busca en productos cuales si existen en la DB (si no hay resultado, itemName = undefined)
            const producto = productos.find(p => p.nombre === item.itemName)
            
            // Si hay un item undefined, es porq no existe en la db
            if(!producto) throw new Error(`No existe el producto ${item.itemName}`)

            // Si pide mas cantidad del stock disponible
            if(item.cantidad > producto.stock) throw new Error(`No hay tanto stock del producto ${item.itemName}`)
            
            // Si no, retorna los datos para insertar en COMPRA

            return {
                usuarioId: comprador.id,
                productoId: producto.id,
                cantidad: item.cantidad,
                total: item.cantidad * producto.precio
            }
        })

        // Crea los datos que devuelve compras
        await prisma.compra.createMany({ data: compras })
        console.log(`[+] Compra añadida a "${username}"`)

        return ("Comprado")
    } catch (e) {
        throw new Error(e)
    }
}

export default { comprarItem }