import { auth } from "../firebase/firebase-config.js";
import {
    actualizarPerfilUsuario, asegurarPerfilUsuario, calcularRango, eliminarNotificacion, escucharNotificaciones,
    cancelarInvitacionConstelacion, enviarInvitacionConstelacion, marcarNotificacionesLeidas, obtenerConstelacion,
    obtenerDatosPrivadosPerfil, obtenerEstadoConstelacion, obtenerPerfilUsuario, recalcularEstadisticas,
    responderInvitacionConstelacion, retirarDeConstelacion
} from "../firebase/firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { conectarIdentidadViajero, crearAccionesViajero } from "./identidad-viajero.js";

const $ = id => document.getElementById(id);
const avatares = ["dia-y-noche.png", "digital.png", "jupiter.png", "mercurio 2.png", "mercurio.png", "neptuno.png", "urano.png", "venus 2.png", "venus.png"];
// El navegador no puede enumerar carpetas estáticas: registra aquí cada portada disponible.
const portadas = [
    "fondo-universo.jpg", "fondo-universo2.jpg", "TVEUP1.jpg",
    "TVEUP2.jpg", "TVEUP3.jpg", "TVEUP4.jpg"
];
const redesMeta = {
    facebook: ["f", "Facebook"], instagram: ["◎", "Instagram"], whatsapp: ["◌", "WhatsApp"],
    x: ["𝕏", "X"], spotify: ["♫", "Spotify"], appleMusic: ["♪", "Apple Music"]
};
let usuarioActual, perfil, perfilPropio, uidVisto, amistad = false, estadoConstelacion = "ninguna", seleccionAvatar = "", seleccionPortada = "";

function actualizarAccesoAdministrativo(datos = {}) {
    document.getElementById("perfil-panel-control")?.remove();
    const rol = String(datos.rol || "").trim().toLowerCase();
    if (!["sistema-planetario", "administrador"].includes(rol)) return;
    const enlace = document.createElement("a");
    enlace.id = "perfil-panel-control";
    enlace.className = "perfil-enlace";
    enlace.href = "sistema-planetario.html";
    enlace.textContent = "Panel de control";
    $("perfil-cerrar-sesion")?.before(enlace);
}

