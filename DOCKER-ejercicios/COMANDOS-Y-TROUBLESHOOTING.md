# 🛠️ Guía de Comandos Docker y Troubleshooting

## 📋 Comandos Básicos de Docker Compose

### Iniciar Servicios
```bash
# Iniciar todos los servicios en background
docker-compose up -d

# Iniciar servicios específicos
docker-compose up -d frontend backend

# Iniciar con logs en consola
docker-compose up

# Reconstruir imágenes antes de iniciar
docker-compose up -d --build

# Forzar recreación de contenedores
docker-compose up -d --force-recreate
```

### Detener Servicios
```bash
# Detener servicios
docker-compose stop

# Detener y eliminar contenedores
docker-compose down

# Detener, eliminar contenedores Y volúmenes
docker-compose down -v

# Detener, eliminar contenedores, volúmenes E imágenes
docker-compose down -v --rmi all
```

### Ver Estado
```bash
# Ver servicios en ejecución
docker-compose ps

# Ver logs de todos los servicios
docker-compose logs

# Ver logs de un servicio específico
docker-compose logs backend

# Seguir logs en tiempo real
docker-compose logs -f

# Ver últimas 100 líneas
docker-compose logs --tail=100

# Ver logs con timestamps
docker-compose logs -t
```

### Escalar Servicios
```bash
# Escalar un servicio a 3 réplicas
docker-compose up -d --scale backend=3

# Escalar múltiples servicios
docker-compose up -d --scale backend=3 --scale frontend=2
```

### Ejecutar Comandos en Contenedores
```bash
# Abrir shell en contenedor
docker-compose exec backend sh

# Ejecutar comando específico
docker-compose exec backend node --version

# Ejecutar como root
docker-compose exec -u root backend sh

# Ejecutar en contenedor que no está corriendo
docker-compose run backend sh
```

### Gestión de Volúmenes
```bash
# Listar volúmenes
docker volume ls

# Inspeccionar volumen
docker volume inspect ejemplo-1-web-basica_mysql-data

# Eliminar volumen
docker volume rm ejemplo-1-web-basica_mysql-data

# Eliminar volúmenes no usados
docker volume prune

# Backup de volumen
docker run --rm -v ejemplo-1-web-basica_mysql-data:/data -v $(pwd):/backup alpine tar czf /backup/mysql-backup.tar.gz /data
```

### Gestión de Redes
```bash
# Listar redes
docker network ls

# Inspeccionar red
docker network inspect ejemplo-1-web-basica_app-network

# Eliminar red
docker network rm ejemplo-1-web-basica_app-network

# Eliminar redes no usadas
docker network prune
```

## 🔍 Debugging y Troubleshooting

### Problema: Contenedor no inicia

```bash
# Ver logs del contenedor
docker-compose logs backend

# Ver eventos de Docker
docker events

# Inspeccionar contenedor
docker inspect web-backend

# Ver procesos en el contenedor
docker-compose top backend

# Ver uso de recursos
docker stats
```

### Problema: No hay conexión entre contenedores

```bash
# Verificar que están en la misma red
docker network inspect app-network

# Probar conectividad desde un contenedor
docker-compose exec backend ping database

# Verificar DNS interno
docker-compose exec backend nslookup database

# Ver variables de entorno
docker-compose exec backend env
```

### Problema: Base de datos no acepta conexiones

```bash
# Verificar que el contenedor está corriendo
docker-compose ps database

# Ver logs de la base de datos
docker-compose logs database

# Verificar health check
docker inspect web-database | grep -A 10 Health

# Conectarse a MySQL directamente
docker-compose exec database mysql -u root -p

# Ver procesos de MySQL
docker-compose exec database ps aux | grep mysql
```

### Problema: Puertos ya en uso

```bash
# Ver qué está usando el puerto
# Windows
netstat -ano | findstr :80

# Linux/Mac
lsof -i :80

# Cambiar puerto en docker-compose.yml
ports:
  - "8080:80"  # Usar 8080 en lugar de 80
```

