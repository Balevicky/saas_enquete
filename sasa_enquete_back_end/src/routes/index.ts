import { Router } from "express";
import authRouter from "./authRoutes";
import tenantRouter from "./tenantRoutes";
import geoRouter from "./regionRoutes";
import geoRouterDepartement from "./departementRoutes";
import geoRouterSecteur from "./secteurRoutes";
import geoRouterVillage from "./villageRoutes";
import inviteRouter from "./inviteRoutes";

import surveyRoutes from "./surveyRoutes";
import questionRoutes from "./questionRoutes";
import respondentRoutes from "./respondentRoutes";
import responseRoutes from "./responseRoutes";
import surveyResponseRoutes from "./surveyResponseRoutes";
import surveyBuilderRoutes from "./surveyBuilderRoutes";

// import respondentRoutes from "./routes/respondentRoute";
const router = Router();

// router.use("/auth", authRouter);
// router.use("/tenant", tenantRouter);
// router.use("/geo", geoRouter);
// router.use("/invite", inviteRouter);
router.use("/", authRouter);
router.use("/", tenantRouter);
router.use("/", geoRouter);
router.use("/", geoRouterDepartement);
router.use("/", geoRouterSecteur);
router.use("/", geoRouterSecteur);
router.use("/", geoRouterVillage);
router.use("/", inviteRouter);

router.use("/t/:slug", surveyRoutes);
// router.use("/", surveyRoutes);
router.use("/t/:slug", questionRoutes);
router.use("/t/:slug", respondentRoutes);
router.use("/", responseRoutes);
router.use("/", surveyResponseRoutes);
router.use("", surveyBuilderRoutes);
export default router;
