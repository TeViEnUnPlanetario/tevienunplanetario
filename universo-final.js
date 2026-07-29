document.addEventListener(
    "DOMContentLoaded",
    function () {

        iniciarUniversoFinal();

    }
);


// =========================
// INICIO GENERAL
// =========================

function iniciarUniversoFinal() {

    const cielo =
        document.querySelector(
            ".estrellas-fondo"
        );

    const acceso =
        document.querySelector(
            ".bienvenida-acceso"
        );

    const boton =
        document.querySelector(
            "#boton-entrar"
        );


    if (
        !cielo ||
        !acceso ||
        !boton
    ) {

        console.warn(
            "No se pudo iniciar universo-final.js"
        );

        return;

    }


    crearCieloAleatorio(
        cielo
    );


    crearConstelacionFinal(
        acceso
    );


    iniciarSaltoHiperespacio(
        boton
    );

}


// =========================
// CIELO ALEATORIO
// =========================

function crearCieloAleatorio(
    contenedor
) {

    contenedor.innerHTML = "";


    const cantidad =
        window.innerWidth <= 600
            ? 115
            : 190;


    for (
        let indice = 0;
        indice < cantidad;
        indice++
    ) {

        const estrella =
            document.createElement(
                "span"
            );


        estrella.className =
            "estrella-cielo-random";


        const estrellaBrillante =
            Math.random() < .14;


        const tamano =
            estrellaBrillante
                ? aleatorio(
                    1.4,
                    2.7
                )
                : aleatorio(
                    .45,
                    1.35
                );


        estrella.style.setProperty(
            "--x",
            `${aleatorio(
                1,
                99
            ).toFixed(2)}%`
        );


        estrella.style.setProperty(
            "--y",
            `${aleatorio(
                1,
                99
            ).toFixed(2)}%`
        );


        estrella.style.setProperty(
            "--tamano",
            `${tamano.toFixed(2)}px`
        );


        estrella.style.setProperty(
            "--opacidad",
            aleatorio(
                .28,
                estrellaBrillante
                    ? 1
                    : .72
            ).toFixed(2)
        );


        estrella.style.setProperty(
            "--duracion",
            `${aleatorio(
                2.6,
                7.8
            ).toFixed(2)}s`
        );


        estrella.style.setProperty(
            "--retraso",
            `${aleatorio(
                -8,
                0
            ).toFixed(2)}s`
        );


        contenedor.appendChild(
            estrella
        );

    }

}


// =========================
// NÚMERO ALEATORIO
// =========================

function aleatorio(
    minimo,
    maximo
) {

    return (
        Math.random() *
        (maximo - minimo) +
        minimo
    );

}


// =========================
// CONSTELACIÓN FINAL
// =========================

function crearConstelacionFinal(
    seccion
) {

    const constelacionAnterior =
        seccion.querySelector(
            ".constelacion-final"
        );


    if (constelacionAnterior) {

        constelacionAnterior.remove();

    }


    const constelacion =
        document.createElement(
            "div"
        );


    constelacion.className =
        "constelacion-final";


    constelacion.setAttribute(
        "aria-hidden",
        "true"
    );


    const cantidadEstrellas =
        window.innerWidth <= 600
            ? 40
            : 52;


    for (
        let indice = 0;
        indice < cantidadEstrellas;
        indice++
    ) {

        const estrella =
            document.createElement(
                "span"
            );


        estrella.className =
            "estrella-pintada-final";


        estrella.textContent =
            Math.random() < .30
                ? "✧"
                : "✦";


        /*
            Se utiliza una distribución
            radial concentrada para que
            las estrellas aparezcan juntas.
        */

        const angulo =
            Math.random() *
            Math.PI *
            2;


        const radio =
            Math.pow(
                Math.random(),
                1.85
            ) *
            42;


        const posicionX =
            50 +
            Math.cos(
                angulo
            ) *
            radio;


        const posicionY =
            50 +
            Math.sin(
                angulo
            ) *
            radio;


        estrella.style.setProperty(
            "--x",
            `${posicionX.toFixed(2)}%`
        );


        estrella.style.setProperty(
            "--y",
            `${posicionY.toFixed(2)}%`
        );


        estrella.style.setProperty(
            "--tamano",
            `${aleatorio(
                7,
                20
            ).toFixed(1)}px`
        );


        estrella.style.setProperty(
            "--rotacion",
            `${aleatorio(
                -30,
                30
            ).toFixed(1)}deg`
        );


        estrella.style.setProperty(
            "--duracion",
            `${aleatorio(
                2.4,
                6
            ).toFixed(2)}s`
        );


        estrella.style.setProperty(
            "--retraso",
            `${aleatorio(
                -6,
                0
            ).toFixed(2)}s`
        );


        constelacion.appendChild(
            estrella
        );

    }


    /*
        Se coloca al principio de la
        sección de acceso.
    */

    seccion.prepend(
        constelacion
    );

}


