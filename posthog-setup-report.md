<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into ReplyMommy. Client-side events were added to auth and match flows using `posthog.identify()` on login/signup and `posthog.capture()` on key user actions. A new `src/lib/posthog-server.ts` helper was created for server-side tracking via `posthog-node`, and server-side events were wired into all critical API routes: checkout, payment webhook, match responding, gallery unlocks, and gift sending. Environment variables were confirmed set in `.env.local`.

| Event | Description | File |
|---|---|---|
| `user_signed_up` | User completes email/password signup | `src/app/(auth)/signup/page.tsx` |
| `user_logged_in` | User logs in via email/password | `src/app/(auth)/login/page.tsx` |
| `application_step_completed` | User advances a step in the application form | `src/app/(auth)/apply/page.tsx` |
| `application_submitted` | User submits a member or mommy application | `src/app/(auth)/apply/page.tsx` |
| `match_accepted` | Member accepts a curated match | `src/app/(app)/matches/[matchId]/match-detail-client.tsx` |
| `match_declined` | Member declines a curated match | `src/app/(app)/matches/[matchId]/match-detail-client.tsx` |
| `mutual_match_created` | Both users accept a match (server-side) | `src/app/api/matches/respond/route.ts` |
| `upgrade_clicked` | Member clicks to upgrade their subscription tier | `src/app/(app)/settings/subscription/subscription-client.tsx` |
| `checkout_initiated` | User initiates a checkout session (server-side) | `src/app/api/dodo/checkout/route.ts` |
| `payment_succeeded` | Payment succeeded webhook received (server-side) | `src/app/api/dodo/webhook/route.ts` |
| `subscription_activated` | Subscription becomes active (server-side) | `src/app/api/dodo/webhook/route.ts` |
| `subscription_cancelled` | Subscription is cancelled or expired (server-side) | `src/app/api/dodo/webhook/route.ts` |
| `gallery_unlocked` | Member unlocks a gallery using tokens (server-side) | `src/app/api/gallery/unlock/route.ts` |
| `gift_sent` | Member sends a gift using tokens (server-side) | `src/app/api/gifts/send/route.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/380716/dashboard/1462433
- **Signup to Subscription Funnel**: https://us.posthog.com/project/380716/insights/ZiFzGXBB
- **Match Engagement**: https://us.posthog.com/project/380716/insights/r4V71JiX
- **Payment Conversion Funnel**: https://us.posthog.com/project/380716/insights/YlPPPl1T
- **Token Economy — Gallery Unlocks & Gifts**: https://us.posthog.com/project/380716/insights/X3Coll4j
- **Subscription Health — Upgrades vs Cancellations**: https://us.posthog.com/project/380716/insights/2ee7fRSx

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
