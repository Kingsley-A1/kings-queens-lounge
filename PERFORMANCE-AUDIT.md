# Kings & Queens Restaurant — Technical Audit Report

**Date:** April 8, 2026  
**Scope:** Performance, Weight Reduction, Mobile Responsiveness, Colour Consistency & Hierarchy  
**Status:** Pre-production prototype

---

## Executive Summary

The prototype is visually ambitious and structurally coherent, but it ships with **88 MB of assets**, two monolithic CSS files totalling **184 KB / 9,222 lines**, and a cursor-glow animation that runs a 60 fps `requestAnimationFrame` loop for the entire lifetime of every page visit. On a mid-range mobile device on a 4G connection, the homepage will likely score below 30 on Lighthouse Performance. Every issue below is specific, actionable, and references the exact file and line.

---

## 1. Critical — Image Weight (84.3 MB)

The single largest problem. The `assets/images/` folder is **84.3 MB**, making the deployed site effectively unloadable on any real-world mobile connection.

### 1.1 Avatar / Portrait Images — 6–7 MB Each (PNG)

| File                             | Size    |
| -------------------------------- | ------- |
| `assets/images/avatar_mary.png`  | 6.85 MB |
| `assets/images/avatar_sarah.png` | 6.70 MB |
| `assets/images/avatar_ada.png`   | 6.63 MB |
| `assets/images/emeka.png`        | 6.60 MB |
| `assets/images/avatar_emeka.png` | 6.42 MB |
| `assets/images/mary.png`         | 6.24 MB |
| `assets/images/avatar_john.png`  | 6.21 MB |
| `assets/images/peter.png`        | 6.09 MB |
| `assets/images/grace.png`        | 5.79 MB |
| `assets/images/chef_ada.png`     | 5.66 MB |
| `assets/images/chef_john.png`    | 5.63 MB |

**Root cause:** These are uncompressed, full-resolution PNG exports. Testimonial avatars are rendered as 64–80 px circles on screen.

**Fix:**

- Re-export all avatar/portrait images at 200×200 px, saved as **WebP at 80% quality**. Target: ≤ 15 KB each.
- Use `<picture>` with a PNG fallback for Safari compatibility:

```html
<!-- index.html — testimonial avatar, currently line ~660 -->
<picture>
  <source srcset="assets/images/avatar_ada.webp" type="image/webp" />
  <img
    src="assets/images/avatar_ada.png"
    alt="Ada O."
    class="testimonial-avatar"
    loading="lazy"
    width="64"
    height="64"
  />
</picture>
```

### 1.2 Food / Category Images — ~700–985 KB Each (PNG)

| File                                | Size   |
| ----------------------------------- | ------ |
| `assets/images/bread_category.png`  | 985 KB |
| `assets/images/sourdough_bread.png` | 918 KB |
| `assets/images/hero_background.png` | 908 KB |
| `assets/images/pizza.png`           | 895 KB |
| (+ 15 more in the same range)       | —      |

**Fix:**

- Convert all food/category images to **WebP**. At equivalent perceptual quality, WebP reduces PNG size by 60–80%. Target: ≤ 120 KB per food image.
- Use `srcset` for responsive sizes:

```html
<!-- index.html — category image, currently ~line 350 -->
<img
  srcset="
    assets/images/bread_category-400.webp 400w,
    assets/images/bread_category-800.webp 800w
  "
  sizes="(max-width: 640px) 45vw, 300px"
  src="assets/images/bread_category.png"
  alt="Main Courses"
  loading="lazy"
  width="400"
  height="300"
/>
```

### 1.3 Hero Slideshow — 2070 px Wide Unsplash Images on Mobile

In `index.html` (~lines 178–186), slides 2 and 3 load Unsplash images at hardcoded `w=2070`:

```html
style="background-image:
url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?...&w=2070&q=80');"
```

A mobile device at 390 px wide downloads a 2070 px image. Unsplash supports dynamic resizing via URL parameters.

**Fix:**  
Replace the inline style with a `<picture>` or use Unsplash's responsive parameters and move the background-image to CSS with a media query:

