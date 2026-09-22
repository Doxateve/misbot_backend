import { Router } from "express";

import usuarioController from "../controllers/usuario.controller.js";

const router = Router();

router.get("/yo", usuarioController.yoController);
router.get("/perfil", usuarioController.perfilController);
router.patch("/editarPerfil", usuarioController.editarPerfil);
router.patch("/editarCuenta", usuarioController.editarCuenta);
router.get("/compras", usuarioController.comprasController);

export default router;
