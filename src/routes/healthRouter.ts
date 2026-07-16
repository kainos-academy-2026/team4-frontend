import { Router } from "express";

import { getHealth } from "../controllers/healthController";

const healthRouter = Router();

healthRouter.get("/health", getHealth);

export default healthRouter;
