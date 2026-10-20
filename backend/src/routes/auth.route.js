import { Router } from "express";

import {
    githubAuthHandler,
    githubCallbackHandler,
    loginHandler,
    logoutHandler,
    registerHandler,
    statusHandler,
} from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", registerHandler);
router.post("/login", loginHandler);
router.post("/logout", logoutHandler);
router.get("/status", protect, statusHandler);
router.get("/github", githubAuthHandler);
router.get("/github/callback", githubCallbackHandler);

export const authRoutes = router;
