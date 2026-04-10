import DodoPayments from "dodopayments";

// Always use live_mode — DodoPayments key is environment-specific at the account level
export const dodo = new DodoPayments({
  bearerToken: process.env.DODO_SECRET_KEY!,
  environment: "live_mode",
});
