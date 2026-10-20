import { model, Schema } from "mongoose";

const teamSchema = new Schema(
    {
        workspaceId: {
            type: Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
        },
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, lowercase: true, trim: true },
        archivedAt: { type: Date, default: null },
    },
    { timestamps: true },
);

teamSchema.index({ workspaceId: 1, slug: 1 }, { unique: true });
teamSchema.index({ workspaceId: 1 });

export const Team = model("Team", teamSchema);
