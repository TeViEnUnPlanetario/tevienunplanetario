import {
    cambiarVisibilidadContenido,
    eliminarContenido,
    guardarContenido,
    importarContenidoInicial,
    listarContenido
} from "../firebase/firestore-contenido-administracion.js";

const GALERIA_INICIAL = [
    ["galeria-01", "En vivo", "Una noche donde las luces y los sonidos comenzaron un nuevo viaje.", "img/galeria/foto1.jpg", "Te Vi En Un Planetario en vivo", "grande"],
    ["galeria-02", "Backstage", "Instantes de calma antes de subir al escenario.", "img/galeria/foto2.jpg", "Backstage", "normal"],
    ["galeria-03", "Escenarios", "Cada escenario representa una nueva historia por contar.", "img/galeria/foto3.jpg", "Escenarios", "normal"],
    ["galeria-04", "Recuerdos", "Momentos que permanecen vivos entre canciones y fotografías.", "img/galeria/foto4.jpg", "Recuerdos", "grande"],
    ["galeria-05", "Luces", "Las luces transforman cada presentación en un universo distinto.", "img/galeria/foto5.jpg", "Luces", "normal"],
    ["galeria-06", "El viaje continúa", "Seguimos recorriendo caminos acompañados por nuestra música.", "img/galeria/foto6.jpg", "Viaje", "normal"],
    ["galeria-07", "Conexión", "Cada presentación nos acerca un poco más a quienes escuchan.", "img/galeria/foto7.jpg", "Conexión", "grande"],
    ["galeria-08", "Nuestro universo", "Paisajes que existen entre la nostalgia y los sueños.", "img/galeria/foto8.jpg", "Universo", "normal"],
    ["galeria-09", "Encuentros", "Personas, canciones y momentos compartidos en cada ciudad.", "img/galeria/foto9.jpg", "Encuentros", "normal"],
    ["galeria-10", "Escena Indie", "Compartiendo escenario con proyectos que inspiran nuestro camino.", "img/galeria/foto10.jpg", "Escena Indie", "grande"],
    ["galeria-11", "Ensayos", "Todo comienza mucho antes de que las luces se enciendan.", "img/galeria/foto11.jpg", "Ensayos", "normal"],
    ["galeria-12", "Noches", "Las mejores historias siempre suceden después del atardecer.", "img/galeria/foto12.jpg", "Noches", "normal"],
    ["galeria-13", "El camino", "Cada paso nos acerca a un nuevo capítulo de nuestra historia.", "img/galeria/foto13.jpg", "El camino", "grande"],
    ["galeria-14", "Instantes", "Pequeños momentos que permanecen mucho después del último acorde.", "img/galeria/foto14.jpg", "Instantes", "normal"],
    ["galeria-15", "Hasta la próxima", "Cada fotografía es un recuerdo que seguirá viajando con nosotros.", "img/galeria/foto15.jpg", "Hasta la próxima", "normal"]
].map(([id, titulo, descripcion, imagen, imagenAlt, tamano], indice) => ({
    id, titulo, descripcion, imagen, imagenAlt, tamano,
    orden: indice + 1,
    visible: true
}));

const MUSICA_INICIAL = [
    ["musica-fin-tiempos", "TERCER EP", "EL FIN DE LOS TIEMPOS", "ENERO 2025", "img/musica/ep.jpg"],
    ["musica-no-quiero", "Sencillo", "no quiero estar aqui", "2023", "img/musica/noquieroestaraqui.jpg"],
    ["musica-luna", "Sencillo", "luna", "2023", "img/musica/luna.jpg"],
    ["musica-violeta", "Sencillo", "violeta", "2023", "img/musica/violeta.jpg"],
    ["musica-danza-brujas", "Sencillo", "la danza de las brujas", "2023", "img/musica/la danza de las brujas.jpg"],
    ["musica-te-odio", "Sencillo", "te odio", "2023", "img/musica/te odio.jpg"],
    ["musica-flores", "Sencillo", "flores", "2023", "img/musica/flores.jpg"],
    ["musica-reina-primavera", "Sencillo", "reina de primavera", "2023", "img/musica/reina de primavera.jpg"],
    ["musica-terminal-2", "Sencillo", "Terminal 2", "2023", "img/musica/Terminal 2.jpg"],
    ["musica-volvernos", "Sencillo", "volvernos a ver", "2023", "img/musica/volvernos a ver.jpg"]
].map(([id, tipo, titulo, lanzamiento, imagen], indice) => ({
    id, tipo, titulo, lanzamiento, imagen,
    imagenAlt: `Portada de ${titulo}`,
    enlace: "",
    orden: indice + 1,
    visible: true
}));

