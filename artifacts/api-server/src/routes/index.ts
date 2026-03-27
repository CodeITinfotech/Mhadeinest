import { Router, type IRouter } from "express";
import healthRouter from "./health";
import packagesRouter from "./packages";
import activitiesRouter from "./activities";
import galleryRouter from "./gallery";
import blogRouter from "./blog";
import settingsRouter from "./settings";
import authRouter from "./auth";
import inquiryRouter from "./inquiry";

const router: IRouter = Router();

router.use(healthRouter);
router.use(packagesRouter);
router.use(activitiesRouter);
router.use(galleryRouter);
router.use(blogRouter);
router.use(settingsRouter);
router.use(authRouter);
router.use(inquiryRouter);

export default router;
