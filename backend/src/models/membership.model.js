import { model, Schema } from "mongoose";

const membershipSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        workspaceId: {
            type: Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
        },
        role: {
            type: String,
            enum: ["owner", "admin", "member"],
            default: "member",
        },
        joinedAt: { type: Date, default: Date.now },
    },
    { timestamps: false },
);

membershipSchema.index({ userId: 1, workspaceId: 1 }, { unique: true });
membershipSchema.index({ workspaceId: 1, role: 1 });
membershipSchema.index({ userId: 1 });

export const Membership = model("Membership", membershipSchema);