```css
/* styles.css — hero slide 2 */
.hero-slide:nth-child(2) {
  background-image: url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=75");
}
@media (min-width: 1024px) {
  .hero-slide:nth-child(2) {
    background-image: url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=80");
  }
}
```

### 1.4 LCP Image Not Preloaded

`hero_background.png` is the Largest Contentful Paint (LCP) element. It is loaded via a CSS `background-image`, which is not discovered by the browser until the CSS is parsed — introducing a critical delay.

**Fix:** Add a `<link rel="preload">` in the `<head>` of every page that uses the hero:

```html
<!-- index.html — add inside <head>, after line 34 -->
<link
  rel="preload"
  as="image"
  href="assets/images/hero_background.webp"
  type="image/webp"
  fetchpriority="high"
/>
```

### 1.5 PDF Committed to Web Assets

`assets/icons/som.pdf` (1.2 MB) is a non-web asset sitting inside the `icons/` folder. It will be deployed publicly to Netlify.

**Fix:** Remove from the repository. Add to `.gitignore` if it should stay locally:

```
# .gitignore — add this line
assets/icons/*.pdf
```

---

## 2. Critical — CSS Weight & Architecture

### 2.1 `components.css` is 124.9 KB / 6,440 Lines

This is the largest single code file in the project. A CSS file of this size on a restaurant website is not justifiable. It defines animations, keyframes, hero styles, product card styles, button variants, modal styles, toast styles, and more — all interlocked, with no ability to tree-shake unused rules.

**Immediate actions:**

1. **Split by page responsibility.** Extract styles only used on `menu.html`, `gallery.html`, `cart.html`, `checkout.html`, and `events.html` into page-specific CSS files. Load each file only on the page that needs it:

```html
<!-- menu.html — only load menu-specific styles -->
<link rel="stylesheet" href="styles/styles.css" />
<link rel="stylesheet" href="styles/menu.css" />
```

2. **Remove unused CSS.** Run Chrome DevTools Coverage audit (Ctrl+Shift+P → "Show Coverage") — expect 60–75% of `components.css` to be flagged as unused on any given page.

3. **Merge or delete the animation keyframe duplication.** `@keyframes fadeInUp`, `@keyframes fadeIn`, `@keyframes scaleIn` are defined in `components.css` (~lines 22–130). `styles.css` has additional animation classes that reference these same keyframes. Consolidate all keyframes into one location.

### 2.2 Google Fonts `@import` Inside CSS — Double Render Block

`styles.css` line 8:

```css
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap");
```

This creates a **blocked request chain**: HTML → styles.css download → Google Fonts CSS → font file downloads. The browser cannot start rendering text until all of this resolves.

`index.html` already has the correct `<link rel="preconnect">` tags (lines 31–33), but the `@import` in CSS negates this.

**Fix:** Delete the `@import` from `styles.css` line 8. Add the font `<link>` tags directly in `<head>` of every HTML page, with `font-display: swap` implied by the `display=swap` parameter already in the URL — which `index.html` already does via preconnect. The full fix for each page `<head>`:

```html
<!-- Add to <head> of all HTML pages, replacing the @import in styles.css -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Outfit:wght@400;500;600;700&family=Inter:wght@400;500&display=swap"
  rel="stylesheet"
/>
```

Also note: three font families are loaded at 5–6 weights each. **Reduce to the minimum needed.** Playfair Display only needs `400;700`. Outfit needs `500;600`. Inter needs `400;500`. This alone reduces the font payload by ~40%.

### 2.3 Duplicate `.product-card` Definition in Both Files

`.product-card` is defined in **both** `styles.css` (~lines 1320–1370) and `components.css` (~lines 258–350) with different property values. The cascade silently picks one definition. This creates unpredictable styling and makes refactoring dangerous.

**Fix:** Keep `.product-card` and all its child selectors exclusively in `components.css`. Remove the duplicate block from `styles.css`.

### 2.4 `body::before` Fixed Radial Gradient — Permanent Compositing Layer

`styles.css` ~lines 253–268:

