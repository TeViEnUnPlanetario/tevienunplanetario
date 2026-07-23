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