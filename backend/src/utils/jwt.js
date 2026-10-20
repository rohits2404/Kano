import jwt from "jsonwebtoken";

export const signJwtToken = (userId) =>
    jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
        algorithm: "HS256",
        expiresIn: process.env.JWT_EXPIRES_IN ?? "30d",
    });
