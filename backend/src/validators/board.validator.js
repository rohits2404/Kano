import { z } from "zod";
import { BOARD_TEMPLATE_KEYS } from "../templates/index.js";

export const createBoardSchema = z.object({
    teamId: z.string().min(1, "Pick A Team"),
    title: z
        .string()
        .trim()
        .max(80, "Keep The Title Under 80 Characters")
        .optional(),
    description: z
        .string()
        .trim()
        .max(200, "Keep It Under 200 Characters")
        .optional(),
    templateKey: z.enum(BOARD_TEMPLATE_KEYS).optional(),
});

export const boardTemplateParamsSchema = z.object({
    key: z.enum(BOARD_TEMPLATE_KEYS),
});

export const listBoardsQuerySchema = z.object({
    teamId: z.string().min(1),
});
