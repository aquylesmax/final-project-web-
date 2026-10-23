
document.addEventListener("DOMContentLoaded", () => {
    // Identificar o evento selecionado
    const eventContent = document.getElementById("event-content");
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get("id");

    let selectedEvent = null;

    if (!eventContent) return;

    if (!eventId) {
        eventContent.innerHTML =
            "<p>Nenhum evento foi selecionado.</p>";
    } else if (!Array.isArray(window.events)) {
        eventContent.innerHTML =
            "<p>Os eventos ainda não estão disponíveis.</p>";
    } else {
        selectedEvent = window.events.find(
            (item) => String(item.id) === eventId
        );

        if (!selectedEvent) {
            eventContent.innerHTML =
                "<p>Evento não encontrado. Volte para a página de eventos.</p>";
        } else {
            eventContent.innerHTML = `
                <article class="event-information">
                    <h1>${selectedEvent.title}</h1>
                    <p>${selectedEvent.description ?? "Descrição não disponível."}</p>
                    <p><strong>Data:</strong> ${selectedEvent.date ?? "A definir"}</p>
                    <p><strong>Local:</strong> ${selectedEvent.location ?? "A definir"}</p>
                    <p><strong>Preço:</strong> ${
                        selectedEvent.price === 0
                            ? "Gratuito"
                            : selectedEvent.price != null
                                ? `R$ ${selectedEvent.price}`
                                : "A consultar"
                    }</p>
                </article>
            `;

            // Criar a galeria específica do evento
            const galleryContainer =
                document.getElementById("gallery-container");

            if (galleryContainer) {
                const images = Array.isArray(selectedEvent.images)
                    ? selectedEvent.images
                    : [];

                if (images.length === 0) {
                    galleryContainer.innerHTML =
                        "<p>Nenhuma imagem disponível para este evento.</p>";
                } else {
                    galleryContainer.innerHTML = images
                        .map((imagePath, index) => {
                            const safePath = String(imagePath)
                                .replace(/&/g, "&amp;")
                                .replace(/"/g, "&quot;")
                                .replace(/</g, "&lt;")
                                .replace(/>/g, "&gt;");

                            const altText =
                                `Imagem ${index + 1} de ${selectedEvent.title}`;

                            return `
                                <button
                                    type="button"
                                    class="gallery-item"
                                    data-image="${safePath}"
                                    aria-label="Ampliar imagem ${index + 1} de ${selectedEvent.title}"
                                >
                                    <img
                                        src="${safePath}"
                                        alt="${altText}"
                                        loading="lazy"
                                    >
                                </button>
                            `;
                        })
                        .join("");
                }
            }
        }
    }

    // Elementos da galeria ampliada
    const galleryContainer =
        document.getElementById("gallery-container");
    const galleryModal =
        document.getElementById("gallery-modal");
    const modalImage =
        document.getElementById("modal-image");
    const closeGalleryButton =
        document.getElementById("close-gallery");

    // Abrir imagem ampliada
    if (
        galleryContainer &&
        galleryModal &&
        modalImage &&
        closeGalleryButton
    ) {
        galleryContainer.addEventListener("click", (event) => {
            const button = event.target.closest(".gallery-item");

            if (!button || !galleryContainer.contains(button)) return;

            const image = button.querySelector("img");

            modalImage.src = button.dataset.image;
            modalImage.alt = image
                ? image.alt
                : "Imagem do evento";

            galleryModal.hidden = false;
            closeGalleryButton.focus();
        });

        // Fechar a galeria
        function closeGallery() {
            galleryModal.hidden = true;
            modalImage.removeAttribute("src");
        }

        closeGalleryButton.addEventListener(
            "click",
            closeGallery
        );

        galleryModal.addEventListener("click", (event) => {
            if (event.target === galleryModal) {
                closeGallery();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (
                event.key === "Escape" &&
                !galleryModal.hidden
            ) {
                closeGallery();
            }
        });
    }

    // Integração com a agenda compartilhada
    const registerButton =
        document.getElementById("register-event");
    const registrationMessage =
        document.getElementById("registration-message");

    if (registerButton && registrationMessage) {
        const storage = window.ConectaStorage;

        const eventExists =
            Array.isArray(window.EVENTS) &&
            window.EVENTS.some(
                (item) => String(item.id) === eventId
            );

        if (!eventId || !eventExists) {
            registerButton.disabled = true;
            registrationMessage.textContent =
                "Não foi possível identificar um evento válido.";
        } else if (
            !storage ||
            typeof storage.isSaved !== "function" ||
            typeof storage.toggleAgenda !== "function"
        ) {
            registerButton.disabled = true;
            registrationMessage.textContent =
                "A agenda ainda não está disponível.";
        } else {
            function updateAgendaButton() {
                const saved = storage.isSaved(eventId);

                registerButton.textContent = saved
                    ? "Remover da minha agenda"
                    : "Adicionar à minha agenda";
            }

            updateAgendaButton();

            registerButton.addEventListener("click", () => {
                storage.toggleAgenda(eventId);

                const saved = storage.isSaved(eventId);

                registrationMessage.textContent = saved
                    ? "Evento adicionado à sua agenda!"
                    : "Evento removido da sua agenda.";

                updateAgendaButton();
            });
        }
    }

    // Compartilhamento do evento
    const shareButton =
        document.getElementById("share-event");
    const shareMessage =
        document.getElementById("share-message");

    if (shareButton && shareMessage) {
        shareButton.addEventListener("click", async () => {
            const eventTitle =
                selectedEvent?.title ||
                document.querySelector(".event-information h1")?.textContent ||
                "Evento no Conecta+";

            const shareData = {
                title: eventTitle,
                text: `Confira este evento: ${eventTitle}`,
                url: window.location.href
            };

            try {
                if (navigator.share) {
                    await navigator.share(shareData);
                    shareMessage.textContent =
                        "Compartilhamento iniciado!";
                } else if (navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(shareData.url);
                    shareMessage.textContent =
                        "Link do evento copiado!";
                } else {
                    shareMessage.textContent =
                        "Não foi possível copiar o link neste navegador.";
                }
            } catch (error) {
                if (error.name !== "AbortError") {
                    shareMessage.textContent =
                        "Não foi possível compartilhar o evento.";
                }
            }
        });
    }
});
