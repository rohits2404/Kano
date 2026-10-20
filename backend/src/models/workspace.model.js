import { model, Schema } from "mongoose";

import { WORKSPACE_ICON_COLORS, WORKSPACE_ICON_TYPES } from "../types/roles.js";

const workspaceSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        iconType: {
            type: String,
            enum: WORKSPACE_ICON_TYPES,
            default: "initials",
        },
        iconValue: { type: String, default: "" },
        iconColor: {
            type: String,
            enum: WORKSPACE_ICON_COLORS,
            default: "yellow",
        },
        ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        archivedAt: { type: Date, default: null },
    },
    { timestamps: true },
);

export const Workspace = model("Workspace", workspaceSchema);
