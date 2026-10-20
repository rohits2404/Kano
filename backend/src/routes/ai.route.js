import { Router } from "express";

import {
    aiChatHandler,
    stopAiChatHandler,
} from "../controllers/ai.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect);

router.post("/boards/:boardId/chat", aiChatHandler);
router.post("/boards/:boardId/chat/stop", stopAiChatHandler);

export const aiRoutes = router;
