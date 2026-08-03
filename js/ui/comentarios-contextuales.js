import { auth, db } from "../firebase/firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {
    LIMITE_TEXTO,
    alternarEstrellaComentario,
    contarComentarios,
    contarEstrellasComentario,
    contarRespuestas,
    crearComentario,
    crearRespuesta,
    editarComentario,
    eliminarComentario,
    eliminarRespuesta,
    listarComentarios,
    listarRespuestas,
    ocultarComentario,
    ocultarRespuesta,
    tieneEstrellaComentario
} from "../firebase/firestore-comentarios-contextuales.js?v=3";
import {
    alternarEstrella,
    contarEstrellas,
    tieneEstrellaActual
} from "../firebase/firestore-estrellas-contextuales.js";
import { conectarModeracion } from "./moderacion.js";
import { confirmarAccion } from "./confirmacion.js";
import {
    conectarIdentidadViajero,
    crearAccionesViajero,
    observarPerfilViajero
} from "./identidad-viajero.js";

const componentes = new Set();
const LIMITE_ECOS_VISIBLES = 3;
let perfilActual = null;

function elemento(etiqueta, clase, texto = "") {
    const nodo = document.createElement(etiqueta);
    if (clase) nodo.className = clase;
    nodo.textContent = texto;
    return nodo;
}

function iniciales(nombre) {
    return String(nombre || "Viajero").split(/\s+/).filter(Boolean)
        .slice(0, 2).map((parte) => parte.charAt(0).toUpperCase()).join("") || "V";
}

