import { Router } from "express";

import { getHome } from "../controllers/homeController";
import { authorize } from "../middleware/authContext";
import { Role } from "../models/role";

const homeRouter = Router();

homeRouter.get("/", authorize([Role.User, Role.Admin]), getHome);

export default homeRouter;
