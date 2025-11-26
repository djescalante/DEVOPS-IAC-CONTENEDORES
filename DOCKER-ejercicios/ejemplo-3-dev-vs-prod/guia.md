# 📘 Guía Detallada: Desarrollo vs Producción

## 🎯 Descripción del Proyecto
Este ejemplo es crucial para entender el ciclo de vida de una aplicación. Muestra cómo usar Docker para dos objetivos muy diferentes:
1. **Desarrollo**: Prioriza la velocidad de iteración, debugging y visibilidad.
2. **Producción**: Prioriza la estabilidad, seguridad, rendimiento y tamaño reducido.

---

## 🆚 Comparativa de Archivos Compose

### 1. Entorno de Desarrollo (`docker-compose.dev.yml`)

El objetivo aquí es que el desarrollador pueda editar código y ver cambios al instante.

```yaml
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev  # Dockerfile específico con herramientas de dev
    volumes:
      - ./backend/src:/app/src    # BIND MOUNT: Espejo de tu disco duro
                                  # Si editas un archivo en Windows, cambia en el contenedor
      - /app/node_modules         # TRUCO: Evita que el node_modules local sobrescriba el del contenedor
    environment:
      - NODE_ENV=development      # Activa logs verbosos y herramientas de debug
      - CHOKIDAR_USEPOLLING=true  # Necesario para hot-reload en Windows/WSL
    command: npm run dev          # Usa nodemon para reiniciar al detectar cambios
    ports:
      - "3000:3000"
      - "9229:9229"               # Puerto para conectar el Debugger de VS Code
```

**Puntos Clave Dev:**
- **Bind Mounts**: La clave del desarrollo. Sin esto, tendrías que reconstruir la imagen (`docker build`) con cada cambio de coma.
- **Puertos Extra**: Exponemos puertos de debug y bases de datos directamente para usar herramientas como MySQL Workbench o Postman.

### 2. Entorno de Producción (`docker-compose.prod.yml`)

El objetivo es un sistema robusto y seguro.

```yaml
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod # Dockerfile optimizado (Multi-stage)
    # NO HAY VOLUMES DE CÓDIGO: El código vive DENTRO de la imagen inmutable
    environment:
      - NODE_ENV=production       # Desactiva features de debug, mejora performance
    restart: always               # Política de reinicio agresiva para alta disponibilidad
    deploy:
      resources:                  # LÍMITES: Evita que un servicio tumbe el servidor
        limits:
          cpus: '1'
          memory: 512M
      replicas: 2                 # ESCALADO: Corre 2 copias del backend para balanceo
```

**Puntos Clave Prod:**
- **Inmutabilidad**: No montamos código. La imagen que testeas es la que corre. Si quieres cambiar código, construyes una nueva imagen.
- **Seguridad**:
  - No se exponen puertos de BD al exterior.
  - Redes internas.
  - Usuario no-root en el Dockerfile.
- **Resiliencia**: `restart: always` y healthchecks aseguran que el servicio se recupere de fallos.

---

## 🐳 Análisis de Dockerfiles

### Dockerfile.dev
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install           # Instala TODAS las dependencias (incluyendo devDependencies)
COPY . .
CMD ["npm", "run", "dev"] # Usa nodemon
```

### Dockerfile.prod (Multi-stage Build)
```dockerfile
# Etapa 1: Builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production # Instala SOLO dependencias necesarias

# Etapa 2: Runner (Imagen final limpia)
FROM node:18-alpine
USER nodejs                  # Seguridad: No correr como root
COPY --from=builder /app/node_modules ./node_modules
COPY . .
CMD ["node", "server.js"]    # Ejecuta directamente node (más ligero)
```
**Resultado**: La imagen de producción es mucho más pequeña y segura porque no tiene compiladores, herramientas de test ni código innecesario.

## 🚀 Cómo Usar

**Para programar (Dev):**
```bash
docker-compose -f docker-compose.dev.yml up
# Ahora edita un archivo en tu editor y mira la consola: se reinicia solo!
```

**Para desplegar (Simulación Prod):**
```bash
docker-compose -f docker-compose.prod.yml up -d
# Esto simula cómo correrá en el servidor real.
```
