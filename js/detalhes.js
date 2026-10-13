
document.addEventListener("DOMContentLoaded", () => {
    const eventContent = document.getElementById("event-content");
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get("id");

    if (!eventId) {
        eventContent.innerHTML = "<p>Nenhum evento foi selecionado.</p>";
        return;
    }

    if (!Array.isArray(window.events)) {
        eventContent.innerHTML =
            "<p>Os eventos ainda não estão disponíveis.</p>";
        return;
    }

    const event = window.events.find(
        (item) => String(item.id) === eventId
    );

    if (!event) {
        eventContent.innerHTML =
            "<p>Evento não encontrado. Volte para a página de eventos.</p>";
        return;
    }

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
});
