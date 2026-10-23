
document.addEventListener("DOMContentLoaded", () => {
    // Elementos dos detalhes do evento
    const eventContent = document.getElementById("event-content");
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get("id");

    // Exibir os detalhes do evento
    if (!eventId) {
        eventContent.innerHTML =
            "<p>Nenhum evento foi selecionado.</p>";
    } else if (!Array.isArray(window.events)) {
        eventContent.innerHTML =
            "<p>Os eventos ainda não estão disponíveis.</p>";
    } else {
        const event = window.events.find(
            (item) => String(item.id) === eventId
        );

        if (!event) {
            eventContent.innerHTML =
                "<p>Evento não encontrado. Volte para a página de eventos.</p>";
        } else {
            eventContent.innerHTML = `
                <article class="event-information">
                    <h1>${event.title}</h1>
                    <p>${event.description ?? "Descrição não disponível."}</p>
                    <p><strong>Data:</strong> ${event.date ?? "A definir"}</p>
                    <p><strong>Local:</strong> ${event.location ?? "A definir"}</p>
                    <p><strong>Preço:</strong> ${
                        event.price === 0
                            ? "Gratuito"
                            : event.price != null
                                ? `R$ ${event.price}`
                                : "A consultar"
                    }</p>
                </article>
            `;
        }
    }

    // Elementos da galeria
    const galleryContainer =
        document.getElementById("gallery-container");
    const galleryModal =
        document.getElementById("gallery-modal");
    const modalImage =
        document.getElementById("modal-image");
    const closeGalleryButton =
        document.getElementById("close-gallery");

    // Galeria com as imagens do evento, quando existirem
    const galleryEvent = Array.isArray(window.events)
        ? window.events.find((item) => String(item.id) === eventId)
        : null;

    if (galleryContainer && galleryEvent?.images) {
        galleryContainer.replaceChildren(...galleryEvent.images.map((src, index) => {
            const button = document.createElement("button");
            button.className = "gallery-item";
            button.type = "button";
            button.dataset.image = src;
            button.setAttribute("aria-label", `Ampliar imagem ${index + 1}`);

            const image = document.createElement("img");
            image.src = src;
            image.alt = `${galleryEvent.title}: ${galleryEvent.imageAlts?.[index] ?? "Imagem do evento"}`;
            image.loading = "lazy";

            button.appendChild(image);
            return button;
        }));
    }

    // Abrir a imagem ampliada
    if (
        galleryContainer &&
        galleryModal &&
        modalImage &&
        closeGalleryButton
    ) {
        galleryContainer.addEventListener("click", (event) => {
            const button = event.target.closest?.(".gallery-item");

            if (!button) return;

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
    const registerButton = document.getElementById("register-event");
    const registrationMessage =
        document.getElementById("registration-message");

    if (registerButton && registrationMessage) {
        const eventId = new URLSearchParams(
            window.location.search
        ).get("id");

        const storage = window.ConectaStorage;
        const eventExists = Array.isArray(window.EVENTS) &&
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
    const shareButton = document.getElementById("share-event");
    const shareMessage = document.getElementById("share-message");

    if (shareButton && shareMessage) {
        shareButton.addEventListener("click", async () => {
            const eventTitle =
                document.querySelector(".event-information h1")?.textContent
                || "Evento no Conecta+";

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
                } else {
                    await navigator.clipboard.writeText(shareData.url);
                    shareMessage.textContent =
                        "Link do evento copiado!";
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
