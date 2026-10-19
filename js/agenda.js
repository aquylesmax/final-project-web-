/* ========================================
   CONECTA+ | MINHA AGENDA
   Arquivo: js/agenda.js
======================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ----------------------------------------
     1. ELEMENTOS DA PÁGINA
  ---------------------------------------- */
  const calendarGrid = document.querySelector(".calendar-grid");
  const calendarMonth = document.querySelector(".calendar-month");

  const registeredContainer = document.querySelector("#registered-events");
  const favoritesContainer = document.querySelector("#favorite-events");
  const selectedContainer = document.querySelector("#selected-date-events");
  const selectedLabel = document.querySelector("#selected-date-label");

  const registrationCount = document.querySelector("#registration-count");
  const favoriteCount = document.querySelector("#favorite-count");
  const nextEventLabel = document.querySelector("#next-event");

  /* ----------------------------------------
     2. ESTADO E CONSTANTES
  ---------------------------------------- */
  const REGISTRATIONS_KEY = "conecta_registrations";
  const FAVORITES_KEY = "conecta_favorites";

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril",
    "Maio", "Junho", "Julho", "Agosto",
    "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const today = new Date();

  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();
  let selectedDate = formatDate(today);

  /* ----------------------------------------
     3. FUNÇÕES AUXILIARES
  ---------------------------------------- */

  // Converte um Date para AAAA-MM-DD.
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  // Converte AAAA-MM-DD para DD/MM/AAAA.
  function formatDisplayDate(dateString) {
    if (!dateString) return "Data não informada";

    const parts = dateString.split("-");

    return parts.length === 3
      ? `${parts[2]}/${parts[1]}/${parts[0]}`
      : dateString;
  }

  // Evita que textos do evento quebrem o HTML.
  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[character]);
  }

  // Extrai o id de um item que pode ser número, texto ou objeto.
  function extractId(item) {
    return String(typeof item === "object" && item !== null
      ? item.eventId ?? item.id
      : item);
  }

  /* ----------------------------------------
     4. DADOS: EVENTOS, INSCRIÇÕES E FAVORITOS
  ---------------------------------------- */

  function getEvents() {
    if (Array.isArray(window.events)) return window.events;
    if (Array.isArray(window.EVENTS)) return window.EVENTS;

    return [];
  }

  // Aceita AAAA-MM-DD ou DD/MM/AAAA e devolve AAAA-MM-DD.
  function getEventDate(event) {
    const value = event.date || event.data || event.eventDate;

    if (!value) return "";

    const iso = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

    const br = String(value).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (br) return `${br[3]}-${br[2]}-${br[1]}`;

    return "";
  }

  // Lê uma lista salva, preferindo a função compartilhada do projeto.
  function readIds(sharedFunctionName, storageKey) {
    const sharedFunction = window[sharedFunctionName];

    if (typeof sharedFunction === "function") {
      const list = sharedFunction();

      if (Array.isArray(list)) return list.map(extractId);
    }

    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");

      return Array.isArray(saved) ? saved.map(extractId) : [];
    } catch {
      return [];
    }
  }

  // Remove um id da lista salva no localStorage (plano B).
  function removeFromLocalList(key, eventId) {
    try {
      const list = JSON.parse(localStorage.getItem(key) || "[]");
      const updated = list.filter(item => extractId(item) !== String(eventId));

      localStorage.setItem(key, JSON.stringify(updated));
    } catch (error) {
      console.error("Não foi possível atualizar a agenda:", error);
    }
  }

  function isRegistered(event) {
    if (typeof window.isRegistered === "function") {
      return window.isRegistered(event.id);
    }

    return readIds("getRegistrations", REGISTRATIONS_KEY)
      .includes(String(event.id));
  }

  function isFavorite(event) {
    return readIds("getFavorites", FAVORITES_KEY)
      .includes(String(event.id));
  }

  /* ----------------------------------------
     5. CALENDÁRIO
  ---------------------------------------- */

  function renderCalendar() {
    if (!calendarGrid) return;

    if (calendarMonth) {
      calendarMonth.textContent =
        `${monthNames[currentMonth]} de ${currentYear}`;
    }

    calendarGrid.innerHTML = "";

    // Cabeçalho com os dias da semana.
    weekDays.forEach(day => {
      const weekday = document.createElement("div");

      weekday.className = "calendar-weekday";
      weekday.textContent = day;
      calendarGrid.appendChild(weekday);
    });

    const events = getEvents();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const previousMonthLastDay = new Date(currentYear, currentMonth, 0);

    // --- Dias do mês anterior ---
    for (let i = firstDay.getDay() - 1; i >= 0; i--) {
      const dayNumber = previousMonthLastDay.getDate() - i;

      createCalendarDay(
        new Date(currentYear, currentMonth - 1, dayNumber), true, events
      );
    }

    // --- Dias do mês atual ---
    for (let day = 1; day <= lastDay.getDate(); day++) {
      createCalendarDay(
        new Date(currentYear, currentMonth, day), false, events
      );
    }

    // --- Dias do próximo mês (completa a última semana) ---
    const filledCells = calendarGrid.children.length - weekDays.length;
    const remaining = (7 - (filledCells % 7)) % 7;

    for (let day = 1; day <= remaining; day++) {
      createCalendarDay(
        new Date(currentYear, currentMonth + 1, day), true, events
      );
    }
  }

  function createCalendarDay(date, outsideMonth, events) {
    const dateString = formatDate(date);
    const button = document.createElement("button");

    button.type = "button";
    button.className = "calendar-day";
    button.textContent = date.getDate();
    button.setAttribute("aria-label", formatDisplayDate(dateString));

    if (outsideMonth) button.classList.add("is-outside");
    if (dateString === formatDate(today)) button.classList.add("is-today");

    if (dateString === selectedDate) {
      button.classList.add("is-selected");
      button.setAttribute("aria-pressed", "true");
    }

    if (events.some(event => getEventDate(event) === dateString)) {
      button.classList.add("has-event");
    }

    button.addEventListener("click", () => {
      selectedDate = dateString;
      currentMonth = date.getMonth();
      currentYear = date.getFullYear();

      renderCalendar();
      renderEvents();
    });

    calendarGrid.appendChild(button);
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

    renderCalendar();
  }

  /* ----------------------------------------
     6. CARDS DE EVENTO
  ---------------------------------------- */

  // Monta os botões conforme o estado do evento.
  function createActionButtons(event) {
    const id = escapeHTML(event.id);
    const buttons = [];

    if (isRegistered(event)) {
      buttons.push(`
        <button type="button" class="agenda-button is-secondary"
                data-action="cancel-registration" data-event-id="${id}">
          Cancelar inscrição
        </button>`);
    }

    if (isFavorite(event)) {
      buttons.push(`
        <button type="button" class="agenda-button is-secondary"
                data-action="remove-favorite" data-event-id="${id}">
          Remover favorito
        </button>`);
    }

    return buttons.join("");
  }

  function createEventCard(event) {
    const eventDate = getEventDate(event);
    const parts = eventDate ? eventDate.split("-") : [];

    const day = parts[2] || "--";
    const month = parts[1] ? monthNames[Number(parts[1]) - 1].slice(0, 3) : "---";

    const title = escapeHTML(event.title || event.name || "Evento");
    const description = escapeHTML(
      event.description || "Confira os detalhes deste evento."
    );
    const time = escapeHTML(event.time || event.horario || "");
    const location = escapeHTML(
      event.location || event.local || event.address || ""
    );

    const card = document.createElement("article");
    card.className = "agenda-event-card";

    card.innerHTML = `
      <div class="agenda-event-date">
        <span class="agenda-event-date-day">${day}</span>
        <span class="agenda-event-date-month">${month}</span>
      </div>

      <div class="agenda-event-content">
        <h3 class="agenda-event-title">${title}</h3>
        <p class="agenda-event-description">${description}</p>

        <div class="agenda-event-meta">
          ${time ? `<span>Horário: ${time}</span>` : ""}
          ${location ? `<span>Local: ${location}</span>` : ""}
        </div>

        <div class="agenda-event-actions">
          <a class="agenda-button"
             href="detalhes.html?id=${encodeURIComponent(event.id)}">
            Ver detalhes
          </a>
          ${createActionButtons(event)}
        </div>
      </div>
    `;

    return card;
  }

  /* ----------------------------------------
     7. LISTAS E RESUMO
  ---------------------------------------- */

  function renderEmptyState(container, icon, title, text) {
    container.innerHTML = `
      <div class="agenda-empty">
        <div class="agenda-empty-icon">${icon}</div>
        <h3>${title}</h3>
        <p>${text}</p>
      </div>
    `;
  }

  function renderList(container, list, emptyState) {
    if (!container) return;

    container.innerHTML = "";

    if (list.length === 0) {
      renderEmptyState(container, ...emptyState);
      return;
    }

    list.forEach(event => container.appendChild(createEventCard(event)));
  }

  // Mostra o título do próximo evento em que o usuário está inscrito.
  function renderNextEvent(registered) {
    if (!nextEventLabel) return;

    const todayString = formatDate(today);

    const upcoming = registered
      .filter(event => getEventDate(event) >= todayString)
      .sort((a, b) => getEventDate(a).localeCompare(getEventDate(b)))[0];

    nextEventLabel.textContent = upcoming
      ? formatDisplayDate(getEventDate(upcoming))
      : "Nenhum";

    nextEventLabel.title = upcoming
      ? upcoming.title || upcoming.name || ""
      : "";
  }

  function renderEvents() {
    const events = getEvents();
    const registered = events.filter(isRegistered);
    const favorites = events.filter(isFavorite);
    const selectedEvents = events.filter(
      event => getEventDate(event) === selectedDate
    );

    // --- Resumo ---
    if (registrationCount) registrationCount.textContent = registered.length;
    if (favoriteCount) favoriteCount.textContent = favorites.length;
    renderNextEvent(registered);

    // --- Eventos do dia selecionado ---
    if (selectedLabel) {
      selectedLabel.textContent = formatDisplayDate(selectedDate);
    }

    renderList(selectedContainer, selectedEvents, [
      "🗓️",
      "Nenhum evento nesta data",
      "Selecione outro dia no calendário para consultar os eventos."
    ]);

    // --- Inscrições ---
    renderList(registeredContainer, registered, [
      "📅",
      "Nenhuma inscrição encontrada",
      "Quando você se inscrever em eventos, eles aparecerão aqui."
    ]);

    // --- Favoritos ---
    renderList(favoritesContainer, favorites, [
      "☆",
      "Nenhum favorito encontrado",
      "Os eventos que você favoritar aparecerão aqui."
    ]);
  }

  function refresh() {
    renderCalendar();
    renderEvents();
  }

  /* ----------------------------------------
     8. EVENTOS DE CLIQUE
  ---------------------------------------- */

  // --- Navegação entre meses ---
  document.querySelectorAll("[data-calendar-prev]").forEach(button => {
    button.addEventListener("click", () => changeMonth(-1));
  });

  document.querySelectorAll("[data-calendar-next]").forEach(button => {
    button.addEventListener("click", () => changeMonth(1));
  });

  // --- Cancelar inscrição / remover favorito ---
  document.addEventListener("click", clickEvent => {
    const button = clickEvent.target.closest("[data-action]");

    if (!button) return;

    const { action, eventId } = button.dataset;

    if (action === "cancel-registration") {
      if (typeof window.cancelRegistration === "function") {
        window.cancelRegistration(eventId);
      } else {
        removeFromLocalList(REGISTRATIONS_KEY, eventId);
      }
    }

    if (action === "remove-favorite") {
      if (typeof window.toggleFavorite === "function") {
        window.toggleFavorite(eventId);
      } else {
        removeFromLocalList(FAVORITES_KEY, eventId);
      }
    }

    refresh();
  });

  /* ----------------------------------------
     9. INICIALIZAÇÃO
  ---------------------------------------- */
  refresh();
});
