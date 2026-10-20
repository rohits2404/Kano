import winston from "winston";

const { colorize, combine, errors, json, printf, timestamp } = winston.format;

const developmentFormat = combine(
    colorize({ all: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    printf(({ level, message, stack, timestamp: loggedAt, ...meta }) => {
        const metadata = Object.keys(meta).length
            ? ` ${JSON.stringify(meta)}`
            : "";
        return `${loggedAt} [${level}]: ${String(message)}${stack ? ` ${stack}` : ""}${metadata}`;
    }),
);

export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL,
    format:
        process.env.NODE_ENV === "production"
            ? combine(timestamp(), errors({ stack: true }), json())
            : developmentFormat,
    transports: [new winston.transports.Console()],
    silent: process.env.NODE_ENV === "test",
});
