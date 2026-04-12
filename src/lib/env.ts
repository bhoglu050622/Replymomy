/**
 * Centralized service availability checks.
 * Use these instead of scattered === "placeholder" checks throughout API routes.
 */
export const isConfigured = {
  dodo:
    !!process.env.DODO_SECRET_KEY &&
    process.env.DODO_SECRET_KEY !== "placeholder",

  dodoWebhook:
    !!process.env.DODO_WEBHOOK_SECRET &&
    process.env.DODO_WEBHOOK_SECRET !== "placeholder",

  stream:
    !!process.env.STREAM_API_KEY &&
    process.env.STREAM_API_KEY !== "your-stream-api-key" &&
    !!process.env.STREAM_API_SECRET &&
    process.env.STREAM_API_SECRET !== "your-stream-api-secret",

  persona:
    !!process.env.PERSONA_API_KEY &&
    process.env.PERSONA_API_KEY !== "your-persona-api-key",

  personaWebhook:
    !!process.env.PERSONA_WEBHOOK_SECRET &&
    process.env.PERSONA_WEBHOOK_SECRET !== "your-persona-webhook-secret",

  resend:
    !!process.env.RESEND_API_KEY &&
    process.env.RESEND_API_KEY !== "re_placeholder",

  cloudinary:
    !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME !== "your-cloud-name",
} as const;
