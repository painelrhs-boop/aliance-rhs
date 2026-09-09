/* =========================================================
   ALIANCE R.H.S — COMMUNITY
   Raven Hells System
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initCommunityLinks();
});

/* =========================================================
   LINKS DA COMUNIDADE
   ========================================================= */

function initCommunityLinks() {
  const links = document.querySelectorAll(
    "[data-community-link]"
  );

  links.forEach((element) => {
    element.addEventListener("click", async (event) => {
      const url = element.dataset.communityLink;

      if (!url) return;

      event.preventDefault();

      await openCommunity(url);
    });
  });
}

/* =========================================================
   ABRIR COMUNIDADE
   ========================================================= */

async function openCommunity(url) {
  if (!isValidCommunityUrl(url)) {
    showCommunityMessage(
      "O link da comunidade não é válido."
    );
    return;
  }

  try {
    const response = await fetch(
      `/api/community/resolve?url=${encodeURIComponent(url)}`,
      {
        method: "GET",
        credentials: "include"
      }
    );

    if (response.ok) {
      const data = await response.json();

      if (data?.url) {
        window.open(
          data.url,
          "_blank",
          "noopener,noreferrer"
        );

        return;
      }
    }
  } catch {
    // Se a API não estiver disponível,
    // usamos o link original abaixo.
  }

  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );
}

/* =========================================================
   VALIDAÇÃO
   ========================================================= */

function isValidCommunityUrl(value) {
  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" &&
      (
        url.hostname === "chat.whatsapp.com" ||
        url.hostname.endsWith(".whatsapp.com")
      )
    );
  } catch {
    return false;
  }
}

/* =========================================================
   MENSAGEM
   ========================================================= */

function showCommunityMessage(message) {
  if (
    window.RHS &&
    typeof window.RHS.toast === "function"
  ) {
    window.RHS.toast(message, "error");
    return;
  }

  alert(message);
}

/* =========================================================
   API PÚBLICA
   ========================================================= */

window.RHS = window.RHS || {};

window.RHS.openCommunity = openCommunity;

window.RHS.validateCommunityLink =
  isValidCommunityUrl;
