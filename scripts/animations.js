// ============================================
// 👑 KINGS & QUEENS — Premium Animation System
// Senior-Level Animations & Interactions
// ============================================
(function () {
  "use strict";

  // ============================================
  // CONFIGURATION
  // ============================================
  const CONFIG = {
    scrollThreshold: 0.15,
    staggerDelay: 80,
    counterDuration: 2500,
    parallaxStrength: 0.3,
    magnetStrength: 0.3,
  };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  const lerp = (start, end, factor) => start + (end - start) * factor;
  const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
  const debounce = (fn, ms) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  };

  // ============================================
  // ANIMATED STATS COUNTER — Premium Version
  // ============================================
  function animateCounter(element, target, duration = CONFIG.counterDuration) {
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Premium easing (elastic ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(start + (target - start) * easeOut);

      element.textContent =
        current.toLocaleString() + (element.dataset.suffix || "");

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent =
          target.toLocaleString() + (element.dataset.suffix || "");
        // Add subtle pulse animation on complete
        element.style.animation = "pulse 0.5s ease";
      }
    }

    requestAnimationFrame(update);
  }

  function initStatsCounter() {
    const statsSection = document.querySelector(".stats");
    if (!statsSection) return;

    const statNumbers = statsSection.querySelectorAll(".stat h3, .stat-number");
    let hasAnimated = false;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            hasAnimated = true;

            statNumbers.forEach((el, index) => {
              const text = el.textContent.replace(/[^0-9]/g, "");
              const target = parseInt(text, 10) || 0;
              const suffix = el.textContent.includes("+") ? "+" : "";

              el.dataset.suffix = suffix;
              el.textContent = "0";

              setTimeout(() => {
                animateCounter(el, target, CONFIG.counterDuration);
              }, index * 200);
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(statsSection);
  }

  // ============================================
  // TESTIMONIAL CAROUSEL — Smooth Animation
  // ============================================
  function initTestimonialCarousel() {
    const container = document.querySelector(".testimonial-grid");
    if (!container) return;

    const testimonials = container.querySelectorAll(".testimonial");
    if (testimonials.length <= 1) return;

    const track = document.createElement("div");
    track.className = "testimonial-track";

    testimonials.forEach((t) => {
      t.classList.add("testimonial-slide");
      track.appendChild(t);
    });

    container.innerHTML = "";
    container.classList.add("testimonial-carousel");
    container.appendChild(track);

    const dotsContainer = document.createElement("div");
    dotsContainer.className = "carousel-dots";

    testimonials.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.className = `carousel-dot ${index === 0 ? "active" : ""}`;
      dot.setAttribute("aria-label", `Go to testimonial ${index + 1}`);
      dot.addEventListener("click", () => goToSlide(index));
      dotsContainer.appendChild(dot);
    });

    container.appendChild(dotsContainer);

    let currentIndex = 0;
    let autoplayInterval;
    const slideCount = testimonials.length;

    function goToSlide(index) {
      currentIndex = index;
      track.style.transform = `translateX(-${index * 100}%)`;
      track.style.transition = "transform 0.6s cubic-bezier(0.19, 1, 0.22, 1)";

      dotsContainer.querySelectorAll(".carousel-dot").forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
      });
    }

    function nextSlide() {
      goToSlide((currentIndex + 1) % slideCount);
    }

    function startAutoplay() {
      autoplayInterval = setInterval(nextSlide, 5000);
    }

    function pauseAutoplay() {
      clearInterval(autoplayInterval);
    }

    startAutoplay();

    container.addEventListener("mouseenter", pauseAutoplay);
    container.addEventListener("focusin", pauseAutoplay);
    container.addEventListener("mouseleave", startAutoplay);
    container.addEventListener("focusout", startAutoplay);

    // Touch support
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
        pauseAutoplay();
      },
      { passive: true }
    );

    track.addEventListener(
      "touchend",
      (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        startAutoplay();
      },
      { passive: true }
    );

    function handleSwipe() {
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          nextSlide();
        } else {
          goToSlide((currentIndex - 1 + slideCount) % slideCount);
        }
      }
    }
  }

  // ============================================
  // SCROLL REVEAL ANIMATIONS — Premium
  // ============================================
  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(
      ".animate-on-scroll, .category-item, .product-card, .experience-card, " +
        ".benefit, .faq-item, .team-member, .section-header, .gallery-item, " +
        ".testimonial, .stat, .feature-card"
    );

    if (!animatedElements.length) return;

    // Add initial hidden state
    animatedElements.forEach((el) => {
      if (!el.classList.contains("animate-on-scroll")) {
        el.classList.add("animate-on-scroll");
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = parseInt(entry.target.dataset.delay) || 0;

            setTimeout(() => {
              entry.target.classList.add("animate-in", "visible");
            }, delay);

            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: CONFIG.scrollThreshold,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    animatedElements.forEach((el) => observer.observe(el));
  }

  // ============================================
  // PARALLAX EFFECTS — Smooth & Subtle
  // ============================================
  function initParallax() {
    const parallaxElements = document.querySelectorAll("[data-parallax]");
    const heroImage = document.querySelector(".hero-image");

    if (!parallaxElements.length && !heroImage) return;

    let ticking = false;

    function updateParallax() {
      const scrollY = window.scrollY;

      // Hero parallax
      if (heroImage) {
        const heroRect = heroImage.getBoundingClientRect();
        if (heroRect.bottom > 0) {
          const parallaxY = scrollY * CONFIG.parallaxStrength;
          heroImage.style.transform = `scale(1.1) translateY(${parallaxY}px)`;
        }
      }

      // Custom parallax elements
      parallaxElements.forEach((el) => {
        const speed = parseFloat(el.dataset.parallax) || 0.5;
        const rect = el.getBoundingClientRect();

        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const y = (window.innerHeight - rect.top) * speed * 0.1;
          el.style.transform = `translateY(${y}px)`;
        }
      });

      ticking = false;
    }

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(updateParallax);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  // ============================================
  // MAGNETIC BUTTON EFFECT
  // ============================================
  function initMagneticButtons() {
    const buttons = document.querySelectorAll(".btn-primary, .btn-lg");

    buttons.forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        btn.style.transform = `translate(${x * CONFIG.magnetStrength}px, ${
          y * CONFIG.magnetStrength
        }px) translateY(-3px) scale(1.02)`;
      });

      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }

  // ============================================
  // CURSOR GLOW EFFECT (Desktop Only)
  // ============================================
  function initCursorGlow() {
    if (window.matchMedia("(hover: none)").matches) return;

    const glow = document.createElement("div");
    glow.className = "cursor-glow";
    glow.style.cssText = `
            position: fixed;
            left: 0;
            top: 0;
            width: 400px;
            height: 400px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%);
            pointer-events: none;
            z-index: 0;
            transition: opacity 0.3s ease;
            opacity: 0;
        `;
    document.body.appendChild(glow);

    let mouseX = 0,
      mouseY = 0;
    let glowX = 0,
      glowY = 0;
    let rafId = null;

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      glow.style.opacity = "1";
      if (!rafId) rafId = requestAnimationFrame(animateGlow);
    });

    document.addEventListener("mouseleave", () => {
      glow.style.opacity = "0";
    });

    function animateGlow() {
      const dx = mouseX - glowX;
      const dy = mouseY - glowY;
      glowX = glowX + dx * 0.1;
      glowY = glowY + dy * 0.1;
      glow.style.transform = `translate(calc(-50% + ${glowX}px), calc(-50% + ${glowY}px))`;
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        rafId = requestAnimationFrame(animateGlow);
      } else {
        rafId = null;
      }
    }
  }

  // ============================================
  // HEADER SCROLL EFFECTS
  // ============================================
  function initHeaderEffects() {
    const header = document.querySelector(".site-header");
    if (!header) return;

    let lastScroll = 0;
    const scrollThreshold = 50;

    window.addEventListener(
      "scroll",
      () => {
        const currentScroll = window.scrollY;

        // Add/remove scrolled class
        if (currentScroll > scrollThreshold) {
          header.classList.add("scrolled");
        } else {
          header.classList.remove("scrolled");
        }

        // Hide/show on scroll direction (optional)
        // if (currentScroll > lastScroll && currentScroll > 200) {
        //     header.style.transform = 'translateY(-100%)';
        // } else {
        //     header.style.transform = 'translateY(0)';
        // }

        lastScroll = currentScroll;
      },
      { passive: true }
    );
  }

  // ============================================
  // SMOOTH REVEAL ON PAGE LOAD
  // ============================================
  function initPageLoadAnimations() {
    document.body.classList.add("page-loaded");

    // Stagger hero elements
    const heroElements = document.querySelectorAll(
      ".hero-badge, .hero-title, .hero-sub, .hero-ctas, .hero-features"
    );

    heroElements.forEach((el, index) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(30px)";

      setTimeout(() => {
        el.style.transition = "all 0.8s cubic-bezier(0.19, 1, 0.22, 1)";
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }, 200 + index * 150);
    });
  }

  // ============================================
  // IMAGE LAZY LOAD WITH FADE
  // ============================================
  function initLazyImages() {
    const images = document.querySelectorAll('img[loading="lazy"]');

    images.forEach((img) => {
      img.style.opacity = "0";
      img.style.transition = "opacity 0.5s ease";

      if (img.complete) {
        img.style.opacity = "1";
      } else {
        img.addEventListener("load", () => {
          img.style.opacity = "1";
        });
      }
    });
  }

  // ============================================
  // SMOOTH SCROLL LINKS
  // ============================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
    });
  }

  // ============================================
  // TILT EFFECT ON CARDS
  // ============================================
  function initCardTilt() {
    if (window.matchMedia("(hover: none)").matches) return;

    const cards = document.querySelectorAll(
      ".product-card, .experience-card, .category-item"
    );

    cards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-12px) scale(1.02)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
        card.style.transition = "transform 0.5s ease";
      });

      card.addEventListener("mouseenter", () => {
        card.style.transition = "transform 0.1s ease";
      });
    });
  }

  // ============================================
  // TEXT TYPING EFFECT
  // ============================================
  function initTypingEffect() {
    const typingElements = document.querySelectorAll("[data-typing]");

    typingElements.forEach((el) => {
      const text = el.textContent;
      const speed = parseInt(el.dataset.typingSpeed) || 50;
      el.textContent = "";
      el.style.opacity = "1";

      let i = 0;
      function type() {
        if (i < text.length) {
          el.textContent += text.charAt(i);
          i++;
          setTimeout(type, speed);
        }
      }

      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          type();
          observer.disconnect();
        }
      });
      observer.observe(el);
    });
  }

  // ============================================
  // INIT ALL ANIMATIONS
  // ============================================
  function init() {
    // Core animations
    initPageLoadAnimations();
    initStatsCounter();
    initTestimonialCarousel();
    initScrollAnimations();
    initHeroSlideshow();

    // Premium effects
    initParallax();
    initMagneticButtons();
    initCursorGlow();
    initHeaderEffects();
    initLazyImages();
    initSmoothScroll();
    initCardTilt();
    initTypingEffect();

    console.log("👑 Kings & Queens — Premium animations initialized");
  }

  // ============================================
  // HERO SLIDESHOW — Premium Image Carousel
  // ============================================
  function initHeroSlideshow() {
    const slideshow = document.querySelector(".hero-slideshow");
    if (!slideshow) return;

    const slides = slideshow.querySelectorAll(".hero-slide");
    const dots = document.querySelectorAll(".hero-dot");

    if (slides.length <= 1) return;

    let currentSlide = 0;
    let slideInterval;
    const SLIDE_DURATION = 6000; // 6 seconds per slide

    function goToSlide(index) {
      // Remove active from all
      slides.forEach((slide) => slide.classList.remove("active"));
      dots.forEach((dot) => dot.classList.remove("active"));

      // Set new active
      currentSlide = index;
      slides[currentSlide].classList.add("active");
      if (dots[currentSlide]) {
        dots[currentSlide].classList.add("active");
      }
    }

    function nextSlide() {
      const next = (currentSlide + 1) % slides.length;
      goToSlide(next);
    }

    function startAutoplay() {
      stopAutoplay();
      slideInterval = setInterval(nextSlide, SLIDE_DURATION);
    }

    function stopAutoplay() {
      if (slideInterval) {
        clearInterval(slideInterval);
      }
    }

    // Dot navigation
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        goToSlide(index);
        startAutoplay(); // Reset timer on manual navigation
      });
    });

    // Pause on hover (optional premium feel)
    slideshow.addEventListener("mouseenter", stopAutoplay);
    slideshow.addEventListener("mouseleave", startAutoplay);

    // Touch swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    slideshow.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );

    slideshow.addEventListener(
      "touchend",
      (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const swipeThreshold = 50;

        if (touchStartX - touchEndX > swipeThreshold) {
          // Swipe left - next slide
          goToSlide((currentSlide + 1) % slides.length);
          startAutoplay();
        } else if (touchEndX - touchStartX > swipeThreshold) {
          // Swipe right - previous slide
          goToSlide((currentSlide - 1 + slides.length) % slides.length);
          startAutoplay();
        }
      },
      { passive: true }
    );

    // Start autoplay
    startAutoplay();

    // Pause when tab not visible
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });
  }

  // Wait for DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Reinitialize on dynamic content
  window.reinitAnimations = init;
})();
