(() => {
  "use strict";

  const events = Array.isArray(window.EVENTS)
    ? window.EVENTS
    : Array.isArray(window.events)
      ? window.events
      : [];

  const grid = document.getElementById("events-grid");
  const searchInput = document.getElementById("event-search");
  const categorySelect = document.getElementById("event-category");
  const sortSelect = document.getElementById("event-sort");
  const count = document.getElementById("events-count");
  const empty = document.getElementById("events-empty");
  const error = document.getElementById("events-error");
  const clearButton = document.getElementById("event-clear");
  const emptyClearButton = document.getElementById("event-empty-clear");
  const filterForm = document.getElementById("event-filters");

  if (!grid || !searchInput || !categorySelect || !sortSelect) return;

  const icons = {
    Cultura: "🎨",
    Tecnologia: "💡",
    Gastronomia: "🍲",
    "Música": "🎵",
    Musica: "🎵",
    Esporte: "🏃",
    Feira: "🛍️"
  };

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function formatDate(value) {
    const date = new Date(`${value}T12:00:00`);
    if (Number.isNaN(date.getTime())) return "Data a confirmar";

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(date);
  }

  function getAgendaStorage() {
    return window.ConectaStorage || null;
  }

  function isSaved(id) {
    const storage = getAgendaStorage();
    return storage ? storage.isSaved(id) : false;
  }

  function toggleSaved(id) {
    const storage = getAgendaStorage();

    if (!storage) {
      error.hidden = false;
      error.textContent = "Não foi possível acessar sua agenda. Atualize a página e tente novamente.";
      return;
    }

    try {
      storage.toggleAgenda(id);
      error.hidden = true;
      render();
    } catch (exception) {
      error.hidden = false;
      error.textContent = "Não foi possível atualizar sua agenda neste navegador.";
    }
  }

  function populateCategories() {
    const categories = [...new Set(
      events.map(event => event.category).filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, "pt-BR"));

    for (const category of categories) {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
    }
  }

  function getFilteredEvents() {
    const term = searchInput.value.trim().toLocaleLowerCase("pt-BR");
    const category = categorySelect.value;
    const sort = sortSelect.value;

    const filtered = events.filter(event => {
      const searchable = [
        event.title,
        event.category,
        event.location,
        event.description
      ].join(" ").toLocaleLowerCase("pt-BR");

      return searchable.includes(term) &&
        (!category || event.category === category);
    });

    filtered.sort((a, b) => {
      if (sort === "title-asc") {
        return String(a.title).localeCompare(String(b.title), "pt-BR");
      }
      if (sort === "title-desc") {
        return String(b.title).localeCompare(String(a.title), "pt-BR");
      }

      const dateA = new Date(`${a.date}T12:00:00`).getTime();
      const dateB = new Date(`${b.date}T12:00:00`).getTime();

      return sort === "date-desc" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }

  function renderCard(event) {
    const id = escapeHTML(event.id);
    const category = escapeHTML(event.category || "Evento");
    const title = escapeHTML(event.title || "Evento sem título");
    const location = escapeHTML(event.location || "Local a confirmar");
    const description = escapeHTML(event.description || "Mais informações em breve.");
    const icon = icons[event.category] || "✳";
    const saved = isSaved(event.id);

    return `
      <article class="event-card">
        <div class="event-art" data-category="${category}" aria-hidden="true">${icon}</div>
        <div class="event-card-content">
          <span class="event-category">${category}</span>
          <p class="event-date">${escapeHTML(formatDate(event.date))}</p>
          <h3>${title}</h3>
          <p class="event-meta"><span aria-hidden="true">⌖</span> ${location}</p>
          <p>${description}</p>
          <div class="event-card-footer">
            <a class="button" href="detalhes.html?id=${encodeURIComponent(event.id)}">Ver detalhes</a>
            <button
              class="button button-secondary event-save-button"
              type="button"
              data-save-id="${id}"
              aria-pressed="${saved}"
            >${saved ? "✓ Na agenda" : "+ Minha agenda"}</button>
          </div>
        </div>
      </article>`;
  }

  function render() {
    error.hidden = true;

    const filtered = getFilteredEvents();
    grid.innerHTML = filtered.map(renderCard).join("");
    empty.hidden = filtered.length !== 0;
    grid.hidden = filtered.length === 0;

    count.textContent = `${filtered.length} ${filtered.length === 1 ? "evento encontrado" : "eventos encontrados"}`;

    grid.querySelectorAll("[data-save-id]").forEach(button => {
      button.addEventListener("click", () => {
        toggleSaved(button.dataset.saveId);
      });
    });
  }

  function clearFilters() {
    searchInput.value = "";
    categorySelect.value = "";
    sortSelect.value = "date-asc";
    render();
    searchInput.focus();
  }

  filterForm.addEventListener("submit", event => event.preventDefault());
  searchInput.addEventListener("input", render);
  categorySelect.addEventListener("change", render);
  sortSelect.addEventListener("change", render);
  clearButton.addEventListener("click", clearFilters);
  emptyClearButton.addEventListener("click", clearFilters);

  populateCategories();

  if (events.length === 0) {
    count.textContent = "Nenhum evento cadastrado ainda.";
    error.hidden = false;
    error.textContent = "Não encontramos dados de eventos. Verifique js/data.js.";
    grid.hidden = true;
  } else {
    render();
  }
})();
