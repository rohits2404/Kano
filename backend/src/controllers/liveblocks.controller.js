import { HTTPSTATUS } from "../config/http-status.config.js";
import { getLiveblocks } from "../config/liveblocks.config.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { Board } from "../models/board.model.js";
import { Membership } from "../models/membership.model.js";
import { TeamMembership } from "../models/team-membership.model.js";
import { User } from "../models/user.model.js";
import { getUserColor } from "../utils/user-color.js";

export const liveblocksAuthHandler = asyncHandler(async (request, response) => {
    const { room } = request.body;
    const userId = request.user.id;

    if (!room) {
        return response
            .status(HTTPSTATUS.BAD_REQUEST)
            .json({ error: "forbidden", reason: "Missing Room Id" });
    }

    const board = await Board.findOne({ roomId: room, archivedAt: null });
    if (!board) {
        return response
            .status(HTTPSTATUS.NOT_FOUND)
            .json({ error: "forbidden", reason: "Board Not Found" });
    }

    const membership = await Membership.findOne({
        workspaceId: board.workspaceId,
        userId,
    });
    const role = membership?.role;

    const hasAccess =
        role === "owner" || role === "admin"
            ? true
            : await TeamMembership.exists({
                  workspaceId: board.workspaceId,
                  teamId: board.teamId,
                  userId,
              });

    if (!hasAccess) {
        return response
            .status(HTTPSTATUS.FORBIDDEN)
            .json({
                error: "forbidden",
                reason: "You Do Not Have Access To This Board",
            });
    }

    const teamMemberships = await TeamMembership.find({
        workspaceId: board.workspaceId,
        userId,
    });

    const user = await User.findById(userId);

    const { status, body } = await getLiveblocks().identifyUser(
        {
            userId,
            organizationId: board.workspaceId.toString(),
            groupIds: teamMemberships.map((tm) => tm.teamId.toString()),
        },
        {
            userInfo: {
                name: user?.name ?? "Unknown",
                avatar: user?.avatarUrl ?? "",
                color: getUserColor(userId),
            },
        },
    );

    response.status(status).type("application/json").send(body);
});
