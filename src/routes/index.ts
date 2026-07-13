import { Router } from "express";

import { requireAuth, requireRole } from "../middleware/authMiddleware";
import { getHealth } from "../controllers/healthController";
import { getHome } from "../controllers/homeController";
import { JobRoleController } from "../controllers/jobRoleController";
import { getLogin, postLogin, postLogout } from "../controllers/loginController";
import { JobRoleService } from "../services/jobRoleService";

const router = Router();
const jobRoleController = new JobRoleController(new JobRoleService());
const readAccessRoles = ["applicant", "recruitment_admin"] as const;

router.get("/login", getLogin);
router.post("/login", postLogin);
router.post("/logout", postLogout);

router.get("/", requireRole(readAccessRoles, "html"), getHome);
router.get("/health", requireAuth("json"), getHealth);
router.get(
	"/job-roles",
	requireRole(readAccessRoles, "html"),
	(req, res) => jobRoleController.getAll(req, res),
);

export default router;
