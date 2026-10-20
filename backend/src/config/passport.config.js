import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { User } from "../models/user.model.js";
import { toAuthUser } from "../services/user.service.js";

const cookieExtractor = (request) => request?.cookies?.accessToken ?? null;

passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
            secretOrKey: process.env.JWT_SECRET,
            algorithms: ["HS256"],
        },

        async (payload, done) => {
            try {
                console.info("[JWT DEBUG]", {
                    database: User.db.name,
                    model: User.modelName,
                    subjectType: typeof payload.sub,
                    validObjectId: /^[a-f\d]{24}$/i.test(String(payload.sub)),
                });
                const user = await User.findById(payload.sub);

                if (!user) return done(null, false);

                return done(null, toAuthUser(user));
            } catch (error) {
                console.error("[JWT DEBUG] User lookup failed:", error.message);
                return done(error, false);
            }
        },
    ),
);

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(
        new GitHubStrategy(
            {
                clientID: process.env.GITHUB_CLIENT_ID,
                clientSecret: process.env.GITHUB_CLIENT_SECRET,
                callbackURL: process.env.GITHUB_CALLBACK_URL,
            },

            async (accessToken, _refreshToken, profile, done) => {
                try {
                    // Fetch verified email addresses directly from GitHub.
                    const emailResponse = await fetch(
                        "https://api.github.com/user/emails",
                        {
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                                Accept: "application/vnd.github+json",
                                "X-GitHub-Api-Version": "2022-11-28",
                            },
                        },
                    );

                    if (!emailResponse.ok) {
                        throw new Error(
                            `GitHub email API failed with status ${emailResponse.status}`,
                        );
                    }

                    const emails = await emailResponse.json();

                    const chosen =
                        emails.find(
                            (email) => email.primary && email.verified,
                        ) ?? emails.find((email) => email.verified);

                    const email = chosen?.email?.trim().toLowerCase();

                    if (!email) {
                        return done(
                            new Error(
                                "No verified email found on GitHub. Verify an email on GitHub and try again.",
                            ),
                        );
                    }

                    // Find an account already linked to this GitHub identity.
                    const existingByGitHubId = await User.findOne({
                        githubId: profile.id,
                    });

                    if (existingByGitHubId) {
                        return done(null, toAuthUser(existingByGitHubId));
                    }

                    // Link an existing account only through a verified email.
                    const existingByEmail = await User.findOne({ email });

                    if (existingByEmail) {
                        if (
                            existingByEmail.githubId &&
                            existingByEmail.githubId !== profile.id
                        ) {
                            return done(
                                new Error(
                                    "This email is already linked to another GitHub account.",
                                ),
                            );
                        }

                        existingByEmail.githubId = profile.id;
                        existingByEmail.emailVerifiedAt = new Date();

                        await existingByEmail.save();

                        return done(null, toAuthUser(existingByEmail));
                    }

                    // Create a new MongoDB user on first successful GitHub login.
                    const user = await User.create({
                        name: profile.displayName || profile.username || email,
                        email,
                        githubId: profile.id,
                        avatarUrl: profile.photos?.[0]?.value ?? null,
                        emailVerifiedAt: new Date(),
                    });

                    return done(null, toAuthUser(user));
                } catch (error) {
                    return done(error, false);
                }
            },
        ),
    );
}

export default passport;
