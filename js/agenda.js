
/* ========================================
   CONECTA+ | MINHA AGENDA
   Arquivo: js/agenda.js
======================================== */

document.addEventListener("DOMContentLoaded", () => {
  const calendarGrid = document.querySelector(".calendar-grid");
  const calendarMonth = document.querySelector(".calendar-month");

  const registeredContainer =
    document.querySelector("#registered-events") ||
    document.querySelector(".registered-events");

  const favoritesContainer =
    document.querySelector("#favorite-events") ||
    document.querySelector(".favorite-events");

  const registrationCount =
    document.querySelector("#registration-count");

  const favoriteCount =
    document.querySelector("#favorite-count");

  const today = new Date();

  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();
  let selectedDate = formatDate(today);

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril",
    "Maio", "Junho", "Julho", "Agosto",
    "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // Obtém os eventos disponibilizados pelo projeto.
  function getEvents() {
    if (Array.isArray(window.events)) {
      return window.events;
    }

    if (Array.isArray(window.EVENTS)) {
      return window.EVENTS;
    }

    return [];
  }

  // Converte uma data para o formato AAAA-MM-DD.
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  // Lê uma data do evento sem depender do formato visual.
  function getEventDate(event) {
    const value = event.date || event.data || event.eventDate;

    if (!value) return "";

    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (match) return `${match[1]}-${match[2]}-${match[3]}`;

    const brMatch = String(value).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

    if (brMatch) {
      return `${brMatch[3]}-${brMatch[2]}-${brMatch[1]}`;
    }

    return "";
  }

  // Lê inscrições usando as funções compartilhadas, se disponíveis.
  function getRegisteredIds() {
    if (typeof window.getRegistrations === "function") {
      const registrations = window.getRegistrations();

      if (Array.isArray(registrations)) {
        return registrations.map(item =>
          String(typeof item === "object" ? item.eventId ?? item.id : item)
        );
      }
    }

    try {
      const saved = JSON.parse(
        localStorage.getItem("conecta_registrations") || "[]"
      );

      return Array.isArray(saved)
        ? saved.map(item =>
            String(typeof item === "object" ? item.eventId ?? item.id : item)
          )
        : [];
    } catch {
      return [];
    }
  }

  // Lê favoritos usando as funções compartilhadas, se disponíveis.
  function getFavoriteIds() {
    if (typeof window.getFavorites === "function") {
      const favorites = window.getFavorites();

      if (Array.isArray(favorites)) {
        return favorites.map(item =>
          String(typeof item === "object" ? item.eventId ?? item.id : item)
        );
      }
    }

    try {
      const saved = JSON.parse(
        localStorage.getItem("conecta_favorites") || "[]"
      );

      return Array.isArray(saved)
        ? saved.map(item =>
            String(typeof item === "object" ? item.eventId ?? item.id : item)
          )
        : [];
    } catch {
      return [];
    }
  }

  function isRegistered(event) {
    if (typeof window.isRegistered === "function") {
      return window.isRegistered(event.id);
    }

    return getRegisteredIds().includes(String(event.id));
  }

  function isFavorite(event) {
    return getFavoriteIds().includes(String(event.id));
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[character]);
  }

  function formatDisplayDate(dateString) {
    if (!dateString) return "Data não informada";

    const parts = dateString.split("-");

    if (parts.length !== 3) return dateString;

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  // Cria o calendário do mês selecionado.
  function renderCalendar() {
    if (!calendarGrid) return;

    if (calendarMonth) {
      calendarMonth.textContent =
        `${monthNames[currentMonth]} de ${currentYear}`;
    }

    calendarGrid.innerHTML = "";

    weekDays.forEach(day => {
      const weekday = document.createElement("div");
      weekday.className = "calendar-weekday";
      weekday.textContent = day;
      calendarGrid.appendChild(weekday);
    });

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const previousMonthLastDay = new Date(currentYear, currentMonth, 0);

    const events = getEvents();

    // Dias do mês anterior.
    for (let i = firstDay.getDay() - 1; i >= 0; i--) {
      const dayNumber = previousMonthLastDay.getDate() - i;
      const date = new Date(currentYear, currentMonth - 1, dayNumber);

      createCalendarDay(date, true, events);
    }

    // Dias do mês atual.
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(currentYear, currentMonth, day);

      createCalendarDay(date, false, events);
    }

    // Completa a última semana.
    const totalCells = calendarGrid.children.length - 7;
    const remaining = (7 - (totalCells % 7)) % 7;

    for (let day = 1; day <= remaining; day++) {
      const date = new Date(currentYear, currentMonth + 1, day);

      createCalendarDay(date, true, events);
    }
  }

  function createCalendarDay(date, outsideMonth, events) {
    const dateString = formatDate(date);
    const button = document.createElement("button");

    button.type = "button";
    button.className = "calendar-day";
    button.textContent = date.getDate();
    button.setAttribute("aria-label", formatDisplayDate(dateString));

    if (outsideMonth) {
      button.classList.add("is-outside");
    }

    if (dateString === formatDate(today)) {
      button.classList.add("is-today");
    }

    if (dateString === selectedDate) {
      button.classList.add("is-selected");
    }

    const hasEvent = events.some(
      event => getEventDate(event) === dateString
    );

    if (hasEvent) {
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

  // Cria um card de evento.
  function createEventCard(event, favorite = false) {
    const eventDate = getEventDate(event);
    const parts = eventDate ? eventDate.split("-") : [];

    const day = parts[2] || "--";
    const month = parts[1]
      ? monthNames[Number(parts[1]) - 1].slice(0, 3)
      : "---";

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

          ${
            favorite
              ? `<button type="button"
                  class="agenda-button is-secondary"
                  data-action="remove-favorite"
                  data-event-id="${escapeHTML(event.id)}">
                  Remover favorito
                </button>`
              : `<button type="button"
                  class="agenda-button is-secondary"
                  data-action="cancel-registration"
                  data-event-id="${escapeHTML(event.id)}">
                  Cancelar inscrição
                </button>`
          }
        </div>
      </div>
    `;

    return card;
  }

  // Atualiza as listas de inscrições e favoritos.
  function renderEvents() {
    const events = getEvents();
    const registered = events.filter(isRegistered);
    const favorites = events.filter(isFavorite);

    if (registrationCount) {
      registrationCount.textContent = registered.length;
    }

    if (favoriteCount) {
      favoriteCount.textContent = favorites.length;
    }

    if (registeredContainer) {
      registeredContainer.innerHTML = "";

      if (registered.length === 0) {
        registeredContainer.innerHTML = `
          <div class="agenda-empty">
            <div class="agenda-empty-icon">📅</div>
            <h3>Nenhuma inscrição encontrada</h3>
            <p>Quando você se inscrever em eventos, eles aparecerão aqui.</p>
          </div>
        `;
      } else {
        registered.forEach(event => {
          registeredContainer.appendChild(createEventCard(event));
        });
      }
    }

    if (favoritesContainer) {
      favoritesContainer.innerHTML = "";

      if (favorites.length === 0) {
        favoritesContainer.innerHTML = `
          <div class="agenda-empty">
            <div class="agenda-empty-icon">☆</div>
            <h3>Nenhum favorito encontrado</h3>
            <p>Os eventos que você favoritar aparecerão aqui.</p>
          </div>
        `;
      } else {
        favorites.forEach(event => {
          favoritesContainer.appendChild(createEventCard(event, true));
        });
      }
    }

    renderSelectedDateEvents(events);
  }

  // Mostra os eventos que acontecem na data selecionada,
  // caso exista uma área para isso no HTML.
  function renderSelectedDateEvents(events) {
    const selectedContainer =
      document.querySelector("#selected-date-events") ||
      document.querySelector(".selected-date-events");

    if (!selectedContainer) return;

    const matches = events.filter(
      event => getEventDate(event) === selectedDate
    );

    selectedContainer.innerHTML = "";

    if (matches.length === 0) {
      selectedContainer.innerHTML = `
        <div class="agenda-empty">
          <h3>Nenhum evento nesta data</h3>
          <p>Selecione outro dia no calendário para consultar os eventos.</p>
        </div>
      `;
      return;
    }

    matches.forEach(event => {
      selectedContainer.appendChild(
        createEventCard(event, isFavorite(event))
      );
    });
  }

  // Navegação entre os meses do calendário.
  document.querySelectorAll("[data-calendar-prev]").forEach(button => {
    button.addEventListener("click", () => {
      currentMonth--;

      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }

      renderCalendar();
    });
  });

  document.querySelectorAll("[data-calendar-next]").forEach(button => {
    button.addEventListener("click", () => {
      currentMonth++;

      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }

      renderCalendar();
    });
  });

  // Ações de cancelar inscrição e remover favorito.
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-action]");

    if (!button) return;

    const eventId = button.dataset.eventId;
    const action = button.dataset.action;

    if (action === "cancel-registration") {
      if (typeof window.cancelRegistration === "function") {
        window.cancelRegistration(eventId);
      } else {
        updateLocalList("conecta_registrations", eventId);
      }

      renderCalendar();
      renderEvents();
    }

    if (action === "remove-favorite") {
      if (typeof window.toggleFavorite === "function") {
        window.toggleFavorite(eventId);
      } else {
        updateLocalList("conecta_favorites", eventId);
      }

      renderCalendar();
      renderEvents();
    }
  });

  function updateLocalList(key, eventId) {
    try {
      const list = JSON.parse(localStorage.getItem(key) || "[]");

      const updated = list.filter(item => {
        const id = typeof item === "object"
          ? item.eventId ?? item.id
          : item;

        return String(id) !== String(eventId);
      });

      localStorage.setItem(key, JSON.stringify(updated));
    } catch (error) {
      console.error("Não foi possível atualizar a agenda:", error);
    }
  }

  // Inicializa a página.
  renderCalendar();
  renderEvents();
});
