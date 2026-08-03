let resolverActual = null;

function asegurarCapa() {
    let capa = document.getElementById("confirmacion-global");
    if (capa) return capa;
    const estilos = document.createElement("style");
    estilos.textContent = `.confirmacion-global{position:fixed;z-index:100000;inset:0;display:grid;place-items:center;padding:20px;background:rgba(3,2,8,.76);backdrop-filter:blur(9px);opacity:0;transition:opacity .2s ease}.confirmacion-global--visible{opacity:1}.confirmacion-global__caja{width:min(430px,100%);padding:27px;border:1px solid rgba(218,197,255,.2);border-radius:20px;color:#f7f1ff;background:linear-gradient(145deg,rgba(29,22,44,.98),rgba(10,8,17,.98));box-shadow:0 28px 90px rgba(0,0,0,.62),0 0 35px rgba(145,93,230,.12);transform:translateY(8px) scale(.98);transition:transform .22s ease}.confirmacion-global--visible .confirmacion-global__caja{transform:none}.confirmacion-global__simbolo{display:grid;place-items:center;width:42px;height:42px;margin-bottom:18px;border:1px solid rgba(239,156,168,.25);border-radius:50%;color:#ffbdc6;background:rgba(190,65,82,.1)}.confirmacion-global h2{margin:0 0 10px;font:600 1.65rem/1.1 'Cormorant Garamond',serif}.confirmacion-global p{margin:0;color:rgba(235,226,246,.7);font:.76rem/1.7 Montserrat,sans-serif}.confirmacion-global__acciones{display:flex;justify-content:flex-end;gap:9px;margin-top:25px}.confirmacion-global button{min-height:42px;padding:0 16px;border:1px solid rgba(218,197,255,.17);border-radius:10px;color:#eee5fa;background:rgba(255,255,255,.05);font:600 .7rem Montserrat,sans-serif;cursor:pointer}.confirmacion-global__aceptar{border-color:rgba(239,156,168,.28)!important;color:#17090d!important;background:linear-gradient(135deg,#ef9ca8,#ffc0c8)!important}`;
    document.head.append(estilos);
    capa = document.createElement("div");
    capa.id = "confirmacion-global"; capa.className = "confirmacion-global"; capa.hidden = true;
    capa.innerHTML = `<section class="confirmacion-global__caja" role="alertdialog" aria-modal="true" aria-labelledby="confirmacion-global-titulo" aria-describedby="confirmacion-global-mensaje"><span class="confirmacion-global__simbolo" aria-hidden="true">!</span><h2 id="confirmacion-global-titulo">Confirmar acción</h2><p id="confirmacion-global-mensaje"></p><div class="confirmacion-global__acciones"><button type="button" data-confirmar="no">Cancelar</button><button class="confirmacion-global__aceptar" type="button" data-confirmar="si">Confirmar</button></div></section>`;
    document.body.append(capa);
    capa.addEventListener("click", evento => {
        const decision = evento.target.closest("[data-confirmar]")?.dataset.confirmar;
        if (!decision) return;
        const resolver = resolverActual; resolverActual = null; capa.classList.remove("confirmacion-global--visible");
        setTimeout(() => { capa.hidden = true; resolver?.(decision === "si"); }, 180);
    });
    return capa;
}

export function confirmarAccion({ titulo = "Confirmar acción", mensaje, aceptar = "Confirmar" } = {}) {
    const capa = asegurarCapa();
    if (resolverActual) resolverActual(false);
    capa.querySelector("#confirmacion-global-titulo").textContent = titulo;
    capa.querySelector("#confirmacion-global-mensaje").textContent = mensaje || "Esta acción necesita tu confirmación.";
    capa.querySelector(".confirmacion-global__aceptar").textContent = aceptar;
    capa.hidden = false;
    requestAnimationFrame(() => { capa.classList.add("confirmacion-global--visible"); capa.querySelector("[data-confirmar='no']").focus(); });
    return new Promise(resolve => { resolverActual = resolve; });
}
