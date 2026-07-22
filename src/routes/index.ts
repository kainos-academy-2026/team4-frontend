import { Router } from "express";

import healthRouter from "./healthRouter.js";
import homeRouter from "./homeRouter.js";
import jobRoleRouter from "./jobRoleRouter.js";
import loginApiRouter from "./loginApiRouter.js";
import loginRouter from "./loginRouter.js";
import notFoundRouter from "./notFoundRouter.js";
import registerRouter from "./registerRouter.js";

const router = Router();

router.use(homeRouter);
router.use(loginRouter);
router.use(registerRouter);
router.use(loginApiRouter);
router.use(healthRouter);
router.use(jobRoleRouter);
router.use(notFoundRouter);

export default router;
