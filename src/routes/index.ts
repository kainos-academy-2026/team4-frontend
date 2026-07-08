import { Router } from "express";

import { getLogin, getLogout, postLogin } from "../controllers/authController";
import { getHealth } from "../controllers/healthController";
import { getHome } from "../controllers/homeController";

const router = Router();

router.get("/", getHome);
router.get("/login", getLogin);
router.post("/login", postLogin);
router.get("/logout", getLogout);
router.get("/health", getHealth);

export default router;
