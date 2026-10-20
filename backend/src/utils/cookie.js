const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const setJwtAuthCookie = (response, token) => {
    response.cookie("accessToken", token, cookieOptions);
};

export const clearJwtAuthCookie = (response) => {
    response.clearCookie("accessToken", {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
    });
};
