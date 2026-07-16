import { Router } from "express";

import { getHome } from "../controllers/homeController";
import { requireRoleHtml } from "../middleware/authContext";

const homeRouter = Router();
const readAccessRoles = ["applicant", "recruitment_admin", "user"] as const;

homeRouter.get("/", requireRoleHtml(readAccessRoles), getHome);

export default homeRouter;
