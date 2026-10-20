import { Router } from "express";

import { liveblocksAuthHandler } from "../controllers/liveblocks.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", protect, liveblocksAuthHandler);

export const liveblocksAuthRoutes = router;
