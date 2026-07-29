document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  const seasonButtons = document.querySelectorAll("[data-season-btn]");
  if (seasonButtons.length) {
    const setSeason = (season) => {
      document.body.dataset.season = season;
      seasonButtons.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.seasonBtn === season);
      });
      localStorage.setItem("hp-season", season);
    };

    const stored = localStorage.getItem("hp-season");
    const month = new Date().getMonth();
    const seasonalDefault = month >= 3 && month <= 9 ? "summer" : "winter";
    setSeason(stored || seasonalDefault);

    seasonButtons.forEach((btn) => {
      btn.addEventListener("click", () => setSeason(btn.dataset.seasonBtn));
    });
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    if (prefersReducedMotion) {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
      );
      revealEls.forEach((el) => observer.observe(el));
    }
  }

  const parallaxEls = document.querySelectorAll("[data-parallax]");
  if (parallaxEls.length && !prefersReducedMotion) {
    let ticking = false;
    const updateParallax = () => {
      const scrollY = window.scrollY;
      parallaxEls.forEach((el) => {
        const speed = parseFloat(el.dataset.parallax) || 0.2;
        el.style.transform = `translate3d(0, ${scrollY * speed}px, 0)`;
      });
      ticking = false;
    };
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
    updateParallax();
  }

  document.querySelectorAll(".card-stack").forEach((stack) => {
    const items = Array.from(stack.querySelectorAll(".stack-item"));
    const total = items.length;
    const nav = stack.parentElement.querySelector(".stack-nav");
    const dots = nav ? Array.from(nav.querySelectorAll(".stack-dot")) : [];
    const prevBtn = nav ? nav.querySelector("[data-stack-prev]") : null;
    const nextBtn = nav ? nav.querySelector("[data-stack-next]") : null;
    let active = 0;

    const render = () => {
      items.forEach((item, i) => {
        let offset = i - active;
        if (offset > total / 2) offset -= total;
        if (offset < -total / 2) offset += total;
        item.classList.toggle("active", offset === 0);
        if (offset === 0) {
          item.style.transform = "translateX(0) scale(1) rotate(0deg)";
          item.style.opacity = "1";
          item.style.zIndex = "3";
        } else {
          const dir = offset > 0 ? 1 : -1;
          item.style.transform = `translateX(${dir * 70}px) scale(0.88) rotate(${dir * 4}deg)`;
          item.style.opacity = "0.65";
          item.style.zIndex = "2";
        }
      });
      dots.forEach((dot, i) => dot.classList.toggle("active", i === active));
    };

    const setActive = (index) => {
      active = ((index % total) + total) % total;
      render();
    };

    items.forEach((item, i) => {
      const flipCard = item.querySelector(".flip-card");
      const activateOrFlip = () => {
        if (i !== active) {
          setActive(i);
        } else {
          flipCard.classList.toggle("flipped");
        }
      };
      item.addEventListener("click", activateOrFlip);
      flipCard.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activateOrFlip();
        }
      });
    });

    if (prevBtn) prevBtn.addEventListener("click", () => setActive(active - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => setActive(active + 1));
    dots.forEach((dot, i) => dot.addEventListener("click", () => setActive(i)));

    render();
  });

  document.querySelectorAll(".stat-col").forEach((col) => {
    const toggle = () => col.classList.toggle("expanded");
    col.addEventListener("click", toggle);
    col.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
  });

  const splitContinuum = document.querySelector(".split-continuum");
  if (splitContinuum) {
    const bgBlue = splitContinuum.querySelector('[data-split-bg="blue"]');
    const bgOrange = splitContinuum.querySelector('[data-split-bg="orange"]');
    const heroColumns = splitContinuum.querySelector(".split-hero-columns");
    const setSplit = (blueWidth) => {
      bgBlue.style.width = `${blueWidth}%`;
      bgOrange.style.width = `${100 - blueWidth}%`;
      if (heroColumns) {
        // Shift position only — column widths stay fixed so the paragraph never reflows.
        const shift = (blueWidth - 50) * 3.5;
        heroColumns.style.transform = `translateX(${shift}px)`;
      }
    };
    splitContinuum.querySelectorAll(".split-side").forEach((side) => {
      const grow = side.classList.contains("split-renter") ? 58 : 42;
      side.addEventListener("mouseenter", () => setSplit(grow));
      side.addEventListener("mouseleave", () => setSplit(50));
      side.addEventListener("focusin", () => setSplit(grow));
      side.addEventListener("focusout", () => setSplit(50));
    });
  }
});
