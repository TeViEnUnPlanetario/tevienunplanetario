// ==================================================
// PROYECTO OBSERVATORIO
// TE VI EN UN PLANETARIO
//
// Componente:
// Card de Observación
//
// Responsabilidad:
// Construir y devolver una Observación como
// elemento real del DOM.
//
// Versión:
// v0.4
//
// Autor:
// Eduardo Campos
//
// Arquitectura:
// UI Component
// ==================================================


/**
 * Construye una tarjeta completa de Observación.
 *
 * @param {Object} observacion
 * @returns {HTMLElement}
 */
export function crearCardObservacion(
    observacion = {}
) {

    const datos =
        normalizarObservacion(
            observacion
        );


    const card =
        document.createElement(
            "article"
        );


    card.classList.add(
        "observacion-card"
    );


    if (datos.oficial) {

        card.classList.add(
            "observacion-card--oficial"
        );

    }


    if (datos.id) {

        card.dataset.observacionId =
            datos.id;

    }


    const brillo =
        crearBrillo();


    const header =
        crearHeader(
            datos
        );


    const contenido =
        crearContenido(
            datos
        );


    const acciones =
        crearAcciones(
            datos
        );


    card.append(
        brillo,
        header,
        contenido,
        acciones
    );


    return card;

}


/* ==================================================
   NORMALIZACIÓN DE DATOS
================================================== */

/**
 * Garantiza que el componente siempre reciba
 * valores seguros y consistentes.
 *
 * @param {Object} observacion
 * @returns {Object}
 */
function normalizarObservacion(
    observacion
) {

    const nombre =
        limpiarTexto(
            observacion.autorNombre ??
            observacion.autor ??
            "Viajero desconocido"
        );


    const rango =
        limpiarTexto(
            observacion.autorRango ??
            observacion.rango ??
            "🌠 Viajero"
        );


    const texto =
        limpiarTexto(
            observacion.texto ??
            ""
        );


    const avatar =
        limpiarTexto(
            observacion.autorAvatar ??
            observacion.avatar ??
            obtenerIniciales(nombre)
        );


    return {

        id:
            observacion.id ?? "",

        autorId:
            observacion.autorId ?? "",

        autorNombre:
            nombre,

        autorRango:
            rango,

        autorAvatar:
            avatar,

        texto:
            texto,

        fechaTexto:
            limpiarTexto(
                observacion.fechaTexto ??
                observacion.fechaRelativa ??
                "Hace unos segundos"
            ),

        fechaISO:
            limpiarTexto(
                observacion.fechaISO ??
                new Date().toISOString()
            ),

        estrellas:
            normalizarContador(
                observacion.estrellas
            ),

        ecos:
            normalizarContador(
                observacion.ecos
            ),

        oficial:
            Boolean(
                observacion.oficial
            ),

        verificado:
            Boolean(
                observacion.verificado ||
                observacion.oficial
            ),

        imagen:
            limpiarTexto(
                observacion.imagen ??
                ""
            ),

        editada:
            Boolean(
                observacion.editada
            )

    };

}


/* ==================================================
   BRILLO DECORATIVO
================================================== */

function crearBrillo() {

    const brillo =
        document.createElement(
            "div"
        );


    brillo.className =
        "observacion-card__brillo";


    brillo.setAttribute(
        "aria-hidden",
        "true"
    );


    return brillo;

}


/* ==================================================
   ENCABEZADO
================================================== */

function crearHeader(
    datos
) {

    const header =
        document.createElement(
            "header"
        );


    header.className =
        "observacion-card__header";


    const avatar =
        crearAvatar(
            datos.autorAvatar,
            datos.autorNombre
        );


    const identidad =
        crearIdentidad(
            datos
        );


    const fecha =
        crearFecha(
            datos
        );


    header.append(
        avatar,
        identidad,
        fecha
    );


    return header;

}


/**
 * Crea el avatar textual temporal.
 * Más adelante podrá renderizar una imagen.
 */
function crearAvatar(
    iniciales,
    nombre
) {

    const avatar =
        document.createElement(
            "div"
        );


    avatar.className =
        "observacion-card__avatar";


    avatar.textContent =
        iniciales;


    avatar.setAttribute(
        "aria-label",
        `Avatar de ${nombre}`
    );


    return avatar;

}


/**
 * Crea nombre, insignia y rango del autor.
 */
function crearIdentidad(
    datos
) {

    const identidad =
        document.createElement(
            "div"
        );


    identidad.className =
        "observacion-card__identidad";


    const lineaNombre =
        document.createElement(
            "div"
        );


    lineaNombre.className =
        "observacion-card__nombre-linea";


    const nombre =
        document.createElement(
            "strong"
        );


    nombre.textContent =
        datos.autorNombre;


    lineaNombre.appendChild(
        nombre
    );


    if (datos.verificado) {

        const insignia =
            crearInsigniaVerificada();


        lineaNombre.appendChild(
            insignia
        );

    }


    const rango =
        document.createElement(
            "span"
        );


    rango.className =
        "observacion-card__rango";


    rango.textContent =
        datos.autorRango;


    identidad.append(
        lineaNombre,
        rango
    );


    return identidad;

}


/**
 * Insignia para cuentas oficiales o verificadas.
 */
