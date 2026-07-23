// ==================================================
// PROYECTO OBSERVATORIO
// TE VI EN UN PLANETARIO
//
// Módulo:
// Feed de Observaciones
//
// Responsabilidad:
// Renderizar, ordenar y administrar las
// Observaciones visibles en el feed.
//
// Versión:
// v0.4
//
// Autor:
// Eduardo Campos
//
// Arquitectura:
// UI Module
// ==================================================


import {
    crearCardObservacion
} from "./card-observacion.js";


/* ==================================================
   REFERENCIAS DEL DOM
================================================== */

const feedObservatorio =
    document.getElementById(
        "feedObservatorio"
    );


const estadoVacio =
    document.getElementById(
        "observatorioVacio"
    );


const botonActualizar =
    document.getElementById(
        "botonActualizarFeed"
    );


const mensajeObservatorio =
    document.getElementById(
        "observatorioMensaje"
    );


/* ==================================================
   DATOS TEMPORALES
   Más adelante serán sustituidos por Firestore.
================================================== */

const observacionesIniciales = [

    {

        id:
            "observacion-oficial-001",

        autorId:
            "te-vi-en-un-planetario",

        autorNombre:
            "Te Vi En Un Planetario",

        autorRango:
            "🌌 Sistema Planetario",

        autorAvatar:
            "TV",

        texto:
            "Hoy comenzamos a construir un nuevo espacio para compartir nuestra música, nuestros procesos y todo aquello que forma parte de este universo.",

        fechaTexto:
            "Hace 2 horas",

        fechaISO:
            "2026-07-23T00:00:00",

        estrellas:
            128,

        ecos:
            24,

        oficial:
            true,

        verificado:
            true,

        imagen:
            "",

        editada:
            false

    },

    {

        id:
            "observacion-eduardo-001",

        autorId:
            "usuario-eduardo",

        autorNombre:
            "Eduardo",

        autorRango:
            "🌠 Viajero",

        autorAvatar:
            "E",

        texto:
            "Escuché El fin de los tiempos durante el trayecto al trabajo. Cada vez encuentro nuevos detalles escondidos entre las canciones.",

        fechaTexto:
            "Hace 20 minutos",

        fechaISO:
            "2026-07-23T01:40:00",

        estrellas:
            4,

        ecos:
            2,

        oficial:
            false,

        verificado:
            false,

        imagen:
            "",

        editada:
            false

    }

];


/* ==================================================
   ESTADO INTERNO
================================================== */

let observaciones =
    [...observacionesIniciales];


let temporizadorMensaje =
    null;


/* ==================================================
   INICIALIZACIÓN
================================================== */

function iniciarFeed() {

    if (!feedObservatorio) {

        console.warn(
            "No se encontró el contenedor #feedObservatorio."
        );

        return;

    }


    renderizarFeed();

    registrarEventos();

}


iniciarFeed();


/* ==================================================
   RENDERIZADO DEL FEED
================================================== */

/**
 * Limpia y vuelve a construir todas las
 * Observaciones visibles.
 */
export function renderizarFeed() {

    if (!feedObservatorio) {

        return;

    }


    feedObservatorio.replaceChildren();


    if (observaciones.length === 0) {

        actualizarEstadoVacio();

        return;

    }


    const fragmento =
        document.createDocumentFragment();


    observaciones.forEach(
        function (observacion) {

            const card =
                crearCardObservacion(
                    observacion
                );


            fragmento.appendChild(
                card
            );

        }
    );


    feedObservatorio.appendChild(
        fragmento
    );


    actualizarEstadoVacio();

}


/* ==================================================
   AGREGAR OBSERVACIÓN
================================================== */

/**
 * Inserta una nueva Observación al principio
 * del feed sin reconstruir toda la lista.
 *
 * @param {Object} observacion
 * @returns {HTMLElement|null}
 */
export function agregarObservacionAlFeed(
    observacion
) {

    if (
        !feedObservatorio ||
        !observacion
    ) {

        return null;

    }


    const nuevaObservacion = {

        ...observacion,

        id:
            observacion.id ||
            generarIdTemporal(),

        fechaTexto:
            observacion.fechaTexto ||
            "Hace unos segundos",

        fechaISO:
            observacion.fechaISO ||
            new Date().toISOString()

    };


    observaciones.unshift(
        nuevaObservacion
    );


    const card =
        crearCardObservacion(
            nuevaObservacion
        );


    card.classList.add(
        "observacion-card--nueva"
    );


    feedObservatorio.prepend(
        card
    );


    actualizarEstadoVacio();


    requestAnimationFrame(
        function () {

            card.classList.add(
                "observacion-card--visible"
            );

        }
    );


    return card;

}


/* ==================================================
   REEMPLAZAR OBSERVACIONES
================================================== */

/**
 * Sustituye todos los datos del feed.
 * Esta función será útil cuando Firestore
 * entregue el primer snapshot.
 *
 * @param {Array<Object>} nuevasObservaciones
 */
