<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Skild TanStack Start project. The following changes were made:

- **`posthog-js`** — already installed; confirmed in use via `posthog-js/react` across the app.
- **`posthog-node`** — installed for server-side event capture.
- **`.env`** — set `VITE_PUBLIC_POSTHOG_PROJECT_TOKEN` and `VITE_PUBLIC_POSTHOG_HOST` to the correct values.
- **`vite.config.ts`** — `/ingest` reverse proxy already configured, routing PostHog requests through the Vite dev server to avoid CORS issues.
- **`src/routes/__root.tsx`** — `PostHogProvider` already wraps the app with env-var keys, `capture_exceptions: true`, and a `PostHogUserIdentifier` component that calls `posthog.identify()` with Clerk user ID/email/name on sign-in and `posthog.reset()` on sign-out.
- **`src/utils/posthog-server.ts`** — new singleton server-side PostHog client using `posthog-node`, for use in server functions and API routes.
- **`src/routes/index.tsx`** — added `skills_fetch_error` server-side capture via `posthog-node` in the catch block of the skills loader; existing `browse_registry_clicked` and `publish_skill_clicked` events retained.
- **`src/components/SkillCard.tsx`** — `install_command_copied` and `skill_opened` events already in place.
- **`src/components/Navbar.tsx`** — `sign_in_clicked` event already in place.

| Event | Description | File |
|---|---|---|
| `browse_registry_clicked` | User clicks the Browse Registry CTA on the homepage hero section | `src/routes/index.tsx` |
| `publish_skill_clicked` | User clicks the Publish Skill CTA on the homepage hero section | `src/routes/index.tsx` |
| `sign_in_clicked` | Signed-out user clicks the Sign in button in the navbar | `src/components/Navbar.tsx` |
| `install_command_copied` | User copies the install command from a skill card | `src/components/SkillCard.tsx` |
| `skill_opened` | User clicks the Open button on a skill card | `src/components/SkillCard.tsx` |
| `skills_fetch_error` | Server-side error when fetching skills from the database | `src/routes/index.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/393949/dashboard/1501110
- **Insight — Skill Discovery to Install Funnel**: https://us.posthog.com/project/393949/insights/Ki261CMY
- **Insight — Install Commands Copied Over Time**: https://us.posthog.com/project/393949/insights/zYpzSqRH
- **Insight — Sign-in Conversion Funnel**: https://us.posthog.com/project/393949/insights/3tqPf03x
- **Insight — Homepage CTA Clicks**: https://us.posthog.com/project/393949/insights/d2V2gvng
- **Insight — Install Copies by Skill Category**: https://us.posthog.com/project/393949/insights/hv2rX19C

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
