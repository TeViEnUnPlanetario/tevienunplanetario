// ==================================================
// PROYECTO OBSERVATORIO
// TE VI EN UN PLANETARIO
//
// Módulo:
// Crear Observación
//
// Responsabilidad:
// Leer, validar y enviar nuevas Observaciones
// hacia el feed.
//
// Versión:
// v0.4
//
// Autor:
// Eduardo Campos
//
// Arquitectura:
// UI Controller
// ==================================================


/* ==================================================
   CONFIGURACIÓN
================================================== */

import {
    guardarObservacion
} from "../../firebase/firestore-observaciones.js";


import {
    auth
} from "../../firebase/firebase-config.js";


import {
    asegurarPerfilUsuario
} from "../../firebase/firestore.js";

import { observarPerfilViajero, pintarAvatar } from "../identidad-viajero.js";


import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";


const LIMITE_CARACTERES =
    800;


const TAMANO_MAXIMO_IMAGEN =
    5 * 1024 * 1024;

let perfilAutorActual =
    null;

let detenerPerfilAutor = () => {};


/* ==================================================
   REFERENCIAS DEL DOM
================================================== */

const formulario =
    document.getElementById(
        "formCrearObservacion"
    );


const textarea =
    document.getElementById(
        "textoObservacion"
    );


const contador =
    document.getElementById(
        "contadorObservacion"
    );


const botonPublicar =
    document.getElementById(
        "botonPublicarObservacion"
    );


const botonImagen =
    document.getElementById(
        "botonAgregarImagen"
    );


const inputImagen =
    document.getElementById(
        "inputImagenObservacion"
    );


const vistaPrevia =
    document.getElementById(
        "vistaPreviaObservacion"
    );


/* ==================================================
   ESTADO INTERNO
================================================== */

let imagenSeleccionada =
    "";


let publicando =
    false;


/* ==================================================
   INICIALIZACIÓN
================================================== */

function iniciarCrearObservacion() {

    if (
        !textarea ||
        !botonPublicar
    ) {

        console.warn(
            "No se encontraron los elementos necesarios para crear Observaciones."
        );

        return;

    }


    textarea.maxLength =
        LIMITE_CARACTERES;


    registrarEventos();

    actualizarFormulario();

}

onAuthStateChanged(

    auth,

    async function (
        usuario
    ) {

        perfilAutorActual =
            null;

        detenerPerfilAutor();
        detenerPerfilAutor = () => {};


        if (!usuario) {

            return;

        }


        try {

            const perfil =
                await asegurarPerfilUsuario(
                    usuario
                );


            perfilAutorActual =
                perfil;


            mostrarAutorEnFormulario(
                perfil,
                usuario
            );

            detenerPerfilAutor = observarPerfilViajero(usuario.uid, perfilVivo => {
                if (!perfilVivo) return;
                perfilAutorActual = perfilVivo;
                mostrarAutorEnFormulario(perfilVivo, usuario);
            });

        }
        catch (
            error
        ) {

            console.error(
                "No fue posible cargar el autor del Observatorio:",
                error
            );


            mostrarAutorEnFormulario(
                null,
                usuario
            );

        }

    }

);


document.addEventListener(
    "DOMContentLoaded",
    iniciarCrearObservacion
);


/* ==================================================
   EVENTOS
================================================== */

function registrarEventos() {

    textarea.addEventListener(
        "input",
        actualizarFormulario
    );


    formulario?.addEventListener(
        "submit",
        publicarObservacion
    );


    botonPublicar.addEventListener(
        "click",
        function (evento) {

            /*
             * Si el botón ya pertenece al formulario,
             * el evento submit se ejecutará automáticamente.
             */

            if (
                formulario &&
                botonPublicar.form === formulario
            ) {

                return;

            }


            publicarObservacion(
                evento
            );

        }
    );


    botonImagen?.addEventListener(
        "click",
        abrirSelectorImagen
    );


    inputImagen?.addEventListener(
        "change",
        procesarImagenSeleccionada
    );


    vistaPrevia?.addEventListener(
        "click",
        manejarVistaPrevia
    );

}


/* ==================================================
   PERFIL DEL AUTOR EN EL FORMULARIO
================================================== */

function mostrarAutorEnFormulario(
    perfil,
    usuario
) {

    const nombre =
        String(
            perfil?.nombre ||
            usuario?.displayName ||
            usuario?.email?.split("@")[0] ||
            "Viajero"
        ).trim();


    const rangoBase =
        String(
            perfil?.rango ||
            "Viajero"
        ).trim();


    const rango =
        rangoBase.startsWith("🌠")
            ? rangoBase
            : `🌠 ${rangoBase}`;


    const avatar =
        String(
            perfil?.foto ||
            perfil?.avatar ||
            perfil?.iniciales ||
            obtenerIniciales(nombre)
        ).trim();


    const elementoNombre =
        document.querySelector(
            ".crear-observacion__nombre"
        );


    const elementoRango =
        document.querySelector(
            ".crear-observacion__rango"
        );


    const elementoAvatar =
        document.querySelector(
            ".crear-observacion__avatar"
        );


    if (elementoNombre) {

        elementoNombre.textContent =
            nombre;

        elementoNombre.dataset.usuarioNombre =
            nombre;

    }


    if (elementoRango) {

        elementoRango.textContent =
            rango;

        elementoRango.dataset.usuarioRango =
            rango;

    }


    if (elementoAvatar) {

        pintarAvatar(
            elementoAvatar,
            perfil?.foto || avatar,
            nombre
        );

        elementoAvatar.dataset.usuarioAvatar =
            avatar;

    }

}