### Problema: Volúmenes con datos corruptos

```bash
# Detener servicios
docker-compose down

# Eliminar volumen
docker volume rm ejemplo-1-web-basica_mysql-data

# Reiniciar (se creará volumen nuevo)
docker-compose up -d
```

### Problema: Imágenes ocupan mucho espacio

```bash
# Ver uso de espacio
docker system df

# Limpiar todo lo no usado
docker system prune -a

# Limpiar solo imágenes
docker image prune -a

# Limpiar solo contenedores detenidos
docker container prune

# Limpiar todo (CUIDADO: elimina TODO)
docker system prune -a --volumes
```

## 🔐 Seguridad

### Escanear Vulnerabilidades
```bash
# Escanear imagen
docker scan node:18-alpine

# Escanear imagen local
docker scan web-backend:latest
```

### Verificar Usuario
```bash
# Ver con qué usuario corre el proceso
docker-compose exec backend whoami

# Ver procesos y usuarios
docker-compose exec backend ps aux
```

### Verificar Permisos de Archivos
```bash
# Ver permisos
docker-compose exec backend ls -la /app

# Cambiar permisos si es necesario
docker-compose exec -u root backend chown -R nodejs:nodejs /app
```

## 📊 Monitoreo

### Ver Uso de Recursos en Tiempo Real
```bash
# Todos los contenedores
docker stats

# Contenedor específico
docker stats web-backend

# Formato personalizado
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

### Inspeccionar Configuración
```bash
# Ver configuración completa
docker-compose config

# Validar archivo docker-compose.yml
docker-compose config --quiet

# Ver variables resueltas
docker-compose config --resolve-image-digests
```

## 🗄️ Base de Datos

### MySQL
```bash
# Conectarse a MySQL
docker-compose exec database mysql -u appuser -p appdb

# Ejecutar query desde línea de comandos
docker-compose exec database mysql -u appuser -papppassword -e "SELECT * FROM users;"

# Importar SQL
docker-compose exec -T database mysql -u appuser -papppassword appdb < backup.sql

# Exportar SQL
docker-compose exec database mysqldump -u appuser -papppassword appdb > backup.sql

# Ver bases de datos
docker-compose exec database mysql -u root -prootpassword -e "SHOW DATABASES;"
```

### MongoDB
```bash
# Conectarse a MongoDB
docker-compose exec mongodb mongosh

# Ejecutar comando
docker-compose exec mongodb mongosh --eval "db.products.find()"

# Backup
docker-compose exec mongodb mongodump --out=/backup

# Restore
docker-compose exec mongodb mongorestore /backup
```

### Redis
```bash
# Conectarse a Redis CLI
docker-compose exec redis redis-cli

# Ver todas las keys
docker-compose exec redis redis-cli KEYS '*'

# Ver valor de una key
docker-compose exec redis redis-cli GET users:all

# Limpiar caché
docker-compose exec redis redis-cli FLUSHALL
```

## 🔄 CI/CD

### Build y Push
```bash
# Build con tag
docker build -t myapp:v1.0 .

# Tag para registry
docker tag myapp:v1.0 registry.example.com/myapp:v1.0

# Push a registry
docker push registry.example.com/myapp:v1.0

# Pull desde registry
docker pull registry.example.com/myapp:v1.0
```

### Variables de Entorno
```bash
# Usar archivo .env
docker-compose --env-file .env.production up -d

# Pasar variables directamente
DB_PASSWORD=secret docker-compose up -d

# Ver variables de entorno de un servicio
docker-compose config | grep -A 10 environment
```

## 📦 Backup y Restore

### Backup Completo
```bash
#!/bin/bash
# backup.sh

# Crear directorio de backup
mkdir -p backups/$(date +%Y%m%d)

