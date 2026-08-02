// ==================================================
// FIRESTORE — ADMINISTRACIÓN DE PRESENTACIONES
// ==================================================

import {
    auth,
    db
} from "./firebase-config.js";

import {
    verificarAdministrador
} from "./firestore-administracion.js";

import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    runTransaction,
    serverTimestamp,
    Timestamp,
    updateDoc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


const COLECCION_PRESENTACIONES = "presentaciones";

const PRESENTACIONES_INICIALES = Object.freeze([
    {
        id: "cd-neza-2026-08-01",
        nombre: "CD Neza",
        fecha: "2026-08-01T19:00:00-06:00",
        descripcion: "Te Vi En Un Planetario + Siempre No",
        imagen: "img/shows/cdneza.jpg",
        imagenAlt: "Show CD Neza",
        boletos: "https://www.passline.com/eventos/te-vi-en-un-planetario-siempre-no-en-neza?srsltid=AfmBOoovg-cBBrJVDdKT2XYx2cfi4XwZiuPQGo-E9x_NDQ2LoTzgHPhY",
        visible: true
    },
    {
        id: "satelite-2026-08-07",
        nombre: "Satélite",
        fecha: "2026-08-07T20:00:00-06:00",
        descripcion: "Te Vi En Un Planetario + Siempre No",
        imagen: "img/shows/satelite.jpg",
        imagenAlt: "Show Satélite",
        boletos: "https://www.passline.com/eventos/te-vi-en-un-planetario-siempre-no-en-satelite?srsltid=AfmBOooHvju37jdHs7YVsRym1T16sg7FsZMtIziRj7XSxzrg724Acsl8",
        visible: true
    },
    {
        id: "coacalco-2026-08-08",
        nombre: "Coacalco",
        fecha: "2026-08-08T19:00:00-06:00",
        descripcion: "Te Vi En Un Planetario + Siempre No",
        imagen: "img/shows/coacalco.jpg",
        imagenAlt: "Show Coacalco",
        boletos: "https://www.passline.com/eventos/te-vi-en-un-planetario-siempre-no-en-coacalco?srsltid=AfmBOoppL9E0ZavndBEZ_2sXVVso90udEYHp2IkSH9KvHrL86hRa5LLI",
        visible: true
    }
]);


function crearError(codigo, mensaje, causa) {
    const error = new Error(mensaje, causa ? { cause: causa } : undefined);
    error.code = codigo;
    return error;
}


function limpiarTexto(valor, maximo) {
    return String(valor || "").trim().slice(0, maximo);
}


function validarUrl(valor, etiqueta, permitirRutaLocal = false) {
    const url = limpiarTexto(valor, 1000);

    if (!url) {
        return "";
    }

    if (permitirRutaLocal && /^(\.\/|\.\.\/|img\/)/i.test(url)) {
        return url;
    }

    let analizada;
    try {
        analizada = new URL(url);
    } catch {
        throw crearError(
            "presentaciones/datos-invalidos",
            `${etiqueta} debe ser una URL válida.`
        );
    }

    if (!["https:", "http:"].includes(analizada.protocol)) {
        throw crearError(
            "presentaciones/datos-invalidos",
            `${etiqueta} debe comenzar con https:// o http://.`
        );
    }

    return analizada.href;
}


function prepararPresentacion(datos = {}) {
    const nombre = limpiarTexto(datos.nombre, 100);
    const descripcion = limpiarTexto(datos.descripcion, 600);
    const imagenAlt = limpiarTexto(datos.imagenAlt, 160);
    const fecha = new Date(datos.fecha);

    if (!nombre || !descripcion || !imagenAlt) {
        throw crearError(
            "presentaciones/datos-invalidos",
            "Completa nombre, descripción y texto alternativo."
        );
    }

    if (Number.isNaN(fecha.getTime())) {
        throw crearError(
            "presentaciones/datos-invalidos",
            "Selecciona una fecha y hora válidas."
        );
    }

    return {
        nombre,
        fecha: Timestamp.fromDate(fecha),
        descripcion,
        imagen: validarUrl(datos.imagen, "La imagen", true),
        imagenAlt,
        boletos: validarUrl(datos.boletos, "El enlace de boletos"),
        imagenStorageRuta: limpiarTexto(datos.imagenStorageRuta, 500),
        visible: Boolean(datos.visible)
    };
}


