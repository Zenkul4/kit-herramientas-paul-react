# Kit de Paul - React

Aplicación de Paul Sanchez Matos, matrícula 20251200. Usa React y Capacitor para Android. Incluye predicción de género, persona aleatoria, universidades, clima, Pokémon con sonido, noticias y contacto.

## Compilación

Instalar Node.js y el SDK de Android, ejecutar `npm ci`, `npm run build`, `npx cap sync android` y, desde `android/`, `./gradlew assembleDebug`. Abrir la carpeta `android` en Android Studio. El APK queda en `android/app/build/outputs/apk/debug/`.

## Fuentes y atribuciones

- Fotografía de caja de herramientas: Per Erik Strandberg, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:20060513_toolbox.jpg), [CC BY-SA 2.5](https://creativecommons.org/licenses/by-sa/2.5/); archivo original sin modificar, mostrado ajustado al espacio.
- Noticias: [WordPress.org News](https://wordpress.org/news/wp-json/wp/v2/posts?per_page=3).
- Servicios: Genderize, Random User, Adamix, Open-Meteo y PokéAPI. La aplicación requiere conexión a Internet. El clima corresponde a Santo Domingo y usa la fecha y zona horaria de República Dominicana.
