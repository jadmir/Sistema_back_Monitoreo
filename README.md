# Sistema de Capacitaciones

Sistema backend para gestión de capacitaciones con Node.js, Express y MySQL.

## 🚀 Características

- Gestión de usuarios con autenticación JWT
- Registro de capacitaciones
- Control de asistencias con firmas digitales
- Gestión de productos y secciones
- Generación de documentos Word

## 📋 Requisitos

- Node.js 18 o superior
- MySQL 8 o superior

## ⚙️ Instalación

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   - Copiar `.env.example` a `.env`
   - Configurar las credenciales de base de datos

4. Importar la base de datos:
   ```bash
   mysql -u root -p < bio_capacitaciones_mejorado.sql
   ```

5. Iniciar el servidor:
   ```bash
   npm run dev
   ```

## 🌐 Despliegue

El servidor escuchará en el puerto configurado en `.env` (por defecto 4000).

## 📚 API Endpoints

- `/api/usuarios` - Gestión de usuarios
- `/api/capacitaciones` - Gestión de capacitaciones
- `/api/productos` - Gestión de productos
- `/api/secciones` - Gestión de secciones
- `/api/asistencias` - Registro de asistencias

## 🔒 Seguridad

- Autenticación mediante JWT
- Contraseñas hasheadas con bcrypt
- Variables de entorno para credenciales sensibles
