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
                const user = await User.findById(payload.sub);

                if (!user) return done(null, false);

                return done(null, toAuthUser(user));
            } catch (error) {
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
            async (_accessToken, _refreshToken, profile, done) => {
                try {
                    const emails = profile.emails ?? [];
                    const chosen =
                        emails.find((e) => e.primary && e.verified) ??
                        emails.find((e) => e.verified);

                    const email = chosen?.value?.trim().toLowerCase();

                    if (!email) {
                        return done(
                            new Error(
                                "No Email Found On GitHub Account. Make Your Email Accessible And Try Again..",
                            ),
                        );
                    }

                    const existingByGitHubId = await User.findOne({
                        githubId: profile.id,
                    });

                    if (existingByGitHubId) {
                        if (!existingByGitHubId.emailVerifiedAt) {
                            existingByGitHubId.emailVerifiedAt = new Date();
                            await existingByGitHubId.save();
                        }

                        return done(null, toAuthUser(existingByGitHubId));
                    }

                    const existingByEmail = await User.findOne({ email });

                    if (existingByEmail) {
                        if (!existingByEmail.emailVerifiedAt) {
                            existingByEmail.set("password", undefined);
                        }
                        if (
                            existingByEmail.githubId &&
                            existingByEmail.githubId !== profile.id
                        ) {
                            return done(
                                new Error(
                                    "This Email Is Already Linked To Another GitHub Account.",
                                ),
                            );
                        }

                        existingByEmail.githubId = profile.id;
                        existingByEmail.emailVerifiedAt = new Date();

                        await existingByEmail.save();

                        return done(null, toAuthUser(existingByEmail));
                    }

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
