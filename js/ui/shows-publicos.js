// ==================================================
// INTERFAZ PÚBLICA — PRESENTACIONES
// ==================================================

import {
    leerPresentacionesPublicas
} from "../firebase/firestore-presentaciones-publicas.js";

import {
    crearComentariosContextuales
} from "./comentarios-contextuales.js?v=11";


const seccion = document.getElementById("shows");
const contenedor = document.getElementById("tarjetas-shows");
const IMAGEN_RESPALDO = "img/shows/cdneza.jpg";


function fechaPublica(fecha) {
    if (!(fecha instanceof Date) || Number.isNaN(fecha.getTime())) {
        return "Fecha por confirmar";
    }

    const fechaTexto = new Intl.DateTimeFormat("es-MX", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
    }).format(fecha);
    const hora = new Intl.DateTimeFormat("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    }).format(fecha);

    return `${fechaTexto.charAt(0).toUpperCase()}${fechaTexto.slice(1)} - ${hora} hrs.`;
}


function urlWebSegura(valor) {
    try {
        const url = new URL(String(valor || "").trim());
        return ["https:", "http:"].includes(url.protocol)
            ? url.href
            : "";
    } catch {
        return "";
    }
}


function imagenSegura(valor) {
    const imagen = String(valor || "").trim();

    if (/^(img\/|\.\/|\.\.\/)/i.test(imagen)) {
        return imagen;
    }

    return urlWebSegura(imagen) || IMAGEN_RESPALDO;
}


function crearTarjeta(show, indice) {
    const articulo = document.createElement("article");
    articulo.className = `show revelar-scroll retraso-${(indice % 3) + 1}`;
    articulo.dataset.presentacionId = show.id;

    const imagen = document.createElement("img");
    imagen.src = imagenSegura(show.imagen);
    imagen.alt = show.imagenAlt || `Cartel de ${show.nombre}`;
    imagen.loading = "lazy";
    imagen.addEventListener("error", () => {
        imagen.src = IMAGEN_RESPALDO;
    }, { once: true });

    const contenido = document.createElement("div");
    const fecha = document.createElement("span");
    fecha.textContent = fechaPublica(show.fecha);
    const titulo = document.createElement("h3");
    titulo.textContent = show.nombre;
    const descripcion = document.createElement("p");
    descripcion.textContent = show.descripcion;

    contenido.append(fecha, titulo, descripcion);

    const boletos = urlWebSegura(show.boletos);
    if (boletos) {
        const enlace = document.createElement("a");
        enlace.href = boletos;
        enlace.target = "_blank";
        enlace.rel = "noopener noreferrer";
        enlace.className = "btn-boletos";
        enlace.textContent = "🎟 Comprar boletos";
        contenido.appendChild(enlace);
    }

    articulo.append(imagen, contenido);
    crearComentariosContextuales(articulo, {
        tipo: "presentacion",
        id: show.id
    });

    requestAnimationFrame(() => {
        requestAnimationFrame(() => articulo.classList.add("visible"));
    });

    return articulo;
}


function mostrarSeccion(origen) {
    seccion.hidden = false;
    seccion.removeAttribute("data-shows-pendientes");
    seccion.dataset.origenShows = origen;
}


async function iniciarShowsPublicos() {
    if (!seccion || !contenedor) {
        return;
    }

    const resultado = await leerPresentacionesPublicas();

    if (resultado.estado === "respaldo") {
        const idsRespaldo = [
            "cd-neza-2026-08-01",
            "satelite-2026-08-07",
            "coacalco-2026-08-08"
        ];
        contenedor.querySelectorAll(".show").forEach((tarjeta, indice) => {
            const id = tarjeta.dataset.presentacionId || idsRespaldo[indice];
            if (id && !tarjeta.querySelector(".comentarios-contextuales")) {
                crearComentariosContextuales(tarjeta, {
                    tipo: "presentacion",
                    id
                });
            }
        });
        mostrarSeccion("respaldo");
        return;
    }

    if (resultado.presentaciones.length === 0) {
        seccion.hidden = true;
        seccion.removeAttribute("data-shows-pendientes");
        seccion.dataset.origenShows = "firestore-vacio";
        return;
    }

    const fragmento = document.createDocumentFragment();
    resultado.presentaciones.forEach((show, indice) => {
        fragmento.appendChild(crearTarjeta(show, indice));
    });

    contenedor.replaceChildren(fragmento);
    mostrarSeccion("firestore");
}


iniciarShowsPublicos();