const NOTICIAS_INICIALES = [];

const configuraciones = {
    noticias: {
        inicial: NOTICIAS_INICIALES,
        lista: document.getElementById("lista-noticias"),
        mensaje: document.getElementById("mensaje-noticias"),
        migracion: document.getElementById("migracion-noticias"),
        importar: document.getElementById("importar-noticias"),
        crear: document.getElementById("crear-noticias"),
        editor: document.getElementById("editor-noticias"),
        formulario: document.getElementById("formulario-noticias")
    },
    galeria: {
        inicial: GALERIA_INICIAL,
        lista: document.getElementById("lista-galeria"),
        mensaje: document.getElementById("mensaje-galeria"),
        migracion: document.getElementById("migracion-galeria"),
        importar: document.getElementById("importar-galeria"),
        crear: document.getElementById("crear-galeria"),
        editor: document.getElementById("editor-galeria"),
        formulario: document.getElementById("formulario-galeria")
    },
    musica: {
        inicial: MUSICA_INICIAL,
        lista: document.getElementById("lista-musica"),
        mensaje: document.getElementById("mensaje-musica"),
        migracion: document.getElementById("migracion-musica"),
        importar: document.getElementById("importar-musica"),
        crear: document.getElementById("crear-musica"),
        editor: document.getElementById("editor-musica"),
        formulario: document.getElementById("formulario-musica")
    }
};

const estado = { noticias: [], galeria: [], musica: [] };
let eventosRegistrados = false;

function mensaje(tipo, texto, variante = "carga") {
    const elemento = configuraciones[tipo].mensaje;
    elemento.textContent = texto;
    elemento.className = `mensaje-formulario mensaje-formulario--${variante}`;
}

function valor(tipo, campo) {
    return document.getElementById(`${tipo}-${campo}`);
}

function cerrarEditor(tipo) {
    configuraciones[tipo].editor.hidden = true;
    configuraciones[tipo].formulario.reset();
    valor(tipo, "id").value = "";
}

function abrirEditor(tipo, elemento = null) {
    const formulario = configuraciones[tipo].formulario;
    formulario.reset();
    valor(tipo, "id").value = elemento?.id || "";
    valor(tipo, "titulo").value = elemento?.titulo || "";
    valor(tipo, "imagen-alt").value = elemento?.imagenAlt || "";
    valor(tipo, "orden").value = Number(elemento?.orden || estado[tipo].length + 1);
    valor(tipo, "visible").checked = elemento ? Boolean(elemento.visible) : true;

    if (tipo === "noticias") {
        const imagenes = Array.isArray(elemento?.imagenes) && elemento.imagenes.length
            ? elemento.imagenes
            : (elemento?.imagen ? [elemento.imagen] : []);
        valor(tipo, "imagenes").value = imagenes.join("\n");
        valor(tipo, "descripcion").value = elemento?.descripcion || "";
        valor(tipo, "fecha").value = elemento?.fecha || new Date().toISOString().slice(0, 10);
        ["instagram", "facebook", "x", "tiktok"].forEach((red) => {
            valor(tipo, red).value = elemento?.[red] || "";
        });
    } else if (tipo === "galeria") {
        valor(tipo, "imagen").value = elemento?.imagen || "";
        valor(tipo, "descripcion").value = elemento?.descripcion || "";
        valor(tipo, "tamano").value = elemento?.tamano || "normal";
    } else {
        valor(tipo, "imagen").value = elemento?.imagen || "";
        valor(tipo, "tipo").value = elemento?.tipo || "Sencillo";
        valor(tipo, "lanzamiento").value = elemento?.lanzamiento || "";
        valor(tipo, "enlace").value = elemento?.enlace || "";
    }

    configuraciones[tipo].editor.hidden = false;
    configuraciones[tipo].editor.scrollIntoView({ behavior: "smooth", block: "start" });
}

