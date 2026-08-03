// ==================================================
// PROYECTO OBSERVATORIO
// TE VI EN UN PLANETARIO
//
// Módulo:
// Firestore — Estrellas
//
// Responsabilidad:
// Agregar, retirar y escuchar las Estrellas
// otorgadas por los usuarios.
// ==================================================

import {
    auth,
    db
} from "./firebase-config.js";

import { crearNotificacion, obtenerPerfilUsuario, registrarActividad } from "./firestore.js";



import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";


import {
    collection,
    collectionGroup,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    runTransaction,
    serverTimestamp,
    setDoc,
    where
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


const COLECCION_OBSERVACIONES =
    "observaciones";


const SUBCOLECCION_ESTRELLAS =
    "estrellas";


/**
 * Agrega o retira la Estrella del usuario actual.
 *
 * @param {string} observacionId
 * @returns {Promise<{
 *     activa: boolean,
 *     total: number
 * }>}
 */
export async function alternarEstrella(
    observacionId
) {

    const usuario =
        auth.currentUser;


    if (!usuario) {

        throw new Error(
            "Debes iniciar sesión para dar una Estrella."
        );

    }


    const id =
        String(
            observacionId || ""
        ).trim();


    if (!id) {

        throw new Error(
            "No se recibió la Observación."
        );

    }


    const referenciaObservacion =
        doc(
            db,
            COLECCION_OBSERVACIONES,
            id
        );


    /*
     * El UID se utiliza como identificador.
     * Así cada usuario solamente puede tener
     * una Estrella por Observación.
     */

    const referenciaEstrella =
        doc(
            db,
            COLECCION_OBSERVACIONES,
            id,
            SUBCOLECCION_ESTRELLAS,
            usuario.uid
        );


    const resultado = await runTransaction(

        db,

        async function (
            transaccion
        ) {

            const [
                snapshotObservacion,
                snapshotEstrella
            ] =
                await Promise.all([

                    transaccion.get(
                        referenciaObservacion
                    ),

                    transaccion.get(
                        referenciaEstrella
                    )

                ]);


            if (
                !snapshotObservacion.exists()
            ) {

                throw new Error(
                    "La Observación ya no existe."
                );

            }


            const datosObservacion =
                snapshotObservacion.data();


            const totalActual =
                normalizarContador(
                    datosObservacion.estrellas
                );


            /*
             * Si ya existe el documento del usuario,
             * significa que retirará su Estrella.
             */

            if (
                snapshotEstrella.exists()
            ) {

                const nuevoTotal =
                    Math.max(
                        0,
                        totalActual - 1
                    );


                transaccion.delete(
                    referenciaEstrella
                );


                transaccion.update(
                    referenciaObservacion,
                    {
                        estrellas:
                            nuevoTotal,

                        actualizadaEn:
                            serverTimestamp()
                    }
                );


                return {
                    activa:
                        false,

                    total:
                        nuevoTotal
                };

            }


            /*
             * Si no existe, creamos la Estrella.
             */

            const nuevoTotal =
                totalActual + 1;


            transaccion.set(
                referenciaEstrella,
                {
                    usuarioId:
                        usuario.uid,

                    creadaEn:
                        serverTimestamp()
                }
            );


            transaccion.update(
                referenciaObservacion,
                {
                    estrellas:
                        nuevoTotal,

                    actualizadaEn:
                        serverTimestamp()
                }
            );


            return {
                activa:
                    true,

                total:
                    nuevoTotal
            };

        }

    );

    await registrarActividad(usuario.uid, "favoritos", resultado.activa ? 1 : -1);

    if (resultado.activa) {
        const [observacion, actor] = await Promise.all([
            getDoc(referenciaObservacion),
            obtenerPerfilUsuario(usuario.uid)
        ]);
        await crearNotificacion(observacion.data()?.autorId, {
            tipo: "estrella",
            actorId: usuario.uid,
            actorNombre: actor?.nombre || usuario.displayName || "Un viajero",
            observacionId: id,
            mensaje: "dejó una estrella en tu observación"
        }).catch(console.error);
    }

    return resultado;

}


export async function obtenerUltimosEcos(
    observacionId,
    cantidad = 3
) {

    const id =
        String(
            observacionId ?? ""
        ).trim();


    if (!id) {

        return [];

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
                "desc"
            ),

            limit(
                Math.max(
                    1,
                    Math.min(
                        3,
                        Number(cantidad) || 3
                    )
                )
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
 * Escucha todas las Estrellas entregadas
 * por el usuario autenticado.
 *
 * Devuelve un Set con los identificadores
 * de las Observaciones marcadas.
 *
 * @param {Function} alRecibir
 * @param {Function} alError
 * @returns {Function}
 */
export function escucharEstrellasUsuario(
    alRecibir,
    alError = console.error
) {

    let dejarDeEscucharEstrellas =
        null;


    const dejarDeEscucharAuth =
        onAuthStateChanged(

            auth,

            function (
                usuario
            ) {

                if (
                    dejarDeEscucharEstrellas
                ) {

                    dejarDeEscucharEstrellas();

                    dejarDeEscucharEstrellas =
                        null;

                }


                if (!usuario) {

                    alRecibir(
                        new Set()
                    );

                    return;

                }


                const consulta =
                    query(

                        collectionGroup(
                            db,
                            SUBCOLECCION_ESTRELLAS
                        ),

                        where(
                            "usuarioId",
                            "==",
                            usuario.uid
                        )

                    );


                dejarDeEscucharEstrellas =
                    onSnapshot(

                        consulta,

                        function (
                            snapshot
                        ) {

                            const idsObservaciones =
                                new Set();


                            snapshot.docs.forEach(

                                function (
                                    documento
                                ) {

                                    /*
                                     * Estructura:
                                     *
                                     * observaciones
                                     *   /observacionId
                                     *     /estrellas
                                     *       /usuarioId
                                     */

                                    const referenciaObservacion =
                                        documento
                                            .ref
                                            .parent
                                            .parent;


                                    if (
                                        referenciaObservacion
                                    ) {

                                        idsObservaciones.add(
                                            referenciaObservacion.id
                                        );

                                    }

                                }

                            );


                            alRecibir(
                                idsObservaciones
                            );

                        },

                        alError

                    );

            }

        );


    return function detenerEscucha() {

        dejarDeEscucharAuth();


        if (
            dejarDeEscucharEstrellas
        ) {

            dejarDeEscucharEstrellas();

        }

    };

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
