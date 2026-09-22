import { Router } from "express";

const router = Router();

import mcItemsController from "../controllers/mcItems.controller.js";

router.get("/", mcItemsController.listarMcItems)
router.post("/agregar", mcItemsController.agregarObjeto)

export default router;