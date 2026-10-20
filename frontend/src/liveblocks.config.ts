import type { Json, LiveFile, LiveMap } from "@liveblocks/client";

declare global {
    interface Liveblocks {
        Presence: {
            cursor: { x: number; y: number } | null;
            promptingFeedId: string | null;
            aiStatus?: string | null;
        };
        Storage: {
            images: LiveMap<string, LiveFile>;
        };
        UserMeta: {
            id: string;
            info: {
                name: string;
                avatar: string;
                color: string;
            };
        };
        ThreadMetadata: {
            x: number;
            y: number;
            nodeId?: string;
            offsetX?: number;
            offsetY?: number;
        };
        FeedMessageData: {
            role: "user" | "assistant";
            content: string;
            userId?: string;
            name?: string;
            avatar?: string;
            reasoning?: string;
            suggestions?: string[];
            streaming?: boolean;
            context?: Array<{
                type: string;
                label: string;
            }>;
            tools?: Array<{
                type: string;
                toolName: string;
                toolCallId: string;
                state: "input-available" | "output-available" | "output-error";
                input?: Json;
                output?: Json;
                errorText?: string;
            }>;
        };
        FeedMetadata: {
            title?: string;
        };
    }
}

export {};
