# 💡 Tips y Mejores Prácticas

> ⚡ **Optimiza y asegura tus contenedores Docker**

---

## 🎯 Mejores Prácticas Generales

### ✅ 1. Usa Imágenes Oficiales y Ligeras

```dockerfile
# ❌ Evitar
FROM ubuntu:latest

# ✅ Mejor
FROM python:3.11-slim

# ✅✅ Óptimo
FROM python:3.11-alpine
```

**Comparación de tamaños:**
- `ubuntu:latest` → ~77MB
- `python:3.11` → ~1GB
- `python:3.11-slim` → ~120MB
- `python:3.11-alpine` → ~50MB

---

### ✅ 2. No Usar Tag "latest"

```yaml
# ❌ Evitar - No reproducible
image: nginx:latest

# ✅ Mejor - Versión específica
image: nginx:1.25.3-alpine
```

---

### ✅ 3. Multi-Stage Builds

```dockerfile
# Build stage
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/server.js"]
```

**Beneficios:**
- 🔹 Imagen final más pequeña
- 🔹 Sin herramientas de desarrollo
- 🔹 Mayor seguridad

---

### ✅ 4. Minimizar Capas

```dockerfile
# ❌ Evitar - Múltiples capas
RUN apt-get update
RUN apt-get install -y nginx
RUN apt-get clean

# ✅ Mejor - Una sola capa
RUN apt-get update && \
    apt-get install -y nginx && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

---

### ✅ 5. Orden de Comandos (Cache)

```dockerfile
# ❌ Mal orden
COPY . /app
RUN npm install

# ✅ Buen orden - Dependencias primero
COPY package*.json /app/
RUN npm install
COPY . /app
```

---

### ✅ 6. Usar .dockerignore

**.dockerignore:**
```
node_modules
npm-debug.log
.git
.env
.vscode
*.md
dist
build
__pycache__
*.pyc
.pytest_cache
coverage
.DS_Store
```

---

### ✅ 7. No Ejecutar Como Root

```dockerfile
# ❌ Evitar - Corre como root
CMD ["node", "app.js"]

# ✅ Mejor - Usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs
CMD ["node", "app.js"]
```

---

### ✅ 8. Variables de Entorno Seguras

```yaml
# ❌ Evitar - Hardcoded
environment:
  DB_PASSWORD: "mipassword123"

# ✅ Mejor - Desde archivo .env
env_file:
  - .env

# ✅✅ Óptimo - Docker secrets (Swarm)
secrets:
  - db_password
```

**.env:**
```env
DB_PASSWORD=mipassword123
API_KEY=secret_key
```

---

### ✅ 9. Healthchecks

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1
```

```yaml
# Docker Compose
services:
  web:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

---

### ✅ 10. Limitar Recursos

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

---

## 🔒 Seguridad

### 🔐 1. Escanear Imágenes

```bash
# Docker Scout
docker scout cves imagen:tag

# Trivy
trivy image imagen:tag
```

---

### 🔐 2. No Exponer Puertos Innecesarios

```yaml
# ❌ Expone a internet
ports:
  - "5432:5432"

# ✅ Solo localhost
ports:
  - "127.0.0.1:5432:5432"

# ✅✅ No exponer - usar red interna
# (sin ports, usar networks)
```

---

### 🔐 3. Actualizar Imágenes Regularmente

```bash
# Pull últimas versiones
docker-compose pull

# Recrear contenedores
docker-compose up -d
```

---

### 🔐 4. Usar Secrets para Datos Sensibles

```yaml
# docker-compose.yml
services:
  app:
    secrets:
      - db_password
      
secrets:
  db_password:
    file: ./secrets/db_password.txt
```

---

### 🔐 5. Read-Only Filesystem

```yaml
services:
  app:
    read_only: true
    tmpfs:
      - /tmp
      - /var/run
```

---

## 🚀 Performance

### ⚡ 1. Usar BuildKit

```bash
# Habilitar BuildKit
export DOCKER_BUILDKIT=1

# Build más rápido
docker build -t imagen:tag .
```

---

### ⚡ 2. Usar Cache de Dependencias

```dockerfile
# Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# Node.js
COPY package*.json ./
RUN npm ci --only=production
COPY . .
```

---

### ⚡ 3. Limpiar Regularmente

```bash
# Limpieza semanal
docker system prune -a

# Limpieza con cron (Linux)
0 2 * * 0 docker system prune -af --filter "until=168h"
```

---

### ⚡ 4. Volúmenes para I/O Intensivo

```yaml
services:
  app:
    volumes:
      - app_data:/app/data  # ✅ Volumen nombrado
      - ./src:/app/src      # Bind mount para desarrollo
```

---

## 📝 Documentación

### 📄 1. Documenta tu Docker Compose

```yaml
version: '3.8'

