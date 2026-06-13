# Product Requirements Document (PRD)
## ECC-BTS — Pusat Kolaborasi Pendidikan (Demo Website)

| | |
|---|---|
| **Document** | Product Requirements Document |
| **Product** | ECC-BTS Marketing Website (Demo) |
| **Client** | ECC-BTS — Pusat Kolaborasi Pendidikan |
| **Version** | 1.0 (Demo / Proof of Concept) |
| **Date** | 2026-06-13 |
| **Status** | Approved for build |
| **Author** | Development Team |

---

## 1. Overview

ECC-BTS (Pusat Kolaborasi Pendidikan — "Education Collaboration Center") is an
academic support brand that helps students, lecturers, and researchers produce
high-quality scholarly work. Its tagline is **"Solusi Tepat untuk Karya Ilmiah
Berkualitas"** ("The right solution for quality scientific work") built on three
promises: **Profesional, Cepat, Terpercaya** (Professional, Fast, Trustworthy).

This document defines the requirements for the **first deliverable**: a
**demo marketing website**. The demo's purpose is to let the client review the
look, feel, content structure, and user experience **before** any backend,
database, or transactional features are built.

### 1.1 Goals

1. Present ECC-BTS as a modern, credible, professional academic-services brand.
2. Clearly communicate the **six core services** and route visitors toward
   contacting the business (primarily via WhatsApp).
3. Deliver a **visually rich, animated, modern** experience that demonstrates
   front-end quality to the client.
4. Ship quickly with **static (hard-coded) content** — no database, no backend,
   no authentication.

### 1.2 Non-Goals (Out of Scope for the Demo)

- No database or server-side persistence.
- No real form submission / email delivery / CMS.
- No user accounts, login, payments, or order tracking.
- No live Turnitin/plagiarism integration or file upload processing.
- No multilingual switching (UI is Indonesian; documentation is English).

These may be planned for later phases but are explicitly excluded here.

---

## 2. Target Audience

| Persona | Description | Primary Need |
|---|---|---|
| **Undergraduate student** | Working on a thesis/skripsi, often time-pressured | Plagiarism check, paraphrasing, data analysis help |
| **Postgraduate / lecturer** | Needs journal publication & proofreading | Publication assistance, editing, book publishing |
| **Researcher / institution** | Produces research output regularly | Interactive media, statistical analysis, end-to-end support |

All personas are **Indonesian-speaking**, mostly browse on **mobile devices**,
and value **trust signals** (quality guarantee, confidentiality, experienced
team, on-time delivery).

---

## 3. Brand & Content

### 3.1 Identity
- **Name:** ECC-BTS — Pusat Kolaborasi Pendidikan
- **Motto:** Bersinergi • Berbagi • Berprestasi (Synergize • Share • Achieve)
- **Tagline:** Solusi Tepat untuk Karya Ilmiah Berkualitas
- **Value words:** Profesional • Cepat • Terpercaya

### 3.2 Core Services (from the client's poster)

| # | Service (Produk) | Short description |
|---|---|---|
| 1 | **Jasa Turnitin / Parafrase** | Similarity check & paraphrasing — accurate and safe. |
| 2 | **Jasa Pengolahan Data Statistik** | Accurate data analysis with easy-to-understand results. |
| 3 | **Jasa Publikasi Artikel Ilmiah** | Publication in national & international journals. |
| 4 | **Jasa Proofreading / Penyuntingan Jurnal** | Language, writing, and consistency improvement. |
| 5 | **Jasa Pembuatan Media Interaktif** | Interactive and engaging learning media. |
| 6 | **Jasa Penerbitan Buku / Self Publishing** | Publish your book easily and professionally. |

### 3.3 Service Categories (Kategori)
Services are grouped to help visitors browse by intent:
- **Integritas & Kualitas Tulisan** — Turnitin/Parafrase, Proofreading.
- **Analisis & Riset** — Pengolahan Data Statistik.
- **Publikasi & Penerbitan** — Publikasi Artikel Ilmiah, Penerbitan Buku.
- **Media & Pembelajaran** — Media Interaktif.

### 3.4 Trust / Advantages (Keunggulan)
- Kualitas Terjamin (Quality Guaranteed)
- Pengerjaan Tepat Waktu (On-time Delivery)
- Tim Ahli Berpengalaman (Experienced Expert Team)
- Kerahasiaan Terjamin (Confidentiality Guaranteed)
- 100% Komitmen Kualitas (100% Quality Commitment)

### 3.5 Contact Information (placeholder demo data)
- **WhatsApp / Phone:** 0822-1234-5678
- **Email:** emailanda@email.com
- **Website:** www.websiteanda.com

