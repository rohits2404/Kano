import { Membership } from "../models/membership.model.js";
import {
    ForbiddenException,
    UnauthorizedException,
} from "../utils/app-error.js";
import { can } from "../utils/organization-permission.js";

export const requireWorkspace = async (request, _response, next) => {
    try {
        const workspaceId = request.params.workspaceId;
        const userId = request.user?.id;

        if (!userId)
            return next(new UnauthorizedException("Authentication Required"));

        const membership = await Membership.findOne({ workspaceId, userId });
        if (!membership) {
            return next(
                new ForbiddenException(
                    "You Are Not a Member Of This Workspace",
                ),
            );
        }

        request.workspaceId = workspaceId;
        request.workspaceRole = membership.role;
        next();
    } catch (error) {
        next(error);
    }
};

export const requireRole = (permission) => (request, _response, next) => {
    const role = request.workspaceRole;
    if (!role || !can(role, permission)) {
        return next(
            new ForbiddenException("You Do Not Have Permission To Do This"),
        );
    }
    next();
};
