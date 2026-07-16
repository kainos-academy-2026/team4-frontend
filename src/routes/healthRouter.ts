import { Router } from "express";

import { getHealth } from "../controllers/healthController";
import { requireAuthJson } from "../middleware/authContext";

const healthRouter = Router();

healthRouter.get("/health", requireAuthJson, getHealth);

export default healthRouter;
