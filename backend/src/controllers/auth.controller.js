import passport from "passport";
import crypto from "node:crypto";
import { HTTPSTATUS } from "../config/http-status.config.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { login, register } from "../services/auth.service.js";
import { ErrorCodes } from "../utils/app-error.js";
import { clearJwtAuthCookie, setJwtAuthCookie } from "../utils/cookie.js";
import { signJwtToken } from "../utils/jwt.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";

const isProduction = process.env.NODE_ENV === "production";

export const registerHandler = asyncHandler(async (request, response) => {
    const input = registerSchema.parse(request.body);
    const { user, token } = await register(input);

    setJwtAuthCookie(response, token);
    response.status(HTTPSTATUS.CREATED).json({ success: true, data: { user } });
});

export const loginHandler = asyncHandler(async (request, response) => {
    const input = loginSchema.parse(request.body);
    const { user, token } = await login(input);

    setJwtAuthCookie(response, token);
    response.status(HTTPSTATUS.OK).json({ success: true, data: { user } });
});

export const logoutHandler = asyncHandler(async (_request, response) => {
    clearJwtAuthCookie(response);
    response.status(HTTPSTATUS.OK).json({ success: true, data: null });
});

export const statusHandler = asyncHandler(async (request, response) => {
    response
        .status(HTTPSTATUS.OK)
        .json({ success: true, data: { user: request.user } });
});

export const githubAuthHandler = (request, response, next) => {
    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
        response.status(HTTPSTATUS.SERVICE_UNAVAILABLE).json({
            success: false,
            errorCode: ErrorCodes.ERR_INTERNAL,
            message: "Github OAuth Is Not Configured",
        });
        return;
    }

    const state = crypto.randomBytes(16).toString("hex");
    response.cookie("oauth_state", state, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 10 * 60 * 1000,
    });

    passport.authenticate("github", {
        scope: ["user:email"],
        state,
    })(request, response, next);
};

export const githubCallbackHandler = (request, response, next) => {
    const expected = request.cookies?.oauth_state;
    response.clearCookie("oauth_state");

    if (!expected || request.query.state !== expected) {
        return response.redirect(
            `${process.env.APP_URL}/sign-in?error=github_state`,
        );
    }

    passport.authenticate("github", { session: false }, (error, user) => {
        if (error || !user) {
            return response.redirect(
                `${process.env.APP_URL}/sign-in?error=github`,
            );
        }

        setJwtAuthCookie(response, signJwtToken(user.id));
        response.redirect(`${process.env.APP_URL}/dashboard`);
    })(request, response, next);
};
