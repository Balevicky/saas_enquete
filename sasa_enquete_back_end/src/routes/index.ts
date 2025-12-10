import { Router } from "express";
import authRouter from "./authRoutes";
import tenantRouter from "./tenantRoutes";
import geoRouter from "./regionRoutes";
import inviteRouter from "./inviteRoutes";
const router = Router();

router.use("/auth", authRouter);
router.use("/tenant", tenantRouter);
router.use("/geo", geoRouter);
router.use("/invite", inviteRouter);
export default router;