```css
body::before {
  content: "";
  position: fixed;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(
      ellipse at 20% 0%,
      rgba(212, 175, 55, 0.08) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse at 80% 100%,
      rgba(196, 30, 58, 0.05) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse at 50% 50%,
      rgba(212, 175, 55, 0.02) 0%,
      transparent 80%
    );
  pointer-events: none;
  z-index: -1;
}
```

A `position: fixed` element must be composited on every scroll repaint. This is virtually invisible (opacity 2–8%) but forces a GPU compositing layer on every page at all times, degrading scroll performance on low-end devices.

**Fix:** Replace with a `position: absolute` on the `<body>` itself, or convert to a static `background` property on `body` if the gradient doesn't need to track viewport position:

```css
/* styles.css — replace body::before with static body background */
body {
  background-color: var(--sf-bg);
  background-image:
    radial-gradient(
      ellipse at 20% 0%,
      rgba(212, 175, 55, 0.06) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse at 80% 100%,
      rgba(196, 30, 58, 0.04) 0%,
      transparent 50%
    );
  background-attachment: local;
}
```

---

## 3. Critical — JavaScript Performance

### 3.1 Permanent `requestAnimationFrame` Loop — Cursor Glow

`scripts/animations.js` lines ~317–360, function `initCursorGlow()`:

```js
function animateGlow() {
  glowX = lerp(glowX, mouseX, 0.1);
  glowY = lerp(glowY, mouseY, 0.1);
  glow.style.left = `${glowX}px`;
  glow.style.top = `${glowY}px`;
  requestAnimationFrame(animateGlow); // ← runs forever, 60fps
}
animateGlow();
```

This loop **never stops**. It fires 60 times per second from page load until the tab is closed, even when the cursor is stationary. It also forces style recalculation on every frame (`style.left`, `style.top` are layout-triggering properties).

**Fix:** Use `transform: translate()` instead of `left/top` (compositor-only, no layout), and stop the loop when inactive:

```js
// scripts/animations.js — replace initCursorGlow
function initCursorGlow() {
  if (window.matchMedia("(hover: none)").matches) return;

  const glow = document.createElement("div");
  glow.className = "cursor-glow";
  document.body.appendChild(glow);

  let mouseX = 0,
    mouseY = 0;
  let glowX = 0,
    glowY = 0;
  let rafId = null;
  let isMoving = false;

  function animateGlow() {
    glowX = lerp(glowX, mouseX, 0.1);
    glowY = lerp(glowY, mouseY, 0.1);
    glow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%, -50%)`;

    const delta = Math.abs(glowX - mouseX) + Math.abs(glowY - mouseY);
    if (delta > 0.5) {
      rafId = requestAnimationFrame(animateGlow);
    } else {
      rafId = null; // stop when settled
    }
  }

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    glow.style.opacity = "1";
    if (!rafId) rafId = requestAnimationFrame(animateGlow);
  });

  document.addEventListener("mouseleave", () => {
    glow.style.opacity = "0";
  });
}
```

Also move the inline `cssText` block to a CSS class in `components.css` (reducing JS-managed styles).

### 3.2 All Scripts Load on Every Page

Every HTML page loads `animations.js` (19.1 KB), `main.js` (7.3 KB), `products.js` (8.8 KB), `pwa.js` (7 KB), and `modal.js` (5.1 KB) regardless of whether those features exist on that page. `products.js` is only needed on `menu.html` and `index.html`. `checkout.js` is only needed on `checkout.html`.

**Fix:** Add scripts conditionally per page. The quickest low-risk approach without a bundler is to use `type="module"` with dynamic imports, or more simply, only `<script>` tag the scripts that are relevant:

```html
<!-- menu.html — only load what's needed -->
<script src="scripts/main.js" defer></script>
<script src="scripts/animations.js" defer></script>
<script src="scripts/products.js" defer></script>
<script src="scripts/menu.js" defer></script>
```

```html
<!-- index.html — no products.js needed if product cards are static -->
<script src="scripts/main.js" defer></script>
<script src="scripts/animations.js" defer></script>
<script src="scripts/pwa.js" defer></script>
```

Verify all `<script>` tags use `defer` (not just `type="module"`). Currently none of the `<script>` tags reviewed use `defer`, meaning they block HTML parsing.

### 3.3 Hero Slideshow — `will-change` on All Slides

`styles.css` ~line 1043:

```css
.hero-slide {
  will-change: opacity, transform;
}
```

`will-change` is applied to **all** three slides, not just the currently transitioning one. Each `will-change` tells the browser to allocate a separate GPU compositing layer. Three layers = 3× GPU memory for the hero section.

**Fix:**

```css
/* styles.css — remove will-change from the base rule */
.hero-slide {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transform: scale(1.1);
  transition:
    opacity 1.5s ease-in-out,
    transform 8s ease-out;
}

