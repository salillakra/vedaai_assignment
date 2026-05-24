import { Hono } from "hono";
import { AssignmentController } from "../controllers/assignment.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = new Hono();

// Public routes 
router.get("/", AssignmentController.list);
router.get("/:id", AssignmentController.get);

// Protected routes
router.post("/", authMiddleware, AssignmentController.create);
router.post("/upload", authMiddleware, AssignmentController.uploadFile);
router.delete("/:id", authMiddleware, AssignmentController.delete);

router.post("/:id/retry", authMiddleware, AssignmentController.retry);

export const assignmentRouter = router;
