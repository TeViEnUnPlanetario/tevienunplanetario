document.addEventListener(
    "DOMContentLoaded",
    function () {

        iniciarRevelado();

        iniciarEscenasUniverso();

        iniciarBotonesContinuar();

        iniciarLluviaEstrellas();

    }
);


/* =========================
   FADE IN AL HACER SCROLL
========================= */

function iniciarRevelado() {

    const elementos =
        document.querySelectorAll(
            "[data-revelar]"
        );


    if (!elementos.length) {

        return;

    }


    if (
        !("IntersectionObserver" in window)
    ) {

        elementos.forEach(
            function (elemento) {

                elemento.classList.add(
                    "visible"
                );

            }
        );

        return;

    }


    const observador =
        new IntersectionObserver(

            function (entradas) {

                entradas.forEach(
                    function (entrada) {

                        if (
                            entrada.isIntersecting
                        ) {

                            entrada.target
                                .classList
                                .add(
                                    "visible"
                                );

                            observador.unobserve(
                                entrada.target
                            );

                        }

                    }
                );

            },

            {

                threshold: 0.28,

                rootMargin:
                    "0px 0px -12% 0px"

            }

        );


    elementos.forEach(
        function (elemento) {

            observador.observe(
                elemento
            );

        }
    );

}


/* =========================
   CONTINUAR AL SIGUIENTE BLOQUE
========================= */

function iniciarBotonesContinuar() {

    const bloques =
        Array.from(
            document.querySelectorAll(
                ".portada-bloque"
            )
        );


    bloques.forEach(
        function (bloque, indice) {

            const boton =
                bloque.querySelector(
                    ".indicador-continuar"
                );


            if (!boton) {

                return;

            }


            const siguienteBloque =
                bloques[indice + 1];


            /*
                El último botón conserva
                su enlace hacia la dedicatoria.
            */

            if (!siguienteBloque) {

                return;

            }


            boton.addEventListener(
                "click",
                function (evento) {

                    evento.preventDefault();


                    siguienteBloque.scrollIntoView({

                        behavior: "smooth",

                        block: "center"

                    });

                }
            );

        }
    );

}

/* =========================
   EL UNIVERSO DESPIERTA
========================= */

function iniciarDespertarUniverso() {

    const fondo =
        document.querySelector(
            ".fondo-universo"
        );


    if (!fondo) {

        return;

    }


    let actualizacionPendiente = false;


    function actualizarUniverso() {

        const documento =
            document.documentElement;

        const recorridoDisponible =
            documento.scrollHeight -
            window.innerHeight;


        const progreso =
            recorridoDisponible > 0

                ? window.scrollY /
                    recorridoDisponible

                : 0;


        const progresoLimitado =
            Math.min(
                Math.max(
                    progreso,
                    0
                ),
                1
            );


        fondo.style.setProperty(

            "--despertar-universo",

            progresoLimitado.toFixed(3)

        );


        actualizacionPendiente = false;

    }


    function solicitarActualizacion() {

        if (actualizacionPendiente) {

            return;

        }


        actualizacionPendiente = true;


        window.requestAnimationFrame(
            actualizarUniverso
        );

    }


    actualizarUniverso();


    window.addEventListener(
        "scroll",
        solicitarActualizacion,
        {
            passive: true
        }
    );


    window.addEventListener(
        "resize",
        solicitarActualizacion
    );

}


// =========================
// UNIVERSO POR ESCENAS
// =========================

function iniciarEscenasUniverso(){

    const escenas =
        document.querySelectorAll(
            "[data-nivel]"
        );

    if (!escenas.length) {

        return;

    }

    const observador =
        new IntersectionObserver(

            function(entradas){

                entradas.forEach(

                    function(entrada){

                        if (
                            !entrada.isIntersecting
                        ) {

                            return;

                        }

                        activarNivelUniverso(

                            Number(
                                entrada.target.dataset.nivel
                            )

                        );

                    }

                );

            },

            {

                threshold: 0.60

            }

        );

    escenas.forEach(

        function(escena){

            observador.observe(
                escena
            );

        }

    );

}

// =========================
// ACTIVAR NIVEL
// =========================

function activarNivelUniverso(nivel){

    document.body.dataset.nivelUniverso =
        nivel;

    console.log(
        "Nivel del universo:",
        nivel
    );

}

// =========================
// LLUVIA DE ESTRELLAS
// =========================

