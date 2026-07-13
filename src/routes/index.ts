import { Router } from "express";

import { getHealth } from "../controllers/healthController";
import { getHome } from "../controllers/homeController";
import { getLogin, postLogin, postLogout } from "../controllers/loginController";

const router = Router();

router.get("/", getHome);
router.get("/login", getLogin);
router.post("/login", postLogin);
router.post("/logout", postLogout);
router.get("/health", getHealth);

export default router;
