import { createGroq } from "@ai-sdk/groq";
import { getLiveblocks } from "../config/liveblocks.config.js";
import { buildBoardTools } from "./ai-tools.service.js";

const AI_USER_ID = "ai-agent";
const AI_USER_NAME = "AI Agent";
const AI_USER_AVATAR = "";

const MAX_TOKENS = 128_000;

// The model is chosen here, server-side. The client never sends one.
// Must be a Groq model that supports tool calling.
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

const SYSTEM_PROMPT =
    "You are a friendly, concise assistant on a collaborative canvas. " +
    "Reply in clear Markdown. Keep answers short unless asked for detail. " +
    "You can see and change the board with tools: list its items, add sticky notes, shapes, text, " +
    "frames, flowcharts and roadmaps, draw pictures (e.g. a flower or a house) as pen strokes, move items, " +
    "put items into frames, connect items with arrows, update or delete items, and tidy the layout. " +
    "Use them whenever the user asks you to act on the canvas. Before moving, connecting, updating, " +
    "deleting or framing existing items, call listBoardItems to get their ids. " +
    "After using tools, reply with one short sentence saying what you did.";

// How often a streaming reply is written to the feed. Each write is an HTTP call to
// Liveblocks, so writing every token would be slow; this keeps it smooth.
const STREAM_INTERVAL_MS = 150;

// Feeds we've already created in this process, so we skip that call next time.
const knownFeeds = new Set();

/**
 * Wraps `update` so streaming never waits on Liveblocks: `push` only remembers
 * the latest data, and at most one write is in flight. Old snapshots are skipped
 * (each write carries the full text so far). `flush` sends the final state.
 */
function createStreamWriter(update) {
    let latest = null;
    let inFlight = null;
    let lastSent = 0;
    let timer = null;

    const send = () => {
        if (!latest || inFlight) return;
        const data = latest;
        latest = null;
        lastSent = Date.now();
        inFlight = update(data)
            .catch(() => {})
            .finally(() => {
                inFlight = null;
                if (latest) schedule();
            });
    };

    const schedule = () => {
        if (timer || inFlight) return;
        const wait = Math.max(0, STREAM_INTERVAL_MS - (Date.now() - lastSent));
        timer = setTimeout(() => {
            timer = null;
            send();
        }, wait);
    };

    return {
        push(data) {
            latest = data;
            schedule();
        },
        async flush(data) {
            if (timer) clearTimeout(timer);
            timer = null;
            latest = null;
            await inFlight;
            await update(data);
        },
    };
}

// In-flight AI replies, keyed by `roomId:feedId`, so a client can abort one.
const activeStreams = new Map();

export const stopAiReply = (roomId, feedId) => {
    activeStreams.get(`${roomId}:${feedId}`)?.abort();
};

/**
 * Streams an assistant reply into the board's Liveblocks feed. The client sees
 * the message fill in live through `useFeedMessages` — no SSE needed.
 */
export const streamAiReply = async (input) => {
    const liveblocks = getLiveblocks();
    const { roomId, feedId, messages, context } = input;
    const streamKey = `${roomId}:${feedId}`;
    const abortController = new AbortController();
    activeStreams.set(streamKey, abortController);

    try {
        // Make sure the feed exists (idempotent safety net), once per process.
        const feedKey = `${roomId}:${feedId}`;
        if (!knownFeeds.has(feedKey)) {
            try {
                await liveblocks.createFeed({
                    roomId,
                    feedId,
                    metadata: { title: "AI chat" },
                });
            } catch {
                // Feed already exists.
            }
            knownFeeds.add(feedKey);
        }

        const created = await liveblocks.createFeedMessage({
            roomId,
            feedId,
            data: {
                role: "assistant",
                content: "",
                streaming: true,
                name: AI_USER_NAME,
                avatar: AI_USER_AVATAR,
                userId: AI_USER_ID,
            },
        });
        const messageId = created.id;

        const update = (data) =>
            liveblocks.updateFeedMessage({
                roomId,
                feedId,
                messageId,
                data: {
                    role: "assistant",
                    name: AI_USER_NAME,
                    avatar: AI_USER_AVATAR,
                    userId: AI_USER_ID,
                    ...data,
                },
            });

        try {
            if (process.env.GROQ_API_KEY) {
                await streamRealReply(
                    messages,
                    update,
                    roomId,
                    context,
                    abortController.signal,
                );
            } else {
                await streamMockReply(messages, update);
            }
        } catch (error) {
            if (abortController.signal.aborted) return;
            const reason =
                error instanceof Error ? error.message : "Unknown error";
            await update({
                content: `Sorry, something went wrong.\n\n\`${reason}\``,
                streaming: false,
            }).catch(() => {});
        }
    } finally {
        activeStreams.delete(streamKey);
    }
};

