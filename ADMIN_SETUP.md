# Panel de Administrador - Request The AI

## 🚀 Nueva Funcionalidad: Panel de Administrador

Se ha implementado un panel completo de administración que permite gestionar usuarios de manera eficiente.

## ✨ Características

### 🔒 Autenticación con Roles
- **Redirección automática**: Los usuarios con rol `ADMIN` son redirigidos automáticamente a `/admin` al iniciar sesión
- **Usuarios normales**: Los usuarios con rol `USER` siguen siendo redirigidos a `/dashboard`
- **Protección de rutas**: Solo administradores pueden acceder al panel de administración

### 👥 Gestión de Usuarios
- **Ver todos los usuarios**: Lista completa con información detallada
- **Crear usuarios**: Formulario para crear nuevos usuarios (USER o ADMIN)
- **Eliminar usuarios**: Funcionalidad de eliminación con confirmación
- **Información mostrada**:
  - Nombre de usuario
  - Nombre completo
  - Email
  - Rol (con badges de colores)
  - Balance actual
  - Fecha de registro

## 🛠️ Endpoints del Backend

Se agregaron los siguientes endpoints para administradores:

```
POST /api/users          - Crear nuevo usuario (solo ADMIN)
GET /api/users           - Obtener todos los usuarios (solo ADMIN)
DELETE /api/users/delete/{username} - Eliminar usuario (solo ADMIN)
```

## 🎨 Interfaz de Usuario

- **Diseño moderno**: Interfaz limpia y responsive
- **Modales interactivos**: Para crear usuarios y confirmar eliminaciones
- **Alertas de éxito/error**: Feedback inmediato al usuario
- **Badges de roles**: Identificación visual clara de roles
- **Formularios validados**: Validación en frontend y backend

## 📋 Instrucciones de Uso

### 1. Crear un Usuario Administrador

Ya que no hay usuarios ADMIN en `data.sql`, necesitas crear uno manualmente:

1. Inicia la aplicación con `docker-compose up`
2. Accede a **Adminer** en `http://localhost:8080`
3. Conecta con las credenciales de la base de datos
4. Ejecuta el siguiente SQL para crear un admin:

```sql
-- Crear usuario administrador
INSERT INTO users (username, password) VALUES 
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Crear cuenta de administrador (password: "password")
INSERT INTO accounts (full_name, email, role, status, balance, user_id) 
SELECT 'Administrador', 'admin@example.com', 'ADMIN', 'ACTIVE', 1000.00, u.id 
FROM users u WHERE u.username = 'admin';
```

**Nota**: La contraseña encriptada corresponde a `"password"`. Te recomiendo cambiarla después.

### 2. Acceso al Panel

1. Ve a `http://localhost:3000/login`
2. Inicia sesión con:
   - **Usuario**: `admin`
   - **Contraseña**: `password`
3. Serás redirigido automáticamente a `/admin`

### 3. Gestión de Usuarios

Una vez en el panel de administrador:

- **Ver usuarios**: La tabla muestra todos los usuarios registrados
- **Crear usuario**: 
  - Haz clic en "Crear Usuario"
  - Completa el formulario
  - Selecciona el rol (USER o ADMIN)
  - Haz clic en "Crear Usuario"
- **Eliminar usuario**:
  - Haz clic en el ícono de papelera 🗑️
  - Confirma la eliminación en el modal

## 🔧 Estructura Técnica

### Backend
- **DTO**: `CreateUserRequest` para crear usuarios con rol
- **Service**: `UserService.createUser()` método agregado
- **Controller**: `UserController` endpoint POST agregado
- **Seguridad**: Configuración actualizada para proteger endpoints

### Frontend
- **Página**: `AdminPage.jsx` - Panel principal de administración
- **Componente**: `UserManagement.jsx` - Gestión de usuarios
- **Servicio**: `adminService.js` - Comunicación con el backend
- **Estilos**: `admin.css` - Estilos específicos para el panel
- **Autenticación**: `authService.js` actualizado para manejar roles

## 🚨 Seguridad

- **Autorización**: Todos los endpoints están protegidos con `@PreAuthorize("hasAuthority('ADMIN')")`
- **Validación**: Validación en frontend y backend
- **Tokens JWT**: Autenticación basada en tokens
- **Verificación de rol**: Verificación en cada solicitud

## 🎯 Próximas Mejoras Sugeridas

1. **Editar usuarios**: Funcionalidad para modificar usuarios existentes
2. **Cambiar contraseñas**: Permitir cambio de contraseñas de usuarios
3. **Estadísticas**: Dashboard con métricas de usuarios y uso
4. **Logs de actividad**: Registro de acciones administrativas
5. **Exportar datos**: Funcionalidad para exportar lista de usuarios
6. **Filtros y búsqueda**: Buscar usuarios por nombre, email, etc.

¡El panel de administrador está listo para usar! 🎉 