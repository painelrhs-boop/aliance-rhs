/* =========================================================
   ALIANCE R.H.S — API
   Raven Hells System
   ========================================================= */

window.RHS = window.RHS || {};

window.RHS.api = async function api(endpoint, options = {}) {
  const config = {
    method: options.method || "GET",
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {})
    }
  };

  if (options.body) {
    config.body =
      typeof options.body === "string"
        ? options.body
        : JSON.stringify(options.body);
  }

  const response = await fetch(endpoint, config);

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Erro na API (${response.status})`;

    throw new Error(message);
  }

  return data;
};


/* =========================================================
   ADMIN — SESSÃO
   ========================================================= */

window.RHS.getAdminSession = async function () {
  return window.RHS.api("/api/admin/session");
};


/* =========================================================
   ADMIN — LOGIN
   ========================================================= */

window.RHS.adminLogin = async function (email, password) {
  return window.RHS.api("/api/admin/login", {
    method: "POST",
    body: {
      email,
      password
    }
  });
};


/* =========================================================
   ADMIN — LOGOUT
   ========================================================= */

window.RHS.adminLogout = async function () {
  return window.RHS.api("/api/admin/logout", {
    method: "POST"
  });
};


/* =========================================================
   ADMIN — HISTÓRICO
   ========================================================= */

window.RHS.getAdminHistory = async function () {
  return window.RHS.api("/api/admin/history");
};


/* =========================================================
   COMMUNITY — RESOLVER LINK
   ========================================================= */

window.RHS.resolveCommunity = async function (url) {
  return window.RHS.api(
    `/api/community/resolve?url=${encodeURIComponent(url)}`
  );
};


/* =========================================================
   HELPERS
   ========================================================= */

window.RHS.isLoggedIn = async function () {
  try {
    const session = await window.RHS.getAdminSession();

    return Boolean(
      session?.authenticated ||
      session?.loggedIn ||
      session?.user
    );
  } catch {
    return false;
  }
};


window.RHS.handleApiError = function (error) {
  console.error("ALIANCE R.H.S API:", error);

  const message =
    error?.message ||
    "Não foi possível concluir a solicitação.";

  if (
    typeof window.RHS.toast === "function"
  ) {
    window.RHS.toast(message, "error");
  } else {
    alert(message);
  }
};


console.log("ALIANCE R.H.S API carregada.");
