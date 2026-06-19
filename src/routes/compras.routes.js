import { Router } from 'express';

import comprasController from '../controllers/compras.controller.js';

const router = Router();

router.post('/item', comprasController.comprarObjeto);

export default router;