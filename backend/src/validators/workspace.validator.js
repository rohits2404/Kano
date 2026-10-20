import { z } from "zod";
import { WORKSPACE_ICON_COLORS, WORKSPACE_ICON_TYPES } from "../types/roles.js";

export const createWorkspaceSchema = z.object({
    name: z.string().trim().min(2, "Name Must Be At Least 2 Characters"),
    slug: z
        .string()
        .trim()
        .toLowerCase()
        .regex(/^[a-z0-9-]+$/, "Use Lowercase Letters, Numbers And Dashes")
        .optional(),
    iconType: z.enum(WORKSPACE_ICON_TYPES).optional(),
    iconValue: z.string().max(200).optional(),
    iconColor: z.enum(WORKSPACE_ICON_COLORS).optional(),
});

export const slugQuerySchema = z.object({
    slug: z
        .string()
        .trim()
        .toLowerCase()
        .regex(/^[a-z0-9-]+$/, "Use Lowercase Letters, Numbers And Dashes"),
});

export const inviteRowSchema = z.object({
    email: z.string().trim().toLowerCase().email("Enter A Valid Email"),
    role: z.enum(["admin", "member"]),
});

export const createInvitationsSchema = z.object({
    invites: z.array(inviteRowSchema).min(1).max(100),
    defaultRole: z.enum(["admin", "member"]).optional(),
});

export const updateWorkspaceSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(2, "Name Must Be At Least 2 Characters")
            .max(60, "Keep It Under 60 Characters")
            .optional(),
        slug: z
            .string()
            .trim()
            .toLowerCase()
            .regex(/^[a-z0-9-]+$/, "Use Lowercase Letters, Numbers And Dashes")
            .optional(),
        iconType: z.enum(WORKSPACE_ICON_TYPES).optional(),
        iconValue: z.string().max(200).optional(),
        iconColor: z.enum(WORKSPACE_ICON_COLORS).optional(),
    })
    .refine((value) => Object.values(value).some((v) => v !== undefined), {
        message: "Provide At Least One Field To Update",
    });
