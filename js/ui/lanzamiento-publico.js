// ==================================================
// INTERFAZ PÚBLICA — PRÓXIMO LANZAMIENTO
// ==================================================

import {
    HILO_LANZAMIENTO_INICIAL,
    leerProximoLanzamientoPublico
} from "../firebase/firestore-lanzamiento.js";

import {
    crearComentariosContextuales
} from "./comentarios-contextuales.js?v=12";
import { eliminarProximoLanzamiento, guardarProximoLanzamiento } from "../firebase/firestore-administracion.js";
import { conectarModeracion } from "./moderacion.js";


const elementos = {
    seccion: document.getElementById("proximo-lanzamiento"),
    titulo: document.getElementById("titulo-proximo-lanzamiento"),
    descripcion: document.getElementById("descripcion-proximo-lanzamiento"),
    portada: document.getElementById("portada-proximo-lanzamiento"),
    fondo: document.getElementById("fondo-proximo-lanzamiento"),
    disponibilidad: document.getElementById("disponibilidad-proximo-lanzamiento"),
    spotify: document.getElementById("spotify-proximo-lanzamiento"),
    appleMusic: document.getElementById("apple-proximo-lanzamiento")
};


function convertirFecha(fecha) {
    if (!fecha) {
        return null;
    }

    const valor = typeof fecha.toDate === "function"
        ? fecha.toDate()
        : new Date(fecha);

    return Number.isNaN(valor.getTime()) ? null : valor;
}


function textoSeguro(valor, respaldo) {
    const texto = String(valor ?? "").trim();
    return texto || respaldo;
}


function urlWebSegura(valor, respaldo) {
    const texto = String(valor ?? "").trim();

    if (!texto) {
        return respaldo;
    }

    try {
        const url = new URL(texto);
        return ["https:", "http:"].includes(url.protocol)
            ? url.href
            : respaldo;
    } catch {
        return respaldo;
    }
}


function urlImagenSegura(valor, respaldo) {
    const texto = String(valor ?? "").trim();

    if (!texto) {
        return respaldo;
    }

    if (/^(\.\/|\.\.\/|img\/)/i.test(texto)) {
        return texto;
    }

    return urlWebSegura(texto, respaldo);
}


function actualizarPortada(url) {
    const respaldo = elementos.portada.getAttribute("src");
    const imagen = urlImagenSegura(url, respaldo);
    const titulo = elementos.titulo.textContent.trim();

    elementos.portada.onerror = function () {
        elementos.portada.onerror = null;
        elementos.portada.src = respaldo;
        elementos.fondo.style.removeProperty("background");
    };

    elementos.portada.src = imagen;
    elementos.portada.alt = `Portada de ${titulo}`;
    elementos.fondo.style.setProperty(
        "background",
        `url(${JSON.stringify(imagen)}) center / cover no-repeat`,
        "important"
    );
}


function actualizarEnlace(elemento, valor) {
    const respaldo = elemento.getAttribute("href") || "#";
    elemento.href = urlWebSegura(valor, respaldo);
}


function aplicarDatos(datos) {
    elementos.titulo.textContent = textoSeguro(
        datos.titulo,
        elementos.titulo.textContent
    );
    elementos.descripcion.textContent = textoSeguro(
        datos.descripcion,
        elementos.descripcion.textContent
    );
    elementos.disponibilidad.textContent = textoSeguro(
        datos.disponibilidad,
        elementos.disponibilidad.textContent
    );

    actualizarPortada(datos.imagen);
    actualizarEnlace(elementos.spotify, datos.spotify);
    actualizarEnlace(elementos.appleMusic, datos.appleMusic);

    const fecha = convertirFecha(datos.fecha);

    if (fecha && typeof window.actualizarFechaLanzamiento === "function") {
        window.actualizarFechaLanzamiento(fecha);
    }
}


function mostrarSeccion(origen) {
    elementos.seccion.hidden = false;
    elementos.seccion.removeAttribute("data-lanzamiento-pendiente");
    elementos.seccion.dataset.origenLanzamiento = origen;
}


function prepararComentarios(hiloId) {
    if (elementos.seccion.querySelector(".comentarios-contextuales")) {
        return;
    }
    crearComentariosContextuales(elementos.seccion, {
        tipo: "lanzamiento",
        id: hiloId || HILO_LANZAMIENTO_INICIAL
    });
}


async function iniciarLanzamientoPublico() {
    if (!elementos.seccion) {
        return;
    }

    const resultado = await leerProximoLanzamientoPublico();

    if (resultado.estado === "oculto") {
        elementos.seccion.hidden = true;
        return;
    }

    if (resultado.estado === "publicado" && resultado.datos) {
        aplicarDatos(resultado.datos);
    }

    mostrarSeccion(resultado.estado);
    prepararComentarios(resultado.datos?.hiloComentariosId);
    if (resultado.datos) conectarModeracion({
        contenedor: elementos.seccion,
        oculto: false,
        alEditar: () => { location.href = "sistema-planetario.html?vista=lanzamiento"; },
        alOcultar: oculto => guardarProximoLanzamiento({ ...resultado.datos, visible: !oculto }),
        alEliminar: eliminarProximoLanzamiento
    });
}


iniciarLanzamientoPublico();
