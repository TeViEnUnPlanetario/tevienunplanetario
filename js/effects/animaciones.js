// =========================
// ANIMACIONES AL HACER SCROLL
// =========================

function iniciarAnimacionesScroll(){

    const elementosGenerales =
        document.querySelectorAll(
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


    document.querySelectorAll(".show")
    .forEach(function(tarjeta, indice){

        tarjeta.classList.add(
            "revelar-scroll",
            `retraso-${(indice % 3) + 1}`
        );

    });


    const portada =
        document.querySelector(".portada");

    if(portada){

        portada.classList.add(
            "revelar-scroll",
            "revelar-izquierda"
        );

    }


    const informacionMusica =
        document.querySelector(".info-musica");

    if(informacionMusica){

        informacionMusica.classList.add(
            "revelar-scroll",
            "revelar-derecha"
        );

    }


    document.querySelectorAll(".tarjeta-contacto")
    .forEach(function(tarjeta, indice){

        tarjeta.classList.add(
            "revelar-scroll",
            `retraso-${(indice % 3) + 1}`
        );

    });


    const contador =
        document.querySelector(".contador-lanzamiento");

    if(contador){

        contador.classList.add(
            "revelar-scroll",
            "revelar-zoom"
        );

    }


    const preguardado =
        document.querySelector(".preguardar-lanzamiento");

    if(preguardado){

        preguardado.classList.add(
            "revelar-scroll"
        );

    }


    const elementosAnimados =
        document.querySelectorAll(".revelar-scroll");


    console.log(
        "Elementos preparados para animación:",
        elementosAnimados.length
    );


    if(!("IntersectionObserver" in window)){

        elementosAnimados.forEach(function(elemento){

            elemento.classList.add("visible");

        });

        return;

    }


    const observador =
        new IntersectionObserver(

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
    threshold:0.18,
    rootMargin:"0px 0px -18% 0px"
}

        );


    requestAnimationFrame(function(){

        requestAnimationFrame(function(){

            elementosAnimados.forEach(
                function(elemento){

                    observador.observe(elemento);

                }
            );

        });

    });

}


if(document.readyState === "loading"){

    document.addEventListener(
        "DOMContentLoaded",
        iniciarAnimacionesScroll
    );

}else{

    iniciarAnimacionesScroll();

}
