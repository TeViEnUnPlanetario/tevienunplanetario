# 🌌 Proyecto Observatorio

## Historial de desarrollo

Este documento registra la evolución del proyecto **Observatorio**,
la comunidad oficial de **Te Vi En Un Planetario**.

Cada versión representa una etapa importante del desarrollo.

---

# v0.4 — Observatorio

**Fecha**
23 de julio de 2026

**Estado**
🚧 En desarrollo

---

## ✨ Añadido

- Nueva página `observatorio.html`.
- Diseño inicial del Observatorio.
- Arquitectura modular para la comunidad.
- Caja para crear Observaciones.
- Contador de caracteres.
- Validación del botón Publicar.
- Tarjetas iniciales del feed.
- Sistema de componentes reutilizables.
- Archivo `card-observacion.js`.
- Archivo `feed.js`.
- Archivo `crear-observacion.js`.
- Hoja de estilos independiente `observatorio.css`.

---

## 🏗 Arquitectura

Se adopta oficialmente una arquitectura basada en componentes.

```
crear-observacion.js

↓

card-observacion.js

↓

feed.js

↓

Firestore (próximamente)
```

Cada módulo tiene una única responsabilidad.

---

## 🌌 Filosofía del proyecto

Observatorio no pretende ser una red social convencional.

Todo el lenguaje de la plataforma forma parte del universo de
**Te Vi En Un Planetario**.

| Convencional | Observatorio |
|--------------|--------------|
| Usuario | Viajero |
| Publicación | Observación |
| Comentario | Eco |
| Like | Estrella |
| Notificación | Señal |
| Administrador | Astrónomo |

---

## 🎨 Decisiones de diseño

Se eligió una estética basada en:

- Glassmorphism.
- Profundidad.
- Sombras suaves.
- Iluminación tenue.
- Tarjetas flotantes.
- Movimiento sutil.
- Experiencia inmersiva.

La prioridad es transmitir la sensación de encontrarse dentro de un observatorio espacial.

---

## 🚀 Próximo objetivo

Implementar:

- Creación dinámica de Observaciones.
- Feed en tiempo real.
- Integración con Firestore.
- Ecos.
- Estrellas.

---

## 💜 Nota del desarrollador

Proyecto Observatorio nace con la intención de construir un espacio
donde la música y la comunidad convivan dentro del mismo universo.

No buscamos desarrollar únicamente una página web.

Queremos crear un lugar al que las personas quieran regresar.

---

*"Las estrellas no brillan para competir entre ellas.
Brillan para iluminar el mismo cielo."*

"La mejor arquitectura no es la que tiene más patrones de diseño; es la que hace que el siguiente cambio sea sencillo."

## 📓 Diario de desarrollo

23 de julio de 2026

Hoy comenzó oficialmente el desarrollo del Observatorio.

Después de varias semanas desarrollando la autenticación,
los perfiles y la infraestructura de Firebase,
se tomó la decisión de comenzar la construcción
de la comunidad oficial de Te Vi En Un Planetario.

También se adoptó una arquitectura basada en componentes
que permitirá escalar el proyecto durante los próximos años.



v0.5 — Experiencia de bienvenida

Fecha
28 de julio de 2026

Estado
🚧 En desarrollo

✨ Añadido
Nueva experiencia de bienvenida antes de ingresar al proyecto.
Narrativa introductoria dividida en múltiples escenas.
Página bienvenida.html.
Sistema de revelado progresivo mediante scroll.
Fondo espacial dinámico con nebulosas, partículas y estrellas.
Indicadores interactivos para avanzar entre cada escena.
Sección de dedicatoria para Alexis e Ilka.
Presentación del desarrollador integrada en la experiencia.
Acceso final hacia el proyecto principal.
Transición cinematográfica entre la bienvenida y el sitio.
🎨 Mejoras visuales

Se realizó una renovación completa de la experiencia visual de la bienvenida.

Entre las mejoras destacan:

Botones con efecto Glassmorphism.
Iluminación dinámica.
Resplandor progresivo del universo.
Animaciones suaves en cada escena.
Logo con respiración sutil.
Nebulosas con mayor profundidad.
Fondo espacial más inmersivo.
Mayor consistencia visual con el resto del proyecto.
Adaptación responsive para escritorio y dispositivos móviles.
🌌 Experiencia narrativa

La página de bienvenida deja de ser únicamente una pantalla de acceso.

Ahora funciona como una pequeña introducción al universo de Te Vi En Un Planetario, permitiendo que el visitante descubra gradualmente la historia detrás del proyecto antes de ingresar al sitio principal.

La narrativa se desarrolla en ocho momentos:

✦ Presentación.
Logotipo.
Antes de comenzar.
Tómense un minuto.
Este pequeño universo tiene una historia.
Antes de entrar...
Dedicatoria.
Acceso al proyecto.
🏗 Decisiones técnicas

Durante esta versión se reorganizó completamente la estructura de la página de bienvenida.

Se implementaron:

Componentes reutilizables para cada bloque narrativo.
Sistema uniforme de centrado y composición.
Animaciones desacopladas de la estructura HTML.
Preparación para efectos visuales independientes mediante módulos JavaScript.
Compatibilidad con futuras transiciones avanzadas.
💡 Filosofía

La bienvenida no busca únicamente dirigir al usuario hacia otra página.

Busca crear una pausa.

Un pequeño momento para preparar al visitante antes de entrar al universo del proyecto.

Cada transición, cada estrella y cada animación tienen la intención de transmitir la misma sensación que inspira la música de Te Vi En Un Planetario:

detenerse un momento, observar el cielo y dejarse llevar.

🚀 Próximo objetivo

Implementar la versión cinematográfica de la transición final:

Salto al hiperespacio.
Constelación dinámica en la escena final.
Estrellas generadas de forma completamente aleatoria.
Desintegración progresiva del universo.
Apertura del proyecto mediante una transición inmersiva.
📓 Diario de desarrollo

28 de julio de 2026

Hoy la página de bienvenida dejó de ser una simple pantalla de acceso y comenzó a convertirse en una experiencia.

Durante esta sesión se trabajó principalmente en la narrativa, el ritmo visual y la composición de cada escena. Se reorganizó el HTML, se reconstruyó gran parte del CSS para mantener una estructura consistente y se diseñó una secuencia donde el visitante avanza poco a poco antes de descubrir el proyecto.

También nació una nueva idea que probablemente definirá la identidad de la bienvenida: un salto al hiperespacio que conecte visualmente esta introducción con la página principal, haciendo que el ingreso al universo de Te Vi En Un Planetario se sienta como un verdadero viaje.

"Todo viaje comienza mucho antes del primer paso. A veces comienza simplemente mirando hacia las estrellas."


vamos por la version 1.0!!!!!! 🤗🥳