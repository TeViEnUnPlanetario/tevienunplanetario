import { leerContenidoPublico } from "../firebase/firestore-contenido-publico.js";

const contenedor = document.querySelector(".tarjetas-musica");

function crearLanzamiento(datos) {
    const articulo = document.createElement("article");
    articulo.className = "album";

    const imagen = document.createElement("img");
    imagen.src = String(datos.imagen || "img/musica/ep.jpg");
    imagen.alt = String(datos.imagenAlt || `Portada de ${datos.titulo || "lanzamiento"}`);
    imagen.loading = "lazy";
    imagen.addEventListener("error", () => {
        imagen.src = "img/musica/ep.jpg";
    }, { once: true });

    const informacion = document.createElement("div");
    informacion.className = "info-album";
    const tipo = document.createElement("span");
    tipo.textContent = datos.tipo || "Lanzamiento";
    const titulo = document.createElement("h3");
    titulo.textContent = datos.titulo || "Sin título";
    const lanzamiento = document.createElement("p");
    lanzamiento.append("Lanzamiento", document.createElement("br"), datos.lanzamiento || "Por confirmar");
    informacion.append(tipo, titulo, lanzamiento);

    const enlace = String(datos.enlace || "").trim();
    if (enlace) {
        const escuchar = document.createElement("a");
        escuchar.className = "album__enlace";
        escuchar.href = enlace;
        escuchar.target = "_blank";
        escuchar.rel = "noopener noreferrer";
        escuchar.textContent = "Escuchar ↗";
        informacion.appendChild(escuchar);
    }

    articulo.append(imagen, informacion);
    return articulo;
}

async function iniciarMusicaPublica() {
    if (!contenedor) return;
    const resultado = await leerContenidoPublico("musica");
    if (resultado.estado === "respaldo") return;

    if (resultado.elementos.length === 0) {
        const vacio = document.createElement("p");
        vacio.className = "contenido-publico-vacio";
        vacio.textContent = "Muy pronto habrá nuevos paisajes sonoros por descubrir.";
        contenedor.replaceChildren(vacio);
        return;
    }

    const fragmento = document.createDocumentFragment();
    resultado.elementos.forEach((elemento) => fragmento.appendChild(crearLanzamiento(elemento)));
    contenedor.replaceChildren(fragmento);
}

iniciarMusicaPublica();