export function establecerObservaciones(
    nuevasObservaciones = []
) {

    observaciones =
        Array.isArray(
            nuevasObservaciones
        )
            ? [...nuevasObservaciones]
            : [];


    renderizarFeed();

}


/* ==================================================
   ESTADO VACÍO
================================================== */

function actualizarEstadoVacio() {

    if (!estadoVacio) {

        return;

    }


    const feedEstaVacio =
        observaciones.length === 0;


    estadoVacio.hidden =
        !feedEstaVacio;


    if (feedObservatorio) {

        feedObservatorio.hidden =
            feedEstaVacio;

    }

}


/* ==================================================
   EVENTOS
================================================== */

function registrarEventos() {

    botonActualizar?.addEventListener(
        "click",
        actualizarFeed
    );


    feedObservatorio?.addEventListener(
        "click",
        manejarAccionesFeed
    );


    document.addEventListener(
        "observatorio:nueva-observacion",
        function (evento) {

            const observacion =
                evento.detail;


            if (!observacion) {

                return;

            }


            agregarObservacionAlFeed(
                observacion
            );

        }
    );


    document.addEventListener(
        "observatorio:mensaje",
        function (evento) {

            const mensaje =
                evento.detail;


            if (!mensaje) {

                return;

            }


            mostrarMensaje(
                mensaje
            );

        }
    );

}


/**
 * Por ahora solamente vuelve a renderizar
 * los datos locales.
 *
 * Más adelante solicitará o escuchará
 * nuevamente las Observaciones de Firestore.
 */
function actualizarFeed() {

    if (!botonActualizar) {

        return;

    }


    botonActualizar.disabled =
        true;


    botonActualizar.classList.add(
        "observatorio-feed__actualizar--cargando"
    );


    window.setTimeout(
        function () {

            renderizarFeed();


            botonActualizar.disabled =
                false;


            botonActualizar.classList.remove(
                "observatorio-feed__actualizar--cargando"
            );


            mostrarMensaje(
                "✦ El Observatorio está actualizado."
            );

        },
        450
    );

}


/**
 * Delegación de eventos para las acciones
 * de todas las tarjetas.
 */
function manejarAccionesFeed(
    evento
) {

    const boton =
        evento.target.closest(
            ".observacion-accion"
        );


    if (
        !boton ||
        !feedObservatorio.contains(
            boton
        )
    ) {

        return;

    }


    const card =
        boton.closest(
            ".observacion-card"
        );


    const observacionId =
        card?.dataset.observacionId ||
        "";


    const accion =
        boton.dataset.accion;


    switch (accion) {

        case "estrella":

            mostrarMensaje(
                "☆ El sistema de Estrellas llegará próximamente."
            );

            break;


        case "eco":

            mostrarMensaje(
                "◌ El sistema de Ecos llegará próximamente."
            );

            break;


        case "compartir":

            compartirObservacion(
                observacionId
            );

            break;


        default:

            console.warn(
                "Acción desconocida:",
                accion
            );

    }

}


/* ==================================================
   COMPARTIR
================================================== */

async function compartirObservacion(
    observacionId
) {

    const url =
        crearUrlObservacion(
            observacionId
        );


    try {

        if (
            navigator.share
        ) {

            await navigator.share({

                title:
                    "Observación | Te Vi En Un Planetario",

                text:
                    "Descubre esta Observación en el Observatorio.",

                url:
                    url

            });


            return;

        }


        await navigator.clipboard.writeText(
            url
        );


        mostrarMensaje(
            "✦ Enlace de la Observación copiado."
        );

    }
    catch (error) {

        if (
            error?.name ===
            "AbortError"
        ) {

            return;

        }


        console.error(
            "No fue posible compartir la Observación:",
            error
        );


        mostrarMensaje(
            "No fue posible compartir esta Observación."
        );

    }

}


function crearUrlObservacion(
    observacionId
) {

    const url =
        new URL(
            window.location.href
        );


    if (observacionId) {

        url.hash =
            `observacion-${observacionId}`;

    }


    return url.toString();

}


/* ==================================================
   MENSAJES DEL SISTEMA
================================================== */

export function mostrarMensaje(
    mensaje
) {

    if (!mensajeObservatorio) {

        return;

    }


    window.clearTimeout(
        temporizadorMensaje
    );


    mensajeObservatorio.textContent =
        mensaje;


    mensajeObservatorio.classList.add(
        "observatorio-mensaje--visible"
    );


    temporizadorMensaje =
        window.setTimeout(
            function () {

                mensajeObservatorio.classList.remove(
                    "observatorio-mensaje--visible"
                );

            },
            2800
        );

}


/* ==================================================
   UTILIDADES
================================================== */

function generarIdTemporal() {

    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {

        return crypto.randomUUID();

    }


    return [
        "observacion",
        Date.now(),
        Math.random()
            .toString(16)
            .slice(2)
    ].join("-");

}