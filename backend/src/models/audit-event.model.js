import { model, Schema } from "mongoose";

const auditEventSchema = new Schema(
    {
        workspaceId: {
            type: Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
        },
        actorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        action: { type: String, required: true },
        targetType: { type: String, required: true },
        targetId: { type: String, required: true },
        metadata: { type: Schema.Types.Mixed, default: {} },
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: false },
);

auditEventSchema.index({ workspaceId: 1, createdAt: -1 });
auditEventSchema.index({ workspaceId: 1, targetType: 1, targetId: 1 });

export const AuditEvent = model("AuditEvent", auditEventSchema);
