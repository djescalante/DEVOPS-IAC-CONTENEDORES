# 🚀 Guía de Inicio Rápido

## ⚡ Empezar en 5 Minutos

### Opción 1: Aplicación Web Básica (Recomendado para principiantes)

```bash
# 1. Navegar al directorio
cd e:\DOCKER\ejemplo-1-web-basica

# 2. Iniciar todos los servicios
docker-compose up -d

# 3. Esperar 30 segundos para que MySQL se inicialice

# 4. Abrir en el navegador
# http://localhost
```

**¡Listo!** Deberías ver una aplicación web funcional con:
- ✅ Frontend moderno con gradientes
- ✅ Lista de usuarios desde MySQL
- ✅ Formulario para agregar usuarios
- ✅ Estadísticas en tiempo real

### Verificar que Todo Funciona

```bash
# Ver estado de los servicios
docker-compose ps

# Deberías ver algo como:
# NAME            STATUS         PORTS
# web-frontend    Up             0.0.0.0:80->80/tcp
# web-backend     Up (healthy)   0.0.0.0:3000->3000/tcp
# web-database    Up (healthy)   0.0.0.0:3306->3306/tcp

# Ver logs
docker-compose logs -f
```

### Detener los Servicios

```bash
# Detener sin eliminar datos
docker-compose stop

# Detener y eliminar contenedores (mantiene datos)
docker-compose down

# Detener y eliminar TODO (incluye datos)
docker-compose down -v
```

---

## 🎯 Próximos Pasos

### 1. Explorar el Código

```bash
# Abrir el proyecto en VS Code
code .

# Archivos importantes:
# - docker-compose.yml: Configuración de servicios
# - backend/server.js: API REST
# - frontend/index.html: Interfaz de usuario
# - database/init.sql: Esquema de base de datos
```

### 2. Modificar y Ver Cambios

**Frontend** (cambios inmediatos):
```bash
# Edita: frontend/index.html, styles.css, o app.js
# Recarga el navegador para ver cambios
```

**Backend** (requiere reinicio):
```bash
# Edita: backend/server.js
# Reinicia el servicio:
docker-compose restart backend
```

**Base de Datos** (requiere recreación):
```bash
# Edita: database/init.sql
# Recrea la base de datos:
docker-compose down -v
docker-compose up -d
```

### 3. Probar la API Directamente

```bash
# GET - Obtener usuarios
curl http://localhost:3000/api/users

# POST - Crear usuario
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}'

# GET - Estadísticas
curl http://localhost:3000/api/stats

# GET - Health check
curl http://localhost:3000/health
```

### 4. Acceder a la Base de Datos

```bash
# Opción 1: Desde línea de comandos
docker-compose exec database mysql -u appuser -psecurepassword appdb

# Opción 2: Usar herramienta GUI
# Host: localhost
# Port: 3306
# User: appuser
# Password: securepassword
# Database: appdb
```

---

## 📊 Ejemplo 2: Microservicios (Avanzado)

```bash
# 1. Navegar al directorio
cd e:\DOCKER\ejemplo-2-microservicios

# 2. Iniciar servicios
docker-compose up -d

# 3. Ver logs
docker-compose logs -f api-gateway

# 4. Acceder
# API Gateway: http://localhost:4000
```

**Nota**: Este ejemplo requiere más recursos y tiempo de inicio.

---

## 🔧 Ejemplo 3: Desarrollo vs Producción

### Modo Desarrollo
```bash
cd e:\DOCKER\ejemplo-3-dev-vs-prod

# Iniciar en modo desarrollo
docker-compose -f docker-compose.dev.yml up

# Características:
# - Hot reload
# - Puertos expuestos
# - Adminer en http://localhost:8080
```

### Modo Producción
```bash
# Crear archivo .env
cp .env.example .env

# Editar .env con contraseñas seguras
notepad .env

# Iniciar en modo producción
docker-compose -f docker-compose.prod.yml up -d

# Características:
# - SSL/TLS
# - Redes internas
# - Backups automatizados
```

---

## 🐛 Solución de Problemas Comunes

### Problema: "Port is already allocated"

