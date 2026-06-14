# Design System & Visual Direction
## ECC-BTS — Pusat Kolaborasi Pendidikan

| | |
|---|---|
| **Document** | Design System / Visual Direction |
| **Product** | ECC-BTS Marketing Website (Demo) |
| **Version** | 1.0 |
| **Date** | 2026-06-14 |
| **Related** | `PRD.md`, `TRD.md` |
| **Status** | Approved direction — replaces the current "tech-startup" look |

---

## 1. Design Philosophy — Editorial Academic

ECC-BTS is an **academic** brand, not a SaaS startup. Its visual identity must
feel like a **premium scholarly publisher** or a modern **academic press**, not
a generic AI-flavored landing page.

### 1.1 Three visual keywords

> **Editorial — Confident — Quiet.**

- **Editorial** — strong serif typography, baseline grid, hanging punctuation,
  generous whitespace, slightly asymmetric layouts that feel like book pages.
- **Confident** — only two anchor colors (midnight indigo + vanilla cream) plus
  one extremely sparing ember accent. Few colors equal a strong brand.
- **Quiet** — subtle motion, no neon glow, no rainbow gradients, no
  glassmorphism. The design speaks through type and space, not effects.

### 1.2 Mood references (for inspiration, not to copy)

- Publishers & journals: **Princeton University Press**, **MIT Press Reader**,
  **The Atlantic**, **Aeon Magazine**.
- Modern editorial: **Pitchfork redesign 2024**, **Are.na**, **Linear changelog
  long-form** (the long-form pages, not the marketing landing).
- Academic-but-warm: **Stripe Press** (for that paper-and-serif feel).

### 1.3 Anti-AI manifesto (forbidden)

Visual patterns that **must not appear** because they make the design feel
generic / AI-generated:

- ❌ Hero gradient navy → electric blue with glow.
- ❌ Headings with **text-gradients** (orange → red, blue → purple, etc.).
- ❌ Rounded colorful icon tiles (blue, green, purple, orange, teal, red) used
  together.
- ❌ Glassmorphism (`backdrop-filter: blur` + glowing border + semi-transparent
  bg).
- ❌ Decorative gradient blobs in corners (purple/pink/blue puddle).
- ❌ WhatsApp green button with **neon glow**.
- ❌ Center-stacked symmetric layout repeated section after section (eyebrow
  pill → giant H1 → 2-line subheading → 2 pill buttons).
- ❌ Generic AI stock avatars (smiling person in a tie) in testimonials.
- ❌ Gray Heroicons inside light-blue circles for the advantages section.
- ❌ Heavy bluish drop shadows (`0 20px 60px rgba(... , .35)`).
- ❌ Glowing borders / inner shadows that look like a "sci-fi card".

This list is repeated as a review gate in **§11. Anti-AI Checklist**.

---

## 2. Color System

### 2.1 Tokens

```css
:root {
  /* Primary */
  --c-indigo-900: #181E33;   /* Deeper midnight indigo, for extreme text/bg */
  --c-indigo-800: #212842;   /* Midnight Indigo — brand anchor */
  --c-indigo-700: #2C3457;   /* Hover / secondary dark surface */
  --c-indigo-500: #4A537A;   /* Medium indigo accent (rare) */

  /* Cream */
  --c-cream-50:  #FBF7EC;    /* Lightest surface */
  --c-cream-100: #F8F2E4;    /* Alternative surface / hover */
  --c-cream-200: #F0E7D5;    /* Vanilla Cream — brand anchor */
  --c-cream-300: #E4D8BF;    /* Subtle border / divider */
  --c-cream-400: #C8B894;    /* Strong border (rare) */

  /* Ink (indigo-derived, for text on cream) */
  --c-ink:        #0F1426;
  --c-muted:      #5B6478;
  --c-muted-soft: #8A92A6;

  /* Accent — use VERY sparingly (≤5% of the page) */
  --c-ember:     #C0623A;    /* Link hover, editorial underline, drop cap */
  --c-ember-ink: #8E4626;    /* Accent text on cream */

  /* Status (semantic only, not for decoration) */
  --c-success: #4F7A4A;      /* Olive green, not WhatsApp green */
  --c-danger:  #9B3434;      /* Brick red, not crimson */
}
```

