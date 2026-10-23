(() => {
  "use strict";

  /* ----------------------------------------
     1. ELEMENTOS
  ---------------------------------------- */
  const form = document.getElementById("profile-form");
  const nameInput = document.getElementById("profile-name-input");
  const cityInput = document.getElementById("profile-city-input");
  const message = document.getElementById("profile-message");

  const cardName = document.getElementById("profile-name");
  const cardCity = document.getElementById("profile-city");
  const cardInitial = document.getElementById("profile-initial");
  const savedCount = document.getElementById("profile-saved-count");
  const interestCount = document.getElementById("profile-interest-count");

  const lightButton = document.getElementById("light-theme");
  const darkButton = document.getElementById("dark-theme");

  const notificationsList = document.getElementById("notifications-list");
  const notificationsEmpty = document.getElementById("notifications-empty");
  const notificationsCount = document.getElementById("notifications-count");
  const readAllButton = document.getElementById("notifications-read-all");

  if (!form || !nameInput || !cityInput) return;

  const DEFAULT_PROFILE = { name: "Visitante", city: "Sorocaba", interests: [] };

  const events = Array.isArray(window.EVENTS)
    ? window.EVENTS
    : Array.isArray(window.events)
      ? window.events
      : [];

  /* ----------------------------------------
     2. ACESSO AO STORAGE
     Aceita ConectaStorage.fn() ou funções globais de storage.js.
  ---------------------------------------- */
  function callStorage(name, ...args) {
    const storage = window.ConectaStorage;

    if (storage && typeof storage[name] === "function") {
      return storage[name](...args);
    }

    if (typeof window[name] === "function") {
      return window[name](...args);
    }

    throw new Error(`Função de storage indisponível: ${name}`);
  }

  function safeCall(name, fallback, ...args) {
    try {
      const result = callStorage(name, ...args);

      return result === undefined ? fallback : result;
    } catch (exception) {
      return fallback;
    }
  }

  function getProfile() {
    const profile = safeCall("getProfile", DEFAULT_PROFILE) || DEFAULT_PROFILE;

    return {
      name: profile.name || DEFAULT_PROFILE.name,
      city: profile.city || DEFAULT_PROFILE.city,
      interests: Array.isArray(profile.interests) ? profile.interests : []
    };
  }

  function getNotifications() {
    const list = safeCall("getNotifications", []);

    return Array.isArray(list) ? list : [];
  }

  /* ----------------------------------------
     3. FUNÇÕES AUXILIARES
  ---------------------------------------- */
  function getInitial(name) {
    return name && name.trim() ? name.trim().charAt(0).toUpperCase() : "V";
  }

  function getCheckboxes() {
    return form.querySelectorAll('input[name="interests"]');
  }

  function showMessage(text, state) {
    message.textContent = text;

    if (state) {
      message.dataset.state = state;
    } else {
      delete message.dataset.state;
    }
  }

  function countSavedEvents() {
    return events.filter(event => safeCall("isSaved", false, event.id)).length;
  }

  /* ----------------------------------------
     4. PERFIL
  ---------------------------------------- */
  function renderProfile() {
    const profile = getProfile();

    cardName.textContent = profile.name;
    cardCity.textContent = profile.city;
    cardInitial.textContent = getInitial(profile.name);

    nameInput.value = profile.name;
    cityInput.value = profile.city;

    getCheckboxes().forEach(checkbox => {
      checkbox.checked = profile.interests.includes(checkbox.value);
    });

    interestCount.textContent = profile.interests.length;
    savedCount.textContent = countSavedEvents();
  }

  function validateField(input) {
    const valid = input.value.trim().length > 0;

    input.setAttribute("aria-invalid", String(!valid));

    return valid;
  }

  function handleSubmit(event) {
    event.preventDefault();

    const validName = validateField(nameInput);
    const validCity = validateField(cityInput);

    if (!validName || !validCity) {
      showMessage("Preencha nome e cidade.", "error");
      (validName ? cityInput : nameInput).focus();
      return;
    }

    const interests = Array.from(getCheckboxes())
      .filter(checkbox => checkbox.checked)
      .map(checkbox => checkbox.value);

    try {
      callStorage("saveProfile", {
        name: nameInput.value.trim(),
        city: cityInput.value.trim(),
        interests
      });
    } catch (exception) {
      showMessage("Não foi possível salvar seu perfil neste navegador.", "error");
      return;
    }

    safeCall("addNotification", null, "Seu perfil foi atualizado.");

    renderProfile();
    renderNotifications();
    showMessage("Perfil atualizado com sucesso.", "success");
  }

  /* ----------------------------------------
     5. TEMA
  ---------------------------------------- */
  function getCurrentTheme() {
    return safeCall("getTheme", "light") === "dark" ? "dark" : "light";
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
  }

  
    function updateThemeButtons(theme = getCurrentTheme()) {
      const isDark = theme === "dark";

      if (lightButton) {
        lightButton.classList.toggle("selected", !isDark);
        lightButton.setAttribute("aria-pressed", String(!isDark));
      }

      if (darkButton) {
        darkButton.classList.toggle("selected", isDark);
        darkButton.setAttribute("aria-pressed", String(isDark));
      }
    }

    function changeTheme(theme) {
      if (theme !== "light" && theme !== "dark") return;

      safeCall("setTheme", null, theme);
      applyTheme(theme);
      updateThemeButtons(theme);

      safeCall(
        "addNotification",
        null,
        theme === "dark"
          ? "Tema escuro ativado."
          : "Tema claro ativado."
      );

      renderNotifications();
    }


  /* ----------------------------------------
     6. NOTIFICAÇÕES
  ---------------------------------------- */
  function createNotification(notification) {
    const article = document.createElement("article");
    article.className = notification.read
      ? "notification-item read"
      : "notification-item";

    const content = document.createElement("div");
    const title = document.createElement("strong");
    const text = document.createElement("p");

    title.textContent = "Conecta+";
    text.textContent = notification.message;
    content.append(title, text);
    article.appendChild(content);

    if (!notification.read) {
      const button = document.createElement("button");

      button.className = "notification-read";
      button.type = "button";
      button.dataset.readId = notification.id;
      button.textContent = "Marcar como lida";
      article.appendChild(button);
    }

    return article;
  }

  function renderNotifications() {
    const notifications = getNotifications();
    const unread = notifications.filter(item => !item.read);

    notificationsList.replaceChildren(...notifications.map(createNotification));
    notificationsEmpty.hidden = notifications.length !== 0;

    notificationsCount.hidden = unread.length === 0;
    notificationsCount.textContent = unread.length;
    readAllButton.hidden = unread.length === 0;
  }

  function markAsRead(id) {
    const original = getNotifications().find(item => String(item.id) === String(id));

    safeCall("markNotificationRead", null, original ? original.id : id);
    renderNotifications();
  }

  function markAllAsRead() {
    getNotifications()
      .filter(item => !item.read)
      .forEach(item => safeCall("markNotificationRead", null, item.id));

    renderNotifications();
  }

  /* ----------------------------------------
     7. EVENTOS
  ---------------------------------------- */
  form.addEventListener("submit", handleSubmit);

  [nameInput, cityInput].forEach(input => {
    input.addEventListener("input", () => {
      if (input.getAttribute("aria-invalid") === "true") validateField(input);
    });
  });

  lightButton.addEventListener("click", () => changeTheme("light"));
  darkButton.addEventListener("click", () => changeTheme("dark"));
  readAllButton.addEventListener("click", markAllAsRead);

  notificationsList.addEventListener("click", event => {
    const button = event.target.closest("[data-read-id]");

    if (button) markAsRead(button.dataset.readId);
  });

  /* ----------------------------------------
     8. INICIALIZAÇÃO
  ---------------------------------------- */
  applyTheme(getCurrentTheme());
  renderProfile();
  updateThemeButtons();
  renderNotifications();
})();
