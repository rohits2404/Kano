import passport from "passport";

import { UnauthorizedException } from "../utils/app-error.js";

export const protect = (request, response, next) => {
    passport.authenticate("jwt", { session: false }, (error, user, _info) => {
        if (error) return next(error);
        if (!user)
            return next(new UnauthorizedException("Authentication Required"));
        request.user = user;
        next();
    })(request, response, next);
};