### 2.2 Usage rules

| Context | Background | Body text | Accent |
|---|---|---|---|
| **Default page** | `--c-cream-200` | `--c-ink` | `--c-ember` (hover only) |
| **Card surface** | `--c-cream-50` | `--c-ink` | border `--c-cream-300` |
| **Hero, Footer, CTA band** | `--c-indigo-800` | `--c-cream-200` | `--c-ember` (drop cap, italic keyword) |
| **Section divider** | subtle gradient `--c-cream-200` → `--c-cream-100` (vertical) | — | — |

### 2.3 Contrast (WCAG AA minimum)

| Pairing | Ratio | Pass |
|---|---|---|
| `--c-ink` on `--c-cream-200` | ~14.6 : 1 | AAA |
| `--c-cream-200` on `--c-indigo-800` | ~12.4 : 1 | AAA |
| `--c-muted` on `--c-cream-200` | ~5.1 : 1 | AA |
| `--c-ember-ink` on `--c-cream-200` | ~5.4 : 1 | AA |

**Forbidden combination**: `--c-muted-soft` on `--c-cream-100` — ratio falls
below 4.5.

### 2.4 What is NOT in the palette

To keep brand discipline, the following colors are **not used** on the main
pages:

- Electric blue (`#1e6bd6`, `#3b82f6`, etc.) — REMOVED from the old TRD.
- Bright orange (`#f7941d`) — REMOVED, replaced by a single ember.
- WhatsApp brand green (`#25D366`) — only allowed as a tiny WhatsApp glyph
  inside the contact pill; never as a button background.

---

## 3. Typography

### 3.1 Font pairing

| Role | Family | Reason |
|---|---|---|
| **Display & headings** | **Fraunces** (Google Fonts, variable) | Modern serif with optical size — confident at hero scale and elegant at sub-display sizes. Conveys academic-press feel. |
| **Body & UI** | **Inter** (Google Fonts, variable) | Neutral grotesk, tall x-height, excellent on-screen legibility. |
| **Mono (rare)** | **JetBrains Mono** | Only for table figures, journal IDs, optional codes. |

Fallback stacks:

```css
--font-display: 'Fraunces', 'Source Serif Pro', Georgia, 'Times New Roman', serif;
--font-sans:    'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
--font-mono:    'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
```

Loading: use `<link rel="preconnect">` to Google Fonts and `display=swap`,
limited to the weights actually used (Fraunces 400/600 + opsz; Inter 400/500/600).

### 3.2 Type scale (mobile-first, fluid via `clamp`)

```css
--fs-display: clamp(2.6rem, 4.5vw + 1rem, 4.75rem);  /* Hero H1 */
--fs-h1:      clamp(2.1rem, 2.5vw + 1rem, 3.25rem);  /* Page H1 */
--fs-h2:      clamp(1.6rem, 1.6vw + 1rem, 2.25rem);
--fs-h3:      clamp(1.25rem, 0.8vw + 1rem, 1.5rem);
--fs-lead:    clamp(1.05rem, 0.4vw + 1rem, 1.2rem);  /* Sub-headline */
--fs-body:    1rem;
--fs-small:   0.875rem;
--fs-eyebrow: 0.78rem;
```

### 3.3 Typography rules

- **Display headings** → Fraunces, weight 500–600, **opsz** maxed
  (`font-variation-settings: "opsz" 144`), slightly negative tracking
  (`letter-spacing: -0.02em`).
- **Eyebrow** (short label above an H2) → Inter, uppercase, tracking `0.18em`,
  `font-size: var(--fs-eyebrow)`, color `--c-muted` or `--c-ember-ink`.
- **Editorial italic** → use to *emphasize a single word* in a heading (never an
  entire sentence). Example: "Solusi tepat untuk *karya ilmiah* yang
  berkualitas." — italicize only "karya ilmiah".
- **Drop cap** (optional, About page) → first letter of the opening paragraph
  in Fraunces 600, 4× body size, floated left, color `--c-ember-ink`.
- **Body line-height** → `1.65` for body, `1.15` for display, `1.35` for
  H2/H3.
