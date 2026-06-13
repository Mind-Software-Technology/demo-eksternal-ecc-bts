# Technical Requirements Document (TRD)
## ECC-BTS — Pusat Kolaborasi Pendidikan (Demo Website)

| | |
|---|---|
| **Document** | Technical Requirements Document |
| **Product** | ECC-BTS Marketing Website (Demo) |
| **Version** | 1.0 |
| **Date** | 2026-06-13 |
| **Related** | See `PRD.md` for product requirements |
| **Author** | Development Team |

---

## 1. Purpose & Scope

This document describes the **technical implementation** of the ECC-BTS demo
marketing website defined in the PRD. The demo is a **static, client-side
single-page application (SPA)** with multiple routes. There is **no backend,
no database, and no API**; all content is hard-coded in data modules.

---

## 2. Technology Stack

| Layer | Choice | Reason |
|---|---|---|
| **Language** | JavaScript (ES2022, JSX) | Matches existing scaffold; no TS required for a demo. |
| **UI library** | React 19 | Existing scaffold; modern hooks & concurrent features. |
| **Build tool** | Vite 8 | Fast dev server (HMR) and optimized production build. |
| **Routing** | `react-router-dom` v7 | Client-side multi-page navigation. |
| **Animation** | `framer-motion` | Declarative scroll-reveal, transitions, gesture/hover motion. |
| **Icons** | `react-icons` | Large, consistent icon set (Feather/FontAwesome). |
| **Styling** | Plain CSS + CSS custom properties (design tokens) | No runtime cost; full control over modern visual effects. |
| **Linting** | ESLint (flat config, existing) | Code quality. |

> **No** state-management library (Redux/Zustand) is needed — local component
> state and static imports are sufficient for a demo.

### 2.1 Dependencies to add
```
npm install react-router-dom framer-motion react-icons
```

---

## 3. High-Level Architecture

```
Browser
  └── React SPA (Vite build, static hosting)
        ├── Router (BrowserRouter)
        │     ├── Layout (Navbar + <Outlet/> + Footer + FloatingWhatsApp + ScrollToTop)
        │     └── Routes: / , /produk , /kategori , /tentang , /kontak
        ├── Pages  (compose sections from components + data)
        ├── Components (presentational, reusable)
        └── Data  (static JS modules — single source of content truth)
```

- **Rendering:** Client-side rendering (CSR). No SSR required for a demo.
- **Data flow:** One-directional. Pages import from `src/data/*` and pass props
  down to presentational components. No global store.
- **No network calls.** The contact form resolves to a local success state.

---

## 4. Project Structure

```
demo-ecc-bts/
├── docs/
│   ├── PRD.md
│   └── TRD.md
├── index.html                 # title + meta description
├── vite.config.js
├── package.json
├── public/
│   └── (favicon, static assets)
└── src/
    ├── main.jsx               # createRoot + <BrowserRouter>
    ├── App.jsx                # <Routes> definition
    ├── styles/
    │   ├── index.css          # tokens, reset, base, utilities
    │   └── components.css      # shared component/page styles (or co-located)
    ├── data/
    │   ├── site.js            # brand, nav, contact, socials
    │   ├── services.js        # 6 services (id, slug, icon, title, desc, points, category)
    │   ├── categories.js      # category groups → service ids
    │   ├── advantages.js      # 4 "why choose us" items
    │   ├── stats.js           # animated counters
    │   ├── process.js         # how-it-works steps
    │   ├── testimonials.js    # static testimonials
    │   └── faq.js             # FAQ items
    ├── components/
    │   ├── layout/
    │   │   ├── Navbar.jsx
    │   │   ├── Footer.jsx
    │   │   ├── Layout.jsx
    │   │   ├── ScrollToTop.jsx
    │   │   └── FloatingWhatsApp.jsx
    │   ├── ui/
    │   │   ├── Reveal.jsx       # framer-motion scroll-reveal wrapper
    │   │   ├── SectionHeading.jsx
    │   │   ├── Button.jsx
    │   │   ├── Counter.jsx      # animated number
    │   │   └── ServiceCard.jsx
    │   └── sections/
    │       ├── Hero.jsx
    │       ├── ServicesGrid.jsx
    │       ├── WhyChooseUs.jsx
    │       ├── StatsBand.jsx
    │       ├── ProcessSteps.jsx
    │       ├── Testimonials.jsx
    │       └── CTABand.jsx
    └── pages/
        ├── Home.jsx
        ├── Products.jsx
        ├── Categories.jsx
        ├── About.jsx
        └── Contact.jsx
```

