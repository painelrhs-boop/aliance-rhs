/* =========================================================
   ALIANCE R.H.S — ADMIN PANEL
   Raven Hells System
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initAdmin();
});

async function initAdmin() {
  bindLogin();
  bindLogout();
  bindSections();
  bindCommunity();

  await checkAdminSession();
}

/* =========================================================
   LOGIN
   ========================================================= */

function bindLogin() {
  const form = document.querySelector("#admin-login-form");

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const emailInput = document.querySelector("#admin-email");
    const passwordInput = document.querySelector("#admin-password");
    const button = document.querySelector("#admin-login-button");
    const message = document.querySelector("#admin-login-message");

    const email = emailInput?.value.trim();
    const password = passwordInput?.value;

    if (!email || !password) {
      setMessage(
        message,
        "Preencha o e-mail e a senha.",
        "error"
      );
      return;
    }

    setButtonLoading(button, true);

    setMessage(
      message,
      "Verificando acesso...",
      "info"
    );

    try {
      const result = await window.RHS.adminLogin(
        email,
        password
      );

      if (
        result?.authenticated === false ||
        result?.success === false
      ) {
        throw new Error(
          result?.message ||
          result?.error ||
          "E-mail ou senha inválidos."
        );
      }

      showAdminPanel(result);

      showToast(
        "Login realizado com sucesso.",
        "success"
      );
    } catch (error) {
      console.error(error);

      setMessage(
        message,
        error?.message ||
          "Não foi possível realizar o login.",
        "error"
      );
    } finally {
      setButtonLoading(button, false);
    }
  });
}

/* =========================================================
   SESSION
   ========================================================= */

async function checkAdminSession() {
  const login = document.querySelector("#admin-login");
  const panel = document.querySelector("#admin-panel");

  if (!login || !panel) return;

  try {
    const session = await window.RHS.getAdminSession();

    const authenticated =
      session?.authenticated === true ||
      session?.loggedIn === true ||
      Boolean(session?.user);

    if (authenticated) {
      showAdminPanel(session);
    } else {
      showLogin();
    }
  } catch (error) {
    console.warn(
      "Sessão administrativa não encontrada.",
      error
    );

    showLogin();
  }
}

/* =========================================================
   UI LOGIN / PAINEL
   ========================================================= */

function showLogin() {
  const login = document.querySelector("#admin-login");
  const panel = document.querySelector("#admin-panel");

  if (login) {
    login.hidden = false;
    login.style.display = "";
  }

  if (panel) {
    panel.hidden = true;
    panel.style.display = "none";
  }
}

function showAdminPanel(session = {}) {
  const login = document.querySelector("#admin-login");
  const panel = document.querySelector("#admin-panel");

  if (login) {
    login.hidden = true;
    login.style.display = "none";
  }

  if (panel) {
    panel.hidden = false;
    panel.style.display = "";
  }

  fillAdminUser(session);
  loadHistory();
}

/* =========================================================
   USER DATA
   ========================================================= */

function fillAdminUser(session) {
  const user =
    session?.user ||
    session?.admin ||
    session?.account ||
    session;

  const name =
    user?.name ||
    user?.username ||
    user?.email ||
    "Administrador";

  const email =
    user?.email ||
    session?.email ||
    "—";

  const nameElement =
    document.querySelector("#admin-user-name");

  const emailElement =
    document.querySelector("#admin-user-email");

  if (nameElement) {
    nameElement.textContent = name;
  }

  if (emailElement) {
    emailElement.textContent = email;
  }

  const status =
    document.querySelector("#session-status");

  if (status) {
    status.textContent = "Sessão ativa";
  }
}

/* =========================================================
   LOGOUT
   ========================================================= */

function bindLogout() {
  const buttons = document.querySelectorAll(
    "[data-admin-logout], #admin-logout"
  );

  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await window.RHS.adminLogout();
      } catch (error) {
        console.warn(
          "Erro ao encerrar sessão:",
          error
        );
      }

      showLogin();

      const email =
        document.querySelector("#admin-email");

      const password =
        document.querySelector("#admin-password");

      const message =
        document.querySelector("#admin-login-message");

      if (email) email.value = "";
      if (password) password.value = "";

      setMessage(
        message,
        "Sessão encerrada.",
        "info"
      );

      showToast(
        "Você saiu do painel.",
        "success"
      );
    });
  });
}

/* =========================================================
   SECTIONS
   ========================================================= */

function bindSections() {
  const buttons = document.querySelectorAll(
    "[data-admin-section]"
  );

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const target =
        button.dataset.adminSection;

      if (!target) return;

      activateSection(target);
    });
  });
}

function activateSection(sectionName) {
  const buttons = document.querySelectorAll(
    "[data-admin-section]"
  );

  buttons.forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.adminSection === sectionName
    );
  });

  const sections = document.querySelectorAll(
    "[data-admin-content]"
  );

  let found = false;

  sections.forEach((section) => {
    const matches =
      section.dataset.adminContent === sectionName;

    section.hidden = !matches;

    if (matches) {
      section.style.display = "";
      found = true;
    } else {
      section.style.display = "none";
    }
  });

  if (!found) {
    const fallback =
      document.querySelector(
        `#admin-section-${sectionName}`
      );

    if (fallback) {
      fallback.hidden = false;
      fallback.style.display = "";
    }
  }
}

/* =========================================================
   HISTORY
   ========================================================= */

async function loadHistory() {
  const container =
    document.querySelector("#admin-history-list");

  if (!container) return;

  container.innerHTML = `
    <div class="admin-loading">
      Carregando histórico...
    </div>
  `;

  try {
    const result =
      await window.RHS.getAdminHistory();

    const history =
      Array.isArray(result)
        ? result
        : result?.history ||
          result?.items ||
          result?.data ||
          [];

    renderHistory(container, history);
  } catch (error) {
    console.warn(
      "Não foi possível carregar o histórico.",
      error
    );

    container.innerHTML = `
      <div class="admin-empty">
        <strong>Histórico indisponível</strong>
        <span>
          Não foi possível carregar os registros agora.
        </span>
      </div>
    `;
  }
}

function renderHistory(container, history) {
  if (!history.length) {
    container.innerHTML = `
      <div class="admin-empty">
        <strong>Nenhum registro encontrado</strong>
        <span>
          O histórico aparecerá aqui quando houver atividades.
        </span>
      </div>
    `;

    return;
  }

  container.innerHTML = history
    .map((item) => {
      const action =
        item?.action ||
        item?.event ||
        item?.type ||
        "Atividade";

      const user =
        item?.user ||
        item?.email ||
        item?.admin ||
        "Administrador";

      const date =
        item?.date ||
        item?.created_at ||
        item?.createdAt ||
        item?.timestamp;

      return `
        <div class="history-item">
          <div class="history-item-main">
            <strong>${escapeHTML(action)}</strong>
            <span>${escapeHTML(user)}</span>
          </div>

          <time>
