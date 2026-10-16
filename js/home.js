document.addEventListener("DOMContentLoaded", () => {
  const target = document.getElementById("featured-events");
  const form = document.getElementById("home-search");
  const input = document.getElementById("home-search-input");

  if (!target || !window.EVENTS || !window.ConectaApp) return;

  const featured = window.EVENTS.slice(0, 3);
  window.ConectaApp.renderEvents(target, featured);

  form?.addEventListener("submit", event => {
    event.preventDefault();
    const query = input.value.trim().toLocaleLowerCase("pt-BR");

    const results = window.EVENTS.filter(item =>
      `${item.title} ${item.category} ${item.location} ${item.description}`
        .toLocaleLowerCase("pt-BR")
        .includes(query)
    );

    window.ConectaApp.renderEvents(target, results);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
