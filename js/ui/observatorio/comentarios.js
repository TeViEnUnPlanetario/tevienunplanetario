// ==================================================
// PROYECTO OBSERVATORIO
// TE VI EN UN PLANETARIO
//
// Módulo:
// Interfaz de Ecos
//
// Responsabilidad:
// Abrir el panel de Ecos, escuchar comentarios,
// publicar respuestas y eliminarlas.
// ==================================================

import {
    auth
} from "../../firebase/firebase-config.js";


import {
    asegurarPerfilUsuario
} from "../../firebase/firestore.js";


import {
    escucharEcos,
    guardarEco,
    eliminarEco
} from "../../firebase/firestore-ecos.js";


let panelEcos =
    null;


let listaEcos =
    null;


let formularioEco =
    null;


let textareaEco =
    null;


let contadorCaracteres =
    null;


let botonEnviar =
    null;


let estadoEcos =
    null;


let observacionActivaId =
    "";


let cancelarEscuchaEcos =
    null;


let perfilUsuarioActual =
    null;


const LIMITE_CARACTERES =
    500;


/* ==================================================
   INICIALIZACIÓN
================================================== */

export function iniciarSistemaEcos() {

    crearPanelEcos();

    registrarEventosGlobales();

}


/* ==================================================
   ABRIR PANEL
================================================== */

export async function abrirEcos(
    observacionId
) {

    const id =
        String(
            observacionId ?? ""
        ).trim();


    if (!id) {

        mostrarMensaje(
            "No fue posible abrir los Ecos."
        );

        return;

    }


    crearPanelEcos();


    observacionActivaId =
        id;


    panelEcos.dataset.observacionId =
        id;

    panelEcos.hidden =
        false;    


    panelEcos.classList.add(
        "ecos-panel--visible"
    );


    panelEcos.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "ecos-panel-abierto"
    );


    limpiarListaEcos();


    mostrarEstado(
        "Escuchando el universo..."
    );


    textareaEco.value =
        "";


    actualizarEstadoFormulario();


    await cargarPerfilActual();


    iniciarEscuchaEcos();


    window.setTimeout(
        function () {

            textareaEco?.focus();

        },
        250
    );

}


/* ==================================================
   CERRAR PANEL
================================================== */

export function cerrarEcos() {

    if (!panelEcos) {

        return;

    }


    panelEcos.classList.remove(
        "ecos-panel--visible"
    );


    panelEcos.setAttribute(
        "aria-hidden",
        "true"
    );


    panelEcos.hidden =
        true;


    document.body.classList.remove(
        "ecos-panel-abierto"
    );


    detenerEscuchaEcos();


    observacionActivaId =
        "";

}


/* ==================================================
   CREAR INTERFAZ
================================================== */

function crearPanelEcos() {

    if (panelEcos) {

        return panelEcos;

    }


    panelEcos =
        document.createElement(
            "section"
        );


    panelEcos.className =
        "ecos-panel";

    panelEcos.hidden =
    true;


    panelEcos.setAttribute(
        "aria-hidden",
        "true"
    );


    panelEcos.innerHTML = `

        <button
            class="ecos-panel__fondo"
            type="button"
            data-accion="cerrar-ecos"
            aria-label="Cerrar Ecos">
        </button>

        <div
            class="ecos-panel__contenedor"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ecos-panel-titulo">

            <header
                class="ecos-panel__header">

                <div>

                    <span
                        class="ecos-panel__etiqueta">

                        Comunicación interestelar

                    </span>

                    <h2
                        id="ecos-panel-titulo"
                        class="ecos-panel__titulo">

                        Ecos

                    </h2>

                </div>

                <button
                    class="ecos-panel__cerrar"
                    type="button"
                    data-accion="cerrar-ecos"
                    aria-label="Cerrar panel de Ecos">

                    ×

                </button>

            </header>


            <div
                class="ecos-panel__contenido">

                <p
                    class="ecos-panel__estado"
                    data-ecos-estado>

                    Escuchando el universo...

                </p>

                <div
                    class="ecos-lista"
                    data-ecos-lista>
                </div>

            </div>


            <form
                class="ecos-formulario"
                data-ecos-formulario>

                <label
                    class="ecos-formulario__label"
                    for="ecos-textarea">

                    Escribe un Eco

                </label>

                <textarea
                    id="ecos-textarea"
                    class="ecos-formulario__textarea"
                    data-ecos-textarea
                    maxlength="${LIMITE_CARACTERES}"
                    placeholder="Comparte lo que esta Observación te hizo sentir..."
                    rows="3"></textarea>

                <div
                    class="ecos-formulario__pie">

                    <span
                        class="ecos-formulario__contador"
                        data-ecos-contador>

                        0/${LIMITE_CARACTERES}

                    </span>

                    <button
                        class="ecos-formulario__enviar"
                        data-ecos-enviar
                        type="submit"
                        disabled>

                        Responder

                    </button>

                </div>

            </form>

        </div>

    `;


    document.body.appendChild(
        panelEcos
    );


    listaEcos =
        panelEcos.querySelector(
            "[data-ecos-lista]"
        );


    formularioEco =
        panelEcos.querySelector(
            "[data-ecos-formulario]"
        );


    textareaEco =
        panelEcos.querySelector(
            "[data-ecos-textarea]"
        );


    contadorCaracteres =
        panelEcos.querySelector(
            "[data-ecos-contador]"
        );


    botonEnviar =
        panelEcos.querySelector(
            "[data-ecos-enviar]"
        );


    estadoEcos =
        panelEcos.querySelector(
            "[data-ecos-estado]"
        );


    registrarEventosPanel();


    return panelEcos;

}


