import { Router } from "express";

import adminController from "../controllers/admin.controller.js";

const router = Router();

router.get("/dashboard", adminController.dashboardController);

export default router;