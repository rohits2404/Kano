import emailjs from "@emailjs/nodejs";
import { emailjsClient } from "../config/email.config.js";
import { logger } from "../utils/logger.js";

export const sendInvitationEmail = async (input) => {
    const inviteUrl = `${process.env.APP_URL}/invite/${input.token}`;

    if (!emailjsClient) {
        logger.warn(
            "EmailJS Credentials Are Not Configured; Skipping Invitation Email",
            {
                to: input.to,
                invitationId: input.invitationId,
            },
        );
        return;
    }

    try {
        const response = await emailjs.send(
            process.env.EMAILJS_SERVICE_ID,
            process.env.EMAILJS_INVITATION_TEMPLATE_ID,
            {
                to_email: input.to,
                inviter_name: input.inviterName,
                workspace_name: input.workspaceName,
                invite_url: inviteUrl,
                expiration_text: "This Invitation Expires In 7 Days.",
            },
            {
                publicKey: process.env.EMAILJS_PUBLIC_KEY,
                privateKey: process.env.EMAILJS_PRIVATE_KEY,
            },
        );

        logger.info("Invitation Email Sent Successfully", {
            to: input.to,
            invitationId: input.invitationId,
            status: response.status,
        });
    } catch (error) {
        logger.error("Failed To Send Invitation Email", {
            to: input.to,
            invitationId: input.invitationId,
            error: error instanceof Error ? error.message : String(error),
        });
    }
};
