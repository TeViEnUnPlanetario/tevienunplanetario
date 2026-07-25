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


import {
    escucharObservaciones
} from "../../firebase/firestore-observaciones.js";


import {
    alternarEstrella,
    escucharEstrellasUsuario
} from "../../firebase/firestore-estrellas.js";


import {
    abrirEcos
} from "./comentarios.js";



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

/* Ya se sustituyeron 


/* ==================================================
   ESTADO INTERNO
================================================== */

let observaciones =[];


let temporizadorMensaje =
    null;


let estrellasUsuario =
    new Set();


let procesandoEstrellas =
    new Set();


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


    registrarEventos();


    escucharEstrellasUsuario(

    function (
        nuevasEstrellas
    ) {

        estrellasUsuario =
            nuevasEstrellas;


        actualizarEstadoVisualEstrellas();

    },

    function (
        error
    ) {

        console.error(
            "No fue posible escuchar las Estrellas:",
            error
        );

    }

);


    escucharObservaciones(

        function (
            nuevasObservaciones
        ) {

            establecerObservaciones(
                nuevasObservaciones
            );

        },

        function (
            error
        ) {

            console.error(
                "No fue posible cargar las Observaciones:",
                error
            );


            mostrarMensaje(
                "No fue posible cargar las Observaciones."
            );

        }

    );

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

    actualizarEstadoVisualEstrellas();


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
async function manejarAccionesFeed(
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

        await procesarEstrella(
        observacionId,
        boton
      );

        break;


case "eco":

    mostrarMensaje(
        "Ecos en mantenimiento."
    );

    abrirEcos(
        observacionId
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
   ESTRELLAS
================================================== */

async function procesarEstrella(
    observacionId,
    boton
) {

    if (
        !observacionId ||
        !boton
    ) {

        return;

    }


    if (
        procesandoEstrellas.has(
            observacionId
        )
    ) {

        return;

    }


    procesandoEstrellas.add(
        observacionId
    );


    boton.disabled =
        true;


    boton.classList.add(
        "observacion-accion--cargando"
    );


    try {

        const resultado =
            await alternarEstrella(
                observacionId
            );


        /*
         * Actualización inmediata de la interfaz.
         * Los listeners de Firestore confirmarán
         * el estado después.
         */

        if (
            resultado.activa
        ) {

            estrellasUsuario.add(
                observacionId
            );

        }
        else {

            estrellasUsuario.delete(
                observacionId
            );

        }


        actualizarBotonEstrella(
            boton,
            resultado.activa,
            resultado.total
        );


        mostrarMensaje(

            resultado.activa
                ? "★ Enviaste una Estrella."
                : "☆ Retiraste tu Estrella."

        );

    }
    catch (
        error
    ) {

        console.error(
            "No fue posible actualizar la Estrella:",
            error
        );


        mostrarMensaje(
            error.message ||
            "No fue posible actualizar la Estrella."
        );

    }
    finally {

        procesandoEstrellas.delete(
            observacionId
        );


        boton.disabled =
            false;


        boton.classList.remove(
            "observacion-accion--cargando"
        );

    }

}


function actualizarEstadoVisualEstrellas() {

    if (!feedObservatorio) {

        return;

    }


    const tarjetas =
        feedObservatorio.querySelectorAll(
            ".observacion-card"
        );


    tarjetas.forEach(

        function (
            tarjeta
        ) {

            const observacionId =
                tarjeta.dataset.observacionId ||
                "";


            const boton =
                tarjeta.querySelector(
                    "[data-accion='estrella']"
                );


            if (!boton) {

                return;

            }


            const estaActiva =
                estrellasUsuario.has(
                    observacionId
                );


            const total =
                Number(
                    boton.dataset.cantidad ||
                    0
                );


            actualizarBotonEstrella(
                boton,
                estaActiva,
                total
            );

        }

    );

}


function actualizarBotonEstrella(
    boton,
    activa,
    total
) {

    const cantidad =
        Math.max(
            0,
            Number(
                total
            ) || 0
        );


    boton.dataset.cantidad =
        String(
            cantidad
        );


    boton.classList.toggle(
        "observacion-accion--activa",
        activa
    );


    boton.setAttribute(
        "aria-pressed",
        String(
            activa
        )
    );


    boton.setAttribute(
        "aria-label",

        activa
            ? `Retirar Estrella. ${cantidad} Estrellas`
            : `Dar Estrella. ${cantidad} Estrellas`

    );


    /*
     * crearBotonAccion genera varios spans.
     * Seleccionamos el primero como icono.
     */

    const icono =
        boton.querySelector(
            "span"
        );


    if (icono) {

        icono.textContent =
            activa
                ? "★"
                : "☆";

    }


    const texto =
        cantidad === 1
            ? "1 Estrella"
            : `${cantidad} Estrellas`;


    /*
     * El texto normalmente está en el último span.
     */

    const elementos =
        boton.querySelectorAll(
            "span"
        );


    const elementoTexto =
        elementos[
            elementos.length - 1
        ];


    if (
        elementoTexto &&
        elementoTexto !== icono
    ) {

        elementoTexto.textContent =
            texto;

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