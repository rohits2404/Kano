import { HTTPSTATUS } from "../config/http-status.config.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import {
    addTeamMembers,
    createTeam,
    getTeam,
    listTeams,
    removeTeamMember,
} from "../services/team.service.js";
import {
    addTeamMembersSchema,
    createTeamSchema,
} from "../validators/team.validator.js";

export const listTeamsHandler = asyncHandler(async (request, response) => {
    const teams = await listTeams(
        request.workspaceId,
        request.user.id,
        request.workspaceRole,
    );

    response.status(HTTPSTATUS.OK).json({ success: true, data: { teams } });
});

export const createTeamHandler = asyncHandler(async (request, response) => {
    const input = createTeamSchema.parse(request.body);
    const team = await createTeam(
        request.workspaceId,
        input.name,
        request.user.id,
    );

    response.status(HTTPSTATUS.CREATED).json({ success: true, data: { team } });
});

export const getTeamHandler = asyncHandler(async (request, response) => {
    const team = await getTeam(
        request.workspaceId,
        request.params.teamId,
        request.user.id,
        request.workspaceRole,
    );

    response.status(HTTPSTATUS.OK).json({ success: true, data: { team } });
});

export const addTeamMembersHandler = asyncHandler(async (request, response) => {
    const { userIds } = addTeamMembersSchema.parse(request.body);
    const result = await addTeamMembers(
        request.workspaceId,
        request.params.teamId,
        userIds,
        request.user.id,
    );

    response.status(HTTPSTATUS.OK).json({ success: true, data: result });
});

export const removeTeamMemberHandler = asyncHandler(
    async (request, response) => {
        await removeTeamMember(
            request.workspaceId,
            request.params.teamId,
            request.params.userId,
            request.user.id,
        );

        response.status(HTTPSTATUS.OK).json({ success: true, data: null });
    },
);
