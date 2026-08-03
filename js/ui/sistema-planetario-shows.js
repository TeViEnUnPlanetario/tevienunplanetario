// ==================================================
// INTERFAZ ADMINISTRATIVA — PRESENTACIONES
// ==================================================

import {
    actualizarPresentacion,
    cambiarVisibilidadPresentacion,
    crearPresentacion,
    eliminarPresentacion,
    importarPresentacionesIniciales,
    listarPresentacionesAdministracion
} from "../firebase/firestore-presentaciones.js";

import {
    eliminarCartelPresentacion,
    subirCartelPresentacion,
    validarArchivoCartel
} from "../firebase/storage-presentaciones.js";
import { confirmarAccion } from "./confirmacion.js";


const elementos = {
    vista: document.getElementById("vista-shows"),
    lista: document.getElementById("lista-shows"),
    mensaje: document.getElementById("mensaje-shows"),
    crear: document.getElementById("crear-show"),
    migracion: document.getElementById("migracion-shows"),
    importar: document.getElementById("importar-shows"),
    editor: document.getElementById("editor-show"),
    formulario: document.getElementById("formulario-show"),
    editorTitulo: document.getElementById("show-editor-titulo"),
    id: document.getElementById("show-id"),
    nombre: document.getElementById("show-nombre"),
    fecha: document.getElementById("show-fecha"),
    descripcion: document.getElementById("show-descripcion"),
    descripcionContador: document.getElementById("show-descripcion-contador"),
    archivo: document.getElementById("show-archivo"),
    imagen: document.getElementById("show-imagen"),
    imagenAlt: document.getElementById("show-imagen-alt"),
    boletos: document.getElementById("show-boletos"),
    visible: document.getElementById("show-visible"),
    visibleTexto: document.getElementById("show-visible-texto"),
    mensajeEditor: document.getElementById("mensaje-show-editor"),
    guardar: document.getElementById("guardar-show"),
    cancelar: document.getElementById("cancelar-show"),
    previewEstado: document.getElementById("show-preview-estado"),
    previewImagen: document.getElementById("show-preview-imagen"),
    previewFecha: document.getElementById("show-preview-fecha"),
    previewNombre: document.getElementById("show-preview-nombre"),
    previewDescripcion: document.getElementById("show-preview-descripcion"),
    previewBoletos: document.getElementById("show-preview-boletos")
};

const IMAGEN_RESPALDO = "img/shows/cdneza.jpg";
let presentaciones = [];
let inicializado = false;
let urlTemporal = "";


function mostrarMensaje(elemento, texto, tipo = "carga") {
    elemento.textContent = texto;
    elemento.classList.remove(
        "mensaje-formulario--carga",
        "mensaje-formulario--exito",
        "mensaje-formulario--error"
    );

    if (texto) {
        elemento.classList.add(`mensaje-formulario--${tipo}`);
    }
}


function fechaPublica(fechaTexto) {
    const fecha = new Date(fechaTexto);
    if (Number.isNaN(fecha.getTime())) {
        return "Fecha por confirmar";
    }

    const dia = new Intl.DateTimeFormat("es-MX", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
    }).format(fecha);
    const hora = new Intl.DateTimeFormat("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    }).format(fecha);

    return `${dia.charAt(0).toUpperCase()}${dia.slice(1)} - ${hora} hrs.`;
}


function imagenLista(show) {
    return show.imagen || IMAGEN_RESPALDO;
}


function limpiarUrlTemporal() {
    if (urlTemporal) {
        URL.revokeObjectURL(urlTemporal);
        urlTemporal = "";
    }
}


function actualizarPreview() {
    const visible = elementos.visible.checked;
    elementos.visibleTexto.textContent = visible ? "Visible" : "Oculto";
    elementos.previewEstado.textContent = visible ? "Visible" : "Oculto";
    elementos.previewEstado.classList.toggle("oculto", !visible);
    elementos.previewNombre.textContent = elementos.nombre.value.trim()
        || "Nombre o ciudad";
    elementos.previewFecha.textContent = fechaPublica(elementos.fecha.value);
    elementos.previewDescripcion.textContent = elementos.descripcion.value.trim()
        || "Descripción de la presentación.";
    elementos.descripcionContador.textContent = String(
        elementos.descripcion.value.length
    );

    const archivo = elementos.archivo.files?.[0];
    if (archivo) {
        limpiarUrlTemporal();
        urlTemporal = URL.createObjectURL(archivo);
        elementos.previewImagen.src = urlTemporal;
    } else {
        elementos.previewImagen.src = elementos.imagen.value.trim()
            || IMAGEN_RESPALDO;
    }

    elementos.previewImagen.alt = elementos.imagenAlt.value.trim()
        || "Vista previa del cartel";

    const boletos = elementos.boletos.value.trim();
    elementos.previewBoletos.hidden = !boletos;
    elementos.previewBoletos.href = boletos || "#";
}


