# Dashboard JD Prototype

## Descripción General

**Dashboard JD Prototype** es una aplicación web full-stack diseñada para la gestión de usuarios, equipos/grupos, análisis de datos y carga de archivos. El sistema incluye autenticación JWT, comunicación en tiempo real con WebSockets (Socket.IO), y una interfaz de usuario moderna construida con React y Ant Design.

### Características Principales

- **Autenticación y Autorización**: Sistema de login con JWT, cambio de contraseña, recuperación de contraseña y registro de usuarios con roles (admin por defecto).
- **Gestión de Usuarios**: Creación automática de usuarios con contraseñas generadas, almacenamiento de perfiles (nombre, apellido, teléfono, rol).
- **Gestión de Grupos/Equipos**: Interface en inglés para crear y listar grupos con clasificaciones (mando gerente, mando medio, empleado).
- **Carga de Archivos**: Upload de documentos (PDF, DOCX, CSV, TXT) con validación de tipo y tamaño (límite 10MB), servidos estáticamente.
- **Análisis de Datos**: Integración con script Python para generar gráficos de análisis (matplotlib/pandas) desde datos de MySQL.
- **Comunicación en Tiempo Real**: WebSockets con Socket.IO para notificar cambios (ej. archivos subidos) a todos los clientes conectados.
- **Testing**: Configuración de tests unitarios con Jest y React Testing Library.

---

## Arquitectura del Sistema

### Frontend (React)
- **Framework**: React 17 con React Router v6
- **UI**: Ant Design 4.x (componentes, formularios, modales)
- **Estado**: Context API para autenticación
- **Comunicación en Tiempo Real**: Socket.IO Client
- **Puerto**: 3000 (desarrollo)

### Backend (Node.js/Express)
- **Framework**: Express 4.x
- **Base de Datos**: MySQL (a través de mysql2/promise)
- **Autenticación**: JWT (jsonwebtoken) + bcrypt para hashing de contraseñas
- **Upload de Archivos**: Multer con storage en disco
- **WebSockets**: Socket.IO Server
- **Puerto**: 4000 (por defecto, configurable vía `.env`)

### Análisis de Datos
- **Script Python**: `server/analytics.py`
- **Librerías**: matplotlib, pandas, mysql-connector-python
- **Función**: Genera gráficos base64 desde consultas MySQL

---

## Estructura del Proyecto

```
dashboard-jd-prototype/
├── public/                    # Assets estáticos (HTML, manifest, robots.txt)
├── src/                       # Código fuente del frontend
│   ├── auth/
│   │   └── AuthProvider.js    # Context de autenticación
│   ├── components/
│   │   ├── Dashboard.js       # Layout principal con Sidebar y Topbar
│   │   ├── Sidebar.js         # Menú lateral de navegación
│   │   ├── Topbar.js          # Barra superior con logout
│   │   └── Widget.js          # Componente de widget reutilizable
│   ├── pages/
│   │   ├── Analytics.js       # Vista de análisis (gráficos Python)
│   │   ├── ChangePassword.js  # Cambio de contraseña
│   │   ├── Files.js           # Gestión de archivos (upload/lista)
│   │   ├── Login.js           # Login + Modales de registro y recuperación
│   │   ├── Profile.js         # Perfil del usuario
│   │   ├── Teams.js           # Gestión de grupos/equipos (en inglés)
│   │   └── Users.js           # Vista de usuarios
│   ├── App.js                 # Enrutamiento principal
│   ├── setupTests.js          # Configuración de Jest (mocks)
│   └── App.test.js            # Tests unitarios
├── server/                    # Backend Node.js
│   ├── routes/
│   │   ├── analytics.js       # Endpoint para análisis (ejecuta Python)
│   │   ├── auth.js            # Login, logout, cambio de password, reset
│   │   ├── files.js           # Upload y listado de archivos (emite eventos socket)
│   │   ├── groups.js          # CRUD de grupos (GET/POST /api/groups)
│   │   └── users.js           # Creación de usuarios (POST /api/users/create)
│   ├── uploads/               # Archivos subidos por usuarios
│   ├── analytics.py           # Script Python para gráficos
│   ├── db.js                  # Pool de conexiones MySQL
│   ├── index.js               # Servidor Express + Socket.IO
│   └── package.json           # Dependencias del servidor
├── package.json               # Dependencias del frontend
└── README.md                  # Este archivo
```

---

## Instalación y Configuración

### Requisitos Previos

- **Node.js**: v14.18+ (recomendado v18 LTS)
- **npm**: v6+
- **MySQL**: 5.7+ o 8.x
- **Python**: 3.7+ (opcional, para análisis)
- **nvm** (recomendado para gestión de versiones de Node)

