import { model, Schema } from "mongoose";

const teamMembershipSchema = new Schema(
    {
        teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        workspaceId: {
            type: Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
        },
        addedAt: { type: Date, default: Date.now },
    },
    { timestamps: false },
);

teamMembershipSchema.index({ teamId: 1, userId: 1 }, { unique: true });
teamMembershipSchema.index({ workspaceId: 1, userId: 1 });

export const TeamMembership = model("TeamMembership", teamMembershipSchema);
