import { z } from "zod";

export const updateMemberRoleSchema = z.object({
    role: z.enum(["admin", "member"]),
});

export const resolveMembersSchema = z.object({
    ids: z
        .string()
        .trim()
        .transform((value) =>
            value
                .split(",")
                .map((id) => id.trim())
                .filter(Boolean),
        )
        .pipe(z.array(z.string()).max(100)),
});

export const searchMembersSchema = z.object({
    q: z.string().trim().max(100).default(""),
});
