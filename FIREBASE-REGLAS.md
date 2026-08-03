# Reglas de Firebase para Te Vi En Un Planetario

## Publicarlas desde Firebase Console

1. Abre **Firebase Console → Firestore Database → Reglas**.
2. Reemplaza el contenido actual por el archivo `firestore-administracion.rules`.
3. Pulsa **Publicar** y vuelve a iniciar sesión después de unos segundos.

## Probar localmente

No abras `index.html` como `file://`. Sirve la carpeta por HTTP y usa una dirección como `http://localhost:8000`. En **Authentication → Configuración → Dominios autorizados**, confirma `localhost` y `tevienunplanetario.github.io`.

## Privacidad

`usuarios/{uid}` contiene el perfil público. `usuarios/{uid}/privado/perfil` contiene correo, edad y redes; solo puede leerlo el propietario o alguien que haya agregado al viajero a su constelación. Al entrar tras publicar las reglas, los perfiles antiguos migran esos campos automáticamente.

Los contadores siguen gestionados por el cliente. Cuando el proyecto crezca conviene trasladarlos a Cloud Functions para impedir actividad artificial.
