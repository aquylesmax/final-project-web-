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

  const savedGrid = document.getElementById("saved-events");
  const savedEmpty = document.getElementById("saved-empty");
  const dayList = document.getElementById("selected-date-events");
  const dayLabel = document.getElementById("selected-date-label");

  const savedCount = document.getElementById("saved-count");
  const nextEvent = document.getElementById("next-event");
  const monthCount = document.getElementById("month-count");
  const error = document.getElementById("agenda-error");

  if (!calendarGrid || !savedGrid || !dayList) return;

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

  const today = new Date();
  const todayKey = toKey(today);

  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();
  let selectedDate = todayKey;

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

  /* ----------------------------------------
     3. AGENDA (ConectaStorage)
  ---------------------------------------- */
  function getStorage() {
    return window.ConectaStorage || null;
  }

  function isSaved(id) {
    const storage = getStorage();

    return storage ? storage.isSaved(id) : false;
  }

  function toggleSaved(id) {
    const storage = getStorage();

    if (!storage) {
      showError("Não foi possível acessar sua agenda. Atualize a página e tente novamente.");
      return;
    }

    try {
      storage.toggleAgenda(id);
      render();
    } catch (exception) {
      showError("Não foi possível atualizar sua agenda neste navegador.");
    }
  }

  function showError(message) {
    error.hidden = false;
    error.textContent = message;
  }

  /* ----------------------------------------
     4. CARDS DE EVENTO
  ---------------------------------------- */
  function renderCard(event, mode) {
    const id = escapeHTML(event.id);
    const category = escapeHTML(event.category || "Evento");
    const title = escapeHTML(event.title || "Evento sem título");
    const location = escapeHTML(event.location || "Local a confirmar");
    const description = escapeHTML(event.description || "Mais informações em breve.");
    const icon = icons[event.category] || "✳";
    const saved = isSaved(event.id);
    const past = event.date < todayKey;

    // Na lista de salvos o botão remove; no calendário alterna.
    const saveButton = mode === "saved"
      ? `<button class="button button-secondary agenda-save-button" type="button"
           data-save-id="${id}">Remover</button>`
      : `<button class="button button-secondary agenda-save-button" type="button"
           data-save-id="${id}" aria-pressed="${saved}">
           ${saved ? "✓ Na agenda" : "+ Minha agenda"}</button>`;

    return `
      <article class="agenda-card${past ? " is-past" : ""}">
        <div class="agenda-card-art" data-category="${category}" aria-hidden="true">${icon}</div>
        <div class="agenda-card-content">
          <div class="agenda-card-top">
            <span class="agenda-card-category">${category}</span>
            ${past ? '<span class="agenda-badge">Encerrado</span>' : ""}
          </div>
          <p class="agenda-card-date">${escapeHTML(formatDate(event.date))}</p>
          <h4>${title}</h4>
          <p class="agenda-card-meta"><span aria-hidden="true">⌖</span> ${location}</p>
          <p class="agenda-card-description">${description}</p>
          <div class="agenda-card-footer">
            <a class="button" href="detalhes.html?id=${encodeURIComponent(event.id)}">Ver detalhes</a>
            ${saveButton}
          </div>
        </div>
      </article>`;
  }

  /* ----------------------------------------
     5. CALENDÁRIO
  ---------------------------------------- */
  function renderCalendar() {
    calendarMonth.textContent = `${monthNames[currentMonth]} de ${currentYear}`;

    const eventDates = new Set(events.map(event => event.date));
    const savedDates = new Set(
      events.filter(event => isSaved(event.id)).map(event => event.date)
    );

    const firstWeekday = new Date(currentYear, currentMonth, 1).getDay();
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const cells = Math.ceil((firstWeekday + totalDays) / 7) * 7;

    let html = weekDays
      .map(day => `<div class="calendar-weekday">${day}</div>`)
      .join("");

    for (let index = 0; index < cells; index++) {
      // Dias fora do mês são calculados pelo próprio Date.
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
     6. LISTAS E RESUMO
  ---------------------------------------- */
  function renderSummary(saved) {
    savedCount.textContent = saved.length;

    const upcoming = saved.find(event => event.date >= todayKey);

    nextEvent.textContent = upcoming
      ? `${formatShortDate(upcoming.date)} · ${upcoming.title}`
      : "Nenhum";

    const prefix = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;

    monthCount.textContent = saved.filter(
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

  function renderSaved(saved) {
    savedGrid.innerHTML = saved.map(event => renderCard(event, "saved")).join("");
    savedGrid.hidden = saved.length === 0;
    savedEmpty.hidden = saved.length !== 0;
  }

  function render() {
    error.hidden = true;

    const saved = events
      .filter(event => isSaved(event.id))
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));

    renderCalendar();
    renderSummary(saved);
    renderSelectedDay();
    renderSaved(saved);
  }

  /* ----------------------------------------
     7. EVENTOS DE CLIQUE
  ---------------------------------------- */
  prevButton.addEventListener("click", () => changeMonth(-1));
  nextButton.addEventListener("click", () => changeMonth(1));

  document.addEventListener("click", event => {
    const dayButton = event.target.closest("[data-date]");
    const saveButton = event.target.closest("[data-save-id]");

    if (dayButton) {
      const date = parseKey(dayButton.dataset.date);

      selectedDate = dayButton.dataset.date;
      currentMonth = date.getMonth();
      currentYear = date.getFullYear();
      render();
      return;
    }

    if (saveButton) {
      toggleSaved(saveButton.dataset.saveId);
    }
  });

  /* ----------------------------------------
     8. INICIALIZAÇÃO
  ---------------------------------------- */
  render();

  if (events.length === 0) {
    showError("Não encontramos dados de eventos. Verifique js/data.js.");
  }
})();
