import { Router } from "express";

import { getHealth } from "../controllers/healthController";
import { getHome } from "../controllers/homeController";

const router = Router();

router.get("/", getHome);
router.get("/health", getHealth);

export default router;
