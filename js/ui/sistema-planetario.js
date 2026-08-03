// ==================================================
// INTERFAZ — SISTEMA PLANETARIO
// ==================================================

import {
    auth
} from "../firebase/firebase-config.js";

import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
    guardarProximoLanzamiento,
    obtenerProximoLanzamiento,
    verificarAdministrador
} from "../firebase/firestore-administracion.js";

import {
    inicializarAdministracionShows
} from "./sistema-planetario-shows.js";

import {
    inicializarAdministracionContenido
} from "./sistema-planetario-contenido.js";

import {
    observarPerfilViajero,
    pintarAvatar
} from "./identidad-viajero.js";


const elementos = {
    carga: document.getElementById("estado-carga"),
    login: document.getElementById("estado-login"),
    formularioAcceso: document.getElementById("formulario-acceso"),
    accesoCorreo: document.getElementById("acceso-correo"),
    accesoContrasena: document.getElementById("acceso-contrasena"),
    mensajeAcceso: document.getElementById("mensaje-acceso"),
    botonAcceso: document.getElementById("boton-acceso"),
    denegado: document.getElementById("estado-denegado"),
    denegadoTitulo: document.getElementById("denegado-titulo"),
    denegadoMensaje: document.getElementById("denegado-mensaje"),
    denegadoCerrarSesion: document.getElementById("denegado-cerrar-sesion"),
    panel: document.getElementById("panel-administracion"),
    barraLateral: document.getElementById("barra-lateral"),
    abrirMenu: document.getElementById("abrir-menu"),
    cerrarMenuFondo: document.getElementById("cerrar-menu-fondo"),
    navegacion: document.querySelectorAll("[data-vista]"),
    vistas: document.querySelectorAll("[data-seccion]"),
    tituloVista: document.getElementById("titulo-vista"),
    estadoConexion: document.getElementById("estado-conexion"),
    cerrarSesion: document.getElementById("cerrar-sesion"),
    adminAvatar: document.getElementById("admin-avatar"),
    adminAvatarMarca: document.getElementById("admin-avatar-marca"),
    adminNombre: document.getElementById("admin-nombre"),
    adminCorreo: document.getElementById("admin-correo"),
    resumenNombre: document.getElementById("resumen-nombre"),
    resumenLanzamiento: document.getElementById("resumen-lanzamiento"),
    resumenVisibilidad: document.getElementById("resumen-visibilidad"),
    resumenOrigen: document.getElementById("resumen-origen"),
    resumenOrigenDetalle: document.getElementById("resumen-origen-detalle"),
    irLanzamiento: document.querySelector("[data-ir-lanzamiento]"),
    formulario: document.getElementById("formulario-lanzamiento"),
    titulo: document.getElementById("lanzamiento-titulo"),
    descripcion: document.getElementById("lanzamiento-descripcion"),
    fecha: document.getElementById("lanzamiento-fecha"),
    imagen: document.getElementById("lanzamiento-imagen"),
    disponibilidad: document.getElementById("lanzamiento-disponibilidad"),
    spotify: document.getElementById("lanzamiento-spotify"),
    appleMusic: document.getElementById("lanzamiento-apple"),
    visible: document.getElementById("lanzamiento-visible"),
    textoVisibilidad: document.getElementById("texto-visibilidad"),
    contadorDescripcion: document.getElementById("contador-descripcion"),
    mensaje: document.getElementById("mensaje-formulario"),
    guardar: document.getElementById("guardar-lanzamiento"),
    restaurar: document.getElementById("restaurar-valores"),
    previewTitulo: document.getElementById("preview-titulo"),
    previewDescripcion: document.getElementById("preview-descripcion"),
    previewFecha: document.getElementById("preview-fecha"),
    previewImagen: document.getElementById("preview-imagen"),
    previewImagenError: document.getElementById("preview-imagen-error"),
    previewDisponibilidad: document.getElementById("preview-disponibilidad"),
    previewSpotify: document.getElementById("preview-spotify"),
    previewApple: document.getElementById("preview-apple"),
    previewEstado: document.getElementById("preview-estado")
};

