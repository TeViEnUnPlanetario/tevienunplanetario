import { auth, db } from "./firebase-config.js";
import {
    collection,
    deleteDoc,
    doc,
    getCountFromServer,
    getDoc,
    serverTimestamp,
    setDoc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

function referenciaEstrellas(contexto) {
    const id = String(contexto?.id || "").trim();
    if (!id) throw new Error("No se recibió un contenido válido.");

    if (contexto.tipo === "presentacion") {
        return collection(db, "presentaciones", id, "estrellas");
    }
    if (contexto.tipo === "noticia") {
        return collection(db, "noticias", id, "estrellas");
    }
    if (contexto.tipo === "lanzamiento") {
        return collection(db, "configuracion", "proximo-lanzamiento", "hilos", id, "estrellas");
    }
    throw new Error("El tipo de contenido no admite estrellas.");
}

async function contarEstrellas(contexto) {
    const resultado = await getCountFromServer(referenciaEstrellas(contexto));
    return resultado.data().count;
}

async function tieneEstrellaActual(contexto) {
    const usuario = auth.currentUser;
    if (!usuario) return false;
    return (await getDoc(doc(referenciaEstrellas(contexto), usuario.uid))).exists();
}

async function alternarEstrella(contexto) {
    const usuario = auth.currentUser;
    if (!usuario) throw new Error("Debes iniciar sesión para entregar una estrella.");

    const referencia = doc(referenciaEstrellas(contexto), usuario.uid);
    const actual = await getDoc(referencia);
    if (actual.exists()) {
        await deleteDoc(referencia);
        return false;
    }

    await setDoc(referencia, {
        autorId: usuario.uid,
        creadoEn: serverTimestamp()
    });
    return true;
}

export { alternarEstrella, contarEstrellas, tieneEstrellaActual };
