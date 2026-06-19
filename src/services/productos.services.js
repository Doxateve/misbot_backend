import prisma from '../config/database.js';

const listarService = async () => {
    return await prisma.producto.findMany();
}

const buscarService = async (productId) => {
    const producto = await prisma.producto.findUnique({ where: { id: productId } });

    if(!producto) throw new Error("No existe ese producto");

    return producto;
}

export default { listarService, buscarService };