- **Hanging punctuation** → enable on pull-quotes:
  `hanging-punctuation: first last;`.
- **No ALL CAPS** except eyebrows and nav. Buttons use sentence case
  ("Hubungi kami", not "HUBUNGI KAMI").

### 3.4 Hero treatment example (anti-AI)

**Old (too AI):**
```
Solusi Tepat untuk
[Karya Ilmiah]   ← giant orange-red gradient
[Berkualitas]    ← gradient continues
```

**New (editorial):**
```
Solusi tepat untuk
karya ilmiah                                      ← Fraunces 600, indigo, italic on these two words
yang berkualitas.                                 ← ends with a period, like a real sentence
```

Headings **end with a period**. No gradients. One italicized phrase max.

---

## 4. Spacing & Layout

### 4.1 Baseline grid

Use an **8px base** for all spacing and sizing.

```css
--space-1: 0.25rem;  /*  4px */
--space-2: 0.5rem;   /*  8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.5rem;   /* 24px */
--space-6: 2rem;     /* 32px */
--space-7: 3rem;     /* 48px */
--space-8: 4rem;     /* 64px */
--space-9: 6rem;     /* 96px */
--space-10: 8rem;    /* 128px */
```

### 4.2 Container & section rhythm

```css
--container-max: 1180px;
--container-pad: clamp(1.25rem, 4vw, 2.5rem);

--section-py-mobile: var(--space-9);   /* 96px */
--section-py-desktop: var(--space-10); /* 128px */
```

Vertical spacing between sections is always ≥ 96px on mobile and ≥ 128px on
desktop.

### 4.3 Asymmetric grid (anti AI-symmetry)

The hero and primary sections **do not** use a symmetric 50/50 layout.
Use a 12-column grid with uneven distribution:

```
Hero:        text 7/12 col   |   side-rule + meta 4/12 col   |  gutter 1/12
Services:    grid 12 col, cards span 4/4/4 on desktop, but
             every second row is offset 1 column to the right (editorial offset)
About:       text 7/12        |   pull-quote 5/12 (sticky)
Testimonials: pull-quote 8/12 |   attribution 4/12
```

Offsetting the second row gives a "book page" feeling instead of "uniform
cards".

### 4.4 Eyebrow rule (replaces the pill badge)

The eyebrow is not wrapped in a light-blue pill. Use a **short horizontal rule
+ uppercase eyebrow** instead:

```
———  PROFIL SINGKAT
Tentang ECC-BTS
```

This single change immediately removes the "blue pill badge" AI tell.

---

## 5. Iconography

### 5.1 Style

- **Stroke-only**, `1.5px` width, single color (`currentColor`).
- Default size `20px`. Max `28px`. No giant icons.
- **No colored tiles** behind icons. Icons sit directly on a cream surface in
  `--c-ink` or `--c-indigo-700`.
- Library: **Lucide** (consistent line, calmer than Feather/FontAwesome) or the
  `react-icons/lu` subset. Avoid `react-icons/fa` (too dense and generic).

### 5.2 Icon-free alternative (more editorial)

For Service Cards, replace colored icon tiles with **large editorial
numerals**:

```
01.   Jasa Turnitin / Parafrase
02.   Jasa Pengolahan Data Statistik
03.   Jasa Publikasi Artikel Ilmiah
04.   Jasa Proofreading / Penyuntingan
05.   Jasa Pembuatan Media Interaktif
06.   Jasa Penerbitan Buku
```

Numerals use Fraunces italic 700, 64px, in `--c-ember-ink` or
`--c-cream-300` (as a corner watermark).

### 5.3 Icons we still keep

- Functional UI: hamburger, close, chevron, arrow-up-right.
- Contact: phone, mail, map-pin, clock — line-only, mono.
- Social: Instagram, Facebook, TikTok, YouTube — line-only, **never the
  brand-colored logos**.

---

## 6. Surface, Texture & Elevation

### 6.1 Texture (paper grain)

A very subtle noise layer across the body for a paper feel:

```css
body::before {
  content: '';
  position: fixed; inset: 0;
  background-image: url('/textures/grain.png'); /* 200x200 noise PNG, 5% opacity */
  opacity: 0.05;
  mix-blend-mode: multiply;
  pointer-events: none;
  z-index: 1;
}
```