function fecha(valor) {
    const d = valor?.toDate?.() || new Date(valor || Date.now());
    return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", year: "numeric" }).format(d);
}
function antiguedad(valor) {
    const d = valor?.toDate?.() || new Date(valor || Date.now());
    const dias = Math.max(0, Math.floor((Date.now() - d) / 86400000));
    if (dias < 31) return `${dias} ${dias === 1 ? "día" : "días"} viajando`;
    const meses = Math.floor(dias / 30.44);
    if (meses < 12) return `${meses} ${meses === 1 ? "mes" : "meses"} viajando`;
    const años = Math.floor(meses / 12); return `${años} ${años === 1 ? "año" : "años"} en este universo`;
}
function urlRed(valor, red) {
    const limpio = String(valor || "").trim();
    if (!limpio) return "";
    if (red === "whatsapp" && !/^https?:/i.test(limpio)) return `https://wa.me/${limpio.replace(/\D/g, "")}`;
    return /^https?:\/\//i.test(limpio) ? limpio : `https://${limpio}`;
}
function renderRedes(redes = {}) {
    const cont = $("perfil-redes"); cont.innerHTML = "";
    Object.entries(redesMeta).forEach(([clave, [icono, nombre]]) => {
        const href = urlRed(redes[clave], clave); if (!href) return;
        const a = document.createElement("a"); a.href = href; a.target = "_blank"; a.rel = "noopener noreferrer";
        a.className = "perfil-red-social"; a.title = nombre; a.setAttribute("aria-label", nombre); a.textContent = icono; cont.append(a);
    });
}
function renderRango(datos) {
    const rango = calcularRango(datos);
    $("perfil-rango").innerHTML = `<span>${rango.icono}</span> ${rango.nombre} · nivel ${rango.nivel}`;
    $("perfil-progreso").style.width = `${Math.min(100, rango.progreso)}%`;
    $("perfil-progreso-texto").textContent = rango.siguiente ? `Actividad rumbo al siguiente rango` : "Rango máximo alcanzado";
}
function renderPerfil(datos) {
    const esMio = uidVisto === usuarioActual.uid;
    document.title = `${datos.nombre || "Viajero"} | Te Vi En Un Planetario`;
    $("perfil-etiqueta").textContent = esMio ? "Mi constelación" : "Constelación de viajero";
    $("perfil-nombre").textContent = datos.nombre || "Viajero";
    $("perfil-biografia").textContent = datos.biografia?.trim() || "Este viajero todavía no ha escrito su historia.";
    $("perfil-edad").textContent = datos.edad ? `${datos.edad} años orbitando el Sol` : "";
    $("perfil-fecha-registro").textContent = fecha(datos.fechaRegistro);
    $("perfil-antiguedad").textContent = antiguedad(datos.fechaRegistro);
    ["publicaciones", "comentarios", "favoritos"].forEach(c => $(`perfil-${c}`).textContent = Number(datos[c] || 0));
    const img = $("perfil-avatar-imagen"), inicial = $("perfil-avatar-inicial");
    inicial.textContent = (datos.nombre || "V").trim()[0].toUpperCase();
    if (datos.foto) { img.src = datos.foto; img.hidden = false; inicial.hidden = true; img.onerror = () => { img.hidden = true; inicial.hidden = false; }; }
    else { img.hidden = true; inicial.hidden = false; }
    const portada = $("perfil-portada-visual");
    portada.style.backgroundImage = datos.portada ? `linear-gradient(180deg, transparent, rgba(8,7,17,.72)), url("${datos.portada.replace(/\"/g, "")}")` : "";
    portada.classList.toggle("tiene-portada", Boolean(datos.portada));
    renderRango(datos);
    const puedeVer = esMio || amistad;
    $("perfil-privado").hidden = puedeVer;
    $("perfil-edad").hidden = !puedeVer;
    $("perfil-redes").hidden = !puedeVer;
    if (puedeVer) renderRedes(datos.redes);
    $("perfil-editar").hidden = !esMio; $("perfil-editar-biografia").hidden = !esMio;
    $("perfil-editar-avatar").hidden = !esMio; $("perfil-editar-portada").hidden = !esMio;
    $("perfil-agregar").hidden = esMio;
    const estados = { ninguna: "✦ Enviar invitación", enviada: "◷ Invitación enviada", recibida: "✓ Aceptar invitación", aceptada: "✓ En mi constelación" };
    $("perfil-agregar").textContent = estados[estadoConstelacion] || estados.ninguna;
    $("perfil-cargando").hidden = true; $("perfil-contenido").hidden = false;
}
async function renderConstelacion() {
    const viajeros = await obtenerConstelacion(uidVisto);
    $("perfil-constelacion-total").textContent = viajeros.length;
    const cont = $("perfil-viajeros"); cont.innerHTML = "";
    if (!viajeros.length) { cont.innerHTML = "<p>Aún no hay viajeros en esta constelación.</p>"; return; }
    viajeros.forEach(v => {
        const a = document.createElement("a"); a.href = `perfil.html?uid=${encodeURIComponent(v.uid)}`; a.className = "perfil-viajero";
        a.innerHTML = v.foto ? `<img src="${v.foto}" alt=""><span>${v.nombre}</span>` : `<b>${(v.nombre || "V")[0]}</b><span>${v.nombre}</span>`; cont.append(a);
    });
}
function abrirEditor() {
    $("perfil-form-nombre").value = perfil.nombre || ""; $("perfil-form-biografia").value = perfil.biografia || "";
    $("perfil-form-edad").value = perfil.edad || ""; seleccionAvatar = perfil.foto || ""; seleccionPortada = perfil.portada || "";
    const r = perfil.redes || {}; ["facebook", "instagram", "whatsapp", "x", "spotify"].forEach(c => $(`perfil-form-${c}`).value = r[c] || ""); $("perfil-form-apple").value = r.appleMusic || "";
    $("perfil-biografia-contador").textContent = $("perfil-form-biografia").value.length; renderSelectores(); $("perfil-modal").showModal();
}
function abrirEditorImagen(tipo) {
    abrirEditor();
    requestAnimationFrame(() => $(`perfil-seccion-${tipo}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
}

// Punto de integración futuro: reemplazar la vista previa por uploadBytes/getDownloadURL de Firebase Storage.
async function prepararSubidaImagenPerfil(tipo, archivo) {
    if (!archivo) return null;
    if (!/^image\/(?:jpeg|png|webp)$/i.test(archivo.type) || archivo.size > 5 * 1024 * 1024) throw new Error("Selecciona una imagen JPG, PNG o WebP de hasta 5 MB.");
    const vistaPrevia = URL.createObjectURL(archivo);
    $("perfil-form-mensaje").textContent = `${archivo.name} está listo. La subida definitiva se activará al conectar Firebase Storage.`;
    if (tipo === "portada") $("perfil-portada-visual").style.backgroundImage = `linear-gradient(180deg, transparent, rgba(8,7,17,.72)), url("${vistaPrevia}")`;
    else { const img = $("perfil-avatar-imagen"); img.src = vistaPrevia; img.hidden = false; $("perfil-avatar-inicial").hidden = true; }
    return { tipo, archivo, vistaPrevia };
}
function renderSelectores() {
    const c = $("perfil-selector-avatares"); c.innerHTML = "";
    avatares.forEach(nombre => { const ruta = `img/avatar/${nombre}`; const b = document.createElement("button"); b.type = "button"; b.className = `perfil-avatar-opcion${seleccionAvatar === ruta ? " activo" : ""}`; b.innerHTML = `<img src="${ruta}" alt="${nombre.replace(/\.png$/i, "")}">`; b.onclick = () => { seleccionAvatar = ruta; renderSelectores(); }; c.append(b); });
    const p = $("perfil-selector-portadas"); if (!portadas.length) return;
    p.innerHTML = ""; portadas.forEach(nombre => { const ruta = `img/portada-usuario/${nombre}`; const b = document.createElement("button"); b.type = "button"; b.className = seleccionPortada === ruta ? "activo" : ""; b.style.backgroundImage = `url("${ruta}")`; b.title = nombre.replace(/\.[^.]+$/, ""); b.setAttribute("aria-label", `Seleccionar portada ${b.title}`); b.onclick = () => { seleccionPortada = ruta; renderSelectores(); }; p.append(b); });
}
async function guardar(e) {
    e.preventDefault(); const boton = $("perfil-guardar"); boton.disabled = true; boton.textContent = "Guardando...";
    try {
        const cambios = { nombre: $("perfil-form-nombre").value.trim(), biografia: $("perfil-form-biografia").value.trim(), edad: Number($("perfil-form-edad").value) || null, foto: seleccionAvatar, portada: seleccionPortada,
            redes: { facebook: $("perfil-form-facebook").value.trim(), instagram: $("perfil-form-instagram").value.trim(), whatsapp: $("perfil-form-whatsapp").value.trim(), x: $("perfil-form-x").value.trim(), spotify: $("perfil-form-spotify").value.trim(), appleMusic: $("perfil-form-apple").value.trim() } };
        await actualizarPerfilUsuario(usuarioActual.uid, cambios); perfil = { ...perfil, ...cambios }; renderPerfil(perfil); $("perfil-modal").close();
    } catch (err) { $("perfil-form-mensaje").textContent = err.message || "No fue posible guardar los cambios."; }
    finally { boton.disabled = false; boton.textContent = "Guardar cambios"; }
}
function renderNotificaciones(items) {
    const nuevas = items.filter(n => !n.leida); $("perfil-notificaciones-total").textContent = nuevas.length; $("perfil-notificaciones-total").hidden = !nuevas.length;
    const c = $("perfil-notificaciones-lista"); c.innerHTML = items.length ? "" : "<p>El espacio está en silencio. Las respuestas y estrellas aparecerán aquí.</p>";
    items.forEach(n => {
        const fila = document.createElement("div");
        fila.className = `perfil-notificacion${n.leida ? "" : " nueva"}`;
        const avatar = document.createElement("span");
        avatar.className = "perfil-notificacion__avatar";
        const cuerpo = document.createElement("div");
        const nombre = document.createElement("strong");
        nombre.textContent = n.actorNombre || "Un viajero";
        const mensaje = document.createElement("p");
        mensaje.textContent = n.mensaje || "interactuó contigo";
        const fechaElemento = document.createElement("small");
        fechaElemento.textContent = fecha(n.creadaEn);
        const ver = document.createElement("a");
        ver.href = n.destino || (n.observacionId ? `observatorio.html#${n.observacionId}` : "observatorio.html");
        ver.textContent = n.tipo === "constelacion" ? "Ver perfil" : (n.tipo === "estrella" ? "Ver estrella" : "Ver eco");
        ver.className = "perfil-notificacion__ver";
        cuerpo.append(nombre, mensaje, fechaElemento, crearAccionesViajero(n.actorId), ver);
        if (n.tipo === "constelacion" && n.accion === "invitacion") {
            const aceptar = document.createElement("button"); aceptar.type = "button"; aceptar.className = "perfil-notificacion__ver"; aceptar.textContent = "Aceptar";
            const rechazar = document.createElement("button"); rechazar.type = "button"; rechazar.className = "perfil-notificacion__ver"; rechazar.textContent = "Rechazar";
            aceptar.onclick = async () => { aceptar.disabled = rechazar.disabled = true; await responderInvitacionConstelacion(usuarioActual.uid, { uid: n.actorId, nombre: n.actorNombre, foto: n.actorFoto }, true, perfilPropio); await eliminarNotificacion(usuarioActual.uid, n.id); await renderConstelacion(); };
            rechazar.onclick = async () => { aceptar.disabled = rechazar.disabled = true; await responderInvitacionConstelacion(usuarioActual.uid, { uid: n.actorId }, false, perfilPropio); await eliminarNotificacion(usuarioActual.uid, n.id); };
            cuerpo.append(aceptar, rechazar);
        }
        fila.append(avatar, cuerpo);
        c.append(fila);
        conectarIdentidadViajero({ uid: n.actorId, avatar, nombre, respaldo: { nombre: n.actorNombre } });
    });
    $("perfil-notificaciones-boton").onclick = async () => { $("perfil-notificaciones").hidden = false; if (nuevas.length) await marcarNotificacionesLeidas(usuarioActual.uid, nuevas.map(n => n.id)); };
}
async function iniciar(usuario) {
    usuarioActual = usuario; perfilPropio = await asegurarPerfilUsuario(usuario); uidVisto = new URLSearchParams(location.search).get("uid") || usuario.uid;
    actualizarAccesoAdministrativo(perfilPropio);
    perfil = uidVisto === usuario.uid ? perfilPropio : await obtenerPerfilUsuario(uidVisto); if (!perfil) throw new Error("Este viajero todavía no tiene un perfil público.");
    estadoConstelacion = uidVisto === usuario.uid ? "aceptada" : await obtenerEstadoConstelacion(usuario.uid, uidVisto);
    amistad = estadoConstelacion === "aceptada";
    if (amistad) perfil = { ...perfil, ...(await obtenerDatosPrivadosPerfil(uidVisto)) };
    if (uidVisto === usuario.uid) { const stats = await recalcularEstadisticas(uidVisto).catch(() => null); if (stats) perfil = { ...perfil, ...stats }; }
    renderPerfil(perfil); await renderConstelacion();
    escucharNotificaciones(usuario.uid, renderNotificaciones);
}

