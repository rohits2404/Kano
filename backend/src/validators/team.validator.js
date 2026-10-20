import { z } from "zod";

export const createTeamSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Team Name Must Be At Least 2 Characters")
        .max(40, "Keep It Under 40 Characters"),
});

export const addTeamMembersSchema = z.object({
    userIds: z.array(z.string()).min(1).max(100),
});
