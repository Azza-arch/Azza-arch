# haziqbuilds.com

Hand-written static portfolio for SYHAZIQDEV (Syed Muhammad Haziq), a freelance web
developer in Malaysia. Single page (`index.html`) plus `assets/`, deployed as-is to
Cloudflare Pages — no build step, no framework.

## Contact form

The quote form posts to a Cloudflare Pages Function at `/api/quote`, which sends
the enquiry to Telegram. Configure these as encrypted Cloudflare Pages secrets:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
