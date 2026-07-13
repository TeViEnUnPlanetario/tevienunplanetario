console.log("Página cargada correctamente.");

const banner = document.querySelector(".banner");
const bannerImg = document.getElementById("bannerImg");

let posY = -120;

// Mantener encuadre inicial
bannerImg.style.top = posY + "px";


// Movimiento vertical con rueda del ratón
banner.addEventListener("wheel", function(e){

    e.preventDefault();

    posY -= e.deltaY * 0.5;

    const limiteSuperior = 0;
    const limiteInferior = banner.clientHeight - bannerImg.clientHeight;

    if(posY > limiteSuperior){
        posY = limiteSuperior;
    }

    if(posY < limiteInferior){
        posY = limiteInferior;
    }

    bannerImg.style.top = posY + "px";
	bannerImg.style.transition = "opacity 1.5s ease, transform 6s ease";

}, { passive:false });


// Carrusel de imágenes
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
    "img/banner10.jpg"
];

let indice = 0;


setInterval(function(){

    indice++;

    if(indice >= imagenes.length){
        indice = 0;
    }

bannerImg.style.opacity = 0;

setTimeout(function(){

    bannerImg.src = imagenes[indice];

    // Mantener encuadre
    bannerImg.style.top = "-120px";

    // Reiniciar zoom
    bannerImg.style.transform = "scale(1)";

    setTimeout(function(){

        bannerImg.style.opacity = 1;

        // Zoom lento
        bannerImg.style.transform = "scale(1.08)";

    },100);

},1500);


},5000);
