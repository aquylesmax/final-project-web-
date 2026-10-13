
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
    
    // Inscrição no evento usando o storage compartilhado
    const registerButton = document.getElementById("register-event");
    const registrationMessage =
        document.getElementById("registration-message");

    if (registerButton && registrationMessage) {
        registerButton.addEventListener("click", () => {
            const params = new URLSearchParams(window.location.search);
            const eventId = params.get("id");

            if (!eventId) {
                registrationMessage.textContent =
                    "Não foi possível identificar o evento.";
                return;
            }

            if (
                typeof window.isRegistered !== "function" ||
                typeof window.registerEvent !== "function"
            ) {
                registrationMessage.textContent =
                    "O sistema de inscrições ainda não está disponível.";
                return;
            }

            if (window.isRegistered(eventId)) {
                registrationMessage.textContent =
                    "Você já está inscrito neste evento.";
                return;
            }

            window.registerEvent(eventId);

            registrationMessage.textContent =
                window.isRegistered(eventId)
                    ? "Inscrição realizada com sucesso!"
                    : "Não foi possível concluir a inscrição.";
        });
    }

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
