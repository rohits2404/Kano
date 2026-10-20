import mongoose from "mongoose";
import { AuditEvent } from "../models/audit-event.model.js";
import { Membership } from "../models/membership.model.js";
import { TeamMembership } from "../models/team-membership.model.js";
import { User } from "../models/user.model.js";
import { ForbiddenException, NotFoundException } from "../utils/app-error.js";
import { getUserColor } from "../utils/user-color.js";

const MAX_RESOLVE = 100;
const MAX_SUGGESTIONS = 10;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const workspaceMemberIds = async (workspaceId, userIds) => {
    const filter = { workspaceId };
    if (userIds) filter.userId = mongoose.trusted({ $in: userIds });
    const memberships = await Membership.find(filter).select("userId").lean();
    return memberships.map((membership) => membership.userId);
};

export const resolveWorkspaceUsers = async (workspaceId, userIds) => {
    const validIds = [...new Set(userIds)]
        .filter((id) => mongoose.isValidObjectId(id))
        .slice(0, MAX_RESOLVE);
    if (validIds.length === 0) return [];

    const memberIds = await workspaceMemberIds(workspaceId, validIds);
    const users = await User.find({ _id: mongoose.trusted({ $in: memberIds }) })
        .select("name avatarUrl")
        .lean();

    return users.map((user) => {
        const id = user._id.toString();
        return {
            id,
            name: user.name,
            avatar: user.avatarUrl ?? "",
            color: getUserColor(id),
        };
    });
};

export const searchWorkspaceMembers = async (workspaceId, text) => {
    const memberIds = await workspaceMemberIds(workspaceId);
    const filter = { _id: mongoose.trusted({ $in: memberIds }) };

    const query = text.trim();
    if (query) {
        const pattern = new RegExp(escapeRegex(query), "i");
        filter.$or = mongoose.trusted([{ name: pattern }, { email: pattern }]);
    }

    const users = await User.find(filter)
        .select("_id")
        .sort({ name: 1 })
        .limit(MAX_SUGGESTIONS)
        .lean();
    return users.map((user) => user._id.toString());
};

export const listWorkspaceMembers = async (workspaceId) => {
    const memberships = await Membership.find({ workspaceId })
        .populate("userId", "name email")
        .sort({ joinedAt: 1 })
        .lean();

    const userIds = memberships.map((membership) => membership.userId._id);

    const teamMemberships = await TeamMembership.find({
        workspaceId,
        userId: mongoose.trusted({ $in: userIds }),
    })
        .populate("teamId", "name")
        .lean();

    const teamsByUser = new Map();
    for (const tm of teamMemberships) {
        const userId = tm.userId.toString();
        const team = tm.teamId;
        const list = teamsByUser.get(userId) ?? [];
        list.push(team.name);
        teamsByUser.set(userId, list);
    }

    return memberships.map((membership) => {
        const user = membership.userId;
        const id = user._id.toString();
        return {
            id,
            name: user.name,
            email: user.email,
            role: membership.role,
            joinedAt: membership.joinedAt.toISOString(),
            teams: teamsByUser.get(id) ?? [],
        };
    });
};

export const updateMemberRole = async (
    workspaceId,
    targetUserId,
    role,
    actorId,
) => {
    const membership = await Membership.findOne({
        workspaceId,
        userId: targetUserId,
    });
    if (!membership)
        throw new NotFoundException("Member Not Found In This Workspace");
    if (membership.role === "owner") {
        throw new ForbiddenException(
            "The Workspace Owner's Role Cannot Be Changed",
        );
    }

    const from = membership.role;
    membership.role = role;
    await membership.save();

    await AuditEvent.create({
        workspaceId,
        actorId,
        action: "member.role_updated",
        targetType: "membership",
        targetId: targetUserId,
        metadata: { from, to: role },
    });

    return { id: targetUserId, role };
};

export const removeWorkspaceMember = async (
    workspaceId,
    targetUserId,
    actorId,
) => {
    const membership = await Membership.findOne({
        workspaceId,
        userId: targetUserId,
    });
    if (!membership)
        throw new NotFoundException("Member Not Found In This Workspace");
    if (membership.role === "owner") {
        throw new ForbiddenException("The Workspace Owner Cannot Be Removed");
    }

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        await Membership.deleteOne({
            workspaceId,
            userId: targetUserId,
        }).session(session);
        await TeamMembership.deleteMany({
            workspaceId,
            userId: targetUserId,
        }).session(session);
        await AuditEvent.create(
            [
                {
                    workspaceId,
                    actorId,
                    action: "member.removed",
                    targetType: "membership",
                    targetId: targetUserId,
                },
            ],
            { session },
        );

        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        await session.endSession();
    }
};
