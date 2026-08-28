# Publicar TAC Search

Esta guía deja la aplicación en Internet usando GitHub y Vercel. No hace falta tener un servidor propio encendido.

## 1. Subir el proyecto a GitHub

### Opción sencilla: GitHub Desktop

1. Creá una cuenta en [GitHub](https://github.com/) e instalá [GitHub Desktop](https://desktop.github.com/).
2. En GitHub Desktop elegí **File → Add local repository**.
3. Seleccioná la carpeta `tac-search`.
4. Escribí un mensaje como `Primera versión de TAC Search` y pulsá **Commit to main**.
5. Pulsá **Publish repository**.
6. Elegí si el repositorio será privado o público y confirmá.

La opción privada es recomendable mientras configurás las claves y comprobás el sitio.

### Opción por terminal

Después de crear un repositorio vacío en GitHub, ejecutá dentro de `tac-search`:

```bash
git add .
git commit -m "Primera versión de TAC Search"
git remote add origin https://github.com/TU-USUARIO/tac-search.git
git push -u origin main
```

Reemplazá `TU-USUARIO` por tu nombre de usuario. Antes de confirmar, `git status` no debe mostrar `.env.local`, `node_modules` ni `.next`.

## 2. Publicarlo gratis en Vercel

1. Entrá a [Vercel](https://vercel.com/) usando tu cuenta de GitHub.
2. Elegí **Add New → Project** e importá el repositorio `tac-search`.
3. Vercel detectará Next.js automáticamente. No cambies el comando de build.
4. Abrí **Environment Variables** y agregá las claves que quieras usar.
5. Pulsá **Deploy**.

Cuando termine, recibirás una dirección parecida a `tac-search.vercel.app`. Cada cambio que subas a la rama `main` publicará una nueva versión automáticamente.

## 3. Variables recomendadas

La aplicación funciona sin claves, pero para ampliar mucho la cobertura conviene configurar al menos una búsqueda web general:

| Variable | Recomendación |
| --- | --- |
| `SERPAPI_API_KEY` | Google Images mediante SerpApi. |
| `BRAVE_SEARCH_API_KEY` | Índice de imágenes de Brave. |
| `FLICKR_API_KEY` | Archivo público de Flickr. |
| `PEXELS_API_KEY` | Banco de imágenes Pexels. |
| `UNSPLASH_ACCESS_KEY` | Banco de imágenes Unsplash. |
| `PIXABAY_API_KEY` | Banco de imágenes Pixabay. |
| `MOCK_MODE` | Usá `auto`. |
| `SEARCH_COUNTRY` | Usá `AR` si el público principal está en Argentina. |
| `SEARCH_LANGUAGE` | Usá `es`. |
| `USE_SYSTEM_CA` | En Vercel puede quedar en `false`. |

No copies el archivo `.env.local` a GitHub. En Vercel, las variables se cargan una por una y sus valores quedan protegidos.

## 4. Conectar un dominio propio

1. En el proyecto de Vercel abrí **Settings → Domains**.
2. Escribí tu dominio, por ejemplo `tacsearch.com.ar`.
3. Vercel mostrará el registro DNS que debés agregar donde compraste el dominio.
4. Después de la verificación, Vercel activa HTTPS automáticamente.

El alojamiento puede comenzar con el plan gratuito de Vercel para un proyecto personal. La dirección `*.vercel.app` es gratuita; un dominio personalizado normalmente se compra y renueva por separado.

## 5. Actualizaciones

Editá el proyecto, comprobalo y subí los cambios:

```bash
npm run check
npm run build
git add .
git commit -m "Descripción del cambio"
git push
```

GitHub volverá a ejecutar las comprobaciones y Vercel publicará la actualización si todo está correcto.
