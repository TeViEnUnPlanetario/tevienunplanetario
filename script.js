if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
}

window.addEventListener("load", function(){

    if (!window.location.hash) {

        window.scrollTo({
            top:0,
            left:0,
            behavior:"instant"
        });

    }

});

console.log("Página cargada correctamente.");


// =========================
// BANNER Y CARRUSEL
// =========================

const banner = document.querySelector(".banner");
const bannerImg = document.getElementById("bannerImg");


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
    "img/banner11.jpg",
    "img/banner12.jpg",
    "img/banner13.jpg",
    "img/banner14.jpg",
    "img/banner15.jpg"

];


let indice = 0;
let posY = -120;


// Detectar versión móvil

function esMovil(){

    return window.innerWidth <= 900;

}


// Mantener centrado y aplicar zoom

function aplicarZoomBanner(escala){

    if(esMovil()){

        bannerImg.style.transform =
        `translateX(-50%) scale(${escala})`;

    }else{

        bannerImg.style.transform =
        `scale(${escala})`;

    }

}


// Ajustar posición según el dispositivo

function ajustarBanner(){

    if(esMovil()){

        bannerImg.style.top = "0px";

        aplicarZoomBanner(1);

    }else{

        bannerImg.style.top = posY + "px";

        aplicarZoomBanner(1);

    }

}


// Configuración inicial

if(banner && bannerImg){

    bannerImg.style.transition =
    "opacity 1.5s ease, transform 6s ease";

    ajustarBanner();


    // Movimiento vertical solo en computadora

    banner.addEventListener("wheel", function(e){

        if(esMovil()){
            return;
        }

        e.preventDefault();

        posY -= e.deltaY * 0.5;

        const limiteSuperior = 0;

        const limiteInferior =
        banner.clientHeight - bannerImg.clientHeight;


        if(posY > limiteSuperior){

            posY = limiteSuperior;

        }


        if(posY < limiteInferior){

            posY = limiteInferior;

        }


        bannerImg.style.top = posY + "px";

    }, { passive:false });


    // Carrusel automático

    setInterval(function(){

        indice++;

        if(indice >= imagenes.length){

            indice = 0;

        }


        // Desvanecer imagen actual

        bannerImg.style.opacity = 0;


        setTimeout(function(){

            // Cambiar imagen

            bannerImg.src = imagenes[indice];


            // Mantener posición correcta

            if(esMovil()){

                bannerImg.style.top = "0px";

            }else{

                bannerImg.style.top = posY + "px";

            }


            // Reiniciar zoom sin perder el centrado móvil

            aplicarZoomBanner(1);


            setTimeout(function(){

                // Mostrar nueva imagen

                bannerImg.style.opacity = 1;


                // Aplicar zoom lento

                aplicarZoomBanner(1.08);

            },100);


        },1500);


    },7000);


    // Corregir posición si cambia el tamaño de pantalla

    window.addEventListener("resize", function(){

        ajustarBanner();

    });

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
// ANIMACIONES AL HACER SCROLL
// =========================

document.addEventListener("DOMContentLoaded", function(){

    const elementosGenerales = document.querySelectorAll(

        ".presentacion, " +
        ".nuevo-lanzamiento, " +
        ".shows > h2, " +
        ".titulo-seccion-musica, " +
        ".contacto > h2, " +
        ".contacto > p, " +
        "footer h2, " +
        "footer h3"

    );


    elementosGenerales.forEach(function(elemento){

        elemento.classList.add("revelar-scroll");

    });


    // Tarjetas de shows con retraso progresivo

    const tarjetasShows =
    document.querySelectorAll(".show");


    tarjetasShows.forEach(function(tarjeta, indice){

        tarjeta.classList.add(
            "revelar-scroll",
            `retraso-${(indice % 3) + 1}`
        );

    });


    // Portada del EP desde la izquierda

    const portada =
    document.querySelector(".portada");


    if(portada){

        portada.classList.add(
            "revelar-scroll",
            "revelar-izquierda"
        );

    }


    // Información musical desde la derecha

    const informacionMusica =
    document.querySelector(".info-musica");


    if(informacionMusica){

        informacionMusica.classList.add(
            "revelar-scroll",
            "revelar-derecha"
        );

    }


    // Tarjetas de contacto

    const tarjetasContacto =
    document.querySelectorAll(".tarjeta-contacto");


    tarjetasContacto.forEach(function(tarjeta, indice){

        tarjeta.classList.add(
            "revelar-scroll",
            `retraso-${(indice % 3) + 1}`
        );

    });


    // Contador con zoom sutil

    const contador =
    document.querySelector(".contador-lanzamiento");


    if(contador){

        contador.classList.add(
            "revelar-scroll",
            "revelar-zoom"
        );

    }


    // Botones de preguardado

    const preguardado =
    document.querySelector(".preguardar-lanzamiento");


    if(preguardado){

        preguardado.classList.add(
            "revelar-scroll"
        );

    }


    const observador = new IntersectionObserver(

        function(entradas){

            entradas.forEach(function(entrada){

                if(entrada.isIntersecting){

                    entrada.target.classList.add(
                        "visible"
                    );

                    observador.unobserve(
                        entrada.target
                    );

                }

            });

        },

        {

            threshold:0.15,

            rootMargin:
            "0px 0px -60px 0px"

        }

    );


    const elementosAnimados =
    document.querySelectorAll(".revelar-scroll");


    elementosAnimados.forEach(function(elemento){

        observador.observe(elemento);

    });

});
