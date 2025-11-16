# 📝 Dockerfile - Guía Completa

> 🏗️ **Crea tus propias imágenes Docker personalizadas**

---

## 📋 Tabla de Contenidos
- [¿Qué es un Dockerfile?](#qué-es-un-dockerfile)
- [Estructura Básica](#estructura-básica)
- [Instrucciones Principales](#instrucciones-principales)
- [Ejemplos Prácticos](#ejemplos-prácticos)
- [Mejores Prácticas](#mejores-prácticas)

---

## 🤔 ¿Qué es un Dockerfile?

Un **Dockerfile** es un archivo de texto que contiene instrucciones para construir una imagen Docker automáticamente.

```
┌─────────────────┐
│   Dockerfile    │  ────┐
└─────────────────┘      │
                         │  docker build
┌─────────────────┐      │
│  Docker Image   │  ◄───┘
└─────────────────┘
        │
        │  docker run
        ▼
┌─────────────────┐
│   Container     │
└─────────────────┘
```

---

## 🏗️ Estructura Básica

### Dockerfile mínimo
```dockerfile
FROM ubuntu:20.04
RUN apt-get update && apt-get install -y nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Construir imagen
```bash
docker build -t mi-imagen:v1.0 .
```

### Opciones de build
```bash
# Build básico
docker build -t nombre:tag .

# Build con contexto específico
docker build -t nombre:tag /ruta/al/contexto

# Build sin cache
docker build --no-cache -t nombre:tag .

# Build con archivo específico
docker build -f Dockerfile.dev -t nombre:tag .

# Build con argumentos
docker build --build-arg VERSION=1.0 -t nombre:tag .
```

---

## 📚 Instrucciones Principales

### 🔵 FROM - Imagen Base
Define la imagen base sobre la que se construye.

```dockerfile
# Imagen base oficial
FROM ubuntu:20.04

# Imagen base con tag específico
FROM node:18-alpine

# Multi-stage build
FROM node:18 AS builder
FROM nginx:alpine AS production
```

**Imágenes base populares:**
- `ubuntu:20.04`, `ubuntu:22.04`
- `alpine:latest` (muy ligera, ~5MB)
- `node:18-alpine`
- `python:3.11-slim`
- `nginx:alpine`
- `mysql:8.0`

---

### 🔵 WORKDIR - Directorio de Trabajo
Establece el directorio de trabajo dentro del contenedor.

```dockerfile
WORKDIR /app

# Equivalente a:
# RUN mkdir -p /app
# RUN cd /app
```

---

### 🔵 COPY - Copiar Archivos
Copia archivos del host al contenedor.

```dockerfile
# Copiar archivo específico
COPY package.json /app/

# Copiar directorio
COPY src/ /app/src/

# Copiar todo
COPY . /app/

# Copiar con permisos
COPY --chown=user:group archivo.txt /destino/
```

---

### 🔵 ADD - Copiar y Más
Similar a COPY pero con funcionalidades extra (auto-extrae .tar).

```dockerfile
# Copiar archivo
ADD archivo.txt /app/

# Auto-extraer tar
ADD archivo.tar.gz /app/

# Descargar desde URL (no recomendado)
ADD https://ejemplo.com/archivo.zip /app/
```

**💡 Tip:** Usa `COPY` en lugar de `ADD` a menos que necesites sus características especiales.

---

### 🔵 RUN - Ejecutar Comandos
Ejecuta comandos durante la construcción de la imagen.

```dockerfile
# Forma shell (usa /bin/sh -c)
RUN apt-get update

# Forma exec (lista de strings)
RUN ["apt-get", "install", "-y", "nginx"]

# Múltiples comandos en una línea (reduce capas)
RUN apt-get update && \
    apt-get install -y nginx curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

---

### 🔵 CMD - Comando por Defecto
Define el comando que se ejecuta cuando se inicia el contenedor.

```dockerfile
# Forma exec (recomendada)
CMD ["nginx", "-g", "daemon off;"]

# Forma shell
CMD nginx -g "daemon off;"

# Como parámetros de ENTRYPOINT
CMD ["--help"]
```

**⚠️ Importante:** Solo puede haber un `CMD` por Dockerfile. Si hay varios, solo el último tiene efecto.

---

### 🔵 ENTRYPOINT - Punto de Entrada
Define el ejecutable principal del contenedor.

```dockerfile
# Forma exec
ENTRYPOINT ["python", "app.py"]

# Con CMD como argumentos
ENTRYPOINT ["python", "app.py"]
CMD ["--port", "8080"]
```

**Diferencia entre CMD y ENTRYPOINT:**
```dockerfile
# CMD se puede sobrescribir completamente
CMD ["echo", "Hola"]
# docker run imagen -> imprime "Hola"
# docker run imagen echo "Adiós" -> imprime "Adiós"

# ENTRYPOINT se mantiene, CMD son argumentos
ENTRYPOINT ["echo"]
CMD ["Hola"]
# docker run imagen -> imprime "Hola"
# docker run imagen "Adiós" -> imprime "Adiós"
```

---

### 🔵 ENV - Variables de Entorno
Define variables de entorno.

```dockerfile
# Sintaxis clave=valor
ENV NODE_ENV=production

# Múltiples variables
ENV PORT=3000 \
    HOST=0.0.0.0 \
    DB_HOST=localhost
```

**Uso:**
```dockerfile
ENV APP_HOME=/app
WORKDIR $APP_HOME
```

---

### 🔵 ARG - Argumentos de Build
Define variables que solo existen durante el build.

```dockerfile
# Definir argumento
ARG VERSION=1.0
ARG BUILD_DATE

# Usar argumento
RUN echo "Building version ${VERSION}"

# ARG con valor por defecto
ARG NODE_ENV=development
```

**Pasar argumentos al build:**
```bash
docker build --build-arg VERSION=2.0 --build-arg NODE_ENV=production -t app:2.0 .
```

**Diferencia ARG vs ENV:**
- `ARG`: Solo disponible durante el build
- `ENV`: Disponible durante el build y en el contenedor en ejecución

---

### 🔵 EXPOSE - Exponer Puertos
Documenta qué puertos usa el contenedor (informativo).

```dockerfile
# Puerto simple
EXPOSE 80

# Múltiples puertos
EXPOSE 80 443

# Con protocolo
EXPOSE 8080/tcp
EXPOSE 53/udp
```

**⚠️ Nota:** `EXPOSE` NO publica el puerto. Es solo documentación. Usa `-p` al ejecutar:
```bash
docker run -p 8080:80 imagen
```

---

### 🔵 VOLUME - Volúmenes
Define puntos de montaje para persistencia de datos.

```dockerfile
# Volumen simple
VOLUME /data

# Múltiples volúmenes
VOLUME ["/data", "/logs"]
```

---

### 🔵 USER - Usuario de Ejecución
Cambia el usuario que ejecuta los comandos.

```dockerfile
# Crear usuario y cambiar
RUN useradd -m -s /bin/bash appuser
USER appuser

# Cambiar a root temporalmente
USER root
RUN apt-get update
USER appuser
```

---

### 🔵 LABEL - Metadatos
Agrega metadatos a la imagen.

```dockerfile
LABEL maintainer="tu@email.com"
LABEL version="1.0"
LABEL description="Mi aplicación web"
LABEL org.opencontainers.image.source="https://github.com/usuario/repo"
```

---

### 🔵 HEALTHCHECK - Verificación de Salud
Define cómo verificar que el contenedor está saludable.

```dockerfile
# Healthcheck HTTP
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Healthcheck personalizado
HEALTHCHECK CMD python /app/healthcheck.py
```

---

## 💡 Ejemplos Prácticos

### 🟢 Ejemplo 1: Aplicación Node.js

```dockerfile
# Usa imagen base de Node
FROM node:18-alpine

# Información de mantenedor
LABEL maintainer="dev@empresa.com"

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 3000

# Usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node healthcheck.js

# Comando de inicio
CMD ["node", "server.js"]
```

---

### 🟢 Ejemplo 2: Aplicación Python

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        gcc \
        postgresql-client && \
    rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY requirements.txt .

# Instalar dependencias Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY . .

# Variables de entorno
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

EXPOSE 8000

# Crear usuario
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app
USER appuser

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app:app"]
```

---

### 🟢 Ejemplo 3: Multi-Stage Build

```dockerfile
# STAGE 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# STAGE 2: Production
FROM nginx:alpine

# Copiar build desde stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Beneficios del Multi-Stage:**
- ✅ Imagen final más pequeña
- ✅ Sin herramientas de build en producción
- ✅ Mayor seguridad

---

### 🟢 Ejemplo 4: Aplicación Go

```dockerfile
# Stage 1: Build
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copiar go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copiar código fuente
COPY . .

# Compilar aplicación
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Stage 2: Run
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copiar binario desde builder
COPY --from=builder /app/main .

EXPOSE 8080

CMD ["./main"]
```

---

### 🟢 Ejemplo 5: Aplicación Java con Maven

```dockerfile
# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app

# Copiar pom.xml y descargar dependencias
COPY pom.xml .
RUN mvn dependency:go-offline

# Copiar código y compilar
COPY src ./src
RUN mvn package -DskipTests

# Stage 2: Run
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copiar JAR desde builder
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

# Usuario no-root
RUN addgroup -g 1001 spring && \
    adduser -S spring -u 1001 -G spring
USER spring

ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## 🎯 Mejores Prácticas

### ✅ 1. Usar imágenes base oficiales y ligeras
```dockerfile
# ❌ Malo
FROM ubuntu:latest

# ✅ Bueno
FROM python:3.11-slim
# o mejor aún
FROM python:3.11-alpine
```

---

### ✅ 2. Minimizar capas
```dockerfile
# ❌ Malo - 3 capas
RUN apt-get update
RUN apt-get install -y nginx
RUN apt-get clean

# ✅ Bueno - 1 capa
RUN apt-get update && \
    apt-get install -y nginx && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

---

### ✅ 3. Usar .dockerignore
Crea un archivo `.dockerignore`:
```
node_modules
npm-debug.log
.git
.env
*.md
.vscode
__pycache__
*.pyc
dist
build
```

---

### ✅ 4. Orden de las instrucciones (caché)
```dockerfile
# ❌ Malo - El código cambia frecuentemente, invalida cache
COPY . /app
RUN npm install

# ✅ Bueno - Dependencias primero (cambian menos)
COPY package*.json /app/
RUN npm install
COPY . /app
```

---

### ✅ 5. No ejecutar como root
```dockerfile
# Crear usuario
RUN useradd -m -u 1000 appuser
USER appuser
```

---

### ✅ 6. Multi-stage para reducir tamaño
```dockerfile
FROM node:18 AS builder
# ... build steps ...

FROM node:18-alpine
COPY --from=builder /app/dist ./dist
```

---

### ✅ 7. Usar COPY en lugar de ADD
```dockerfile
# ❌ Evitar
ADD . /app

# ✅ Preferir
COPY . /app
```

---

### ✅ 8. Especificar versiones exactas
```dockerfile
# ❌ Malo
FROM node:latest

# ✅ Bueno
FROM node:18.17.1-alpine3.18
```

---

### ✅ 9. Limpiar en la misma capa
```dockerfile
RUN apt-get update && \
    apt-get install -y package && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

---

### ✅ 10. Usar healthchecks
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost/ || exit 1
```

---

## 🔍 Comandos Útiles

### Ver historial de capas
```bash
docker history imagen:tag
```

### Ver tamaño de cada capa
```bash
docker history --no-trunc imagen:tag
```

### Analizar imagen (con dive)
```bash
dive imagen:tag
```

### Build con output detallado
```bash
docker build --progress=plain --no-cache -t imagen:tag .
```

---

## 📊 Comparación de Tamaños

```
ubuntu:latest        ~77MB
alpine:latest        ~5MB
python:3.11          ~1GB
python:3.11-slim     ~120MB
python:3.11-alpine   ~50MB
node:18              ~1GB
node:18-alpine       ~180MB
```

**💡 Tip:** Usa imágenes Alpine cuando sea posible para reducir tamaño.

---

## 🎨 Ejemplo Completo con Todo

```dockerfile
# Multi-stage build para aplicación Node.js
FROM node:18-alpine AS builder

# Metadatos
LABEL maintainer="dev@empresa.com" \
      version="1.0.0" \
      description="API REST con Node.js"

# Argumentos de build
ARG NODE_ENV=production
ARG VERSION=1.0.0

# Variables de entorno
ENV NODE_ENV=${NODE_ENV} \
    VERSION=${VERSION}

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production && \
    npm cache clean --force

# Copiar código fuente
COPY . .

# Build de la aplicación
RUN npm run build

# PRODUCTION STAGE
FROM node:18-alpine

WORKDIR /app

# Copiar desde builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node healthcheck.js || exit 1

# Volumen para logs
VOLUME ["/app/logs"]

# Comando de inicio
CMD ["node", "dist/server.js"]
```

---

## 📚 Recursos Adicionales

- 🔗 [Dockerfile Reference](https://docs.docker.com/engine/reference/builder/)
- 🔗 [Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- 🔗 [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)

---

**💡 Tip Final:** Siempre revisa el tamaño de tu imagen final con `docker images` y optimiza según sea necesario.
