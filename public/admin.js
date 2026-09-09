/* =========================================================
   ALIANCE R.H.S
   RAVEN HELLS SYSTEM
   JAVASCRIPT PRINCIPAL
========================================================= */

(() => {
  "use strict";


  /* =======================================================
     HELPERS
  ======================================================= */

  const $ = (selector, parent = document) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];


  /* =======================================================
     TOAST
  ======================================================= */

  function showToast(message, type = "normal") {

    let toast = $(".toast");

    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      document.body.appendChild(toast);
    }

    toast.textContent = message;

    toast.dataset.type = type;

    toast.classList.add("show");

    clearTimeout(toast._timer);

    toast._timer = setTimeout(() => {
      toast.classList.remove("show");
    }, 3200);
  }


  window.RHS = {
    showToast
  };


  /* =======================================================
     ANO AUTOMÁTICO
  ======================================================= */

  const year = $("#currentYear");

  if (year) {
    year.textContent = new Date().getFullYear();
  }


  /* =======================================================
     MENU MOBILE
  ======================================================= */

  const mobileMenu = $("#mobileMenu");
  const mainNav = $(".main-nav");

  if (mobileMenu && mainNav) {

    mobileMenu.addEventListener("click", () => {

      mainNav.classList.toggle("open");

      mobileMenu.classList.toggle("open");

    });


    $$(".main-nav a").forEach(link => {

      link.addEventListener("click", () => {
        mainNav.classList.remove("open");
        mobileMenu.classList.remove("open");
      });

    });

  }


  /* =======================================================
     NAVEGAÇÃO ATIVA
  ======================================================= */

  const navigationLinks = $$(".main-nav a");

  const sections = $$("main section[id]");

  if (navigationLinks.length && sections.length) {

    const updateActiveNavigation = () => {

      const scrollPosition =
        window.scrollY + 180;

      let currentSection = "";

      sections.forEach(section => {

        const top = section.offsetTop;
        const bottom =
          top + section.offsetHeight;

        if (
          scrollPosition >= top &&
          scrollPosition < bottom
        ) {
          currentSection = section.id;
        }

      });


      navigationLinks.forEach(link => {

        const href =
          link.getAttribute("href");

        link.classList.toggle(
          "active",
          href === `#${currentSection}`
        );

      });

    };


    window.addEventListener(
      "scroll",
      updateActiveNavigation,
      { passive: true }
    );

    updateActiveNavigation();

  }


  /* =======================================================
     LINKS COM SCROLL SUAVE
  ======================================================= */

  $$('a[href^="#"]').forEach(link => {

    link.addEventListener("click", event => {

      const targetId =
        link.getAttribute("href");

      if (
        !targetId ||
        targetId === "#"
      ) {
        return;
      }

      const target =
        document.querySelector(targetId);

      if (!target) {
        return;
      }

      event.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    });

  });


  /* =======================================================
     STATUS VISUAL
  ======================================================= */

  const statusDot = $(".online-dot");

  if (statusDot) {

    statusDot.setAttribute(
      "title",
      "Sistema operacional"
    );

  }


  /* =======================================================
     API HELPER
  ======================================================= */

  async function api(
    url,
    options = {}
  ) {

    const config = {
      credentials: "same-origin",
      ...options
    };


    config.headers = {
      Accept: "application/json",
      ...(options.headers || {})
    };


    if (
      config.body &&
      typeof config.body !== "string"
    ) {

      config.headers["Content-Type"] =
        "application/json";

      config.body =
        JSON.stringify(config.body);

    }


    const response =
      await fetch(url, config);


    let data = null;

    const contentType =
      response.headers.get("content-type") || "";


    if (
      contentType.includes(
        "application/json"
      )
    ) {

      try {
        data = await response.json();
      } catch {
        data = null;
      }

    } else {

      try {
        const text =
          await response.text();

        data = text
          ? { message: text }
          : null;

      } catch {
        data = null;
      }

    }


    if (!response.ok) {

      const error =
        new Error(
          data?.message ||
          data?.error ||
          `Erro HTTP ${response.status}`
        );

      error.status =
        response.status;

      error.data = data;

      throw error;

    }


    return data;

  }


  window.RHS.api = api;


  /* =======================================================
     SESSÃO DO ADMIN
  ======================================================= */

  async function getAdminSession() {

    return api(
      "/api/admin/session",
      {
        method: "GET"
      }
    );

  }


  window.RHS.getAdminSession =
    getAdminSession;


  /* =======================================================
     LOGOUT
  ======================================================= */

  async function logout() {

    try {

      await api(
        "/api/admin/logout",
        {
          method: "POST"
        }
      );

    } catch (error) {

      console.warn(
        "Erro ao encerrar sessão:",
        error
      );

    } finally {

      window.location.href =
        "/admin.html";

    }

  }


  window.RHS.logout = logout;


  /* =======================================================
     BOTÕES DE LOGOUT
  ======================================================= */

  $$("[data-logout], .logout-button, #logoutButton")
    .forEach(button => {

      button.addEventListener(
        "click",
        event => {

          event.preventDefault();

          logout();

        }
      );

    });


  /* =======================================================
     LOGIN
  ======================================================= */

  const loginForm =
    $("#loginForm");


  if (loginForm) {

    const loginButton =
      loginForm.querySelector(
        'button[type="submit"]'
      );

    const errorBox =
      $("#loginError") ||
      $(".login-error");


    loginForm.addEventListener(
      "submit",
      async event => {

        event.preventDefault();


        const emailInput =
          loginForm.querySelector(
            '[name="email"]'
          );

        const passwordInput =
          loginForm.querySelector(
            '[name="password"]'
          );


        if (
          !emailInput ||
          !passwordInput
        ) {

          showToast(
            "Campos de login não encontrados.",
            "error"
          );

          return;

        }


        const email =
          emailInput.value.trim();

        const password =
          passwordInput.value;


        if (!email || !password) {

          showLoginError(
            "Preencha o e-mail e a senha."
          );

          return;

        }


        setLoginLoading(
          true,
          loginButton
        );


        hideLoginError(
          errorBox
        );


        try {

          await api(
            "/api/admin/login",
            {
              method: "POST",

              body: {
                email,
                password
              }
            }
          );


          showToast(
            "Login realizado com sucesso."
          );


          setTimeout(() => {

            window.location.href =
              "/admin.html";

          }, 350);


        } catch (error) {

          console.error(
            "Falha no login:",
            error
          );


          showLoginError(
            getLoginErrorMessage(error)
          );


          setLoginLoading(
            false,
            loginButton
          );

        }

      }
    );


    function showLoginError(message) {

      if (!errorBox) {

        showToast(
          message,
          "error"
        );

        return;

      }


      errorBox.textContent =
        message;

      errorBox.classList.remove(
        "hidden"
      );

    }


    function hideLoginError(element) {

      if (!element) {
        return;
      }

      element.textContent = "";

      element.classList.add(
        "hidden"
      );

    }


    function setLoginLoading(
      loading,
      button
    ) {

      if (!button) {
        return;
      }


      if (loading) {

        button.disabled = true;

        button.dataset.originalText =
          button.textContent;

        button.textContent =
          "ENTRANDO...";

      } else {

        button.disabled = false;

        button.textContent =
          button.dataset.originalText ||
          "ENTRAR";

      }

    }


    function getLoginErrorMessage(
      error
    ) {

      if (
        error?.status === 401
      ) {

        return "E-mail ou senha incorretos.";

      }


      if (
        error?.status === 429
      ) {

        return "Muitas tentativas. Aguarde um pouco.";

      }


      if (
        error?.message
      ) {

        return error.message;

      }


      return "Não foi possível entrar. Tente novamente.";

    }

  }


  /* =======================================================
     PROTEÇÃO DO PAINEL
  ======================================================= */

  const isAdminPage =
    document.body.classList.contains(
      "admin-page"
    ) ||
    location.pathname === "/admin.html";


  if (isAdminPage) {

    protectAdminPage();

  }


  async function protectAdminPage() {

    try {

      const session =
        await getAdminSession();


      const authenticated =
        Boolean(
          session?.authenticated ??
          session?.loggedIn ??
          session?.user ??
          session?.admin
        );


      if (!authenticated) {

        window.location.href =
          "/admin.html";

        return;

      }


      populateAdminUser(
        session
      );


      document.documentElement
        .classList.add(
          "rhs-authenticated"
        );


    } catch (error) {

      console.warn(
        "Não foi possível verificar a sessão:",
        error
      );


      if (
        error?.status === 401 ||
        error?.status === 403
      ) {

        window.location.href =
          "/admin.html";

      }

    }

  }


  window.RHS.protectAdminPage =
    protectAdminPage;


  /* =======================================================
     USUÁRIO LOGADO
  ======================================================= */

  function populateAdminUser(
    session
  ) {

    const user =
      session?.user ||
      session?.admin ||
      session;


    const name =
      user?.name ||
      user?.username ||
      user?.email ||
      "Administrador";


    const email =
      user?.email ||
      "";


    const role =
      user?.role ||
      user?.type ||
      "ADMIN";


    $$(".user-name")
      .forEach(element => {

        element.textContent =
          name;

      });


    $$(".user-email")
      .forEach(element => {

        element.textContent =
          email;

      });


    $$(".user-role")
      .forEach(element => {

        element.textContent =
          role;

      });


    $$(".avatar")
      .forEach(element => {

        const firstLetter =
          String(name)
            .trim()
            .charAt(0)
            .toUpperCase();

        element.textContent =
          firstLetter || "A";

      });

  }


  window.RHS.populateAdminUser =
    populateAdminUser;


  /* =======================================================
     HISTÓRICO ADMINISTRATIVO
  ======================================================= */

  async function loadAdminHistory(
    target
  ) {

    try {

      const data =
        await api(
          "/api/admin/history",
          {
            method: "GET"
          }
        );


      const history =
        Array.isArray(data)
          ? data
          : (
            data?.history ||
            data?.items ||
            data?.data ||
            []
          );


      if (!target) {
        return history;
      }


      target.innerHTML = "";


      if (!history.length) {

        target.innerHTML = `
          <div class="text-muted">
            Nenhum registro encontrado.
          </div>
        `;

        return history;

      }


      history.forEach(item => {

        const row =
          document.createElement(
            "div"
          );


        row.className =
          "history-item";


        const action =
          item.action ||
          item.event ||
          item.type ||
          "Ação administrativa";


        const date =
          item.createdAt ||
          item.date ||
          item.timestamp ||
          "";


        row.innerHTML = `
          <strong>${escapeHtml(action)}</strong>
          <span>${escapeHtml(formatDate(date))}</span>
        `;


        target.appendChild(row);

      });


      return history;

    } catch (error) {

      console.error(
        "Erro ao carregar histórico:",
        error
      );


      if (target) {

        target.innerHTML = `
          <div class="text-muted">
            Não foi possível carregar o histórico.
          </div>
        `;

      }


      return [];

    }

  }


  window.RHS.loadAdminHistory =
    loadAdminHistory;


  /* =======================================================
     FORMATADORES
  ======================================================= */

  function formatDate(value) {

    if (!value) {
      return "Data não informada";
    }


    const date =
      new Date(value);


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return String(value);

    }


    return date.toLocaleString(
      "pt-BR",
      {
        dateStyle: "short",
        timeStyle: "short"
      }
    );

  }


  function escapeHtml(value) {

    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  }


  /* =======================================================
     MODAIS
  ======================================================= */

  function openModal(id) {

    const modal =
      typeof id === "string"
        ? document.getElementById(id)
        : id;


    if (!modal) {
      return;
    }


    modal.classList.add("open");

    document.body.style.overflow =
      "hidden";

  }


  function closeModal(id) {

    const modal =
      typeof id === "string"
        ? document.getElementById(id)
        : id;


    if (!modal) {
      return;
    }


    modal.classList.remove("open");

    document.body.style.overflow =
      "";

  }


  window.RHS.openModal =
    openModal;

  window.RHS.closeModal =
    closeModal;


  $$(".modal").forEach(modal => {

    modal.addEventListener(
      "click",
      event => {

        if (
          event.target === modal
        ) {

          closeModal(modal);

        }

      }
    );

  });


  $$("[data-modal-open]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          openModal(
            button.dataset.modalOpen
          );

        }
      );

    });


  $$("[data-modal-close]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const modal =
            button.closest(".modal");

          closeModal(modal);

        }
      );

    });


  /* =======================================================
     ESC PARA FECHAR MODAL
  ======================================================= */

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key !== "Escape"
      ) {
        return;
      }


      const openedModal =
        $(".modal.open");


      if (openedModal) {

        closeModal(
          openedModal
        );

      }

    }
  );


  /* =======================================================
     MENU ADMIN MOBILE
  ======================================================= */

  const adminMenuButton =
    $(
      "#adminMenuButton, [data-admin-menu]"
    );

  const sidebar =
    $(".sidebar");


  if (
    adminMenuButton &&
    sidebar
  ) {

    adminMenuButton.addEventListener(
      "click",
      () => {

        sidebar.classList.toggle(
          "open"
        );

      }
    );

  }


  /* =======================================================
     FECHAR SIDEBAR AO CLICAR
  ======================================================= */

  $$(".sidebar .nav-link")
    .forEach(link => {

      link.addEventListener(
        "click",
        () => {

          if (
            window.innerWidth <= 760 &&
            sidebar
          ) {

            sidebar.classList.remove(
              "open"
            );

          }

        }
      );

    });


  /* =======================================================
     ATALHOS DE TECLADO
  ======================================================= */

  document.addEventListener(
    "keydown",
    event => {

      if (
        (event.ctrlKey ||
         event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {

        event.preventDefault();

        const search =
          $(
            'input[type="search"], [data-search]'
          );

        if (search) {
          search.focus();
        }

      }

    }
  );


})();
