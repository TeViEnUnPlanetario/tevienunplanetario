// =========================
// EFECTOS VISUALES
// =========================
console.log("efectos.js cargado correctamente");
document.addEventListener("DOMContentLoaded", function(){

    const reduceMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

    const esEscritorio =
    window.innerWidth > 900;


    // =========================
    // CIELO ESTRELLADO
// =========================

{

    const contenedorParticulas =
        document.createElement("div");

    contenedorParticulas.className =
        "particulas-fondo";

    document.body.prepend(
        contenedorParticulas
    );


    const cantidadEstrellas =
        window.innerWidth <= 900 ? 18 : 40;


    for(let i = 0; i < cantidadEstrellas; i++){

        const estrella =
            document.createElement("span");

        estrella.className =
            "particula";


       const posicionX =
    Math.random() * 100;


const escenaLunar =
    document.querySelector(
        ".escena-lunar-footer"
    );


let posicionY;


if (escenaLunar) {

    const rectEscena =
        escenaLunar
            .getBoundingClientRect();


    const limiteSuperiorEscena =
        Math.max(
            0,
            Math.min(
                100,
                (
                    rectEscena.top /
                    window.innerHeight
                ) * 100
            )
        );


    const margenSeguridad =
        3;


    posicionY =
        Math.random() *
        Math.max(
            0,
            limiteSuperiorEscena -
            margenSeguridad
        );

} else {

    posicionY =
        Math.random() * 100;

}

        const tamano =
            1.5 + Math.random() * 3;

        const duracion =
            2.5 + Math.random() * 5;

        const retraso =
            Math.random() * -6;


        estrella.style.left =
            posicionX + "%";

        estrella.style.top =
            posicionY + "%";

        estrella.style.width =
            tamano + "px";

        estrella.style.height =
            tamano + "px";

        estrella.style.animationDuration =
            duracion + "s";

        estrella.style.animationDelay =
            retraso + "s";


        contenedorParticulas.appendChild(
            estrella
        );

    }


    function crearEstrellaFugaz(){

        const estrellaFugaz =
            document.createElement("span");

        estrellaFugaz.className =
            "estrella-fugaz";


        estrellaFugaz.style.left =
            (-25 + Math.random() * 35) + "%";

        estrellaFugaz.style.top =
            (-180 + Math.random() * 100) + "px";


        contenedorParticulas.appendChild(
            estrellaFugaz
        );


        setTimeout(function(){

            estrellaFugaz.remove();

        },2500);

    }


    function programarEstrellaFugaz(){

        const espera =
            8000 + Math.random() * 9000;


        setTimeout(function(){

            crearEstrellaFugaz();

            programarEstrellaFugaz();

        },espera);

    }


    if(!reduceMotion){

        programarEstrellaFugaz();

    }

}



// =========================
// ESTRELLAS PINTADAS PNG
// =========================

const rutasEstrellasPintadas = [

    "img/background/estrella 1.png",
    "img/background/estrella 2.png",
    "img/background/estrella 3.png",
    "img/background/estrella 4.png"

];


let temporizadorRedimensionEstrellas;


function numeroAleatorio(minimo, maximo){

    return (
        Math.random() *
        (maximo - minimo)
    ) + minimo;

}


function crearEstrellasPintadas(){

    const bannerPrincipal =
        document.querySelector(".banner");


    if(!bannerPrincipal){
        return;
    }


    /*
       Eliminar la capa anterior para evitar
       estrellas duplicadas al redimensionar.
    */

    const capaAnterior =
        document.querySelector(
            ".estrellas-pintadas-fondo"
        );


    if(capaAnterior){

        capaAnterior.remove();

    }


    const capaEstrellas =
        document.createElement("div");


    capaEstrellas.className =
        "estrellas-pintadas-fondo";


    /*
       La capa comienza exactamente después
       del borde inferior del banner.
    */

    const inicioEstrellas =
        bannerPrincipal.offsetTop +
        bannerPrincipal.offsetHeight;


    const alturaDocumento =
        Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight
        );


    const alturaDisponible =
        Math.max(
            0,
            alturaDocumento - inicioEstrellas
        );


    capaEstrellas.style.top =
        inicioEstrellas + "px";


    capaEstrellas.style.height =
        alturaDisponible + "px";


    document.body.appendChild(
        capaEstrellas
    );


    const esMovil =
        window.innerWidth <= 900;


    /*
       La cantidad depende de la altura real
       de la página para que no queden amontonadas.
    */

    const cantidadBase =
        Math.floor(
            alturaDisponible /
            (esMovil ? 300 : 240)
        );


    const cantidadEstrellas =
        esMovil
            ? Math.min(
                22,
                Math.max(12, cantidadBase)
            )
            : Math.min(
                42,
                Math.max(20, cantidadBase)
            );


    for(
        let indiceEstrella = 0;
        indiceEstrella < cantidadEstrellas;
        indiceEstrella++
    ){

        const estrella =
            document.createElement("img");


        estrella.className =
            "estrella-pintada";


        /*
           Elegir aleatoriamente uno
           de los cuatro diseños.
        */

        const rutaAleatoria =
            rutasEstrellasPintadas[
                Math.floor(
                    Math.random() *
                    rutasEstrellasPintadas.length
                )
            ];


        estrella.src =
            encodeURI(rutaAleatoria);


        estrella.alt = "";

        estrella.setAttribute(
            "aria-hidden",
            "true"
        );

        estrella.addEventListener("error", function(){
            console.error(
                "No se pudo cargar la estrella PNG:",
                estrella.src
            );
        });


        /*
           Posición aleatoria dentro
           de toda la página.
        */

        const posicionX =
            numeroAleatorio(2, 96);


        const posicionY =
            numeroAleatorio(1, 98);


        /*
           Diferentes tamaños.
        */

        const tamano =
            esMovil
                ? numeroAleatorio(16, 18)
                : numeroAleatorio(22, 60);


        const duracion =
            numeroAleatorio(6, 14);


        /*
           Retraso negativo:
           algunas ya estarán visibles
           cuando cargue la página.
        */

        const retraso =
            numeroAleatorio(
                -duracion,
                0
            );


        const opacidad =
            numeroAleatorio(.55, .90);


        const rotacionInicial =
            numeroAleatorio(-15, 15);


        const rotacionFinal =
            rotacionInicial +
            numeroAleatorio(-10, 10);


        estrella.style.left =
            posicionX + "%";


        estrella.style.top =
            posicionY + "%";


        estrella.style.width =
            tamano + "px";


        estrella.style.height =
            tamano + "px";


        estrella.style.animationDuration =
            duracion + "s";


        estrella.style.animationDelay =
            retraso + "s";


        estrella.style.setProperty(
            "--opacidad-maxima",
            opacidad
        );


        estrella.style.setProperty(
            "--rotacion-inicial",
            rotacionInicial + "deg"
        );


        estrella.style.setProperty(
            "--rotacion-final",
            rotacionFinal + "deg"
        );


        capaEstrellas.appendChild(
            estrella
        );

    }

}




/*
   Esperar a que imágenes, iframes y demás
   contenido definan la altura final.
*/

/*
   Crear las estrellas inmediatamente.
   Se repite al terminar de cargar todo para
   recalcular la altura final del documento.
*/

crearEstrellasPintadas();

window.addEventListener(
    "load",
    crearEstrellasPintadas
);


/*
   Regenerar cuando cambie el tamaño,
   pero con una pequeña espera para evitar
   ejecutarlo decenas de veces.
*/

window.addEventListener(
    "resize",
    function(){

        clearTimeout(
            temporizadorRedimensionEstrellas
        );


        temporizadorRedimensionEstrellas =
            setTimeout(
                crearEstrellasPintadas,
                250
            );

    }
);


// =========================================================
// DESTELLOS MÓVILES DEL TÍTULO
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function(){

        const titulo =
            document.querySelector(
                ".titulo-cosmico"
            );


        if (!titulo) {

            console.warn(
                "No se encontró .titulo-cosmico"
            );

            return;

        }


        const reduceMotion =
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;


        if (reduceMotion) {
            return;
        }


        const cantidad =
            window.innerWidth <= 600
                ? 3
                : 5;


        function cambiarPosicion(
            particula
        ){

            /*
               Elegimos uno de los cuatro lados
               del título para evitar tapar letras.
            */

            const lado =
                Math.floor(
                    Math.random() * 4
                );


            let posicionX;
            let posicionY;


            switch (lado) {

                /* Arriba */

                case 0:

                    posicionX =
                        4 + Math.random() * 92;

                    posicionY =
                        -5 + Math.random() * 14;

                    break;


                /* Abajo */

                case 1:

                    posicionX =
                        4 + Math.random() * 92;

                    posicionY =
                        88 + Math.random() * 17;

                    break;


                /* Izquierda */

                case 2:

                    posicionX =
                        -1 + Math.random() * 8;

                    posicionY =
                        15 + Math.random() * 70;

                    break;


                /* Derecha */

                default:

                    posicionX =
                        93 + Math.random() * 8;

                    posicionY =
                        15 + Math.random() * 70;

                    break;

            }


            particula.style.left =
                posicionX + "%";


            particula.style.top =
                posicionY + "%";


            const tamaño =
                14 + Math.random() * 12;


            particula.style.setProperty(
                "--tamano-estrella",
                tamaño + "px"
            );


            const rotacion =
                -15 + Math.random() * 30;


            particula.style.setProperty(
                "--rotacion-estrella",
                rotacion + "deg"
            );

        }


        function activarDestello(
            particula
        ){

            /*
               Primero queda invisible.
            */

            particula.classList.remove(
                "estrella-visible"
            );


            /*
               Cambiamos su posición mientras
               permanece oculta.
            */

            cambiarPosicion(
                particula
            );


            /*
               Un pequeño retraso permite reiniciar
               correctamente la animación.
            */

            requestAnimationFrame(
                function(){

                    requestAnimationFrame(
                        function(){

                            particula.classList.add(
                                "estrella-visible"
                            );

                        }
                    );

                }
            );


            /*
               Espera aleatoria antes de aparecer
               nuevamente en otro lugar.
            */

            const siguienteDestello =
                1300 +
                Math.random() * 2600;


            setTimeout(
                function(){

                    activarDestello(
                        particula
                    );

                },
                siguienteDestello
            );

        }


        for (
            let indice = 0;
            indice < cantidad;
            indice++
        ) {

            const particula =
                document.createElement(
                    "span"
                );


            particula.className =
                "particula-titulo";


            particula.setAttribute(
                "aria-hidden",
                "true"
            );


            titulo.appendChild(
                particula
            );


            /*
               Cada estrella inicia en un momento
               distinto para que no parpadeen juntas.
            */

            setTimeout(
                function(){

                    activarDestello(
                        particula
                    );

                },
                300 +
                indice * 550 +
                Math.random() * 700
            );

        }


        console.log(
            "Destellos móviles del título:",
            cantidad
        );

    }
);


