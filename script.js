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
    "img/banner11.jpg"
    
];


let indice = 0;
let posY = -120;


// Detectar versión móvil

function usarEncuadreFijo(){

    const ventanaAngosta =
        window.innerWidth <= 900;

    const ventanaVertical =
        window.innerWidth / window.innerHeight <= 1.33;

    return ventanaAngosta || ventanaVertical;

}


// Mantener centrado y aplicar zoom

function aplicarZoomBanner(escala){

    bannerImg.style.transform =
    `scale(${escala})`;

}


// Ajustar posición según el dispositivo

function ajustarBanner(){

    if(usarEncuadreFijo()){

        bannerImg.style.top = "0px";
        bannerImg.style.height = "100%";

    }else{

        bannerImg.style.top = posY + "px";
        bannerImg.style.height =
        "calc(100% + 240px)";

    }

    aplicarZoomBanner(1);

}


// Configuración inicial

if(banner && bannerImg){

    bannerImg.style.transition =
    "opacity 1.5s ease, transform 6s ease";

    ajustarBanner();


// Movimiento vertical solo en computadora

banner.addEventListener("wheel", function(e){

    if(usarEncuadreFijo()){
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


    bannerImg.style.opacity = 0;


    setTimeout(function(){

        bannerImg.src = imagenes[indice];


        if(usarEncuadreFijo()){

            bannerImg.style.top = "0px";
            bannerImg.style.height = "100%";

        }else{

            bannerImg.style.top = posY + "px";
            bannerImg.style.height =
            "calc(100% + 240px)";

        }


        aplicarZoomBanner(1);


        setTimeout(function(){

            bannerImg.style.opacity = 1;

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