function crearInsigniaVerificada() {

    const insignia =
        document.createElement(
            "span"
        );


    insignia.className =
        "observacion-card__verificado";


    insignia.textContent =
        "✦";


    insignia.title =
        "Cuenta oficial";


    insignia.setAttribute(
        "aria-label",
        "Cuenta oficial"
    );


    return insignia;

}


/**
 * Crea la fecha visible y su valor semántico.
 */
function crearFecha(
    datos
) {

    const fecha =
        document.createElement(
            "time"
        );


    fecha.className =
        "observacion-card__fecha";


    fecha.dateTime =
        datos.fechaISO;


    fecha.textContent =
        datos.fechaTexto;


    return fecha;

}


/* ==================================================
   CONTENIDO
================================================== */

function crearContenido(
    datos
) {

    const contenido =
        document.createElement(
            "div"
        );


    contenido.className =
        "observacion-card__contenido";


    if (datos.oficial) {

        const tipo =
            document.createElement(
                "span"
            );


        tipo.className =
            "observacion-card__tipo";


        tipo.textContent =
            "Observación oficial";


        contenido.appendChild(
            tipo
        );

    }


    const texto =
        document.createElement(
            "p"
        );


    texto.textContent =
        datos.texto;


    contenido.appendChild(
        texto
    );


    if (datos.imagen) {

        const imagen =
            crearImagen(
                datos
            );


        contenido.appendChild(
            imagen
        );

    }


    if (datos.editada) {

        const editada =
            document.createElement(
                "span"
            );


        editada.className =
            "observacion-card__editada";


        editada.textContent =
            "Editada";


        contenido.appendChild(
            editada
        );

    }


    return contenido;

}


/**
 * Soporte inicial para imágenes.
 * Todavía no lo conectaremos con Firebase Storage.
 */
function crearImagen(
    datos
) {

    const contenedor =
        document.createElement(
            "figure"
        );


    contenedor.className =
        "observacion-card__media";


    const imagen =
        document.createElement(
            "img"
        );


    imagen.className =
        "observacion-card__imagen";


    imagen.src =
        datos.imagen;


    imagen.alt =
        `Imagen compartida por ${datos.autorNombre}`;


    imagen.loading =
        "lazy";


    imagen.addEventListener(
        "error",
        function () {

            contenedor.remove();

        },
        {
            once: true
        }
    );


    contenedor.appendChild(
        imagen
    );


    return contenedor;

}


/* ==================================================
   ACCIONES
================================================== */

function crearAcciones(
    datos
) {

    const footer =
        document.createElement(
            "footer"
        );


    footer.className =
        "observacion-card__acciones";


    const botonEstrellas =
        crearBotonAccion({

            accion:
                "estrella",

            icono:
                "☆",

            texto:
                construirTextoContador(
                    datos.estrellas,
                    "Estrella",
                    "Estrellas"
                ),

            cantidad:
                datos.estrellas

        });


    const botonEcos =
        crearBotonAccion({

            accion:
                "eco",

            icono:
                "◌",

            texto:
                construirTextoContador(
                    datos.ecos,
                    "Eco",
                    "Ecos"
                ),

            cantidad:
                datos.ecos

        });


    const botonCompartir =
        crearBotonAccion({

            accion:
                "compartir",

            icono:
                "↗",

            texto:
                "Compartir",

            claseExtra:
                "observacion-accion--compartir"

        });


    footer.append(
        botonEstrellas,
        botonEcos,
        botonCompartir
    );


    return footer;

}


/**
 * Construye un botón reutilizable para las
 * acciones de la Observación.
 */
function crearBotonAccion({
    accion,
    icono,
    texto,
    cantidad = null,
    claseExtra = ""
}) {

    const boton =
        document.createElement(
            "button"
        );


    boton.type =
        "button";


    boton.className =
        "observacion-accion";


    if (claseExtra) {

        boton.classList.add(
            claseExtra
        );

    }


    boton.dataset.accion =
        accion;


    if (
        Number.isFinite(
            cantidad
        )
    ) {

        boton.dataset.cantidad =
            String(
                cantidad
            );

    }


    const elementoIcono =
        document.createElement(
            "span"
        );


    elementoIcono.setAttribute(
        "aria-hidden",
        "true"
    );


    elementoIcono.textContent =
        icono;


    const elementoTexto =
        document.createElement(
            "span"
        );


    elementoTexto.textContent =
        texto;


    boton.append(
        elementoIcono,
        elementoTexto
    );


    return boton;

}


/* ==================================================
   UTILIDADES INTERNAS
================================================== */

/**
 * Convierte cualquier valor en texto seguro.
 */
function limpiarTexto(
    valor
) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return "";

    }


    return String(
        valor
    ).trim();

}


/**
 * Asegura que los contadores siempre sean
 * números enteros positivos.
 */
function normalizarContador(
    valor
) {

    const numero =
        Number(
            valor
        );


    if (
        !Number.isFinite(
            numero
        )
    ) {

        return 0;

    }


    return Math.max(
        0,
        Math.floor(
            numero
        )
    );

}


/**
 * Obtiene hasta dos iniciales del nombre.
 */
function obtenerIniciales(
    nombre
) {

    const palabras =
        nombre
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


/**
 * Construye correctamente singular y plural.
 */
function construirTextoContador(
    cantidad,
    singular,
    plural
) {

    const palabra =
        cantidad === 1
            ? singular
            : plural;


    return `${cantidad} ${palabra}`;

}