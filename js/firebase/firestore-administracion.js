// ==================================================
// FIRESTORE — ADMINISTRACIÓN DEL SISTEMA PLANETARIO
// ==================================================

import {
    auth,
    db
} from "./firebase-config.js";

import {
    doc,
    getDoc,
    serverTimestamp,
    setDoc,
    Timestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


const REFERENCIA_LANZAMIENTO =
    doc(db, "configuracion", "proximo-lanzamiento");

const ROLES_ADMINISTRATIVOS =
    new Set(["administrador", "sistema-planetario"]);

const VALORES_RESPALDO_LANZAMIENTO = Object.freeze({
    titulo: "Perdón",
    descripcion: "Nuevo sencillo.",
    fecha: "2026-09-04T00:00",
    imagen: "img/lanzamientos/nueva-cancion.jpg",
    disponibilidad: "DISPONIBLE EL 04 DE SEPTIEMBRE DE 2026",
    spotify: "https://open.spotify.com/intl-es/artist/1tLZIDlRNgWyQlu5qrqLvm",
    appleMusic: "https://music.apple.com/es/artist/te-vi-en-un-planetario/1675162556",
    hiloComentariosId: "proximo-lanzamiento-inicial",
    visible: true
});


function generarHiloComentariosId() {
    const unico = typeof globalThis.crypto?.randomUUID === "function"
        ? globalThis.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return `lanzamiento-${unico}`;
}


function crearError(codigo, mensaje, causa) {
    const error = new Error(mensaje, causa ? { cause: causa } : undefined);
    error.code = codigo;
    return error;
}


function normalizarRol(rol) {
    return String(rol || "").trim().toLowerCase();
}


function esRolAdministrador(rol) {
    return ROLES_ADMINISTRATIVOS.has(normalizarRol(rol));
}


async function obtenerPerfilAdministrativo(usuario) {
    if (!usuario?.uid) {
        throw crearError(
            "administracion/sin-sesion",
            "Debes iniciar sesión para entrar al Sistema Planetario."
        );
    }

    try {
        const referenciaPerfil = doc(db, "usuarios", usuario.uid);
        const documentoPerfil = await getDoc(referenciaPerfil);

        if (!documentoPerfil.exists()) {
            throw crearError(
                "administracion/perfil-inexistente",
                "Tu cuenta no tiene un perfil asociado."
            );
        }

        const perfil = {
            uid: documentoPerfil.id,
            ...documentoPerfil.data()
        };

        if (!esRolAdministrador(perfil.rol)) {
            throw crearError(
                "administracion/acceso-denegado",
                "Tu cuenta no tiene permisos para administrar el sistema."
            );
        }

        return perfil;
    } catch (error) {
        if (String(error?.code || "").startsWith("administracion/")) {
            throw error;
        }

        throw crearError(
            "administracion/perfil-no-disponible",
            "No pudimos verificar tus permisos en este momento.",
            error
        );
    }
}


async function verificarAdministrador(usuario = auth.currentUser) {
    return obtenerPerfilAdministrativo(usuario);
}


function convertirFechaParaFormulario(fecha) {
    if (!fecha) {
        return VALORES_RESPALDO_LANZAMIENTO.fecha;
    }

    let valorFecha = fecha;

    if (typeof fecha.toDate === "function") {
        valorFecha = fecha.toDate();
    } else if (fecha instanceof Timestamp) {
        valorFecha = fecha.toDate();
    }

    const fechaReal = new Date(valorFecha);

    if (Number.isNaN(fechaReal.getTime())) {
        return VALORES_RESPALDO_LANZAMIENTO.fecha;
    }

    const compensacion = fechaReal.getTimezoneOffset() * 60000;
    return new Date(fechaReal.getTime() - compensacion)
        .toISOString()
        .slice(0, 16);
}


function normalizarLanzamiento(datos = {}) {
    const respaldo = VALORES_RESPALDO_LANZAMIENTO;

    return {
        titulo: String(datos.titulo ?? respaldo.titulo),
        descripcion: String(datos.descripcion ?? respaldo.descripcion),
        fecha: convertirFechaParaFormulario(datos.fecha ?? respaldo.fecha),
        imagen: String(datos.imagen ?? respaldo.imagen),
        disponibilidad: String(
            datos.disponibilidad ?? respaldo.disponibilidad
        ),
        spotify: String(datos.spotify ?? respaldo.spotify),
        appleMusic: String(datos.appleMusic ?? respaldo.appleMusic),
        hiloComentariosId: String(
            datos.hiloComentariosId ?? respaldo.hiloComentariosId
        ).trim().slice(0, 120),
        visible: typeof datos.visible === "boolean"
            ? datos.visible
            : respaldo.visible
    };
}


async function obtenerProximoLanzamiento() {
    await verificarAdministrador();

    try {
        const documento = await getDoc(REFERENCIA_LANZAMIENTO);

        if (!documento.exists()) {
            return {
                datos: normalizarLanzamiento(),
                origen: "respaldo",
                aviso: "Aún no existe una configuración guardada. Se muestran los valores actuales del sitio."
            };
        }

        return {
            datos: normalizarLanzamiento(documento.data()),
            origen: "firestore",
            aviso: "Configuración cargada desde Firestore."
        };
    } catch (error) {
        if (error?.code === "administracion/acceso-denegado") {
            throw error;
        }

        console.warn(
            "No se pudo cargar el próximo lanzamiento; se usará el respaldo local.",
            error
        );

        return {
            datos: normalizarLanzamiento(),
            origen: "respaldo",
            aviso: "Firebase no respondió. Puedes revisar los valores de respaldo, pero el guardado podría no estar disponible."
        };
    }
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

    let urlAnalizada;
    try {
        urlAnalizada = new URL(url);
    } catch {
        throw crearError(
            "administracion/datos-invalidos",
            `${etiqueta} debe ser una URL válida.`
        );
    }

    if (!["https:", "http:"].includes(urlAnalizada.protocol)) {
        throw crearError(
            "administracion/datos-invalidos",
            `${etiqueta} debe comenzar con https:// o http://.`
        );
    }

    return urlAnalizada.href;
}


function prepararLanzamiento(datos = {}) {
    const titulo = limpiarTexto(datos.titulo, 120);
    const descripcion = limpiarTexto(datos.descripcion, 600);
    const disponibilidad = limpiarTexto(datos.disponibilidad, 160);
    const fecha = new Date(datos.fecha);

    if (!titulo || !descripcion || !disponibilidad) {
        throw crearError(
            "administracion/datos-invalidos",
            "Completa el título, la descripción y el texto de disponibilidad."
        );
    }

    if (Number.isNaN(fecha.getTime())) {
        throw crearError(
            "administracion/datos-invalidos",
            "Selecciona una fecha y hora válidas."
        );
    }

    return {
        titulo,
        descripcion,
        fecha: Timestamp.fromDate(fecha),
        imagen: validarUrl(datos.imagen, "La imagen", true),
        disponibilidad,
        spotify: validarUrl(datos.spotify, "El enlace de Spotify"),
        appleMusic: validarUrl(datos.appleMusic, "El enlace de Apple Music"),
        hiloComentariosId: limpiarTexto(
            datos.hiloComentariosId || VALORES_RESPALDO_LANZAMIENTO.hiloComentariosId,
            120
        ),
        visible: Boolean(datos.visible)
    };
}


async function guardarProximoLanzamiento(datos) {
    const usuario = auth.currentUser;
    const perfil = await verificarAdministrador(usuario);
    const lanzamiento = prepararLanzamiento(datos);

    try {
        await setDoc(
            REFERENCIA_LANZAMIENTO,
            {
                ...lanzamiento,
                actualizadoEn: serverTimestamp(),
                actualizadoPor: usuario.uid,
                actualizadoPorNombre: String(
                    perfil.nombre || usuario.email || "Administrador"
                ).slice(0, 120)
            },
            { merge: true }
        );

        return normalizarLanzamiento(lanzamiento);
    } catch (error) {
        if (String(error?.code || "").startsWith("administracion/")) {
            throw error;
        }

        throw crearError(
            "administracion/guardado-fallido",
            "Firestore no pudo guardar los cambios. Revisa la conexión y las reglas de seguridad.",
            error
        );
    }
}


export {
    VALORES_RESPALDO_LANZAMIENTO,
    esRolAdministrador,
    generarHiloComentariosId,
    guardarProximoLanzamiento,
    obtenerProximoLanzamiento,
    verificarAdministrador
};
