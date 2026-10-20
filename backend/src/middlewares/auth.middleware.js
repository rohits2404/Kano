import passport from "passport";
import { UnauthorizedException } from "../utils/app-error.js";

export const protect = (request, response, next) => {
    passport.authenticate("jwt", { session: false }, (error, user, info) => {
        if (error) return next(error);

        if (!user) {
            console.warn("[AUTH DEBUG]", {
                hasCookie: Boolean(request.cookies?.accessToken),
                reason: info?.message ?? info?.name ?? "No User Returned",
            });

            return next(new UnauthorizedException("Authentication Required"));
        }

        request.user = user;
        next();
    })(request, response, next);
};
