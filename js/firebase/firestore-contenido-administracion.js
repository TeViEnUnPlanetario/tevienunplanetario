// CRUD administrativo compartido por Galería y Música.

import { auth, db } from "./firebase-config.js";
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    serverTimestamp,
    setDoc,
    updateDoc,
    writeBatch
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const COLECCIONES = new Set(["galeria", "musica", "noticias"]);

function validarColeccion(nombre) {
    if (!COLECCIONES.has(nombre)) {
        throw new Error("Colección administrativa no permitida.");
    }
}

function exigirSesion() {
    if (!auth.currentUser) {
        const error = new Error("La sesión administrativa no está activa.");
        error.code = "administracion/sin-sesion";
        throw error;
    }
    return auth.currentUser;
}

async function listarContenido(nombreColeccion) {
    validarColeccion(nombreColeccion);
    exigirSesion();
    const resultado = await getDocs(collection(db, nombreColeccion));
    const elementos = resultado.docs.map((documento) => ({
        id: documento.id,
        ...documento.data()
    }));
    elementos.sort((a, b) => Number(a.orden || 0) - Number(b.orden || 0));
    return elementos;
}

async function guardarContenido(nombreColeccion, id, datos) {
    validarColeccion(nombreColeccion);
    const usuario = exigirSesion();
    const referencia = id
        ? doc(db, nombreColeccion, id)
        : doc(collection(db, nombreColeccion));
    const anterior = await getDoc(referencia);
    const creadoEn = anterior.exists()
        ? anterior.data().creadoEn
        : serverTimestamp();

    await setDoc(referencia, {
        ...datos,
        creadoEn,
        actualizadoEn: serverTimestamp(),
        actualizadoPor: usuario.uid
    });

    return referencia.id;
}

async function cambiarVisibilidadContenido(nombreColeccion, id, visible) {
    validarColeccion(nombreColeccion);
    const usuario = exigirSesion();
    await updateDoc(doc(db, nombreColeccion, id), {
        visible: Boolean(visible),
        actualizadoEn: serverTimestamp(),
        actualizadoPor: usuario.uid
    });
}

async function eliminarContenido(nombreColeccion, id) {
    validarColeccion(nombreColeccion);
    exigirSesion();
    await deleteDoc(doc(db, nombreColeccion, id));
}

async function importarContenidoInicial(nombreColeccion, elementos) {
    validarColeccion(nombreColeccion);
    const usuario = exigirSesion();
    const existentes = await getDocs(collection(db, nombreColeccion));
    if (!existentes.empty) {
        return false;
    }

    const lote = writeBatch(db);
    elementos.forEach((elemento) => {
        const { id, ...datos } = elemento;
        lote.set(doc(db, nombreColeccion, id), {
            ...datos,
            creadoEn: serverTimestamp(),
            actualizadoEn: serverTimestamp(),
            actualizadoPor: usuario.uid
        });
    });
    await lote.commit();
    return true;
}

export {
    cambiarVisibilidadContenido,
    eliminarContenido,
    guardarContenido,
    importarContenidoInicial,
    listarContenido
};
