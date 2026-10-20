import { HTTPSTATUS } from "../config/http-status.config.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { getBoard } from "../services/board.service.js";
import { stopAiReply, streamAiReply } from "../services/ai.service.js";
import { logger } from "../utils/logger.js";
import { aiChatSchema, stopAiChatSchema } from "../validators/ai.validator.js";

export const aiChatHandler = asyncHandler(async (request, response) => {
    const { feedId, messages, context } = aiChatSchema.parse(request.body);
    const board = await getBoard(request.params.boardId, request.user.id);

    void streamAiReply({
        roomId: board.roomId,
        feedId,
        messages,
        context,
    }).catch((error) => {
        logger.error("AI Reply Failed", {
            boardId: request.params.boardId,
            feedId,
            error: error instanceof Error ? error.message : String(error),
        });
    });

    response
        .status(HTTPSTATUS.ACCEPTED)
        .json({ success: true, data: { accepted: true } });
});

export const stopAiChatHandler = asyncHandler(async (request, response) => {
    const { feedId } = stopAiChatSchema.parse(request.body);
    const board = await getBoard(request.params.boardId, request.user.id);

    stopAiReply(board.roomId, feedId);

    response.status(HTTPSTATUS.OK).json({ success: true, data: { ok: true } });
});
