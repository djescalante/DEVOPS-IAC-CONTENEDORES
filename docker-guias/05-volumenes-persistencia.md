# 💾 Volúmenes y Persistencia de Datos

> 🗄️ **Gestión de datos persistentes en Docker**

---

## 📋 Tabla de Contenidos
- [Conceptos Básicos](#conceptos-básicos)
- [Tipos de Almacenamiento](#tipos-de-almacenamiento)
- [Volúmenes](#volúmenes)
- [Bind Mounts](#bind-mounts)
- [tmpfs Mounts](#tmpfs-mounts)
- [Casos de Uso](#casos-de-uso)
- [Backup y Restauración](#backup-y-restauración)
- [Mejores Prácticas](#mejores-prácticas)

---

## 🎓 Conceptos Básicos

### ¿Por qué necesitamos persistencia?

Los contenedores son **efímeros** por naturaleza. Cuando se eliminan, se pierden todos los datos.

```
SIN VOLÚMENES:
┌──────────────────┐
│   Contenedor     │
│  ┌────────────┐  │
│  │   Datos    │  │ ──▶ docker rm ──▶ ❌ Datos perdidos
│  └────────────┘  │
└──────────────────┘

CON VOLÚMENES:
┌──────────────────┐     ┌─────────────┐
│   Contenedor     │     │   Volumen   │
│  ┌────────────┐  │────▶│  ┌───────┐  │
│  │   Datos    │  │     │  │ Datos │  │ ──▶ ✅ Datos persisten
│  └────────────┘  │     │  └───────┘  │
└──────────────────┘     └─────────────┘
```

### Ventajas de los volúmenes

- ✅ **Persistencia**: Los datos sobreviven al contenedor
- ✅ **Compartir**: Múltiples contenedores pueden usar el mismo volumen
- ✅ **Performance**: Mejor rendimiento que bind mounts en Windows/Mac
- ✅ **Backup**: Facilita copias de seguridad
- ✅ **Migración**: Fácil mover datos entre hosts
- ✅ **Gestión**: Drivers de volumen para almacenamiento remoto

---

## 📦 Tipos de Almacenamiento

Docker ofrece tres formas de persistir datos:

### 1. Volúmenes (Recomendado)

```
Host:     /var/lib/docker/volumes/mi-volumen/_data
            ▲
            │
Contenedor: /app/data
```

**Características:**
- Gestionados completamente por Docker
- Aislados del filesystem del host
- Funcionan en Linux, Windows y Mac
- Pueden usar drivers remotos

### 2. Bind Mounts

```
Host:       /home/usuario/proyecto
            ▲
            │
Contenedor: /app
```

**Características:**
- Mapeo directo de carpetas del host
- Ruta absoluta requerida
- El host tiene control total
- Útil para desarrollo

### 3. tmpfs Mounts

```
RAM (en memoria)
      ▲
      │
Contenedor: /tmp
```

**Características:**
- Solo en Linux
- Datos en memoria RAM
- No persisten al reiniciar
- Alta velocidad

### Comparación visual

```
┌─────────────────────────────────────────────────────────┐
│                     Docker Host                         │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │         /var/lib/docker/volumes/                │   │
│  │  ┌──────────────┐  ┌──────────────┐            │   │
│  │  │  mi-volumen  │  │  db-data     │            │   │
│  │  └──────┬───────┘  └──────┬───────┘            │   │
│  └─────────┼──────────────────┼────────────────────┘   │
│            │                  │                         │
│            │  ┌──────────────┐│                         │
│            │  │ /home/user/  ││ ◄── Bind Mount          │
│            │  └──────┬───────┘│                         │
│            │         │        │                         │
│  ┌─────────▼─────────▼────────▼─────────────────┐      │
│  │          Contenedor (MySQL)                   │      │
│  │  /var/lib/mysql/  ←──── Volumen              │      │
│  │  /app/            ←──── Bind Mount           │      │
│  │  /tmp/            ←──── tmpfs (RAM)          │      │
│  └───────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄️ Volúmenes

### Crear volúmenes

```bash
# Crear volumen simple
docker volume create mi-volumen

# Crear con driver específico
docker volume create --driver local mi-volumen

# Crear con opciones
docker volume create \
  --driver local \
  --opt type=nfs \
  --opt o=addr=192.168.1.1,rw \
  --opt device=:/path/to/dir \
  nfs-volume

# Crear con labels
docker volume create --label env=prod --label app=db mi-volumen
```

### Listar volúmenes

```bash
# Listar todos
docker volume ls

# Con filtros
docker volume ls --filter dangling=true
docker volume ls --filter driver=local
docker volume ls --filter label=env=prod

# Formato personalizado
docker volume ls --format "table {{.Name}}\t{{.Driver}}\t{{.Scope}}"
```

### Inspeccionar volúmenes

```bash
# Ver detalles
docker volume inspect mi-volumen

# Ver ubicación en el host
docker volume inspect mi-volumen --format '{{.Mountpoint}}'

# Ver opciones
docker volume inspect mi-volumen --format '{{.Options}}'
```

**Salida ejemplo:**
```json
[
    {
        "CreatedAt": "2024-11-15T10:30:00Z",
        "Driver": "local",
        "Labels": {},
        "Mountpoint": "/var/lib/docker/volumes/mi-volumen/_data",
        "Name": "mi-volumen",
        "Options": {},
        "Scope": "local"
    }
]
```

### Usar volúmenes

```bash
# Montar volumen al ejecutar
docker run -v mi-volumen:/app/data nginx

# Volumen anónimo (Docker crea nombre automático)
docker run -v /app/data nginx

# Múltiples volúmenes
docker run -v vol1:/data1 -v vol2:/data2 nginx

# Solo lectura
docker run -v mi-volumen:/data:ro nginx

# Con z/Z para SELinux
docker run -v mi-volumen:/data:z nginx

# Sintaxis larga (más clara)
docker run --mount source=mi-volumen,target=/data nginx
docker run --mount source=mi-volumen,target=/data,readonly nginx
```

### Eliminar volúmenes

```bash
# Eliminar volumen específico
docker volume rm mi-volumen

# Eliminar múltiples
docker volume rm vol1 vol2 vol3

# Eliminar volúmenes no utilizados
docker volume prune

# Sin confirmación
docker volume prune -f

# Con filtro
docker volume prune --filter label=temp=true
```

### Compartir volumen entre contenedores

```bash
# Contenedor 1: Crea y escribe
docker run -d --name app1 -v shared-vol:/data alpine \
  sh -c 'echo "Hola desde app1" > /data/mensaje.txt && sleep 3600'

# Contenedor 2: Lee del mismo volumen
docker run --rm -v shared-vol:/data alpine cat /data/mensaje.txt

# Salida: Hola desde app1
```

---

## 📁 Bind Mounts

### Sintaxis básica

```bash
# Con -v (sintaxis corta)
docker run -v /ruta/host:/ruta/contenedor imagen

# Con --mount (sintaxis larga, recomendada)
docker run --mount type=bind,source=/ruta/host,target=/ruta/contenedor imagen
```

### Ejemplos prácticos

```bash
# Desarrollo web - montar código fuente
docker run -d \
  --name dev-web \
  -p 8080:80 \
  -v $(pwd)/src:/usr/share/nginx/html \
  nginx

# Configuración personalizada
docker run -d \
  --name custom-nginx \
  -v /home/user/nginx.conf:/etc/nginx/nginx.conf:ro \
  nginx

# Logs externos
docker run -d \
  --name app \
  -v /var/log/app:/app/logs \
  mi-app

# Base de datos con datos en host
docker run -d \
  --name mysql \
  -v /data/mysql:/var/lib/mysql \
  -e MYSQL_ROOT_PASSWORD=secret \
  mysql:8.0
```

### Solo lectura

```bash
# Montar código fuente como solo lectura
docker run -v $(pwd):/app:ro node-app

# Con --mount
docker run --mount type=bind,source=$(pwd),target=/app,readonly node-app
```

### Permisos y propietario

```bash
# El contenedor escribe con el UID del proceso interno
# Crear directorio con permisos apropiados
mkdir -p /data/app
chown 1000:1000 /data/app

docker run -v /data/app:/app mi-app

# O ejecutar contenedor con usuario específico
docker run -u 1000:1000 -v /data/app:/app mi-app
```

### Casos de uso comunes

#### 1. Desarrollo local

```bash
# Hot reload - cambios reflejados inmediatamente
docker run -d \
  --name dev-api \
  -p 3000:3000 \
  -v $(pwd):/app \
  -v /app/node_modules \
  -e NODE_ENV=development \
  node:18 \
  npm run dev
```

#### 2. Configuración externa

```bash
# Archivo de configuración
docker run -d \
  --name app \
  -v $(pwd)/config.yaml:/app/config.yaml:ro \
  mi-app

# Directorio de configuraciones
docker run -d \
  --name nginx \
  -v $(pwd)/conf.d:/etc/nginx/conf.d:ro \
  nginx
```

#### 3. Logs centralizados

```bash
# Logs escritos en el host
docker run -d \
  --name api \
  -v /var/log/apps/api:/app/logs \
  mi-api
```

---

## 💨 tmpfs Mounts

### ¿Cuándo usar tmpfs?

- 🔒 Datos sensibles temporales (no persisten en disco)
- ⚡ Alto rendimiento (RAM es más rápida)
- 🗑️ Datos que no necesitan persistir

### Crear tmpfs mount

```bash
# Con --tmpfs
docker run -d --tmpfs /tmp nginx

# Con --mount (más opciones)
docker run -d \
  --mount type=tmpfs,destination=/tmp,tmpfs-size=100m,tmpfs-mode=1777 \
  nginx

# Múltiples tmpfs
docker run -d \
  --tmpfs /tmp:rw,size=100m,mode=1777 \
  --tmpfs /cache:size=50m \
  mi-app
```

### Opciones de tmpfs

```bash
# Tamaño máximo
docker run --mount type=tmpfs,destination=/tmp,tmpfs-size=100m nginx

# Permisos
docker run --mount type=tmpfs,destination=/tmp,tmpfs-mode=1777 nginx

# Sin exec (seguridad)
docker run --mount type=tmpfs,destination=/tmp,tmpfs-mode=1777,tmpfs-noexec nginx
```

### Ejemplo: Caché temporal

```bash
docker run -d \
  --name redis-cache \
  --tmpfs /data:size=500m \
  redis redis-server --save ""
```

---

## 💼 Casos de Uso

### 1. Base de datos MySQL

```bash
# Crear volumen
docker volume create mysql-data

# Ejecutar MySQL
docker run -d \
  --name mysql-db \
  -e MYSQL_ROOT_PASSWORD=secreto \
  -e MYSQL_DATABASE=miapp \
  -v mysql-data:/var/lib/mysql \
  -p 3306:3306 \
  mysql:8.0

# Los datos persisten aunque eliminemos el contenedor
docker rm -f mysql-db
docker run -d --name mysql-db -v mysql-data:/var/lib/mysql mysql:8.0
# ✅ Datos siguen ahí
```

### 2. PostgreSQL

```bash
docker volume create postgres-data

docker run -d \
  --name postgres-db \
  -e POSTGRES_PASSWORD=secreto \
  -e POSTGRES_DB=miapp \
  -v postgres-data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:15
```

### 3. MongoDB

```bash
docker volume create mongodb-data

docker run -d \
  --name mongodb \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=secreto \
  -v mongodb-data:/data/db \
  -p 27017:27017 \
  mongo:7
```

### 4. Redis (persistente)

```bash
docker volume create redis-data

docker run -d \
  --name redis \
  -v redis-data:/data \
  -p 6379:6379 \
  redis redis-server --appendonly yes
```

### 5. Aplicación Node.js (desarrollo)

```bash
# package.json, src/ en el host
docker run -d \
  --name node-dev \
  -p 3000:3000 \
  -v $(pwd):/app \
  -v /app/node_modules \
  -w /app \
  node:18 \
  npm run dev
```

⚠️ **Importante:** `-v /app/node_modules` crea volumen anónimo para evitar conflictos con node_modules del host.

### 6. Nginx con contenido y configuración

```bash
# Volúmenes para datos y configuración
docker volume create web-content
docker volume create nginx-config

docker run -d \
  --name web-server \
  -p 80:80 \
  -v web-content:/usr/share/nginx/html \
  -v nginx-config:/etc/nginx/conf.d:ro \
  nginx:alpine
```

### 7. Jenkins (CI/CD)

```bash
docker volume create jenkins-data

docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins-data:/var/jenkins_home \
  jenkins/jenkins:lts
```

### 8. WordPress completo

```bash
# Crear red
docker network create wp-network

# Volúmenes
docker volume create wp-db-data
docker volume create wp-content

# MySQL
docker run -d \
  --name wp-mysql \
  --network wp-network \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=wordpress \
  -e MYSQL_USER=wpuser \
  -e MYSQL_PASSWORD=wppass \
  -v wp-db-data:/var/lib/mysql \
  mysql:8.0

# WordPress
docker run -d \
  --name wordpress \
  --network wp-network \
  -p 8080:80 \
  -e WORDPRESS_DB_HOST=wp-mysql \
  -e WORDPRESS_DB_USER=wpuser \
  -e WORDPRESS_DB_PASSWORD=wppass \
  -e WORDPRESS_DB_NAME=wordpress \
  -v wp-content:/var/www/html/wp-content \
  wordpress:latest
```

---

## 💾 Backup y Restauración

### Backup de volúmenes

#### Método 1: Con contenedor temporal

```bash
# Backup de volumen a tar
docker run --rm \
  -v mi-volumen:/data \
  -v $(pwd):/backup \
  alpine \
  tar czf /backup/mi-volumen-backup.tar.gz -C /data .

# Restaurar desde backup
docker run --rm \
  -v mi-volumen:/data \
  -v $(pwd):/backup \
  alpine \
  tar xzf /backup/mi-volumen-backup.tar.gz -C /data
```

#### Método 2: Con contenedor en ejecución

```bash
# Backup de contenedor en ejecución
docker run --rm \
  --volumes-from mi-contenedor \
  -v $(pwd):/backup \
  alpine \
  tar czf /backup/contenedor-backup.tar.gz /data

# Restaurar
docker run --rm \
  --volumes-from nuevo-contenedor \
  -v $(pwd):/backup \
  alpine \
  tar xzf /backup/contenedor-backup.tar.gz
```

### Script de backup automatizado

```bash
#!/bin/bash
# backup-volumes.sh

BACKUP_DIR="/backups/docker-volumes"
DATE=$(date +%Y%m%d-%H%M%S)

mkdir -p $BACKUP_DIR

# Listar todos los volúmenes
for volume in $(docker volume ls -q); do
    echo "Backing up volume: $volume"
    
    docker run --rm \
        -v $volume:/data:ro \
        -v $BACKUP_DIR:/backup \
        alpine \
        tar czf /backup/${volume}-${DATE}.tar.gz -C /data .
    
    echo "✅ $volume backed up"
done

# Limpiar backups antiguos (más de 7 días)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "🎉 Backup completado!"
```

### Migrar volumen entre hosts

```bash
# En servidor origen
docker run --rm \
  -v mi-volumen:/data:ro \
  alpine tar cz -C /data . | \
  ssh usuario@servidor-destino \
  'docker run --rm -i -v mi-volumen:/data alpine tar xz -C /data'
```

### Backup de base de datos

#### MySQL

```bash
# Backup
docker exec mysql-db \
  mysqldump -u root -p$MYSQL_ROOT_PASSWORD miapp \
  > backup-$(date +%Y%m%d).sql

# Restaurar
docker exec -i mysql-db \
  mysql -u root -p$MYSQL_ROOT_PASSWORD miapp \
  < backup-20241115.sql
```

#### PostgreSQL

```bash
# Backup
docker exec postgres-db \
  pg_dump -U postgres miapp \
  > backup-$(date +%Y%m%d).sql

# Restaurar
docker exec -i postgres-db \
  psql -U postgres miapp \
  < backup-20241115.sql
```

#### MongoDB

```bash
# Backup
docker exec mongodb \
  mongodump --out=/backup --db=miapp

docker cp mongodb:/backup ./mongodb-backup

# Restaurar
docker cp ./mongodb-backup mongodb:/restore
docker exec mongodb \
  mongorestore /restore
```

---

## ✅ Mejores Prácticas

### 1. Usar volúmenes nombrados

```bash
# ❌ Malo: volumen anónimo
docker run -v /data mysql

# ✅ Bueno: volumen nombrado
docker volume create mysql-data
docker run -v mysql-data:/data mysql
```

### 2. Separar datos y configuración

```bash
# ✅ Datos en volumen
-v app-data:/var/lib/app

# ✅ Config en bind mount (versionado en git)
-v $(pwd)/config:/etc/app:ro
```

### 3. Documentar volúmenes

```yaml
# docker-compose.yml
volumes:
  mysql-data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /mnt/data/mysql
  
  # Documentar propósito
  app-uploads:
    # Archivos subidos por usuarios
    driver: local
```

### 4. Usar labels

```bash
docker volume create \
  --label env=production \
  --label app=api \
  --label backup=daily \
  api-data
```

### 5. Backups regulares

```bash
# Cron job diario
0 2 * * * /scripts/backup-volumes.sh
```

### 6. Monitorear espacio

```bash
# Ver uso de volúmenes
docker system df -v

# Alert si supera 80%
df -h /var/lib/docker/volumes
```

### 7. Permisos apropiados

```dockerfile
# En Dockerfile
RUN mkdir -p /app/data && chown app:app /app/data
USER app
```

### 8. No almacenar secretos en volúmenes

```bash
# ❌ Malo
-v $(pwd)/.env:/app/.env

# ✅ Bueno: usar secrets
docker secret create db_password password.txt
```

### 9. Usar .dockerignore

```
# .dockerignore
node_modules/
.git/
*.log
.env
```

### 10. Limpiar regularmente

```bash
# Eliminar volúmenes huérfanos cada semana
0 0 * * 0 docker volume prune -f
```

---

## 🔍 Troubleshooting

### Volumen no se crea

```bash
# Verificar driver
docker volume ls

# Crear manualmente
docker volume create --driver local mi-volumen

# Ver logs de Docker
journalctl -u docker
```

### Permisos incorrectos

```bash
# Ver propietario dentro del contenedor
docker exec mi-contenedor ls -la /data

# Cambiar permisos desde host (⚠️ cuidado)
sudo chown -R 1000:1000 /var/lib/docker/volumes/mi-volumen/_data

# O ejecutar contenedor con usuario correcto
docker run -u 1000:1000 -v mi-volumen:/data app
```

### Volumen lleno

```bash
# Ver uso
docker system df -v

# Encontrar qué usa más espacio
du -sh /var/lib/docker/volumes/*/

# Limpiar datos antiguos (dentro del contenedor)
docker exec mi-contenedor find /data -mtime +30 -delete
```

### No se puede eliminar volumen

```bash
# Ver qué contenedor lo está usando
docker ps -a --filter volume=mi-volumen

# Detener y eliminar contenedores
docker rm -f $(docker ps -aq --filter volume=mi-volumen)

# Ahora sí eliminar volumen
docker volume rm mi-volumen
```

---

## 📚 Referencia Rápida

```bash
# VOLÚMENES
docker volume create mi-vol              # Crear
docker volume ls                         # Listar
docker volume inspect mi-vol             # Inspeccionar
docker volume rm mi-vol                  # Eliminar
docker volume prune                      # Limpiar sin usar

# USAR VOLÚMENES
docker run -v mi-vol:/data imagen        # Volumen nombrado
docker run -v /data imagen               # Volumen anónimo
docker run -v $(pwd):/app imagen         # Bind mount
docker run --tmpfs /tmp imagen           # tmpfs

# PERMISOS
docker run -v vol:/data:ro imagen        # Solo lectura
docker run -v vol:/data:z imagen         # SELinux label

# BACKUP
docker run --rm -v vol:/data -v $(pwd):/backup alpine \
  tar czf /backup/backup.tar.gz -C /data .

# RESTAURAR
docker run --rm -v vol:/data -v $(pwd):/backup alpine \
  tar xzf /backup/backup.tar.gz -C /data

# COPIAR
docker cp contenedor:/data/file ./       # Del contenedor
docker cp file contenedor:/data/         # Al contenedor
```

---

## 📖 Recursos Adicionales

- 🔗 [Volumes Documentation](https://docs.docker.com/storage/volumes/)
- 🔗 [Bind Mounts](https://docs.docker.com/storage/bind-mounts/)
- 🔗 [Storage Drivers](https://docs.docker.com/storage/storagedriver/)
- 🔗 [Volume Plugins](https://docs.docker.com/engine/extend/plugins_volume/)

---

**💡 Recuerda:** Siempre haz backups regulares de tus volúmenes críticos y documenta su propósito.