/* Only promote the active slide */
.hero-slide.active {
  will-change: opacity, transform;
  opacity: 1;
  transform: scale(1);
}
```

### 3.4 `products.js` Contains Sunflour Bakery Data (Incorrect Brand)

`scripts/products.js` lines 1–306 define a product catalog with bakery items (bread, croissants, cakes), bakery-style prices (₦350–₦5,000), and comments reading `// === BREADS ===`. The restaurant's index.html features items like "Royal Grilled Ribeye" at ₦18,500 and "Lobster Thermidor" at ₦24,000.

This is leftover data from a previous **Sunflour Bakery** project. If `products.js` drives any rendered content, it will display incorrect products under the Kings & Queens brand.

**Fix:** Either replace `products.js` with a Kings & Queens restaurant menu data file, or remove it and define product/menu data inline in `menu.js`.

### 3.5 `netlify.toml` Has No Performance Headers

`netlify.toml` contains only redirect rules and no HTTP caching, compression, or security headers.

**Fix:** Add the following to `netlify.toml`:

```toml
# netlify.toml

[[headers]]
  for = "/assets/images/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/styles/*"
  [headers.values]
    Cache-Control = "public, max-age=86400"

[[headers]]
  for = "/scripts/*"
  [headers.values]
    Cache-Control = "public, max-age=86400"

[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"

[build.processing]
  skip_processing = false

[build.processing.css]
  bundle = true
  minify = true

[build.processing.js]
  bundle = true
  minify = true

[build.processing.html]
  pretty_urls = true

[build.processing.images]
  compress = true
```

---

## 4. High — Mobile First Violations

The CSS header comments claim "MOBILE-FIRST" but the stylesheet is authored **desktop-first**: base rules target large viewports, then `max-width` queries scale down. True mobile-first uses `min-width` queries to scale up.

### 4.1 Section Padding is 8rem on Mobile

`styles.css` ~line 399:

```css
section {
  padding: var(--sf-space-5xl) 0; /* = 8rem top and bottom */
}
```

`--sf-space-5xl: 8rem` = 128px on mobile. This is excessive and leaves very little visible content on small screens.

**Fix:**

```css
/* styles.css — mobile-first section padding */
section {
  padding: 3rem 0; /* mobile base */
}

@media (min-width: 768px) {
  section {
    padding: 5rem 0;
  }
}

@media (min-width: 1024px) {
  section {
    padding: var(--sf-space-5xl) 0; /* original 8rem only on desktop */
  }
}
```

### 4.2 Duplicate Navigation `<ul>` in the DOM

`index.html` lines ~135–168 define **two separate `<ul>` elements** inside the same `<nav>`:

- `.nav-desktop-only` — 9 links
- `.nav-mobile-only` — 15 links (includes utility links: verify, logout, privacy, terms)

Both exist in the DOM at all times. CSS hides one or the other. This means:

- Screen readers announce both lists
- `querySelectorAll('a')` in `main.js` binds click handlers to both sets of links
- The DOM carries 24 anchor nodes where 9–15 are needed

**Fix:** Maintain a single `<ul>` with all necessary links. Use CSS to conditionally hide utility links on desktop:

