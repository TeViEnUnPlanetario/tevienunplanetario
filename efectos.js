// =========================
// EFECTOS VISUALES
// =========================

document.addEventListener("DOMContentLoaded", function(){

    const reduceMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

    const tieneCursor =
        window.matchMedia(
            "(pointer: fine)"
        ).matches;


    // =========================
    // NEBULOSA Y PARTÍCULAS
    // =========================

    if(!reduceMotion){

        const contenedorParticulas =
            document.createElement("div");

        contenedorParticulas.className =
            "particulas-fondo";

        document.body.prepend(
            contenedorParticulas
        );


        const cantidadParticulas =
            window.innerWidth <= 900 ? 10 : 18;


        for(let i = 0; i < cantidadParticulas; i++){

            const particula =
                document.createElement("span");

            particula.className =
                "particula";


            const posicionHorizontal =
                Math.random() * 100;


            const duracion =
                16 + Math.random() * 20;


            const retraso =
                Math.random() * -30;


            const tamano =
                2 + Math.random() * 3;


            particula.style.left =
                posicionHorizontal + "%";

            particula.style.width =
                tamano + "px";

            particula.style.height =
                tamano + "px";

            particula.style.animationDuration =
                duracion + "s";

            particula.style.animationDelay =
                retraso + "s";


            contenedorParticulas.appendChild(
                particula
            );

        }

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
