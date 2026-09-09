/* =========================================================
   ALIANCE R.H.S — NAVIGATION
   Raven Hells System
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initMobileNavigation();
  initActiveNavigation();
});

/* =========================================================
   MENU MOBILE
   ========================================================= */

function initMobileNavigation() {
  const button = document.querySelector(
    ".mobile-menu-btn, [data-mobile-menu]"
  );

  const nav = document.querySelector(
    ".header-nav, [data-navigation]"
  );

  if (!button || !nav) return;

  button.addEventListener("click", () => {
    const opened = nav.classList.toggle("is-open");

    button.classList.toggle("is-active", opened);
    button.setAttribute("aria-expanded", String(opened));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      button.classList.remove("is-active");
      button.setAttribute("aria-expanded", "false");
    });
  });
}

/* =========================================================
   NAVEGAÇÃO ATIVA
   ========================================================= */

function initActiveNavigation() {
  const links = document.querySelectorAll(
    ".header-nav a, nav a"
  );

  if (!links.length) return;

  const currentPath = window.location.pathname;

  links.forEach((link) => {
    const href = link.getAttribute("href");

    if (!href || href.startsWith("#")) return;

    try {
      const url = new URL(href, window.location.origin);

      if (url.pathname === currentPath) {
        link.classList.add("active");
      }
    } catch {
      // Ignora links inválidos.
    }
  });
}

/* =========================================================
   NAVEGAÇÃO ENTRE PÁGINAS
   ========================================================= */

window.RHS = window.RHS || {};

window.RHS.goTo = function (url) {
  if (!url) return;

  window.location.href = url;
};

window.RHS.openExternal = function (url) {
  if (!url) return;

  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );
};

/* =========================================================
   VOLTAR
   ========================================================= */

window.RHS.goBack = function () {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "/";
  }
};
