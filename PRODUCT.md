# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Businesses, startups, and personal brands (not limited to Malaysia) who need a focused web presence — landing pages, freelance web/design work — without a large custom system. Secondary audience: visitors evaluating Haziq's broader dev/game-dev work and skills (recruiters, collaborators, potential clients).

## Product Purpose

ZiqFolio is Syed Muhammad Haziq's personal portfolio and freelance-offer site, built with Jigsaw (Laravel static site generator) and Tailwind CSS. It introduces Haziq, showcases his project/skill work, and offers freelance landing-page and web design services with published starter pricing.

## Positioning

A single freelancer offering focused, fast-turnaround landing pages and small sites (via Jigsaw + Tailwind, with a cheaper Canva-based tier) rather than large custom-built systems — an alternative to hiring an agency for a business that just needs a clean, working web presence quickly.

## Operating Context

- Built with Jigsaw (`tightenco/jigsaw`, PHP/Composer) + Laravel Mix + Tailwind CSS; source lives under `source/` (`index.blade.php`, `_layouts/main.blade.php`, `_layouts/partials/{about,project,service,skill}.blade.php`).
- `public/` and `build_production/` hold compiled build output.
- Root `index.html` is a separate, self-contained draft/reference landing page (different visual direction and copy) — not the current live build; do not treat it as source of truth without the user's say-so.
- Uses AOS (scroll animations), Tailwind CDN/browser build, Google Fonts (Nunito Sans).

## Capabilities and Constraints

- Sections: About (sticky intro/hero with logo + LinkedIn CTA), Project (image grid of past work incl. a Canva-built site, a Play Store app, and Oxford EduVision work), Services (Landing Pages, Freelance Jobs) with two pricing tiers, Skill (visual badge cluster: Tailwind, Unity, Laravel, Canva, GitHub, PHP).
- Pricing tiers: Basic Plan (Canva) RM200+, 1 landing page, 2–3 working days, domain included*; Standard Plan (Jigsaw) RM400+, custom design, light AOS animation, basic SEO, 5–7 working days, domain included*.
- Copy is bilingual-leaning (English UI, some Malay in pricing bullet points).
- Contact path is LinkedIn (`linkedin.com/in/syhaziqdev`), not a contact form.

## Brand Commitments

- Name/handle: "Syhaziqdev" / site title "ZiqFolio".
- Logo and personal photo assets under `source/assets/images/` (`logo.png`, `myfave.jpeg`, design/skill icons).
- Voice: casual, personal, playful ("a game developer by day, a part-time web developer by heart").

## Evidence on Hand

- Real linked project work: Canva-built site (senibina.my.canva.site), Sirah Explorer (Play Store app, Oxford EduVision), plus image assets referenced as project screenshots (`assets/images/1.png`–`5.png`) — actual screenshot content not verified here.
- No testimonials, case studies, or client logos present; do not fabricate any.
- Root `index.html` contains a more developed alternate narrative (KadMeHQ SaaS product, Oxford EduVision timeline, Unity game portfolio, quote-request form) — evidence of direction Haziq has explored, not confirmed as current, but a useful reference for future content if he chooses to reconcile the two builds.

## Product Principles

1. Keep the offer narrow and honest: landing pages and small sites, not backend-heavy custom systems.
2. Lead with real, linkable work rather than invented proof.
3. Keep the tone personal and unpolished-in-a-good-way — this is a solo freelancer's site, not an agency's.
4. Price transparently with clear starter tiers so expectations are set before contact.