crearParticulasTitulo();

}); // Cierra: document.addEventListener("DOMContentLoaded", ...)


// =========================================================
// PARTÍCULAS EXCLUSIVAS DEL TÍTULO
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function(){

        const titulo =
            document.querySelector(
                ".titulo-cosmico"
            );


        if (!titulo) {

            console.warn(
                "No se encontró .titulo-cosmico"
            );

            return;

        }


        /*
           Posiciones controladas alrededor del título.
           Esto garantiza que siempre aparezcan.
        */

        const esMovil =
    window.innerWidth <= 600;


const posiciones =
    esMovil
        ? [

            /*
               En móvil permanecen dentro
               del área visible del título.
            */

            {
                izquierda: "3%",
                arriba: "18%"
            },

            {
                izquierda: "26%",
                arriba: "4%"
            },

            {
                izquierda: "73%",
                arriba: "5%"
            },

            {
                izquierda: "96%",
                arriba: "55%"
            }

        ]
        : [

            {
                izquierda: "2%",
                arriba: "12%"
            },

            {
                izquierda: "22%",
                arriba: "-8%"
            },

            {
                izquierda: "48%",
                arriba: "3%"
            },

            {
                izquierda: "74%",
                arriba: "-6%"
            },

            {
                izquierda: "98%",
                arriba: "30%"
            },

            {
                izquierda: "88%",
                arriba: "88%"
            }

        ];


        /*
           En móvil usamos menos partículas.
        */

        const cantidad =
    posiciones.length;


        for (
            let indice = 0;
            indice < cantidad;
            indice++
        ) {

            const particula =
                document.createElement(
                    "span"
                );


            particula.className =
                "particula-titulo";


            particula.setAttribute(
                "aria-hidden",
                "true"
            );


            particula.style.left =
                posiciones[indice]
                    .izquierda;


            particula.style.top =
                posiciones[indice]
                    .arriba;


            /*
               Tamaño ligeramente diferente
               para que no se vean idénticas.
            */

            const tamano =
                3 +
                Math.random() * 3;


            particula.style.width =
                tamano + "px";


            particula.style.height =
                tamano + "px";


            particula.style.animationDelay =
                (
                    Math.random() * -2.5
                ) + "s";


            particula.style.animationDuration =
                (
                    1.8 +
                    Math.random() * 2
                ) + "s";


            titulo.appendChild(
                particula
            );

        }


        console.log(
            "Partículas del título creadas:",
            cantidad
        );

    }
);


