import { User } from "../models/user.model.js";

export const toAuthUser = (user) => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl ?? null,
    createdAt: user.createdAt,
});

export const getUserByEmail = (email) =>
    User.findOne({ email }).select("+password");

export const getUserById = (id) => User.findById(id);

export const createUser = (input) => User.create(input);
