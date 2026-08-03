// ==================================================
// PROYECTO OBSERVATORIO
// TE VI EN UN PLANETARIO
//
// Módulo:
// Firestore — Ecos
//
// Responsabilidad:
// Guardar, escuchar y eliminar respuestas
// asociadas a una Observación.
// ==================================================

import {
    auth,
    db
} from "./firebase-config.js";

import { crearNotificacion, registrarActividad } from "./firestore.js";


import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    increment,
    limit,
    onSnapshot,
    orderBy,
    query,
    runTransaction,
    serverTimestamp,
    updateDoc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


const COLECCION_OBSERVACIONES =
    "observaciones";


const SUBCOLECCION_ECOS =
    "ecos";


const LIMITE_ECOS =
    100;


const LIMITE_CARACTERES =
    500;


/**
 * Publica un Eco dentro de una Observación.
 *
 * @param {string} observacionId
 * @param {Object} datos
 * @returns {Promise<string>}
 */
export async function guardarEco(
    observacionId,
    datos = {}
) {

    const usuario =
        auth.currentUser;


    if (!usuario) {

        throw new Error(
            "Debes iniciar sesión para enviar un Eco."
        );

    }


    const id =
        normalizarTexto(
            observacionId
        );


    const texto =
        normalizarTexto(
            datos.texto
        );


    if (!id) {

        throw new Error(
            "No se recibió la Observación."
        );

    }


    if (!texto) {

        throw new Error(
            "El Eco no puede estar vacío."
        );

    }


    if (
        texto.length >
        LIMITE_CARACTERES
    ) {

        throw new Error(
            `El Eco no puede superar los ${LIMITE_CARACTERES} caracteres.`
        );

    }


    const referenciaObservacion =
        doc(
            db,
            COLECCION_OBSERVACIONES,
            id
        );


    const referenciaEco =
        doc(
            collection(
                db,
                COLECCION_OBSERVACIONES,
                id,
                SUBCOLECCION_ECOS
            )
        );


    let datosPublicacion = null;

    await runTransaction(

        db,

        async function (
            transaccion
        ) {

            const snapshotObservacion =
                await transaccion.get(
                    referenciaObservacion
                );


            if (
                !snapshotObservacion.exists()
            ) {

                throw new Error(
                    "La Observación ya no existe."
                );

            }


            const datosObservacion =
                snapshotObservacion.data();

            datosPublicacion = datosObservacion;


            const ecosActuales =
                normalizarContador(
                    datosObservacion.ecos
                );


            const autorNombre =
                normalizarTexto(
                    datos.autorNombre ||
                    usuario.displayName ||
                    usuario.email
                        ?.split("@")[0] ||
                    "Viajero"
                );


            const autorRango =
                normalizarTexto(
                    datos.autorRango ||
                    "🌠 Viajero"
                );


            const autorAvatar =
                normalizarTexto(
                    datos.autorAvatar ||
                    obtenerIniciales(
                        autorNombre
                    )
                );


            transaccion.set(
                referenciaEco,
                {
                    autorId:
                        usuario.uid,

                    autorNombre:
                        autorNombre,

                    autorRango:
                        autorRango,

                    autorAvatar:
                        autorAvatar,

                    texto:
                        texto,

                    oficial:
                        Boolean(
                            datos.oficial
                        ),

                    verificado:
                        Boolean(
                            datos.verificado ||
                            datos.oficial
                        ),

                    creadoEn:
                        serverTimestamp(),

                    actualizadoEn:
                        serverTimestamp(),

                    editado:
                        false
                }
            );


            transaccion.update(
                referenciaObservacion,
                {
                    ecos:
                        ecosActuales + 1,

                    actualizadaEn:
                        serverTimestamp()
                }
            );

        }

    );

    await registrarActividad(usuario.uid, "comentarios", 1);
    await crearNotificacion(datosPublicacion?.autorId, {
        tipo: "eco",
        actorId: usuario.uid,
        actorNombre: normalizarTexto(datos.autorNombre || usuario.displayName || usuario.email?.split("@")[0] || "Un viajero"),
        observacionId: id,
        mensaje: "respondió con un eco a tu observación"
    }).catch(console.error);


    return referenciaEco.id;

}


