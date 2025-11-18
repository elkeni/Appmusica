# CloudTune

Este proyecto es una aplicación web para escuchar estaciones de radio gratuitas. Está construida con React, Tailwind CSS y Firebase. La aplicación se puede ejecutar localmente en cualquier entorno que soporte Node.js y se puede desplegar fácilmente en Firebase Hosting. Puedes abrir este proyecto en Visual Studio seleccionando **Abrir carpeta** o creando un proyecto de Node.js desde la carpeta.

## Requisitos

- Node.js ≥ 14.
- npm (o yarn) para instalar dependencias.
- Una cuenta de [Firebase](https://console.firebase.google.com/) para crear tu proyecto.

## Configuración

1. Abre una terminal en la carpeta raíz del proyecto y ejecuta:

   ```bash
   npm install
   ```

2. Crea un proyecto en Firebase y agrega una aplicación web. Copia los valores de configuración (`apiKey`, `authDomain`, `projectId`, etc.) y reemplázalos en el archivo `src/firebase.js`.

3. (Opcional) Si deseas desplegar la aplicación en Firebase Hosting:
   - Instala la CLI de Firebase:

     ```bash
     npm install -g firebase-tools
     ```

   - Inicia sesión en tu cuenta de Firebase:

     ```bash
     firebase login
     ```

   - Inicializa el proyecto (puedes aceptar la mayoría de las opciones por defecto; asegúrate de elegir "hosting" y usar la carpeta `build` como directorio público):

     ```bash
     firebase init
     ```

   - Genera la versión de producción de la aplicación:

     ```bash
     npm run build
     ```

   - Implementa en Firebase Hosting:

     ```bash
     firebase deploy --only hosting
     ```

   Un archivo `firebase.json` ya está incluido para configurar correctamente el hosting de una aplicación de página única.

4. Para iniciar el servidor de desarrollo en tu máquina local:

   ```bash
   npm start
   ```

   La aplicación se abrirá automáticamente en `http://localhost:3000`.

## Estructura de Carpetas

- `src/`: Contiene los archivos de código fuente.
- `public/`: Contiene el archivo HTML base.
- `firebase.json`: Configuración de Firebase Hosting.
- `tailwind.config.js` y `postcss.config.js`: Configuración de Tailwind CSS.

## Notas

La aplicación utiliza la API pública de [Radio Browser](https://www.radio-browser.info/) para buscar estaciones de radio. Ahora los favoritos se almacenan en **Cloud Firestore** a través de Firebase, lo que permite que tus favoritos se sincronicen entre dispositivos y usuarios que utilicen el mismo documento. Si quieres cambiar la colección o el documento utilizados para guardar los favoritos, edita el archivo `src/App.js`. El diseño es responsive y debe funcionar tanto en equipos de escritorio como en móviles.