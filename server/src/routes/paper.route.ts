import { Hono } from "hono";
import { PaperController } from "../controllers/paper.controller";

const router = new Hono();

router.get("/assignment/:assignmentId", PaperController.getByAssignment);
router.get("/assignment/:assignmentId/pdf", PaperController.generateDynamicPDF);

export const paperRouter = router;
