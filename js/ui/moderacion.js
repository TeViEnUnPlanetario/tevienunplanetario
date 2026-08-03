import { auth } from "../firebase/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { observarPerfilViajero } from "./identidad-viajero.js";
import { confirmarAccion } from "./confirmacion.js";

export function conectarModeracion({ contenedor, oculto = false, alEditar, alOcultar, alEliminar }) {
    let barra = null;
    const mostrar = perfil => {
        const rol = String(perfil?.rol || "").toLowerCase();
        if (!["administrador", "sistema-planetario"].includes(rol)) {
            contenedor.hidden = Boolean(oculto);
            barra?.remove(); barra = null; contenedor.classList.remove("contenido-con-moderacion"); return;
        }
        contenedor.hidden = false;
        if (barra) return;
        contenedor.classList.add("contenido-con-moderacion");
        barra = document.createElement("div"); barra.className = "moderacion-acciones"; barra.setAttribute("aria-label", "Acciones de moderación");
        const editar = document.createElement("button"); editar.type = "button"; editar.className = "moderacion-accion"; editar.dataset.tooltip = "Editar contenido"; editar.setAttribute("aria-label", editar.dataset.tooltip); editar.textContent = "✎"; editar.onclick = () => alEditar?.();
        const alternar = document.createElement("button"); alternar.type = "button"; alternar.className = "moderacion-accion";
        const eliminar = document.createElement("button"); eliminar.type = "button"; eliminar.className = "moderacion-accion moderacion-accion--eliminar"; eliminar.dataset.tooltip = "Eliminar definitivamente"; eliminar.setAttribute("aria-label", eliminar.dataset.tooltip); eliminar.textContent = "⌫";
        const pintar = () => { alternar.textContent = oculto ? "◉" : "◌"; alternar.dataset.tooltip = oculto ? "Mostrar contenido" : "Ocultar contenido"; alternar.setAttribute("aria-label", alternar.dataset.tooltip); contenedor.classList.toggle("contenido-moderado--oculto", oculto); };
        alternar.onclick = async () => { if (!await confirmarAccion({ titulo: oculto ? "Mostrar contenido" : "Ocultar contenido", mensaje: oculto ? "El contenido volverá a estar disponible públicamente." : "El contenido dejará de mostrarse al público hasta que decidas restaurarlo.", aceptar: oculto ? "Mostrar" : "Ocultar" })) return; alternar.disabled = true; try { oculto = !oculto; await alOcultar?.(oculto); pintar(); } catch { oculto = !oculto; } finally { alternar.disabled = false; } };
        eliminar.onclick = async () => { if (!await confirmarAccion({ titulo: "Eliminar definitivamente", mensaje: "Esta acción eliminará el contenido y no se puede deshacer.", aceptar: "Eliminar" })) return; eliminar.disabled = true; try { await alEliminar?.(); contenedor.remove(); } finally { eliminar.disabled = false; } };
        if (alEditar) barra.append(editar);
        barra.append(alternar, eliminar); contenedor.prepend(barra); pintar();
    };
    return onAuthStateChanged(auth, usuario => { if (!usuario) return mostrar(null); observarPerfilViajero(usuario.uid, mostrar); });
}