Alternative: inline SVG `<feTurbulence>` (lighter, zero requests).

### 6.2 Elevation

Forget the heavy blue drop shadows. Use **soft, warm, very subtle** shadows:

```css
--shadow-paper: 0 1px 0 rgba(33, 40, 66, 0.04),
                0 8px 24px -16px rgba(33, 40, 66, 0.18);
--shadow-press: 0 1px 0 rgba(33, 40, 66, 0.06),
                0 14px 40px -22px rgba(33, 40, 66, 0.28);
```

Card default: `--shadow-paper`. Card hover: `--shadow-press`.

### 6.3 Border

- Default card border: `1px solid var(--c-cream-300)`.
- Strong accent: `1px solid var(--c-indigo-800)` — for one "featured" card only.
- No gradient borders. No glowing borders.

### 6.4 Radius

```css
--r-xs: 4px;    /* tag, chip, micro */
--r-sm: 8px;    /* button, input */
--r-md: 12px;   /* card */
--r-lg: 18px;   /* hero panel */
--r-pill: 999px;/* mini badges only */
```

Avoid radii of 24px or more — they feel like "bubble apps". 12px is the
editorial sweet spot.

---

## 7. Components

### 7.1 Navbar

- **Background**: `--c-cream-50` solid (not glass).
- **Border-bottom**: `1px solid var(--c-cream-300)`.
- **Logo**: serif "E·B" monogram + "ECC-BTS" wordmark in Inter 600. Drop the
  orange-red book icon.
- **Links**: Inter 500, `--c-ink`. Active state: animated underline (see §8).
- **CTA "Hubungi Kami"**: `Outline-indigo` button — not neon green.
- **Mobile**: right-side sheet with `--c-cream-50` bg, 280ms slide.

### 7.2 Buttons

Three variants only:

| Variant | Bg | Text | Border | Hover |
|---|---|---|---|---|
| **Primary** | `--c-indigo-800` | `--c-cream-50` | none | bg `--c-indigo-700`, translateY -1px |
| **Outline** | transparent | `--c-indigo-800` | `1.5px solid --c-indigo-800` | bg `--c-indigo-800`, cream text |
| **Ghost link** | transparent | `--c-ember-ink` | none | underline grow |

- Padding: `0.875rem 1.5rem`.
- Radius: `--r-sm` (8px), not pill.
- Optional right icon (arrow), 16px, stroke-only.
- **No glow box-shadow.**

### 7.3 Service Card

```
┌────────────────────────────────────┐
│ 01.                          ↗     │ ← Fraunces italic numeral + arrow
│                                    │
│ Jasa Turnitin / Parafrase          │ ← Fraunces 600, 1.4rem
│                                    │
│ Cek similarity & parafrase,        │ ← Inter 400, --c-muted
│ akurat dan aman.                   │
│                                    │
│ ─────                              │ ← short rule
│                                    │
│ • Cek similarity resmi             │
│ • Parafrase manual oleh editor     │
│ • Laporan hasil & sertifikat       │
│                                    │
│ Selengkapnya  ↗                    │ ← ghost link, ember
└────────────────────────────────────┘
```

- Bg `--c-cream-50`, border `1px solid --c-cream-300`, radius 12px.
- Padding 32px desktop / 24px mobile.
- Hover: translateY -4px + press shadow + border `--c-indigo-800`.
- No icon tiles. No gradient. No colorful number watermark.

### 7.4 Hero (Beranda)

```
———  ECC-BTS  ·  Pusat Kolaborasi Pendidikan
                                                     ─────
Solusi tepat untuk                                   Profesional
karya ilmiah                                         ─────
yang berkualitas.                                    Cepat
                                                     ─────
Dari cek similarity, olah data,                      Terpercaya
hingga publikasi & penerbitan buku —                 ─────
kami dampingi karya ilmiah Anda.

[ Hubungi kami → ]   Lihat layanan
```

- Background: `--c-cream-200` (vanilla cream) — **not dark indigo**.
- Heading in Fraunces, with "karya ilmiah" italicized.
- Right rail: vertical stack of value words separated by short horizontal
  rules.
