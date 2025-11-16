Server minimal para autenticación (MySQL + JWT)

1) Crear base de datos y tabla `users`:

```sql
CREATE DATABASE screenio;
USE screenio;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserta un usuario de ejemplo (recomendado generar el hash con node)
```

2) Generar hash para contraseña con Node.js:

```js
const bcrypt = require('bcrypt');
bcrypt.hash('password123', 10).then(h => console.log(h));
```

Inserta en la tabla:

```sql
INSERT INTO users (email, password) VALUES ('admin@example.com', '<hash_aqui>');
```

3) Configurar variables en `.env` (usa `.env.example` como referencia).

4) Instalar dependencias y ejecutar:

```bash
cd server
npm install
npm run dev   # o npm start
```

El servidor expondrá endpoints:
- `POST /api/login` { email, password } -> { token, user }
- `GET /api/me` (header Authorization: Bearer <token>) -> { id, email }
- `POST /api/change-password` { currentPassword, newPassword } (auth)
- `POST /api/logout` (opcional)
