document.addEventListener("DOMContentLoaded", () => {
    const panel = document.getElementById("explorador-universo");
    const velo = document.getElementById("velo-explorador-universo");
    const abrir = document.getElementById("abrir-explorador-universo");
    const cerrar = document.getElementById("cerrar-explorador-universo");

    if (!panel || !velo || !abrir || !cerrar) {
        return;
    }

    const cambiarPanel = (mostrar) => {
        panel.classList.toggle("explorador-universo--abierto", mostrar);
        velo.classList.toggle("explorador-universo__velo--visible", mostrar);
        panel.setAttribute("aria-hidden", String(!mostrar));
        abrir.setAttribute("aria-expanded", String(mostrar));
        document.body.classList.toggle("explorador-universo-activo", mostrar);

        if (mostrar) {
            cerrar.focus();
        } else {
            abrir.focus();
        }
    };

    abrir.addEventListener("click", () => cambiarPanel(true));
    cerrar.addEventListener("click", () => cambiarPanel(false));
    velo.addEventListener("click", () => cambiarPanel(false));

    panel.querySelectorAll("a").forEach((enlace) => {
        enlace.addEventListener("click", () => cambiarPanel(false));
    });

    document.addEventListener("keydown", (evento) => {
        if (
            evento.key === "Escape" &&
            panel.classList.contains("explorador-universo--abierto")
        ) {
            cambiarPanel(false);
        }
    });
});