// =========================================================
// DESTELLOS QUE NACEN DESDE LAS LETRAS DEL BANNER
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function(){

        const titulo =
            document.querySelector(
                ".titulo-cosmico"
            );

        if (!titulo) {
            return;
        }


        /*
           Posiciones pensadas para que el destello
           toque el borde superior, inferior o lateral
           de las letras, no para que flote alrededor.
        */

        const puntosLetra = [

            { x: 3,   y: 48 },
            { x: 15,  y: 8  },
            { x: 26,  y: 88 },
            { x: 39,  y: 12 },
            { x: 50,  y: 90 },
            { x: 62,  y: 7  },
            { x: 74,  y: 90 },
            { x: 86,  y: 12 },
            { x: 98,  y: 52 }

        ];


        function crearDestello(){

            const destello =
                document.createElement(
                    "span"
                );

            destello.className =
                "destello-letra";


            const punto =
                puntosLetra[
                    Math.floor(
                        Math.random() *
                        puntosLetra.length
                    )
                ];


            /*
               Pequeña variación para evitar
               que todos aparezcan exactamente
               en el mismo píxel.
            */

            const variacionX =
                (Math.random() - .5) * 2;

            const variacionY =
                (Math.random() - .5) * 2;


            destello.style.left =
                `${punto.x + variacionX}%`;

            destello.style.top =
                `${punto.y + variacionY}%`;


            const tamaño =
                10 + Math.random() * 9;

            destello.style.width =
                `${tamaño}px`;

            destello.style.height =
                `${tamaño}px`;


            titulo.appendChild(
                destello
            );


            destello.addEventListener(
                "animationend",
                function(){

                    destello.remove();

                }
            );

        }


        /*
           Solo uno o dos destellos simultáneos.
           Así parece brillo de las letras,
           no decoración espacial.
        */

        function programarDestello(){

            crearDestello();


            const siguiente =
                700 +
                Math.random() * 1500;


            setTimeout(
                programarDestello,
                siguiente
            );

        }


        programarDestello();

    }
);


