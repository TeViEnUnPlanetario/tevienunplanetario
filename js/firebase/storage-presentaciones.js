// ==================================================
// FIREBASE STORAGE — CARTELES DE PRESENTACIONES
// ==================================================

import {
    storage
} from "./firebase-config.js";

import {
    verificarAdministrador
} from "./firestore-administracion.js";

import {
    deleteObject,
    getDownloadURL,
    ref,
    uploadBytes
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";


const TAMANO_MAXIMO = 5 * 1024 * 1024;
const TIPOS_PERMITIDOS = new Map([
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"]
]);


function validarArchivoCartel(archivo) {
    if (!(archivo instanceof File)) {
        throw new Error("Selecciona un archivo de imagen válido.");
    }

    if (!TIPOS_PERMITIDOS.has(archivo.type)) {
        throw new Error("El cartel debe ser JPG, PNG o WebP.");
    }

    if (archivo.size > TAMANO_MAXIMO) {
        throw new Error("El cartel no puede superar 5 MB.");
    }

    return true;
}


async function subirCartelPresentacion(archivo) {
    const perfil = await verificarAdministrador();
    validarArchivoCartel(archivo);

    if (!storage?.app?.options?.storageBucket) {
        throw new Error("Firebase Storage no está configurado en este proyecto.");
    }

    const extension = TIPOS_PERMITIDOS.get(archivo.type);
    const unico = typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const ruta = `presentaciones/${perfil.uid}/${Date.now()}-${unico}.${extension}`;
    const referencia = ref(storage, ruta);

    await uploadBytes(
        referencia,
        archivo,
        {
            contentType: archivo.type,
            customMetadata: {
                propietario: perfil.uid
            }
        }
    );

    return {
        url: await getDownloadURL(referencia),
        ruta
    };
}


async function eliminarCartelPresentacion(ruta) {
    if (!ruta) {
        return;
    }

    await verificarAdministrador();

    try {
        await deleteObject(ref(storage, ruta));
    } catch (error) {
        if (error?.code !== "storage/object-not-found") {
            throw error;
        }
    }
}


export {
    eliminarCartelPresentacion,
    subirCartelPresentacion,
    validarArchivoCartel
};