$("perfil-editar").onclick = abrirEditor; $("perfil-editar-biografia").onclick = abrirEditor; $("perfil-formulario").onsubmit = guardar;
$("perfil-editar-avatar").onclick = () => abrirEditorImagen("avatar");
$("perfil-editar-portada").onclick = () => abrirEditorImagen("portada");
document.querySelectorAll("[data-tipo-imagen]").forEach(input => input.onchange = async () => { try { await prepararSubidaImagenPerfil(input.dataset.tipoImagen, input.files?.[0]); } catch (e) { $("perfil-form-mensaje").textContent = e.message; input.value = ""; } });
$("perfil-form-biografia").oninput = e => $("perfil-biografia-contador").textContent = e.target.value.length;
$("perfil-agregar").onclick = async () => { const b = $("perfil-agregar"); b.disabled = true; try {
    if (estadoConstelacion === "ninguna") estadoConstelacion = await enviarInvitacionConstelacion(usuarioActual.uid, perfil, perfilPropio);
    else if (estadoConstelacion === "enviada") estadoConstelacion = await cancelarInvitacionConstelacion(usuarioActual.uid, perfil.uid);
    else if (estadoConstelacion === "recibida") estadoConstelacion = await responderInvitacionConstelacion(usuarioActual.uid, perfil, true, perfilPropio);
    else estadoConstelacion = await retirarDeConstelacion(usuarioActual.uid, perfil.uid);
    amistad = estadoConstelacion === "aceptada"; renderPerfil(perfil); await renderConstelacion();
} catch (e) { alert(e.message); } finally { b.disabled = false; } };
$("perfil-notificaciones-cerrar").onclick = () => $("perfil-notificaciones").hidden = true;
$("perfil-modal-cerrar").onclick = $("perfil-modal-cancelar").onclick = () => $("perfil-modal").close();
$("perfil-cerrar-sesion").onclick = async () => { await signOut(auth); location.replace("index.html"); };
onAuthStateChanged(auth, usuario => { if (!usuario) return location.replace("index.html"); iniciar(usuario).catch(e => { $("perfil-cargando").hidden = true; $("perfil-error").hidden = false; $("perfil-error-mensaje").textContent = e.message; }); });
