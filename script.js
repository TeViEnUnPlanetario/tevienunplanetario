// =========================
// REINICIAR POSICIÓN AL RECARGAR
// =========================

if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
}

window.addEventListener("pageshow", function(){

    if (!window.location.hash) {

        window.scrollTo({
            top:0,
            left:0,
            behavior:"auto"
        });

    }

});

console.log("Página cargada correctamente.");


// =========================
// BANNER Y CARRUSEL
// =========================

const banner =
    document.querySelector(".banner");

const bannerImg =
    document.getElementById("bannerImg");


// Lista de imágenes

const imagenes = [

    "img/banner1.jpg",
    "img/banner2.jpg",
    "img/banner3.jpg",
    "img/banner4.jpg",
    "img/banner5.jpg",
    "img/banner6.jpg",
    "img/banner7.jpg",
    "img/banner8.jpg",
    "img/banner9.jpg",
    "img/banner10.jpg",
    "img/banner11.jpg"

];


// Encuadre individual de cada imagen

const posicionesBanner = [

    "center 38%",
    "center 42%",
    "center 35%",
    "center 48%",
    "center 40%",
    "center 44%",
    "center 32%",
    "center 50%",
    "center 38%",
    "center 45%",
    "center 40%"

];


let indice = 0;


// Mantener centrado y aplicar zoom

function aplicarZoomBanner(escala){

    bannerImg.style.transform =
        `scale(${escala})`;

}


// Ajustar la imagen al hero

function ajustarBanner(){

    bannerImg.style.inset = "0";

    bannerImg.style.width = "100%";

    bannerImg.style.height = "100%";

    bannerImg.style.objectFit = "cover";

    bannerImg.style.objectPosition =
        posicionesBanner[indice];

    aplicarZoomBanner(1);

}


// Configuración inicial

if(banner && bannerImg){

    bannerImg.style.transition =
        "opacity 1.5s ease, " +
        "transform 8s ease, " +
        "object-position .6s ease";

  


    // Carrusel automático

    setInterval(function(){

        indice++;

        if(indice >= imagenes.length){

            indice = 0;

        }


        // Ocultar imagen actual

        bannerImg.style.opacity = 0;


        setTimeout(function(){

            // Cambiar imagen

            bannerImg.src =
                imagenes[indice];


         


            setTimeout(function(){

                // Mostrar imagen

                bannerImg.style.opacity = 1;


                // Zoom cinematográfico lento

                aplicarZoomBanner(1.06);

            },100);


        },1500);


    },7000);


    // Reajustar al cambiar el tamaño

    window.addEventListener(
        "resize",
        function(){

            ajustarBanner();

            bannerImg.style.objectPosition =
                posicionesBanner[indice];

        }
    );

}



// =========================
// CONTADOR NUEVO LANZAMIENTO
// =========================


// Cambia esta fecha por la fecha real del lanzamiento.
// Formato: AÑO-MES-DÍA y hora.
// Ejemplo: 15 de septiembre de 2026 a las 00:00.

const fechaNuevoEP =
new Date("2026-11-19T00:00:00").getTime();


const contadorEP =
setInterval(function(){


    const ahora =
    new Date().getTime();


    const distancia =
    fechaNuevoEP - ahora;


    const dias =
    Math.floor(
        distancia / (1000 * 60 * 60 * 24)
    );


    const horas =
    Math.floor(
        (distancia % (1000 * 60 * 60 * 24))
        / (1000 * 60 * 60)
    );


    const minutos =
    Math.floor(
        (distancia % (1000 * 60 * 60))
        / (1000 * 60)
    );


    const segundos =
    Math.floor(
        (distancia % (1000 * 60))
        / 1000
    );


    document.getElementById("dias").textContent =
    String(dias).padStart(2,"0");


    document.getElementById("horas").textContent =
    String(horas).padStart(2,"0");


    document.getElementById("minutos").textContent =
    String(minutos).padStart(2,"0");


    document.getElementById("segundos").textContent =
    String(segundos).padStart(2,"0");


    if(distancia < 0){

        clearInterval(contadorEP);


        document.getElementById(
            "contadorLanzamiento"
        ).innerHTML = `

            <div class="mensaje-estreno">
                EL NUEVO EP YA ESTÁ DISPONIBLE
            </div>

        `;

    }


},1000);

// =========================
// AURA DEL CURSOR
// =========================

const cursorAura =
    document.querySelector(".cursor-aura");

if (
    cursorAura &&
    window.matchMedia("(pointer:fine)").matches
) {

    let mouseX = 0;
    let mouseY = 0;

    let auraX = 0;
    let auraY = 0;

    function animarAura(){

        auraX +=
            (mouseX - auraX) * 0.18;

        auraY +=
            (mouseY - auraY) * 0.18;

        cursorAura.style.left =
            `${auraX}px`;

        cursorAura.style.top =
            `${auraY}px`;

        requestAnimationFrame(
            animarAura
        );

    }


    document.addEventListener(
        "mousemove",
        function(evento){

            mouseX =
                evento.clientX;

            mouseY =
                evento.clientY;

            cursorAura.classList.add(
                "visible"
            );

        }
    );


    document.addEventListener(
        "mouseleave",
        function(){

            cursorAura.classList.remove(
                "visible"
            );

        }
    );


    document.addEventListener(
        "mouseenter",
        function(){

            cursorAura.classList.add(
                "visible"
            );

        }
    );


    animarAura();

}


// =========================
// COLORES DEL AURA
// =========================

if (cursorAura) {

    function limpiarAura(){

        cursorAura.classList.remove(
            "spotify",
            "youtube",
            "apple",
            "instagram",
            "twitter",
            "facebook",
            "activa"
        );

    }


    const botonesAura = [

        {
            selector:
                ".botones-portada a:nth-child(1), .spotify-preguardar",

            clase:
                "spotify"
        },

        {
            selector:
                ".botones-portada a:nth-child(2)",

            clase:
                "youtube"
        },

        {
            selector:
                ".botones-portada a:nth-child(3), .apple-preguardar",

            clase:
                "apple"
        },

        {
            selector:
                ".botones-redes a:nth-child(1)",

            clase:
                "instagram"
        },

        {
            selector:
                ".botones-redes a:nth-child(2)",

            clase:
                "twitter"
        },

        {
            selector:
                ".botones-redes a:nth-child(3)",

            clase:
                "facebook"
        }

    ];


    botonesAura.forEach(
        function(configuracion){

            document
                .querySelectorAll(
                    configuracion.selector
                )
                .forEach(
                    function(boton){

                        boton.addEventListener(
                            "mouseenter",
                            function(){

                                limpiarAura();

                                cursorAura.classList.add(
                                    configuracion.clase,
                                    "activa"
                                );

                            }
                        );


                        boton.addEventListener(
                            "mouseleave",
                            limpiarAura
                        );

                    }
                );

        }
    );

}


// =========================
// ESTRELLAS FUGACES CORTAS
// =========================

const contenedorParticulas =
    document.querySelector(".particulas-fondo");

function crearEstrellaFugaz(){

    if (!contenedorParticulas) {
        return;
    }

    const estrella =
        document.createElement("div");

    estrella.classList.add(
        "estrella-fugaz"
    );

    estrella.style.left =
        `${Math.random() * 55 - 5}%`;

    estrella.style.top =
        `${Math.random() * 38 - 8}%`;

    estrella.style.animationDelay =
        `${Math.random() * 0.25}s`;

    contenedorParticulas.appendChild(
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
