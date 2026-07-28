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


// =========================
// CAPA DE ESTRELLAS FUGACES
// =========================

const contenedorFugaces =
    document.createElement("div");

contenedorFugaces.className =
    "estrellas-fugaces";

contenedorFugaces.setAttribute(
    "aria-hidden",
    "true"
);

contenedorParticulas.insertAdjacentElement(
    "afterend",
    contenedorFugaces
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
    bannerPrincipal
        .getBoundingClientRect()
        .bottom +
    window.scrollY;


/*
   La capa termina al comenzar el footer.

   Usamos el footer y no la escena lunar,
   porque la escena está posicionada de
   forma absoluta dentro de él.
*/

const footerPrincipal =
    document.querySelector(
        "body:not(.pagina-musica-body):not(.pagina-galeria-body) > footer"
    );


let finalEstrellas;


if (footerPrincipal) {

    finalEstrellas =
        footerPrincipal
            .getBoundingClientRect()
            .top +
        window.scrollY;

} else {

    finalEstrellas =
        Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight
        );

}


const alturaDisponible =
    Math.max(
        0,
        finalEstrellas -
        inicioEstrellas
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


}); // Cierra el DOMContentLoaded principal

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



// =========================================================
// GENERADOR CINEMATOGRÁFICO DE ESTRELLAS FUGACES
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function(){

        const contenedor =
            document.querySelector(
                ".estrellas-fugaces"
            );


        if (!contenedor) {

            console.warn(
                "No se encontró .estrellas-fugaces"
            );

            return;

        }


        const movimientoReducido =
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            );


        let temporizador = null;


        function numeroAleatorio(
            minimo,
            maximo
        ){

            return (
                Math.random() *
                (maximo - minimo) +
                minimo
            );

        }


        function crearEstrellaFugaz(){

            if (
                movimientoReducido.matches ||
                document.hidden
            ) {

                return;

            }


            const estrella =
                document.createElement(
                    "span"
                );


            estrella.className =
                "estrella-fugaz";


            /*
                La estrella puede comenzar ligeramente
                fuera de la pantalla o dentro de ella.
            */

            const inicioX =
                numeroAleatorio(
                    -20,
                    72
                );


            const inicioY =
                numeroAleatorio(
                    -8,
                    58
                );


            /*
                Recorrido diagonal hacia la derecha
                y hacia abajo.
            */

            const recorridoX =
                numeroAleatorio(
                    38,
                    78
                );


            const recorridoY =
                numeroAleatorio(
                    20,
                    52
                );


            const angulo =
                numeroAleatorio(
                    22,
                    38
                );


            const longitud =
                numeroAleatorio(
                    90,
                    190
                );


            const duracion =
                numeroAleatorio(
                    1.05,
                    1.85
                );


            const brillo =
                numeroAleatorio(
                    .52,
                    .90
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
                function(){

                    estrella.remove();

                },
                {
                    once:true
                }
            );

        }


        function programarSiguienteEstrella(){

            clearTimeout(
                temporizador
            );


            if (
                movimientoReducido.matches ||
                document.hidden
            ) {

                return;

            }


            /*
                Una estrella cada 4.5 a 9 segundos.
            */

            const espera =
                numeroAleatorio(
                    4500,
                    9000
                );


            temporizador =
                setTimeout(
                    function(){

                        crearEstrellaFugaz();


                        /*
                            En algunas ocasiones aparecerá
                            una segunda estrella poco después.
                        */

                        if (
                            Math.random() < .14
                        ) {

                            setTimeout(
                                crearEstrellaFugaz,
                                numeroAleatorio(
                                    450,
                                    1300
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
            function(){

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
            function(){

                programarSiguienteEstrella();

            }
        );


        /*
            Primera estrella ligeramente más rápida
            para comprobar que el sistema funciona.
        */

        temporizador =
            setTimeout(
                function(){

                    crearEstrellaFugaz();

                    programarSiguienteEstrella();

                },
                numeroAleatorio(
                    1800,
                    3200
                )
            );

    }
);