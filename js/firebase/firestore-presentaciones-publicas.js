// ==================================================
// FIRESTORE — LECTURA PÚBLICA DE PRESENTACIONES
// ==================================================

import {
    db
} from "./firebase-config.js";

import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


async function leerPresentacionesPublicas() {
    try {
        const consulta = query(
            collection(db, "presentaciones"),
            where("visible", "==", true)
        );
        const resultado = await getDocs(consulta);
        const presentaciones = resultado.docs.map((documento) => {
            const datos = documento.data();
            const fecha = typeof datos.fecha?.toDate === "function"
                ? datos.fecha.toDate()
                : new Date(datos.fecha);

            return {
                id: documento.id,
                nombre: String(datos.nombre || ""),
                fecha,
                descripcion: String(datos.descripcion || ""),
                imagen: String(datos.imagen || ""),
                imagenAlt: String(datos.imagenAlt || ""),
                boletos: String(datos.boletos || "")
            };
        });

        presentaciones.sort((a, b) => a.fecha - b.fecha);

        return {
            estado: "firestore",
            presentaciones
        };
    } catch (error) {
        console.warn(
            "No se pudieron consultar las presentaciones. Se conservará el respaldo local.",
            error
        );

        return {
            estado: "respaldo",
            presentaciones: []
        };
    }
}


export {
    leerPresentacionesPublicas
};
