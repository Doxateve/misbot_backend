import { Router } from 'express';

import comprasRouter from './compras.routes.js';
import usuarioRouter from './usuario.routes.js';
import authRouter from './auth.routes.js';
import productosRouter from './productos.routes.js';

import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

router.use('/compras', authMiddleware, comprasRouter);
router.use('/usuario', authMiddleware, usuarioRouter);
router.use('/auth', authRouter);
router.use('/productos', productosRouter);

export default router;