---

## 5. Data Model (Static)

All content is plain JS objects/arrays. Representative shapes:

```js
// services.js
{
  id: 'turnitin',
  slug: 'turnitin-parafrase',
  number: '01',
  title: 'Jasa Turnitin / Parafrase',
  tagline: 'Cek similarity & parafrase, akurat dan aman.',
  description: '...',
  points: ['Cek similarity Turnitin', 'Parafrase manual', 'Laporan hasil'],
  icon: 'FiCheckCircle',     // mapped to a react-icons component
  categoryId: 'integritas',
  accent: 'blue'             // drives gradient/accent color
}

// categories.js
{ id: 'integritas', title: 'Integritas & Kualitas Tulisan', desc: '...', serviceIds: ['turnitin','proofreading'] }

// advantages.js
{ icon: 'FiShield', title: 'Kualitas Terjamin', desc: '...' }

// stats.js
{ value: 1500, suffix: '+', label: 'Karya Ilmiah Selesai' }

// process.js
{ step: 1, title: 'Konsultasi', desc: '...' }

// testimonials.js
{ name: '...', role: 'Mahasiswa S1', text: '...', rating: 5 }

// faq.js
{ q: '...', a: '...' }

// site.js
{ brand, motto, tagline, valueWords[], whatsapp, phone, email, website, address, hours, nav[] }
```

Icons are referenced by string name and resolved through a small **icon map** so
data files stay free of JSX imports.

---

## 6. Routing

- `BrowserRouter` wraps the app in `main.jsx`.
- `App.jsx` defines a layout route rendering `<Layout/>` with nested routes:

| Path | Element | Document title |
|---|---|---|
| `/` | `Home` | ECC-BTS — Pusat Kolaborasi Pendidikan |
| `/produk` | `Products` | Produk & Layanan — ECC-BTS |
| `/kategori` | `Categories` | Kategori Layanan — ECC-BTS |
| `/tentang` | `About` | Tentang Kami — ECC-BTS |
| `/kontak` | `Contact` | Kontak — ECC-BTS |
| `*` | `NotFound` (redirect to `/`) | — |

- `ScrollToTop` resets scroll position on every route change.
- Per-page `document.title` is set via a small `usePageTitle` hook/effect.

> **Hosting note:** because of client-side routing, the static host must rewrite
> unknown paths to `index.html` (SPA fallback). For a pure static preview without
> rewrite support, `HashRouter` is an acceptable fallback.

---

## 7. Styling & Design System

### 7.1 Design Tokens (CSS custom properties)
```css
:root {
  /* Brand palette (from poster) */
  --c-navy-900:#06205c; --c-navy-800:#0a2c6b; --c-blue-700:#0b3aa0;
  --c-blue-500:#1e6bd6; --c-blue-400:#3b82f6;
  --c-red:#e11d2a; --c-orange:#f7941d; --c-green:#16a34a;
  --c-ink:#0f172a; --c-muted:#5b6b80; --c-bg:#ffffff; --c-soft:#f4f7fc;

  /* Gradients */
  --g-hero: linear-gradient(135deg,#06205c, #0b3aa0 55%, #1e6bd6);
  --g-accent: linear-gradient(135deg,#f7941d,#e11d2a);

  /* Radius / shadow / typography scale / spacing */
  --r-lg:22px; --shadow-card:0 18px 50px -20px rgba(6,32,92,.35);
  --font-sans:'Plus Jakarta Sans', system-ui, sans-serif;
}
```

