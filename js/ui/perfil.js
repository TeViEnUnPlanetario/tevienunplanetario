// =========================================
// PERFIL DEL VIAJERO
// Te Vi En Un Planetario
// =========================================

import {
    auth
} from "../firebase/firebase-config.js";

import {
    obtenerPerfilUsuario,
    asegurarPerfilUsuario
} from "../firebase/firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";


const elementos = {

    cargando:
        document.getElementById(
            "perfil-cargando"
        ),

    contenido:
        document.getElementById(
            "perfil-contenido"
        ),

    error:
        document.getElementById(
            "perfil-error"
        ),

    errorMensaje:
        document.getElementById(
            "perfil-error-mensaje"
        ),

    nombre:
        document.getElementById(
            "perfil-nombre"
        ),

    correo:
        document.getElementById(
            "perfil-correo"
        ),

    rango:
        document.getElementById(
            "perfil-rango"
        ),

    biografia:
        document.getElementById(
            "perfil-biografia"
        ),

    fechaRegistro:
        document.getElementById(
            "perfil-fecha-registro"
        ),

    publicaciones:
        document.getElementById(
            "perfil-publicaciones"
        ),

    comentarios:
        document.getElementById(
            "perfil-comentarios"
        ),

    favoritos:
        document.getElementById(
            "perfil-favoritos"
        ),

    avatar:
        document.getElementById(
            "perfil-avatar"
        ),

    avatarInicial:
        document.getElementById(
            "perfil-avatar-inicial"
        ),

    avatarImagen:
        document.getElementById(
            "perfil-avatar-imagen"
        ),

    cerrarSesion:
        document.getElementById(
            "perfil-cerrar-sesion"
        )

};


// =========================================
// MOSTRAR PERFIL
// =========================================

function mostrarPerfil(
    perfil
) {

    elementos.nombre.textContent =
        perfil.nombre ||
        "Viajero";

    elementos.correo.textContent =
        perfil.correo ||
        "";

    elementos.rango.innerHTML = `
        <span aria-hidden="true">🌠</span>
        ${escaparHTML(
            perfil.rango ||
            "Viajero"
        )}
    `;

    elementos.biografia.textContent =
        perfil.biografia?.trim() ||
        "Este viajero todavía no ha escrito su historia.";

    elementos.publicaciones.textContent =
        perfil.publicaciones ??
        0;

    elementos.comentarios.textContent =
        perfil.comentarios ??
        0;

    elementos.favoritos.textContent =
        perfil.favoritos ??
        0;

    mostrarFechaRegistro(
        perfil.fechaRegistro
    );

    mostrarAvatar(
        perfil
    );

    elementos.cargando.hidden =
        true;

    elementos.error.hidden =
        true;

    elementos.contenido.hidden =
        false;

}


// =========================================
// MOSTRAR FECHA
// =========================================

function mostrarFechaRegistro(
    fechaFirestore
) {

    if (!fechaFirestore) {

        elementos.fechaRegistro.textContent =
            "Fecha no disponible";

        return;

    }

    let fecha;

    if (
        typeof fechaFirestore.toDate ===
        "function"
    ) {

        fecha =
            fechaFirestore.toDate();

    } else {

        fecha =
            new Date(
                fechaFirestore
            );

    }

    elementos.fechaRegistro.textContent =
        new Intl.DateTimeFormat(
            "es-MX",
            {
                day:
                    "numeric",

                month:
                    "long",

                year:
                    "numeric"
            }
        ).format(
            fecha
        );

}


// =========================================
// MOSTRAR AVATAR
// =========================================

function mostrarAvatar(
    perfil
) {

    const nombre =
        perfil.nombre ||
        "Viajero";

    const inicial =
        nombre
            .trim()
            .charAt(0)
            .toUpperCase() ||
        "V";

    elementos.avatarInicial.textContent =
        inicial;

    if (!perfil.foto) {

        elementos.avatarImagen.hidden =
            true;

        elementos.avatarInicial.hidden =
            false;

        return;

    }

    elementos.avatarImagen.src =
        perfil.foto;

    elementos.avatarImagen.hidden =
        false;

    elementos.avatarInicial.hidden =
        true;

    elementos.avatarImagen.onerror =
        function () {

            elementos.avatarImagen.hidden =
                true;

            elementos.avatarInicial.hidden =
                false;

        };

}


// =========================================
// MOSTRAR ERROR
// =========================================

function mostrarError(
    mensaje
) {

    elementos.cargando.hidden =
        true;

    elementos.contenido.hidden =
        true;

    elementos.error.hidden =
        false;

    elementos.errorMensaje.textContent =
        mensaje;

}


// =========================================
// CERRAR SESIÓN
// =========================================

async function cerrarSesion() {

    try {

        await signOut(
            auth
        );

        window.location.replace(
            "index.html"
        );

    } catch (error) {

        console.error(
            "No se pudo cerrar la sesión:",
            error
        );

        mostrarError(
            "No pudimos cerrar la sesión. Inténtalo nuevamente."
        );

    }

}


// =========================================
// ESCAPAR HTML
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
// EVENTOS
// =========================================

elementos.cerrarSesion
    ?.addEventListener(
        "click",
        cerrarSesion
    );


// =========================================
// DETECTAR SESIÓN
// =========================================

onAuthStateChanged(
    auth,
    async function (usuario) {

        if (!usuario) {

            window.location.replace(
                "index.html"
            );

            return;

        }

        try {

            let perfil =
                await obtenerPerfilUsuario(
                    usuario.uid
                );

            if (!perfil) {

                perfil =
                    await asegurarPerfilUsuario(
                        usuario
                    );

            }

            mostrarPerfil(
                perfil
            );

            console.log(
                "Perfil cargado correctamente:",
                perfil
            );

        } catch (error) {

            console.error(
                "No se pudo cargar el perfil:",
                error
            );

            mostrarError(
                "Ocurrió un problema al cargar tu información."
            );

        }

    }
);