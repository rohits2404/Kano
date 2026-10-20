import { Router } from "express";

import {
    createInvitationsHandler,
    listInvitationsHandler,
    revokeInvitationHandler,
} from "../controllers/invitation.controller.js";
import {
    checkSlugHandler,
    createWorkspaceHandler,
    getWorkspaceHandler,
    listMyWorkspacesHandler,
    updateWorkspaceHandler,
} from "../controllers/workspace.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import {
    requireRole,
    requireWorkspace,
} from "../middlewares/workspace.middleware.js";

const router = Router();

router.use(protect);

router.get("/", listMyWorkspacesHandler);
router.post("/", createWorkspaceHandler);
router.get("/slug-available", checkSlugHandler);

router.get("/:workspaceId", requireWorkspace, getWorkspaceHandler);
router.patch(
    "/:workspaceId",
    requireWorkspace,
    requireRole("workspace:update"),
    updateWorkspaceHandler,
);

router.get(
    "/:workspaceId/invitations",
    requireWorkspace,
    requireRole("member:read"),
    listInvitationsHandler,
);
router.post(
    "/:workspaceId/invitations",
    requireWorkspace,
    requireRole("member:invite"),
    createInvitationsHandler,
);
router.delete(
    "/:workspaceId/invitations/:invitationId",
    requireWorkspace,
    requireRole("member:invite"),
    revokeInvitationHandler,
);

export const workspaceRoutes = router;
