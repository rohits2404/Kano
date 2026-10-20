import { Router } from "express";

import {
    addTeamMembersHandler,
    createTeamHandler,
    getTeamHandler,
    listTeamsHandler,
    removeTeamMemberHandler,
} from "../controllers/team.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import {
    requireRole,
    requireWorkspace,
} from "../middlewares/workspace.middleware.js";

const router = Router({ mergeParams: true });

router.use(protect);
router.use(requireWorkspace);

router.get("/", listTeamsHandler);
router.post("/", requireRole("team:manage"), createTeamHandler);
router.get("/:teamId", getTeamHandler);
router.post(
    "/:teamId/members",
    requireRole("team:manage"),
    addTeamMembersHandler,
);
router.delete(
    "/:teamId/members/:userId",
    requireRole("team:manage"),
    removeTeamMemberHandler,
);

export const teamRoutes = router;
