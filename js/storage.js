
(() => {
  const AGENDA_KEY = "conecta-plus-agenda";
  const THEME_KEY = "conecta-plus-theme";
  const PROFILE_KEY = "conecta-plus-profile";

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

  function getProfile() {
    try {
      const profile = JSON.parse(
        localStorage.getItem(PROFILE_KEY) || "null"
      );

      if (!profile || typeof profile !== "object") {
        return {
          name: "Visitante",
          city: "Sorocaba",
          interests: []
        };
      }

      return {
        name: profile.name || "Visitante",
        city: profile.city || "Sorocaba",
        interests: Array.isArray(profile.interests)
          ? profile.interests
          : []
      };
    } catch {
      return {
        name: "Visitante",
        city: "Sorocaba",
        interests: []
      };
    }
  }

  function saveProfile(profile) {
    if (!profile || typeof profile !== "object") {
      throw new Error("Dados do perfil inválidos.");
    }

    const normalizedProfile = {
      name: String(profile.name || "").trim(),
      city: String(profile.city || "").trim(),
      interests: Array.isArray(profile.interests)
        ? profile.interests
        : []
    };

    localStorage.setItem(
      PROFILE_KEY,
      JSON.stringify(normalizedProfile)
    );

    return normalizedProfile;
  }

  window.ConectaStorage = {
    getAgenda,
    isSaved,
    toggleAgenda,
    getTheme,
    setTheme,
    getProfile,
    saveProfile
  };
})();
