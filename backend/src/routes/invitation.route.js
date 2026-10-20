import { Router } from "express";

import {
    acceptInvitationHandler,
    previewInvitationHandler,
} from "../controllers/invitation.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/:token", previewInvitationHandler);

router.post("/:token/accept", protect, acceptInvitationHandler);

export const invitationRoutes = router;
