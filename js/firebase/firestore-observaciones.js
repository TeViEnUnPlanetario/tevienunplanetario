// ==================================================
// PROYECTO OBSERVATORIO
// TE VI EN UN PLANETARIO
//
// Módulo:
// Firestore — Observaciones
//
// Responsabilidad:
// Guardar, escuchar, actualizar y eliminar
// Observaciones en Cloud Firestore.
//
// Versión:
// v0.4
//
// Autor:
// Eduardo Campos
//
// Arquitectura:
// Data Service
// ==================================================


import {
    auth,
    db
} from "./firebase-config.js";


import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


/* ==================================================
   CONFIGURACIÓN
================================================== */

const COLECCION_OBSERVACIONES =
    "observaciones";


const LIMITE_OBSERVACIONES =
    50;


const LIMITE_CARACTERES =
    800;


/* ==================================================
   GUARDAR OBSERVACIÓN
================================================== */

/**
 * Guarda una nueva Observación en Firestore.
 *
 * @param {Object} datos
 * @returns {Promise<string>}
 */
export async function guardarObservacion(
    datos = {}
) {

    const usuario =
        auth.currentUser;


    if (!usuario) {

        throw new Error(
            "Debes iniciar sesión para publicar una Observación."
        );

    }


    const texto =
        normalizarTexto(
            datos.texto
        );


    if (!texto) {

        throw new Error(
            "La Observación no puede estar vacía."
        );

    }


    if (
        texto.length >
        LIMITE_CARACTERES
    ) {

        throw new Error(
            `La Observación no puede superar los ${LIMITE_CARACTERES} caracteres.`
        );

    }


    /*
     * Las imágenes en formato Base64 no deben guardarse
     * directamente dentro del documento.
     *
     * Más adelante se subirán a Firebase Storage y aquí
     * solamente se guardará su URL.
     */

    if (
        datos.imagen &&
        String(
            datos.imagen
        ).startsWith(
            "data:"
        )
    ) {

        throw new Error(
            "La imagen todavía no puede guardarse permanentemente. Publica la Observación sin imagen por ahora."
        );

    }


    const observacion = {

        autorId:
            usuario.uid,

        autorNombre:
            normalizarTexto(
                datos.autorNombre ||
                usuario.displayName ||
                "Viajero"
            ),

        autorRango:
            normalizarTexto(
                datos.autorRango ||
                "🌠 Viajero"
            ),

        autorAvatar:
            normalizarTexto(
                datos.autorAvatar ||
                obtenerIniciales(
                    datos.autorNombre ||
                    usuario.displayName ||
                    "Viajero"
                )
            ),

        texto:
            texto,

        imagen:
            normalizarTexto(
                datos.imagen
            ),

        estrellas:
            0,

        ecos:
            0,

        oficial:
            Boolean(
                datos.oficial
            ),

        verificado:
            Boolean(
                datos.verificado
            ),

        editada:
            false,

        creadaEn:
            serverTimestamp(),

        actualizadaEn:
            serverTimestamp()

    };


    const referencia =
        await addDoc(
            collection(
                db,
                COLECCION_OBSERVACIONES
            ),
            observacion
        );


    return referencia.id;

}


/* ==================================================
   ESCUCHAR OBSERVACIONES
================================================== */

/**
 * Escucha en tiempo real las Observaciones,
 * ordenadas de la más reciente a la más antigua.
 *
 * @param {Function} alRecibir
 * @param {Function} alError
 * @returns {Function}
 */
export function escucharObservaciones(
    alRecibir,
    alError = manejarErrorPredeterminado
) {

    if (
        typeof alRecibir !==
        "function"
    ) {

        throw new TypeError(
            "escucharObservaciones necesita una función de respuesta."
        );

    }


    const consulta =
        query(

            collection(
                db,
                COLECCION_OBSERVACIONES
            ),

            orderBy(
                "creadaEn",
                "desc"
            ),

            limit(
                LIMITE_OBSERVACIONES
            )

        );


    const dejarDeEscuchar =
        onSnapshot(

            consulta,

            function (
                snapshot
            ) {

                const observaciones =
                    snapshot.docs.map(
                        function (
                            documento
                        ) {

                            return transformarDocumento(
                                documento
                            );

                        }
                    );


                alRecibir(
                    observaciones
                );

            },

            function (
                error
            ) {

                alError(
                    error
                );

            }

        );


    return dejarDeEscuchar;

}


/* ==================================================
   ACTUALIZAR OBSERVACIÓN
================================================== */

/**
 * Actualiza el texto de una Observación.
 *
 * @param {string} observacionId
 * @param {string} nuevoTexto
 */
