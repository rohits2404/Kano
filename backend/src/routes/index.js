import { Router } from "express";

import { aiRoutes } from "./ai.route.js";
import { authRoutes } from "./auth.route.js";
import { boardReadRoutes } from "./board-read.route.js";
import { boardRoutes } from "./board.route.js";
import { invitationRoutes } from "./invitation.route.js";
import { liveblocksAuthRoutes } from "./liveblocks.route.js";
import { memberRoutes } from "./member.route.js";
import { teamRoutes } from "./team.route.js";
import { workspaceRoutes } from "./workspace.route.js";

export const routes = Router();

routes.use("/ai", aiRoutes);
routes.use("/auth", authRoutes);
routes.use("/invitations", invitationRoutes);
routes.use("/workspaces", workspaceRoutes);
routes.use("/workspaces/:workspaceId/teams", teamRoutes);
routes.use("/workspaces/:workspaceId/boards", boardRoutes);
routes.use("/workspaces/:workspaceId/members", memberRoutes);
routes.use("/boards", boardReadRoutes);
routes.use("/liveblocks-auth", liveblocksAuthRoutes);
