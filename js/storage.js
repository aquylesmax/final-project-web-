(() => {
  const KEY = "conecta-plus-agenda";

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

  window.ConectaStorage = { getAgenda, isSaved, toggleAgenda };
})();