// =========================================================
// OCULTAR CIELO ESTRELLADO DETRÁS DEL SUELO LUNAR
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function(){

        const sueloLunar =
            document.querySelector(
                ".suelo-lunar"
            );


        if (!sueloLunar) {

            console.warn(
                "No se encontró .suelo-lunar"
            );

            return;

        }


        /*
           La imagen lunar tiene una gran zona
           transparente en su parte superior.

           El terreno visible comienza aproximadamente
           al 62% de la altura total del PNG.
        */

        const proporcionHorizonte =
            0.62;


        let actualizacionPendiente =
            false;


        function actualizarEstrellasSobreLuna(){

            actualizacionPendiente =
                false;


            const rectSuelo =
                sueloLunar
                    .getBoundingClientRect();


            /*
               Calculamos la posición real donde
               comienza el terreno visible.
            */

            const inicioTerreno =
                rectSuelo.top +
                rectSuelo.height *
                proporcionHorizonte;


            /*
               Solo seleccionamos:

               1. Partículas normales del cielo.
               2. Estrellas pintadas PNG.

               No afecta los destellos del título.
            */

            const estrellas =
                document.querySelectorAll(
                    [
                        ".particulas-fondo .particula",
                        
                    ].join(",")
                );


            estrellas.forEach(
                function(estrella){

                    const rectEstrella =
                        estrella
                            .getBoundingClientRect();


                    const centroX =
                        rectEstrella.left +
                        rectEstrella.width / 2;


                    const centroY =
                        rectEstrella.top +
                        rectEstrella.height / 2;


                    /*
                       Confirmamos que la estrella está
                       horizontalmente dentro del suelo.
                    */

                    const dentroHorizontalmente =
                        centroX >= rectSuelo.left &&
                        centroX <= rectSuelo.right;


                    /*
                       La estrella está sobre el terreno
                       cuando se encuentra por debajo
                       de la línea del horizonte.
                    */

                    const sobreTerreno =
                        dentroHorizontalmente &&
                        centroY >= inicioTerreno &&
                        centroY <= rectSuelo.bottom;


                    estrella.style.visibility =
                        sobreTerreno
                            ? "hidden"
                            : "visible";

                }
            );

        }


        /*
           Evita ejecutar el cálculo demasiadas veces
           durante el desplazamiento.
        */

        function solicitarActualizacion(){

            if (actualizacionPendiente) {
                return;
            }


            actualizacionPendiente =
                true;


            requestAnimationFrame(
                actualizarEstrellasSobreLuna
            );

        }


        /*
           Actualizar mientras se desplaza la página.
        */

        window.addEventListener(
            "scroll",
            solicitarActualizacion,
            {
                passive:true
            }
        );


        /*
           Actualizar cuando cambia la orientación
           o el tamaño de la pantalla.
        */

        window.addEventListener(
            "resize",
            solicitarActualizacion
        );


        window.addEventListener(
            "orientationchange",
            solicitarActualizacion
        );


        /*
           Esperar a que las imágenes y estrellas PNG
           hayan terminado de cargar y generarse.
        */

        window.addEventListener(
            "load",
            function(){

                solicitarActualizacion();


                setTimeout(
                    solicitarActualizacion,
                    350
                );


                setTimeout(
                    solicitarActualizacion,
                    900
                );

            }
        );


        /*
           Primera comprobación.
        */

        solicitarActualizacion();

    }
);