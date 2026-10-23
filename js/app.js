(() => {
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  });

  function formatDate(date) {
    return formatter.format(new Date(`${date}T12:00:00Z`));
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function eventCard(event) {
    const saved = window.ConectaStorage?.isSaved(event.id) ?? false;
    const art = event.images
      ? `<img src="${escapeHTML(event.images[0])}" alt="" loading="lazy">`
      : escapeHTML(event.category);

    return `
      <article class="event-card">
        <div class="event-placeholder">${art}</div>
        <div class="event-card-content">
          <span class="event-category">${escapeHTML(event.category)}</span>
          <h3>${escapeHTML(event.title)}</h3>
          <p>${escapeHTML(event.description)}</p>
          <p class="event-meta">${formatDate(event.date)} · ${escapeHTML(event.location)}</p>
          <div class="hero-actions">
            <a class="button button-secondary" href="detalhes.html?id=${encodeURIComponent(event.id)}">Ver detalhes</a>
            <button class="button save-event" type="button" data-event-id="${escapeHTML(event.id)}">
              ${saved ? "Remover da agenda" : "Salvar evento"}
            </button>
          </div>
        </div>
      </article>`;
  }

  function renderEvents(target, events) {
    if (!target) return;

    target.innerHTML = events.length
      ? events.map(eventCard).join("")
      : "<p>Nenhum evento encontrado. Experimente outra busca.</p>";
  }

  document.addEventListener("click", event => {
    const button = event.target.closest(".save-event");
    if (!button || !window.ConectaStorage) return;

    window.ConectaStorage.toggleAgenda(button.dataset.eventId);

    const currentPage = location.pathname.split("/").pop();
    if (currentPage === "agenda.html") {
      window.dispatchEvent(new CustomEvent("conecta:agenda-updated"));
    } else {
      button.textContent = window.ConectaStorage.isSaved(button.dataset.eventId)
        ? "Remover da agenda"
        : "Salvar evento";
    }
  });

  window.ConectaApp = { formatDate, escapeHTML, eventCard, renderEvents };
})();
