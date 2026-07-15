// =========================
// EFECTOS VISUALES
// =========================
console.log("efectos.js cargado correctamente");
document.addEventListener("DOMContentLoaded", function(){

    const reduceMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

    const tieneCursor =
    window.matchMedia(
        "(any-pointer: fine)"
    ).matches;


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


    // Crear estrella fugaz ocasional

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


    programarEstrellaFugaz();

}


    // No crear aura en móviles o pantallas táctiles

 if(tieneCursor && !reduceMotion){


    // =========================
    // AURA DEL CURSOR
    // =========================

    const aura =
        document.createElement("div");

    aura.className =
        "cursor-aura";

    document.body.appendChild(aura);


    let mouseX =
        window.innerWidth / 2;

    let mouseY =
        window.innerHeight / 2;

    let auraX = mouseX;
    let auraY = mouseY;


    document.addEventListener(
        "mousemove",
        function(event){

            mouseX = event.clientX;
            mouseY = event.clientY;

            aura.classList.add("visible");

        }
    );


    document.addEventListener(
        "mouseleave",
        function(){

            aura.classList.remove("visible");

        }
    );


    function animarAura(){

        auraX +=
            (mouseX - auraX) * 0.08;

        auraY +=
            (mouseY - auraY) * 0.08;


        aura.style.left =
            auraX + "px";

        aura.style.top =
            auraY + "px";


        requestAnimationFrame(animarAura);

    }


    animarAura();


    // =========================
    // COLORES SEGÚN ENLACE
    // =========================

    const enlaces =
        document.querySelectorAll("a");


    const clasesColor = [

        "spotify",
        "youtube",
        "apple",
        "instagram",
        "twitter",
        "facebook"

    ];


    function limpiarColores(){

        aura.classList.remove(
            ...clasesColor
        );

    }


       enlaces.forEach(function(enlace){

        enlace.addEventListener(
            "mouseenter",
            function(){

                limpiarColores();

                aura.classList.add("activa");

                const href =
                    (
                        enlace.getAttribute("href")
                        || ""
                    ).toLowerCase();


                if(href.includes("spotify")){

                    aura.classList.add("spotify");

                }else if(href.includes("youtube")){

                    aura.classList.add("youtube");

                }else if(
                    href.includes("music.apple")
                    || enlace.classList.contains(
                        "apple-preguardar"
                    )
                ){

                    aura.classList.add("apple");

                }else if(href.includes("instagram")){

                    aura.classList.add("instagram");

                }else if(
                    href.includes("x.com")
                    || href.includes("twitter")
                ){

                    aura.classList.add("twitter");

                }else if(href.includes("facebook")){

                    aura.classList.add("facebook");

                }

            }
        );


        enlace.addEventListener(
            "mouseleave",
            function(){

                aura.classList.remove("activa");

                limpiarColores();

            }
        );

    });


} // Cierra: if(tieneCursor && !reduceMotion)


}); // Cierra: document.addEventListener("DOMContentLoaded", ...)