/* ==================================================
   PUBLICAR OBSERVACIÓN
================================================== */

async function publicarObservacion(
    evento
) {

    evento?.preventDefault();


    if (publicando) {

        return;

    }


    const texto =
        textarea.value.trim();


    if (!texto) {

        marcarCampoInvalido();

        return;

    }


    if (
        texto.length >
        LIMITE_CARACTERES
    ) {

        mostrarMensajeLocal(
            `La Observación no puede superar los ${LIMITE_CARACTERES} caracteres.`
        );

        return;

    }


    publicando =
        true;


    actualizarFormulario();


    try {

        const autor =
           await obtenerDatosAutor();


        await guardarObservacion({

            texto:
                texto,

            imagen:
                imagenSeleccionada,

            autorNombre:
                autor.nombre,

            autorRango:
                autor.rango,

            autorAvatar:
                autor.avatar,

            oficial:
                autor.oficial,

            verificado:
                autor.verificado

        });


        /*
         * No agregamos la tarjeta manualmente.
         *
         * escucharObservaciones() detectará la nueva
         * publicación desde Firestore y actualizará
         * automáticamente el feed.
         */

        limpiarFormulario();


        mostrarConfirmacion();

    }
    catch (error) {

        console.error(
            "No fue posible publicar la Observación:",
            error
        );


        mostrarMensajeLocal(
            error?.message ||
            "No fue posible publicar la Observación."
        );

    }
    finally {

        publicando =
            false;


        actualizarFormulario();

    }

}


/* ==================================================
   DATOS DEL AUTOR
================================================== */

async function obtenerDatosAutor() {

    const usuario =
        auth.currentUser;


    if (!usuario) {

        throw new Error(
            "Debes iniciar sesión para publicar una Observación."
        );

    }


    let perfil =
        perfilAutorActual;


    if (!perfil) {

        perfil =
            await asegurarPerfilUsuario(
                usuario
            );


        perfilAutorActual =
            perfil;

    }


    const nombre =
        String(
            perfil?.nombre ||
            usuario.displayName ||
            usuario.email?.split("@")[0] ||
            "Viajero"
        ).trim();


    const rangoBase =
        String(
            perfil?.rango ||
            "Viajero"
        ).trim();


    const rango =
        rangoBase.startsWith("🌠")
            ? rangoBase
            : `🌠 ${rangoBase}`;


    const avatar =
        String(
            perfil?.foto ||
            perfil?.avatar ||
            perfil?.iniciales ||
            obtenerIniciales(nombre)
        ).trim();


    return {

        id:
            usuario.uid,

        nombre:
            nombre,

        rango:
            rango,

        avatar:
            avatar,

        oficial:
            Boolean(
                perfil?.oficial
            ),

        verificado:
            Boolean(
                perfil?.verificado ||
                perfil?.oficial
            )

    };

}





/* ==================================================
   ESTADO DEL FORMULARIO
================================================== */

function actualizarFormulario() {

    const longitud =
        textarea
            ? textarea.value.length
            : 0;


    actualizarContador(
        longitud
    );


    const textoValido =
        longitud > 0 &&
        textarea.value.trim().length > 0 &&
        longitud <= LIMITE_CARACTERES;


    if (botonPublicar) {

        botonPublicar.disabled =
            !textoValido ||
            publicando;


        botonPublicar.classList.toggle(
            "crear-observacion__publicar--cargando",
            publicando
        );


        if (publicando) {

            botonPublicar.setAttribute(
                "aria-busy",
                "true"
            );

        }
        else {

            botonPublicar.removeAttribute(
                "aria-busy"
            );

        }

    }

}


function actualizarContador(
    longitud
) {

    if (!contador) {

        return;

    }


    contador.textContent =
        String(
            longitud
        );


    const cercaDelLimite =
        longitud >=
        LIMITE_CARACTERES * 0.9;


    contador.classList.toggle(
        "crear-observacion__contador--limite",
        cercaDelLimite
    );

}


/* ==================================================
   VALIDACIÓN
================================================== */

function marcarCampoInvalido() {

    textarea.classList.remove(
        "crear-observacion__texto--invalido"
    );


    void textarea.offsetWidth;


    textarea.classList.add(
        "crear-observacion__texto--invalido"
    );


    textarea.focus();


    window.setTimeout(
        function () {

            textarea.classList.remove(
                "crear-observacion__texto--invalido"
            );

        },
        500
    );

}