```html
<!-- index.html — single unified nav list -->
<nav id="mainNav" class="main-nav" aria-label="Main navigation">
  <ul>
    <li><a href="index.html" aria-current="page">Home</a></li>
    <li><a href="menu.html">Menu</a></li>
    <li><a href="about.html">About</a></li>
    <li><a href="reservations.html">Reservations</a></li>
    <li><a href="events.html">Events</a></li>
    <li><a href="gallery.html">Gallery</a></li>
    <li><a href="blog.html">Blog</a></li>
    <li><a href="contact.html">Contact</a></li>
    <li><a href="cart.html">Cart</a></li>
    <li class="nav-utility"><a href="login.html">Login</a></li>
    <li class="nav-utility"><a href="register.html">Register</a></li>
  </ul>
</nav>
```

```css
/* styles.css */
.nav-utility {
  display: none;
}

@media (max-width: 900px) {
  .nav-utility {
    display: list-item;
  }
}
```

### 4.3 Hero Feature Pills Stack Vertically on Mobile — Full Width

`styles.css` ~lines 1240–1262. The `.hero-features` changes to `flex-direction: column` on mobile, which causes the three feature pills ("Fine Dining", "Craft Cocktails", "Live Entertainment") to each span full width. This looks unintentional and breaks the compact badge aesthetic.

**Fix:**

```css
/* styles.css — hero features mobile */
@media (max-width: 768px) {
  .hero-features {
    flex-direction: row; /* keep horizontal */
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }

  .hero-feature {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }
}
```

### 4.4 Hero CTA Buttons Stack Correctly, But Are Too Wide on Mobile

`styles.css` ~line 1225:

```css
@media (max-width: 768px) {
  .hero-ctas {
    flex-direction: column;
    align-items: center;
  }
}
```

And in `components.css` ~line 200:

```css
@media (max-width: 480px) {
  .btn {
    width: 100%;
    justify-content: center;
  }
}
```

A 100% width button inside a `flex-direction: column` container that is centred inside a `max-width: 800px` div will render as full-viewport-width on a phone if the parent container has no explicit `max-width` constraint. Add:

```css
/* styles.css */
@media (max-width: 768px) {
  .hero-ctas {
    flex-direction: column;
    align-items: stretch;
    max-width: 320px;
    margin-left: auto;
    margin-right: auto;
  }
}
```

### 4.5 Touch Target — Hero Dot Buttons Are 12×12 px

`styles.css` ~line 1070:

```css
.hero-dot {
  width: 12px;
  height: 12px;
}
```

The minimum recommended tap target size is 44×44 px (Apple HIG) or 48×48 px (Material). A 12 px dot is impossible to tap accurately on a phone.

**Fix:** Keep the visual size but expand the interactive area:

```css
.hero-dot {
  width: 12px;
  height: 12px;
  /* Expand tap target without changing visual size */
  padding: 16px;
  margin: -16px;
}
```

### 4.6 Google Maps `<iframe>` Loads Eagerly on Every Page Visit

`index.html` ~line 1010. The Google Maps embed is loaded unconditionally, adding ~500 KB of JS and multiple network requests the moment the page loads, even though the map is near the bottom of a long page.

**Fix:** Use a static map image placeholder and load the iframe only on user interaction:

```html
<!-- index.html — lazy-load the map -->
<div class="location-map-container">
  <img
    src="assets/images/map-placeholder.webp"
    alt="Map showing Kings & Queens location in Calabar"
    class="map-placeholder"
    loading="lazy"
    width="600"
    height="400"
  />
  <button
    class="btn btn-outline map-load-btn"
    aria-label="Load interactive map"
  >
    Show on Map
  </button>
</div>
```

```js
// scripts/main.js — add after DOMContentLoaded
const mapBtn = document.querySelector(".map-load-btn");
if (mapBtn) {
  mapBtn.addEventListener(
    "click",
    function () {
      const container = this.closest(".location-map-container");
      const iframe = document.createElement("iframe");
      iframe.src = "https://www.google.com/maps/embed?pb=...";
      iframe.width = "100%";
      iframe.height = "400";
      iframe.style.border = "0";
      iframe.style.borderRadius = "16px";
      iframe.setAttribute("allowfullscreen", "");
      iframe.setAttribute("loading", "lazy");
      container.replaceChildren(iframe);
    },
    { once: true },
  );
}
```

