import { leerContenidoPublico } from "../firebase/firestore-contenido-publico.js";

const contenedor = document.querySelector(".galeria-premium .masonry");

function imagenSegura(valor) {
    const imagen = String(valor || "").trim();
    return imagen || "img/galeria/foto1.jpg";
}

function crearFotografia(datos) {
    const item = document.createElement("div");
    item.className = `item${datos.tamano === "grande" ? " grande" : ""}`;

    const imagen = document.createElement("img");
    imagen.src = imagenSegura(datos.imagen);
    imagen.alt = String(datos.imagenAlt || datos.titulo || "Fotografía de Te Vi En Un Planetario");
    imagen.dataset.titulo = String(datos.titulo || "Nuestro universo");
    imagen.dataset.texto = String(datos.descripcion || "");
    imagen.loading = "lazy";
    imagen.addEventListener("error", () => {
        imagen.src = "img/galeria/foto1.jpg";
    }, { once: true });

    const overlay = document.createElement("div");
    overlay.className = "overlay-galeria";
    const titulo = document.createElement("h3");
    titulo.textContent = datos.titulo || "Nuestro universo";
    const descripcion = document.createElement("p");
    descripcion.textContent = datos.descripcion || "";
    overlay.append(titulo, descripcion);
    item.append(imagen, overlay);
    return item;
}

async function iniciarGaleriaPublica() {
    if (!contenedor) return;
    const resultado = await leerContenidoPublico("galeria");
    if (resultado.estado === "respaldo") return;

    if (resultado.elementos.length === 0) {
        const vacio = document.createElement("p");
        vacio.className = "contenido-publico-vacio";
        vacio.textContent = "Muy pronto compartiremos nuevos recuerdos de este universo.";
        contenedor.replaceChildren(vacio);
        return;
    }

    const fragmento = document.createDocumentFragment();
    resultado.elementos.forEach((elemento) => fragmento.appendChild(crearFotografia(elemento)));
    contenedor.replaceChildren(fragmento);
}

iniciarGaleriaPublica();
