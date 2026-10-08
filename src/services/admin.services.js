import prisma from "../config/database.js";

const dashboardService = async () => {
    const [compras, totalProductos] = await Promise.all([
        prisma.compra.findMany({
            select: {
                cantidad: true,
                total: true,
                createdAt: true,
                producto: { select: { nombre: true, tipo: true } }
            },
            orderBy: { createdAt: 'asc' }
        }),
        prisma.producto.count()
    ]);

    const ingresos = compras.reduce((acc, compra) => acc + compra.total, 0);
    // todas las filas de un mismo checkout comparten createdAt
    const pedidos = new Set(compras.map((compra) => compra.createdAt.getTime())).size;

    const porMes = {};
    const porTipo = {};
    const porProducto = {};

    for (const compra of compras) {
        const mes = compra.createdAt.toISOString().slice(0, 7); // "2026-07"
        const { nombre, tipo } = compra.producto;

        porMes[mes] = (porMes[mes] ?? 0) + compra.total;
        porTipo[tipo] = (porTipo[tipo] ?? 0) + compra.total;
        porProducto[nombre] = (porProducto[nombre] ?? 0) + compra.cantidad;
    }

    return {
        resumen: { ingresos, pedidos, productos: totalProductos },
        ventasPorMes: Object.entries(porMes).map(([mes, total]) => ({ mes, total })),
        ventasPorTipo: Object.entries(porTipo).map(([tipo, total]) => ({ tipo, total })),
        masVendidos: Object.entries(porProducto)
            .map(([nombre, cantidad]) => ({ nombre, cantidad }))
            .sort((a, b) => b.cantidad - a.cantidad)
            .slice(0, 5)
    };
};

export default { dashboardService };