function datosFormulario(imagen, ruta) {
    return {
        nombre: elementos.nombre.value,
        fecha: elementos.fecha.value,
        descripcion: elementos.descripcion.value,
        imagen,
        imagenAlt: elementos.imagenAlt.value,
        boletos: elementos.boletos.value,
        imagenStorageRuta: ruta,
        visible: elementos.visible.checked
    };
}


function abrirEditor(show = null) {
    elementos.formulario.reset();
    limpiarUrlTemporal();
    mostrarMensaje(elementos.mensajeEditor, "");

    elementos.id.value = show?.id || "";
    elementos.nombre.value = show?.nombre || "";
    elementos.fecha.value = show?.fecha || "";
    elementos.descripcion.value = show?.descripcion || "";
    elementos.imagen.value = show?.imagen || "";
    elementos.imagenAlt.value = show?.imagenAlt || "";
    elementos.boletos.value = show?.boletos || "";
    elementos.visible.checked = show ? show.visible : true;
    elementos.editorTitulo.textContent = show
        ? "Editar presentación"
        : "Nueva presentación";
    elementos.editor.hidden = false;
    actualizarPreview();
    elementos.nombre.focus();
    elementos.editor.scrollIntoView({ behavior: "smooth", block: "start" });
}


function cerrarEditor() {
    elementos.editor.hidden = true;
    elementos.formulario.reset();
    limpiarUrlTemporal();
    mostrarMensaje(elementos.mensajeEditor, "");
}


function crearBoton(texto, accion, id, clase = "") {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.textContent = texto;
    boton.dataset.accionShow = accion;
    boton.dataset.showId = id;
    if (clase) {
        boton.classList.add(clase);
    }
    return boton;
}


function renderizarLista() {
    elementos.lista.replaceChildren();

    if (presentaciones.length === 0) {
        const vacio = document.createElement("p");
        vacio.className = "shows-panel__vacio";
        vacio.textContent = "Todavía no hay presentaciones guardadas.";
        elementos.lista.appendChild(vacio);
        return;
    }

    presentaciones.forEach((show) => {
        const fila = document.createElement("article");
        fila.className = "show-fila";
        fila.dataset.showId = show.id;

        const imagen = document.createElement("img");
        imagen.className = "show-fila__imagen";
        imagen.src = imagenLista(show);
        imagen.alt = show.imagenAlt || "";
        imagen.addEventListener("error", () => {
            imagen.src = IMAGEN_RESPALDO;
        }, { once: true });

        const contenido = document.createElement("div");
        contenido.className = "show-fila__contenido";
        const nombre = document.createElement("strong");
        nombre.textContent = show.nombre;
        const fecha = document.createElement("span");
        fecha.textContent = fechaPublica(show.fecha);
        const estado = document.createElement("span");
        estado.className = `show-fila__estado${
            show.visible ? "" : " show-fila__estado--oculto"
        }`;
        estado.textContent = show.visible ? "Visible" : "Oculto";
        contenido.append(nombre, fecha, estado);

        const acciones = document.createElement("div");
        acciones.className = "show-fila__acciones";
        const acceso = document.createElement("a"); acceso.href = "index.html#shows"; acceso.target = "_blank"; acceso.rel = "noopener"; acceso.textContent = "Abrir"; acciones.append(acceso);
        const visibilidad = crearBoton("", "visibilidad", show.id); visibilidad.classList.add("accion-interruptor"); visibilidad.setAttribute("role", "switch"); visibilidad.setAttribute("aria-checked", String(show.visible)); visibilidad.setAttribute("aria-label", show.visible ? "Ocultar" : "Mostrar"); visibilidad.title = visibilidad.getAttribute("aria-label");
        acciones.append(
            crearBoton("Editar", "editar", show.id),
            visibilidad,
            crearBoton("Eliminar", "eliminar", show.id, "show-accion--eliminar")
        );

        fila.append(imagen, contenido, acciones);
        elementos.lista.appendChild(fila);
    });
}