async function streamRealReply(messages, update, roomId, context, abortSignal) {
    // Lazily imported so the server still runs without an AI provider key.
    const { stepCountIs, streamText } = await import("ai");

    const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

    const system = context
        ? `${SYSTEM_PROMPT}\n\nThe user selected these objects on the board:\n${context}\n\n` +
          'Words like "this", "it", "change", "improve" or "make it better" refer to these ' +
          "objects: change them in place using their ids (updateItems, moveItems, deleteItems, " +
          "moveIntoFrame; to redraw a drawing, call drawPicture with frameId set to its frame's " +
          "id). Only add new items when the user asks for something new."
        : SYSTEM_PROMPT;

    const result = streamText({
        model: groq(DEFAULT_MODEL),
        system,
        messages,
        abortSignal,
        tools: buildBoardTools(roomId),
        stopWhen: stepCountIs(8),
    });

    const writer = createStreamWriter(update);
    let content = "";
    let reasoning = "";
    const tools = [];
    const toolByCall = new Map();

    // Read the model at full speed; the writer sends the latest text every ~150ms.
    try {
        for await (const part of result.fullStream) {
            if (part.type === "text-delta") {
                content += part.text;
            } else if (part.type === "reasoning-delta") {
                reasoning += part.text;
            } else if (part.type === "tool-call") {
                const step = {
                    type: `tool-${part.toolName}`,
                    toolName: part.toolName,
                    toolCallId: part.toolCallId,
                    state: "input-available",
                    input: part.input,
                };
                tools.push(step);
                toolByCall.set(part.toolCallId, step);
            } else if (part.type === "tool-result") {
                const step = toolByCall.get(part.toolCallId);
                if (step) {
                    step.state = "output-available";
                    step.output = part.output;
                }
            } else if (part.type === "tool-error") {
                const step = toolByCall.get(part.toolCallId);
                if (step) {
                    step.state = "output-error";
                    step.errorText =
                        part.error instanceof Error
                            ? part.error.message
                            : String(part.error);
                }
            } else {
                continue;
            }
            writer.push({
                content,
                reasoning: reasoning || undefined,
                tools: tools.length ? tools : undefined,
                streaming: true,
            });
        }
    } catch (error) {
        if (abortSignal?.aborted) {
            await writer.flush({
                content,
                reasoning: reasoning || undefined,
                tools: tools.length ? tools : undefined,
                streaming: false,
            });
            return;
        }
        throw error;
    }

    const finalStep = await result.finalStep;
    if (!reasoning) reasoning = finalStep.reasoningText ?? "";
    const usage = await result.usage;

    await writer.flush({
        content,
        reasoning: reasoning || undefined,
        tools: tools.length ? tools : undefined,
        usedTokens: usage.totalTokens ?? 0,
        maxTokens: MAX_TOKENS,
        streaming: false,
    });
}

// Simulates a streamed reply so the flow runs end-to-end without an AI key.
async function streamMockReply(messages, update) {
    const lastUserMessage =
        [...messages].reverse().find((message) => message.role === "user")
            ?.content ?? "your message";

    const reasoningText =
        "No AI provider key is set, so I'm streaming a canned response. " +
        "This is where a real model's reasoning would stream in.";

    const contentText = [
        `Here's a streamed mock reply to **"${lastUserMessage}"**.`,
        "",
        "Each chunk is written into the feed with `updateFeedMessage`, so it streams live to everyone on the board.",
        "",
        "Add `GROQ_API_KEY` to `.env` for real responses.",
    ].join("\n");

    const writer = createStreamWriter(update);

    let reasoning = "";
    for (const chunk of chunkText(reasoningText)) {
        reasoning += chunk;
        writer.push({ content: "", reasoning, streaming: true });
        await sleep(40);
    }

    let content = "";
    for (const chunk of chunkText(contentText)) {
        content += chunk;
        writer.push({ content, reasoning, streaming: true });
        await sleep(40);
    }

    await writer.flush({
        content,
        reasoning,
        usedTokens: Math.round(content.length / 4) + 320,
        maxTokens: MAX_TOKENS,
        streaming: false,
    });
}

// A few words per chunk, roughly like a real model's token rate.
function chunkText(text, wordsPerChunk = 3) {
    const words = text.match(/\S+\s*/g) ?? [text];
    const chunks = [];
    for (let i = 0; i < words.length; i += wordsPerChunk) {
        chunks.push(words.slice(i, i + wordsPerChunk).join(""));
    }
    return chunks;
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