---

## 5. High — Colour Inconsistency & Hierarchy

### 5.1 Stale Naming Convention Prefix: `--sf-*` Throughout

The `:root` in `styles.css` (~lines 14–170) uses a mixed naming convention:

- `--kq-gold`, `--kq-gold-light`, `--kq-gold-dark` — Kings & Queens brand tokens (correct)
- `--sf-red`, `--sf-bg`, `--sf-white`, `--sf-cream`, `--sf-purple`, `--sf-teal` — Sunflour Bakery tokens (wrong brand)

The `--sf-*` prefix is a direct copy from a previous bakery project. These tokens appear hundreds of times across both CSS files, so a mass-rename is required.

**Fix:** Perform a global search-and-replace throughout `styles.css` and `components.css`:

| Current token      | Rename to          |
| ------------------ | ------------------ |
| `--sf-bg`          | `--kq-bg`          |
| `--sf-bg-light`    | `--kq-bg-light`    |
| `--sf-bg-card`     | `--kq-bg-card`     |
| `--sf-bg-elevated` | `--kq-bg-elevated` |
| `--sf-red`         | `--kq-red`         |
| `--sf-red-dark`    | `--kq-red-dark`    |
| `--sf-red-light`   | `--kq-red-light`   |
| `--sf-orange`      | `--kq-orange`      |
| `--sf-white`       | `--kq-white`       |
| `--sf-cream`       | `--kq-cream`       |
| `--sf-glass`       | `--kq-glass`       |
| `--sf-shadow-*`    | `--kq-shadow-*`    |
| `--sf-gradient-*`  | `--kq-gradient-*`  |
| `--sf-space-*`     | `--kq-space-*`     |
| `--sf-radius-*`    | `--kq-radius-*`    |
| `--sf-ease-*`      | `--kq-ease-*`      |

Also remove unused tokens: `--sf-purple`, `--sf-purple-light`, `--sf-teal`, `--sf-teal-light`, `--sf-gradient-purple`, `--sf-gradient-teal` — these colours do not appear to be used anywhere in the visible UI and add confusion.

### 5.2 `theme-color` Value Does Not Match `--kq-gold`

`index.html` line ~24: `<meta name="theme-color" content="#d4af37">`  
`manifest.json` line 8: `"theme_color": "#d4af37"`  
`styles.css` line 18: `--kq-gold: #ffc942;`

Three different hex values for "gold":

- `#d4af37` — classic antique gold (meta/manifest)
- `#ffc942` — bright yellow-gold (CSS primary token)
- `#e6a800` — amber (--kq-gold-dark)

**Fix:** Decide on one canonical gold. `#ffc942` is used most pervasively in the UI. Update meta and manifest to match:

```html
<!-- index.html line 24 -->
<meta name="theme-color" content="#ffc942" />
```

```json
// manifest.json line 8
"theme_color": "#ffc942"
```

### 5.3 Section Badge Colour Has No Consistent Logic

Every `.section-badge` across the homepage uses `var(--sf-red)` (bright coral red) by default (`styles.css` ~line 405). However, the brand primary is gold. Red is used as an accent for urgency/promo (e.g., product badges for "Popular" items). Using red for informational section labels ("The Experience", "Our Menu", "Reviews", "Our Impact") creates visual noise and undermines hierarchy.

**Fix:** Change `.section-badge` default colour to gold. Reserve red for promotional/urgency context only:

```css
/* styles.css — section badge */
.section-badge {
  color: var(--kq-gold);
  border: 1px solid rgba(255, 201, 66, 0.4);
  background: linear-gradient(
    135deg,
    rgba(255, 201, 66, 0.12),
    rgba(255, 201, 66, 0.06)
  );
  box-shadow: 0 4px 20px rgba(255, 201, 66, 0.15);
}
```

Only apply the red variant where appropriate (e.g., a "Special Offer" or "Limited Time" badge):