async function cargarPresentaciones() {
    mostrarMensaje(elementos.mensaje, "Cargando presentaciones…", "carga");

    try {
        presentaciones = await listarPresentacionesAdministracion();
        renderizarLista();
        elementos.migracion.hidden = presentaciones.length !== 0;
        mostrarMensaje(
            elementos.mensaje,
            presentaciones.length
                ? `${presentaciones.length} presentación(es) ordenadas por fecha.`
                : "No hay presentaciones guardadas.",
            "exito"
        );
    } catch (error) {
        elementos.migracion.hidden = true;
        console.error("No se pudieron cargar las presentaciones:", error);
        mostrarMensaje(
            elementos.mensaje,
            error?.message || "No pudimos cargar las presentaciones.",
            "error"
        );
    }
}


async function importarShowsActuales() {
    const confirmado = await confirmarAccion({ titulo: "Importar presentaciones", mensaje: "Se copiarán las presentaciones actuales a Firestore.", aceptar: "Importar" });

    if (!confirmado) {
        return;
    }

    elementos.importar.disabled = true;
    mostrarMensaje(
        elementos.mensaje,
        "Importando las presentaciones actuales…",
        "carga"
    );

    try {
        const importadas = await importarPresentacionesIniciales();
        await cargarPresentaciones();
        elementos.migracion.hidden = true;
        mostrarMensaje(
            elementos.mensaje,
            importadas > 0
                ? "Las presentaciones actuales se importaron correctamente."
                : "Las presentaciones ya existían; no se crearon duplicados.",
            "exito"
        );
    } catch (error) {
        console.error("No se pudieron importar las presentaciones:", error);
        mostrarMensaje(
            elementos.mensaje,
            error?.message || "No pudimos importar las presentaciones.",
            "error"
        );
    } finally {
        elementos.importar.disabled = false;
    }
}


function activarGuardado(activo) {
    elementos.guardar.disabled = activo;
    elementos.cancelar.disabled = activo;
    elementos.guardar.classList.toggle("boton--cargando", activo);
    elementos.guardar.querySelector(".boton__texto").textContent = activo
        ? "Guardando…"
        : "Guardar presentación";
}


async function guardarShow(evento) {
    evento.preventDefault();

    if (!elementos.formulario.checkValidity()) {
        elementos.formulario.reportValidity();
        mostrarMensaje(
            elementos.mensajeEditor,
            "Revisa los campos obligatorios.",
            "error"
        );
        return;
    }

    const archivo = elementos.archivo.files?.[0] || null;
    if (archivo) {
        try {
            validarArchivoCartel(archivo);
        } catch (error) {
            mostrarMensaje(elementos.mensajeEditor, error.message, "error");
            return;
        }
    }

    activarGuardado(true);
    mostrarMensaje(
        elementos.mensajeEditor,
        archivo ? "Subiendo cartel y guardando…" : "Guardando presentación…",
        "carga"
    );

    const id = elementos.id.value;
    const anterior = presentaciones.find((show) => show.id === id) || null;
    let imagen = elementos.imagen.value.trim();
    let ruta = anterior?.imagenStorageRuta || "";
    let nuevaSubida = null;
    let avisoStorage = "";

    try {
        if (archivo) {
            try {
                nuevaSubida = await subirCartelPresentacion(archivo);
                imagen = nuevaSubida.url;
                ruta = nuevaSubida.ruta;
            } catch (error) {
                if (!imagen) {
                    throw error;
                }
                avisoStorage = " El archivo no se subió; se conservó la URL o ruta indicada.";
            }
        } else if (anterior?.imagenStorageRuta && imagen !== anterior.imagen) {
            ruta = "";
        }

        const datos = datosFormulario(imagen, ruta);

        if (id) {
            await actualizarPresentacion(id, datos);
        } else {
            await crearPresentacion(datos);
        }

        if (
            anterior?.imagenStorageRuta
            && anterior.imagenStorageRuta !== ruta
        ) {
            eliminarCartelPresentacion(anterior.imagenStorageRuta)
                .catch((error) => console.warn(
                    "No se pudo retirar el cartel anterior:",
                    error
                ));
        }

        cerrarEditor();
        await cargarPresentaciones();
        mostrarMensaje(
            elementos.mensaje,
            `La presentación se guardó correctamente.${avisoStorage}`,
            "exito"
        );
    } catch (error) {
        if (nuevaSubida?.ruta) {
            eliminarCartelPresentacion(nuevaSubida.ruta).catch(() => {});
        }
        console.error("No se pudo guardar la presentación:", error);
        mostrarMensaje(
            elementos.mensajeEditor,
            error?.message || "No pudimos guardar la presentación.",
            "error"
        );
    } finally {
        activarGuardado(false);
    }
}


