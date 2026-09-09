(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  /* =========================
     TOAST
  ========================= */

  function showToast(message, type = "success") {
    let toast = $(".toast");

    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.className = `toast ${type}`;

    clearTimeout(window.__rhsToastTimer);

    window.__rhsToastTimer = setTimeout(() => {
      toast.remove();
    }, 3500);
  }

  window.showToast = showToast;

  /* =========================
     MODAL
  ========================= */

  function openModal(id) {
    const modal = typeof id === "string" ? document.getElementById(id) : id;

    if (!modal) return;

    modal.classList.add("open");
    modal.classList.add("active");
  }

  function closeModal(id) {
    const modal = typeof id === "string" ? document.getElementById(id) : id;

    if (!modal) return;

    modal.classList.remove("open");
    modal.classList.remove("active");
  }

  window.openModal = openModal;
  window.closeModal = closeModal;

  $$(".modal-close").forEach((button) => {
    button.addEventListener("click", () => {
      closeModal(button.closest(".modal"));
    });
  });

  $$(".modal").forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal(modal);
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      $$(".modal.open, .modal.active").forEach(closeModal);
    }
  });

  /* =========================
     MENU
  ========================= */

  $$(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      $$(".nav-link").forEach((item) => {
        item.classList.remove("active");
      });

      link.classList.add("active");
    });
  });

  /* =========================
     BOTÕES DE LOGOUT
  ========================= */

  $$("[data-logout]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await fetch("/api/admin/logout", {
          method: "POST",
          credentials: "include"
        });
      } catch (_) {
        // Continua mesmo se a requisição falhar.
      }

      window.location.href = "/admin";
    });
  });

  /* =========================
     FORMULÁRIO DE LOGIN
  ========================= */

  const loginForm =
    $("#admin-login-form") ||
    $("#login-form") ||
    $("form[data-login]");

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const button =
        $("button[type='submit']", loginForm);

      const originalText = button ? button.textContent : "";

      if (button) {
        button.disabled = true;
        button.textContent = "ENTRANDO...";
      }

      const formData = new FormData(loginForm);

      const email =
        formData.get("email") ||
        formData.get("username");

      const password = formData.get("password");

      try {
        const response = await fetch("/api/admin/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({
            email,
            password
          })
        });

        let data = {};

        try {
          data = await response.json();
        } catch (_) {}

        if (!response.ok) {
          throw new Error(
            data.message ||
            data.error ||
            "E-mail ou senha inválidos."
          );
        }

        showToast("Login realizado com sucesso.");

        setTimeout(() => {
          window.location.href = "/admin";
        }, 500);

      } catch (error) {
        showToast(
          error.message || "Não foi possível entrar.",
          "error"
        );

      } finally {
        if (button) {
          button.disabled = false;
          button.textContent = originalText;
        }
      }
    });
  }

  /* =========================
     VERIFICAÇÃO DA SESSÃO
  ========================= */

  async function checkAdminSession() {
    try {
      const response = await fetch(
        "/api/admin/session",
        {
          method: "GET",
          credentials: "include"
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      if (data && data.authenticated === false) {
        return null;
      }

      return data;

    } catch (_) {
      return null;
    }
  }

  window.checkAdminSession = checkAdminSession;

  /* =========================
     CARREGAR DADOS DO ADMIN
  ========================= */

  async function loadAdminData() {
    const session = await checkAdminSession();

    if (!session) return null;

    const user =
      session.user ||
      session.admin ||
      session;

    const name =
      user.name ||
      user.username ||
      user.email ||
      "Administrador";

    const email =
      user.email ||
      "";

    $$(".user-name").forEach((element) => {
      element.textContent = name;
    });

    $$(".user-email").forEach((element) => {
      element.textContent = email;
    });

    $$(".user-role").forEach((element) => {
      element.textContent =
        user.role ||
        "ADMIN";
    });

    $$(".avatar").forEach((element) => {
      const letters = name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();

      element.textContent = letters || "RH";
    });

    return session;
  }

  /* =========================
     AUTO CARREGAMENTO
  ========================= */

  document.addEventListener("DOMContentLoaded", async () => {
    await loadAdminData();

    /* Ano automático */
    $$(".current-year").forEach((element) => {
      element.textContent =
        new Date().getFullYear();
    });

    /* Botões com data-action */
    $$("[data-action='logout']").forEach((button) => {
      button.addEventListener("click", async () => {
        try {
          await fetch("/api/admin/logout", {
            method: "POST",
            credentials: "include"
          });
        } finally {
          window.location.href = "/";
        }
      });
    });
  });

})();
