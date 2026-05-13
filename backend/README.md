# Backend - Torneo de Tenis de Mesa

Sistema completo de backend para gestionar un torneo de tenis de mesa con autenticacion, usuarios y ranking.

## Caractéristicas

✅ **Autenticacion Segura**
- JWT (JSON Web Tokens) con duracion de 24 horas
- Contraseñas hasheadas con bcrypt (10 salt rounds)
- Token refresh automático en cada login

✅ **Sistema de Usuarios**
- Registro y login de usuarios
- Campos: nombre, apellido, email, edad, pais, puntos, rol
- Validacion completa de datos

✅ **Sistema de Roles**
- Rol "jugador": acceso basico
- Rol "admin": acceso a gestion de usuarios y puntos
- Control de acceso basado en roles (RBAC)

✅ **Gestion de Puntos y Ranking**
- Puntos de cada usuario (0 al inicio)
- Ranking publico ordenado por puntos
- Solo admins pueden actualizar puntos

✅ **CRUD Completo**
- Crear, leer, actualizar y eliminar usuarios
- Cambio de contraseña
- Actualizacion de perfil

## Instalacion

### Prerequisitos
- Node.js v16 o superior
- npm o yarn

### Pasos

1. **Instalar dependencias**
```bash
npm install
```

2. **Configurar variables de entorno (opcional)**
```bash
# En el archivo .env (create if not exists)
PORT=5000
JWT_SECRET=your-secret-key-here
```

3. **Iniciar servidor en desarrollo**
```bash
npm run dev
```

4. **O iniciar en produccion**
```bash
npm start
```

El servidor estará disponible en: `http://localhost:5000`

## Estructura del Proyecto

```
backend/
├── src/
│   ├── controllers/
│   │   └── authController.js      # Logica de los endpoints
│   ├── middlewares/
│   │   └── authMiddleware.js      # Verificacion de JWT
│   ├── repositories/
│   │   └── userRepository.js      # Acceso a datos de usuarios
│   ├── routes/
│   │   └── authRoutes.js          # Definicion de rutas
│   ├── services/
│   │   └── authService.js         # Logica de negocio (bcrypt, JWT)
│   ├── utils/
│   │   └── validation.js          # Funciones de validacion
│   └── data/
│       └── users.json             # Almacenamiento de usuarios (JSON)
├── sql/
│   └── usuarios.sql               # Script SQL para base de datos
├── request/
│   └── usuarios.rest              # Pruebas de API (REST Client)
├── package.json
├── index.js                       # Archivo principal
└── API_DOCUMENTATION.md           # Documentacion de endpoints
```

## Dependencias

- **express** (^5.2.1): Framework web
- **cors** (^2.8.6): CORS para frontend
- **bcryptjs** (^3.0.3): Hashing de contraseñas
- **jsonwebtoken** (^9.0.3): JWT para autenticacion

## Endpoints Principales

### Publicos
- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/login` - Login
- `GET /auth/ranking` - Obtener ranking

### Protegidos (requieren token)
- `GET /auth/profile` - Obtener perfil del usuario
- `PUT /auth/profile` - Actualizar perfil
- `PUT /auth/change-password` - Cambiar contraseña

### Admin
- `GET /auth/users` - Listar todos los usuarios
- `PUT /auth/users/:id/role` - Cambiar rol
- `PUT /auth/users/:id/points` - Actualizar puntos
- `DELETE /auth/users/:id` - Eliminar usuario

## Ejemplo de Uso

### 1. Registrarse
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "Perez",
    "email": "juan@example.com",
    "password": "MiContraseña123",
    "edad": 25,
    "pais": "España"
  }'
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "nombre": "Juan",
    "apellido": "Perez",
    "email": "juan@example.com",
    "edad": 25,
    "pais": "España",
    "puntos": 0,
    "rol": "jugador",
    "createdAt": "2026-04-10T10:30:00.000Z",
    "updatedAt": "2026-04-10T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Login
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "MiContraseña123"
  }'
```

### 3. Usar Token para Rutas Protegidas
```bash
curl -X GET http://localhost:5000/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Pruebas de API

Se incluye archivo `request/usuarios.rest` para usar con extensiones como REST Client en VS Code.

1. Instala la extension "REST Client" en VS Code
2. Abre el archivo `request/usuarios.rest`
3. Haz click en "Send Request" en cada endpoint
4. Los tokens se guardan automaticamente en la variable `@token`

## Persistencia de Datos

Actualmente usa **JSON** para persistencia (`src/data/users.json`).

Para migrar a **MySQL/PostgreSQL**:

1. Ejecuta el script SQL:
```bash
mysql -u usuario -p base_datos < sql/usuarios.sql
```

2. Instala el ORM (ej: Sequelize):
```bash
npm install sequelize mysql2
```

3. Actualiza `userRepository.js` para usar el ORM en lugar de JSON.

Consulta `API_DOCUMENTATION.md` para documentacion completa.

## Validaciones

- ✓ Nombre y apellido: minimo 2 caracteres
- ✓ Email: formato valido y unico
- ✓ Contraseña: minimo 8 caracteres
- ✓ Edad: numero entre 5 y 120
- ✓ Pais: minimo 2 caracteres
- ✓ Rol: solo "jugador" o "admin"
- ✓ Puntos: numero entero (solo admin puede modificar)

## Seguridad

- Contraseños hasheados con bcrypt
- JWT para autenticacion
- Validacion de entrada en todos los endpoints
- Middleware de autenticacion
- Control de acceso basado en roles
- Headers CORS configurados

## Variables de Entorno

```bash
PORT=5000                          # Puerto del servidor
JWT_SECRET=secret-key-123          # Clave para firmar tokens JWT
NODE_ENV=development               # Entorno (development/production)
```

## Errores Comunes

### Error: "Token requerido"
- Asegurate de incluir el header: `Authorization: Bearer <token>`

### Error: "Credenciales invalidas"
- Verifica email y contraseña
- Asegurate de que el usuario existe

### Error: "Email ya esta registrado"
- El email ya existe en la base de datos
- Usa otro email o usa login si ya tienes cuenta

### Error: "Se requiere rol admin"
- Solo usuarios con rol "admin" pueden acceder
- Contacta al admin para cambiar tu rol

## Proximos Pasos

- [ ] Conectar a base de datos MySQL/PostgreSQL
- [ ] Agregar endpoint para buscar usuarios
- [ ] Agregar sistema de partidas/enfrentamientos
- [ ] Agregar historial de puntos
- [ ] Agregar notificaciones por email
- [ ] Agregar refresh token
- [ ] Agregar rate limiting

---

**Creado:** Abril 10, 2026
**Autor:** Jesus V
**Version:** 1.0.0