/* ==================================================
   EVENTOS
================================================== */

function registrarEventosGlobales() {

    document.addEventListener(
        "keydown",
        function (
            evento
        ) {

            if (
                evento.key ===
                "Escape"
            ) {

                cerrarEcos();

            }

        }
    );


    document.addEventListener(
        "observatorio:abrir-ecos",
        function (
            evento
        ) {

            abrirEcos(
                evento.detail
                    ?.observacionId
            );

        }
    );

}


function registrarEventosPanel() {

    panelEcos.addEventListener(
        "click",
        manejarClickPanel
    );


    formularioEco.addEventListener(
        "submit",
        publicarEco
    );


    textareaEco.addEventListener(
        "input",
        actualizarEstadoFormulario
    );


    textareaEco.addEventListener(
        "keydown",
        function (
            evento
        ) {

            if (
                evento.key ===
                    "Enter"
                &&
                (
                    evento.ctrlKey ||
                    evento.metaKey
                )
            ) {

                formularioEco
                    .requestSubmit();

            }

        }
    );

}


/* ==================================================
   MANEJAR CLICS
================================================== */

function manejarClickPanel(
    evento
) {

    const boton =
        evento.target.closest(
            "[data-accion]"
        );


    if (!boton) {

        return;

    }


    const accion =
        boton.dataset.accion;


    if (
        accion ===
        "cerrar-ecos"
    ) {

        cerrarEcos();

        return;

    }


    if (
        accion ===
        "eliminar-eco"
    ) {

        const ecoId =
            boton.dataset.ecoId;


        solicitarEliminarEco(
            ecoId,
            boton
        );

    }

}


/* ==================================================
   PERFIL
================================================== */

async function cargarPerfilActual() {

    const usuario =
        auth.currentUser;


    if (!usuario) {

        perfilUsuarioActual =
            null;

        return;

    }


    try {

        perfilUsuarioActual =
            await asegurarPerfilUsuario(
                usuario
            );

    }
    catch (error) {

        console.error(
            "No fue posible cargar el perfil para Ecos:",
            error
        );


        perfilUsuarioActual =
            null;

    }

}


/* ==================================================
   ESCUCHA EN TIEMPO REAL
================================================== */

function iniciarEscuchaEcos() {

    detenerEscuchaEcos();


    cancelarEscuchaEcos =
        escucharEcos(

            observacionActivaId,

            function (
                ecos
            ) {

                renderizarEcos(
                    ecos
                );

                actualizarContadorCard(
                    observacionActivaId,
                    ecos.length
                );

            },

            function (
                error
            ) {

                console.error(
                    "No fue posible escuchar los Ecos:",
                    error
                );


                mostrarEstado(
                    "No fue posible escuchar los Ecos."
                );

            }

        );

}


function detenerEscuchaEcos() {

    if (
        typeof cancelarEscuchaEcos ===
        "function"
    ) {

        cancelarEscuchaEcos();

    }


    cancelarEscuchaEcos =
        null;

}


/* ==================================================
   RENDERIZAR ECOS
================================================== */

function renderizarEcos(
    ecos = []
) {

    limpiarListaEcos();


    if (
        !Array.isArray(
            ecos
        )
        ||
        ecos.length ===
            0
    ) {

        mostrarEstado(
            "Todavía no hay Ecos. Sé la primera voz en responder."
        );

        return;

    }


    ocultarEstado();


    const fragmento =
        document.createDocumentFragment();


    ecos.forEach(
        function (
            eco
        ) {

            fragmento.appendChild(
                crearElementoEco(
                    eco
                )
            );

        }
    );


    listaEcos.appendChild(
        fragmento
    );

}


