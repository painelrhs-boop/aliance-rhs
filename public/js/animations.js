/* =========================================================
   ALIANCE R.H.S — ANIMATIONS JS
   Raven Hells System
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initRevealAnimations();
  initParallax();
  initCounterAnimations();
});

/* =========================================================
   REVEAL AO ROLAR
   ========================================================= */

function initRevealAnimations() {
  const elements = document.querySelectorAll(
    ".reveal, .reveal-left, .reveal-right, .reveal-scale"
  );

  if (!elements.length) return;

  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => {
      element.classList.add("active");
    });

    return;
  }

  const observer = new IntersectionObserver(
    (entries, observerInstance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("active");
        observerInstance.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  elements.forEach((element) => {
    observer.observe(element);
  });
}

/* =========================================================
   PARALLAX LEVE
   ========================================================= */

function initParallax() {
  const elements = document.querySelectorAll("[data-parallax]");

  if (!elements.length) return;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (reduceMotion) return;

  let ticking = false;

  const update = () => {
    const scrollY = window.scrollY;

    elements.forEach((element) => {
      const speed = Number(
        element.dataset.parallax || 0.12
      );

      element.style.transform =
        `translate3d(0, ${scrollY * speed}px, 0)`;
    });

    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true }
  );
}

/* =========================================================
   CONTADORES
   ========================================================= */

function initCounterAnimations() {
  const counters = document.querySelectorAll(
    "[data-counter]"
  );

  if (!counters.length) return;

  const animateCounter = (element) => {
    const target = Number(
      element.dataset.counter
    );

    if (!Number.isFinite(target)) return;

    const duration = Number(
      element.dataset.duration || 1200
    );

    const start = performance.now();

    const update = (now) => {
      const progress = Math.min(
        (now - start) / duration,
        1
      );

      const eased =
        1 - Math.pow(1 - progress, 3);

      const value = Math.floor(
        target * eased
      );

      element.textContent =
        value.toLocaleString("pt-BR");

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent =
          target.toLocaleString("pt-BR");
      }
    };

    requestAnimationFrame(update);
  };

  if (!("IntersectionObserver" in window)) {
    counters.forEach(animateCounter);
    return;
  }

  const observer = new IntersectionObserver(
    (entries, observerInstance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        animateCounter(entry.target);
        observerInstance.unobserve(entry.target);
      });
    },
    {
      threshold: 0.5
    }
  );

  counters.forEach((counter) => {
    observer.observe(counter);
  });
}

/* =========================================================
   EFEITO DE MOUSE EM ELEMENTOS
   ========================================================= */

document.addEventListener("mousemove", (event) => {
  const elements = document.querySelectorAll(
    "[data-mouse-effect]"
  );

  if (!elements.length) return;

  const x = event.clientX / window.innerWidth - 0.5;
  const y = event.clientY / window.innerHeight - 0.5;

  elements.forEach((element) => {
    const intensity = Number(
      element.dataset.mouseEffect || 4
    );

    element.style.transform =
      `perspective(900px)
       rotateX(${y * -intensity}deg)
       rotateY(${x * intensity}deg)`;
  });
});

/* =========================================================
   RESET DO EFEITO DE MOUSE
   ========================================================= */

document.addEventListener("mouseleave", () => {
  document
    .querySelectorAll("[data-mouse-effect]")
    .forEach((element) => {
      element.style.transform = "";
    });
});