export async function actualizarObservacion(
    observacionId,
    nuevoTexto
) {

    const usuario =
        auth.currentUser;


    if (!usuario) {

        throw new Error(
            "Debes iniciar sesión para editar una Observación."
        );

    }


    const id =
        normalizarTexto(
            observacionId
        );


    const texto =
        normalizarTexto(
            nuevoTexto
        );


    if (!id) {

        throw new Error(
            "No se recibió el identificador de la Observación."
        );

    }


    if (!texto) {

        throw new Error(
            "La Observación no puede quedar vacía."
        );

    }


    if (
        texto.length >
        LIMITE_CARACTERES
    ) {

        throw new Error(
            `La Observación no puede superar los ${LIMITE_CARACTERES} caracteres.`
        );

    }


    const referencia =
        doc(
            db,
            COLECCION_OBSERVACIONES,
            id
        );


    await updateDoc(
        referencia,
        {

            texto:
                texto,

            editada:
                true,

            actualizadaEn:
                serverTimestamp()

        }
    );

}


/* ==================================================
   ELIMINAR OBSERVACIÓN
================================================== */

/**
 * Elimina una Observación de Firestore.
 *
 * La autorización definitiva debe comprobarse
 * también mediante las reglas de seguridad.
 *
 * @param {string} observacionId
 */
export async function eliminarObservacion(
    observacionId
) {

    const usuario =
        auth.currentUser;


    if (!usuario) {

        throw new Error(
            "Debes iniciar sesión para eliminar una Observación."
        );

    }


    const id =
        normalizarTexto(
            observacionId
        );


    if (!id) {

        throw new Error(
            "No se recibió el identificador de la Observación."
        );

    }


    await deleteDoc(

        doc(
            db,
            COLECCION_OBSERVACIONES,
            id
        )

    );

}


/* ==================================================
   TRANSFORMACIÓN DE DOCUMENTOS
================================================== */

/**
 * Convierte un documento de Firestore al formato
 * que entiende card-observacion.js.
 */
function transformarDocumento(
    documento
) {

    const datos =
        documento.data();


    const fecha =
        convertirTimestampAFecha(
            datos.creadaEn
        );


    return {

        id:
            documento.id,

        autorId:
            datos.autorId || "",

        autorNombre:
            datos.autorNombre ||
            "Viajero desconocido",

        autorRango:
            datos.autorRango ||
            "🌠 Viajero",

        autorAvatar:
            datos.autorAvatar ||
            obtenerIniciales(
                datos.autorNombre ||
                "Viajero"
            ),

        texto:
            datos.texto || "",

        fechaTexto:
            obtenerTiempoRelativo(
                fecha
            ),

        fechaISO:
            fecha.toISOString(),

        estrellas:
            normalizarContador(
                datos.estrellas
            ),

        ecos:
            normalizarContador(
                datos.ecos
            ),

        oficial:
            Boolean(
                datos.oficial
            ),

        verificado:
            Boolean(
                datos.verificado
            ),

        imagen:
            datos.imagen || "",

        editada:
            Boolean(
                datos.editada
            )

    };

}


/* ==================================================
   FECHAS
================================================== */

function convertirTimestampAFecha(
    timestamp
) {

    if (
        timestamp &&
        typeof timestamp.toDate ===
        "function"
    ) {

        return timestamp.toDate();

    }


    /*
     * serverTimestamp puede aparecer temporalmente
     * como null mientras Firestore confirma la escritura.
     */

    return new Date();

}


function obtenerTiempoRelativo(
    fecha
) {

    const ahora =
        Date.now();


    const diferencia =
        Math.max(
            0,
            ahora -
            fecha.getTime()
        );


    const segundos =
        Math.floor(
            diferencia / 1000
        );


    if (
        segundos <
        60
    ) {

        return "Hace unos segundos";

    }


    const minutos =
        Math.floor(
            segundos / 60
        );


    if (
        minutos <
        60
    ) {

        return minutos === 1
            ? "Hace 1 minuto"
            : `Hace ${minutos} minutos`;

    }


    const horas =
        Math.floor(
            minutos / 60
        );


    if (
        horas <
        24
    ) {

        return horas === 1
            ? "Hace 1 hora"
            : `Hace ${horas} horas`;

    }


    const dias =
        Math.floor(
            horas / 24
        );


    if (
        dias <
        7
    ) {

        return dias === 1
            ? "Hace 1 día"
            : `Hace ${dias} días`;

    }


    return fecha.toLocaleDateString(
        "es-MX",
        {

            day:
                "numeric",

            month:
                "short",

            year:
                "numeric"

        }
    );

}


/* ==================================================
   UTILIDADES
================================================== */

function normalizarTexto(
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


function obtenerIniciales(
    nombre
) {

    const palabras =
        normalizarTexto(
            nombre
        )
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


function manejarErrorPredeterminado(
    error
) {

    console.error(
        "Error al escuchar las Observaciones:",
        error
    );

}