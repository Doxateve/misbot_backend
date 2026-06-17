import productosServices from "../services/productos.services.js";

const listarProductos = async (req, res) => {
    try {
        const productos = await productosServices.listarService();
        res.json(productos);
    } catch(e) {
        res.status(500).json({ message: e.message })
    }
}

const buscarProducto = async (req, res) => {
    const productId = parseInt(req.params.productId)

    try {
        const producto = await productosServices.buscarService(productId)
        res.json(producto)
    } catch(e) {
        res.status(500).json({ message: e.message })
    }
}

export default { listarProductos, buscarProducto };