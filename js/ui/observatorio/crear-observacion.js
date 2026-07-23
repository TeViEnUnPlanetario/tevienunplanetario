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

const LIMITE_CARACTERES =
    800;


const TAMANO_MAXIMO_IMAGEN =
    5 * 1024 * 1024;


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
   PUBLICAR OBSERVACIÓN
================================================== */

function publicarObservacion(
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

        return;

    }


    publicando =
        true;


    actualizarFormulario();


    const autor =
        obtenerDatosAutor();


    const observacion = {

        id:
            generarIdTemporal(),

        autorId:
            autor.id,

        autorNombre:
            autor.nombre,

        autorRango:
            autor.rango,

        autorAvatar:
            autor.avatar,

        texto:
            texto,

        fechaTexto:
            "Hace unos segundos",

        fechaISO:
            new Date().toISOString(),

        estrellas:
            0,

        ecos:
            0,

        oficial:
            autor.oficial,

        verificado:
            autor.verificado,

        imagen:
            imagenSeleccionada,

        editada:
            false

    };


    /*
     * Este evento es escuchado desde feed.js.
     *
     * Así evitamos que crear-observacion.js tenga
     * que importar directamente al feed.
     */

    document.dispatchEvent(

        new CustomEvent(
            "observatorio:nueva-observacion",
            {

                detail:
                    observacion

            }
        )

    );


    limpiarFormulario();


    mostrarConfirmacion();


    window.setTimeout(
        function () {

            publicando =
                false;


            actualizarFormulario();

        },
        350
    );

}


/* ==================================================
   DATOS DEL AUTOR
================================================== */

function obtenerDatosAutor() {

    /*
     * Primero intentamos obtener los datos visibles
     * del perfil que ya existe en la interfaz.
     */

    const nombreVisible =
        obtenerTextoPrimerElemento([

            "[data-usuario-nombre]",

            "#usuarioNombre",

            ".crear-observacion__nombre",

            ".perfil-usuario__nombre"

        ]);


    const rangoVisible =
        obtenerTextoPrimerElemento([

            "[data-usuario-rango]",

            "#usuarioRango",

            ".crear-observacion__rango",

            ".perfil-usuario__rango"

        ]);


    const avatarVisible =
        obtenerTextoPrimerElemento([

            "[data-usuario-avatar]",

            "#usuarioAvatar",

            ".crear-observacion__avatar",

            ".perfil-usuario__avatar"

        ]);


    return {

        id:
            obtenerUsuarioId(),

        nombre:
            nombreVisible ||
            "Eduardo",

        rango:
            rangoVisible ||
            "🌠 Viajero",

        avatar:
            avatarVisible ||
            obtenerIniciales(
                nombreVisible ||
                "Eduardo"
            ),

        oficial:
            false,

        verificado:
            false

    };

}


function obtenerUsuarioId() {

    const elementoUsuario =
        document.querySelector(
            "[data-usuario-id]"
        );


    if (
        elementoUsuario?.dataset.usuarioId
    ) {

        return elementoUsuario.dataset.usuarioId;

    }


    return "usuario-local";

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