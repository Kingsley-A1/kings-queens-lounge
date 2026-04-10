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
  const header = document.querySelector(".site-header");
  if (header) {
    window.addEventListener(
      "scroll",
      () => {
        if (window.scrollY > 50) {
          header.classList.add("scrolled");
        } else {
          header.classList.remove("scrolled");
        }
      },
      { passive: true }
    );
  }

  // Mobile navigation with overlay
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");

  // Create overlay element
  let navOverlay = document.querySelector(".nav-overlay");
  if (!navOverlay && navToggle && mainNav) {
    navOverlay = document.createElement("div");
    navOverlay.className = "nav-overlay";
    navOverlay.setAttribute("aria-hidden", "true");
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
        } catch (err) {}

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
    if (
      label.includes("order") ||
      label.includes("add to cart") ||
      label.includes("add")
    ) {
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
        } catch (err) {}
        window.sfToast.success("Added to cart");
        setTimeout(() => (window.location.href = "checkout.html"), 350);
      }
    }
  });
});

// ============================================================
// HERO COLLAGE — Rotating Product Images
// Cycles each of the 4 tiles through all product images
// every 3 seconds with a smooth crossfade, staggered per tile.
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
  var tiles = document.querySelectorAll(".hero-collage-grid .collage-item");
  if (!tiles.length) return;

  var images = [
    { src: "assets/images/chocolate_cake.png",    label: "Signature Cakes" },
    { src: "assets/images/butter_croissant.png",  label: "Fresh Pastries" },
    { src: "assets/images/drinks_category.png",   label: "Craft Cocktails" },
    { src: "assets/images/sourdough_bread.png",   label: "Artisan Bread" },
    { src: "assets/images/red_velvet_cake.png",   label: "Red Velvet Cake" },
    { src: "assets/images/pizza.png",             label: "Stone Baked Pizza" },
    { src: "assets/images/beef_burger.png",       label: "Premium Burgers" },
    { src: "assets/images/chicken_wings.png",     label: "Crispy Wings" },
    { src: "assets/images/iced_coffee.png",       label: "Specialty Coffee" },
    { src: "assets/images/baguette.png",          label: "Artisan Baguettes" },
    { src: "assets/images/cinnamon_roll.png",     label: "Cinnamon Rolls" },
    { src: "assets/images/danish_pastry.png",     label: "Danish Pastries" },
    { src: "assets/images/birthday_cake.png",     label: "Celebration Cakes" },
    { src: "assets/images/orange_juice.png",      label: "Fresh Juices" },
    { src: "assets/images/whole_wheat_bread.png", label: "Whole Grain Bread" },
    { src: "assets/images/bread_category.png",    label: "Fresh Breads" },
    { src: "assets/images/cake_category.png",     label: "Cake Collection" },
    { src: "assets/images/pastries_category.png", label: "Pastry Selection" },
    { src: "assets/images/fastfood_category.png", label: "Quick Bites" },
  ];

  // Preload all images so transitions are instant
  images.forEach(function (item) {
    var preload = new Image();
    preload.src = item.src;
  });

  // Each tile starts at a different point in the images array
  var startIndices = [0, 5, 10, 14];

  tiles.forEach(function (tile, tileIndex) {
    var idx = startIndices[tileIndex] % images.length;
    var img = tile.querySelector("img");
    var labelEl = tile.querySelector(".collage-label");

    if (!img) return;

    // Set initial image
    img.src = images[idx].src;
    if (labelEl) labelEl.textContent = images[idx].label;

    // Stagger each tile's cycle start by 750 ms
    setTimeout(function () {
      setInterval(function () {
        idx = (idx + 1) % images.length;
        var next = images[idx];

        // Fade out current image
        img.style.opacity = "0";

        // After fade-out completes, swap src and fade in
        setTimeout(function () {
          img.src = next.src; // already preloaded — no flash
          if (labelEl) labelEl.textContent = next.label;
          img.style.opacity = "1";
        }, 350);
      }, 3000);
    }, tileIndex * 750);
  });
});