function iniciarLluviaEstrellas() {

    const contenedor =
        document.querySelector(
            ".estrellas-fugaces"
        );

    if (!contenedor) {

        console.warn(
            "No se encontró el contenedor de estrellas fugaces."
        );

        return;

    }

    const movimientoReducido =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );

    let temporizador = null;

    let sistemaActivo = true;


    function obtenerNivelActual() {

        const nivel =
            Number(
                document.body.dataset.nivelUniverso
            );

        if (!Number.isFinite(nivel)) {

            return 0;

        }

        return nivel;

    }


    function obtenerEsperaSegunNivel(nivel) {

        const intervalos = {

            0: null,

            1: null,

            2: null,

            3: [
                18000,
                28000
            ],

            4: [
                13000,
                21000
            ],

            5: [
                9000,
                16000
            ],

            6: [
                7000,
                13000
            ],

            7: [
                5500,
                10500
            ],

            8: [
                4500,
                9000
            ]

        };

        return intervalos[nivel] ?? null;

    }


    function numeroAleatorio(
        minimo,
        maximo
    ) {

        return (
            Math.random() *
            (maximo - minimo) +
            minimo
        );

    }


    function crearEstrellaFugaz() {

        if (
            movimientoReducido.matches ||
            document.hidden
        ) {

            return;

        }

        const nivel =
            obtenerNivelActual();

        if (nivel < 3) {

            return;

        }

        const estrella =
            document.createElement(
                "span"
            );

        estrella.className =
            "estrella-fugaz";

        const inicioX =
            numeroAleatorio(
                -15,
                75
            );

        const inicioY =
            numeroAleatorio(
                4,
                58
            );

        const recorridoX =
            numeroAleatorio(
                38,
                72
            );

        const recorridoY =
            numeroAleatorio(
                22,
                50
            );

        const angulo =
            numeroAleatorio(
                22,
                38
            );

        const longitud =
            numeroAleatorio(
                85,
                185
            );

        const duracion =
            numeroAleatorio(
                1.05,
                1.85
            );

        const brilloMaximo =
            Math.min(
                .35 +
                nivel * .065,
                .90
            );

        const brillo =
            numeroAleatorio(
                brilloMaximo * .65,
                brilloMaximo
            );

        estrella.style.setProperty(
            "--inicio-x",
            `${inicioX}vw`
        );

        estrella.style.setProperty(
            "--inicio-y",
            `${inicioY}vh`
        );

        estrella.style.setProperty(
            "--recorrido-x",
            `${recorridoX}vw`
        );

        estrella.style.setProperty(
            "--recorrido-y",
            `${recorridoY}vh`
        );

        estrella.style.setProperty(
            "--angulo-estrella",
            `${angulo}deg`
        );

        estrella.style.setProperty(
            "--longitud-estrella",
            `${longitud}px`
        );

        estrella.style.setProperty(
            "--duracion-estrella",
            `${duracion}s`
        );

        estrella.style.setProperty(
            "--brillo-estrella",
            brillo.toFixed(2)
        );

        contenedor.appendChild(
            estrella
        );

        estrella.addEventListener(
            "animationend",
            function () {

                estrella.remove();

            },
            {
                once: true
            }
        );

    }


    function programarSiguienteEstrella() {

        clearTimeout(
            temporizador
        );

        if (
            !sistemaActivo ||
            movimientoReducido.matches
        ) {

            return;

        }

        const nivel =
            obtenerNivelActual();

        const intervalo =
            obtenerEsperaSegunNivel(
                nivel
            );

        if (!intervalo) {

            temporizador =
                setTimeout(
                    programarSiguienteEstrella,
                    2500
                );

            return;

        }

        const espera =
            numeroAleatorio(
                intervalo[0],
                intervalo[1]
            );

        temporizador =
            setTimeout(
                function () {

                    crearEstrellaFugaz();

                    const probabilidadDoble =
                        nivel >= 6
                            ? .18
                            : .05;

                    if (
                        Math.random() <
                        probabilidadDoble
                    ) {

                        setTimeout(
                            crearEstrellaFugaz,
                            numeroAleatorio(
                                500,
                                1400
                            )
                        );

                    }

                    programarSiguienteEstrella();

                },
                espera
            );

    }


    document.addEventListener(
        "visibilitychange",
        function () {

            if (document.hidden) {

                clearTimeout(
                    temporizador
                );

                return;

            }

            programarSiguienteEstrella();

        }
    );


    movimientoReducido.addEventListener(
        "change",
        function () {

            programarSiguienteEstrella();

        }
    );


    programarSiguienteEstrella();

}