### 1. Clonar el Repositorio

```bash
git clone https://github.com/juandavidcr/dashboard-jd-prototype.git
cd dashboard-jd-prototype
```

### 2. Configurar Base de Datos MySQL

Crear la base de datos y las tablas necesarias:

```sql
CREATE DATABASE screenio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE screenio;

-- Tabla de usuarios (básica para autenticación)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de perfiles de usuario (ampliada)
CREATE TABLE user_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  nombre VARCHAR(200),
  apellido VARCHAR(200),
  telefono VARCHAR(50),
  role VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de grupos/equipos
CREATE TABLE grupos (
  idgrupo INT AUTO_INCREMENT PRIMARY KEY,
  consecutivo INT,
  nombre VARCHAR(255),
  clasificacion VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Opcional: Tabla para contactos de registro
CREATE TABLE tbl_contacto (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  nombre_completo VARCHAR(200) NOT NULL,
  telefono VARCHAR(50),
  industria VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Configurar Variables de Entorno (Servidor)

Crear archivo `.env` en la carpeta `server/`:

```bash
cd server
touch .env
```

Contenido de `server/.env`:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña_mysql
DB_NAME=screenio

# JWT
JWT_SECRET=tu_clave_secreta_jwt_muy_segura

# Puerto del servidor
PORT=4000

# CORS (opcional, para producción)
CLIENT_ORIGIN=http://localhost:3000
```

### 4. Instalar Dependencias

#### Backend

```bash
cd server
npm install
```

#### Frontend

```bash
cd ..  # Volver a la raíz del proyecto
npm install
```

### 5. Instalar Dependencias de Python (Opcional, para Analytics)

```bash
cd server
pip3 install mysql-connector-python matplotlib pandas
# o usando requirements.txt si existe:
# pip3 install -r requirements.txt
```

### 6. Crear Usuario Inicial (Opcional)

Usar el script `createUser.js` del servidor:

```bash
cd server
node createUser.js admin@example.com password123
```

Esto creará un usuario en la tabla `users` con la contraseña hasheada.

---

## Uso y Ejecución

### Desarrollo

#### 1. Iniciar el Servidor Backend

```bash
cd server
npm run dev   # Usa nodemon para auto-reload
# o
npm start     # Sin auto-reload
```

El servidor estará disponible en `http://localhost:4000`.

#### 2. Iniciar la Aplicación Frontend

En otra terminal, desde la raíz del proyecto:

```bash
npm start
```

La aplicación React se abrirá automáticamente en `http://localhost:3000`.

### Producción

#### Backend

```bash
cd server
NODE_ENV=production node index.js
```

#### Frontend

```bash
npm run build
```

Los archivos optimizados estarán en la carpeta `build/`. Puedes servirlos con:

```bash
npx serve -s build -p 3000
```

O configurar Nginx/Apache para servir los archivos estáticos y hacer proxy al backend.

---

## Funcionalidades Detalladas

### 1. Autenticación

#### Login (`POST /api/login`)
- Recibe `email` y `password`
- Valida credenciales contra la tabla `users`
- Devuelve token JWT con duración de 8 horas
- El frontend almacena el token en `localStorage`

#### Registro de Usuario (`POST /api/users/create`)
- Campos: `nombre`, `apellido`, `email`, `telefono`
- Si el email ya existe, devuelve el ID del usuario existente
- Si no existe:
  - Genera una contraseña aleatoria de 16 caracteres
  - Crea registro en `users` con contraseña hasheada (bcrypt)
  - Crea perfil en `user_profiles` con `role='admin'`
  - Devuelve el ID y la contraseña en texto plano (para entregar al usuario)

#### Recuperación de Contraseña (`POST /api/request-password-reset`)
- Recibe `email`
- Genera token JWT de corta duración (15 min)
- En producción, se enviaría por email; en demo se devuelve en la respuesta

#### Cambio de Contraseña (`POST /api/change-password`)
- Requiere autenticación (token JWT en header `Authorization: Bearer <token>`)
- Recibe `currentPassword` y `newPassword`
- Valida contraseña actual y actualiza

### 2. Gestión de Grupos/Equipos

#### Listar Grupos (`GET /api/groups`)
- Devuelve todos los grupos ordenados por `consecutivo`
- Crea la tabla `grupos` automáticamente si no existe

#### Crear Grupo (`POST /api/groups`)
- Campos: `consecutivo` (opcional, numérico), `nombre`, `clasificacion`
- Validación: `clasificacion` debe ser uno de: `'mando gerente'`, `'mando medio'`, `'empleado'`
- Devuelve el ID del grupo creado