function crearElementoEco(
    eco
) {

    const articulo =
        document.createElement(
            "article"
        );


    articulo.className =
        "eco-item";


    articulo.dataset.ecoId =
        eco.id;


    const esPropio =
        auth.currentUser?.uid ===
        eco.autorId;


    const avatar =
        crearAvatarEco(
            eco
        );


    const contenido =
        document.createElement(
            "div"
        );


    contenido.className =
        "eco-item__contenido";


    const encabezado =
        document.createElement(
            "header"
        );


    encabezado.className =
        "eco-item__encabezado";


    const autor =
        document.createElement(
            "div"
        );


    autor.className =
        "eco-item__autor";


    const nombre =
        document.createElement(
            "strong"
        );


    nombre.className =
        "eco-item__nombre";


    nombre.textContent =
        eco.autorNombre ||
        "Viajero";


    const rango =
        document.createElement(
            "span"
        );


    rango.className =
        "eco-item__rango";


    rango.textContent =
        eco.autorRango ||
        "🌠 Viajero";


    autor.append(
        nombre,
        rango
    );


    const acciones =
        document.createElement(
            "div"
        );


    acciones.className =
        "eco-item__acciones";


    const fecha =
        document.createElement(
            "time"
        );


    fecha.className =
        "eco-item__fecha";


    fecha.dateTime =
        eco.fechaISO;


    fecha.textContent =
        eco.fechaTexto;


    acciones.appendChild(
        fecha
    );


    if (esPropio) {

        const botonEliminar =
            document.createElement(
                "button"
            );


        botonEliminar.type =
            "button";


        botonEliminar.className =
            "eco-item__eliminar";


        botonEliminar.dataset.accion =
            "eliminar-eco";


        botonEliminar.dataset.ecoId =
            eco.id;


        botonEliminar.setAttribute(
            "aria-label",
            "Eliminar Eco"
        );


        botonEliminar.textContent =
            "Eliminar";


        acciones.appendChild(
            botonEliminar
        );

    }


    encabezado.append(
        autor,
        acciones
    );


    const texto =
        document.createElement(
            "p"
        );


    texto.className =
        "eco-item__texto";


    texto.textContent =
        eco.texto;


    contenido.append(
        encabezado,
        texto
    );


    articulo.append(
        avatar,
        contenido
    );


    return articulo;

}


function crearAvatarEco(
    eco
) {

    const contenedor =
        document.createElement(
            "div"
        );


    contenedor.className =
        "eco-item__avatar";


    const valor =
        String(
            eco.autorAvatar ||
            ""
        ).trim();


    const pareceImagen =
        valor.startsWith(
            "http://"
        )
        ||
        valor.startsWith(
            "https://"
        )
        ||
        valor.startsWith(
            "data:image/"
        );


    if (pareceImagen) {

        const imagen =
            document.createElement(
                "img"
            );


        imagen.src =
            valor;


        imagen.alt =
            `Avatar de ${eco.autorNombre || "Viajero"}`;


        contenedor.appendChild(
            imagen
        );

    }
    else {

        contenedor.textContent =
            valor ||
            obtenerIniciales(
                eco.autorNombre
            );

    }


    return contenedor;

}


/* ==================================================
   PUBLICAR ECO
================================================== */

async function publicarEco(
    evento
) {

    evento.preventDefault();


    const texto =
        textareaEco.value.trim();


    if (
        !texto ||
        !observacionActivaId
    ) {

        return;

    }


    if (!auth.currentUser) {

        mostrarMensaje(
            "Debes iniciar sesión para responder."
        );

        return;

    }


    botonEnviar.disabled =
        true;


    botonEnviar.classList.add(
        "ecos-formulario__enviar--cargando"
    );


    botonEnviar.textContent =
        "Enviando...";


    try {

        const autor =
            obtenerDatosAutor();


        await guardarEco(

            observacionActivaId,

            {
                texto:
                    texto,

                autorNombre:
                    autor.nombre,

                autorRango:
                    autor.rango,

                autorAvatar:
                    autor.avatar,

                oficial:
                    autor.oficial,

                verificado:
                    autor.verificado
            }

        );


        textareaEco.value =
            "";


        actualizarEstadoFormulario();


        textareaEco.focus();

    }
    catch (error) {

        console.error(
            "No fue posible publicar el Eco:",
            error
        );


        mostrarMensaje(
            error.message ||
            "No fue posible publicar el Eco."
        );

    }
    finally {

        botonEnviar.classList.remove(
            "ecos-formulario__enviar--cargando"
        );


        botonEnviar.textContent =
            "Responder";


        actualizarEstadoFormulario();

    }

}


