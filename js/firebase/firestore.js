import { db } from "./firebase-config.js";
import {
    collection, deleteDoc, deleteField, doc, getCountFromServer, getDoc, getDocs,
    increment, limit, onSnapshot, orderBy, query, serverTimestamp,
    setDoc, updateDoc, where, writeBatch
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const USUARIOS = "usuarios";

const perfilBase = (usuario, nombre) => ({
    nombre: String(nombre || usuario.displayName || usuario.email?.split("@")[0] || "Nuevo viajero").trim(),
    rango: "Viajero",
    fechaRegistro: serverTimestamp(),
    biografia: "",
    foto: "img/avatar/dia-y-noche.png",
    portada: "",
    publicaciones: 0,
    comentarios: 0,
    favoritos: 0,
    constelacionTotal: 0,
    verificado: false,
    rol: "viajero",
    oficial: false
});

const datosPrivadosBase = usuario => ({
    correo: usuario.email || "",
    edad: null,
    redes: { facebook: "", instagram: "", whatsapp: "", x: "", spotify: "", appleMusic: "" }
});

export async function crearPerfilUsuario(usuario, nombre) {
    if (!usuario) throw new Error("No se recibió un usuario válido.");
    const datos = perfilBase(usuario, nombre);
    await setDoc(doc(db, USUARIOS, usuario.uid), datos);
    const privados = datosPrivadosBase(usuario);
    await setDoc(doc(db, USUARIOS, usuario.uid, "privado", "perfil"), privados);
    return { ...datos, ...privados };
}

export async function obtenerPerfilUsuario(uid) {
    if (!uid) return null;
    const snapshot = await getDoc(doc(db, USUARIOS, uid));
    return snapshot.exists() ? { uid: snapshot.id, ...snapshot.data() } : null;
}

export async function asegurarPerfilUsuario(usuario) {
    if (!usuario) throw new Error("No se recibió un usuario válido.");
    const existente = await obtenerPerfilUsuario(usuario.uid);
    if (!existente) {
        await crearPerfilUsuario(usuario);
        return obtenerPerfilUsuario(usuario.uid);
    }
    const base = perfilBase(usuario);
    const privadosBase = datosPrivadosBase(usuario);
    const faltantes = {};
    ["rol", "oficial", "verificado", "biografia", "foto", "portada", "publicaciones", "comentarios", "favoritos", "constelacionTotal"].forEach(campo => {
        if (existente[campo] === undefined) faltantes[campo] = base[campo];
    });
    const privadosRef = doc(db, USUARIOS, usuario.uid, "privado", "perfil");
    const privadosSnap = await getDoc(privadosRef);
    const privados = privadosSnap.exists() ? privadosSnap.data() : {
        correo: existente.correo || privadosBase.correo,
        edad: existente.edad ?? null,
        redes: existente.redes || privadosBase.redes
    };
    await setDoc(privadosRef, privados, { merge: true });
    ["correo", "edad", "redes"].forEach(campo => {
        if (existente[campo] !== undefined) faltantes[campo] = deleteField();
    });
    if (Object.keys(faltantes).length) {
        await updateDoc(doc(db, USUARIOS, usuario.uid), faltantes);
        return { ...(await obtenerPerfilUsuario(usuario.uid)), ...privados };
    }
    return { ...existente, ...privados };
}

export async function obtenerDatosPrivadosPerfil(uid) {
    if (!uid) return {};
    const snapshot = await getDoc(doc(db, USUARIOS, uid, "privado", "perfil"));
    return snapshot.exists() ? snapshot.data() : {};
}

export async function actualizarPerfilUsuario(uid, cambios) {
    if (!uid) throw new Error("No se recibió el perfil.");
    const publicos = {};
    ["nombre", "biografia", "foto", "portada"].forEach(campo => {
        if (cambios[campo] !== undefined) publicos[campo] = cambios[campo];
    });
    publicos.actualizadoEn = serverTimestamp();
    const privados = {};
    ["edad", "redes"].forEach(campo => {
        if (cambios[campo] !== undefined) privados[campo] = cambios[campo];
    });
    await Promise.all([
        updateDoc(doc(db, USUARIOS, uid), publicos),
        setDoc(doc(db, USUARIOS, uid, "privado", "perfil"), privados, { merge: true })
    ]);
}

export function calcularRango(perfil = {}) {
    const fecha = perfil.fechaRegistro?.toDate?.() || new Date(perfil.fechaRegistro || Date.now());
    const meses = Math.max(0, (Date.now() - fecha.getTime()) / 2629800000);
    const actividad = Number(perfil.publicaciones || 0) * 3 + Number(perfil.comentarios || 0) + Number(perfil.favoritos || 0) + Math.floor(meses * 2);
    if (actividad >= 500) return { nombre: "Supernova", icono: "✺", nivel: 5, siguiente: null, progreso: 100 };
    if (actividad >= 220) return { nombre: "Guardián galáctico", icono: "✦", nivel: 4, siguiente: 500, progreso: actividad / 5 };
    if (actividad >= 90) return { nombre: "Cartógrafo estelar", icono: "⌖", nivel: 3, siguiente: 220, progreso: actividad / 2.2 };
    if (actividad >= 25) return { nombre: "Explorador orbital", icono: "☄", nivel: 2, siguiente: 90, progreso: actividad / .9 };
    return { nombre: "Viajero", icono: "◉", nivel: 1, siguiente: 25, progreso: actividad * 4 };
}

export async function recalcularEstadisticas(uid) {
    if (!uid) return { publicaciones: 0, comentarios: 0, favoritos: 0 };
    const [pubs, ecos, estrellas] = await Promise.all([
        getCountFromServer(query(collection(db, "observaciones"), where("autorId", "==", uid))),
        getCountFromServer(query(collection(db, "ecos-usuarios"), where("autorId", "==", uid))).catch(() => null),
        getCountFromServer(query(collection(db, "estrellas-usuarios"), where("usuarioId", "==", uid))).catch(() => null)
    ]);
    const perfil = await obtenerPerfilUsuario(uid);
    const datos = {
        publicaciones: pubs.data().count,
        comentarios: ecos?.data().count ?? Number(perfil?.comentarios || 0),
        favoritos: estrellas?.data().count ?? Number(perfil?.favoritos || 0)
    };
    await updateDoc(doc(db, USUARIOS, uid), datos).catch(() => {});
    return datos;
}

export async function estaEnConstelacion(miUid, uid) {
    if (!miUid || !uid) return false;
    return (await getDoc(doc(db, USUARIOS, miUid, "constelacion", uid))).exists();
}

export async function obtenerEstadoConstelacion(miUid, uid) {
    if (!miUid || !uid || miUid === uid) return "ninguna";
    const [vinculo, enviada, recibida] = await Promise.all([
        getDoc(doc(db, USUARIOS, miUid, "constelacion", uid)),
        getDoc(doc(db, USUARIOS, uid, "invitaciones", miUid)),
        getDoc(doc(db, USUARIOS, miUid, "invitaciones", uid))
    ]);
    if (vinculo.exists()) return "aceptada";
    if (recibida.exists()) return "recibida";
    if (enviada.exists()) return "enviada";
    return "ninguna";
}

export async function enviarInvitacionConstelacion(miUid, viajero, remitente = {}) {
    if (!miUid || !viajero?.uid || miUid === viajero.uid) throw new Error("No puedes invitarte a tu propia constelación.");
    await setDoc(doc(db, USUARIOS, viajero.uid, "invitaciones", miUid), {
        remitenteId: miUid, nombre: remitente.nombre || "Viajero", foto: remitente.foto || "",
        estado: "pendiente", creadaEn: serverTimestamp()
    });
    await crearNotificacion(viajero.uid, {
        tipo: "constelacion", accion: "invitacion", actorId: miUid,
        actorNombre: remitente.nombre || "Viajero", actorFoto: remitente.foto || "",
        mensaje: "quiere agregarte a su constelación", destino: `perfil.html?uid=${encodeURIComponent(miUid)}`
    });
    return "enviada";
}

export async function cancelarInvitacionConstelacion(miUid, uid) {
    await deleteDoc(doc(db, USUARIOS, uid, "invitaciones", miUid));
    return "ninguna";
}

export async function responderInvitacionConstelacion(miUid, viajero, aceptar, perfilPropio = {}) {
    if (!miUid || !viajero?.uid || miUid === viajero.uid) throw new Error("La invitación no es válida.");
    const invitacionRef = doc(db, USUARIOS, miUid, "invitaciones", viajero.uid);
    if (!(await getDoc(invitacionRef)).exists()) throw new Error("Esta invitación ya no está disponible.");
    if (!aceptar) { await deleteDoc(invitacionRef); return "ninguna"; }
    const lote = writeBatch(db);
    const agregadoEn = serverTimestamp();
    lote.set(doc(db, USUARIOS, miUid, "constelacion", viajero.uid), { uid: viajero.uid, nombre: viajero.nombre || "Viajero", foto: viajero.foto || "", agregadoEn });
    lote.set(doc(db, USUARIOS, viajero.uid, "constelacion", miUid), { uid: miUid, nombre: perfilPropio.nombre || "Viajero", foto: perfilPropio.foto || "", agregadoEn });
    lote.delete(invitacionRef);
    await lote.commit();
    await crearNotificacion(viajero.uid, {
        tipo: "constelacion", accion: "aceptada", actorId: miUid,
        actorNombre: perfilPropio.nombre || "Viajero", actorFoto: perfilPropio.foto || "",
        mensaje: "aceptó tu invitación a su constelación", destino: `perfil.html?uid=${encodeURIComponent(miUid)}`
    });
    return "aceptada";
}

export async function retirarDeConstelacion(miUid, uid) {
    const lote = writeBatch(db);
    lote.delete(doc(db, USUARIOS, miUid, "constelacion", uid));
    lote.delete(doc(db, USUARIOS, uid, "constelacion", miUid));
    await lote.commit();
    return "ninguna";
}

export async function obtenerConstelacion(uid) {
    if (!uid) return [];
    const snap = await getDocs(query(collection(db, USUARIOS, uid, "constelacion"), orderBy("agregadoEn", "desc"), limit(24)));
    return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
}

export function escucharNotificaciones(uid, callback) {
    if (!uid) return () => {};
    return onSnapshot(query(collection(db, USUARIOS, uid, "notificaciones"), orderBy("creadaEn", "desc"), limit(30)),
        snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

export async function crearNotificacion(uid, datos) {
    if (!uid || uid === datos.actorId) return;
    const ref = doc(collection(db, USUARIOS, uid, "notificaciones"));
    await setDoc(ref, { ...datos, leida: false, creadaEn: serverTimestamp() });
}

export async function marcarNotificacionesLeidas(uid, ids) {
    await Promise.all(ids.map(id => updateDoc(doc(db, USUARIOS, uid, "notificaciones", id), { leida: true })));
}

export async function eliminarNotificacion(uid, id) {
    if (uid && id) await deleteDoc(doc(db, USUARIOS, uid, "notificaciones", id));
}

export async function registrarActividad(uid, campo, delta = 1) {
    if (!uid || !["publicaciones", "comentarios", "favoritos"].includes(campo)) return;
    await updateDoc(doc(db, USUARIOS, uid), { [campo]: increment(delta) }).catch(() => {});
}