async function manejarAccionLista(evento) {
    const boton = evento.target.closest("[data-accion-show]");
    if (!boton) {
        return;
    }

    const show = presentaciones.find(
        (presentacion) => presentacion.id === boton.dataset.showId
    );
    if (!show) {
        return;
    }

    const accion = boton.dataset.accionShow;
    if (accion === "editar") {
        abrirEditor(show);
        return;
    }

    boton.disabled = true;

    try {
        if (accion === "visibilidad") {
            if (!await confirmarAccion({ titulo: show.visible ? "Ocultar presentación" : "Mostrar presentación", mensaje: show.visible ? `“${show.nombre}” dejará de aparecer en la agenda pública.` : `“${show.nombre}” volverá a aparecer en la agenda pública.`, aceptar: show.visible ? "Ocultar" : "Mostrar" })) { boton.disabled = false; return; }
            await cambiarVisibilidadPresentacion(show.id, !show.visible);
            await cargarPresentaciones();
            mostrarMensaje(
                elementos.mensaje,
                `La presentación ahora está ${show.visible ? "oculta" : "visible"}.`,
                "exito"
            );
        }

        if (accion === "eliminar") {
            const confirmado = await confirmarAccion({ titulo: "Eliminar presentación", mensaje: `Se eliminará definitivamente la presentación “${show.nombre}”.`, aceptar: "Eliminar" });

            if (!confirmado) {
                boton.disabled = false;
                return;
            }

            await eliminarPresentacion(show.id);
            if (show.imagenStorageRuta) {
                await eliminarCartelPresentacion(show.imagenStorageRuta)
                    .catch((error) => console.warn(
                        "La presentación se eliminó, pero el cartel no pudo retirarse:",
                        error
                    ));
            }
            await cargarPresentaciones();
            mostrarMensaje(
                elementos.mensaje,
                "La presentación se eliminó correctamente.",
                "exito"
            );
        }
    } catch (error) {
        console.error("No se pudo completar la acción del show:", error);
        mostrarMensaje(
            elementos.mensaje,
            error?.message || "No pudimos completar la acción.",
            "error"
        );
        boton.disabled = false;
    }
}


function seleccionarArchivo() {
    const archivo = elementos.archivo.files?.[0];
    if (archivo) {
        try {
            validarArchivoCartel(archivo);
            mostrarMensaje(elementos.mensajeEditor, "Cartel listo para vista previa.", "exito");
        } catch (error) {
            elementos.archivo.value = "";
            mostrarMensaje(elementos.mensajeEditor, error.message, "error");
        }
    }
    actualizarPreview();
}


async function inicializarAdministracionShows() {
    if (inicializado || !elementos.vista) {
        return;
    }

    inicializado = true;
    elementos.crear.addEventListener("click", () => abrirEditor());
    elementos.importar.addEventListener("click", importarShowsActuales);
    elementos.cancelar.addEventListener("click", cerrarEditor);
    elementos.formulario.addEventListener("submit", guardarShow);
    elementos.formulario.addEventListener("input", actualizarPreview);
    elementos.formulario.addEventListener("change", actualizarPreview);
    elementos.archivo.addEventListener("change", seleccionarArchivo);
    elementos.lista.addEventListener("click", manejarAccionLista);
    elementos.previewImagen.addEventListener("error", () => {
        elementos.previewImagen.src = IMAGEN_RESPALDO;
    });

    await cargarPresentaciones();
}


export {
    inicializarAdministracionShows
};
