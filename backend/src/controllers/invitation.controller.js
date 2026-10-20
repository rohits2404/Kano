import { HTTPSTATUS } from "../config/http-status.config.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import {
    acceptInvitation,
    createInvitations,
    listInvitations,
    previewInvitation,
    revokeInvitation,
} from "../services/invitation.service.js";
import { createInvitationsSchema } from "../validators/workspace.validator.js";

export const createInvitationsHandler = asyncHandler(
    async (request, response) => {
        const input = createInvitationsSchema.parse(request.body);

        const result = await createInvitations({
            workspaceId: request.workspaceId,
            invites: input.invites,
            defaultRole: input.defaultRole,
            actorId: request.user.id,
        });

        response
            .status(HTTPSTATUS.CREATED)
            .json({ success: true, data: result });
    },
);

export const listInvitationsHandler = asyncHandler(
    async (request, response) => {
        const invitations = await listInvitations(request.workspaceId);

        response
            .status(HTTPSTATUS.OK)
            .json({ success: true, data: { invitations } });
    },
);

export const revokeInvitationHandler = asyncHandler(
    async (request, response) => {
        const invitation = await revokeInvitation(
            request.workspaceId,
            request.params.invitationId,
        );

        response
            .status(HTTPSTATUS.OK)
            .json({ success: true, data: { invitation } });
    },
);

export const previewInvitationHandler = asyncHandler(
    async (request, response) => {
        const invitation = await previewInvitation(request.params.token);

        response
            .status(HTTPSTATUS.OK)
            .json({ success: true, data: { invitation } });
    },
);

export const acceptInvitationHandler = asyncHandler(
    async (request, response) => {
        const result = await acceptInvitation(request.params.token, {
            id: request.user.id,
            email: request.user.email,
        });

        response.status(HTTPSTATUS.OK).json({ success: true, data: result });
    },
);
