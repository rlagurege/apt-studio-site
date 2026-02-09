e# APT Studio — Addictive Pain Tattoo

Website for **Addictive Pain Tattoo** (APT Studio) in Gloversville, NY. Artist profiles, portfolio, and appointment request form.

## What’s included

- **Home** — Intro + artist grid
- **Artists** — List and individual profiles (bio, specialties, portfolio, request link)
- **Appointments** — Booking request form + “How it works”
- **API** — `POST /api/appointment-request` (form + optional reference image; writes to `data/appointment_requests.jsonl`; optional email to Tammy via SMTP)

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment (optional)

Copy `.env.example` to `.env` and fill in values **only if** you want email notifications to Tammy when someone submits an appointment request:

- `TAMMY_EMAIL` — Where to send notifications
- `EMAIL_FROM` — Sender name/address
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — Your SMTP provider

If these are not set, requests are still saved to `data/appointment_requests.jsonl`; only the email step is skipped.

## Build & deploy

```bash
npm run build
npm run start
```

Deploy to [Vercel](https://vercel.com), Netlify, or any Node host. Set env vars in the dashboard if you use email. Uploaded reference images and the inbox file live on the server (`uploads/`, `data/`); use persistent storage or a DB in production if you need them to survive restarts.

## Add content

- **Logo** — Save the APT logo as `public/logo.png` (or `.svg`/`.webp` and set `logoPath` in `src/lib/site.ts`). If the file is missing, the nav shows the site name as text.
- **Artists** — Edit `src/content/artists.ts` (slug, name, role, bio, avatarUrl, specialties, social links).
- **Portfolio images** — Add images under `public/artists/` and `public/work/`, then add entries in `src/content/tattoos.ts` and reference `imageUrl: "/work/…"` etc.
