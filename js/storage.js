
(() => {
  const AGENDA_KEY = "conecta-plus-agenda";
  const THEME_KEY = "conecta-plus-theme";

  function readAgenda() {
    try {
      const value = JSON.parse(localStorage.getItem(AGENDA_KEY) || "[]");
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

    localStorage.setItem(AGENDA_KEY, JSON.stringify(updated));
    return updated;
  }

  function getTheme() {
    const theme = localStorage.getItem(THEME_KEY);
    return theme === "dark" ? "dark" : "light";
  }

  function setTheme(theme) {
    const validTheme = theme === "dark" ? "dark" : "light";
    localStorage.setItem(THEME_KEY, validTheme);
    return validTheme;
  }

  window.ConectaStorage = {
    getAgenda,
    isSaved,
    toggleAgenda,
    getTheme,
    setTheme
  };
})();
