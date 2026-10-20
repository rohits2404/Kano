import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

mongoose.set("sanitizeFilter", true);

export const connectDatabase = async () => {
    await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
    });
    logger.info("Connected To MongoDB", { database: mongoose.connection.name });
};

export const disconnectDatabase = async () => {
    await mongoose.disconnect();
    logger.info("Disconnected From MongoDB");
};
