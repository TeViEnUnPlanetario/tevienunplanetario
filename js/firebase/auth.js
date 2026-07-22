console.log("auth.js comenzó a ejecutarse");

import {
    auth,
    db
} from "./firebase-config.js";

console.log(
    "Firebase conectado correctamente",
    auth,
    db
);