function fechaTexto(fecha) {
    return new Intl.DateTimeFormat("es-MX", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(fecha);
}

function abrirInicioSesion() {
    document.getElementById("abrir-portal")?.click();
}

function enlaceCompartir(contexto) {
    const anclas = {
        presentacion: "shows",
        noticia: "noticias",
        lanzamiento: "nuevo-lanzamiento"
    };
    const url = new URL(window.location.href);
    url.hash = anclas[contexto.tipo] || "inicio";
    return url.href;
}

function crearAvatar(comentario) {
    const avatar = elemento("span", "comentario-contextual__avatar");
    if (comentario.autorFoto) {
        const imagen = document.createElement("img");
        imagen.src = comentario.autorFoto;
        imagen.alt = `Avatar de ${comentario.autorNombre}`;
        imagen.addEventListener("error", () => {
            avatar.replaceChildren();
            avatar.textContent = iniciales(comentario.autorNombre);
        }, { once: true });
        avatar.appendChild(imagen);
    } else {
        avatar.textContent = iniciales(comentario.autorNombre);
    }
    return avatar;
}

function aplicarRangoAutor(comentario, rango, articulo, avatar, nombre) {
    conectarIdentidadViajero({
        uid: comentario.autorId,
        avatar,
        nombre,
        rango,
        respaldo: {
            nombre: comentario.autorNombre,
            foto: comentario.autorFoto,
            rango: "\u{1F6F8} Viajero"
        }
    });
    observarPerfilViajero(comentario.autorId, perfil => {
        const rol = String(perfil?.rol || "").trim().toLowerCase();
        const administrativo = rol === "sistema-planetario" || rol === "administrador";
        articulo.classList.toggle("comentario-contextual--administrativo", administrativo);
        articulo.dataset.rol = administrativo ? rol : "viajero";
        rango.textContent = rol === "sistema-planetario"
            ? "Sistema Planetario"
            : rol === "administrador" ? "Administrador" : (perfil?.rango || "\u{1F6F8} Viajero");
    });
}

function crearComponente(contenedor, contexto) {
    const raiz = elemento("section", "comentarios-contextuales");
    const accionesPrincipales = elemento("div", "comentarios-contextuales__acciones-principales");
    const boton = elemento("button", "comentarios-contextuales__alternar", "Ecos (…)");
    boton.type = "button";
    boton.setAttribute("aria-expanded", "false");
    const estrella = elemento("button", "comentarios-contextuales__estrella", "Estrellas (…)");
    estrella.type = "button";
    estrella.setAttribute("aria-pressed", "false");
    const compartir = elemento("button", "comentarios-contextuales__compartir", "Compartir");
    compartir.type = "button";
    accionesPrincipales.append(boton, estrella, compartir);
    const estadoReacciones = elemento("p", "comentarios-contextuales__estado-reacciones");
    estadoReacciones.hidden = true;

    const panel = elemento("div", "comentarios-contextuales__panel");
    panel.hidden = true;
    const estado = elemento("p", "comentarios-contextuales__estado");
    const lista = elemento("div", "comentarios-contextuales__lista");
    const verTodos = elemento("button", "comentarios-contextuales__ver-todos", "Ver todos los Ecos");
    verTodos.type = "button";
    verTodos.hidden = true;
    const cargarMas = elemento("button", "comentarios-contextuales__mas", "Cargar más");
    cargarMas.type = "button";
    cargarMas.hidden = true;
    const acceso = elemento("button", "comentarios-contextuales__acceso", "Inicia sesión para dejar un eco");
    acceso.type = "button";
    acceso.hidden = true;

    const formulario = document.createElement("form");
    formulario.className = "comentarios-contextuales__formulario";
    formulario.hidden = true;
    const textarea = document.createElement("textarea");
    textarea.maxLength = LIMITE_TEXTO;
    textarea.rows = 3;
    textarea.placeholder = "Escribe un eco…";
    textarea.setAttribute("aria-label", "Eco");
    const pie = elemento("div", "comentarios-contextuales__formulario-pie");
    const contador = elemento("span", "", `0/${LIMITE_TEXTO}`);
    const enviar = elemento("button", "", "Publicar");
    enviar.type = "submit";
    enviar.disabled = true;
    pie.append(contador, enviar);
    formulario.append(textarea, pie);

    panel.append(estado, lista, verTodos, cargarMas, acceso, formulario);
    raiz.append(accionesPrincipales, estadoReacciones, panel);
    contenedor.appendChild(raiz);

    const componente = {
        contexto, boton, panel, estado, lista, verTodos, cargarMas, acceso,
        formulario, textarea, contador, enviar, estrella, compartir, estadoReacciones, cursor: null,
        abierto: false, cargado: false, cargando: false, total: null,
        totalEstrellas: null, estrellaActiva: false, actualizandoEstrella: false,
        mostrarTodos: false
    };
    componentes.add(componente);

    function actualizarSesion() {
        const conectado = Boolean(auth.currentUser);
        formulario.hidden = !conectado;
        acceso.hidden = conectado;
        actualizarEstadoEstrella();
        if (componente.cargado && componente.abierto) {
            cargar(true);
        }
    }

    function actualizarContador(delta = 0) {
        if (typeof componente.total === "number") componente.total += delta;
        boton.textContent = `Ecos (${componente.total ?? "…"})`;
        actualizarVisibilidadComentarios();
    }

    function actualizarVisibilidadComentarios() {
        const comentarios = [...lista.children];
        comentarios.forEach((comentario, indice) => {
            comentario.hidden = !componente.mostrarTodos && indice >= LIMITE_ECOS_VISIBLES;
        });
        const total = typeof componente.total === "number" ? componente.total : comentarios.length;
        verTodos.hidden = total <= LIMITE_ECOS_VISIBLES;
        verTodos.textContent = componente.mostrarTodos
            ? "Mostrar solo los 3 Ecos más recientes"
            : `\u2726 Ver todos los Ecos (${total})`;
        verTodos.setAttribute("aria-expanded", String(componente.mostrarTodos));
    }

    function pintarEstrella() {
        estrella.textContent = `Estrellas (${componente.totalEstrellas ?? "…"})`;
        estrella.classList.toggle("activa", componente.estrellaActiva);
        estrella.setAttribute("aria-pressed", String(componente.estrellaActiva));
        estrella.title = componente.estrellaActiva
            ? "Retirar tu estrella"
            : "Entregar una estrella";
    }

    function mostrarEstadoReacciones(mensaje = "", esError = false) {
        estadoReacciones.textContent = mensaje;
        estadoReacciones.hidden = !mensaje;
        estadoReacciones.classList.toggle("es-error", esError);
    }

    async function actualizarEstadoEstrella() {
        try {
            const [total, activa] = await Promise.all([
                contarEstrellas(contexto),
                tieneEstrellaActual(contexto)
            ]);
            componente.totalEstrellas = total;
            componente.estrellaActiva = activa;
        } catch (error) {
            console.error("No fue posible consultar las estrellas:", error);
            componente.totalEstrellas = 0;
            componente.estrellaActiva = false;
            mostrarEstadoReacciones(
                "Las estrellas necesitan que se publiquen las reglas actualizadas de Firestore.",
                true
            );
        }
        pintarEstrella();
    }

    function accionesComentario(comentario, articulo, texto) {
        const propias = auth.currentUser?.uid === comentario.autorId;
        if (!propias) return;

        const acciones = elemento("div", "comentario-contextual__acciones");
        if (propias) {
            const editar = elemento("button", "", "Editar");
            editar.type = "button";
            editar.addEventListener("click", () => {
                const editor = document.createElement("textarea");
                editor.maxLength = LIMITE_TEXTO;
                editor.value = comentario.texto;
                const guardar = elemento("button", "", "Guardar edición");
                guardar.type = "button";
                const cancelar = elemento("button", "", "Cancelar");
                cancelar.type = "button";
                acciones.replaceChildren(editor, guardar, cancelar);
                guardar.addEventListener("click", async () => {
                    try {
                        await editarComentario(contexto, comentario.id, editor.value);
                        comentario.texto = editor.value.trim();
                        texto.textContent = comentario.texto;
                        acciones.replaceChildren();
                        accionesComentario(comentario, articulo, texto);
                    } catch (error) { estado.textContent = error.message; }
                });
                cancelar.addEventListener("click", () => {
                    acciones.replaceChildren();
                    accionesComentario(comentario, articulo, texto);
                });
            });
            acciones.appendChild(editar);
        }

        const eliminar = elemento("button", "", "Eliminar");
        eliminar.type = "button";
        eliminar.addEventListener("click", async () => {
            if (!await confirmarAccion({ titulo: "Eliminar comentario", mensaje: "El comentario y sus respuestas dejarán de estar disponibles. Esta acción no se puede deshacer.", aceptar: "Eliminar" })) return;
            try {
                await eliminarComentario(contexto, comentario.id);
                articulo.remove();
                actualizarContador(-1);
            } catch (error) { estado.textContent = error.message; }
        });
        acciones.appendChild(eliminar);
        articulo.appendChild(acciones);
    }

    function agregarComentario(comentario) {
        const articulo = elemento("article", "comentario-contextual");
        const avatar = crearAvatar(comentario);
        articulo.appendChild(avatar);
        const cuerpo = elemento("div", "comentario-contextual__cuerpo");
        const cabecera = elemento("div", "comentario-contextual__cabecera");
        const identidad = elemento("div", "comentario-contextual__identidad");
        const rango = elemento("span", "comentario-contextual__rango", "\u{1F6F8} Viajero");
        const nombre = elemento("strong", "", comentario.autorNombre);
        identidad.append(nombre, rango, crearAccionesViajero(comentario.autorId));
        cabecera.append(
            identidad,
            elemento("time", "", fechaTexto(comentario.creadoEn))
        );
        const texto = elemento("p", "comentario-contextual__texto", comentario.texto);
        cuerpo.append(cabecera, texto);
        articulo.appendChild(cuerpo);
        accionesComentario(comentario, articulo, texto);
        crearInteraccionesEco(comentario, articulo);
        lista.appendChild(articulo);
        aplicarRangoAutor(comentario, rango, articulo, avatar, nombre);
        conectarModeracion({
            contenedor: articulo,
            oculto: comentario.oculta,
            alOcultar: valor => ocultarComentario(contexto, comentario.id, valor),
            alEliminar: () => eliminarComentario(contexto, comentario.id)
        });
    }

    function crearInteraccionesEco(comentario, articulo) {
        const interacciones = elemento("div", "comentario-contextual__interacciones");
        const estrellaEco = elemento("button", "comentario-contextual__estrella", "☆ Estrellas (…)");
        estrellaEco.type = "button";
        estrellaEco.setAttribute("aria-pressed", "false");
        const responder = elemento("button", "comentario-contextual__responder", "↳ Responder");
        responder.type = "button";
        const mostrarRespuestas = elemento(
            "button",
            "comentario-contextual__mostrar-respuestas",
            "Mostrar respuestas (…)"
        );
        mostrarRespuestas.type = "button";
        mostrarRespuestas.setAttribute("aria-expanded", "false");
        interacciones.append(estrellaEco, responder, mostrarRespuestas);

        const hilo = elemento("section", "comentario-contextual__hilo");
        hilo.hidden = true;
        const listaRespuestas = elemento("div", "comentario-contextual__respuestas");
        const estadoHilo = elemento("p", "comentario-contextual__hilo-estado");
        const mostrarMas = elemento("button", "comentario-contextual__mostrar-mas");
        mostrarMas.type = "button";
        mostrarMas.hidden = true;
        const grupoRespuestas = elemento("div", "comentario-contextual__grupo-respuestas");
        grupoRespuestas.hidden = true;
        grupoRespuestas.append(estadoHilo, listaRespuestas, mostrarMas);
        const formularioRespuesta = document.createElement("form");
        formularioRespuesta.className = "comentario-contextual__form-respuesta";
        formularioRespuesta.hidden = true;
        const campoRespuesta = document.createElement("textarea");
        campoRespuesta.maxLength = LIMITE_TEXTO;
        campoRespuesta.rows = 2;
        campoRespuesta.placeholder = "Escribe un Eco en este hilo…";
        const enviarRespuesta = elemento("button", "", "Responder");
        enviarRespuesta.type = "submit";
        enviarRespuesta.disabled = true;
        formularioRespuesta.append(campoRespuesta, enviarRespuesta);
        hilo.append(grupoRespuestas, formularioRespuesta);
        articulo.append(interacciones, hilo);

        const estadoLocal = {
            total: 0,
            cargadas: 0,
            cursor: null,
            cargando: false,
            formularioVisible: false,
            respuestasVisibles: false,
            estrellaActiva: false,
            totalEstrellas: 0
        };

        function pintarEstrellaEco() {
            estrellaEco.textContent = `${estadoLocal.estrellaActiva ? "★" : "☆"} Estrellas (${estadoLocal.totalEstrellas})`;
            estrellaEco.classList.toggle("activa", estadoLocal.estrellaActiva);
            estrellaEco.setAttribute("aria-pressed", String(estadoLocal.estrellaActiva));
        }

        function actualizarBotonMas() {
            const restantes = Math.max(0, estadoLocal.total - estadoLocal.cargadas);
            mostrarMas.hidden = restantes === 0;
            if (restantes > 0) {
                const siguienteGrupo = Math.min(3, restantes);
                mostrarMas.textContent = `Mostrar ${siguienteGrupo} Ecos más (${restantes} ocultos)`;
            }
        }

        function actualizarControlesHilo() {
            hilo.hidden = !estadoLocal.formularioVisible && !estadoLocal.respuestasVisibles;
            formularioRespuesta.hidden = !estadoLocal.formularioVisible;
            grupoRespuestas.hidden = !estadoLocal.respuestasVisibles;
            responder.setAttribute("aria-expanded", String(estadoLocal.formularioVisible));
            responder.textContent = estadoLocal.formularioVisible ? "Cerrar respuesta" : "↳ Responder";
            mostrarRespuestas.setAttribute("aria-expanded", String(estadoLocal.respuestasVisibles));
            mostrarRespuestas.textContent = estadoLocal.respuestasVisibles
                ? "Ocultar respuestas"
                : `Mostrar respuestas (${estadoLocal.total})`;
        }

        function agregarRespuesta(respuesta) {
            const tarjeta = elemento("article", "comentario-contextual__respuesta");
            const avatar = crearAvatar(respuesta);
            tarjeta.appendChild(avatar);
            const contenido = elemento("div", "comentario-contextual__respuesta-contenido");
            const encabezado = elemento("div", "comentario-contextual__respuesta-encabezado");
            const identidad = elemento("div", "comentario-contextual__respuesta-identidad");
            const rango = elemento("span", "comentario-contextual__rango", "\u{1F6F8} Viajero");
            const nombre = elemento("strong", "", respuesta.autorNombre);
            identidad.append(nombre, rango, crearAccionesViajero(respuesta.autorId));
            encabezado.append(
                identidad,
                elemento("time", "", fechaTexto(respuesta.creadoEn))
            );
            contenido.append(
                encabezado,
                elemento("p", "", respuesta.texto)
            );
            tarjeta.appendChild(contenido);
            listaRespuestas.appendChild(tarjeta);
            aplicarRangoAutor(respuesta, rango, tarjeta, avatar, nombre);
            conectarModeracion({
                contenedor: tarjeta,
                oculto: respuesta.oculta,
                alOcultar: valor => ocultarRespuesta(contexto, comentario.id, respuesta.id, valor),
                alEliminar: () => eliminarRespuesta(contexto, comentario.id, respuesta.id)
            });
        }

        async function cargarRespuestas(reset = false) {
            if (estadoLocal.cargando) return;
            estadoLocal.cargando = true;
            mostrarMas.disabled = true;
            if (reset) {
                listaRespuestas.replaceChildren();
                estadoLocal.cursor = null;
                estadoLocal.cargadas = 0;
            }
            estadoHilo.textContent = "Cargando Ecos…";
            try {
                if (reset) estadoLocal.total = await contarRespuestas(contexto, comentario.id);
                const resultado = await listarRespuestas(contexto, comentario.id, estadoLocal.cursor);
                resultado.respuestas.forEach(agregarRespuesta);
                estadoLocal.cursor = resultado.cursor;
                estadoLocal.cargadas += resultado.respuestas.length;
                estadoHilo.textContent = estadoLocal.total ? "" : "Todavía no hay respuestas.";
                actualizarBotonMas();
                actualizarControlesHilo();
            } catch (error) {
                estadoHilo.textContent = error.message || "No se pudieron cargar las respuestas.";
            } finally {
                estadoLocal.cargando = false;
                mostrarMas.disabled = false;
            }
        }

        Promise.all([
            contarEstrellasComentario(contexto, comentario.id),
            tieneEstrellaComentario(contexto, comentario.id)
        ]).then(([total, activa]) => {
            estadoLocal.totalEstrellas = total;
            estadoLocal.estrellaActiva = activa;
            pintarEstrellaEco();
        }).catch(pintarEstrellaEco);

        contarRespuestas(contexto, comentario.id).then((total) => {
            estadoLocal.total = total;
            actualizarControlesHilo();
        }).catch(() => {
            mostrarRespuestas.textContent = "Mostrar respuestas";
        });

        estrellaEco.addEventListener("click", async () => {
            if (!auth.currentUser) return abrirInicioSesion();
            estrellaEco.disabled = true;
            try {
                const activa = await alternarEstrellaComentario(contexto, comentario.id);
                estadoLocal.estrellaActiva = activa;
                estadoLocal.totalEstrellas = Math.max(0, estadoLocal.totalEstrellas + (activa ? 1 : -1));
                pintarEstrellaEco();
            } catch (error) {
                estadoHilo.textContent = error.message || "No se pudo cambiar la estrella.";
                hilo.hidden = false;
            } finally {
                estrellaEco.disabled = false;
            }
        });

        responder.addEventListener("click", () => {
            if (!auth.currentUser) return abrirInicioSesion();
            estadoLocal.formularioVisible = !estadoLocal.formularioVisible;
            actualizarControlesHilo();
            if (estadoLocal.formularioVisible) campoRespuesta.focus();
        });
        mostrarRespuestas.addEventListener("click", async () => {
            estadoLocal.respuestasVisibles = !estadoLocal.respuestasVisibles;
            actualizarControlesHilo();
            if (estadoLocal.respuestasVisibles && !estadoLocal.cursor) {
                await cargarRespuestas(true);
                actualizarControlesHilo();
            }
        });
        mostrarMas.addEventListener("click", () => cargarRespuestas(false));
        campoRespuesta.addEventListener("input", () => {
            enviarRespuesta.disabled = !campoRespuesta.value.trim();
        });
        formularioRespuesta.addEventListener("submit", async (evento) => {
            evento.preventDefault();
            enviarRespuesta.disabled = true;
            try {
                await crearRespuesta(contexto, comentario.id, campoRespuesta.value);
                campoRespuesta.value = "";
                estadoLocal.respuestasVisibles = true;
                await cargarRespuestas(true);
                actualizarControlesHilo();
            } catch (error) {
                estadoHilo.textContent = error.message || "No se pudo publicar la respuesta.";
            } finally {
                enviarRespuesta.disabled = !campoRespuesta.value.trim();
            }
        });
    }

    async function cargar(reset = false) {
        if (componente.cargando) return;
        componente.cargando = true;
        estado.textContent = "Cargando ecos…";
        cargarMas.disabled = true;
        if (reset) {
            lista.replaceChildren();
            componente.cursor = null;
        }
        try {
            const resultado = await listarComentarios(contexto, componente.cursor);
            resultado.comentarios.forEach(agregarComentario);
            actualizarVisibilidadComentarios();
            componente.cursor = resultado.cursor;
            componente.cargado = true;
            estado.textContent = lista.children.length ? "" : "Todavía no hay ecos.";
            cargarMas.hidden = !resultado.hayMas;
        } catch {
            estado.textContent = "Ecos no disponibles";
            cargarMas.hidden = true;
        } finally {
            componente.cargando = false;
            cargarMas.disabled = false;
        }
    }

    boton.addEventListener("click", async () => {
        componente.abierto = !componente.abierto;
        panel.hidden = !componente.abierto;
        boton.setAttribute("aria-expanded", String(componente.abierto));
        if (componente.abierto && !componente.cargado) await cargar(true);
    });
    estrella.addEventListener("click", async () => {
        if (!auth.currentUser) {
            abrirInicioSesion();
            return;
        }
        if (componente.actualizandoEstrella) return;
        componente.actualizandoEstrella = true;
        estrella.disabled = true;
        mostrarEstadoReacciones("Guardando tu estrellaâ€¦");
        try {
            const activa = await alternarEstrella(contexto);
            componente.estrellaActiva = activa;
            componente.totalEstrellas = Math.max(
                0,
                Number(componente.totalEstrellas || 0) + (activa ? 1 : -1)
            );
            pintarEstrella();
            mostrarEstadoReacciones(
                activa ? "\u2726 Estrella enviada." : "Estrella retirada correctamente."
            );
        } catch (error) {
            console.error("No fue posible cambiar la estrella:", error);
            mostrarEstadoReacciones(
                error?.code === "permission-denied"
                    ? "Firestore rechazÃ³ la acciÃ³n. Publica las reglas actualizadas para activar Estrellas."
                    : (error.message || "No se pudo registrar la estrella."),
                true
            );
        } finally {
            componente.actualizandoEstrella = false;
            estrella.disabled = false;
        }
    });
    compartir.addEventListener("click", async () => {
        const url = enlaceCompartir(contexto);
        try {
            if (navigator.share) {
                await navigator.share({
                    title: "Te Vi En Un Planetario",
                    text: "Mira esta señal del universo.",
                    url
                });
            } else {
                await navigator.clipboard.writeText(url);
                mostrarEstadoReacciones("Enlace copiado. Ya puedes compartirlo.");
            }
        } catch (error) {
            if (error?.name !== "AbortError") {
                mostrarEstadoReacciones("No se pudo compartir el enlace.", true);
            }
        }
    });
    verTodos.addEventListener("click", () => {
        componente.mostrarTodos = !componente.mostrarTodos;
        actualizarVisibilidadComentarios();
    });
    cargarMas.addEventListener("click", () => cargar(false));
    acceso.addEventListener("click", abrirInicioSesion);
    textarea.addEventListener("input", () => {
        contador.textContent = `${textarea.value.length}/${LIMITE_TEXTO}`;
        enviar.disabled = !textarea.value.trim();
    });
    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        enviar.disabled = true;
        try {
            await crearComentario(contexto, textarea.value);
            textarea.value = "";
            contador.textContent = `0/${LIMITE_TEXTO}`;
            await cargar(true);
            actualizarContador(1);
        } catch (error) {
            estado.textContent = error.message || "No se pudo publicar el comentario.";
        } finally {
            enviar.disabled = !textarea.value.trim();
        }
    });

    componente.actualizarSesion = actualizarSesion;
    actualizarSesion();
    contarComentarios(contexto).then((total) => {
        componente.total = total;
        actualizarContador();
    }).catch(() => actualizarContador());
    return componente;
}

async function cargarPerfil(usuario) {
    if (!usuario) {
        perfilActual = null;
    } else {
        try {
            const perfil = await getDoc(doc(db, "usuarios", usuario.uid));
            perfilActual = perfil.exists() ? perfil.data() : null;
        } catch { perfilActual = null; }
    }
    componentes.forEach((componente) => componente.actualizarSesion?.());
}

onAuthStateChanged(auth, cargarPerfil);

export { crearComponente as crearComentariosContextuales };
