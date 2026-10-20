import {
    ConflictException,
    UnauthorizedException,
} from "../utils/app-error.js";
import { compareValue } from "../utils/bcrypt.js";
import { signJwtToken } from "../utils/jwt.js";
import { createUser, getUserByEmail, toAuthUser } from "./user.service.js";

export const register = async (input) => {
    const existing = await getUserByEmail(input.email);
    if (existing) {
        throw new ConflictException(
            "An Account With This Email Already Exists",
        );
    }

    const user = await createUser(input);

    return { user: toAuthUser(user), token: signJwtToken(user._id.toString()) };
};

export const login = async (input) => {
    const user = await getUserByEmail(input.email);

    if (!user?.password) {
        throw new UnauthorizedException("Invalid Email Or Password");
    }

    const matches = await compareValue(input.password, user.password);
    if (!matches) {
        throw new UnauthorizedException("Invalid Email Or Password");
    }

    return { user: toAuthUser(user), token: signJwtToken(user._id.toString()) };
};
