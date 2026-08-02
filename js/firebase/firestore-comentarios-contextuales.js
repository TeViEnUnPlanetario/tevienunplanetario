// Comentarios públicos aislados de Observaciones y Ecos.

import { auth, db } from "./firebase-config.js";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getCountFromServer,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    startAfter,
    updateDoc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const LIMITE_COMENTARIOS = 25;
const LIMITE_RESPUESTAS = 3;
const LIMITE_TEXTO = 500;

function referenciaComentarios(contexto) {
    const id = String(contexto?.id || "").trim();
    if (!id) {
        throw new Error("No se recibió un hilo de comentarios válido.");
    }

    if (contexto.tipo === "presentacion") {
        return collection(db, "presentaciones", id, "comentarios");
    }

    if (contexto.tipo === "noticia") {
        return collection(db, "noticias", id, "comentarios");
    }

    if (contexto.tipo === "lanzamiento") {
        return collection(
            db,
            "configuracion",
            "proximo-lanzamiento",
            "hilos",
            id,
            "comentarios"
        );
    }

    throw new Error("El tipo de hilo de comentarios no es válido.");
}

function normalizarComentario(documento) {
    const datos = documento.data();
    const fecha = typeof datos.creadoEn?.toDate === "function"
        ? datos.creadoEn.toDate()
        : new Date();

    return {
        id: documento.id,
        texto: String(datos.texto || ""),
        autorId: String(datos.autorId || ""),
        autorNombre: String(datos.autorNombre || "Viajero"),
        autorFoto: String(datos.autorFoto || ""),
        creadoEn: fecha,
        actualizado: datos.actualizadoEn?.isEqual?.(datos.creadoEn) === false
    };
}

function referenciaComentario(contexto, comentarioId) {
    return doc(referenciaComentarios(contexto), comentarioId);
}

function referenciaRespuestas(contexto, comentarioId) {
    return collection(referenciaComentario(contexto, comentarioId), "respuestas");
}

function referenciaEstrellasComentario(contexto, comentarioId) {
    return collection(referenciaComentario(contexto, comentarioId), "estrellas");
}

async function contarComentarios(contexto) {
    const resultado = await getCountFromServer(referenciaComentarios(contexto));
    return resultado.data().count;
}

async function listarComentarios(contexto, cursor = null) {
    const restricciones = [orderBy("creadoEn", "desc")];
    if (cursor) {
        restricciones.push(startAfter(cursor));
    }
    restricciones.push(limit(LIMITE_COMENTARIOS));

    const resultado = await getDocs(query(
        referenciaComentarios(contexto),
        ...restricciones
    ));

    return {
        comentarios: resultado.docs.map(normalizarComentario),
        cursor: resultado.docs.at(-1) || null,
        hayMas: resultado.docs.length === LIMITE_COMENTARIOS
    };
}

function validarTexto(texto) {
    const valor = String(texto || "").trim();
    if (!valor || valor.length > LIMITE_TEXTO) {
        throw new Error("El comentario debe contener entre 1 y 500 caracteres.");
    }
    return valor;
}

async function obtenerPerfilActual() {
    const usuario = auth.currentUser;
    if (!usuario) {
        throw new Error("Debes iniciar sesión para comentar.");
    }

    const perfil = await getDoc(doc(db, "usuarios", usuario.uid));
    if (!perfil.exists()) {
        throw new Error("No se encontró tu perfil.");
    }

    return { usuario, datos: perfil.data() };
}

async function crearComentario(contexto, texto) {
    const { usuario, datos } = await obtenerPerfilActual();
    const referencia = await addDoc(referenciaComentarios(contexto), {
        texto: validarTexto(texto),
        autorId: usuario.uid,
        autorNombre: String(datos.nombre || "").trim(),
        autorFoto: String(datos.foto || "").trim(),
        creadoEn: serverTimestamp(),
        actualizadoEn: serverTimestamp()
    });
    return referencia.id;
}

async function editarComentario(contexto, comentarioId, texto) {
    if (!auth.currentUser) {
        throw new Error("Debes iniciar sesión para editar.");
    }
    await updateDoc(
        doc(referenciaComentarios(contexto), comentarioId),
        { texto: validarTexto(texto), actualizadoEn: serverTimestamp() }
    );
}

async function eliminarComentario(contexto, comentarioId) {
    if (!auth.currentUser) {
        throw new Error("Debes iniciar sesión para eliminar.");
    }
    await deleteDoc(doc(referenciaComentarios(contexto), comentarioId));
}

async function contarRespuestas(contexto, comentarioId) {
    const resultado = await getCountFromServer(referenciaRespuestas(contexto, comentarioId));
    return resultado.data().count;
}

async function listarRespuestas(contexto, comentarioId, cursor = null) {
    const restricciones = [orderBy("creadoEn", "desc")];
    if (cursor) restricciones.push(startAfter(cursor));
    restricciones.push(limit(LIMITE_RESPUESTAS));
    const resultado = await getDocs(query(
        referenciaRespuestas(contexto, comentarioId),
        ...restricciones
    ));
    return {
        respuestas: resultado.docs.map(normalizarComentario),
        cursor: resultado.docs.at(-1) || null
    };
}

async function crearRespuesta(contexto, comentarioId, texto) {
    const { usuario, datos } = await obtenerPerfilActual();
    return addDoc(referenciaRespuestas(contexto, comentarioId), {
        texto: validarTexto(texto),
        autorId: usuario.uid,
        autorNombre: String(datos.nombre || "").trim(),
        autorFoto: String(datos.foto || "").trim(),
        creadoEn: serverTimestamp(),
        actualizadoEn: serverTimestamp()
    });
}

async function contarEstrellasComentario(contexto, comentarioId) {
    const resultado = await getCountFromServer(
        referenciaEstrellasComentario(contexto, comentarioId)
    );
    return resultado.data().count;
}

async function tieneEstrellaComentario(contexto, comentarioId) {
    if (!auth.currentUser) return false;
    return (await getDoc(doc(
        referenciaEstrellasComentario(contexto, comentarioId),
        auth.currentUser.uid
    ))).exists();
}

async function alternarEstrellaComentario(contexto, comentarioId) {
    const usuario = auth.currentUser;
    if (!usuario) throw new Error("Debes iniciar sesión para entregar una estrella.");
    const referencia = doc(
        referenciaEstrellasComentario(contexto, comentarioId),
        usuario.uid
    );
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

export {
    LIMITE_TEXTO,
    alternarEstrellaComentario,
    contarComentarios,
    contarEstrellasComentario,
    contarRespuestas,
    crearComentario,
    crearRespuesta,
    editarComentario,
    eliminarComentario,
    listarComentarios,
    listarRespuestas,
    tieneEstrellaComentario
};