function datosFormulario(tipo) {
    const comunes = {
        titulo: valor(tipo, "titulo").value.trim(),
        imagenAlt: valor(tipo, "imagen-alt").value.trim(),
        orden: Number.parseInt(valor(tipo, "orden").value, 10),
        visible: valor(tipo, "visible").checked
    };

    if (tipo === "noticias") {
        const imagenes = valor(tipo, "imagenes").value
            .split(/\r?\n/)
            .map((ruta) => ruta.trim())
            .filter(Boolean);
        if (imagenes.length === 0 || imagenes.length > 20) {
            throw new Error("Agrega entre 1 y 20 imágenes para el carrusel.");
        }
        if (imagenes.some((ruta) => !/^(?:img\/|\.\/|\.\.\/).+/.test(ruta))) {
            throw new Error("Cada imagen debe usar una ruta local, por ejemplo img/noticias/foto.jpg.");
        }
        if (new Set(imagenes).size !== imagenes.length) {
            throw new Error("El carrusel contiene rutas de imagen repetidas.");
        }
        return {
            ...comunes,
            imagen: imagenes[0] || "",
            imagenes,
            descripcion: valor(tipo, "descripcion").value.trim(),
            fecha: valor(tipo, "fecha").value,
            instagram: valor(tipo, "instagram").value.trim(),
            facebook: valor(tipo, "facebook").value.trim(),
            x: valor(tipo, "x").value.trim(),
            tiktok: valor(tipo, "tiktok").value.trim()
        };
    }

    return tipo === "galeria"
        ? {
            ...comunes,
            imagen: valor(tipo, "imagen").value.trim(),
            descripcion: valor(tipo, "descripcion").value.trim(),
            tamano: valor(tipo, "tamano").value
        }
        : {
            ...comunes,
            imagen: valor(tipo, "imagen").value.trim(),
            tipo: valor(tipo, "tipo").value.trim(),
            lanzamiento: valor(tipo, "lanzamiento").value.trim(),
            enlace: valor(tipo, "enlace").value.trim()
        };
}

function renderizar(tipo) {
    const lista = configuraciones[tipo].lista;
    lista.replaceChildren();
    if (estado[tipo].length === 0) {
        const vacio = document.createElement("p");
        vacio.className = "shows-panel__vacio";
        vacio.textContent = `Todavía no hay contenido de ${tipo}.`;
        lista.appendChild(vacio);
        return;
    }

    estado[tipo].forEach((elemento) => {
        const fila = document.createElement("article");
        fila.className = "contenido-fila";
        fila.dataset.id = elemento.id;
        const imagen = document.createElement("img");
        imagen.className = "contenido-fila__imagen";
        imagen.src = elemento.imagen || (tipo === "galeria" ? "img/galeria/foto1.jpg" : tipo === "musica" ? "img/musica/ep.jpg" : "img/favicon.png");
        imagen.alt = "";
        const informacion = document.createElement("div");
        informacion.className = "contenido-fila__texto";
        const titulo = document.createElement("strong");
        titulo.textContent = elemento.titulo || "Sin título";
        const detalle = document.createElement("small");
        detalle.textContent = `Orden ${elemento.orden} · ${elemento.visible ? "Visible" : "Oculto"}`;
        informacion.append(titulo, detalle);
        const acciones = document.createElement("div");
        acciones.className = "contenido-fila__acciones";
        [
            ["editar", "Editar"],
            ["visibilidad", elemento.visible ? "Ocultar" : "Mostrar"],
            ["eliminar", "Eliminar"]
        ].forEach(([accion, texto]) => {
            const boton = document.createElement("button");
            boton.type = "button";
            boton.dataset.accion = accion;
            boton.textContent = texto;
            acciones.appendChild(boton);
        });
        fila.append(imagen, informacion, acciones);
        lista.appendChild(fila);
    });
}