### 7.2 Conventions
- **BEM-ish** class naming (`.navbar`, `.navbar__link`, `.card--blue`).
- Mobile-first media queries at ~640px, 900px, 1200px.
- Fonts loaded via Google Fonts `<link>` in `index.html` (Plus Jakarta Sans).
- Visual techniques: layered gradients, glassmorphism navbar (`backdrop-filter`),
  soft shadows, gradient borders, animated decorative blobs (CSS keyframes).

---

## 8. Animation Strategy (framer-motion)

| Pattern | Where | Implementation |
|---|---|---|
| **Scroll reveal** | All sections | `Reveal` wrapper: `whileInView` opacity/translate, `viewport={{ once:true }}`. |
| **Stagger** | Card grids | Parent `staggerChildren`, child `variants`. |
| **Hover lift** | Cards & buttons | `whileHover={{ y:-6 }}` + CSS transition. |
| **Page transition** | Route change | `AnimatePresence` + fade/slide on the layout outlet. |
| **Animated counters** | Stats band | `useInView` + `animate()` / requestAnimationFrame counting. |
| **Hero motion** | Home hero | Floating decorative shapes via `animate` loops. |

**Accessibility:** all motion is wrapped to respect `prefers-reduced-motion`
(reduced or disabled animations) and `viewport once` to avoid jank.

---

## 9. Component Responsibilities (selected)

- **Layout** — renders `Navbar`, `<Outlet/>`, `Footer`, `FloatingWhatsApp`,
  `ScrollToTop`, and page-transition wrapper.
- **Navbar** — sticky/glass, active link via `NavLink`, mobile drawer with state,
  closes on navigation, CTA button.
- **ServiceCard** — icon, number, title, tagline, points; accent-colored; hover
  animation; optional WhatsApp CTA.
- **Counter** — counts from 0 → target when scrolled into view.
- **Contact form** — controlled inputs, client-side validation, local success
  banner; **no fetch** (demo). A `wa.me` deep link is also provided as the real
  channel.

---

## 10. Non-Functional Implementation Notes

- **Responsive:** CSS grid/flex; fluid type with `clamp()`; tested at 360px–1440px.
- **Performance:** import only used icons; compress `hero.png`; framer-motion tree
  shaken by Vite; production build is code-split per route via `React.lazy`
  (optional) — for a small demo, eager imports are acceptable.
- **Accessibility:** semantic landmarks (`header/nav/main/footer`), `aria-label`
  on icon buttons, focus-visible styles, `alt` text, keyboard-operable menu.
- **SEO:** unique `document.title` per route + meta description in `index.html`.
- **Error handling:** unknown routes redirect to Home; external links use
  `rel="noopener noreferrer"` and `target="_blank"`.

---

## 11. Build, Run & Deploy

| Command | Purpose |
|---|---|
| `npm install` | Install dependencies. |
| `npm run dev` | Start Vite dev server with HMR. |
| `npm run lint` | Run ESLint. |
| `npm run build` | Produce optimized static bundle in `dist/`. |
| `npm run preview` | Serve the production build locally. |

**Deployment:** any static host (Netlify, Vercel, GitHub Pages, Nginx). Configure
SPA fallback (rewrite all routes → `/index.html`). No environment variables,
secrets, or server runtime required for the demo.

---

## 12. Risks & Assumptions

| Item | Note |
|---|---|
| Reference site (belajarriset.id) | Used only as a style/feel reference; not scraped or cloned. |
| Contact details | Placeholders from the poster; must be replaced before launch. |
| Static data | Acceptable for demo; a CMS/backend is required for production. |
| SPA routing on static host | Requires rewrite rule, else use `HashRouter`. |
| Brand assets | Logo recreated/styled from the poster; final vector logo to be supplied by client. |

---

## 13. Acceptance (Technical)

- `npm run build` succeeds with no errors and `npm run preview` serves all routes.
- No console errors on navigation across the five pages.
- Lighthouse: reasonable scores for a demo (performance/accessibility/best-practices).
- Content is editable solely by changing files under `src/data/`.
