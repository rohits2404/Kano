import mongoose from "mongoose";
import { AuditEvent } from "../models/audit-event.model.js";
import { Membership } from "../models/membership.model.js";
import { Team } from "../models/team.model.js";
import { TeamMembership } from "../models/team-membership.model.js";
import { Workspace } from "../models/workspace.model.js";
import { ConflictException, NotFoundException } from "../utils/app-error.js";

const slugify = (value) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

export const checkSlugAvailability = async (slug) => {
    const existing = await Workspace.exists({ slug });
    return { slug, available: !existing };
};

export const listMyWorkspaces = async (userId) => {
    const memberships = await Membership.find({ userId })
        .sort({ joinedAt: -1 })
        .populate(
            "workspaceId",
            "name slug iconType iconValue iconColor ownerId",
        );

    return memberships.map((membership) => {
        const workspace = membership.workspaceId;

        return {
            id: workspace._id.toString(),
            name: workspace.name,
            slug: workspace.slug,
            iconType: workspace.iconType,
            iconValue: workspace.iconValue,
            iconColor: workspace.iconColor,
            ownerId: workspace.ownerId.toString(),
            createdAt: workspace.createdAt,
            role: membership.role,
        };
    });
};

export const createWorkspace = async (input, ownerId) => {
    const slug = input.slug || slugify(input.name);

    if (await Workspace.exists({ slug })) {
        throw new ConflictException("This Workspace URL Is Already Taken");
    }

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const [workspace] = await Workspace.create(
            [
                {
                    name: input.name,
                    slug,
                    iconType: input.iconType ?? "initials",
                    iconValue: input.iconValue ?? "",
                    iconColor: input.iconColor ?? "yellow",
                    ownerId,
                },
            ],
            { session },
        );

        await Membership.create(
            [{ userId: ownerId, workspaceId: workspace._id, role: "owner" }],
            { session },
        );

        const [generalTeam] = await Team.create(
            [{ workspaceId: workspace._id, name: "General", slug: "general" }],
            { session },
        );

        await TeamMembership.create(
            [
                {
                    teamId: generalTeam._id,
                    userId: ownerId,
                    workspaceId: workspace._id,
                },
            ],
            { session },
        );

        await AuditEvent.create(
            [
                {
                    workspaceId: workspace._id,
                    actorId: ownerId,
                    action: "workspace.created",
                    targetType: "workspace",
                    targetId: workspace._id.toString(),
                },
            ],
            { session },
        );

        await session.commitTransaction();
        return workspace;
    } catch (error) {
        await session.abortTransaction();

        if (error.code === 11000) {
            throw new ConflictException("This Workspace URL Is Already Taken");
        }
        throw error;
    } finally {
        await session.endSession();
    }
};

export const getWorkspaceSettings = async (workspaceId, userId) => {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) throw new NotFoundException("Workspace Not Found");

    const membership = await Membership.findOne({ workspaceId, userId });

    return {
        id: workspace._id.toString(),
        name: workspace.name,
        slug: workspace.slug,
        iconType: workspace.iconType,
        iconValue: workspace.iconValue,
        iconColor: workspace.iconColor,
        ownerId: workspace.ownerId.toString(),
        createdAt: workspace.createdAt,
        role: membership?.role ?? null,
    };
};

export const updateWorkspaceSettings = async (workspaceId, input, actorId) => {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) throw new NotFoundException("Workspace Not Found");

    if (input.slug !== undefined && input.slug !== workspace.slug) {
        if (
            await Workspace.exists({
                slug: input.slug,
                _id: mongoose.trusted({ $ne: workspaceId }),
            })
        ) {
            throw new ConflictException("This Workspace URL Is Already Taken");
        }
    }

    if (input.name !== undefined) workspace.name = input.name.trim();
    if (input.slug !== undefined) workspace.slug = input.slug;
    if (input.iconType !== undefined) workspace.iconType = input.iconType;
    if (input.iconValue !== undefined) workspace.iconValue = input.iconValue;
    if (input.iconColor !== undefined) workspace.iconColor = input.iconColor;

    await workspace.save();

    await AuditEvent.create({
        workspaceId,
        actorId,
        action: "workspace.updated",
        targetType: "workspace",
        targetId: workspaceId,
    });

    return {
        id: workspace._id.toString(),
        name: workspace.name,
        slug: workspace.slug,
        iconType: workspace.iconType,
        iconValue: workspace.iconValue,
        iconColor: workspace.iconColor,
    };
};
