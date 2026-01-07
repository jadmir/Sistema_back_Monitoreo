# Sistema de Capacitaciones - Deployment

## 📝 Variables de Entorno para Railway

Configura estas variables en el dashboard de Railway:

```
PORT=4000
DB_HOST=<host_mysql_railway>
DB_USER=root
DB_PASSWORD=<password_mysql_railway>
DB_DATABASE=railway
JWT_SECRET=jXokTNylyy2pyxqKJ4h7r9FaLaEtLj4KPOfN9WYs2Fu
```

## 🚀 Despliegue en Railway

### Opción 1: Desde GitHub (Recomendado)

1. Ve a [railway.app](https://railway.app)
2. Click en "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Autoriza Railway y selecciona tu repositorio
5. Railway detectará automáticamente Node.js
6. Configura las variables de entorno en Settings → Variables
7. El deploy se hará automáticamente

### Opción 2: Railway CLI

```bash
# Instalar Railway CLI (solo primera vez)
npm install -g @railway/cli

# Login
railway login

# Vincular proyecto existente o crear nuevo
railway link

# Agregar variables de entorno
railway variables set PORT=4000
railway variables set DB_HOST=<tu_host>
railway variables set DB_USER=root
railway variables set DB_PASSWORD=<tu_password>
railway variables set DB_DATABASE=railway
railway variables set JWT_SECRET=jXokTNylyy2pyxqKJ4h7r9FaLaEtLj4KPOfN9WYs2Fu

# Deploy
railway up
```

## 🔗 Conectar con MySQL de Railway

Railway genera automáticamente variables para MySQL. Puedes usar:
- `MYSQLHOST`
- `MYSQLPORT`
- `MYSQLUSER`
- `MYSQLPASSWORD`
- `MYSQLDATABASE`

O usa la variable `DATABASE_URL` directamente.

## ✅ Checklist antes del deploy

- [x] `.gitignore` configurado
- [x] `.env` no está en el repositorio
- [x] `package.json` tiene script `start`
- [x] Servidor escucha en `0.0.0.0`
- [x] Puerto configurable por variable de entorno
- [ ] Variables de entorno configuradas en Railway
- [ ] Base de datos importada en Railway

## 🔧 Troubleshooting

Si hay errores de conexión:
- Verifica que las variables de entorno estén correctas
- Asegúrate de que MySQL esté en el mismo proyecto de Railway
- Railway puede tardar 1-2 minutos en el primer deploy