const TITULOS_VISTA = {
    resumen: "Resumen del sistema",
    lanzamiento: "Editor de lanzamiento",
    shows: "Administración de Shows",
    noticias: "Administración de Noticias",
    galeria: "Administración de Galería",
    musica: "Administración de Música"
};

document.querySelectorAll("[data-vista-directa]").forEach(boton => boton.addEventListener("click", () => {
    document.querySelector(`[data-vista="${boton.dataset.vistaDirecta}"]`)?.click();
}));

let valoresCargados = null;
let accesoAutorizado = false;
let detenerPerfilAdministrador = () => {};


function mostrarSolo(elemento) {
    [
        elementos.carga,
        elementos.login,
        elementos.denegado,
        elementos.panel
    ].forEach(
        (seccion) => {
            if (seccion) {
                seccion.hidden = seccion !== elemento;
            }
        }
    );

    document.body.classList.remove("sistema--comprobando");
}


function mostrarInicioSesion() {
    accesoAutorizado = false;
    cerrarMenu();
    mostrarSolo(elementos.login);
    elementos.formularioAcceso.reset();
    mostrarMensajeAcceso("");
}


function mostrarAccesoDenegado(tipo, mensaje) {
    accesoAutorizado = false;
    mostrarSolo(elementos.denegado);

    const sinSesion = tipo === "administracion/sin-sesion";
    elementos.denegadoTitulo.textContent = sinSesion
        ? "La sesión no está activa"
        : "No puedes entrar a esta órbita";
    elementos.denegadoMensaje.textContent = mensaje || (
        sinSesion
            ? "Inicia sesión desde el sitio público y vuelve a intentarlo."
            : "Esta zona está reservada para administradores."
    );
    elementos.denegadoCerrarSesion.hidden = sinSesion;
}


function configurarIdentidad(perfil, usuario) {
    const nombre = String(
        perfil.nombre || usuario.displayName || usuario.email || "Administrador"
    );
    elementos.adminNombre.textContent = nombre;
    elementos.adminCorreo.textContent = usuario.email || perfil.correo || "";
    pintarAvatar(elementos.adminAvatar, perfil.foto, nombre);
    pintarAvatar(elementos.adminAvatarMarca, perfil.foto, nombre);
    elementos.resumenNombre.textContent = nombre.split(" ")[0];
}


function cambiarVista(nombre) {
    if (!accesoAutorizado || !TITULOS_VISTA[nombre]) {
        return;
    }

    elementos.vistas.forEach((vista) => {
        const activa = vista.dataset.seccion === nombre;
        vista.hidden = !activa;
        vista.classList.toggle("vista-panel--activa", activa);
    });

    elementos.navegacion.forEach((boton) => {
        const activo = boton.dataset.vista === nombre;
        boton.classList.toggle("navegacion-panel__item--activo", activo);
        boton.setAttribute("aria-current", activo ? "page" : "false");
    });

    elementos.tituloVista.textContent = TITULOS_VISTA[nombre];
    cerrarMenu();
}


function abrirMenu() {
    elementos.barraLateral.classList.add("barra-lateral--abierta");
    elementos.abrirMenu.setAttribute("aria-expanded", "true");
    elementos.cerrarMenuFondo.hidden = false;
}


function cerrarMenu() {
    elementos.barraLateral.classList.remove("barra-lateral--abierta");
    elementos.abrirMenu.setAttribute("aria-expanded", "false");
    elementos.cerrarMenuFondo.hidden = true;
}


function actualizarConexion(tipo, texto) {
    elementos.estadoConexion.classList.remove(
        "conexion--activa",
        "conexion--respaldo",
        "conexion--error"
    );
    elementos.estadoConexion.classList.add(`conexion--${tipo}`);
    elementos.estadoConexion.querySelector("span").textContent = texto;
}


