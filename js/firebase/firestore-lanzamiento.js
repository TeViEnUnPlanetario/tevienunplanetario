// ==================================================
// FIRESTORE — LECTURA PÚBLICA DEL PRÓXIMO LANZAMIENTO
// ==================================================

import { db } from "./firebase-config.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


const REFERENCIA_LANZAMIENTO =
    doc(db, "configuracion", "proximo-lanzamiento");

const HILO_LANZAMIENTO_INICIAL = "proximo-lanzamiento-inicial";


function esPermisoDenegado(error) {
    const codigo = String(error?.code || "").toLowerCase();
    return codigo === "permission-denied"
        || codigo === "firestore/permission-denied";
}


async function leerProximoLanzamientoPublico() {
    try {
        const documento = await getDoc(REFERENCIA_LANZAMIENTO);

        if (!documento.exists()) return { estado: "oculto", datos: null };

        const datos = documento.data();

        if (datos.visible !== true) {
            return { estado: "oculto", datos: null };
        }

        return {
            estado: "publicado",
            datos: {
                ...datos,
                hiloComentariosId: String(
                    datos.hiloComentariosId || HILO_LANZAMIENTO_INICIAL
                )
            }
        };
    } catch (error) {
        if (esPermisoDenegado(error)) {
            return { estado: "oculto", datos: null };
        }

        console.warn(
            "No se pudo consultar el próximo lanzamiento. Se conservará el respaldo local.",
            error
        );

        return { estado: "respaldo", datos: null };
    }
}


export {
    HILO_LANZAMIENTO_INICIAL,
    leerProximoLanzamientoPublico
};