# Backup de MySQL
docker-compose exec -T database mysqldump -u appuser -papppassword appdb > backups/$(date +%Y%m%d)/mysql.sql

# Backup de volúmenes
docker run --rm -v ejemplo-1-web-basica_mysql-data:/data -v $(pwd)/backups/$(date +%Y%m%d):/backup alpine tar czf /backup/mysql-data.tar.gz /data

# Backup de configuración
cp docker-compose.yml backups/$(date +%Y%m%d)/
cp .env backups/$(date +%Y%m%d)/

echo "Backup completado en backups/$(date +%Y%m%d)"
```

### Restore
```bash
#!/bin/bash
# restore.sh

BACKUP_DATE=$1

# Detener servicios
docker-compose down

# Restore volumen
docker run --rm -v ejemplo-1-web-basica_mysql-data:/data -v $(pwd)/backups/$BACKUP_DATE:/backup alpine tar xzf /backup/mysql-data.tar.gz -C /

# Iniciar servicios
docker-compose up -d

# Esperar a que MySQL esté listo
sleep 10

# Restore SQL
docker-compose exec -T database mysql -u appuser -papppassword appdb < backups/$BACKUP_DATE/mysql.sql

echo "Restore completado desde backups/$BACKUP_DATE"
```

## 🧪 Testing

### Health Checks
```bash
# Verificar health de todos los servicios
docker-compose ps

# Ver detalles de health check
docker inspect --format='{{json .State.Health}}' web-backend | jq

# Ejecutar health check manualmente
docker-compose exec backend wget --quiet --tries=1 --spider http://localhost:3000/health
```

### Performance Testing
```bash
# Instalar Apache Bench
# Windows: descargar desde Apache
# Linux: apt-get install apache2-utils

# Test de carga
ab -n 1000 -c 10 http://localhost/api/users

# Con autenticación
ab -n 1000 -c 10 -H "Authorization: Bearer TOKEN" http://localhost/api/users
```

## 🎯 Comandos Útiles por Escenario

### Desarrollo Diario
```bash
# Iniciar proyecto
docker-compose up -d

# Ver logs mientras desarrollas
docker-compose logs -f backend

# Reiniciar servicio después de cambios
docker-compose restart backend

# Rebuild después de cambios en Dockerfile
docker-compose up -d --build backend
```

### Debugging
```bash
# Entrar al contenedor
docker-compose exec backend sh

# Ver variables de entorno
docker-compose exec backend env

# Ver archivos
docker-compose exec backend ls -la /app

# Ver procesos
docker-compose exec backend ps aux
```

### Limpieza
```bash
# Limpieza rápida (mantiene volúmenes)
docker-compose down

# Limpieza completa del proyecto
docker-compose down -v --rmi local

# Limpieza global de Docker
docker system prune -a --volumes
```

## 📱 Comandos PowerShell (Windows)

```powershell
# Ver contenedores
docker ps

# Detener todos los contenedores
docker ps -q | ForEach-Object { docker stop $_ }

# Eliminar todos los contenedores
docker ps -aq | ForEach-Object { docker rm $_ }

# Eliminar todas las imágenes
docker images -q | ForEach-Object { docker rmi $_ }

# Ver uso de espacio
docker system df
```

## 🚨 Comandos de Emergencia

```bash
# Detener TODO
docker stop $(docker ps -aq)

# Eliminar TODO (CUIDADO!)
docker system prune -a --volumes -f

# Reiniciar Docker daemon
# Windows: Restart-Service docker
# Linux: sudo systemctl restart docker
# Mac: Restart Docker Desktop

# Ver logs del daemon
# Windows: Get-EventLog -LogName Application -Source Docker
# Linux: journalctl -u docker
```

## 📚 Recursos Adicionales

- [Docker CLI Reference](https://docs.docker.com/engine/reference/commandline/cli/)
- [Docker Compose CLI Reference](https://docs.docker.com/compose/reference/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/dev-best-practices/)
