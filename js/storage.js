(() => {
  const KEY = "conecta-plus-agenda";
  const THEME_KEY = "conecta-plus-theme";

  function readAgenda() {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function getAgenda() {
    return readAgenda();
  }

  function isSaved(id) {
    return readAgenda().includes(id);
  }

  function toggleAgenda(id) {
    const agenda = readAgenda();
    const updated = agenda.includes(id)
      ? agenda.filter(item => item !== id)
      : [...agenda, id];

    localStorage.setItem(KEY, JSON.stringify(updated));
    return updated;
  }

  function getTheme() {
    try {
      return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  }

  function setTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme === "dark" ? "dark" : "light");
    } catch {
      // Storage indisponivel: o tema vale apenas para a pagina atual.
    }
  }

  window.ConectaStorage = { getAgenda, isSaved, toggleAgenda, getTheme, setTheme };
})();