```css
.section-badge.promo {
  color: var(--sf-red);
  border-color: rgba(255, 61, 90, 0.4);
  background: linear-gradient(
    135deg,
    rgba(255, 61, 90, 0.15),
    rgba(255, 107, 53, 0.1)
  );
}
```

### 5.4 Product Badge Colour System is Incoherent

`components.css` / `styles.css`. Three badge colours are used with no clear system:

- Gold → "Chef's Choice" / "Best Seller" ✓
- Red → "Popular" — Why is "popular" a warning colour?
- Green (`#00e676`) → "New" — Neon green used nowhere else in the design

**Fix:** Establish a deliberate badge system:

| Badge         | Colour                             | Rationale                        |
| ------------- | ---------------------------------- | -------------------------------- |
| `bestseller`  | Gold (`--kq-gold`)                 | Prestige, top tier               |
| `popular`     | Gold with slight opacity, or amber | Positive association, not alarm  |
| `new`         | Gold outline / `--kq-white` fill   | Neutral, informational           |
| `chef-choice` | Gold                               | Same prestige tier as bestseller |

Remove the neon green entirely unless it appears elsewhere in the brand palette.

### 5.5 Excessive Colour Token Count — 5 Gold Variants

`:root` defines:

```css
--kq-gold: #ffc942;
--kq-gold-light: #ffe066;
--kq-gold-dark: #e6a800;
--kq-gold-shine: #fff176;
--kq-gold-accent: #ffb300;
```

Five shades of the same colour with partially overlapping roles (`--kq-gold-shine` and `--kq-gold-light` are both near-white golds). This forces developers to make arbitrary choices and produces subtle inconsistencies between components.

**Fix:** Reduce to three purposeful variants:

```css
--kq-gold: #ffc942; /* Primary — most UI use */
--kq-gold-light: #ffe066; /* Hover states, gradients */
--kq-gold-dark: #cc9e00; /* Active states, pressed, text on light bg */
```

Delete `--kq-gold-shine` and `--kq-gold-accent`. Do a search to reassign the ~8 occurrences.

### 5.6 Text Colour Variables Are Redundant

`:root` defines:

```css
--text: #ffffff;
--text-bright: #ffffff; /* identical to --text */
--text-secondary: rgba(255, 255, 255, 0.9);
--text-muted: rgba(255, 255, 255, 0.7);
--text-subtle: rgba(255, 255, 255, 0.5);
--muted: #9e9e9e; /* fifth grey, not part of the semantic system */
```

`--text` and `--text-bright` are identical. `--muted` sits outside the semantic naming convention.

**Fix:**

```css
--text: #ffffff; /* headings / primary */
--text-secondary: rgba(255, 255, 255, 0.8); /* body copy */
--text-muted: rgba(255, 255, 255, 0.55); /* captions, metadata */
--text-disabled: rgba(255, 255, 255, 0.35); /* disabled states */
```

Delete `--text-bright`, `--text-subtle`, and `--muted`. Search and replace their occurrences (approximately 15).

---

## 6. Medium — Structural & Architecture Issues

### 6.1 `catering.js` — Leftover from Sunflour Bakery

`scripts/catering.js` (6.4 KB, 188 lines) appears to be a catering enquiry form handler from the previous bakery project. Its relevance to a restaurant/lounge needs to be confirmed. If it is not wired to any form on the current site, delete it and remove any `<script>` references.

### 6.2 `components/` HTML Files Are Never Included

`components/hero.html`, `components/modal.html`, `components/product-card.html` are HTML fragment files. Static HTML has no native include mechanism — they cannot be auto-included into other pages. They appear to be documentation or templates, but their presence suggests an incomplete component architecture intention.

**Action:** Either:

1. Delete these files and note in the README that components are inline.
2. Add a build step (e.g., a simple Node script or Vite) to process HTML includes — this would also enable CSS and JS bundling.

### 6.3 `manifest.json` — `maskable` Purpose on Single Icon

```json
{
  "src": "assets/icons/icon-512.png",
  "sizes": "512x512",
  "purpose": "any maskable"
}
```

