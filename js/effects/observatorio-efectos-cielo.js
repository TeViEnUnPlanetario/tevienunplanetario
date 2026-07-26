// ==================================================
// OBSERVATORIO — EFECTOS DEL CIELO
//
// Estrellas pintadas PNG y estrellas fugaces.
// ==================================================

const RUTAS_ESTRELLAS_PINTADAS = [
    "img/background/estrella 1.png",
    "img/background/estrella 2.png",
    "img/background/estrella 3.png",
    "img/background/estrella 4.png"
];


const REDUCIR_MOVIMIENTO =
    window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


let temporizadorRedimension =
    null;


let temporizadorEstrellaFugaz =
    null;


/* ==================================================
   INICIALIZACIÓN
================================================== */

function iniciarEfectosObservatorio() {

    const fondo =
        document.querySelector(
            ".observatorio-fondo"
        );


    if (!fondo) {

        console.warn(
            "No se encontró .observatorio-fondo."
        );

        return;

    }


    crearEstrellasPintadas(
        fondo
    );


    if (!REDUCIR_MOVIMIENTO) {

        programarEstrellaFugaz(
            fondo
        );

    }


    window.addEventListener(
        "resize",
        function () {

            window.clearTimeout(
                temporizadorRedimension
            );


            temporizadorRedimension =
                window.setTimeout(
                    function () {

                        crearEstrellasPintadas(
                            fondo
                        );

                    },
                    300
                );

        }
    );

}


/* ==================================================
   ESTRELLAS PINTADAS
================================================== */

function crearEstrellasPintadas(
    fondo
) {

    fondo
        .querySelector(
            ".observatorio-estrellas-pintadas"
        )
        ?.remove();


    const capa =
        document.createElement(
            "div"
        );


    capa.className =
        "observatorio-estrellas-pintadas";


    const esMovil =
        window.innerWidth <= 760;


    const alturaDocumento =
        Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight,
            window.innerHeight
        );


    /*
     * La capa fija se distribuye por la pantalla.
     * No necesitamos usar el banner del index.
     */
    const cantidad =
        esMovil
            ? 10
            : 18;


    for (
        let indice = 0;
        indice < cantidad;
        indice++
    ) {

        const estrella =
            document.createElement(
                "img"
            );


        estrella.className =
            "observatorio-estrella-pintada";


        estrella.src =
            elegirAleatorio(
                RUTAS_ESTRELLAS_PINTADAS
            );


        estrella.alt =
            "";


        estrella.setAttribute(
            "aria-hidden",
            "true"
        );


        const tamano =
            numeroAleatorio(
                esMovil ? 13 : 15,
                esMovil ? 25 : 32
            );


        estrella.style.width =
            `${tamano}px`;


        estrella.style.height =
            `${tamano}px`;


        estrella.style.left =
            `${numeroAleatorio(2, 96)}%`;


        estrella.style.top =
            `${numeroAleatorio(2, 96)}%`;


        estrella.style.setProperty(
            "--estrella-pintada-duracion",
            `${numeroAleatorio(5, 11)}s`
        );


        estrella.style.setProperty(
            "--estrella-pintada-retraso",
            `${numeroAleatorio(-10, 0)}s`
        );


        estrella.style.setProperty(
            "--estrella-pintada-opacidad",
            numeroAleatorio(
                0.12,
                0.38
            ).toFixed(2)
        );


        estrella.style.setProperty(
            "--estrella-pintada-rotacion",
            `${numeroAleatorio(-25, 25)}deg`
        );


        /*
         * La variable se conserva por si después
         * quieres repartirlas por toda la altura
         * real de la página.
         */
        estrella.dataset.alturaDocumento =
            String(
                alturaDocumento
            );


        capa.appendChild(
            estrella
        );

    }


    fondo.appendChild(
        capa
    );

}


/* ==================================================
   ESTRELLAS FUGACES
================================================== */

function crearEstrellaFugaz(
    fondo
) {

    const estrella =
        document.createElement(
            "span"
        );


    estrella.className =
        "observatorio-estrella-fugaz";


    /*
     * Comienza cerca del borde superior izquierdo
     * y cruza diagonalmente la pantalla.
     */
    estrella.style.left =
        `${numeroAleatorio(-12, 55)}%`;


    estrella.style.top =
        `${numeroAleatorio(-12, 35)}%`;


    estrella.style.setProperty(
        "--fugaz-duracion",
        `${numeroAleatorio(1.4, 2.1)}s`
    );


    estrella.style.setProperty(
        "--fugaz-longitud",
        `${numeroAleatorio(85, 145)}px`
    );


    fondo.appendChild(
        estrella
    );


    estrella.addEventListener(
        "animationend",
        function () {

            estrella.remove();

        },
        {
            once:
                true
        }
    );

}


function programarEstrellaFugaz(
    fondo
) {

    const espera =
        numeroAleatorio(
            9000,
            18000
        );


    temporizadorEstrellaFugaz =
        window.setTimeout(
            function () {

                crearEstrellaFugaz(
                    fondo
                );


                programarEstrellaFugaz(
                    fondo
                );

            },
            espera
        );

}


/* ==================================================
   UTILIDADES
================================================== */

function numeroAleatorio(
    minimo,
    maximo
) {

    return (
        Math.random() *
        (maximo - minimo)
    ) + minimo;

}


function elegirAleatorio(
    elementos
) {

    const indice =
        Math.floor(
            Math.random() *
            elementos.length
        );


    return elementos[
        indice
    ];

}


/* ==================================================
   ARRANQUE
================================================== */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        iniciarEfectosObservatorio
    );

}
else {

    iniciarEfectosObservatorio();

}