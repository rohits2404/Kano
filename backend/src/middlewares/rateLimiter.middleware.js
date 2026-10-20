import { rateLimit } from "express-rate-limit";

import { ErrorCodes } from "../utils/app-error.js";

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 1000,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        errorCode: ErrorCodes.ERR_TOO_MANY_REQUESTS,
        message: "Too many requests. Try again later.",
    },
});