> All contact details are placeholders to be replaced with real data before launch.

---

## 4. Information Architecture / Pages

The site is a **multi-page** application with the following navigation
(navbar in Indonesian):

| Route | Menu label | Purpose |
|---|---|---|
| `/` | **Beranda** (Home) | Brand intro, hero, featured services, advantages, stats, process, testimonials, CTA. |
| `/produk` | **Produk** (Products) | Detailed presentation of all six services. |
| `/kategori` | **Kategori** (Categories) | Services grouped by category for easy browsing. |
| `/tentang` | **Tentang Kami** (About Us) | Company story, mission/vision, values, motto, team. |
| `/kontak` | **Kontak** (Contact) | Contact form (demo only), WhatsApp/email/phone, FAQ. |

---

## 5. Functional Requirements

### 5.1 Global
- **FR-1** A sticky, responsive navigation bar with the five menu items and a logo.
- **FR-2** A mobile hamburger menu that opens/closes a navigation drawer.
- **FR-3** A persistent **floating WhatsApp button** linking to `wa.me` with a
  pre-filled message.
- **FR-4** A **footer** with brand, quick links, services, contact info, and motto.
- **FR-5** **Scroll-to-top** behavior on route change and a scroll-to-top button.
- **FR-6** Active-link highlighting in the navbar based on the current route.

### 5.2 Beranda (Home)
- **FR-7** Hero section with tagline, value words, primary CTA ("Hubungi Kami")
  and secondary CTA ("Lihat Layanan"), plus animated visual background.
- **FR-8** Featured services grid (all six) with icons and short descriptions;
  each links to the Products page.
- **FR-9** "Why choose us" section presenting the four advantages.
- **FR-10** Animated statistics/counters (e.g., projects done, clients, journals).
- **FR-11** "How it works" process steps (e.g., Konsultasi → Pengerjaan →
  Revisi → Selesai).
- **FR-12** Testimonials section (static).
- **FR-13** Closing call-to-action band.

### 5.3 Produk (Products)
- **FR-14** Display all six services in detail: icon, title, description,
  bullet-point deliverables, and a per-service CTA to WhatsApp.
- **FR-15** Optional category filter/tabs to narrow the list.

### 5.4 Kategori (Categories)
- **FR-16** Display category cards; each lists the services it contains and links
  through to the relevant products.

### 5.5 Tentang Kami (About)
- **FR-17** Company narrative, mission & vision, motto, and core values.
- **FR-18** "Why us" / commitment section and (placeholder) team highlights.

### 5.6 Kontak (Contact)
- **FR-19** A contact form (name, email, service, message). On submit it shows a
  **client-side success state only** (no network call) — clearly a demo.
- **FR-20** Direct contact tiles: WhatsApp, email, phone, and operating hours.
- **FR-21** A short FAQ accordion.

---

## 6. Non-Functional Requirements

| ID | Requirement |
|---|---|
| **NFR-1 Visual quality** | Modern aesthetic: gradients, glassmorphism, depth, brand colors (navy blue, red, orange, green accents). |
| **NFR-2 Animation** | Smooth, tasteful motion: scroll-reveal, hover lift, animated counters, page transitions. Must not harm usability. |
| **NFR-3 Responsive** | Fully responsive for mobile, tablet, and desktop (mobile-first). |
| **NFR-4 Performance** | Fast first load; lazy-friendly assets; production build must succeed cleanly. |
| **NFR-5 Accessibility** | Semantic HTML, alt text, keyboard-operable menu, sufficient color contrast, respects `prefers-reduced-motion`. |
| **NFR-6 Maintainability** | Content lives in static data files so non-developers can update text easily. |
| **NFR-7 Browser support** | Latest Chrome, Edge, Firefox, Safari (desktop & mobile). |
| **NFR-8 SEO basics** | Meaningful page title, meta description, and per-page document titles. |

---

## 7. Success Criteria (Demo Acceptance)

1. All five pages render and navigate correctly on desktop and mobile.
2. All six services and the four advantages are presented accurately.
3. The design feels modern and animated, matching the brand colors from the poster.
4. The floating WhatsApp button and contact tiles open the correct external links.
5. `npm run build` completes with no errors; the site runs via `npm run preview`.
6. The client can review the demo and provide feedback for the next phase.

---

## 8. Future Phases (Indicative, Not in Demo)

- Real contact form with email/WhatsApp API and spam protection.
- CMS or admin panel to manage services, prices, and testimonials.
- Online ordering, file upload, payment, and order-tracking dashboard.
- Blog/articles section for SEO and education marketing.
- Multilingual (ID/EN) toggle and analytics integration.
