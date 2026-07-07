import { Router } from "express";

import { getHealth } from "../controllers/healthController";
import { getHome } from "../controllers/homeController";
import { getLogin } from "../controllers/loginController";
import { JobRoleController } from "../controllers/jobRoleController";

const router = Router();
const jobRoleController = new JobRoleController();

router.get("/", getHome);
router.get("/login", getLogin);
router.get("/health", getHealth);
router.get("/job-roles", (req, res) => jobRoleController.getAll(req, res));

export default router;