/**
 * Escucha en tiempo real los Ecos
 * de una Observación.
 *
 * @param {string} observacionId
 * @param {Function} alRecibir
 * @param {Function} alError
 * @returns {Function}
 */
export function escucharEcos(
    observacionId,
    alRecibir,
    alError = console.error
) {

    const id =
        normalizarTexto(
            observacionId
        );


    if (!id) {

        throw new Error(
            "No se recibió la Observación."
        );

    }


    if (
        typeof alRecibir !==
        "function"
    ) {

        throw new TypeError(
            "escucharEcos necesita una función de respuesta."
        );

    }


    const consulta =
        query(

            collection(
                db,
                COLECCION_OBSERVACIONES,
                id,
                SUBCOLECCION_ECOS
            ),

            orderBy(
                "creadoEn",
                "asc"
            ),

            limit(
                LIMITE_ECOS
            )

        );


    return onSnapshot(

        consulta,

        function (
            snapshot
        ) {

            const ecos =
                snapshot.docs.map(

                    function (
                        documento
                    ) {

                        return transformarEco(
                            documento
                        );

                    }

                );


            alRecibir(
                ecos
            );

        },

        alError

    );

}

/**
 * Obtiene los Ecos más recientes de una Observación.
 *
 * Esta función realiza una lectura única.
 * No mantiene un listener abierto.
 *
 * @param {string} observacionId
 * @param {number} cantidad
 * @returns {Promise<Array<Object>>}
 */
export async function obtenerUltimosEcos(
    observacionId,
    cantidad = 3
) {

    const id =
        normalizarTexto(
            observacionId
        );


    if (!id) {

        return [];

    }


    const limiteSolicitado =
        Number(
            cantidad
        );


    const limiteSeguro =
        Number.isFinite(
            limiteSolicitado
        )
            ? Math.max(
                1,
                Math.min(
                    3,
                    Math.trunc(
                        limiteSolicitado
                    )
                )
            )
            : 3;


    const consulta =
        query(

            collection(
                db,
                COLECCION_OBSERVACIONES,
                id,
                SUBCOLECCION_ECOS
            ),

            orderBy(
                "creadoEn",
                "desc"
            ),

            limit(
                limiteSeguro
            )

        );


    const snapshot =
        await getDocs(
            consulta
        );


    return snapshot.docs.map(
        function (
            documento
        ) {

            return transformarEco(
                documento
            );

        }
    );

}

/**
 * Elimina un Eco propio y reduce
 * el contador de la Observación.
 *
 * @param {string} observacionId
 * @param {string} ecoId
 */
export async function eliminarEco(
    observacionId,
    ecoId
) {

    const usuario =
        auth.currentUser;


    if (!usuario) {

        throw new Error(
            "Debes iniciar sesión para eliminar un Eco."
        );

    }


    const idObservacion =
        normalizarTexto(
            observacionId
        );


    const idEco =
        normalizarTexto(
            ecoId
        );


    if (
        !idObservacion ||
        !idEco
    ) {

        throw new Error(
            "No se recibió el Eco."
        );

    }


    const referenciaObservacion =
        doc(
            db,
            COLECCION_OBSERVACIONES,
            idObservacion
        );


    const referenciaEco =
        doc(
            db,
            COLECCION_OBSERVACIONES,
            idObservacion,
            SUBCOLECCION_ECOS,
            idEco
        );


    await runTransaction(

        db,

        async function (
            transaccion
        ) {

       const snapshotObservacion =
    await transaccion.get(
        referenciaObservacion
    );


const snapshotEco =
    await transaccion.get(
        referenciaEco
    );


            if (
                !snapshotEco.exists()
            ) {

                throw new Error(
                    "El Eco ya no existe."
                );

            }


            const datosEco =
                snapshotEco.data();


            if (
                datosEco.autorId !==
                usuario.uid
            ) {

                throw new Error(
                    "No puedes eliminar el Eco de otro viajero."
                );

            }


            const totalActual =
                snapshotObservacion.exists()
                    ? normalizarContador(
                        snapshotObservacion
                            .data()
                            .ecos
                    )
                    : 0;


            transaccion.delete(
                referenciaEco
            );


            if (
                snapshotObservacion.exists()
            ) {

                transaccion.update(
                    referenciaObservacion,
                    {
                        ecos:
                            Math.max(
                                0,
                                totalActual - 1
                            ),

                        actualizadaEn:
                            serverTimestamp()
                    }
                );

            }

        }

    );

    await registrarActividad(usuario.uid, "comentarios", -1);

}