/* ==================================================
   IMÁGENES
================================================== */

function abrirSelectorImagen() {

    if (!inputImagen) {

        console.warn(
            "No se encontró #inputImagenObservacion."
        );

        return;

    }


    inputImagen.click();

}


function procesarImagenSeleccionada(
    evento
) {

    const archivo =
        evento.target.files?.[0];


    if (!archivo) {

        return;

    }


    if (
        !archivo.type.startsWith(
            "image/"
        )
    ) {

        mostrarMensajeLocal(
            "Selecciona un archivo de imagen válido."
        );


        limpiarInputImagen();

        return;

    }


    if (
        archivo.size >
        TAMANO_MAXIMO_IMAGEN
    ) {

        mostrarMensajeLocal(
            "La imagen no puede superar los 5 MB."
        );


        limpiarInputImagen();

        return;

    }


    const lector =
        new FileReader();


    lector.addEventListener(
        "load",
        function () {

            imagenSeleccionada =
                String(
                    lector.result
                );


            mostrarVistaPrevia(
                imagenSeleccionada,
                archivo.name
            );

        }
    );


    lector.addEventListener(
        "error",
        function () {

            mostrarMensajeLocal(
                "No fue posible leer la imagen."
            );


            limpiarInputImagen();

        }
    );


    lector.readAsDataURL(
        archivo
    );

}


function mostrarVistaPrevia(
    imagen,
    nombreArchivo
) {

    if (!vistaPrevia) {

        return;

    }


    vistaPrevia.replaceChildren();


    const contenedor =
        document.createElement(
            "div"
        );


    contenedor.className =
        "crear-observacion__preview-contenido";


    const elementoImagen =
        document.createElement(
            "img"
        );


    elementoImagen.src =
        imagen;


    elementoImagen.alt =
        `Vista previa de ${nombreArchivo}`;


    const botonEliminar =
        document.createElement(
            "button"
        );


    botonEliminar.type =
        "button";


    botonEliminar.className =
        "crear-observacion__eliminar-imagen";


    botonEliminar.dataset.accion =
        "eliminar-imagen";


    botonEliminar.setAttribute(
        "aria-label",
        "Eliminar imagen seleccionada"
    );


    botonEliminar.textContent =
        "×";


    contenedor.append(
        elementoImagen,
        botonEliminar
    );


    vistaPrevia.appendChild(
        contenedor
    );


    vistaPrevia.hidden =
        false;


    botonImagen?.classList.add(
        "crear-observacion__imagen--seleccionada"
    );

}


function manejarVistaPrevia(
    evento
) {

    const botonEliminar =
        evento.target.closest(
            "[data-accion='eliminar-imagen']"
        );


    if (!botonEliminar) {

        return;

    }


    eliminarImagenSeleccionada();

}


function eliminarImagenSeleccionada() {

    imagenSeleccionada =
        "";


    limpiarInputImagen();


    if (vistaPrevia) {

        vistaPrevia.replaceChildren();

        vistaPrevia.hidden =
            true;

    }


    botonImagen?.classList.remove(
        "crear-observacion__imagen--seleccionada"
    );

}


function limpiarInputImagen() {

    if (inputImagen) {

        inputImagen.value =
            "";

    }

}


/* ==================================================
   LIMPIAR FORMULARIO
================================================== */

function limpiarFormulario() {

    textarea.value =
        "";


    eliminarImagenSeleccionada();

    actualizarFormulario();

    textarea.focus();

}


/* ==================================================
   CONFIRMACIÓN
================================================== */

function mostrarConfirmacion() {

    mostrarMensajeLocal(
        "✦ Observación publicada."
    );

}


function mostrarMensajeLocal(
    mensaje
) {

    /*
     * feed.js ya cuenta con su propio sistema
     * de mensajes. Disparamos un evento para
     * conservar los módulos separados.
     */

    document.dispatchEvent(

        new CustomEvent(
            "observatorio:mensaje",
            {

                detail:
                    mensaje

            }
        )

    );

}


/* ==================================================
   UTILIDADES
================================================== */

function obtenerTextoPrimerElemento(
    selectores
) {

    for (
        const selector of selectores
    ) {

        const elemento =
            document.querySelector(
                selector
            );


        const texto =
            elemento?.textContent?.trim();


        if (texto) {

            return texto;

        }

    }


    return "";

}


function obtenerIniciales(
    nombre
) {

    const palabras =
        String(
            nombre
        )
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (
        palabras.length === 0
    ) {

        return "✦";

    }


    if (
        palabras.length === 1
    ) {

        return palabras[0]
            .slice(0, 2)
            .toUpperCase();

    }


    return (
        palabras[0][0] +
        palabras[1][0]
    ).toUpperCase();

}


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
