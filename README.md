# AusPlates Web

The official website for AusPlates - Australia's marketplace for personalised number plates.

**Live URL:** https://ausplates.app

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Payments:** Stripe (embedded checkout)
- **Auth:** Email/password + Apple Sign In
- **Hosting:** Vercel
- **API:** Hono backend on Render.com
- **Database:** Supabase (PostgreSQL)

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Environment Variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=https://ausplates.onrender.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm start
```

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage
│   ├── plates/            # Browse listings
│   ├── plate/[slug]/      # Listing detail
│   ├── create/            # Create listing wizard
│   ├── saved/             # Saved listings
│   ├── profile/           # User profile
│   ├── signin/            # Authentication
│   └── signup/
├── components/            # React components
│   ├── ListingCard.tsx
│   ├── PlatePreview.tsx
│   └── ...
├── lib/                   # Utilities
│   ├── api.ts            # API client
│   ├── auth.ts           # Auth utilities
│   └── auth-context.tsx  # Auth context provider
└── types/                 # TypeScript types
    └── listing.ts
```

---

## Key Features

| Feature | Route | Description |
|---------|-------|-------------|
| Browse Plates | `/plates` | Search and filter listings |
| View Listing | `/plate/[slug]` | Listing detail with contact |
| Create Listing | `/create` | 3-step wizard (Plan → Details → Pay) |
| Saved Plates | `/saved` | User's favourited listings |
| User Profile | `/profile` | Account management |

---

## Design System

- **Primary:** Australian Green `#00843D`
- **Accent:** Australian Gold `#FFCD00`
- **Font:** System fonts (SF Pro on Apple devices)

See `design-system.md` in the main repo for full specifications.

---

## Related Repositories

| Repo | Purpose |
|------|---------|
| [ausplates](https://github.com/CDemellis/ausplates) | API, Supabase schema, docs |
| [ausplates-ios](https://github.com/CDemellis/ausplates-ios) | iOS SwiftUI app |

---

## Deployment

Deployed automatically via Vercel on push to `main`.

### Production Checklist

- [x] Environment variables configured
- [x] Custom domain (ausplates.app)
- [x] Stripe live mode enabled
- [ ] Error tracking (Sentry)
- [ ] Analytics

---

## Documentation

- `docs/vic-plate-audit.md` - Victoria plate options reference
- `OUTSTANDING_TASKS.md` - Current TODO list

For full project documentation, see the main `ausplates` repo.
