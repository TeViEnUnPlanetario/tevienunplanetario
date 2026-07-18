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

        const posicionY =
            Math.random() * 100;

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




}); // Cierra: document.addEventListener("DOMContentLoaded", ...)
