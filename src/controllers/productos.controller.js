import productosServices from "../services/productos.services.js";

const listarProductos = async (req, res) => {
    try {
        const productos = await productosServices.listarService();
        return res.json({ productos });
    } catch(e) {
        return res.status(500).json({ message: e.message });
    };
};

const buscarProducto = async (req, res) => {
    const productId = parseInt(req.params.productId);

    if(!productId) {
        return res.status(400).json({ message: "Request invalida" });
    }
    try {
        const producto = await productosServices.buscarService(productId);
        return res.json({ producto });
    } catch(e) {
        return res.status(500).json({ message: e.message });
    };
};

export default { listarProductos, buscarProducto };