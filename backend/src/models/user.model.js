import { model, Schema } from "mongoose";

import { hashValue } from "../utils/bcrypt.js";

const userSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: { type: String, select: false },
        githubId: { type: String, unique: true, sparse: true },
        avatarUrl: { type: String, default: null },
        emailVerifiedAt: { type: Date, default: null },
    },
    { timestamps: true },
);

userSchema.pre("save", async function hashPassword() {
    if (!this.isModified("password") || !this.password) return;
    this.password = await hashValue(this.password);
});

userSchema.set("toJSON", {
    transform: (_document, returned) => {
        delete returned.password;
        return returned;
    },
});

export const User = model("User", userSchema);