# Stack de desarrollo completo
# Incluye: API, Base de datos, Cache
services:
  api:
    # Servidor API REST
    build: ./api
    # Puerto 3000 para desarrollo
    ports:
      - "3000:3000"
```

---

### 📄 2. Incluye README

**README.md:**
```markdown
# Mi Aplicación

## Inicio Rápido
bash
docker-compose up -d


## Acceso
- API: http://localhost:3000
- DB Admin: http://localhost:8080

## Variables de Entorno
Copia `.env.example` a `.env` y configura.
```

---

### 📄 3. Incluye .env.example

**.env.example:**
```env
# Database
DB_PASSWORD=changeme
DB_USER=user
DB_NAME=myapp

# API
API_PORT=3000
API_SECRET=changeme
NODE_ENV=development
```

---

## 🎨 Naming Conventions

### ✅ Nombres Descriptivos

```yaml
# ❌ Evitar
services:
  app:
  db:

# ✅ Mejor
services:
  api_backend:
  postgres_database:
  redis_cache:
```

---

### ✅ Tags Semánticos

```bash
# ❌ Evitar
docker build -t myapp .

# ✅ Mejor
docker build -t myapp:1.0.0 .
docker build -t myapp:1.0.0-alpine .
docker build -t myapp:latest .
```

---

## 🔄 CI/CD

### ✅ 1. Build en Pipeline

```yaml
# .gitlab-ci.yml
build:
  stage: build
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
```

---

### ✅ 2. Multi-Stage para Tests

```dockerfile
# Test stage
FROM node:18 AS test
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm test

# Production stage
FROM node:18-alpine AS production
WORKDIR /app
COPY --from=test /app/dist ./dist
CMD ["node", "dist/server.js"]
```

---

## 🧹 Mantenimiento

### ✅ 1. Limpieza Automática

```bash
# Script de limpieza
#!/bin/bash
docker container prune -f
docker image prune -f
docker volume prune -f
docker network prune -f
```

---

### ✅ 2. Monitoreo de Recursos

```bash
# Ver uso de espacio
docker system df

# Ver estadísticas
docker stats --no-stream
```

---

### ✅ 3. Logs Rotación

```yaml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

## 📊 Monitoring

### ✅ 1. Logs Centralizados

```yaml
services:
  app:
    logging:
      driver: "syslog"
      options:
        syslog-address: "tcp://localhost:514"
```

---

### ✅ 2. Métricas con Prometheus

```yaml
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"
```

---

## 🎯 Checklist de Producción

Antes de desplegar a producción:

- [ ] Imágenes con tags específicos (no `latest`)
- [ ] Variables en archivo `.env`
- [ ] Secrets para datos sensibles
- [ ] Healthchecks configurados
- [ ] Límites de recursos definidos
- [ ] Volúmenes para persistencia
- [ ] Logs con rotación
- [ ] Backup strategy definida
- [ ] Monitoreo configurado
- [ ] Documentación actualizada
- [ ] No exponer puertos innecesarios
- [ ] Usuario no-root
- [ ] Imágenes escaneadas (sin CVEs críticos)

---

## 💾 Backup y Restore

### Backup de Volúmenes

```bash
# Backup
docker run --rm \
  -v mysql_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/mysql-backup.tar.gz /data

# Restore
docker run --rm \
  -v mysql_data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/mysql-backup.tar.gz -C /
```

---

## 🔧 Aliases Útiles

Agrega a `.bashrc` o `.zshrc`:

```bash
# Docker
alias d='docker'
alias dc='docker-compose'
alias dps='docker ps'
alias di='docker images'

# Docker Compose
alias dcu='docker-compose up -d'
alias dcd='docker-compose down'
alias dcl='docker-compose logs -f'
alias dcr='docker-compose restart'

# Limpieza
alias dclean='docker system prune -a'
alias dstop='docker stop $(docker ps -aq)'
```

---

## 📚 Recursos Recomendados

### Herramientas

- **Dive** - Analizar capas de imágenes
  ```bash
  dive imagen:tag
  ```

- **Docker Scout** - Escaneo de vulnerabilidades
  ```bash
  docker scout cves imagen:tag
  ```

- **ctop** - Monitoreo en tiempo real
  ```bash
  ctop
  ```

- **Portainer** - UI de gestión
  ```yaml
  services:
    portainer:
      image: portainer/portainer-ce
      ports:
        - "9000:9000"
      volumes:
        - /var/run/docker.sock:/var/run/docker.sock
        - portainer_data:/data
  ```

---

## 🎓 Aprende Más

- 🔗 [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- 🔗 [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- 🔗 [Security Best Practices](https://docs.docker.com/engine/security/)

---

**💡 Regla de Oro:** Si algo funciona, documéntalo. Si algo falla, aprende de ello.