function llenarFormulario(datos) {
    elementos.titulo.value = datos.titulo || "";
    elementos.descripcion.value = datos.descripcion || "";
    elementos.fecha.value = datos.fecha || "";
    elementos.imagen.value = datos.imagen || "";
    elementos.disponibilidad.value = datos.disponibilidad || "";
    elementos.spotify.value = datos.spotify || "";
    elementos.appleMusic.value = datos.appleMusic || "";
    elementos.visible.checked = Boolean(datos.visible);
    actualizarVistaPrevia();
}


function leerFormulario() {
    return {
        titulo: elementos.titulo.value,
        descripcion: elementos.descripcion.value,
        fecha: elementos.fecha.value,
        imagen: elementos.imagen.value,
        disponibilidad: elementos.disponibilidad.value,
        spotify: elementos.spotify.value,
        appleMusic: elementos.appleMusic.value,
        visible: elementos.visible.checked
    };
}


function formatearFecha(fechaTexto) {
    const fecha = new Date(fechaTexto);
    if (Number.isNaN(fecha.getTime())) {
        return "FECHA POR DEFINIR";
    }

    return new Intl.DateTimeFormat("es-MX", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }).format(fecha).replaceAll("/", " · ");
}


function configurarEnlace(elemento, valor) {
    const enlace = String(valor || "").trim();
    if (!enlace) {
        elemento.href = "#";
        elemento.setAttribute("aria-disabled", "true");
        return;
    }
    elemento.href = enlace;
    elemento.removeAttribute("aria-disabled");
}


function actualizarVistaPrevia() {
    const datos = leerFormulario();
    elementos.previewTitulo.textContent = datos.titulo.trim() || "Título del lanzamiento";
    elementos.previewDescripcion.textContent = datos.descripcion.trim() || "Descripción del lanzamiento.";
    elementos.previewFecha.textContent = formatearFecha(datos.fecha);
    elementos.previewDisponibilidad.textContent = datos.disponibilidad.trim() || "DISPONIBILIDAD POR DEFINIR";
    elementos.contadorDescripcion.textContent = String(datos.descripcion.length);

    elementos.textoVisibilidad.textContent = datos.visible ? "Visible" : "Oculto";
    elementos.previewEstado.textContent = datos.visible ? "Visible" : "Oculto";
    elementos.previewEstado.classList.toggle("oculto", !datos.visible);

    configurarEnlace(elementos.previewSpotify, datos.spotify);
    configurarEnlace(elementos.previewApple, datos.appleMusic);

    const imagen = datos.imagen.trim();
    elementos.previewImagenError.hidden = true;
    elementos.previewImagen.hidden = false;
    elementos.previewImagen.alt = `Vista previa de la portada de ${datos.titulo || "el lanzamiento"}`;

    if (imagen) {
        elementos.previewImagen.src = imagen;
    } else {
        elementos.previewImagen.removeAttribute("src");
        elementos.previewImagen.hidden = true;
        elementos.previewImagenError.hidden = false;
    }
}


function actualizarResumen(datos, origen, aviso) {
    elementos.resumenLanzamiento.textContent = datos.titulo || "Sin título";
    elementos.resumenVisibilidad.textContent = datos.visible ? "Visible" : "Oculto";
    elementos.resumenOrigen.textContent = origen === "firestore" ? "Firestore" : "Respaldo local";
    elementos.resumenOrigenDetalle.textContent = aviso;
}


function mostrarMensaje(texto, tipo = "carga") {
    elementos.mensaje.textContent = texto;
    elementos.mensaje.classList.remove(
        "mensaje-formulario--carga",
        "mensaje-formulario--exito",
        "mensaje-formulario--error"
    );
    elementos.mensaje.classList.add(`mensaje-formulario--${tipo}`);
}