/* ==================================================
   ELIMINAR ECO
================================================== */

async function solicitarEliminarEco(
    ecoId,
    boton
) {

    if (
        !ecoId ||
        !observacionActivaId
    ) {

        return;

    }


    const confirmado =
        window.confirm(
            "¿Deseas eliminar este Eco?"
        );


    if (!confirmado) {

        return;

    }


    boton.disabled =
        true;


    boton.textContent =
        "Eliminando...";


    try {

        await eliminarEco(
            observacionActivaId,
            ecoId
        );

    }
    catch (error) {

        console.error(
            "No fue posible eliminar el Eco:",
            error
        );


        mostrarMensaje(
            error.message ||
            "No fue posible eliminar el Eco."
        );


        boton.disabled =
            false;


        boton.textContent =
            "Eliminar";

    }

}


/* ==================================================
   FORMULARIO
================================================== */

function actualizarEstadoFormulario() {

    if (
        !textareaEco ||
        !botonEnviar
    ) {

        return;

    }


    const cantidad =
        textareaEco.value.length;


    contadorCaracteres.textContent =
        `${cantidad}/${LIMITE_CARACTERES}`;


    botonEnviar.disabled =
        cantidad === 0
        ||
        cantidad > LIMITE_CARACTERES
        ||
        !auth.currentUser;

}


/* ==================================================
   CONTADOR DE LA CARD
================================================== */

function actualizarContadorCard(
    observacionId,
    total
) {

    const card =
        document.querySelector(
            `.observacion-card[data-observacion-id="${CSS.escape(
                observacionId
            )}"]`
        );


    if (!card) {

        return;

    }


    const boton =
        card.querySelector(
            '[data-accion="eco"]'
        );


    if (!boton) {

        return;

    }


    const texto =
        total === 1
            ? "1 Eco"
            : `${total} Ecos`;


    const contador =
        boton.querySelector(
            ".observacion-accion__texto"
        );


    if (contador) {

        contador.textContent =
            texto;

    }
    else {

        boton.textContent =
            `◌ ${texto}`;

    }

}


/* ==================================================
   DATOS DEL AUTOR
================================================== */

function obtenerDatosAutor() {

    const usuario =
        auth.currentUser;


    const nombre =
        String(
            perfilUsuarioActual?.nombre ||
            perfilUsuarioActual?.displayName ||
            usuario?.displayName ||
            usuario?.email
                ?.split("@")[0] ||
            "Viajero"
        ).trim();


    const rango =
        String(
            perfilUsuarioActual?.rango ||
            "🌠 Viajero"
        ).trim();


    const avatar =
        String(
            perfilUsuarioActual?.avatar ||
            perfilUsuarioActual?.foto ||
            usuario?.photoURL ||
            obtenerIniciales(
                nombre
            )
        ).trim();


    return {

        nombre:
            nombre,

        rango:
            rango,

        avatar:
            avatar,

        oficial:
            Boolean(
                perfilUsuarioActual?.oficial
            ),

        verificado:
            Boolean(
                perfilUsuarioActual?.verificado ||
                perfilUsuarioActual?.oficial
            )

    };

}


/* ==================================================
   UTILIDADES DE INTERFAZ
================================================== */

function limpiarListaEcos() {

    listaEcos?.replaceChildren();

}


function mostrarEstado(
    mensaje
) {

    if (!estadoEcos) {

        return;

    }


    estadoEcos.textContent =
        mensaje;


    estadoEcos.hidden =
        false;

}


function ocultarEstado() {

    if (estadoEcos) {

        estadoEcos.hidden =
            true;

    }

}


function mostrarMensaje(
    mensaje
) {

    document.dispatchEvent(

        new CustomEvent(
            "observatorio:mensaje",
            {
                detail:
                    mensaje
            }
        )

    );

}


function obtenerIniciales(
    nombre
) {

    const iniciales =
        String(
            nombre || "Viajero"
        )
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(
                function (
                    palabra
                ) {

                    return palabra
                        .charAt(0)
                        .toUpperCase();

                }
            )
            .join("");


    return iniciales ||
        "V";

}


iniciarSistemaEcos();