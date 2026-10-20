import { Liveblocks } from "@liveblocks/node";

let client = null;

export const getLiveblocks = () => {
    if (!process.env.LIVEBLOCKS_SECRET_KEY) {
        throw new Error("LIVEBLOCKS_SECRET_KEY Is Not Configured");
    }
    client ??= new Liveblocks({ secret: process.env.LIVEBLOCKS_SECRET_KEY });
    return client;
};
