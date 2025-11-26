# Buenas Prácticas de Docker para Aplicaciones Web

## 1. Diseño de Contenedores

### ✅ Un Proceso por Contenedor
```yaml
# ❌ MAL - Múltiples procesos
services:
  app:
    command: "nginx && node server.js"

# ✅ BIEN - Separar servicios
services:
  frontend:
    image: nginx
  backend:
    image: node
```

### ✅ Imágenes Ligeras
```dockerfile
# ❌ MAL - Imagen pesada
FROM node:18

# ✅ BIEN - Imagen Alpine
FROM node:18-alpine
```

### ✅ Multi-stage Builds
```dockerfile
# Etapa de construcción
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Etapa de producción
FROM node:18-alpine
COPY --from=builder /app/node_modules ./node_modules
COPY . .
CMD ["node", "server.js"]
```

## 2. Seguridad

### ✅ Usuario No-Root
```dockerfile
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs
```

### ✅ Variables de Entorno Seguras
```yaml
# ❌ MAL - Contraseñas en el archivo
environment:
  - DB_PASSWORD=mypassword

# ✅ BIEN - Usar archivo .env
environment:
  - DB_PASSWORD=${DB_PASSWORD}
```

### ✅ Secrets Management
```yaml
services:
  app:
    secrets:
      - db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

## 3. Redes

### ✅ Redes Separadas
```yaml
networks:
  frontend-network:  # Pública
    driver: bridge
  backend-network:   # Interna
    driver: bridge
    internal: true
  database-network:  # Solo BD
    driver: bridge
    internal: true
```

### ✅ Comunicación por Nombre de Servicio
```javascript
// ✅ BIEN - Usar nombre del servicio
const dbHost = 'database';

// ❌ MAL - Usar IP hardcodeada
const dbHost = '172.18.0.2';
```

## 4. Volúmenes y Persistencia

### ✅ Volúmenes Nombrados
```yaml
volumes:
  mysql-data:
    driver: local
  redis-data:
    driver: local
```

### ✅ Bind Mounts para Desarrollo
```yaml
# Desarrollo
volumes:
  - ./src:/app/src

# Producción - Sin bind mounts
# Código dentro de la imagen
```

## 5. Health Checks

### ✅ Health Checks en Servicios
```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### ✅ Dependencias con Condiciones
```yaml
depends_on:
  database:
    condition: service_healthy
```

## 6. Logging

### ✅ Logging Estructurado
```javascript
// ✅ BIEN - JSON logs
console.log(JSON.stringify({
  level: 'info',
  message: 'User created',
  userId: 123,
  timestamp: new Date().toISOString()
}));
```

### ✅ Límites de Logs
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

## 7. Recursos

### ✅ Límites de Recursos
```yaml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 512M
    reservations:
      cpus: '0.5'
      memory: 256M
```

## 8. Optimización de Imágenes

### ✅ .dockerignore
```
node_modules
npm-debug.log
.git
.env
*.md
tests
```

### ✅ Capas Eficientes
```dockerfile
# ✅ BIEN - Dependencias primero (cambian menos)
COPY package*.json ./
RUN npm ci

# Código después (cambia más)
COPY . .
```

## 9. Restart Policies

```yaml
restart: unless-stopped  # Producción
restart: on-failure      # Desarrollo
restart: always          # Servicios críticos
restart: no              # Jobs únicos
```

## 10. Monitoreo

### ✅ Métricas y Observabilidad
```yaml
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
  
  grafana:
    image: grafana/grafana
    depends_on:
      - prometheus
```

## Checklist de Producción

- [ ] Imágenes optimizadas (Alpine, multi-stage)
- [ ] Usuario no-root
- [ ] Health checks configurados
- [ ] Límites de recursos definidos
- [ ] Secrets management implementado
- [ ] Redes separadas (frontend/backend/db)
- [ ] Volúmenes para persistencia
- [ ] Logging configurado
- [ ] Backup automatizado
- [ ] Monitoreo activo
- [ ] SSL/TLS configurado
- [ ] Rate limiting implementado
- [ ] CORS configurado correctamente
- [ ] Variables de entorno externalizadas
- [ ] Restart policies apropiadas
