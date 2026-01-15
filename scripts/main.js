// main.js — site-wide helpers and UI

// Simple toast utility used across scripts (sfToast.{success,info,error})
(function () {
  const container = document.createElement("div");
  container.id = "sf-toast-container";
  container.setAttribute("aria-live", "polite");
  document.addEventListener("DOMContentLoaded", () =>
    document.body.appendChild(container)
  );

  function showToast(text, type = "info", timeout = 3000) {
    const t = document.createElement("div");
    t.className = `sf-toast sf-toast-${type}`;
    t.textContent = text;
    container.appendChild(t);
    // entrance
    requestAnimationFrame(() => t.classList.add("visible"));
    const id = setTimeout(() => {
      t.classList.remove("visible");
      setTimeout(() => t.remove(), 400);
    }, timeout);
    t.addEventListener("click", () => {
      clearTimeout(id);
      t.classList.remove("visible");
      setTimeout(() => t.remove(), 300);
    });
  }

  window.sfToast = {
    success: (msg, t) => showToast(msg, "success", t || 3000),
    info: (msg, t) => showToast(msg, "info", t || 3000),
    error: (msg, t) => showToast(msg, "error", t || 4000),
  };
})();

document.addEventListener("DOMContentLoaded", function () {
  // set year in footer
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Header scroll effect
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // Mobile navigation with overlay
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");

  // Create overlay element
  let navOverlay = document.querySelector('.nav-overlay');
  if (!navOverlay && navToggle && mainNav) {
    navOverlay = document.createElement('div');
    navOverlay.className = 'nav-overlay';
    navOverlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(navOverlay);
  }

  function openNav() {
    navToggle.setAttribute("aria-expanded", "true");
    mainNav.classList.add("open");
    navOverlay?.classList.add("visible");
    document.body.style.overflow = "hidden";
  }

  function closeNav() {
    navToggle.setAttribute("aria-expanded", "false");
    mainNav.classList.remove("open");
    navOverlay?.classList.remove("visible");
    document.body.style.overflow = "";
  }

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      const expanded = this.getAttribute("aria-expanded") === "true";
      if (expanded) {
        closeNav();
      } else {
        openNav();
      }
    });

    // Close on overlay click
    navOverlay?.addEventListener("click", closeNav);

    // Close on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mainNav.classList.contains("open")) {
        closeNav();
        navToggle.focus();
      }
    });

    // Close nav on link click (mobile)
    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 800) {
          closeNav();
        }
      });
    });
  }


  // newsletter form -> use toast
  const newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      window.sfToast.success("Subscribed! Thank you.");
      newsletterForm.reset();
    });
  }

  // mobile CTA dismissal (persisted)
  const mobileCTA = document.querySelector(".mobile-cta");
  if (mobileCTA) {
    try {
      const dismissed = localStorage.getItem("sf_mobile_cta_dismissed");
      if (dismissed === "1") {
        mobileCTA.classList.add("hidden");
        mobileCTA.setAttribute("aria-hidden", "true");
      }
    } catch (e) {
      /* ignore */
    }

    const dismissBtn = mobileCTA.querySelector(".mobile-cta-dismiss");
    if (dismissBtn) {
      dismissBtn.addEventListener("click", function (e) {
        e.preventDefault();
        mobileCTA.classList.add("hidden");
        mobileCTA.setAttribute("aria-hidden", "true");
        try {
          localStorage.setItem("sf_mobile_cta_dismissed", "1");
        } catch (err) { }

        // polite SR announcement
        let sr = document.getElementById("sf-sr-announcer");
        if (!sr) {
          sr = document.createElement("div");
          sr.id = "sf-sr-announcer";
          sr.setAttribute("aria-live", "polite");
          sr.style.position = "absolute";
          sr.style.left = "-9999px";
          document.body.appendChild(sr);
        }
        sr.textContent = "Quick order button dismissed";
      });
    }
  }

  // Make inline 'Order Now' buttons on static product cards work site-wide
  // This listens for clicks on any button inside a .product-card and treats it as an add-to-cart when labeled 'order'
  function parsePriceFromText(text) {
    if (!text) return 0;
    const m = text.match(/₦\s*([\d,]+)/);
    if (m && m[1]) return Number(m[1].replace(/,/g, ""));
    const m2 = text.match(/([\d,]+)/);
    return m2 ? Number(m2[1].replace(/,/g, "")) : 0;
  }

  function extractProductFromCard(card) {
    if (!card) return null;
    const titleEl = card.querySelector(".product-title");
    const imgEl = card.querySelector(".product-image");
    const tagsEl = card.querySelector(".product-tags");
    const priceEl = card.querySelector(".product-price");
    const descEl = card.querySelector(".product-desc");
    const price = parsePriceFromText(
      priceEl ? priceEl.textContent : tagsEl ? tagsEl.textContent : ""
    );
    return {
      id: null,
      title: titleEl ? titleEl.textContent.trim() : "Product",
      image: imgEl ? imgEl.getAttribute("src") : "",
      alt: imgEl ? imgEl.getAttribute("alt") || "" : "",
      tags: tagsEl ? tagsEl.textContent.trim() : "",
      desc: descEl ? descEl.textContent.trim() : "",
      price: price,
    };
  }

  document.body.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const card = btn.closest(".product-card");
    if (!card) return;
    const label = (
      btn.getAttribute("aria-label") ||
      btn.textContent ||
      ""
    ).toLowerCase();
    if (label.includes("order") || label.includes("add to cart") || label.includes("add")) {
      const product = extractProductFromCard(card);
      if (product) {
        const order = JSON.parse(localStorage.getItem("sunflourOrder") || "[]");
        const existing = order.find((i) => i.title === product.title);
        if (existing) {
          existing.quantity = (existing.quantity || 1) + 1;
        } else {
          order.push({ ...product, quantity: 1 });
        }
        try {
          localStorage.setItem("sunflourOrder", JSON.stringify(order));
        } catch (err) { }
        window.sfToast.success("Added to cart");
        setTimeout(() => (window.location.href = "checkout.html"), 350);
      }
    }
  });
});
