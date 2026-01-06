# AusPlates Website - Outstanding Tasks

## Current Status

The website is live at https://ausplates.app with core functionality:
- Home page with hero, featured listings, browse by state
- Browse page with state/type filters and sorting
- State-specific pages (/plates/vic, /plates/nsw, etc.)
- Individual listing detail pages (/plate/[slug])
- SEO: sitemap, robots.txt, OG images, meta tags, JSON-LD
- Mobile-responsive design with mobile menu
- Connected to backend API at ausplates.onrender.com

---

## Priority 1: Essential Features

### Pagination
- [ ] Add pagination to `/plates` browse page (currently shows first 24 only)
- [ ] Add pagination to `/plates/[state]` pages
- [ ] Show total count and page numbers

### Search
- [ ] Add search bar to header
- [ ] Create search results page or integrate with browse page
- [ ] Search by plate combination text

### Legal Pages
- [ ] Privacy Policy page (`/privacy`)
- [ ] Terms of Service page (`/terms`)
- [ ] Add links to footer

---

## Priority 2: Polish & UX

### Loading States
- [ ] Add skeleton loaders for listing cards
- [ ] Add loading spinner for page transitions
- [ ] Suspense boundaries for async components

### Error Handling
- [ ] Custom 404 page (`/not-found.tsx`)
- [ ] Custom error page (`/error.tsx`)
- [ ] Better error states when API fails

### Favicon
- [ ] Create proper favicon.ico with AusPlates branding
- [ ] Add favicon-16x16.png, favicon-32x32.png
- [ ] Update /public with branded icons

---

## Priority 3: Additional Pages

### About Page
- [ ] `/about` - Company info, mission
- [ ] How it works section
- [ ] Team/contact info

### FAQ Page
- [ ] `/faq` - Common questions
- [ ] How to list a plate
- [ ] Pricing info
- [ ] Transfer process by state

### Contact/Support
- [ ] `/contact` or `/support`
- [ ] Contact form or support email
- [ ] Link to app for direct messaging

---

## Priority 4: Analytics & Monitoring

### Analytics
- [ ] Google Analytics 4 integration
- [ ] Google Search Console (verify domain)
- [ ] Submit sitemap to Google

### Error Monitoring
- [ ] Sentry integration for error tracking
- [ ] Performance monitoring

---

## Priority 5: Performance & Optimization

### Images
- [ ] Optimize listing photo loading (if photos added to API)
- [ ] Add blur placeholders for images
- [ ] Implement lazy loading

### Caching
- [ ] Review revalidation times for pages
- [ ] Consider ISR (Incremental Static Regeneration) tuning
- [ ] Add cache headers for static assets

### Core Web Vitals
- [ ] Run Lighthouse audit
- [ ] Optimize LCP (Largest Contentful Paint)
- [ ] Minimize CLS (Cumulative Layout Shift)

---

## Priority 6: Future Enhancements

### User Features (requires auth)
- [ ] Saved/favourite plates (web version)
- [ ] User profile pages
- [ ] Seller public profiles

### Advanced Filters
- [ ] Price range slider
- [ ] Multiple plate type selection
- [ ] Character length filter

### Notifications
- [ ] Email signup for new listings
- [ ] Price drop alerts (email)

---

## Technical Debt

- [ ] Remove unused Next.js default files from /public (globe.svg, file.svg, etc.)
- [ ] Add unit tests for components
- [ ] Add E2E tests with Playwright
- [ ] Set up CI/CD pipeline
- [ ] Add TypeScript strict mode checks
- [ ] Accessibility audit (WCAG 2.1)

---

## Deployment Checklist

- [x] Deploy to Vercel
- [x] Connect custom domain (ausplates.app)
- [x] Configure Cloudflare DNS
- [x] SSL certificate (auto via Vercel)
- [ ] Set up staging environment
- [ ] Configure environment variables in Vercel dashboard

---

## Notes

- Website is designed as SEO landing pages to drive iOS app downloads
- Full functionality (messaging, listing creation) is in the iOS app only
- Backend API: https://ausplates.onrender.com
- GitHub repo: https://github.com/CDemellis/ausplates-web