The `purpose` field is `"any maskable"` on a single icon. The `any` and `maskable` purpose icons have different safe zone requirements (maskable icons require important content to be within the central 80% "safe zone"). A single icon used for both purposes will likely look clipped when installed as a PWA on Android.

**Fix:** Provide two separate icon entries:

```json
{ "src": "assets/icons/icon-512.png",          "sizes": "512x512", "type": "image/png", "purpose": "any" },
{ "src": "assets/icons/icon-512-maskable.png",  "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
```

### 6.4 `sw.js` Cache Name Has No Version Strategy

`sw.js` line 2: `const CACHE_NAME = "kings-queens-v1";`

The cache name is hardcoded. Updating CSS or JS will not bust the cache until this string is manually changed. Users may continue to receive stale assets after a deployment.

**Fix:** Tie the cache name to a build timestamp or content hash. For a no-build setup, at minimum establish a clear versioning convention and document it:

```js
// sw.js
const CACHE_VERSION = "v2"; // increment on every deploy
const CACHE_NAME = `kings-queens-${CACHE_VERSION}`;
```

Add to `README.md`: "**Before deploying:** increment `CACHE_VERSION` in `sw.js`."

---

## 7. Quick Wins — Immediate, Low-Risk (< 1 hour each)

| #   | Action                                                  | File                    | Impact                                        |
| --- | ------------------------------------------------------- | ----------------------- | --------------------------------------------- |
| 1   | Add `defer` to all `<script>` tags                      | All HTML files          | Eliminates parser blocking; fastest win       |
| 2   | Remove `som.pdf` from `assets/icons/`                   | `assets/icons/som.pdf`  | Removes 1.2 MB from deployment                |
| 3   | Delete `--text-bright` and `--muted` tokens             | `styles.css`            | Reduces confusion, ~15 occurrences to replace |
| 4   | Change `.section-badge` default colour to gold          | `styles.css` ~line 403  | Fixes most visible colour inconsistency       |
| 5   | Remove `will-change` from `.hero-slide` base rule       | `styles.css` ~line 1043 | Frees GPU memory on hero                      |
| 6   | Add `width` and `height` attributes to all `<img>` tags | All HTML files          | Eliminates Cumulative Layout Shift (CLS)      |
| 7   | Change `<meta name="theme-color">` to `#ffc942`         | All HTML files          | Aligns brand colour across OS/browser chrome  |
| 8   | Add `fetchpriority="high"` to hero LCP image            | `index.html` ~line 178  | Improves LCP score                            |

---

## Priority Order

```
WEEK 1 — Do these first (performance-critical)
  ✦ Convert and compress all images to WebP (Section 1.1–1.2)
  ✦ Move Google Fonts @import out of CSS (Section 2.2)
  ✦ Add defer to all <script> tags (Section 7, item 1)
  ✦ Fix cursor-glow rAF loop (Section 3.1)
  ✦ Remove som.pdf (Section 7, item 2)

WEEK 2 — Architecture and mobile
  ✦ Add netlify.toml caching + processing headers (Section 3.5)
  ✦ Add srcset / responsive images to hero and categories (Section 1.3)
  ✦ Merge duplicate nav lists into one (Section 4.2)
  ✦ Fix section padding on mobile (Section 4.1)
  ✦ Lazy-load the Google Maps iframe (Section 4.6) 

WEEK 3 — Colour and CSS cleanup
  ✦ Rename all --sf-* tokens to --kq-* (Section 5.1)
  ✦ Reduce gold variants from 5 to 3 (Section 5.5)
  ✦ Fix section-badge colour to gold (Section 5.3)
  ✦ Fix product badge colour system (Section 5.4)
  ✦ Remove/split components.css (Section 2.1)
  ✦ Fix theme-color mismatch (Section 5.2)

WEEK 4 — Polish and future-proofing
  ✦ Replace products.js with Kings & Queens data (Section 3.4)
  ✦ Add maskable icon variant (Section 6.3)
  ✦ Implement SW cache versioning strategy (Section 6.4)
  ✦ Clean catering.js and stale component files (Section 6.1–6.2)
```

---

_Audit prepared for internal use. All line numbers reference the codebase state as of April 8, 2026._
