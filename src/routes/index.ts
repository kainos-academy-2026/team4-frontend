import { Router } from "express";

import healthRouter from "./healthRouter.js";
import homeRouter from "./homeRouter.js";
import jobRoleRouter from "./jobRoleRouter.js";
import loginRouter from "./loginRouter.js";
import notFoundRouter from "./notFoundRouter.js";

const router = Router();

router.use(homeRouter);
router.use(loginRouter);
router.use(healthRouter);
router.use(notFoundRouter);
router.use(jobRoleRouter);

export default router;