```bash
# Ver qué está usando el puerto
netstat -ano | findstr :80

# Solución 1: Detener el proceso
# Solución 2: Cambiar puerto en docker-compose.yml
ports:
  - "8080:80"  # Usar 8080 en lugar de 80
```

### Problema: "Cannot connect to database"

```bash
# Verificar que MySQL está listo
docker-compose logs database

# Esperar a ver: "ready for connections"

# Si tarda mucho, reiniciar:
docker-compose restart database
```

### Problema: "No such file or directory"

```bash
# Asegurarse de estar en el directorio correcto
cd e:\DOCKER\ejemplo-1-web-basica

# Verificar que existe docker-compose.yml
dir docker-compose.yml
```

### Problema: Página en blanco o error 502

```bash
# Ver logs de todos los servicios
docker-compose logs

# Verificar health checks
docker-compose ps

# Reiniciar servicios
docker-compose restart
```

---

## 📚 Recursos de Aprendizaje

### Archivos de Documentación

1. **README.md** - Índice general y comparación
2. **BUENAS-PRACTICAS.md** - Guía de buenas prácticas
3. **DIAGRAMAS-VISUALES.md** - Diagramas detallados
4. **DIAGRAMAS-FLUJO.md** - Flujos de datos
5. **COMANDOS-Y-TROUBLESHOOTING.md** - Comandos útiles

### Orden Recomendado de Estudio

1. ✅ **Ejemplo 1** - Entender conceptos básicos
2. ✅ **BUENAS-PRACTICAS.md** - Aprender patrones
3. ✅ **DIAGRAMAS-VISUALES.md** - Visualizar arquitecturas
4. ✅ **Ejemplo 3** - Entender entornos
5. ✅ **Ejemplo 2** - Microservicios avanzados

---

## 🎯 Checklist de Verificación

Antes de empezar, asegúrate de tener:

- [ ] Docker Desktop instalado y corriendo
- [ ] Docker Compose instalado (incluido en Docker Desktop)
- [ ] Al menos 4GB de RAM disponible
- [ ] Puertos 80, 3000, 3306 disponibles
- [ ] Conexión a internet (para descargar imágenes)

### Verificar Instalación

```bash
# Verificar Docker
docker --version
# Debería mostrar: Docker version 20.10.x o superior

# Verificar Docker Compose
docker-compose --version
# Debería mostrar: Docker Compose version 2.x.x o superior

# Verificar que Docker está corriendo
docker ps
# No debería dar error
```

---

## 💡 Tips Útiles

### Desarrollo Diario

```bash
# Alias útiles (agregar a tu perfil de PowerShell)
function dcu { docker-compose up -d }
function dcd { docker-compose down }
function dcl { docker-compose logs -f $args }
function dcp { docker-compose ps }
function dcr { docker-compose restart $args }
```

### Limpieza Periódica

```bash
# Limpiar recursos no usados (hacer semanalmente)
docker system prune -a

# Ver espacio usado
docker system df
```

### Backup Rápido

```bash
# Backup de datos de MySQL
docker-compose exec database mysqldump -u appuser -psecurepassword appdb > backup.sql

# Restore
docker-compose exec -T database mysql -u appuser -psecurepassword appdb < backup.sql
```

---

## 🎉 ¡Felicidades!

Si llegaste hasta aquí y tienes la aplicación corriendo, has logrado:

✅ Configurar una arquitectura de 3 capas con Docker  
✅ Separar frontend, backend y base de datos  
✅ Usar redes Docker para comunicación  
✅ Implementar persistencia con volúmenes  
✅ Configurar health checks  
✅ Crear una aplicación web funcional  

---

## 📞 Siguientes Pasos Sugeridos

1. **Personalizar la Aplicación**
   - Cambiar colores y estilos
   - Agregar nuevos endpoints
   - Crear nuevas tablas

2. **Experimentar con Configuración**
   - Cambiar versiones de imágenes
   - Agregar nuevos servicios
   - Modificar límites de recursos

3. **Aprender Patrones Avanzados**
   - Estudiar el Ejemplo 2 (Microservicios)
   - Implementar autenticación
   - Agregar caché con Redis

4. **Preparar para Producción**
   - Estudiar el Ejemplo 3
   - Configurar SSL/TLS
   - Implementar backups

---

**¡Disfruta construyendo con Docker! 🐳**
