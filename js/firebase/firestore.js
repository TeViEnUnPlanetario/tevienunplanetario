// =========================================
// FIRESTORE — PERFILES DE USUARIO
// Te Vi En Un Planetario
// =========================================

import {
    db
} from "./firebase-config.js";

import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


// =========================================
// CREAR PERFIL DE NUEVO VIAJERO
// =========================================

async function crearPerfilUsuario(
    usuario,
    nombre
) {

    if (!usuario) {

        throw new Error(
            "No se recibió un usuario válido."
        );

    }

    const referenciaUsuario =
        doc(
            db,
            "usuarios",
            usuario.uid
        );

    const datosUsuario = {

        nombre:
            nombre.trim(),

        correo:
            usuario.email || "",

        rango:
            "Viajero",

        fechaRegistro:
            serverTimestamp(),

        biografia:
            "",

        foto:
            "",

        publicaciones:
            0,

        comentarios:
            0,

        verificado:
            false,

        rol:
            "usuario"

    };

    await setDoc(
        referenciaUsuario,
        datosUsuario
    );

    console.log(
        "Perfil creado en Firestore:",
        usuario.uid
    );

    return datosUsuario;

}


// =========================================
// OBTENER PERFIL DE UN VIAJERO
// =========================================

async function obtenerPerfilUsuario(
    uid
) {

    if (!uid) {

        return null;

    }

    const referenciaUsuario =
        doc(
            db,
            "usuarios",
            uid
        );

    const documento =
        await getDoc(
            referenciaUsuario
        );

    if (!documento.exists()) {

        return null;

    }

    return {
        uid:
            documento.id,

        ...documento.data()
    };

}


// =========================================
// CREAR PERFIL SOLO SI NO EXISTE
// Útil para cuentas antiguas
// =========================================

async function asegurarPerfilUsuario(
    usuario
) {

    const perfilExistente =
        await obtenerPerfilUsuario(
            usuario.uid
        );

    if (perfilExistente) {

        return perfilExistente;

    }

    const nombrePredeterminado =
        usuario.displayName ||
        usuario.email
            ?.split("@")[0] ||
        "Nuevo viajero";

    await crearPerfilUsuario(
        usuario,
        nombrePredeterminado
    );

    return obtenerPerfilUsuario(
        usuario.uid
    );

}


export {
    crearPerfilUsuario,
    obtenerPerfilUsuario,
    asegurarPerfilUsuario
};