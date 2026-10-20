import emailjs from "@emailjs/nodejs";

export const emailjsClient =
    process.env.EMAILJS_PUBLIC_KEY &&
    process.env.EMAILJS_PRIVATE_KEY &&
    process.env.EMAILJS_SERVICE_ID &&
    process.env.EMAILJS_INVITATION_TEMPLATE_ID
        ? emailjs
        : null;
