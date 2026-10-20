import { HTTPSTATUS } from "../config/http-status.config.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import {
    listWorkspaceMembers,
    removeWorkspaceMember,
    resolveWorkspaceUsers,
    searchWorkspaceMembers,
    updateMemberRole,
} from "../services/member.service.js";
import {
    resolveMembersSchema,
    searchMembersSchema,
    updateMemberRoleSchema,
} from "../validators/member.validator.js";

export const resolveMembersHandler = asyncHandler(async (request, response) => {
    const { ids } = resolveMembersSchema.parse(request.query);
    const users = await resolveWorkspaceUsers(request.workspaceId, ids);

    response.status(HTTPSTATUS.OK).json({ success: true, data: { users } });
});

export const searchMembersHandler = asyncHandler(async (request, response) => {
    const { q } = searchMembersSchema.parse(request.query);
    const userIds = await searchWorkspaceMembers(request.workspaceId, q);

    response.status(HTTPSTATUS.OK).json({ success: true, data: { userIds } });
});

export const listMembersHandler = asyncHandler(async (request, response) => {
    const members = await listWorkspaceMembers(request.workspaceId);

    response.status(HTTPSTATUS.OK).json({ success: true, data: { members } });
});

export const updateMemberRoleHandler = asyncHandler(
    async (request, response) => {
        const { role } = updateMemberRoleSchema.parse(request.body);
        const member = await updateMemberRole(
            request.workspaceId,
            request.params.userId,
            role,
            request.user.id,
        );

        response
            .status(HTTPSTATUS.OK)
            .json({ success: true, data: { member } });
    },
);

export const removeMemberHandler = asyncHandler(async (request, response) => {
    await removeWorkspaceMember(
        request.workspaceId,
        request.params.userId,
        request.user.id,
    );

    response.status(HTTPSTATUS.OK).json({ success: true, data: null });
});
