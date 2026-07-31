document.addEventListener("DOMContentLoaded", () => {
    const indice = document.querySelector("#indice");
    const velo = document.querySelector("#velo");
    const abrir = document.querySelector("#abrir-indice");
    const cerrar = document.querySelector("#cerrar-indice");

    const cambiarIndice = (mostrar) => {
        indice.classList.toggle("abierto", mostrar);
        velo.classList.toggle("visible", mostrar);
        abrir.setAttribute("aria-expanded", String(mostrar));
        document.body.style.overflow = mostrar ? "hidden" : "";
        if (mostrar) cerrar.focus();
    };

    abrir.addEventListener("click", () => cambiarIndice(true));
    cerrar.addEventListener("click", () => cambiarIndice(false));
    velo.addEventListener("click", () => cambiarIndice(false));
    indice.querySelectorAll("a").forEach((enlace) => enlace.addEventListener("click", () => cambiarIndice(false)));
    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape") cambiarIndice(false);
    });

    const pestanas = [...document.querySelectorAll('[role="tab"]')];
    pestanas.forEach((pestana) => {
        pestana.addEventListener("click", () => {
            pestanas.forEach((item) => {
                const seleccionada = item === pestana;
                item.classList.toggle("activa", seleccionada);
                item.setAttribute("aria-selected", String(seleccionada));
                document.querySelector(`#${item.getAttribute("aria-controls")}`).hidden = !seleccionada;
                document.querySelector(`#${item.getAttribute("aria-controls")}`).classList.toggle("activa", seleccionada);
            });
        });
    });

    document.querySelectorAll("[data-copiar]").forEach((boton) => {
        boton.addEventListener("click", async () => {
            const texto = boton.parentElement.querySelector("code").innerText;
            try {
                await navigator.clipboard.writeText(texto);
                boton.textContent = "Copiado";
                boton.classList.add("copiado");
                setTimeout(() => {
                    boton.textContent = "Copiar";
                    boton.classList.remove("copiado");
                }, 1600);
            } catch {
                boton.textContent = "Selecciona el texto";
            }
        });
    });

    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
            if (entrada.isIntersecting) {
                entrada.target.classList.add("visible");
                observador.unobserve(entrada.target);
            }
        });
    }, { threshold: .08 });
    document.querySelectorAll(".revelar").forEach((elemento) => observador.observe(elemento));

    const cielo = document.querySelector("#estrellas-fugaces");
    const crearFugaz = () => {
        if (document.hidden || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const estrella = document.createElement("span");
        estrella.className = "fugaz";
        estrella.style.setProperty("--x", `${Math.random() * 75 - 15}vw`);
        estrella.style.setProperty("--y", `${Math.random() * 55}vh`);
        estrella.style.setProperty("--largo", `${90 + Math.random() * 100}px`);
        estrella.style.setProperty("--duracion", `${1.1 + Math.random() * .8}s`);
        estrella.style.setProperty("--demora", "0s");
        cielo.appendChild(estrella);
        estrella.addEventListener("animationend", () => estrella.remove());
    };
    setInterval(crearFugaz, 3400);
    setTimeout(crearFugaz, 900);
});