function activarGuardado(activo) {
    elementos.guardar.disabled = activo;
    elementos.restaurar.disabled = activo;
    elementos.guardar.classList.toggle("boton--cargando", activo);
    elementos.guardar.querySelector(".boton__texto").textContent = activo
        ? "Guardando…"
        : "Guardar en Firestore";
}


async function cargarLanzamiento() {
    mostrarMensaje("Cargando la configuración del lanzamiento…", "carga");

    const resultado = await obtenerProximoLanzamiento();
    valoresCargados = { ...resultado.datos };
    llenarFormulario(valoresCargados);
    actualizarResumen(resultado.datos, resultado.origen, resultado.aviso);

    if (resultado.origen === "firestore") {
        actualizarConexion("activa", "Firebase conectado");
        mostrarMensaje("Configuración cargada desde Firestore.", "exito");
    } else {
        actualizarConexion("respaldo", "Usando respaldo local");
        mostrarMensaje(resultado.aviso, "carga");
    }
}


async function guardarLanzamiento(evento) {
    evento.preventDefault();

    if (!elementos.formulario.checkValidity()) {
        elementos.formulario.reportValidity();
        mostrarMensaje("Revisa los campos obligatorios antes de guardar.", "error");
        return;
    }

    activarGuardado(true);
    mostrarMensaje("Verificando permisos y guardando en Firestore…", "carga");

    try {
        const guardado = await guardarProximoLanzamiento({
            ...leerFormulario(),
            hiloComentariosId: valoresCargados?.hiloComentariosId
        });
        valoresCargados = { ...guardado };
        llenarFormulario(valoresCargados);
        actualizarResumen(
            guardado,
            "firestore",
            "Última configuración guardada correctamente."
        );
        actualizarConexion("activa", "Firebase conectado");
        mostrarMensaje("El próximo lanzamiento se guardó correctamente.", "exito");
    } catch (error) {
        console.error("No se pudo guardar el próximo lanzamiento:", error);
        actualizarConexion("error", "Error de guardado");
        mostrarMensaje(
            error?.message || "No pudimos guardar los cambios.",
            "error"
        );

        if ([
            "administracion/sin-sesion",
            "administracion/acceso-denegado"
        ].includes(error?.code)) {
            mostrarAccesoDenegado(error.code, error.message);
        }
    } finally {
        activarGuardado(false);
    }
}


async function cerrarSesion() {
    accesoAutorizado = false;
    cerrarMenu();
    elementos.panel.hidden = true;
    document.body.classList.add("sistema--comprobando");

    try {
        await signOut(auth);
    } catch (error) {
        console.error("No se pudo cerrar la sesión:", error);
        mostrarAccesoDenegado(
            "administracion/error-sesion",
            "No pudimos cerrar la sesión. Inténtalo nuevamente."
        );
    }
}


function mostrarMensajeAcceso(texto, tipo = "error") {
    elementos.mensajeAcceso.textContent = texto;
    elementos.mensajeAcceso.classList.remove(
        "mensaje-formulario--carga",
        "mensaje-formulario--exito",
        "mensaje-formulario--error"
    );

    if (texto) {
        elementos.mensajeAcceso.classList.add(`mensaje-formulario--${tipo}`);
    }
}


function activarInicioSesion(activo) {
    elementos.botonAcceso.disabled = activo;
    elementos.botonAcceso.classList.toggle("boton--cargando", activo);
    elementos.botonAcceso.querySelector(".boton__texto").textContent = activo
        ? "Comprobando…"
        : "Entrar al sistema";
}


