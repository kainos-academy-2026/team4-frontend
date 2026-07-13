import { Router } from "express";

import { getHome } from "../controllers/homeController";

const homeRouter = Router();

homeRouter.get("/", getHome);

export default homeRouter;