#### Interfaz en Teams
- Vista en inglés (`src/pages/Teams.js`)
- Lista de grupos con nombre, consecutivo y clasificación
- Modal para crear nuevos grupos

### 3. Gestión de Archivos

#### Upload de Archivo (`POST /api/files/upload`)
- Acepta archivo vía `multipart/form-data` (campo `file`)
- Campo adicional: `type` (metadato opcional)
- Validaciones:
  - Extensiones permitidas: `.pdf`, `.docx`, `.csv`, `.txt`
  - Tamaño máximo: 10 MB
- Almacenamiento: carpeta `server/uploads/` con timestamp en el nombre
- **Comunicación en Tiempo Real**: Emite evento `fileUploaded` vía Socket.IO a todos los clientes conectados
- Respuesta: info del archivo con URL para descarga

#### Listar Archivos (`GET /api/files`)
- Devuelve array de objetos `{ filename, url }` de archivos en `uploads/`

#### Servir Archivos Estáticos
- Ruta: `http://localhost:4000/uploads/<filename>`
- Configurado con `express.static` en `server/index.js`

#### WebSockets (Socket.IO)
- El cliente (`src/pages/Files.js`) se conecta al servidor Socket.IO
- Escucha el evento `fileUploaded`
- Cuando se emite, recarga automáticamente la lista de archivos sin refrescar la página

### 4. Análisis de Datos

#### Endpoint (`GET /api/analytics`)
- Ejecuta el script Python `server/analytics.py` con `child_process.spawn`
- El script:
  - Se conecta a MySQL usando variables de entorno
  - Ejecuta consultas para obtener datos climáticos o de usuarios
  - Genera un gráfico con matplotlib
  - Devuelve el gráfico como string base64 en JSON
- El frontend (`src/pages/Analytics.js`) muestra la imagen base64

#### Script Python
- Ubicación: `server/analytics.py`
- Librerías: `mysql-connector-python`, `matplotlib`, `pandas`
- Manejo de errores: si faltan dependencias, devuelve JSON con error

### 5. Otras Vistas

#### Profile (`/profile`)
- Muestra información del usuario autenticado (`GET /api/me`)

#### Users (`/users`)
- Placeholder para gestión de usuarios (lista, edición, etc.)

#### Change Password (`/change-password`)
- Formulario para cambiar contraseña del usuario actual

---

## API Endpoints

### Autenticación

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/login` | Iniciar sesión | No |
| POST | `/api/logout` | Cerrar sesión (stateless) | No |
| GET | `/api/me` | Obtener info del usuario actual | Sí |
| POST | `/api/change-password` | Cambiar contraseña | Sí |
| POST | `/api/update-password` | Actualizar contraseña sin validar actual | Sí |
| POST | `/api/request-password-reset` | Solicitar reset de contraseña | No |
| POST | `/api/reset-password` | Resetear contraseña con token | No |

### Usuarios

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/users/create` | Crear usuario nuevo (o verificar existente) | No |

### Grupos

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/groups` | Listar todos los grupos | No |
| POST | `/api/groups` | Crear nuevo grupo | No |

### Archivos

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/files/upload` | Subir archivo | No |
| GET | `/api/files` | Listar archivos subidos | No |
| GET | `/uploads/<filename>` | Descargar/ver archivo | No |

