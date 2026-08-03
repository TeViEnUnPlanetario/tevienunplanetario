console.log("auth.js comenzó a ejecutarse");


console.log(
    "Firebase conectado correctamente",
    auth,
    
);


// =========================================
// FIREBASE AUTH — ESTADO DE SESIÓN
// Te Vi En Un Planetario
// =========================================

import {
    auth
} from "./firebase-config.js";

import {
    asegurarPerfilUsuario
} from "./firestore.js";

import {
    observarPerfilViajero,
    pintarAvatar
} from "../ui/identidad-viajero.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";


let botonComunidad = null;

let perfilActivo = null;

let detenerPerfilVivo = () => {};


function actualizarAccesosRequierenSesion(conectado) {

    document
        .querySelectorAll("[data-requiere-sesion]")
        .forEach((elemento) => {
            elemento.hidden = !conectado;
            elemento.setAttribute(
                "aria-hidden",
                String(!conectado)
            );
        });

}


function obtenerIniciales(nombre) {

    const partes = String(nombre || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (partes.length === 0) {
        return "✦";
    }

    return partes
        .slice(0, 2)
        .map((parte) => parte.charAt(0))
        .join("")
        .toLocaleUpperCase("es-MX");

}


function esPerfilAdministrador(perfil) {

    return [
        "sistema-planetario",
        "administrador"
    ].includes(
        String(perfil?.rol || "")
            .trim()
            .toLowerCase()
    );

}


function actualizarAccesosAdministrativos(perfil = null) {

    const permitido =
        esPerfilAdministrador(perfil);

    document
        .querySelectorAll("[data-requiere-administrador]")
        .forEach((elemento) => {
            elemento.hidden = !permitido;
            elemento.setAttribute(
                "aria-hidden",
                String(!permitido)
            );
        });

}


function actualizarAccesoAdministrativo(perfil = null) {

    const menu =
        document.getElementById("menu-usuario");

    if (!menu) {
        return;
    }

    menu.querySelector("#abrir-sistema-planetario")?.remove();

    if (!esPerfilAdministrador(perfil)) {
        return;
    }

    const enlace = document.createElement("a");
    enlace.id = "abrir-sistema-planetario";
    enlace.className = "menu-usuario__opcion";
    enlace.href = "sistema-planetario.html";
    enlace.innerHTML = `
        <span aria-hidden="true">✦</span>
        Panel de control
    `;

    const cerrarSesion = menu.querySelector("#cerrar-sesion");
    cerrarSesion?.before(enlace);

}


// =========================================
// CREAR MENÚ DEL VIAJERO
// =========================================

function crearMenuUsuario() {

    let menu =
        document.getElementById(
            "menu-usuario"
        );

    if (menu) {

        return menu;

    }

    menu =
        document.createElement(
            "div"
        );

    menu.id =
        "menu-usuario";

    menu.className =
        "menu-usuario";

    menu.setAttribute(
        "aria-hidden",
        "true"
    );

    menu.innerHTML = `
        <div class="menu-usuario__encabezado">

            <span
                class="menu-usuario__simbolo"
                id="menu-usuario-iniciales"
                aria-hidden="true"
            >
                ✦
            </span>

            <div>
                <strong id="menu-usuario-nombre">
                    Viajero
                </strong>

                <span id="menu-usuario-rango">
                    🌠 Viajero
                </span>
            </div>

        </div>

        <div class="menu-usuario__separador"></div>

        <button
            class="menu-usuario__opcion"
            id="abrir-mi-perfil"
            type="button"
        >
            <span aria-hidden="true">◌</span>
            Mi constelación
        </button>

        <button
            class="menu-usuario__opcion"
            id="cerrar-sesion"
            type="button"
        >
            <span aria-hidden="true">↗</span>
            Abandonar el universo
        </button>
    `;

    document.body.appendChild(
        menu
    );

    const botonAbrirPerfil =
        menu.querySelector(
            "#abrir-mi-perfil"
        );

    const botonCerrarSesion =
        menu.querySelector(
            "#cerrar-sesion"
        );

    botonAbrirPerfil
        ?.addEventListener(
            "click",
            function () {

                window.location.href =
                    "perfil.html";

            }
        );

    botonCerrarSesion
        ?.addEventListener(
            "click",
            cerrarSesion
        );

    return menu;

}


// =========================================
// MOSTRAR USUARIO CONECTADO
// =========================================

function mostrarUsuarioConectado(
    perfil
) {

    actualizarAccesosRequierenSesion(true);
    actualizarAccesosAdministrativos(perfil);

    perfilActivo =
        perfil;

    if (
        !botonComunidad ||
        !perfil
    ) {

        return;

    }

    botonComunidad.dataset.sesionActiva =
        "true";

    botonComunidad.setAttribute(
        "aria-expanded",
        String(document.getElementById("menu-usuario")?.classList.contains("menu-usuario--activo"))
    );

    const nombrePerfil =
        perfil.nombre ||
        "Viajero";

    const fotoPerfil =
        String(perfil.foto || "").trim();

    botonComunidad.setAttribute(
        "aria-label",
        `Abrir menú de ${nombrePerfil}`
    );

    botonComunidad.innerHTML = fotoPerfil
        ? `
            <img
                class="identidad-universo__foto"
                src="${escaparHTML(fotoPerfil)}"
                alt=""
            >
        `
        : `
            <span class="identidad-universo__iniciales" aria-hidden="true">
                ${obtenerIniciales(nombrePerfil)}
            </span>
        `;

    botonComunidad
        .querySelector(".identidad-universo__foto")
        ?.addEventListener("error", () => {
            botonComunidad.innerHTML = `
                <span class="identidad-universo__iniciales" aria-hidden="true">
                    ${obtenerIniciales(nombrePerfil)}
                </span>
            `;
        }, { once: true });

    const menu =
        crearMenuUsuario();

    const nombre =
        menu.querySelector(
            "#menu-usuario-nombre"
        );

    const iniciales =
        menu.querySelector(
            "#menu-usuario-iniciales"
        );

    const rango =
        menu.querySelector(
            "#menu-usuario-rango"
        );

    if (nombre) {

        nombre.textContent =
            perfil.nombre ||
            "Viajero";

    }

    if (rango) {

        rango.textContent =
            `🌠 ${perfil.rango || "Viajero"}`;

    }

    if (iniciales) {

        pintarAvatar(
            iniciales,
            fotoPerfil,
            perfil.nombre || "Viajero"
        );

    }

    const rolNormalizado = String(perfil?.rol || "viajero")
        .trim()
        .toLowerCase();

    menu.dataset.rol = rolNormalizado;
    menu.classList.toggle(
        "menu-usuario--administrativo",
        esPerfilAdministrador(perfil)
    );

    actualizarAccesoAdministrativo(perfil);

}


// =========================================
// MOSTRAR ESTADO SIN SESIÓN
// =========================================

function mostrarUsuarioDesconectado() {

    actualizarAccesosRequierenSesion(false);
    actualizarAccesosAdministrativos(null);

    perfilActivo =
        null;

    actualizarAccesoAdministrativo(null);

    if (!botonComunidad) {

        return;

    }

    botonComunidad.dataset.sesionActiva =
        "false";

    botonComunidad.setAttribute(
        "aria-label",
        "Entrar a la comunidad"
    );

    botonComunidad.removeAttribute(
        "aria-expanded"
    );

    botonComunidad.innerHTML = `
        <span class="identidad-universo__estrella" aria-hidden="true">✦</span>
    `;

    cerrarMenuUsuario();

}


// =========================================
// ABRIR O CERRAR MENÚ
// =========================================

function alternarMenuUsuario() {

    const menu =
        crearMenuUsuario();

    if (!menu) {

        console.error(
            "No se pudo crear el menú del usuario."
        );

        return;

    }

    const estaAbierto =
        menu.classList.contains(
            "menu-usuario--activo"
        );

    if (estaAbierto) {

        cerrarMenuUsuario();

        return;

    }

    const esMovil =
        window.matchMedia(
            "(max-width: 768px)"
        ).matches;

    if (esMovil) {

        // En móvil usamos un panel inferior.
        menu.style.top = "auto";
        menu.style.right = "14px";
        menu.style.bottom = "18px";
        menu.style.left = "14px";

    } else {

        // En escritorio aparece debajo del botón.
        const posicionBoton =
            botonComunidad
                .getBoundingClientRect();

        menu.style.top =
            `${posicionBoton.bottom + 12}px`;

        menu.style.left =
            `${Math.max(14, posicionBoton.left)}px`;

        menu.style.right =
            "auto";

        menu.style.bottom =
            "auto";

    }

    menu.classList.add(
        "menu-usuario--activo"
    );

    menu.setAttribute(
        "aria-hidden",
        "false"
    );

    botonComunidad.setAttribute(
        "aria-expanded",
        "true"
    );

}

function cerrarMenuUsuario() {

    const menu =
        document.getElementById(
            "menu-usuario"
        );

    if (!menu) {

        return;

    }

    menu.classList.remove(
        "menu-usuario--activo"
    );

    menu.setAttribute(
        "aria-hidden",
        "true"
    );

    botonComunidad?.setAttribute(
        "aria-expanded",
        "false"
    );

}


// =========================================
// CERRAR SESIÓN
// =========================================

async function cerrarSesion() {

    try {

        perfilActivo = null;
        actualizarAccesoAdministrativo(null);
        cerrarMenuUsuario();

        await signOut(
            auth
        );

        console.log(
            "El viajero abandonó el universo."
        );

    } catch (error) {

        console.error(
            "No se pudo cerrar la sesión:",
            error
        );

    }

}


// =========================================
// ESCAPAR TEXTO PARA HTML
// =========================================

function escaparHTML(
    texto
) {

    const elemento =
        document.createElement(
            "span"
        );

    elemento.textContent =
        texto;

    return elemento.innerHTML;

}




// =========================================
// INICIAR SESION EN EL SISTEMA
// =========================================

function iniciarSistemaSesion() {

    botonComunidad =
        document.getElementById(
            "abrir-portal"
        );

    if (!botonComunidad) {

        console.error(
            "No se encontró el botón #abrir-portal."
        );

        return;

    }

    console.log(
        "Botón Comunidad encontrado."
    );


    if (perfilActivo) {

        mostrarUsuarioConectado(
            perfilActivo
        );

    }


   botonComunidad.addEventListener(
    "click",
    function (evento) {

        const sesionActiva =
            botonComunidad.dataset
                .sesionActiva ===
            "true";

        if (!sesionActiva) {

            return;

        }

        evento.preventDefault();
        evento.stopPropagation();
        evento.stopImmediatePropagation();

        alternarMenuUsuario();

        console.log(
            "Menú del viajero alternado."
        );

    },
    true
);


    document.addEventListener(
        "click",
        function (evento) {

            const menu =
                document.getElementById(
                    "menu-usuario"
                );

            if (
                !menu ||
                !botonComunidad
            ) {

                return;

            }

            const clicDentroMenu =
                menu.contains(
                    evento.target
                );

            const clicEnBoton =
                botonComunidad.contains(
                    evento.target
                );

            if (
                !clicDentroMenu &&
                !clicEnBoton
            ) {

                cerrarMenuUsuario();

            }

        }
    );


}

// =========================================
// OBSERVADOR DE AUTENTICACIÓN
// =========================================

onAuthStateChanged(
    auth,
    async function (usuario) {

        detenerPerfilVivo();
        detenerPerfilVivo = () => {};
        perfilActivo = null;
        actualizarAccesoAdministrativo(null);

        if (!usuario) {

            mostrarUsuarioDesconectado();

            console.log(
                "No hay una sesión activa."
            );

            return;

        }

        try {

            const perfil =
                await asegurarPerfilUsuario(
                    usuario
                );

            mostrarUsuarioConectado(
                perfil
            );

            detenerPerfilVivo = observarPerfilViajero(
                usuario.uid,
                perfilActualizado => {
                    if (perfilActualizado) {
                        mostrarUsuarioConectado(perfilActualizado);
                    }
                }
            );



            console.log(
                "Sesión detectada:",
                perfil
            );

        } catch (error) {

            console.error(
                "No se pudo cargar el perfil:",
                error
            );

            mostrarUsuarioConectado({
                nombre:
                    usuario.displayName ||
                    usuario.email
                        ?.split("@")[0] ||
                    "Viajero",

                rango:
                    "Viajero"
            });

        }

    }
);


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        iniciarSistemaSesion
    );

} else {

    iniciarSistemaSesion();

}

export {
    perfilActivo
};

