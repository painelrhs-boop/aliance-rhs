document.addEventListener("DOMContentLoaded", () => {
  const yearElements = document.querySelectorAll("[data-year]");

  yearElements.forEach((element) => {
    element.textContent = new Date().getFullYear();
  });

  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');

    if (!link) return;

    const targetId = link.getAttribute("href");

    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);

    if (!target) return;

    event.preventDefault();

    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });

  const header = document.querySelector(".site-header, header");

  if (header) {
    const updateHeader = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 30);
    };

    updateHeader();

    window.addEventListener("scroll", updateHeader, {
      passive: true
    });
  }

  console.log("ALIANCE R.H.S carregado.");
});

window.RHS = window.RHS || {};

window.RHS.escapeHTML = (value) => {
  const div = document.createElement("div");
  div.textContent = String(value ?? "");
  return div.innerHTML;
};

window.RHS.formatDate = (date) => {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString("pt-BR");
};

window.RHS.formatDateTime = (date) => {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleString("pt-BR");
};