- No glassmorphism floating cards. No blobs.
- Motion: heading lines rise 8px and fade in (see §8).
- The stat band below the hero uses `--c-indigo-800` (a single dramatic
  contrast block, like a book cover).

### 7.5 Section heading

```css
.section-heading__eyebrow {
  font: 500 var(--fs-eyebrow)/1 var(--font-sans);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--c-muted);
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}
.section-heading__eyebrow::before {
  content: '';
  width: 32px; height: 1px;
  background: var(--c-muted);
}
.section-heading__title {
  font: 600 var(--fs-h2)/1.15 var(--font-display);
  color: var(--c-ink);
  letter-spacing: -0.02em;
  margin-top: 1rem;
  max-width: 22ch; /* keep titles short */
}
```

No pill badges. No gradient headings.

### 7.6 Stats / counter

- Bg: `--c-indigo-800` (single band).
- Numbers: Fraunces 600 italic, 4.5rem, color `--c-cream-200`.
- Labels: Inter 500, uppercase, tracking 0.16em, color `--c-cream-300`.
- Counter motion: 1.4s, easing `cubic-bezier(0.22, 0.61, 0.36, 1)`,
  triggered once via `useInView`.

### 7.7 Testimonial

Editorial pull-quote layout:

```
"
Tim ECC-BTS sangat membantu mempercepat publikasi
jurnal SINTA saya. Komunikasi jelas, hasil rapi,
dan tepat waktu.
"
                              — DR. RINI HARTANTI
                              Dosen, UIN Sunan Kalijaga
```

- Oversized opening quotation mark (Fraunces, 6rem, `--c-ember-ink`, opacity
  0.6).
- Body italic, Fraunces 400, `--fs-h3`.
- Attribution in Inter 500 uppercase tracking 0.14em + muted institution name.
- **No circular avatars**. Identity is carried by typography.
- Carousel: one dominant quote, prev/next as ghost buttons.

### 7.8 Footer

- Bg: `--c-indigo-800`.
- Primary text: `--c-cream-200`. Muted: `--c-cream-300` at 0.7 opacity.
- 4-column layout (Brand & motto / Navigation / Services / Contact),
  group-separating border-top `1px solid rgba(240,231,213,0.08)`.
- **No gradient blobs in the corners.** No glow.
- Social icons: line-only `--c-cream-200`, hover `--c-ember`.
- Bottom strip: small copyright + the "Bersinergi · Berbagi · Berprestasi"
  motto in Fraunces italic.

### 7.9 Floating contact (WhatsApp)

Replace the glowing green orb with a **horizontal pill**:

```
┌─────────────────────────────────┐
│  ✆  Chat WhatsApp               │
└─────────────────────────────────┘
```

- Bg: `--c-indigo-800`, text `--c-cream-50`.
- Icon: line `lu-message-circle` 18px (NOT the green WhatsApp logo).
- Pinned bottom-right with 24px margin.
- Hover: 2px lift, press shadow. No glow.
- Mobile: collapses to icon-only after scroll (still pill-shaped, never a
  circle).

### 7.10 FAQ accordion

- Border-bottom only (`1px solid var(--c-cream-300)`).
- No card container.
- Question: Inter 500, 1.05rem, `--c-ink`.
- Mono `+` / `−` icon, 16px, right aligned.
- Expand motion: height auto via framer `<motion.div>` with `layout`,
  280ms standard easing.

### 7.11 Contact form

- Field: bg `--c-cream-50`, border `1px solid --c-cream-300`, radius 8px.
- Focus: border `1.5px solid --c-indigo-800`, no glow.
- Label: above the field, Inter 500 0.875rem.
- Helper text: Inter 400 0.8rem `--c-muted`.
- Submit: Primary button, label "Kirim Pesan".
- Success state: cream-100 banner with line check icon, copy "Pesan tercatat
  (demo). Tim kami akan menghubungi via WhatsApp." — no confetti.

---

## 8. Motion System

### 8.1 Tokens

```css
--ease-standard: cubic-bezier(0.22, 0.61, 0.36, 1);
--ease-emphasis: cubic-bezier(0.16, 1, 0.3, 1);
--ease-out:      cubic-bezier(0.33, 1, 0.68, 1);

--dur-quick:  160ms;
--dur-base:   240ms;
--dur-medium: 480ms;
--dur-long:   720ms;
```

