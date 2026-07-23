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
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";


let botonComunidad = null;

let perfilActivo = null;


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

    if (
        !botonComunidad ||
        !perfil
    ) {

        return;

    }

    perfilActivo =
        perfil;

    botonComunidad.dataset.sesionActiva =
        "true";

    botonComunidad.setAttribute(
        "aria-expanded",
        "false"
    );

    botonComunidad.innerHTML = `
        <span aria-hidden="true">✦</span>

        <span class="boton-comunidad__nombre">
            ${escaparHTML(
                perfil.nombre ||
                "Viajero"
            )}
        </span>
    `;

    const menu =
        crearMenuUsuario();

    const nombre =
        menu.querySelector(
            "#menu-usuario-nombre"
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

}


// =========================================
// MOSTRAR ESTADO SIN SESIÓN
// =========================================

function mostrarUsuarioDesconectado() {

    perfilActivo =
        null;

    if (!botonComunidad) {

        return;

    }

    botonComunidad.dataset.sesionActiva =
        "false";

    botonComunidad.removeAttribute(
        "aria-expanded"
    );

    botonComunidad.innerHTML = `
        <span aria-hidden="true">✦</span>
        Comunidad
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

        menu.style.right =
            `${window.innerWidth - posicionBoton.right}px`;

        menu.style.bottom =
            "auto";

        menu.style.left =
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

