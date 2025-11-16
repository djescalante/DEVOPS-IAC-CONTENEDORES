# 🎼 Docker Compose Avanzado

> 🚀 **Configuración avanzada y técnicas profesionales**

---

## 📋 Tabla de Contenidos
- [Variables y Entornos](#variables-y-entornos)
- [Extensión y Reutilización](#extensión-y-reutilización)
- [Dependencias y Salud](#dependencias-y-salud)
- [Redes Avanzadas](#redes-avanzadas)
- [Volúmenes Avanzados](#volúmenes-avanzados)
- [Configuraciones y Secretos](#configuraciones-y-secretos)
- [Perfiles y Entornos](#perfiles-y-entornos)
- [Optimización](#optimización)
- [CI/CD](#cicd)

---

## 🔧 Variables y Entornos

### Variables de entorno

```yaml
version: '3.8'

services:
  app:
    image: node:18
    environment:
      # Forma clave: valor
      NODE_ENV: production
      PORT: 3000
      DB_HOST: postgres
      
      # Usar variable del host
      SECRET_KEY: ${SECRET_KEY}
      
      # Con valor por defecto
      API_URL: ${API_URL:-http://localhost:8080}
```

### Archivo .env

```env
# .env
NODE_ENV=production
DB_HOST=postgres
DB_PORT=5432
DB_NAME=myapp
DB_USER=admin
DB_PASSWORD=secreto123

# URLs
API_URL=http://api.ejemplo.com
FRONTEND_URL=http://web.ejemplo.com

# Versiones
APP_VERSION=1.0.0
NODE_VERSION=18
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    image: node:${NODE_VERSION:-18}
    environment:
      NODE_ENV: ${NODE_ENV}
      DB_HOST: ${DB_HOST}
      DB_PORT: ${DB_PORT}
```

### Múltiples archivos de entorno

```yaml
version: '3.8'

services:
  app:
    # Archivo específico de servicio
    env_file:
      - ./config/.env.common
      - ./config/.env.app
      
  db:
    env_file:
      - ./config/.env.common
      - ./config/.env.db
```

### Interpolar variables

```yaml
version: '3.8'

services:
  app:
    image: myapp:${VERSION:-latest}
    container_name: ${PROJECT_NAME}_app_${ENV}
    ports:
      - "${APP_PORT:-3000}:3000"
    volumes:
      - ${DATA_PATH:-./data}:/app/data
```

---

## 🔄 Extensión y Reutilización

### Extensión de servicios (extends - deprecado)

En Compose v3+, usar **anchors y aliases de YAML**:

```yaml
version: '3.8'

# Definir configuración base con ancla
x-app-common: &app-common
  restart: unless-stopped
  networks:
    - app-network
  logging:
    driver: json-file
    options:
      max-size: "10m"
      max-file: "3"

x-healthcheck: &healthcheck
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s

services:
  api:
    <<: *app-common  # Extender configuración común
    image: myapp/api:latest
    ports:
      - "8080:8080"
    healthcheck:
      <<: *healthcheck
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
  
  worker:
    <<: *app-common  # Reutilizar misma configuración
    image: myapp/worker:latest
    healthcheck:
      <<: *healthcheck
      test: ["CMD", "node", "healthcheck.js"]

networks:
  app-network:
    driver: bridge
```

### Sobrescribir configuraciones

```yaml
# docker-compose.yml (base)
version: '3.8'
services:
  app:
    image: myapp:latest
    environment:
      NODE_ENV: development
    ports:
      - "3000:3000"

# docker-compose.prod.yml (producción)
version: '3.8'
services:
  app:
    environment:
      NODE_ENV: production
    ports:
      - "80:3000"
    deploy:
      replicas: 3
```

```bash
# Combinar archivos
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Configuraciones reutilizables

```yaml
version: '3.8'

# Templates reutilizables
x-logging: &default-logging
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"

x-deployment: &default-deployment
  restart_policy:
    condition: on-failure
    max_attempts: 3
    delay: 5s

x-resources: &default-resources
  limits:
    cpus: '0.50'
    memory: 512M
  reservations:
    cpus: '0.25'
    memory: 256M

services:
  web:
    image: nginx
    logging: *default-logging
    deploy:
      <<: *default-deployment
      resources: *default-resources
  
  api:
    image: node
    logging: *default-logging
    deploy:
      <<: *default-deployment
      resources: *default-resources
```

---

## ⚕️ Dependencias y Salud

### depends_on básico

```yaml
version: '3.8'

services:
  web:
    image: nginx
    depends_on:
      - api
      - cache
  
  api:
    image: node
    depends_on:
      - db
  
  db:
    image: postgres
  
  cache:
    image: redis
```

**⚠️ Importante:** `depends_on` solo controla el **orden de inicio**, no espera que el servicio esté listo.

### depends_on con condiciones (Compose v3.9+)

```yaml
version: '3.9'

services:
  web:
    image: nginx
    depends_on:
      api:
        condition: service_healthy
      cache:
        condition: service_started
  
  api:
    image: node
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
  
  db:
    image: postgres
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
  
  cache:
    image: redis
```

### Healthchecks personalizados

```yaml
version: '3.8'

services:
  web:
    image: nginx
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s
  
  api:
    image: node
    healthcheck:
      test: ["CMD", "node", "/app/healthcheck.js"]
      interval: 30s
      timeout: 10s
      retries: 3
  
  db:
    image: postgres
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
  
  redis:
    image: redis
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 3
  
  mongo:
    image: mongo
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 3
```

### Script de espera personalizado

```yaml
version: '3.8'

services:
  api:
    image: node:18
    command: sh -c "
      echo 'Esperando a la base de datos...';
      while ! nc -z db 5432; do
        sleep 1;
      done;
      echo 'Base de datos lista!';
      npm start
      "
    depends_on:
      - db
  
  db:
    image: postgres:15
```

---

## 🌐 Redes Avanzadas

### Múltiples redes

```yaml
version: '3.8'

services:
  web:
    image: nginx
    networks:
      - frontend
      - backend
  
  api:
    image: node
    networks:
      - backend
  
  db:
    image: postgres
    networks:
      - backend

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true  # Sin acceso a internet
```

### Configuración avanzada de red

```yaml
version: '3.8'

services:
  app:
    image: myapp
    networks:
      app-network:
        ipv4_address: 172.20.0.10
        aliases:
          - api
          - backend
  
  db:
    image: postgres
    networks:
      app-network:
        ipv4_address: 172.20.0.20

networks:
  app-network:
    driver: bridge
    ipam:
      driver: default
      config:
        - subnet: 172.20.0.0/16
          gateway: 172.20.0.1
          ip_range: 172.20.10.0/24
    driver_opts:
      com.docker.network.bridge.name: docker1
      com.docker.network.driver.mtu: 1450
    labels:
      env: production
```

### Red externa

```yaml
version: '3.8'

services:
  app:
    image: myapp
    networks:
      - existing-network

networks:
  existing-network:
    external: true
    name: my-pre-existing-network
```

### Macvlan

```yaml
version: '3.8'

services:
  app:
    image: myapp
    networks:
      macvlan-net:
        ipv4_address: 192.168.1.100

networks:
  macvlan-net:
    driver: macvlan
    driver_opts:
      parent: eth0
    ipam:
      config:
        - subnet: 192.168.1.0/24
          gateway: 192.168.1.1
```

---

## 💾 Volúmenes Avanzados

### Volúmenes con opciones

```yaml
version: '3.8'

services:
  app:
    image: myapp
    volumes:
      # Volumen nombrado con opciones
      - type: volume
        source: app-data
        target: /data
        volume:
          nocopy: true
      
      # Bind mount con opciones
      - type: bind
        source: ./app
        target: /app
        read_only: true
      
      # tmpfs
      - type: tmpfs
        target: /tmp
        tmpfs:
          size: 100000000  # 100MB

volumes:
  app-data:
    driver: local
    driver_opts:
      type: nfs
      o: addr=192.168.1.100,rw
      device: ":/path/to/dir"
```

### Volúmenes externos

```yaml
version: '3.8'

services:
  db:
    image: postgres
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:
    external: true
    name: my-pre-existing-volume
```

### Volúmenes con labels

```yaml
version: '3.8'

volumes:
  app-data:
    driver: local
    labels:
      env: production
      backup: daily
      project: myapp
```

---

## 🔐 Configuraciones y Secretos

### Configs (Swarm)

```yaml
version: '3.8'

services:
  web:
    image: nginx
    configs:
      - source: nginx-config
        target: /etc/nginx/nginx.conf
        mode: 0440

configs:
  nginx-config:
    file: ./nginx.conf
    # o desde contenido directo
    # content: |
    #   server {
    #     ...
    #   }
```

### Secrets (Swarm)

```yaml
version: '3.8'

services:
  db:
    image: postgres
    secrets:
      - db_password
      - db_root_password
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
  db_root_password:
    external: true
```

### Alternativa sin Swarm

```yaml
version: '3.8'

services:
  app:
    image: myapp
    volumes:
      # Montar secretos como archivos
      - ./secrets/api_key.txt:/run/secrets/api_key:ro
      - ./secrets/db_password.txt:/run/secrets/db_password:ro
    environment:
      API_KEY_FILE: /run/secrets/api_key
      DB_PASSWORD_FILE: /run/secrets/db_password
```

---

## 🎭 Perfiles y Entornos

### Perfiles (Compose 1.28+)

```yaml
version: '3.8'

services:
  web:
    image: nginx
    # Siempre se ejecuta
  
  api:
    image: node
    # Siempre se ejecuta
  
  db:
    image: postgres
    profiles: ["full"]
    # Solo con --profile full
  
  cache:
    image: redis
    profiles: ["full"]
  
  debug-tools:
    image: nicolaka/netshoot
    profiles: ["debug"]
    # Solo con --profile debug
```

```bash
# Solo servicios sin perfil
docker-compose up -d

# Con perfil 'full'
docker-compose --profile full up -d

# Múltiples perfiles
docker-compose --profile full --profile debug up -d
```

### Múltiples entornos

#### docker-compose.yml (base)
```yaml
version: '3.8'

services:
  app:
    image: myapp:${VERSION:-latest}
    environment:
      NODE_ENV: ${NODE_ENV:-development}
```

#### docker-compose.dev.yml
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    volumes:
      - ./src:/app/src
    environment:
      NODE_ENV: development
      DEBUG: "app:*"
```

#### docker-compose.prod.yml
```yaml
version: '3.8'

services:
  app:
    image: myapp:${VERSION}
    environment:
      NODE_ENV: production
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
    restart: always
```

```bash
# Desarrollo
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Producción
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## ⚡ Optimización

### Build cache

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      cache_from:
        - myapp:latest
        - myapp:${VERSION}
      args:
        NODE_ENV: production
```

### Recursos limitados

```yaml
version: '3.8'

services:
  app:
    image: myapp
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
  
  db:
    image: postgres
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
    # Opciones de memoria adicionales
    mem_swappiness: 0
    shm_size: 256mb
```

### Políticas de reinicio

```yaml
version: '3.8'

services:
  web:
    image: nginx
    restart: unless-stopped
  
  api:
    image: node
    restart: on-failure:3  # Máximo 3 intentos
  
  worker:
    image: worker
    restart: always
```

### Logging optimizado

```yaml
version: '3.8'

x-logging: &default-logging
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
    compress: "true"

services:
  web:
    image: nginx
    logging: *default-logging
  
  api:
    image: node
    logging:
      driver: "syslog"
      options:
        syslog-address: "tcp://192.168.1.100:514"
        tag: "{{.Name}}/{{.ID}}"
```

---

## 🔄 CI/CD

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Create .env file
        run: |
          echo "DB_PASSWORD=${{ secrets.DB_PASSWORD }}" >> .env
          echo "API_KEY=${{ secrets.API_KEY }}" >> .env
      
      - name: Build and deploy
        run: |
          docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
          docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - build
  - deploy

variables:
  DOCKER_DRIVER: overlay2

build:
  stage: build
  script:
    - docker-compose build
    - docker-compose push

deploy:
  stage: deploy
  script:
    - docker-compose -f docker-compose.yml -f docker-compose.prod.yml pull
    - docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
  only:
    - main
```

### Script de deploy

```bash
#!/bin/bash
# deploy.sh

set -e

ENV=${1:-production}
VERSION=${2:-latest}

echo "Deploying version $VERSION to $ENV..."

# Crear .env desde secretos
cat > .env << EOF
VERSION=$VERSION
NODE_ENV=$ENV
DB_HOST=${DB_HOST}
DB_PASSWORD=${DB_PASSWORD}
EOF

# Pull imágenes
docker-compose -f docker-compose.yml -f docker-compose.$ENV.yml pull

# Deploy con zero-downtime
docker-compose -f docker-compose.yml -f docker-compose.$ENV.yml up -d --no-deps --build

# Verificar salud
sleep 10
docker-compose ps

# Limpiar
docker system prune -f

echo "✅ Deploy completado!"
```

---

## 📊 Monitoreo

### Con Prometheus y Grafana

```yaml
version: '3.8'

services:
  app:
    image: myapp
    ports:
      - "3000:3000"
      - "9090:9090"  # Métricas
  
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    ports:
      - "9091:9090"
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
  
  grafana:
    image: grafana/grafana
    volumes:
      - grafana-data:/var/lib/grafana
    ports:
      - "3001:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
    depends_on:
      - prometheus

volumes:
  prometheus-data:
  grafana-data:
```

---

## 📚 Ejemplo Completo Avanzado

```yaml
version: '3.9'

# Configuraciones reutilizables
x-app-common: &app-common
  restart: unless-stopped
  networks:
    - backend
  logging: &logging
    driver: "json-file"
    options:
      max-size: "10m"
      max-file: "3"

x-healthcheck: &healthcheck
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s

services:
  # Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx:/etc/nginx/conf.d:ro
      - ./ssl:/etc/nginx/ssl:ro
      - static-files:/usr/share/nginx/html:ro
    networks:
      - frontend
      - backend
    depends_on:
      api:
        condition: service_healthy
    logging: *logging
    restart: always

  # API Backend
  api:
    <<: *app-common
    build:
      context: ./api
      cache_from:
        - myapp/api:latest
    image: myapp/api:${VERSION:-latest}
    environment:
      NODE_ENV: ${NODE_ENV:-production}
      DB_HOST: postgres
      REDIS_HOST: redis
      DB_PASSWORD_FILE: /run/secrets/db_password
    volumes:
      - ./api/uploads:/app/uploads
      - ./secrets/db_password.txt:/run/secrets/db_password:ro
    networks:
      - backend
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      <<: *healthcheck
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M

  # Worker para tareas en background
  worker:
    <<: *app-common
    build:
      context: ./api
      target: worker
    image: myapp/worker:${VERSION:-latest}
    environment:
      NODE_ENV: ${NODE_ENV:-production}
      REDIS_HOST: redis
    depends_on:
      - redis
    deploy:
      replicas: 3

  # Base de datos
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${DB_NAME:-myapp}
      POSTGRES_USER: ${DB_USER:-admin}
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./init-db:/docker-entrypoint-initdb.d:ro
      - ./secrets/db_password.txt:/run/secrets/db_password:ro
    networks:
      - backend
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-admin}"]
      interval: 10s
      timeout: 5s
      retries: 5
    logging: *logging
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G

  # Cache
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    networks:
      - backend
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 3
    logging: *logging

  # Backup automático
  backup:
    image: postgres:15-alpine
    environment:
      PGHOST: postgres
      PGUSER: ${DB_USER:-admin}
      PGPASSWORD_FILE: /run/secrets/db_password
      PGDATABASE: ${DB_NAME:-myapp}
    volumes:
      - ./backups:/backups
      - ./secrets/db_password.txt:/run/secrets/db_password:ro
    networks:
      - backend
    command: >
      sh -c '
      while true; do
        sleep 86400;
        pg_dump > /backups/backup-$$(date +%Y%m%d-%H%M%S).sql;
        find /backups -name "backup-*.sql" -mtime +7 -delete;
      done
      '
    depends_on:
      - postgres
    profiles: ["backup"]
    logging: *logging

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true

volumes:
  postgres-data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: ${DATA_PATH:-./data}/postgres
  redis-data:
  static-files:
```

---

## 📖 Recursos Adicionales

- 🔗 [Compose File Reference](https://docs.docker.com/compose/compose-file/)
- 🔗 [Environment Variables](https://docs.docker.com/compose/environment-variables/)
- 🔗 [Networking](https://docs.docker.com/compose/networking/)
- 🔗 [Profiles](https://docs.docker.com/compose/profiles/)

---

**💡 Tip:** Usa `docker-compose config` para ver la configuración final después de interpolar variables y mergear archivos.