export async function ocultarEco(observacionId, ecoId, oculta) {
    if (!auth.currentUser) throw new Error("Debes iniciar sesión para moderar.");
    await updateDoc(doc(db, COLECCION_OBSERVACIONES, observacionId, SUBCOLECCION_ECOS, ecoId), {
        oculta: Boolean(oculta), moderadaPor: auth.currentUser.uid, actualizadoEn: serverTimestamp()
    });
}

export async function eliminarEcoModeracion(observacionId, ecoId) {
    if (!auth.currentUser) throw new Error("Debes iniciar sesión para moderar.");
    const ecoRef = doc(db, COLECCION_OBSERVACIONES, observacionId, SUBCOLECCION_ECOS, ecoId);
    const eco = await getDoc(ecoRef);
    await deleteDoc(ecoRef);
    await updateDoc(doc(db, COLECCION_OBSERVACIONES, observacionId), {
        ecos: increment(-1), actualizadaEn: serverTimestamp()
    }).catch(() => {});
    await registrarActividad(eco.data()?.autorId, "comentarios", -1);
}


/* ==================================================
   TRANSFORMACIÓN
================================================== */

function transformarEco(
    documento
) {

    const datos =
        documento.data();


    const creadoEn =
        convertirFecha(
            datos.creadoEn
        );


    return {

        id:
            documento.id,

        autorId:
            normalizarTexto(
                datos.autorId
            ),

        autorNombre:
            normalizarTexto(
                datos.autorNombre ||
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
                    "Viajero"
                )
            ),

        texto:
            normalizarTexto(
                datos.texto
            ),

        oficial:
            Boolean(
                datos.oficial
            ),

        verificado:
            Boolean(
                datos.verificado ||
                datos.oficial
            ),

        fechaISO:
            creadoEn.toISOString(),

        fechaTexto:
            construirFechaRelativa(
                creadoEn
            ),

        editado:
            Boolean(
                datos.editado
            ),

        oculta: Boolean(datos.oculta)

    };

}


/* ==================================================
   UTILIDADES
================================================== */

function normalizarTexto(
    valor
) {

    return String(
        valor ?? ""
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
        Math.trunc(
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
            .filter(Boolean)
            .slice(0, 2);


    const iniciales =
        palabras
            .map(
                function (
                    palabra
                ) {

                    return palabra
                        .charAt(0)
                        .toUpperCase();

                }
            )
            .join("");


    return iniciales ||
        "V";

}


function convertirFecha(
    valor
) {

    if (
        valor &&
        typeof valor.toDate ===
        "function"
    ) {

        return valor.toDate();

    }


    if (
        valor instanceof Date &&
        !Number.isNaN(
            valor.getTime()
        )
    ) {

        return valor;

    }


    return new Date();

}


function construirFechaRelativa(
    fecha
) {

    const diferencia =
        Date.now() -
        fecha.getTime();


    const segundos =
        Math.max(
            0,
            Math.floor(
                diferencia / 1000
            )
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


    return dias === 1
        ? "Hace 1 día"
        : `Hace ${dias} días`;

}
