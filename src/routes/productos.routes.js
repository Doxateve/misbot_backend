import { Router } from 'express';

import productosController from '../controllers/productos.controller.js';

const router = Router();

router.get('/', productosController.listarProductos);
router.get('/:productId', productosController.buscarProducto);

export default router;