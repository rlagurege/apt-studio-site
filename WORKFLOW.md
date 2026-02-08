# APT Studio Site — Step-by-Step Workflow

Use this as your checklist. Complete each step in order; we can implement together as you go.

---

## Phase 1: Content & structure (get everything in place)

### Step 1 — Decide your main pages
- [ ] **Home** — Keep hero, crew, hours, location (already done)
- [ ] **About** — Add a new page: studio story, vibe, who you are
- [ ] **Artists** — Keep; each artist has a profile page (already done)
- [ ] **Gallery** — Add a new page: general portfolio or “best of” (optional: filter by artist/style)
- [ ] **FAQ** — Add a new page: common questions (booking, pricing, aftercare, etc.)
- [ ] **Appointments** — Keep booking form (already done)

**Your turn:** Check the boxes for pages you want. Add or remove pages from the list above if needed.

---

### Step 2 — Add the About page
- [ ] Create route: `src/app/about/page.tsx`
- [ ] Add “About” to the nav (`Nav.tsx`)
- [ ] Add content: headline, 1–2 paragraphs (you can paste draft text; we’ll style it later)

**Your turn:** Write a short “About the studio” blurb (or bullet points). Share it and we’ll put it on the page.

---

### Step 3 — Add the FAQ page
- [ ] Create route: `src/app/faq/page.tsx`
- [ ] Add “FAQ” to the nav
- [ ] Add content: 5–10 Q&As (booking, deposit, aftercare, styles, pricing, etc.)

**Your turn:** List the questions (and answers if you have them). We’ll format them as accordion or list.

---

### Step 4 — Add the Gallery page
- [ ] Create route: `src/app/gallery/page.tsx`
- [ ] Add “Gallery” to the nav
- [ ] Decide: one global gallery, or filter by artist (we can do both)
- [ ] Add content: pull from existing tattoo data or new image list

**Your turn:** Say if gallery is “all studio” or “by artist” (or both). Share image filenames/URLs or we use placeholder grid for now.

---

### Step 5 — Review navigation and footer
- [ ] Nav links match all new pages (Home, About, Artists, Gallery, FAQ, Appointments)
- [ ] Footer: add “About”, “FAQ”, “Gallery” if you want them in the footer too
- [ ] Optional: add “Book” or “Appointments” as a clear CTA in nav or hero

**Your turn:** Confirm nav order and which links should also appear in the footer.

---

## Phase 2: Full-website look (style it like a real site)

### Step 6 — Layout and width
- [ ] Optional full-width header band (logo + nav across the whole width)
- [ ] Main content: comfortable reading width (e.g. max-w-5xl or 6xl), centered
- [ ] Footer: full width, multi-column (e.g. Location | Hours | Contact | Links)

**Your turn:** No action; we implement in code.

---

### Step 7 — Hero and typography
- [ ] Hero: bigger type, optional background (image or pattern)
- [ ] Clear primary CTA button (“Book a session” or “Request appointment”)
- [ ] Consistent heading sizes and spacing across all pages

**Your turn:** If you have a hero image or brand font, share it; otherwise we use a strong default.

---

### Step 8 — Sections and spacing
- [ ] Each section has a clear heading and enough padding
- [ ] About, FAQ, Gallery pages use the same section style as Home
- [ ] Consistent borders or background tints so sections feel distinct

**Your turn:** No action; we implement.

---

### Step 9 — Footer and polish
- [ ] Footer columns: Location, Hours, Contact, Quick links (About, FAQ, Gallery, Appointments)
- [ ] Optional: social links, copyright, “Request appointment” link
- [ ] Final pass: contrast, focus states, any missing links

**Your turn:** Share any social links or extra footer text you want.

---

## Phase 3: Running smoothly (ready for mobile later)

### Step 10 — Content and links check
- [ ] Every nav link works
- [ ] Every internal link goes to the right page
- [ ] Phone, email, map link work
- [ ] Appointment form submits and (if set up) creates Notion row

**Your turn:** Click through the site and note anything broken or missing.

---

### Step 11 — Optional: simple CMS or data
- [ ] If FAQ/About change often: we can move copy to a file or Notion
- [ ] Gallery: if you’ll add images often, we can wire to a folder or data file

**Your turn:** Say if you want FAQ/About editable without code; we’ll pick the simplest option.

---

### Step 12 — Ready for mobile-app look
- [ ] All pages and content in place
- [ ] Site looks and reads like a full website
- [ ] Next: we edit the same pages to look like a mobile app (e.g. bottom nav, cards, mobile-first layout)

**Your turn:** When Phase 1–2 feel done, say “ready for mobile” and we’ll switch to the app-style design.

---

## Quick reference

| Phase   | Goal                          | You do                          | We do                          |
|--------|-------------------------------|----------------------------------|--------------------------------|
| 1      | All pages and content exist   | Decide pages, write copy, assets | Add routes, nav, structure     |
| 2      | Looks like a full website     | Share hero/font/social if any   | Layout, hero, sections, footer  |
| 3      | Running smoothly              | Test links and form             | Fix bugs, optional CMS         |
| Next   | Mobile-app look               | Confirm when ready              | Restyle for app experience     |

---

*Update this file as you complete steps (check the boxes). We’ll implement each step in the code as you go.*
