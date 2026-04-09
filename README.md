# Trello Del Temu - Gestor de Tareas Escolares

Una plataforma simplificada para equipos escolares donde cada integrante gestiona tareas con evidencias obligatorias y colabora visualmente.

## Características
- **Autenticación con Google**: Inicio de sesión rápido y seguro.
- **Espacios de Trabajo**: Crea o únete a equipos mediante códigos de invitación.
- **Tablero Visual (React Flow)**: Visualiza a los miembros del equipo como nodos y sus colaboraciones como conexiones dinámicas.
- **Tareas con Evidencias**: Las tareas requieren obligatoriamente la subida de archivos (PDF, Imágenes, Office).
- **Colaboración Real**: Asigna colaboradores a una tarea y observa cómo se dibujan las relaciones en el tablero.
- **Previsualización y Descarga**: Mira miniaturas de imágenes y descarga evidencias directamente.

## Stack Tecnológico
- **Frontend**: React, Tailwind CSS, React Flow, Lucide React, Firebase Auth.
- **Backend**: Node.js, Express, MongoDB (Mongoose), Firebase Admin SDK.
- **Almacenamiento**: Firebase Storage.

## Requisitos Previos
- Node.js instalado.
- Una base de datos MongoDB (Local o Atlas).
- Un proyecto en Firebase con Auth (Google) y Storage habilitados.

## Configuración

### 1. Backend
1. Ve a la carpeta `backend`.
2. Crea un archivo `.env` basado en la plantilla:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/trello-del-temu
   FIREBASE_PROJECT_ID=tu-proyecto
   FIREBASE_CLIENT_EMAIL=tu-email-servicio
   FIREBASE_PRIVATE_KEY="tu-llave-privada"
   FIREBASE_STORAGE_BUCKET=tu-bucket.appspot.com
   ```
3. Instala dependencias: `npm install`
4. Inicia el servidor: `npm run dev`

### 2. Frontend
1. Ve a la carpeta `frontend`.
2. Crea un archivo `.env` basado en la plantilla:
   ```env
   VITE_FIREBASE_API_KEY=tu-api-key
   VITE_FIREBASE_AUTH_DOMAIN=tu-auth-domain
   VITE_FIREBASE_PROJECT_ID=tu-project-id
   VITE_FIREBASE_STORAGE_BUCKET=tu-storage-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
   VITE_FIREBASE_APP_ID=tu-app-id
   VITE_API_URL=http://localhost:5000
   ```
3. Instala dependencias: `npm install`
4. Inicia la aplicación: `npm run dev`

## Uso
1. Inicia sesión con Google.
2. Crea un nuevo "Espacio de Trabajo".
3. Comparte el código de invitación con tus compañeros.
4. Una vez que se unan, aparecerán en el tablero.
5. Haz clic en el botón "+" de cualquier tarjeta de usuario para asignarle una tarea.
6. Sube los archivos de evidencia obligatorios.
7. Si añades colaboradores, verás líneas azules conectando a los usuarios en el tablero.
8. Haz clic en las líneas o en las tareas dentro de las tarjetas para ver los detalles y descargar evidencias.
