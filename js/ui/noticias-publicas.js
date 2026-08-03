import { leerContenidoPublico } from "../firebase/firestore-contenido-publico.js";
import { crearComentariosContextuales } from "./comentarios-contextuales.js?v=12";
import { cambiarVisibilidadContenido, eliminarContenido } from "../firebase/firestore-contenido-administracion.js";
import { conectarModeracion } from "./moderacion.js";

const seccion = document.querySelector("[data-noticias-pendientes]");
const lista = document.getElementById("lista-noticias");

function fechaLegible(valor) {
    if (!valor) return "NUEVA SEÑAL";
    const fecha = new Date(`${valor}T12:00:00`);
    if (Number.isNaN(fecha.getTime())) return valor;
    return new Intl.DateTimeFormat("es-MX", {
        day: "2-digit", month: "long", year: "numeric"
    }).format(fecha);
}

function crearEnlace(red, url, icono) {
    if (!url) return null;
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.target = "_blank";
    enlace.rel = "noopener noreferrer";
    enlace.setAttribute("aria-label", `Ver publicación en ${red}`);
    enlace.innerHTML = `<i class="${icono}" aria-hidden="true"></i><span>${red}</span>`;
    return enlace;
}

function crearTarjeta(datos) {
    const articulo = document.createElement("article");
    articulo.className = "noticia-platanita";

    const marco = document.createElement("div");
    marco.className = "noticia-platanita__carrusel";
    const imagenes = Array.isArray(datos.imagenes) && datos.imagenes.length
        ? datos.imagenes
        : [datos.imagen].filter(Boolean);
    let indiceActivo = 0;
    let temporizador = null;

    const pista = document.createElement("div");
    pista.className = "noticia-platanita__pista";
    const laminas = imagenes.map((ruta, indice) => {
        const lamina = document.createElement("figure");
        lamina.className = "noticia-platanita__imagen";
        lamina.setAttribute("aria-hidden", indice === 0 ? "false" : "true");
        const imagen = document.createElement("img");
        imagen.src = ruta;
        imagen.alt = `${datos.imagenAlt || datos.titulo}${imagenes.length > 1 ? `, imagen ${indice + 1} de ${imagenes.length}` : ""}`;
        imagen.loading = indice === 0 ? "eager" : "lazy";
        imagen.addEventListener("error", () => lamina.classList.add("noticia-platanita__imagen--error"), { once: true });
        lamina.appendChild(imagen);
        pista.appendChild(lamina);
        return lamina;
    });
    marco.appendChild(pista);

    if (imagenes.length > 1) {
        const controles = document.createElement("div");
        controles.className = "noticia-platanita__controles";
        const anterior = document.createElement("button");
        anterior.type = "button";
        anterior.className = "noticia-platanita__flecha noticia-platanita__flecha--anterior";
        anterior.setAttribute("aria-label", "Imagen anterior");
        anterior.textContent = "‹";
        const siguiente = document.createElement("button");
        siguiente.type = "button";
        siguiente.className = "noticia-platanita__flecha noticia-platanita__flecha--siguiente";
        siguiente.setAttribute("aria-label", "Imagen siguiente");
        siguiente.textContent = "›";
        const indicadores = document.createElement("div");
        indicadores.className = "noticia-platanita__indicadores";
        const puntos = imagenes.map((_, indice) => {
            const punto = document.createElement("button");
            punto.type = "button";
            punto.setAttribute("aria-label", `Mostrar imagen ${indice + 1}`);
            punto.classList.toggle("activo", indice === 0);
            indicadores.appendChild(punto);
            return punto;
        });

        const mostrar = (nuevoIndice) => {
            indiceActivo = (nuevoIndice + imagenes.length) % imagenes.length;
            pista.style.transform = `translateX(-${indiceActivo * 100}%)`;
            laminas.forEach((lamina, indice) => lamina.setAttribute("aria-hidden", indice === indiceActivo ? "false" : "true"));
            puntos.forEach((punto, indice) => punto.classList.toggle("activo", indice === indiceActivo));
        };
        const detener = () => {
            if (temporizador) window.clearInterval(temporizador);
            temporizador = null;
        };
        const iniciar = () => {
            detener();
            if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                temporizador = window.setInterval(() => mostrar(indiceActivo + 1), 5000);
            }
        };

        anterior.addEventListener("click", () => { mostrar(indiceActivo - 1); iniciar(); });
        siguiente.addEventListener("click", () => { mostrar(indiceActivo + 1); iniciar(); });
        puntos.forEach((punto, indice) => punto.addEventListener("click", () => { mostrar(indice); iniciar(); }));
        marco.addEventListener("mouseenter", detener);
        marco.addEventListener("mouseleave", iniciar);
        marco.addEventListener("focusin", detener);
        marco.addEventListener("focusout", iniciar);
        controles.append(anterior, indicadores, siguiente);
        marco.appendChild(controles);
        iniciar();
    }

    const cuerpo = document.createElement("div");
    cuerpo.className = "noticia-platanita__cuerpo";
    const fecha = document.createElement("time");
    fecha.dateTime = datos.fecha || "";
    fecha.textContent = fechaLegible(datos.fecha);
    const titulo = document.createElement("h3");
    titulo.textContent = datos.titulo;
    const descripcion = document.createElement("p");
    descripcion.textContent = datos.descripcion;
    cuerpo.append(fecha, titulo, descripcion);

    const redes = document.createElement("div");
    redes.className = "noticia-platanita__redes";
    [
        crearEnlace("Instagram", datos.instagram, "fa-brands fa-instagram"),
        crearEnlace("Facebook", datos.facebook, "fa-brands fa-facebook-f"),
        crearEnlace("X", datos.x, "fa-brands fa-x-twitter"),
        crearEnlace("TikTok", datos.tiktok, "fa-brands fa-tiktok")
    ].filter(Boolean).forEach((enlace) => redes.appendChild(enlace));
    if (redes.children.length) cuerpo.appendChild(redes);

    articulo.append(marco, cuerpo);
    crearComentariosContextuales(articulo, { tipo: "noticia", id: datos.id });
    conectarModeracion({
        contenedor: articulo,
        oculto: false,
        alEditar: () => { location.href = `sistema-planetario.html?vista=noticias&id=${encodeURIComponent(datos.id)}`; },
        alOcultar: oculto => cambiarVisibilidadContenido("noticias", datos.id, !oculto),
        alEliminar: () => eliminarContenido("noticias", datos.id)
    });
    return articulo;
}

async function cargarNoticias() {
    if (!seccion || !lista) return;
    const resultado = await leerContenidoPublico("noticias");
    lista.replaceChildren();
    resultado.elementos.forEach((noticia) => lista.appendChild(crearTarjeta(noticia)));
    seccion.hidden = resultado.elementos.length === 0;
}

cargarNoticias().catch((error) => {
    console.warn("No fue posible cargar las noticias.", error);
    seccion.hidden = true;
});
