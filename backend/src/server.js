import "dotenv/config";

import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import path from "node:path";
import { fileURLToPath } from "node:url";

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import {
    connectDatabase,
    disconnectDatabase,
} from "./config/database.config.js";
import { HTTPSTATUS } from "./config/http-status.config.js";
import passport from "./config/passport.config.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { apiLimiter } from "./middlewares/rateLimiter.middleware.js";
import { routes } from "./routes/index.js";
import { NotFoundException } from "./utils/app-error.js";
import { logger } from "./utils/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.set("trust proxy", 1);

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                // Liveblocks: REST (auth, files) and the realtime WebSocket.
                "connect-src": [
                    "'self'",
                    "https://*.liveblocks.io",
                    "wss://*.liveblocks.io",
                ],
                // Avatars (Google), Liveblocks file uploads, pasted images.
                "img-src": ["'self'", "data:", "blob:", "https:"],
                "media-src": ["'self'", "blob:", "https:"],
                "style-src": [
                    "'self'",
                    "'unsafe-inline'",
                    "https://fonts.googleapis.com",
                ],
                "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
            },
        },
    }),
);
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(cookieParser());
app.use(passport.initialize());

if (process.env.CORS_ORIGIN) {
    app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
}

app.get("/health", (_request, response) => {
    response.status(HTTPSTATUS.OK).json({ status: "ok" });
});

app.use("/api/v1", apiLimiter, routes);

if (process.env.NODE_ENV === "production") {
    const clientPath = path.resolve(__dirname, "../../client/dist");
    app.use(express.static(clientPath));
    app.get(/^(?!\/api).*/, (_request, response) => {
        response.sendFile(path.join(clientPath, "index.html"));
    });
}

app.use((request, _response, next) => {
    next(
        new NotFoundException(
            `Route not found: ${request.method} ${request.originalUrl}`,
        ),
    );
});

app.use(errorHandler);

let server;

const shutdownSignals = ["SIGTERM", "SIGINT"];
let shuttingDown = false;

const shutdown = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info("Shutting Down API", { signal });

    server?.close(async (error) => {
        if (error) logger.error("Shutdown Failed", { error: error.message });

        try {
            await disconnectDatabase();
            process.exitCode = error ? 1 : 0;
        } catch (disconnectError) {
            logger.error("Database Disconnect Failed", {
                error:
                    disconnectError instanceof Error
                        ? disconnectError.message
                        : "Unknown Error",
            });
            process.exitCode = 1;
        }
    });
};

const start = async () => {
    try {
        await connectDatabase();
    } catch (error) {
        logger.error("Failed To Connect To MongoDB", {
            error: error instanceof Error ? error.message : "Unknown Error",
        });
        process.exit(1);
    }

    server = app.listen(process.env.PORT, () => {
        logger.info("API Listening", {
            port: process.env.PORT,
            env: process.env.NODE_ENV,
        });
    });

    shutdownSignals.forEach((signal) =>
        process.once(signal, () => shutdown(signal)),
    );
};

start();