// =========================
// SALTO AL HIPERESPACIO
// =========================

function iniciarSaltoHiperespacio(
    boton
) {

    let navegando = false;


    boton.addEventListener(
        "click",
        function (evento) {

            evento.preventDefault();


            if (navegando) {

                return;

            }


            navegando = true;


            const destino =
                boton.getAttribute(
                    "href"
                ) ||
                "index.html";


            /*
                Primero calculamos hacia
                dónde viajará cada estrella.
            */

            prepararVectoresHiperespacio();


            /*
                Esta clase activa las
                animaciones del CSS.
            */

            document.body
                .classList
                .add(
                    "salto-hiperespacio"
                );


            /*
                El destello aparece después
                de que las estrellas comienzan
                a acelerarse.
            */

            setTimeout(
                function () {

                    document.body
                        .classList
                        .add(
                            "salto-destello"
                        );

                },
                720
            );


            /*
                Finalmente se abre
                la página principal.
            */

            setTimeout(
                function () {

                    window.location.href =
                        destino;

                },
                1450
            );

        }
    );

}


// =========================
// VECTORES DE MOVIMIENTO
// =========================

function prepararVectoresHiperespacio() {

    const estrellas =
        document.querySelectorAll(
            ".estrella-cielo-random, " +
            ".estrella-pintada-final, " +
            ".estrella-fugaz"
        );


    const centroPantallaX =
        window.innerWidth / 2;


    const centroPantallaY =
        window.innerHeight / 2;


    estrellas.forEach(
        function (estrella) {

            const posicion =
                estrella.getBoundingClientRect();


            const centroEstrellaX =
                posicion.left +
                posicion.width / 2;


            const centroEstrellaY =
                posicion.top +
                posicion.height / 2;


            let direccionX =
                centroEstrellaX -
                centroPantallaX;


            let direccionY =
                centroEstrellaY -
                centroPantallaY;


            /*
                Evitamos que una estrella
                exactamente centrada no tenga
                dirección de movimiento.
            */

            if (
                Math.abs(
                    direccionX
                ) < 4 &&
                Math.abs(
                    direccionY
                ) < 4
            ) {

                const angulo =
                    Math.random() *
                    Math.PI *
                    2;


                direccionX =
                    Math.cos(
                        angulo
                    );


                direccionY =
                    Math.sin(
                        angulo
                    );

            }


            const longitud =
                Math.hypot(
                    direccionX,
                    direccionY
                ) || 1;


            /*
                Cada estrella recorre una
                distancia diferente para
                evitar que se vea mecánico.
            */

            const distancia =
                aleatorio(
                    520,
                    1150
                );


            const salidaX =
                direccionX /
                longitud *
                distancia;


            const salidaY =
                direccionY /
                longitud *
                distancia;


            const anguloSalida =
                Math.atan2(
                    salidaY,
                    salidaX
                ) *
                180 /
                Math.PI;


            estrella.style.setProperty(
                "--salida-x",
                `${salidaX.toFixed(1)}px`
            );


            estrella.style.setProperty(
                "--salida-y",
                `${salidaY.toFixed(1)}px`
            );


            estrella.style.setProperty(
                "--angulo-salida",
                `${anguloSalida.toFixed(1)}deg`
            );


            estrella.style.setProperty(
                "--duracion-salida",
                `${aleatorio(
                    .72,
                    1.18
                ).toFixed(2)}s`
            );

        }
    );

}