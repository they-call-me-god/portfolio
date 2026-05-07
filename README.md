# shaurya.dev — Personal Portfolio

A self-optimising portfolio built with **Next.js 16**, **React Three Fiber**, **Framer Motion**, and **Tailwind CSS v4**. Features a daily analytics-driven copy pipeline: PostHog events → Gemini generates copy variants → auto-commit + redeploy.

## ✨ Highlights

- **Custom cursor** — physics-based spring cursor with contextual hover labels
- **3D hero** — animated gradient orbs via Three.js with autonomous drift
- **Sections** — Hero, About, Work Experience, Projects, Contact
- **Self-optimising** — PostHog analytics feed a Gemini-powered cron that A/B tests headline & CTA copy
- **Analytics** — PostHog session recording + custom events
- **SEO** — dynamic OG image generation, meta tags, semantic HTML

## 🛠 Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| 3D | React Three Fiber + Drei |
| Animation | Framer Motion |
| Styling | Tailwind CSS v4 |
| Analytics | PostHog |
| AI | Gemini (copy optimisation cron) |
| Hosting | Vercel |

## 🚀 Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 📁 Structure

```
app/            → Pages + layout + OG image generation
components/
  sections/     → Hero, About, Work, Projects, Contact
  CustomCursor  → Physics-based spring cursor
lib/
  content.ts    → All copy + project data (single source of truth)
```

## 📬 Contact

- **GitHub** — [they-call-me-god](https://github.com/they-call-me-god)
- **LinkedIn** — [shauryalowkeygotaura](https://linkedin.com/in/shauryalowkeygotaura)
- **Email** — shauryavardhan.shandilya@gmail.com
