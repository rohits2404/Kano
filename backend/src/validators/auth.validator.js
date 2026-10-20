import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().trim().min(2, "Name Must Be At Least 2 Characters"),
    email: z.string().trim().toLowerCase().email("Enter A Valid Email"),
    password: z.string().min(8, "Password Must Be At Least 8 Characters"),
});

export const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email("Enter A Valid Email"),
    password: z.string().min(1, "Password Is Required"),
});