function fechaFormulario(fecha) {
    const valor = typeof fecha?.toDate === "function"
        ? fecha.toDate()
        : new Date(fecha);

    if (Number.isNaN(valor.getTime())) {
        return "";
    }

    const compensacion = valor.getTimezoneOffset() * 60000;
    return new Date(valor.getTime() - compensacion)
        .toISOString()
        .slice(0, 16);
}


function normalizarDocumento(documento) {
    const datos = documento.data();
    return {
        id: documento.id,
        nombre: String(datos.nombre || ""),
        fecha: fechaFormulario(datos.fecha),
        fechaDate: typeof datos.fecha?.toDate === "function"
            ? datos.fecha.toDate()
            : new Date(datos.fecha),
        descripcion: String(datos.descripcion || ""),
        imagen: String(datos.imagen || ""),
        imagenAlt: String(datos.imagenAlt || ""),
        boletos: String(datos.boletos || ""),
        imagenStorageRuta: String(datos.imagenStorageRuta || ""),
        visible: datos.visible === true
    };
}


async function listarPresentacionesAdministracion() {
    await verificarAdministrador();

    const consulta = query(
        collection(db, COLECCION_PRESENTACIONES),
        orderBy("fecha", "asc")
    );
    const resultado = await getDocs(consulta);
    return resultado.docs.map(normalizarDocumento);
}


async function crearPresentacion(datos) {
    const usuario = auth.currentUser;
    await verificarAdministrador(usuario);
    const presentacion = prepararPresentacion(datos);

    const referencia = await addDoc(
        collection(db, COLECCION_PRESENTACIONES),
        {
            ...presentacion,
            creadoEn: serverTimestamp(),
            actualizadoEn: serverTimestamp(),
            actualizadoPor: usuario.uid
        }
    );

    return referencia.id;
}


async function importarPresentacionesIniciales() {
    const usuario = auth.currentUser;
    await verificarAdministrador(usuario);

    return runTransaction(db, async (transaccion) => {
        const referencias = PRESENTACIONES_INICIALES.map((show) => ({
            show,
            referencia: doc(db, COLECCION_PRESENTACIONES, show.id)
        }));
        const documentos = await Promise.all(
            referencias.map(({ referencia }) => transaccion.get(referencia))
        );
        let importadas = 0;

        referencias.forEach(({ show, referencia }, indice) => {
            if (documentos[indice].exists()) {
                return;
            }

            transaccion.set(referencia, {
                ...prepararPresentacion({
                    ...show,
                    imagenStorageRuta: ""
                }),
                creadoEn: serverTimestamp(),
                actualizadoEn: serverTimestamp(),
                actualizadoPor: usuario.uid
            });
            importadas += 1;
        });

        return importadas;
    });
}


async function actualizarPresentacion(id, datos) {
    const usuario = auth.currentUser;
    await verificarAdministrador(usuario);

    if (!id) {
        throw crearError(
            "presentaciones/id-invalido",
            "No se recibió una presentación válida."
        );
    }

    await updateDoc(
        doc(db, COLECCION_PRESENTACIONES, id),
        {
            ...prepararPresentacion(datos),
            actualizadoEn: serverTimestamp(),
            actualizadoPor: usuario.uid
        }
    );
}


async function cambiarVisibilidadPresentacion(id, visible) {
    const usuario = auth.currentUser;
    await verificarAdministrador(usuario);

    await updateDoc(
        doc(db, COLECCION_PRESENTACIONES, id),
        {
            visible: Boolean(visible),
            actualizadoEn: serverTimestamp(),
            actualizadoPor: usuario.uid
        }
    );
}


async function eliminarPresentacion(id) {
    await verificarAdministrador();

    if (!id) {
        throw crearError(
            "presentaciones/id-invalido",
            "No se recibió una presentación válida."
        );
    }

    await deleteDoc(doc(db, COLECCION_PRESENTACIONES, id));
}


export {
    actualizarPresentacion,
    cambiarVisibilidadPresentacion,
    crearPresentacion,
    eliminarPresentacion,
    importarPresentacionesIniciales,
    listarPresentacionesAdministracion
};
