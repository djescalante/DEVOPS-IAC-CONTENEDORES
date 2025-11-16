# 🖼️ Gestión de Imágenes Docker

> 📦 **Manejo completo de imágenes Docker**

---

## 📋 Tabla de Contenidos
- [Conceptos Básicos](#conceptos-básicos)
- [Buscar y Descargar](#buscar-y-descargar)
- [Listar y Filtrar](#listar-y-filtrar)
- [Crear Imágenes](#crear-imágenes)
- [Etiquetar y Renombrar](#etiquetar-y-renombrar)
- [Exportar e Importar](#exportar-e-importar)
- [Compartir Imágenes](#compartir-imágenes)
- [Optimización](#optimización)
- [Limpieza](#limpieza)

---

## 🎓 Conceptos Básicos

### ¿Qué es una imagen Docker?

Una **imagen** es una plantilla de solo lectura que contiene:
- Sistema operativo base
- Aplicaciones y dependencias
- Configuración
- Archivos necesarios

```
┌─────────────────────────┐
│  Imagen (Read-Only)     │
│  ┌──────────────────┐   │
│  │   Aplicación     │   │
│  ├──────────────────┤   │
│  │   Dependencias   │   │
│  ├──────────────────┤   │
│  │   Sistema Base   │   │
│  └──────────────────┘   │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Contenedor (R/W)       │
│  ┌──────────────────┐   │
│  │   Capa R/W       │◄──── Cambios temporales
│  ├──────────────────┤   │
│  │   Imagen         │   │
│  └──────────────────┘   │
└─────────────────────────┘
```

### Capas de una imagen

```
┌─────────────────────┐
│  FROM ubuntu:20.04  │  ◄── Capa 1 (Base)
├─────────────────────┤
│  RUN apt update     │  ◄── Capa 2
├─────────────────────┤
│  COPY app.js /app/  │  ◄── Capa 3
├─────────────────────┤
│  RUN npm install    │  ◄── Capa 4
└─────────────────────┘
```

**Beneficios del sistema de capas:**
- ✅ Reutilización de capas compartidas
- ✅ Builds más rápidos (caché)
- ✅ Menor uso de espacio en disco
- ✅ Actualizaciones incrementales

---

## 🔍 Buscar y Descargar

### Buscar imágenes en Docker Hub

```bash
# Buscar por nombre
docker search nginx

# Buscar con filtros
docker search --filter stars=100 nginx
docker search --filter is-official=true mysql

# Limitar resultados
docker search --limit 5 python
```

**Salida ejemplo:**
```
NAME                 DESCRIPTION                STARS    OFFICIAL
nginx                Official build of Nginx    19000    [OK]
jwilder/nginx-proxy  Automated nginx proxy      2500
```

### Descargar imágenes

```bash
# Descargar última versión
docker pull nginx

# Descargar versión específica
docker pull nginx:1.25.3
docker pull mysql:8.0
docker pull python:3.11-alpine

# Descargar todas las etiquetas
docker pull --all-tags ubuntu

# Descargar con plataforma específica
docker pull --platform linux/amd64 nginx
docker pull --platform linux/arm64 nginx
```

### Ver progreso de descarga

```bash
docker pull redis
# Salida:
# latest: Pulling from library/redis
# 8a5e9fa4a8b5: Pull complete
# f2e9c1b4e6a7: Pull complete
# Status: Downloaded newer image for redis:latest
```

---

## 📝 Listar y Filtrar

### Listar imágenes

```bash
# Todas las imágenes
docker images

# Formato tabla detallado
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.ID}}"

# Solo IDs
docker images -q

# Sin truncar IDs
docker images --no-trunc
```

**Salida ejemplo:**
```
REPOSITORY    TAG       IMAGE ID       CREATED         SIZE
nginx         latest    605c77e624dd   2 weeks ago     141MB
mysql         8.0       3218b38490ce   3 weeks ago     516MB
python        3.11      0c5e6a8d7f91   1 month ago     920MB
```

### Filtrar imágenes

```bash
# Por nombre
docker images nginx
docker images "nginx:*"

# Imágenes huérfanas (dangling)
docker images --filter "dangling=true"

# Por etiqueta
docker images --filter "label=maintainer=admin"

# Antes de una fecha
docker images --filter "before=nginx:latest"

# Después de una imagen
docker images --filter "since=ubuntu:20.04"

# Imágenes de referencia
docker images --filter=reference='ubuntu:*'
```

### Formato personalizado

```bash
# Formato JSON
docker images --format json

# Formato personalizado
docker images --format "{{.Repository}}:{{.Tag}} - {{.Size}}"

# Tabla con columnas específicas
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
```

---

## 🔨 Crear Imágenes

### Método 1: Desde Dockerfile

```bash
# Build básico
docker build -t mi-app:1.0 .

# Build con nombre y tag
docker build -t usuario/mi-app:latest .

# Build sin caché
docker build --no-cache -t mi-app:1.0 .

# Build con Dockerfile específico
docker build -f Dockerfile.prod -t mi-app:prod .

# Build con argumentos
docker build --build-arg VERSION=1.0 -t mi-app:1.0 .

# Build multiplataforma
docker build --platform linux/amd64,linux/arm64 -t mi-app:multi .

# Build con progreso detallado
docker build --progress=plain -t mi-app:1.0 .
```

### Método 2: Desde contenedor (commit)

```bash
# Crear contenedor y hacer cambios
docker run -it --name temp-container ubuntu bash
# ... hacer cambios dentro del contenedor ...
exit

# Crear imagen desde el contenedor
docker commit temp-container mi-imagen-custom:1.0

# Con mensaje y autor
docker commit -m "Instalado nginx" -a "Tu Nombre" temp-container mi-nginx:1.0

# Cambiar CMD al hacer commit
docker commit --change='CMD ["nginx", "-g", "daemon off;"]' temp-container mi-nginx:1.0
```

⚠️ **Nota:** Se recomienda usar Dockerfile en lugar de commit para mejor trazabilidad.

### Método 3: Desde archivo tar

```bash
# Importar desde tar
docker import archivo.tar mi-imagen:1.0

# Desde URL
docker import http://ejemplo.com/imagen.tar mi-imagen:1.0

# Con cambios
docker import --change='CMD ["/bin/bash"]' archivo.tar mi-imagen:1.0
```

---

## 🏷️ Etiquetar y Renombrar

### Tags de imágenes

```bash
# Crear nuevo tag de una imagen existente
docker tag nginx:latest mi-nginx:v1.0

# Tag para repositorio remoto
docker tag mi-app:latest usuario/mi-app:latest
docker tag mi-app:latest gcr.io/proyecto/mi-app:v1.0

# Tag con hash de commit
docker tag mi-app:latest mi-app:abc123

# Múltiples tags
docker tag mi-app:latest mi-app:stable
docker tag mi-app:latest mi-app:production
docker tag mi-app:latest mi-app:1.0.0
```

### Convenciones de etiquetado

```bash
# Versionado semántico
imagen:1.0.0      # Versión específica
imagen:1.0        # Minor version
imagen:1          # Major version
imagen:latest     # Última versión

# Por ambiente
imagen:dev
imagen:staging
imagen:prod

# Por fecha
imagen:2024-11-15
imagen:20241115-abc123

# Por feature
imagen:feature-auth
imagen:fix-bug-123
```

---

## 💾 Exportar e Importar

### Guardar imagen en archivo

```bash
# Guardar una imagen
docker save nginx:latest -o nginx-backup.tar
docker save nginx:latest > nginx-backup.tar

# Guardar múltiples imágenes
docker save -o imagenes.tar nginx:latest mysql:8.0 redis:alpine

# Comprimir al guardar
docker save nginx:latest | gzip > nginx-backup.tar.gz
```

### Cargar imagen desde archivo

```bash
# Cargar imagen
docker load -i nginx-backup.tar
docker load < nginx-backup.tar

# Cargar desde comprimido
gunzip -c nginx-backup.tar.gz | docker load
```

### Exportar/Importar contenedor

```bash
# Exportar contenedor a tar (filesystem completo)
docker export mi-contenedor -o contenedor-backup.tar

# Importar como nueva imagen
docker import contenedor-backup.tar mi-imagen:from-export
```

**Diferencia entre save/load y export/import:**

| Comando | Qué guarda | Uso |
|---------|------------|-----|
| `save`/`load` | Imagen completa con capas y metadatos | Backup/restore de imágenes |
| `export`/`import` | Solo filesystem del contenedor | Crear imagen base desde contenedor |

---

## 📤 Compartir Imágenes

### Docker Hub

```bash
# Login en Docker Hub
docker login
# Ingresa: usuario y password/token

# Tag para Docker Hub
docker tag mi-app:latest usuario/mi-app:latest

# Push a Docker Hub
docker push usuario/mi-app:latest

# Push con múltiples tags
docker push usuario/mi-app:1.0
docker push usuario/mi-app:latest

# Logout
docker logout
```

### Registro privado

```bash
# Login en registro privado
docker login registry.ejemplo.com
docker login gcr.io

# Tag para registro privado
docker tag mi-app:latest registry.ejemplo.com/mi-app:latest

# Push a registro privado
docker push registry.ejemplo.com/mi-app:latest

# Pull desde registro privado
docker pull registry.ejemplo.com/mi-app:latest
```

### GitHub Container Registry

```bash
# Login con token
echo $GITHUB_TOKEN | docker login ghcr.io -u USUARIO --password-stdin

# Tag para GHCR
docker tag mi-app:latest ghcr.io/usuario/mi-app:latest

# Push
docker push ghcr.io/usuario/mi-app:latest
```

### AWS ECR

```bash
# Login en ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

# Tag
docker tag mi-app:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/mi-app:latest

# Push
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/mi-app:latest
```

---

## ⚡ Optimización

### Ver tamaño de imágenes

```bash
# Listar con tamaños
docker images

# Ordenar por tamaño
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | sort -k 3 -h

# Ver historial de capas
docker history nginx:latest

# Ver tamaño de cada capa
docker history --no-trunc --format "table {{.CreatedBy}}\t{{.Size}}" nginx:latest
```

### Analizar imagen

```bash
# Inspeccionar imagen
docker inspect nginx:latest

# Ver configuración
docker inspect --format='{{.Config.Cmd}}' nginx:latest

# Ver variables de entorno
docker inspect --format='{{.Config.Env}}' nginx:latest

# Ver capas
docker inspect --format='{{.RootFS.Layers}}' nginx:latest
```

### Herramientas de análisis

```bash
# Dive (analizar capas)
dive nginx:latest

# Docker Slim (reducir tamaño)
docker-slim build nginx:latest
```

### Tips para reducir tamaño

```dockerfile
# 1. Usar imágenes base Alpine
FROM python:3.11-alpine  # ~50MB vs python:3.11 ~900MB

# 2. Multi-stage builds
FROM node:18 AS builder
RUN npm run build
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# 3. Limpiar en la misma capa
RUN apt-get update && \
    apt-get install -y package && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 4. Usar .dockerignore
# .dockerignore:
node_modules
.git
*.md

# 5. No instalar dependencias de desarrollo
RUN npm ci --only=production
```

---

## 🧹 Limpieza

### Eliminar imágenes

```bash
# Eliminar imagen específica
docker rmi nginx:latest

# Eliminar por ID
docker rmi 605c77e624dd

# Forzar eliminación
docker rmi -f nginx:latest

# Eliminar múltiples imágenes
docker rmi nginx:latest mysql:8.0 redis:alpine

# Eliminar todas las imágenes de un repositorio
docker rmi $(docker images -q nginx)
```

### Limpiar imágenes sin usar

```bash
# Eliminar imágenes huérfanas (dangling)
docker image prune

# Eliminar todas las imágenes sin contenedor asociado
docker image prune -a

# Sin confirmación
docker image prune -a -f

# Ver espacio que se liberaría
docker image prune -a --filter "until=24h"
```

### Limpieza masiva

```bash
# Eliminar TODAS las imágenes
docker rmi $(docker images -q)

# Eliminar imágenes forzadamente
docker rmi -f $(docker images -q)

# Eliminar imágenes sin tag
docker rmi $(docker images -f "dangling=true" -q)

# Eliminar imágenes antiguas (más de 30 días)
docker image prune -a --filter "until=720h"
```

---

## 📊 Comandos de Información

### Información del sistema

```bash
# Espacio usado por Docker
docker system df

# Detallado
docker system df -v

# Información de una imagen
docker inspect nginx:latest
```

**Salida de `docker system df`:**
```
TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
Images          15        5         2.5GB     1.2GB (48%)
Containers      20        3         100MB     50MB (50%)
Local Volumes   8         4         500MB     200MB (40%)
Build Cache     25        0         1.5GB     1.5GB (100%)
```

### Estadísticas

```bash
# Ver imágenes más grandes
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | sort -k 3 -h -r | head -10

# Contar imágenes
docker images | wc -l

# Contar por repositorio
docker images --format "{{.Repository}}" | sort | uniq -c
```

---

## 🎯 Casos de Uso Comunes

### Actualizar imagen

```bash
# Pull nueva versión
docker pull nginx:latest

# Recrear contenedores con nueva imagen
docker-compose up -d --force-recreate
```

### Backup de imágenes

```bash
#!/bin/bash
# backup-images.sh

# Crear directorio de backup
mkdir -p docker-backups

# Listar todas las imágenes y guardarlas
docker images --format "{{.Repository}}:{{.Tag}}" | while read image; do
    filename=$(echo $image | tr '/:' '_')
    echo "Guardando $image..."
    docker save $image | gzip > docker-backups/$filename.tar.gz
done
```

### Restaurar imágenes

```bash
#!/bin/bash
# restore-images.sh

# Cargar todas las imágenes desde backups
for file in docker-backups/*.tar.gz; do
    echo "Cargando $file..."
    gunzip -c $file | docker load
done
```

### Sincronizar imágenes entre servidores

```bash
# En servidor origen
docker save mi-app:latest | gzip | ssh usuario@servidor-destino 'gunzip | docker load'
```

---

## 🔐 Seguridad

### Escanear vulnerabilidades

```bash
# Docker Scout (integrado)
docker scout cves nginx:latest

# Trivy
trivy image nginx:latest

# Con severidad
trivy image --severity HIGH,CRITICAL nginx:latest

# Clair (requiere setup)
clair-scanner nginx:latest
```

### Verificar firma de imagen

```bash
# Docker Content Trust
export DOCKER_CONTENT_TRUST=1
docker pull nginx:latest
```

### Buenas prácticas de seguridad

```bash
# 1. Usar imágenes oficiales verificadas
docker pull nginx:latest  # Imagen oficial

# 2. Especificar versión exacta
docker pull nginx:1.25.3  # No usar 'latest' en producción

# 3. Escanear antes de usar
docker scout cves nginx:1.25.3

# 4. Crear usuario no-root en Dockerfile
RUN useradd -m appuser
USER appuser

# 5. Usar multi-stage para reducir superficie de ataque
```

---

## 📚 Referencia Rápida

```bash
# BUSCAR Y DESCARGAR
docker search nginx                    # Buscar en Docker Hub
docker pull nginx:latest              # Descargar imagen

# LISTAR
docker images                         # Listar todas
docker images -q                      # Solo IDs
docker images --filter dangling=true  # Imágenes huérfanas

# CREAR
docker build -t mi-app:1.0 .         # Desde Dockerfile
docker commit contenedor imagen:tag   # Desde contenedor
docker import archivo.tar imagen:tag  # Desde tar

# ETIQUETAR
docker tag origen:tag destino:tag    # Crear nuevo tag

# EXPORTAR/IMPORTAR
docker save imagen > imagen.tar      # Guardar imagen
docker load < imagen.tar             # Cargar imagen

# COMPARTIR
docker login                         # Login en registry
docker push usuario/imagen:tag       # Subir a registry

# INFORMACIÓN
docker inspect imagen:tag            # Detalles de imagen
docker history imagen:tag            # Historial de capas

# ELIMINAR
docker rmi imagen:tag               # Eliminar imagen
docker image prune                  # Limpiar huérfanas
docker image prune -a               # Limpiar todas sin usar

# SEGURIDAD
docker scout cves imagen:tag        # Escanear vulnerabilidades
```

---

## 💡 Tips Avanzados

### 1. Construir para múltiples plataformas

```bash
# Crear builder multi-plataforma
docker buildx create --name multiplatform --use

# Build para múltiples arquitecturas
docker buildx build --platform linux/amd64,linux/arm64 -t usuario/app:latest --push .
```

### 2. Cache de build

```bash
# Usar imagen como cache
docker build --cache-from mi-app:latest -t mi-app:new .

# Especificar cache externo
docker buildx build --cache-to type=registry,ref=usuario/cache \
                    --cache-from type=registry,ref=usuario/cache \
                    -t mi-app:latest .
```

### 3. Squash layers

```bash
# Combinar capas en una sola (experimental)
docker build --squash -t mi-app:latest .
```

---

## 📖 Recursos Adicionales

- 🔗 [Docker Hub](https://hub.docker.com/)
- 🔗 [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- 🔗 [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- 🔗 [BuildKit](https://docs.docker.com/build/buildkit/)
- 🔗 [Docker Scout](https://docs.docker.com/scout/)

---

**💡 Recuerda:** Mantén tus imágenes actualizadas y escaneadas regularmente para detectar vulnerabilidades.
