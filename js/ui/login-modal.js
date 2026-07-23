import {
    auth
} from "../firebase/firebase-config.js";

import {
    crearPerfilUsuario,
    asegurarPerfilUsuario

} from "../firebase/firestore.js";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

// =========================================
// MISIÓN I — EL PORTAL
// Control visual del acceso a la comunidad
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const portal =
            document.getElementById(
                "portal-universo"
            );

        const botonAbrir =
            document.getElementById(
                "abrir-portal"
            );

        const botonCerrar =
            document.getElementById(
                "cerrar-portal"
            );

        const fondoPortal =
            portal?.querySelector(
                "[data-cerrar-portal]"
            );

        const botonMostrarRegistro =
            document.getElementById(
                "mostrar-registro"
            );

        const botonMostrarLogin =
            document.getElementById(
                "mostrar-login"
            );

        const botonFinalizarBienvenida =
            document.getElementById(
                "finalizar-bienvenida"
            );

        const botonesContrasena =
            document.querySelectorAll(
                "[data-mostrar-contrasena]"
            );

        const formularioLogin =
            document.getElementById(
                "formulario-login"
            );

        const formularioRegistro =
            document.getElementById(
                "formulario-registro"
            );

        if (
            !portal ||
            !botonAbrir
        ) {

            console.warn(
                "No se encontró la estructura del portal."
            );

            return;

        }

        let elementoAnterior = null;


        // =========================================
        // ABRIR PORTAL
        // =========================================

        function abrirPortal() {

            elementoAnterior =
                document.activeElement;

            portal.classList.add(
                "portal-universo--activo"
            );

            portal.setAttribute(
                "aria-hidden",
                "false"
            );

            document.body.classList.add(
                "portal-abierto"
            );

            mostrarVista(
                "login"
            );

            window.setTimeout(
                function () {

                    const correoLogin =
                        document.getElementById(
                            "login-correo"
                        );

                    correoLogin?.focus();

                },
                300
            );

        }

        const sesionActiva =
            botonAbrir.dataset
             .sesionActiva ===
        "true";

        if (sesionActiva) {

            return;

        }


        // =========================================
        // CERRAR PORTAL
        // =========================================

        function cerrarPortal() {

            portal.classList.remove(
                "portal-universo--activo"
            );

            portal.setAttribute(
                "aria-hidden",
                "true"
            );

            document.body.classList.remove(
                "portal-abierto"
            );

            limpiarMensajes();

            window.setTimeout(
                function () {

                    mostrarVista(
                        "login"
                    );

                },
                350
            );

            if (
                elementoAnterior instanceof HTMLElement
            ) {

                elementoAnterior.focus();

            }

        }


        // =========================================
        // CAMBIAR VISTA
        // =========================================

        function mostrarVista(
            nombreVista
        ) {

            const vistas =
                portal.querySelectorAll(
                    ".portal-vista"
                );

            vistas.forEach(
                function (vista) {

                    const esVistaActiva =
                        vista.dataset.vista ===
                        nombreVista;

                    vista.classList.toggle(
                        "portal-vista--activa",
                        esVistaActiva
                    );

                    vista.hidden =
                        !esVistaActiva;

                }
            );

            limpiarMensajes();

            window.setTimeout(
                function () {

                    const vistaActiva =
                        portal.querySelector(
                            `.portal-vista[data-vista="${nombreVista}"]`
                        );

                    const primerCampo =
                        vistaActiva?.querySelector(
                            "input"
                        );

                    primerCampo?.focus();

                },
                100
            );

        }


        // =========================================
        // MOSTRAR U OCULTAR CONTRASEÑA
        // =========================================

        botonesContrasena.forEach(
            function (boton) {

                boton.addEventListener(
                    "click",
                    function () {

                        const idCampo =
                            boton.dataset
                                .mostrarContrasena;

                        const campo =
                            document.getElementById(
                                idCampo
                            );

                        if (!campo) {

                            return;

                        }

                        const estaOculta =
                            campo.type ===
                            "password";

                        campo.type =
                            estaOculta
                                ? "text"
                                : "password";

                        boton.setAttribute(
                            "aria-label",
                            estaOculta
                                ? "Ocultar contraseña"
                                : "Mostrar contraseña"
                        );

                        boton.classList.toggle(
                            "portal-campo__mostrar--activo",
                            estaOculta
                        );

                    }
                );

            }
        );


        // =========================================
        // VALIDAR LOGIN
        // =========================================

        function validarLogin() {

            const correo =
                document.getElementById(
                    "login-correo"
                );

            const contrasena =
                document.getElementById(
                    "login-contrasena"
                );

            let formularioValido = true;

            limpiarErroresFormulario(
                formularioLogin
            );

            if (
                !correo.value.trim()
            ) {

                mostrarError(
                    correo,
                    "Escribe tu correo electrónico."
                );

                formularioValido = false;

            } else if (
                !correo.validity.valid
            ) {

                mostrarError(
                    correo,
                    "Escribe un correo válido."
                );

                formularioValido = false;

            }

            if (
                !contrasena.value
            ) {

                mostrarError(
                    contrasena,
                    "Escribe tu contraseña."
                );

                formularioValido = false;

            } else if (
                contrasena.value.length < 6
            ) {

                mostrarError(
                    contrasena,
                    "La contraseña debe tener al menos 6 caracteres."
                );

                formularioValido = false;

            }

            return formularioValido;

        }


        // =========================================
        // VALIDAR REGISTRO
        // =========================================

        function validarRegistro() {

            const nombre =
                document.getElementById(
                    "registro-nombre"
                );

            const correo =
                document.getElementById(
                    "registro-correo"
                );

            const contrasena =
                document.getElementById(
                    "registro-contrasena"
                );

            const confirmar =
                document.getElementById(
                    "registro-confirmar"
                );

            const terminos =
                document.getElementById(
                    "registro-terminos"
                );

            let formularioValido = true;

            limpiarErroresFormulario(
                formularioRegistro
            );

            if (
                nombre.value.trim().length < 2
            ) {

                mostrarError(
                    nombre,
                    "Escribe un nombre de al menos 2 caracteres."
                );

                formularioValido = false;

            }

            if (
                !correo.value.trim()
            ) {

                mostrarError(
                    correo,
                    "Escribe tu correo electrónico."
                );

                formularioValido = false;

            } else if (
                !correo.validity.valid
            ) {

                mostrarError(
                    correo,
                    "Escribe un correo válido."
                );

                formularioValido = false;

            }

            if (
                contrasena.value.length < 6
            ) {

                mostrarError(
                    contrasena,
                    "La contraseña debe tener al menos 6 caracteres."
                );

                formularioValido = false;

            }

            if (
                confirmar.value !==
                contrasena.value
            ) {

                mostrarError(
                    confirmar,
                    "Las contraseñas no coinciden."
                );

                formularioValido = false;

            }

            if (
                !terminos.checked
            ) {

                const mensajeRegistro =
                    document.getElementById(
                        "mensaje-registro"
                    );

                mostrarMensaje(
                    mensajeRegistro,
                    "Debes aceptar las normas de convivencia.",
                    "error"
                );

                formularioValido = false;

            }

            return formularioValido;

        }


        // =========================================
        // MOSTRAR ERROR EN CAMPO
        // =========================================

        function mostrarError(
            campo,
            mensaje
        ) {

            campo.classList.add(
                "portal-campo__input--error"
            );

            const contenedorCampo =
                campo.closest(
                    ".portal-campo"
                );

            const elementoError =
                contenedorCampo?.querySelector(
                    ".portal-campo__error"
                );

            if (
                elementoError
            ) {

                elementoError.textContent =
                    mensaje;

            }

        }


        // =========================================
        // LIMPIAR ERRORES
        // =========================================

        function limpiarErroresFormulario(
            formulario
        ) {

            if (!formulario) {

                return;

            }

            formulario
                .querySelectorAll(
                    ".portal-campo__input--error"
                )
                .forEach(
                    function (campo) {

                        campo.classList.remove(
                            "portal-campo__input--error"
                        );

                    }
                );

            formulario
                .querySelectorAll(
                    ".portal-campo__error"
                )
                .forEach(
                    function (error) {

                        error.textContent = "";

                    }
                );

        }


        function limpiarMensajes() {

            const mensajes =
                portal.querySelectorAll(
                    ".portal-mensaje"
                );

            mensajes.forEach(
                function (mensaje) {

                    mensaje.textContent = "";

                    mensaje.classList.remove(
                        "portal-mensaje--error",
                        "portal-mensaje--exito"
                    );

                }
            );

            limpiarErroresFormulario(
                formularioLogin
            );

            limpiarErroresFormulario(
                formularioRegistro
            );

        }


        // =========================================
        // MENSAJES GENERALES
        // =========================================

        function mostrarMensaje(
            elemento,
            texto,
            tipo
        ) {

            if (!elemento) {

                return;

            }

            elemento.textContent =
                texto;

            elemento.classList.remove(
                "portal-mensaje--error",
                "portal-mensaje--exito"
            );

            elemento.classList.add(
                tipo === "exito"
                    ? "portal-mensaje--exito"
                    : "portal-mensaje--error"
            );

        }


                // =========================================
        // ESTADO DE CARGA DE LOS BOTONES
        // =========================================

        function activarCarga(
            boton,
            textoCarga
        ) {

            if (!boton) {
                return;
            }

            const texto =
                boton.querySelector(
                    ".portal-boton__texto"
                );

            boton.disabled = true;

            boton.classList.add(
                "portal-boton--cargando"
            );

            if (texto) {

                texto.dataset.textoOriginal =
                    texto.textContent.trim();

                texto.textContent =
                    textoCarga;

            }

        }


        function desactivarCarga(
            boton
        ) {

            if (!boton) {
                return;
            }

            const texto =
                boton.querySelector(
                    ".portal-boton__texto"
                );

            boton.disabled = false;

            boton.classList.remove(
                "portal-boton--cargando"
            );

            if (
                texto &&
                texto.dataset.textoOriginal
            ) {

                texto.textContent =
                    texto.dataset.textoOriginal;

                delete texto.dataset.textoOriginal;

            }

        }


        // =========================================
        // TRADUCIR ERRORES DE FIREBASE
        // =========================================

        function obtenerMensajeFirebase(
            codigo
        ) {

            const mensajes = {

                "auth/email-already-in-use":
                    "Ese correo ya forma parte del universo.",

                "auth/invalid-email":
                    "El correo electrónico no es válido.",

                "auth/weak-password":
                    "La contraseña es demasiado débil.",

                "auth/invalid-credential":
                    "El correo o la contraseña no son correctos.",

                "auth/user-disabled":
                    "Esta cuenta se encuentra desactivada.",

                "auth/too-many-requests":
                    "Hubo demasiados intentos. Espera un momento y vuelve a intentarlo.",

                "auth/network-request-failed":
                    "No pudimos conectar con el universo. Revisa tu conexión.",

                "auth/operation-not-allowed":
                    "El acceso con correo y contraseña no está habilitado.",
                  
                "auth/invalid-login-credentials":
                     "El correo o la contraseña no son correctos.",

                "auth/user-not-found":
                      "No encontramos ningún viajero con ese correo.",

                "auth/wrong-password":
                       "La contraseña no es correcta.",

                "auth/configuration-not-found":
                        "Firebase Authentication todavía no está configurado correctamente.",

                "auth/api-key-not-valid":
                        "La configuración de Firebase no es válida.",

                "auth/unauthorized-domain":
                         "Este dominio todavía no está autorizado en Firebase."

            };

            return (
                mensajes[codigo] ||
                "Ocurrió un problema inesperado. Inténtalo nuevamente."
            );

        }

        // =========================================
        // EVENTOS DEL PORTAL
        // =========================================

        botonAbrir.addEventListener(
            "click",
            abrirPortal
        );

        botonCerrar?.addEventListener(
            "click",
            cerrarPortal
        );

        fondoPortal?.addEventListener(
            "click",
            cerrarPortal
        );

        botonMostrarRegistro?.addEventListener(
            "click",
            function () {

                mostrarVista(
                    "registro"
                );

            }
        );

        botonMostrarLogin?.addEventListener(
            "click",
            function () {

                mostrarVista(
                    "login"
                );

            }
        );

        botonFinalizarBienvenida?.addEventListener(
           "click",
           function () {

                window.location.href =
               "perfil.html";

            }
        );


           // =========================================
        // INICIAR SESIÓN CON FIREBASE
        // =========================================

        formularioLogin?.addEventListener(
            "submit",
            async function (evento) {

                evento.preventDefault();

                if (
                    !validarLogin()
                ) {

                    return;

                }

                const correo =
                    document.getElementById(
                        "login-correo"
                    ).value.trim();

                const contrasena =
                    document.getElementById(
                        "login-contrasena"
                    ).value;

                const botonLogin =
                    document.getElementById(
                        "boton-login"
                    );

                const mensajeLogin =
                    document.getElementById(
                        "mensaje-login"
                    );

                limpiarMensajes();

                activarCarga(
                    botonLogin,
                    "Conectando..."
                );

                try {

                    const credencial =
                        await signInWithEmailAndPassword(
                            auth,
                            correo,
                            contrasena
                        );

                    const usuario =
                        credencial.user;

                    const perfil =
                        await asegurarPerfilUsuario(
                            usuario
                        );

                        mostrarMensaje(
                            mensajeLogin,
                         `Bienvenido nuevamente, ${perfil.nombre}.`,
                         "exito"
                        );

                        window.setTimeout(
                           function () {

                               window.location.href =
                                "perfil.html";

                            },
                            800
                        );

                    mostrarMensaje(
                        mensajeLogin,
                        "Acceso concedido. Bienvenido nuevamente.",
                        "exito"
                    );

                    console.log(
                        "Viajero conectado:",
                        usuario.uid
                    );

                    window.setTimeout(
                        function () {

                            cerrarPortal();

                        },
                        900
                    );

                } catch (error) {

                       console.error(
                       "Error completo al iniciar sesión:",
                        error
                        );

                        console.log(
                        "Código recibido de Firebase:",
                         error.code
                          );

                         mostrarMensaje(
                         mensajeLogin,
                         obtenerMensajeFirebase(
                         error.code
                         ),
                         "error"
                         );

                }
                
                    finally {

                    desactivarCarga(
                        botonLogin
                    );

                }

            }
        );


                // =========================================
        // CREAR CUENTA CON FIREBASE
        // =========================================

        formularioRegistro?.addEventListener(
            "submit",
            async function (evento) {

                evento.preventDefault();

                if (
                    !validarRegistro()
                ) {

                    return;

                }

                const nombre =
                    document.getElementById(
                        "registro-nombre"
                    ).value.trim();

                const correo =
                    document.getElementById(
                        "registro-correo"
                    ).value.trim();

                const contrasena =
                    document.getElementById(
                        "registro-contrasena"
                    ).value;

                const botonRegistro =
                    document.getElementById(
                        "boton-registro"
                    );

                const mensajeRegistro =
                    document.getElementById(
                        "mensaje-registro"
                    );

                limpiarMensajes();

                activarCarga(
                    botonRegistro,
                    "Iniciando el viaje..."
                );

                try {

                    const credencial =
                        await createUserWithEmailAndPassword(
                            auth,
                            correo,
                            contrasena
                        );

                    const usuario =
                        credencial.user;

                       

                    await updateProfile(
                        usuario,
                        {
                            displayName:
                                nombre
                        }
                    );
                    await crearPerfilUsuario(
                      usuario,
                      nombre
                    );
                    
                    const nombreBienvenida =
                        document.getElementById(
                            "nombre-bienvenida"
                        );

                    if (
                        nombreBienvenida
                    ) {

                        nombreBienvenida.textContent =
                            nombre;

                    }

                    formularioRegistro.reset();

                    console.log(
                        "Nuevo viajero creado:",
                        usuario.uid
                    );

                    mostrarVista(
                        "bienvenida"
                    );

                } catch (error) {

                    console.error(
                        "Error al crear la cuenta:",
                        error
                    );

                    mostrarMensaje(
                        mensajeRegistro,
                        obtenerMensajeFirebase(
                            error.code
                        ),
                        "error"
                    );

                } finally {

                    desactivarCarga(
                        botonRegistro
                    );

                }

            }
        );


        // =========================================
        // CERRAR CON ESCAPE
        // =========================================

        document.addEventListener(
            "keydown",
            function (evento) {

                const portalEstaAbierto =
                    portal.classList.contains(
                        "portal-universo--activo"
                    );

                if (
                    evento.key === "Escape" &&
                    portalEstaAbierto
                ) {

                    cerrarPortal();

                }

            }
        );


        console.log(
            "Portal del Universo cargado correctamente."
        );

    }
);