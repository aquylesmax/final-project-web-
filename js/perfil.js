
document.addEventListener("DOMContentLoaded", () => {
    initializeProfilePage();
});

function initializeProfilePage() {
    loadProfile();
    initializeProfileForm();
    initializeThemeButtons();
    renderNotifications();
}

function loadProfile() {
    const profile = getProfile();

    document.querySelector("#profile-name").textContent =
        profile.name;

    document.querySelector("#profile-city").textContent =
        profile.city;

    document.querySelector("#profile-name-input").value =
        profile.name;

    document.querySelector("#profile-city-input").value =
        profile.city;

    document.querySelector("#profile-initial").textContent =
        getProfileInitial(profile.name);

    document
        .querySelectorAll('input[name="interests"]')
        .forEach((checkbox) => {
            checkbox.checked =
                profile.interests.includes(checkbox.value);
        });
}

function initializeProfileForm() {
    const form = document.querySelector("#profile-form");

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = document
            .querySelector("#profile-name-input")
            .value.trim();

        const city = document
            .querySelector("#profile-city-input")
            .value.trim();

        const interests = Array.from(
            document.querySelectorAll(
                'input[name="interests"]:checked'
            )
        ).map((checkbox) => checkbox.value);

        if (!name || !city) {
            showProfileMessage("Preencha nome e cidade.");
            return;
        }

        saveProfile({
            name,
            city,
            interests
        });

        loadProfile();

        addNotification("Seu perfil foi atualizado.");
        renderNotifications();

        showProfileMessage(
            "Perfil atualizado com sucesso."
        );
    });
}

function initializeThemeButtons() {
    const lightButton =
        document.querySelector("#light-theme");

    const darkButton =
        document.querySelector("#dark-theme");

    lightButton.addEventListener("click", () => {
        changeProfileTheme("light");
    });

    darkButton.addEventListener("click", () => {
        changeProfileTheme("dark");
    });

    updateThemeButtons();
}

function changeProfileTheme(theme) {
    setTheme(theme);

    document.documentElement.dataset.theme = theme;

    addNotification(
        theme === "dark"
            ? "Tema escuro ativado."
            : "Tema claro ativado."
    );

    updateThemeButtons();
    renderNotifications();
}

function updateThemeButtons() {
    const theme = getTheme();

    const lightButton =
        document.querySelector("#light-theme");

    const darkButton =
        document.querySelector("#dark-theme");

    const isLight = theme === "light";
    const isDark = theme === "dark";

    lightButton.classList.toggle("selected", isLight);
    darkButton.classList.toggle("selected", isDark);

    lightButton.setAttribute(
        "aria-pressed",
        String(isLight)
    );

    darkButton.setAttribute(
        "aria-pressed",
        String(isDark)
    );
}

function renderNotifications() {
    const container =
        document.querySelector("#notifications-list");

    const empty =
        document.querySelector("#notifications-empty");

    const notifications = getNotifications();

    container.replaceChildren();

    if (notifications.length === 0) {
        empty.classList.remove("hidden");
        return;
    }

    empty.classList.add("hidden");

    notifications.forEach((notification) => {
        const article = document.createElement("article");

        article.className = notification.read
            ? "notification-item read"
            : "notification-item";

        const content = document.createElement("div");

        const title = document.createElement("strong");
        title.textContent = "Conecta+";

        const message = document.createElement("p");
        message.textContent = notification.message;

        content.append(title, message);
        article.appendChild(content);

        if (!notification.read) {
            const button = document.createElement("button");

            button.className = "notification-read";
            button.type = "button";
            button.textContent = "Marcar como lida";

            button.addEventListener("click", () => {
                markNotificationRead(notification.id);
                renderNotifications();
            });

            article.appendChild(button);
        }

        container.appendChild(article);
    });
}

function showProfileMessage(message) {
    const element =
        document.querySelector("#profile-message");

    element.textContent = message;
}

function getProfileInitial(name) {
    if (!name || !name.trim()) {
        return "V";
    }

    return name.trim().charAt(0).toUpperCase();
}