async function cargar(tipo) {
    mensaje(tipo, "Cargando contenido…");
    try {
        estado[tipo] = await listarContenido(tipo);
        configuraciones[tipo].migracion.hidden = estado[tipo].length !== 0
            || configuraciones[tipo].inicial.length === 0;
        renderizar(tipo);
        mensaje(tipo, `${estado[tipo].length} elemento(s) ordenados para publicación.`, "exito");
    } catch (error) {
        console.error(`No se pudo cargar ${tipo}:`, error);
        mensaje(tipo, error?.message || "No se pudo cargar el contenido.", "error");
    }
}

async function guardar(tipo, evento) {
    evento.preventDefault();
    const formulario = configuraciones[tipo].formulario;
    if (!formulario.checkValidity()) {
        formulario.reportValidity();
        return;
    }
    mensaje(tipo, "Guardando en Firestore…");
    try {
        await guardarContenido(tipo, valor(tipo, "id").value || null, datosFormulario(tipo));
        cerrarEditor(tipo);
        await cargar(tipo);
        mensaje(tipo, "El contenido se guardó correctamente.", "exito");
    } catch (error) {
        mensaje(tipo, error?.message || "No se pudo guardar.", "error");
    }
}

async function manejarAccion(tipo, evento) {
    const boton = evento.target.closest("button[data-accion]");
    if (!boton) return;
    const fila = boton.closest("[data-id]");
    const elemento = estado[tipo].find((item) => item.id === fila?.dataset.id);
    if (!elemento) return;

    try {
        if (boton.dataset.accion === "editar") {
            abrirEditor(tipo, elemento);
            return;
        }
        if (boton.dataset.accion === "visibilidad") {
            await cambiarVisibilidadContenido(tipo, elemento.id, !elemento.visible);
            await cargar(tipo);
            return;
        }
        if (boton.dataset.accion === "eliminar" && window.confirm(`¿Eliminar “${elemento.titulo}”?`)) {
            await eliminarContenido(tipo, elemento.id);
            await cargar(tipo);
        }
    } catch (error) {
        mensaje(tipo, error?.message || "No fue posible completar la acción.", "error");
    }
}

function registrar(tipo) {
    const config = configuraciones[tipo];
    config.crear.addEventListener("click", () => abrirEditor(tipo));
    config.formulario.addEventListener("submit", (evento) => guardar(tipo, evento));
    config.lista.addEventListener("click", (evento) => manejarAccion(tipo, evento));
    document.getElementById(`cancelar-${tipo}`).addEventListener("click", () => cerrarEditor(tipo));
    config.importar.addEventListener("click", async () => {
        if (!window.confirm(`¿Importar el contenido actual de ${tipo} a Firestore?`)) return;
        mensaje(tipo, "Importando contenido inicial…");
        try {
            await importarContenidoInicial(tipo, config.inicial);
            await cargar(tipo);
        } catch (error) {
            mensaje(tipo, error?.message || "No se pudo importar.", "error");
        }
    });
}

async function inicializarAdministracionContenido() {
    if (!eventosRegistrados) {
        Object.keys(configuraciones).forEach(registrar);
        eventosRegistrados = true;
    }
    await Promise.all([cargar("noticias"), cargar("galeria"), cargar("musica")]);
}

export { inicializarAdministracionContenido };