### 8.2 Motion patterns

| Pattern | Duration | Easing | Properties |
|---|---|---|---|
| **Fade-up reveal** | 720ms | emphasis | `opacity 0→1`, `y 12px→0` |
| **Stagger children** | 80ms delay | emphasis | per item |
| **Card hover lift** | 240ms | standard | `translateY -4px` + shadow swap |
| **Underline link** | 240ms | out | `scaleX 0→1` from left |
| **Counter** | 1400ms | emphasis | requestAnimationFrame |
| **Page transition** | 320ms | standard | opacity + 8px slide |
| **Accordion expand** | 280ms | standard | height auto |
| **Mobile drawer** | 280ms | emphasis | translateX 100%→0 |

### 8.3 Rules

- **Reveal once** (`viewport={{ once: true, margin: '-10% 0px' }}`).
- **Always** respect `prefers-reduced-motion`:

```jsx
const reduce = useReducedMotion();
const variants = reduce
  ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
  : { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition:{ duration:.72, ease:[.16,1,.3,1] }} };
```

- **No infinite loop animations** beyond hero floating decorations (and even
  those should be removed — the recommendation is **none at all**).
- **No 3D parallax tilt.** It is too trendy and AI-template-flavored.

### 8.4 Editorial micro-interactions

- **Underline link** grows from the left (240ms) — never from the center.
- **Hero heading** enters per-line (split-line stagger 80ms), not as one block.
- **Cursor** can be slightly enlarged over primary headings (optional, gated by
  fine-pointer feature detection).

---

## 9. Imagery & Illustration

### 9.1 Photo rules

- **No generic stock photos** (smiling people in suits, handshakes, etc.).
- When photography is required (e.g., About page): grayscale + indigo/cream
  duotone, e.g.:

```css
filter: grayscale(1) contrast(1.05);
mix-blend-mode: multiply; /* over a cream surface */
```

- Team photos: half-portrait crops with a large initial monogram beside them.

### 9.2 Illustrations

- Editorial line-art only (1.5px lines, `--c-ink` ink) — never colorful
  corporate illustrations (the "blob people" trope).
- Sources: hand-drawn or public-domain SVG from Smithsonian Open Access /
  Library of Congress (vintage maps, etchings, ornaments).

### 9.3 Editorial watermark

Hero and section headings may carry an oversized roman numeral in the
background (`I`, `II`, `III`) in Fraunces 700 italic, color `--c-cream-300`,
opacity 0.55, acting as a chapter divider. This is a direct nod to book design
and is strongly anti-AI.

### 9.4 Logo

- Temporary mark: "E·B" monogram — Fraunces 600, `--c-cream-50` inside a
  40px `--c-indigo-800` square, 6px radius. No orange-red book icon.
- Wordmark: "ECC-BTS" Inter 700 + the small tagline "Pusat Kolaborasi
  Pendidikan" in Inter 400 0.7rem, tracking 0.18em.

---

## 10. Per-Page Design Direction

### 10.1 Beranda (Home)
1. **Hero** — cream bg, serif headline with mixed italic, side rule of value
   words.
2. **Stats band** — indigo bg, oversized italic serif numbers.
3. **Featured services** — cream card grid with the second row offset.
4. **Why ECC-BTS** — list of 4 advantages in two-column layout (title left,
   description right), border-top per item.
5. **Process** — horizontal timeline numbered with roman numerals (I → IV).
6. **Testimonial** — one dominant quote, prev/next ghost nav.
7. **CTA band** — indigo bg, serif headline, one outline-cream primary button.

### 10.2 Produk (Products)
- Header: page title + 2-sentence lead.
- Category filter as **text tabs** with an active underline (no pills).
- Six detailed service cards as in §7.3, with the offset row pattern.
- End of page: a "Perlu kombinasi layanan?" section → WhatsApp CTA.

