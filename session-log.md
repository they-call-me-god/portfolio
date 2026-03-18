# Portfolio — Session Log

## Status: LIVE
**URL:** https://portfolio-iota-nine-97gumluwra.vercel.app
**GitHub:** https://github.com/they-call-me-god/portfolio
**Vercel project:** `shauryavardhanshandilya-9309s-projects/portfolio`

---

## What Was Built

Self-learning portfolio that:
- Tracks every visitor interaction via PostHog
- A/B tests hero headline 50/50 (control vs test variant)
- Runs daily at 3am UTC → reads its own PostHog analytics → Gemini Flash proposes 1 copy change → commits to GitHub → Vercel auto-redeploys
- Auto-rolls back if any metric drops >10% vs baseline

## Stack
| Layer | Tech |
|-------|------|
| Framework | Next.js 16.1.7 (App Router, Turbopack) |
| UI | shadcn/ui + Tailwind CSS v4 + Framer Motion |
| Analytics | PostHog JS SDK + Node SDK |
| A/B Testing | PostHog feature flag `hero-headline` (server-side) |
| Self-iteration brain | Gemini Flash (`gemini-1.5-flash`, free tier) |
| State | Upstash Redis (iteration history, weekly cap, baseline metrics) |
| Git automation | Octokit `@octokit/rest` (GitHub Contents API) |
| Cron | Vercel Cron (`vercel.json` → `0 3 * * *` → `/api/iterate`) |
| Deploy hook | `VERCEL_DEPLOY_HOOK_URL` triggers redeploy after each commit |

## Key Files
| File | Purpose |
|------|---------|
| `lib/content.ts` | Personal info, projects, socials — edit anytime |
| `lib/iterate.ts` | Self-iteration brain (cap → metrics → rollback or propose → commit → deploy) |
| `lib/gemini.ts` | Gemini Flash integration — proposeChange() |
| `lib/posthog-metrics.ts` | Reads PostHog Events API for last 24h metrics |
| `lib/redis.ts` | Upstash typed helpers, ISO week-based cap reset |
| `lib/github.ts` | Octokit readFile/writeFile via Contents API |
| `app/api/iterate/route.ts` | POST cron endpoint, validates CRON_SECRET |
| `components/sections/Hero.tsx` | Parallax hero, avatar, A/B copy, PostHog events |
| `vercel.json` | Cron schedule |
| `.env.local` | All API keys (never commit) |

## Environment Variables (all set in Vercel production)
- `NEXT_PUBLIC_POSTHOG_KEY` — phc_Fvr4...
- `NEXT_PUBLIC_POSTHOG_HOST` — https://us.i.posthog.com
- `POSTHOG_PERSONAL_API_KEY` — phx_aso...
- `POSTHOG_PROJECT_ID` — 346533
- `GEMINI_API_KEY`
- `GITHUB_TOKEN` / `GITHUB_OWNER=they-call-me-god` / `GITHUB_REPO=portfolio`
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`
- `VERCEL_DEPLOY_HOOK_URL`
- `CRON_SECRET`
- `NEXT_PUBLIC_SITE_VERSION=iteration-0`
- `NEXT_PUBLIC_HERO_HEADLINE_TEST` / `NEXT_PUBLIC_HERO_CTA_TEST` (blank = uses content.ts defaults)

## PostHog Events Tracked
| Event | Trigger |
|-------|---------|
| `page_viewed` | On mount |
| `scroll_depth` | 25 / 50 / 75 / 100% |
| `hero_cta_clicked` | "Hire Me" button |
| `about_section_viewed` | 50% visibility |
| `project_card_clicked` | Any project card |
| `social_link_clicked` | GitHub / LinkedIn / Instagram |
| `contact_link_clicked` | LinkedIn / Instagram / email in contact section |

## Self-Iteration Logic
```
Daily 3am UTC:
1. Check weekly cap (max 7 changes/week via Redis ISO week key)
2. Fetch PostHog metrics: cta_ctr, scroll_50_rate, contact_rate
3. If any metric <90% of baseline → ROLLBACK (restore previous content.ts from Redis)
4. If metrics OK → ask Gemini to propose 1 change (headline | cta | tagline)
5. Commit change to GitHub via Octokit
6. Trigger Vercel deploy hook → site redeploys with new copy
7. Store new baseline in Redis
```

## Pending
- [ ] **Drop your photo** as `public/avatar.jpg` → `git add . && git commit -m "feat: add avatar" && git push`
- [ ] **Generate hero background** via Nanobanana (prompt in `scripts/generate-hero.ts`) when image quota resets → save as `public/hero.jpg` → update Hero.tsx line 45: `'url(/hero.svg)'` → `'url(/hero.jpg)'`
- [ ] Connect GitHub repo to Vercel for auto-deploy on push (currently using deploy hook)

## Fixes Applied During Deploy
- Whitespace stripped from `CRON_SECRET`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` env vars (Vercel rejects whitespace in header values)
- PostHog `hero-headline` flag created directly via curl (ts-node had ESM conflicts)

#portfolio #vercel #posthog #self-learning #nextjs
