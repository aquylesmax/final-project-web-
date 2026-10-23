(() => {
  "use strict";

  /* ----------------------------------------
     1. DADOS E ELEMENTOS
  ---------------------------------------- */
  const events = Array.isArray(window.EVENTS)
    ? window.EVENTS
    : Array.isArray(window.events)
      ? window.events
      : [];

  const calendarGrid = document.getElementById("calendar-grid");
  const calendarMonth = document.getElementById("calendar-month");
  const prevButton = document.getElementById("calendar-prev");
  const nextButton = document.getElementById("calendar-next");

  const dayList = document.getElementById("selected-date-events");
  const dayLabel = document.getElementById("selected-date-label");

  const savedCount = document.getElementById("saved-count");
  const nextEvent = document.getElementById("next-event");
  const monthCount = document.getElementById("month-count");
  const error = document.getElementById("agenda-error");

  // Abas / listas
  const lists = {
    registered: {
      grid: document.getElementById("registered-events"),
      empty: document.getElementById("registered-empty"),
      panel: document.getElementById("panel-registered"),
      tab: document.getElementById("tab-registered"),
      count: document.getElementById("count-registered")
    },
    favorites: {
      grid: document.getElementById("favorite-events"),
      empty: document.getElementById("favorite-empty"),
      panel: document.getElementById("panel-favorites"),
      tab: document.getElementById("tab-favorites"),
      count: document.getElementById("count-favorites")
    },
    attended: {
      grid: document.getElementById("attended-events"),
      empty: document.getElementById("attended-empty"),
      panel: document.getElementById("panel-attended"),
      tab: document.getElementById("tab-attended"),
      count: document.getElementById("count-attended")
    }
  };

  if (!calendarGrid || !dayList || !lists.registered.grid) return;

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const icons = {
    Cultura: "🎨",
    Tecnologia: "💡",
    Gastronomia: "🍲",
    "Música": "🎵",
    Musica: "🎵",
    Esporte: "🏃",
    Feira: "🛍️"
  };

  const FAVORITES_KEY = "conecta:favorites";
  const ATTENDED_KEY = "conecta:attended";

  const today = new Date();
  const todayKey = toKey(today);

  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();
  let selectedDate = todayKey;
  let activeTab = "registered";

  /* ----------------------------------------
     2. FUNÇÕES AUXILIARES
  ---------------------------------------- */
  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  // Date -> AAAA-MM-DD
  function toKey(date) {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${date.getFullYear()}-${month}-${day}`;
  }

  function parseKey(key) {
    return new Date(`${key}T12:00:00`);
  }

  function formatDate(key) {
    const date = parseKey(key);

    if (Number.isNaN(date.getTime())) return "Data a confirmar";

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(date);
  }

  function formatShortDate(key) {
    const date = parseKey(key);

    if (Number.isNaN(date.getTime())) return "A confirmar";

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short"
    }).format(date).replace(".", "");
  }

  function findEvent(id) {
    return events.find(event => String(event.id) === String(id));
  }

  /* ----------------------------------------
     3. ARMAZENAMENTO
     - Inscrições: ConectaStorage (já existente)
     - Favoritos e histórico: localStorage próprio
  ---------------------------------------- */
  function getStorage() {
    return window.ConectaStorage || null;
  }

  function readList(key) {
    try {
      const value = JSON.parse(window.localStorage.getItem(key));
      return Array.isArray(value) ? value.map(String) : [];
    } catch (exception) {
      return [];
    }
  }

  function writeList(key, list) {
    window.localStorage.setItem(key, JSON.stringify(list));
  }

  function listHas(key, id) {
    return readList(key).includes(String(id));
  }

  function listSet(key, id, enabled) {
    const list = readList(key).filter(item => item !== String(id));

    if (enabled) list.push(String(id));
    writeList(key, list);
  }

  function isRegistered(id) {
    const storage = getStorage();

    return storage ? storage.isSaved(id) : false;
  }

  function setRegistered(event, enabled) {
    const storage = getStorage();

    if (!storage) throw new Error("storage indisponível");
    if (isRegistered(event.id) !== enabled) storage.toggleAgenda(event.id);
  }

  const isFavorite = id => listHas(FAVORITES_KEY, id);
  const isAttended = id => listHas(ATTENDED_KEY, id);

  function showError(message) {
    error.hidden = false;
    error.textContent = message;
  }

  /* ----------------------------------------
     4. AÇÕES
  ---------------------------------------- */
  function runAction(action, id) {
    const event = findEvent(id);

    if (!event) return;

    try {
      if (action === "toggle-register") {
        if (isRegistered(event.id)) {
          const ok = window.confirm(`Cancelar sua inscrição em "${event.title}"?`);

          if (!ok) return;
          setRegistered(event, false);
        } else {
          setRegistered(event, true);
        }
      }

      if (action === "toggle-fav") {
        listSet(FAVORITES_KEY, event.id, !isFavorite(event.id));
      }

      if (action === "toggle-attended") {
        const willAttend = !isAttended(event.id);

        listSet(ATTENDED_KEY, event.id, willAttend);

        // Ao marcar como "já participei", a inscrição deixa de ser necessária.
        if (willAttend && isRegistered(event.id)) setRegistered(event, false);
      }

      render();
    } catch (exception) {
      showError("Não foi possível atualizar sua agenda neste navegador. Atualize a página e tente novamente.");
    }
  }

  /* ----------------------------------------
     5. CARDS DE EVENTO
  ---------------------------------------- */
  // mode: "day" | "registered" | "favorites" | "attended"
  function renderCard(event, mode) {
    const id = escapeHTML(event.id);
    const category = escapeHTML(event.category || "Evento");
    const title = escapeHTML(event.title || "Evento sem título");
    const location = escapeHTML(event.location || "Local a confirmar");
    const description = escapeHTML(event.description || "Mais informações em breve.");
    const icon = icons[event.category] || "✳";

    const registered = isRegistered(event.id);
    const favorite = isFavorite(event.id);
    const attended = isAttended(event.id);
    const past = String(event.date) < todayKey;
    const canAttend = String(event.date) <= todayKey;
    const art = event.images
      ? `<img src="${escapeHTML(event.images[0])}" alt="" loading="lazy">`
      : icon;

    const registerButton = `
      <button class="button button-secondary agenda-save-button${registered ? " agenda-danger" : ""}" type="button"
              data-action="toggle-register" data-id="${id}" aria-pressed="${registered}">
        ${registered ? "Cancelar inscrição" : "Inscrever-se"}</button>`;

    const favoriteIcon = `
      <button class="button button-secondary agenda-fav-button" type="button"
              data-action="toggle-fav" data-id="${id}" aria-pressed="${favorite}"
              aria-label="${favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}"
              title="${favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}">
        ${favorite ? "♥" : "♡"}</button>`;

    const favoriteRemove = `
      <button class="button button-secondary agenda-fav-button agenda-danger has-text" type="button"
              data-action="toggle-fav" data-id="${id}">Remover dos favoritos</button>`;

    const attendedButton = canAttend
      ? `<button class="button button-secondary agenda-save-button" type="button"
                 data-action="toggle-attended" data-id="${id}" aria-pressed="${attended}">
           ${attended ? "Remover do histórico" : "Já participei"}</button>`
      : "";

    const attendedRemove = `
      <button class="button button-secondary agenda-save-button agenda-danger" type="button"
              data-action="toggle-attended" data-id="${id}">Remover do histórico</button>`;

    let actions;

    if (mode === "registered") actions = registerButton + favoriteIcon + attendedButton;
    else if (mode === "favorites") actions = favoriteRemove + registerButton;
    else if (mode === "attended") actions = attendedRemove + favoriteIcon;
    else actions = registerButton + favoriteIcon + attendedButton;

    return `
      <article class="agenda-card${past && mode !== "attended" ? " is-past" : ""}">
        <div class="agenda-card-art" data-category="${category}" aria-hidden="true">${art}</div>
        <div class="agenda-card-content">
          <div class="agenda-card-top">
            <span class="agenda-card-category">${category}</span>
            ${attended ? '<span class="agenda-badge is-done">Participei</span>' : past ? '<span class="agenda-badge">Encerrado</span>' : ""}
          </div>
          <p class="agenda-card-date">${escapeHTML(formatDate(event.date))}</p>
          <h4>${title}</h4>
          <p class="agenda-card-meta"><span aria-hidden="true">⌖</span> ${location}</p>
          <p class="agenda-card-description">${description}</p>
          <div class="agenda-card-footer">
            <a class="button" href="detalhes.html?id=${encodeURIComponent(event.id)}">Ver detalhes</a>
            ${actions}
          </div>
        </div>
      </article>`;
  }

  /* ----------------------------------------
     6. CALENDÁRIO
  ---------------------------------------- */
  function renderCalendar() {
    calendarMonth.textContent = `${monthNames[currentMonth]} de ${currentYear}`;

    const eventDates = new Set(events.map(event => event.date));
    const savedDates = new Set(
      events.filter(event => isRegistered(event.id)).map(event => event.date)
    );

    const firstWeekday = new Date(currentYear, currentMonth, 1).getDay();
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const cells = Math.ceil((firstWeekday + totalDays) / 7) * 7;

    let html = weekDays
      .map(day => `<div class="calendar-weekday">${day}</div>`)
      .join("");

    for (let index = 0; index < cells; index++) {
      const date = new Date(currentYear, currentMonth, index - firstWeekday + 1);
      const key = toKey(date);

      const classes = ["calendar-day"];
      if (date.getMonth() !== currentMonth) classes.push("is-outside");
      if (key === todayKey) classes.push("is-today");
      if (key === selectedDate) classes.push("is-selected");
      if (eventDates.has(key)) classes.push("has-event");
      if (savedDates.has(key)) classes.push("is-saved");

      html += `
        <button class="${classes.join(" ")}" type="button"
                data-date="${key}"
                aria-label="${escapeHTML(formatDate(key))}"
                aria-pressed="${key === selectedDate}">${date.getDate()}</button>`;
    }

    calendarGrid.innerHTML = html;
  }

  function changeMonth(step) {
    currentMonth += step;

    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    } else if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }

    render();
  }

  /* ----------------------------------------
     7. LISTAS E RESUMO
  ---------------------------------------- */
  function renderSummary(registered) {
    savedCount.textContent = registered.length;

    const upcoming = registered.find(event => event.date >= todayKey);

    nextEvent.textContent = upcoming
      ? `${formatShortDate(upcoming.date)} · ${upcoming.title}`
      : "Nenhum";

    const prefix = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;

    monthCount.textContent = registered.filter(
      event => String(event.date).startsWith(prefix)
    ).length;
  }

  function renderSelectedDay() {
    dayLabel.textContent = formatDate(selectedDate);

    const matches = events.filter(event => event.date === selectedDate);

    dayList.innerHTML = matches.length
      ? matches.map(event => renderCard(event, "day")).join("")
      : `<div class="agenda-empty">
           <span class="agenda-empty-icon" aria-hidden="true">🗓️</span>
           <h3>Nenhum evento nesta data</h3>
           <p>Selecione outro dia no calendário.</p>
         </div>`;
  }

  function renderList(name, items, mode) {
    const list = lists[name];

    list.grid.innerHTML = items.map(event => renderCard(event, mode)).join("");
    list.grid.hidden = items.length === 0;
    list.empty.hidden = items.length !== 0;
    list.count.textContent = items.length;
  }

  function renderTabs() {
    Object.entries(lists).forEach(([name, list]) => {
      const active = name === activeTab;

      list.tab.classList.toggle("is-active", active);
      list.tab.setAttribute("aria-selected", String(active));
      list.panel.hidden = !active;
    });
  }

  const byDateAsc = (a, b) => String(a.date).localeCompare(String(b.date));
  const byDateDesc = (a, b) => String(b.date).localeCompare(String(a.date));

  function render() {
    error.hidden = true;

    const registered = events.filter(event => isRegistered(event.id)).sort(byDateAsc);
    const favorites = events.filter(event => isFavorite(event.id)).sort(byDateAsc);
    const attended = events.filter(event => isAttended(event.id)).sort(byDateDesc);

    renderCalendar();
    renderSummary(registered);
    renderSelectedDay();
    renderList("registered", registered, "registered");
    renderList("favorites", favorites, "favorites");
    renderList("attended", attended, "attended");
    renderTabs();
  }

  /* ----------------------------------------
     8. EVENTOS DE CLIQUE
  ---------------------------------------- */
  prevButton.addEventListener("click", () => changeMonth(-1));
  nextButton.addEventListener("click", () => changeMonth(1));

  document.addEventListener("click", event => {
    const dayButton = event.target.closest("[data-date]");
    const actionButton = event.target.closest("[data-action]");
    const tabButton = event.target.closest("[data-tab]");

    if (dayButton) {
      const date = parseKey(dayButton.dataset.date);

      selectedDate = dayButton.dataset.date;
      currentMonth = date.getMonth();
      currentYear = date.getFullYear();
      render();
      return;
    }

    if (tabButton) {
      activeTab = tabButton.dataset.tab;
      renderTabs();
      return;
    }

    if (actionButton) {
      runAction(actionButton.dataset.action, actionButton.dataset.id);
    }
  });

  /* ----------------------------------------
     9. INICIALIZAÇÃO
  ---------------------------------------- */
  render();

  if (events.length === 0) {
    showError("Não encontramos dados de eventos. Verifique js/data.js.");
  }
})();
