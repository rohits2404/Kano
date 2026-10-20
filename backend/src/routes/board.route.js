import { Router } from "express";

import {
    createBoardHandler,
    listBoardsHandler,
} from "../controllers/board.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requireWorkspace } from "../middlewares/workspace.middleware.js";

const router = Router({ mergeParams: true });

router.use(protect);
router.use(requireWorkspace);

router.get("/", listBoardsHandler);
router.post("/", createBoardHandler);

export const boardRoutes = router;
