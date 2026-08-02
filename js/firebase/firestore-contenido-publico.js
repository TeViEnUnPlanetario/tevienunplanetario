// Lectura pública de Galería y Música con respaldo local en caso de error.

import { db } from "./firebase-config.js";
import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const COLECCIONES_PUBLICAS = new Set(["galeria", "musica", "noticias"]);

async function leerContenidoPublico(nombreColeccion) {
    if (!COLECCIONES_PUBLICAS.has(nombreColeccion)) {
        throw new Error("Colección pública no permitida.");
    }

    try {
        const consulta = query(
            collection(db, nombreColeccion),
            where("visible", "==", true)
        );
        const resultado = await getDocs(consulta);
        const elementos = resultado.docs.map((documento) => ({
            id: documento.id,
            ...documento.data()
        }));

        elementos.sort((a, b) => Number(a.orden || 0) - Number(b.orden || 0));

        return { estado: "firestore", elementos };
    } catch (error) {
        console.warn(`No se pudo cargar ${nombreColeccion}; se conservará el respaldo local.`, error);
        return { estado: "respaldo", elementos: [] };
    }
}

export { leerContenidoPublico };