### Análisis

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/analytics` | Obtener gráfico de análisis (Python) | No |

---

## Testing

### Ejecutar Tests del Frontend

```bash
npm test
```

- Framework: Jest + React Testing Library
- Configuración: `src/setupTests.js` (mock de `window.matchMedia` para Ant Design)
- Test principal: `src/App.test.js` (verifica que el login se renderiza correctamente)

### Ejecutar Tests en Modo CI

```bash
CI=true npm test -- --watchAll=false
```

---

## Tecnologías y Dependencias

### Frontend

- **react**: ^17.0.2
- **react-dom**: ^17.0.2
- **react-router-dom**: ^6.3.0 (enrutamiento)
- **antd**: ^4.18.3 (componentes UI)
- **@ant-design/icons**: ^4.7.0
- **socket.io-client**: ^4.6.1 (WebSockets)
- **moment**: ^2.29.1 (manejo de fechas)
- **@testing-library/react**: ^12.1.2
- **@testing-library/jest-dom**: ^5.16.1

### Backend

- **express**: ^4.18.2
- **mysql2**: ^3.2.0 (cliente MySQL con promesas)
- **bcrypt**: ^5.1.0 (hashing de contraseñas)
- **jsonwebtoken**: ^9.0.0 (JWT)
- **cors**: ^2.8.5
- **dotenv**: ^16.0.0 (variables de entorno)
- **multer**: ^1.4.4 (upload de archivos)
- **socket.io**: ^4.6.1 (WebSockets)
- **nodemon**: ^2.0.22 (dev dependency, auto-reload)

### Python (Análisis)

- **mysql-connector-python**
- **matplotlib**
- **pandas**

---

## Seguridad y Buenas Prácticas

### Implementadas

- ✅ Hashing de contraseñas con bcrypt (salt rounds: 10)
- ✅ Autenticación JWT con expiración (8 horas)
- ✅ Validación de tipos de archivo en upload
- ✅ Límite de tamaño de archivo (10MB)
- ✅ Variables de entorno para credenciales sensibles
- ✅ CORS configurado
- ✅ Sanitización de nombres de archivo (reemplaza caracteres especiales)

### Recomendaciones para Producción

- 🔒 **HTTPS**: Usar certificados SSL/TLS (Let's Encrypt)
- 🔒 **Rate Limiting**: Implementar límites de peticiones (express-rate-limit)
- 🔒 **Validación de Inputs**: Usar librerías como Joi o express-validator
- 🔒 **Protección CSRF**: Para formularios (csurf)
- 🔒 **Helmet**: Middleware para headers de seguridad
- 🔒 **Logs**: Implementar logging con Winston o Bunyan
- 🔒 **Autenticación en Endpoints**: Restringir `/api/users/create` y `/api/groups` a usuarios admin
- 🔒 **Refresh Tokens**: Implementar tokens de refresco para sesiones largas
- 🔒 **Sanitización de SQL**: El uso de `mysql2` con prepared statements (queries parametrizadas) previene SQL injection
- 🔒 **Validación de MIME types**: Verificar tipo real del archivo, no solo extensión

---

## Solución de Problemas Comunes

### Error: Cannot find module 'socket.io'

**Causa**: Dependencias no instaladas en el servidor.

**Solución**:
```bash
cd server
npm install
```

### Error: Cannot find module 'socket.io-client'

**Causa**: Dependencias no instaladas en el frontend.

**Solución**:
```bash
npm install
```

### Error: window.matchMedia is not a function (en tests)

**Causa**: jsdom (usado por Jest) no implementa `matchMedia` necesario para Ant Design.

**Solución**: Ya implementado en `src/setupTests.js` con un mock.

### Servidor no inicia: Error de conexión a MySQL

**Causa**: Credenciales incorrectas o MySQL no está corriendo.

**Solución**:
1. Verificar que MySQL esté activo: `sudo service mysql status`
2. Revisar credenciales en `server/.env`
3. Verificar que la base de datos `screenio` exista

### Python script falla en Analytics

**Causa**: Dependencias de Python no instaladas.

**Solución**:
```bash
pip3 install mysql-connector-python matplotlib pandas
```

### Tests fallan: "renders learn react link"

**Causa**: Test default de Create React App no coincide con la app actual.

**Solución**: Ya actualizado en `src/App.test.js` para verificar el texto "Iniciar sesión".

---

## Contribuir

### Workflow

1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit de cambios: `git commit -am 'Añadir nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request en GitHub

### Estándares de Código

- **JavaScript**: ESLint con configuración de Create React App
- **Commits**: Mensajes descriptivos en español o inglés
- **Tests**: Añadir tests para funcionalidades nuevas

---

## Roadmap / Mejoras Futuras

- [ ] Implementar CRUD completo para usuarios (editar, eliminar)
- [ ] Añadir edición y eliminación de grupos
- [ ] Paginación en listas de archivos y grupos
- [ ] Búsqueda y filtros en tablas
- [ ] Subida de múltiples archivos simultáneos
- [ ] Preview de archivos PDF en el navegador
- [ ] Dashboard con métricas y widgets personalizables
- [ ] Roles y permisos granulares (RBAC)
- [ ] Notificaciones push con Socket.IO
- [ ] Internacionalización (i18n) completa
- [ ] Integración con servicios de email (SendGrid, SES)
- [ ] Dockerización del proyecto
- [ ] CI/CD con GitHub Actions
- [ ] Tests E2E con Cypress o Playwright

---

## Licencia

Este proyecto es privado y de uso interno. Todos los derechos reservados.

---

## Contacto y Soporte

**Desarrollador**: Juan David  
**Repositorio**: [github.com/juandavidcr/dashboard-jd-prototype](https://github.com/juandavidcr/dashboard-jd-prototype)  
**Rama principal**: `dev`

Para reportar issues o solicitar features, usar el sistema de Issues de GitHub.

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
