// ==================================================
// OBSERVATORIO
// Generación aleatoria del cielo estrellado
// ==================================================

const contenedorEstrellas =
    document.getElementById(
        "observatorioEstrellas"
    );


function calcularCantidadEstrellas() {

    const ancho =
        window.innerWidth;

    const alto =
        window.innerHeight;

    const area =
        ancho * alto;


    /*
        Aproximadamente una estrella
        por cada 11 000 píxeles cuadrados.
    */

    const cantidad =
        Math.round(
            area / 11000
        );


    return Math.max(
        55,
        Math.min(
            cantidad,
            190
        )
    );

}


function crearEstrella() {

    const estrella =
        document.createElement(
            "span"
        );


    estrella.className =
        "observatorio-estrella";


    const tamano =
        Math.random() * 2.2 + 0.8;


    const opacidad =
        Math.random() * 0.55 + 0.3;


    const duracion =
        Math.random() * 4 + 3;


    const retraso =
        Math.random() * -8;


    estrella.style.left =
        `${Math.random() * 100}%`;


    estrella.style.top =
        `${Math.random() * 100}%`;


    estrella.style.setProperty(
        "--estrella-tamano",
        `${tamano}px`
    );


    estrella.style.setProperty(
        "--estrella-opacidad",
        opacidad.toFixed(2)
    );


    estrella.style.setProperty(
        "--estrella-duracion",
        `${duracion.toFixed(2)}s`
    );


    estrella.style.setProperty(
        "--estrella-retraso",
        `${retraso.toFixed(2)}s`
    );


    /*
        Aproximadamente una de cada
        doce estrellas será más brillante.
    */

    if (
        Math.random() < 0.085
    ) {

        estrella.classList.add(
            "observatorio-estrella--brillante"
        );

    }


    return estrella;

}


function renderizarEstrellas() {

    if (!contenedorEstrellas) {

        return;

    }


    const fragmento =
        document.createDocumentFragment();


    const cantidad =
        calcularCantidadEstrellas();


    contenedorEstrellas.replaceChildren();


    for (
        let indice = 0;
        indice < cantidad;
        indice += 1
    ) {

        fragmento.appendChild(
            crearEstrella()
        );

    }


    contenedorEstrellas.appendChild(
        fragmento
    );

}


let temporizadorRedimensionado =
    null;


function manejarRedimensionado() {

    window.clearTimeout(
        temporizadorRedimensionado
    );


    temporizadorRedimensionado =
        window.setTimeout(
            renderizarEstrellas,
            250
        );

}


renderizarEstrellas();


window.addEventListener(
    "resize",
    manejarRedimensionado
);