async function iniciarSesion(evento) {
    evento.preventDefault();

    if (!elementos.formularioAcceso.checkValidity()) {
        elementos.formularioAcceso.reportValidity();
        mostrarMensajeAcceso("Escribe un correo y una contraseña válidos.");
        return;
    }

    activarInicioSesion(true);
    mostrarMensajeAcceso("Comprobando tus coordenadas…", "carga");

    try {
        await signInWithEmailAndPassword(
            auth,
            elementos.accesoCorreo.value.trim(),
            elementos.accesoContrasena.value
        );
    } catch (error) {
        console.warn("No se pudo iniciar la sesión administrativa:", error);
        const mensaje = error?.code === "auth/network-request-failed"
            ? "No pudimos conectar con Firebase. Revisa tu conexión."
            : "El correo o la contraseña no son correctos.";
        mostrarMensajeAcceso(mensaje);
        activarInicioSesion(false);
    }
}


function registrarEventos() {
    elementos.navegacion.forEach((boton) => {
        boton.addEventListener("click", () => cambiarVista(boton.dataset.vista));
    });
    elementos.irLanzamiento.addEventListener("click", () => cambiarVista("lanzamiento"));
    elementos.abrirMenu.addEventListener("click", () => {
        const abierto = elementos.abrirMenu.getAttribute("aria-expanded") === "true";
        abierto ? cerrarMenu() : abrirMenu();
    });
    elementos.cerrarMenuFondo.addEventListener("click", cerrarMenu);
    elementos.cerrarSesion.addEventListener("click", cerrarSesion);
    elementos.denegadoCerrarSesion.addEventListener("click", cerrarSesion);
    elementos.formularioAcceso.addEventListener("submit", iniciarSesion);
    elementos.formulario.addEventListener("submit", guardarLanzamiento);
    elementos.formulario.addEventListener("input", actualizarVistaPrevia);
    elementos.formulario.addEventListener("change", actualizarVistaPrevia);
    elementos.restaurar.addEventListener("click", () => {
        if (valoresCargados) {
            llenarFormulario(valoresCargados);
            mostrarMensaje("Se restauraron los últimos valores cargados.", "carga");
        }
    });
    elementos.previewImagen.addEventListener("error", () => {
        elementos.previewImagen.hidden = true;
        elementos.previewImagenError.hidden = false;
    });
    elementos.previewImagen.addEventListener("load", () => {
        elementos.previewImagen.hidden = false;
        elementos.previewImagenError.hidden = true;
    });
    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape") {
            cerrarMenu();
        }
    });
}


registrarEventos();

onAuthStateChanged(auth, async (usuario) => {
    detenerPerfilAdministrador();
    detenerPerfilAdministrador = () => {};
    if (!usuario) {
        activarInicioSesion(false);
        mostrarInicioSesion();
        return;
    }

    try {
        document.body.classList.add("sistema--comprobando");
        elementos.login.hidden = true;
        const perfil = await verificarAdministrador(usuario);
        accesoAutorizado = true;
        configurarIdentidad(perfil, usuario);
        detenerPerfilAdministrador = observarPerfilViajero(
            usuario.uid,
            perfilActualizado => {
                if (perfilActualizado) configurarIdentidad(perfilActualizado, usuario);
            }
        );
        mostrarSolo(elementos.panel);
        const vistaSolicitada = new URLSearchParams(location.search).get("vista");
        cambiarVista(TITULOS_VISTA[vistaSolicitada] ? vistaSolicitada : "resumen");
        await cargarLanzamiento();
        await inicializarAdministracionShows();
        await inicializarAdministracionContenido();
        const idSolicitado = new URLSearchParams(location.search).get("id");
        if (idSolicitado && vistaSolicitada === "shows") {
            Array.from(document.querySelectorAll("#lista-shows [data-accion-show='editar']")).find(boton => boton.dataset.showId === idSolicitado)?.click();
        } else if (idSolicitado && ["noticias", "galeria", "musica"].includes(vistaSolicitada)) {
            Array.from(document.querySelectorAll(`#lista-${vistaSolicitada} [data-id]`)).find(fila => fila.dataset.id === idSolicitado)?.querySelector("[data-accion='editar']")?.click();
        }
    } catch (error) {
        console.warn("Acceso administrativo rechazado:", error);
        mostrarAccesoDenegado(error?.code, error?.message);
    }
});
