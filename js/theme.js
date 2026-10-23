(() => {
  try {
    document.documentElement.dataset.theme = localStorage.getItem("conecta-plus-theme") === "dark" ? "dark" : "light";
  } catch {
    document.documentElement.dataset.theme = "light";
  }
})();

document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector(".site-header nav");
  if (!nav) return;

  const ATTRS = 'width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  const MOON = `<svg ${ATTRS}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>`;
  const SUN = `<svg ${ATTRS}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>`;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "theme-toggle";
  nav.appendChild(button);

  function refreshButton() {
    const isDark = document.documentElement.dataset.theme === "dark";

    button.innerHTML = isDark ? SUN : MOON;
    button.setAttribute("aria-label", isDark ? "Ativar tema claro" : "Ativar tema escuro");
    button.setAttribute("aria-pressed", String(isDark));
  }

  button.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";

    document.documentElement.dataset.theme = next;

    try {
      localStorage.setItem("conecta-plus-theme", next);
    } catch {
      // Storage indisponivel: o tema vale apenas para a pagina atual.
    }

    window.dispatchEvent(new Event("conecta:theme-changed"));
  });

  window.addEventListener("conecta:theme-changed", refreshButton);
  refreshButton();
});
