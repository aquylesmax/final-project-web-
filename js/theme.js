
(() => {
  function applySavedTheme() {
    const theme = window.ConectaStorage?.getTheme?.() || "light";

    document.documentElement.dataset.theme =
      theme === "dark" ? "dark" : "light";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applySavedTheme);
  } else {
    applySavedTheme();
  }
})();