### 10.3 Kategori (Categories)
- Four large category cards in a 2×2 desktop layout.
- Each card: oversized roman numeral watermark (cream-300 background), serif
  title, list of included services (linking to /produk#slug).

### 10.4 Tentang (About)
- Hero: H1 + lead, no image.
- "Cerita kami" → editorial paragraph with an **ember drop cap** on the first
  letter.
- Mission & vision in two columns.
- Motto "Bersinergi · Berbagi · Berprestasi" as a large serif pull-quote.
- Team: monograms + names, never AI-style avatars.

### 10.5 Kontak (Contact)
- 50/50 two-column layout: form on the left, contact info on the right.
- Contact info: line icon + label, no card chrome.
- Operating hours as a mini table.
- FAQ below, accordion with border-bottom only.

---

## 11. Anti-AI Checklist (final review gate)

Every UI-touching PR **must pass this checklist**:

- [ ] No gradients on heading text.
- [ ] No navy → electric-blue gradient backgrounds.
- [ ] No glassmorphism (`backdrop-filter: blur` on card surfaces).
- [ ] No neon glow (saturated colored box-shadows).
- [ ] No multicolor icon tiles in service cards.
- [ ] No decorative gradient blobs in corners.
- [ ] No light-blue pill badges as eyebrows (use rule + uppercase instead).
- [ ] Primary headings use Fraunces, not Inter.
- [ ] WhatsApp button is not neon green — it is an indigo pill.
- [ ] No AI-stock testimonial avatars.
- [ ] Primary section layouts are not all 100% center-symmetric.
- [ ] Reveal animations fire once (`once: true`).
- [ ] `prefers-reduced-motion` is respected.
- [ ] Text contrast meets WCAG AA.

---

## 12. Accessibility & Contrast Notes

- Visible focus: `2px solid var(--c-ember)` outline with 2px offset on every
  interactive element. Never remove the default focus without a replacement.
- Minimum 44×44 px tap targets on mobile.
- Landmark hierarchy: `<header>` → `<main>` → `<footer>`. Every section has
  `aria-labelledby` pointing to its heading.
- Forms: explicit `<label>` (not placeholder-only), `aria-describedby` for
  helper / error text.
- A "Lewati ke konten" skip-link appears on first tab.
- Animations must not loop longer than 5s (no infinite hero loops, see §8.3).

---

## 13. Implementation Mapping

The CSS tokens above live in `src/styles/index.css` (root) and are referenced
by `base.css`, `components.css`, and `pages.css` already present in the
codebase.

| Token group | Target file |
|---|---|
| Color, radius, shadow, motion, container | `src/styles/index.css` (`:root`) |
| Reset, base, typography defaults | `src/styles/base.css` |
| Reusable components (button, card, eyebrow, section) | `src/styles/components.css` |
| Per-page variations (hero, stats band, etc.) | `src/styles/pages.css` |

### 13.1 Migration from the old design

1. Remove tokens `--c-blue-*`, `--c-orange`, `--c-red`, `--g-hero`, `--g-accent`.
2. Remove classes `.glass`, `.gradient-text`, `.blob-*`, `.glow-*` if present.
3. Switch heading `--font-sans` → `--font-display` (Fraunces) in `Hero`,
   `SectionHeading`, `StatCounter`, `Testimonial`.
4. Service card: drop the colored `accent` prop; replace with the editorial
   `number`.
5. Floating WhatsApp: refactor `<a class="fab-circle">` into
   `<a class="pill-contact">` with a line icon.
6. Update `data/site.js` — drop the per-service color `accent` if no longer
   used (or repurpose it as a very subtle sub-accent on the number watermark).

### 13.2 New assets required

- `/public/textures/grain.png` — 200×200 noise, 5% opacity (or inline SVG).
- Fraunces and Inter fonts via Google Fonts `<link>` in `index.html`.
- "E·B" monogram logo as SVG.

---

## 14. Acceptance (Design)

- Default pages render on `--c-cream-200`; hero and footer on
  `--c-indigo-800`.
- No element violates the Anti-AI Checklist (§11).
- Display headings use Fraunces (variable, opsz active).
- All animations honor `prefers-reduced-motion`.
- Lighthouse Accessibility ≥ 95 on Beranda and Kontak.
- The client recognizes the brand as "academic press / scholarly" rather than
  "tech startup AI".
