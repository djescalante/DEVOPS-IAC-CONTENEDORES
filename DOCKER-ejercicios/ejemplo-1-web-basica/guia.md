# 📘 Guía Detallada: Aplicación Web Básica

## 🎯 Descripción del Proyecto
Este ejemplo implementa una arquitectura clásica de **3 capas** (Frontend, Backend, Base de Datos) utilizando Docker. Es el punto de partida ideal para entender cómo orquestar múltiples contenedores que dependen entre sí.

### 🏗️ Arquitectura
- **Frontend**: Servidor Nginx que entrega archivos estáticos (HTML, CSS, JS) y actúa como proxy reverso.
- **Backend**: API REST construida con Node.js y Express.
- **Base de Datos**: MySQL 8.0 para persistencia de datos.

---

## 🐳 Análisis de `docker-compose.yml`

A continuación, explicamos línea por línea la configuración del archivo `docker-compose.yml`.

### 1. Versión y Servicios
```yaml
version: '3.8'  # Versión del formato de archivo Compose
services:       # Definición de los contenedores que vamos a correr
```

### 2. Servicio Frontend (Nginx)
```yaml
  frontend:
    image: nginx:alpine           # Usamos una imagen ligera de Nginx (Alpine Linux)
    container_name: web-frontend  # Nombre fijo para fácil identificación
    ports:
      - "80:80"                   # Mapeo de puertos: Host:Contenedor
                                  # Accedemos en localhost:80 -> Nginx escucha en 80
    volumes:
      - ./frontend:/usr/share/nginx/html:ro  # Montamos el código fuente en el contenedor
                                             # :ro significa "read-only" (seguridad)
      - ./nginx.conf:/etc/nginx/nginx.conf:ro # Configuración personalizada de Nginx
    networks:
      - app-network               # Conectamos a la red personalizada
    depends_on:
      - backend                   # Inicia solo después de que el backend exista
    restart: unless-stopped       # Reinicia automáticamente si falla (excepto si lo paramos manual)
    healthcheck:                  # Verificación de salud
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost"]
      interval: 30s               # Chequear cada 30s
      timeout: 10s                # Tiempo máximo de espera
      retries: 3                  # Reintentos antes de marcar como "unhealthy"
```

### 3. Servicio Backend (Node.js)
```yaml
  backend:
    build:
      context: ./backend          # Construir imagen desde este directorio
      dockerfile: Dockerfile      # Usando este archivo Dockerfile
    container_name: web-backend
    ports:
      - "3000:3000"               # Exponemos el puerto 3000
    environment:                  # Variables de entorno para la aplicación
      - NODE_ENV=production
      - DB_HOST=database          # IMPORTANTE: Usamos el nombre del servicio 'database' como host
      - DB_PORT=3306
      - DB_USER=appuser
      - DB_PASSWORD=securepassword
      - DB_NAME=appdb
    volumes:
      - ./backend/logs:/app/logs  # Persistencia de logs fuera del contenedor
    networks:
      - app-network
    depends_on:
      database:
        condition: service_healthy # Espera a que la BD esté REALMENTE lista, no solo iniciada
    deploy:                       # Límites de recursos (Buenas prácticas)
      resources:
        limits:
          cpus: '1'               # Máximo 1 CPU
          memory: 512M            # Máximo 512MB RAM
```

### 4. Servicio Base de Datos (MySQL)
```yaml
  database:
    image: mysql:8.0
    container_name: web-database
    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword  # Contraseña root (obligatoria)
      - MYSQL_DATABASE=appdb              # Crea esta BD al iniciar
      - MYSQL_USER=appuser                # Crea este usuario
      - MYSQL_PASSWORD=securepassword     # Con esta contraseña
    volumes:
      - mysql-data:/var/lib/mysql         # Volumen NOMBRADO para persistencia de datos
                                          # Si borras el contenedor, los datos sobreviven aquí
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql:ro # Script inicial
    networks:
      - app-network
    healthcheck:                          # Vital para que el backend sepa cuándo conectar
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-prootpassword"]
```

### 5. Redes y Volúmenes
```yaml
networks:
  app-network:
    driver: bridge                # Red tipo puente (estándar para comunicar contenedores en un host)

volumes:
  mysql-data:
    driver: local                 # Volumen local gestionado por Docker
```

---

## 🔑 Conceptos Clave Aprendidos

1. **Comunicación entre Contenedores**:
   - Los contenedores se hablan usando el **nombre del servicio** como hostname.
   - Ejemplo: El backend conecta a `database:3306`, no a `localhost` ni a una IP fija.

2. **Persistencia**:
   - **Bind Mounts** (`./frontend:/...`): Espejan una carpeta de tu PC. Útil para código y configuración.
   - **Named Volumes** (`mysql-data:/...`): Almacenamiento gestionado por Docker. Útil para bases de datos donde no necesitas ver los archivos directamente.

3. **Orden de Inicio**:
   - `depends_on` define el orden de arranque.
   - `condition: service_healthy` es crucial para bases de datos, asegurando que el servicio dependiente espere hasta que la BD acepte conexiones.

4. **Salud del Contenedor**:
   - `healthcheck` permite a Docker saber si tu aplicación funciona correctamente, no solo si el proceso está corriendo.

## 🚀 Cómo Probar
1. **Iniciar**: `docker-compose up -d`
2. **Verificar**: `docker-compose ps` (Todos deben estar "Up" y "healthy")
3. **Logs**: `docker-compose logs -f backend` (Para ver si conectó a la BD)
4. **Navegador**: Abrir `http://localhost`
