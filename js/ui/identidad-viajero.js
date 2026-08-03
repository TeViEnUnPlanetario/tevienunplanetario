import { auth, db } from "../firebase/firebase-config.js";
import { cancelarInvitacionConstelacion, enviarInvitacionConstelacion, obtenerEstadoConstelacion, responderInvitacionConstelacion, retirarDeConstelacion } from "../firebase/firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const perfiles = new Map();

function iniciales(nombre) {
    return String(nombre || "Viajero").trim().split(/\s+/).filter(Boolean)
        .slice(0, 2).map(parte => parte.charAt(0).toUpperCase()).join("") || "V";
}

function esImagen(valor) {
    return /^(?:https?:\/\/|data:image\/|img\/|\.\.?\/img\/)/i.test(String(valor || "").trim());
}

export function pintarAvatar(elemento, foto, nombre = "Viajero") {
    if (!elemento) return;
    elemento.replaceChildren();
    elemento.setAttribute("aria-label", `Avatar de ${nombre}`);
    if (!foto || !esImagen(foto)) {
        elemento.textContent = iniciales(nombre);
        return;
    }
    const imagen = document.createElement("img");
    imagen.src = foto;
    imagen.alt = "";
    imagen.loading = "lazy";
    imagen.addEventListener("error", () => {
        elemento.replaceChildren();
        elemento.textContent = iniciales(nombre);
    }, { once: true });
    elemento.appendChild(imagen);
}

export function observarPerfilViajero(uid, callback) {
    const id = String(uid || "").trim();
    if (!id || typeof callback !== "function") return () => {};
    let entrada = perfiles.get(id);
    if (!entrada) {
        entrada = { datos: null, callbacks: new Set(), detener: null };
        entrada.detener = onSnapshot(doc(db, "usuarios", id), snapshot => {
            entrada.datos = snapshot.exists() ? { uid: snapshot.id, ...snapshot.data() } : null;
            entrada.callbacks.forEach(fn => fn(entrada.datos));
        }, () => {
            entrada.callbacks.forEach(fn => fn(null));
        });
        perfiles.set(id, entrada);
    }
    entrada.callbacks.add(callback);
    if (entrada.datos) callback(entrada.datos);
    return () => {
        entrada.callbacks.delete(callback);
        if (!entrada.callbacks.size) {
            entrada.detener?.();
            perfiles.delete(id);
        }
    };
}

export function conectarIdentidadViajero({ uid, avatar, nombre, rango, respaldo = {} }) {
    if (!uid) {
        pintarAvatar(avatar, respaldo.foto, respaldo.nombre);
        return () => {};
    }
    const aplicar = perfil => {
        const datos = perfil || respaldo;
        const nombreActual = datos.nombre || respaldo.nombre || "Viajero";
        if (nombre) nombre.textContent = nombreActual;
        if (rango) rango.textContent = datos.rango || respaldo.rango || "Viajero";
        pintarAvatar(avatar, datos.foto || respaldo.foto, nombreActual);
    };
    aplicar(respaldo);
    return observarPerfilViajero(uid, aplicar);
}

export function crearAccionesViajero(uid) {
    const contenedor = document.createElement("span");
    contenedor.className = "identidad-viajero__acciones";
    const id = String(uid || "").trim();
    if (!id) return contenedor;

    const perfil = document.createElement("a");
    perfil.className = "identidad-viajero__perfil";
    perfil.href = `perfil.html?uid=${encodeURIComponent(id)}`;
    perfil.textContent = "Ver perfil";
    contenedor.appendChild(perfil);

    const seguir = document.createElement("button");
    seguir.type = "button";
    seguir.className = "identidad-viajero__seguir";
    seguir.textContent = "✦ Agregar";
    seguir.setAttribute("aria-pressed", "false");
    let estado = "ninguna";
    let usuarioActual = null;
    let viajeroActual = null;
    observarPerfilViajero(id, datos => { if (datos) viajeroActual = datos; });
    const pintar = () => {
        const textos = { ninguna: "✦ Invitar", enviada: "◷ Invitación enviada", recibida: "✓ Aceptar invitación", aceptada: "✓ En mi constelación" };
        seguir.textContent = textos[estado] || textos.ninguna;
        seguir.setAttribute("aria-pressed", String(estado === "aceptada"));
        seguir.classList.toggle("activo", estado === "aceptada");
    };
    onAuthStateChanged(auth, usuario => {
        usuarioActual = usuario;
        if (!usuario || usuario.uid === id) {
            seguir.remove();
            return;
        }
        observarPerfilViajero(usuario.uid, datos => { if (datos) perfiles.get(usuario.uid).datos = datos; });
        if (!seguir.isConnected) contenedor.appendChild(seguir);
        obtenerEstadoConstelacion(usuario.uid, id).then(valor => { estado = valor; pintar(); }).catch(() => {});
    });
    seguir.addEventListener("click", async () => {
        if (!usuarioActual) return;
        seguir.disabled = true;
        try {
            const viajero = viajeroActual || perfiles.get(id)?.datos || { uid: id, nombre: "Viajero", foto: "" };
            const propio = perfiles.get(usuarioActual.uid)?.datos || {};
            if (estado === "ninguna") estado = await enviarInvitacionConstelacion(usuarioActual.uid, viajero, propio);
            else if (estado === "enviada") estado = await cancelarInvitacionConstelacion(usuarioActual.uid, id);
            else if (estado === "recibida") estado = await responderInvitacionConstelacion(usuarioActual.uid, viajero, true, propio);
            else estado = await retirarDeConstelacion(usuarioActual.uid, id);
            pintar();
        } finally {
            seguir.disabled = false;
        }
    });
    return contenedor;
}
