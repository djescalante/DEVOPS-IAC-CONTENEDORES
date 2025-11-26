# 🎨 Diagramas Visuales de Arquitectura Docker

## Diagrama 1: Aplicación Web de 3 Capas (Ejemplo 1)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                        🌐 INTERNET / USUARIO                                │
│                                                                             │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   │ HTTP Request (Port 80)
                                   │
┌──────────────────────────────────▼──────────────────────────────────────────┐
│                          DOCKER HOST                                        │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    🌐 Network: app-network                            │  │
│  │                         (Bridge Driver)                               │  │
│  │                                                                       │  │
│  │  ┌──────────────────────────────────────────────────────────────┐     │  │
│  │  │  📦 Container: web-frontend                                  │     │  │
│  │  │  ┌────────────────────────────────────────────────────────┐  │     │  │
│  │  │  │  🖥️  Nginx Alpine                                      │  │     │  │
│  │  │  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  │     │  │
│  │  │  │  • Sirve archivos estáticos (HTML, CSS, JS)            │  │     │  │
│  │  │  │  • Proxy reverso para API                              │  │     │  │
│  │  │  │  • Compresión Gzip                                     │  │     │  │
│  │  │  │  • Security headers                                    │  │     │  │
│  │  │  │                                                        │  │     │  │
│  │  │  │  📍 Port: 80 (exposed)                                 │  │     │  │
│  │  │  │  📂 Volume: ./frontend → /usr/share/nginx/html         │  │     │  │
│  │  │  │  📂 Volume: ./nginx.conf → /etc/nginx/nginx.conf       │  │     │  │
│  │  │  └────────────────────────────────────────────────────────┘  │     │  │
│  │  └────────────────────────┬─────────────────────────────────────┘     │  │
│  │                           │                                           │  │
│  │                           │ Proxy: /api/* → backend:3000              │  │
│  │                           │                                           │  │
│  │  ┌────────────────────────▼─────────────────────────────────────┐     │  │
│  │  │  📦 Container: web-backend                                   │     │  │
│  │  │  ┌────────────────────────────────────────────────────────┐  │     │  │
│  │  │  │  ⚙️  Node.js 18 Alpine + Express                       │  │     │  │
│  │  │  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  │     │  │
│  │  │  │  • API REST endpoints                                  │  │     │  │
│  │  │  │  • Lógica de negocio                                   │  │     │  │
│  │  │  │  • Conexión a MySQL                                    │  │     │  │
│  │  │  │  • Health checks                                       │  │     │  │
│  │  │  │                                                        │  │     │  │
│  │  │  │  📍 Port: 3000 (internal)                              │  │     │  │
│  │  │  │  📂 Volume: ./backend/logs → /app/logs                 │  │     │  │
│  │  │  │  🔧 Multi-stage build                                  │  │     │  │
│  │  │  │  👤 Non-root user: nodejs                              │  │     │  │
│  │  │  │                                                        │  │     │  │
│  │  │  │  Endpoints:                                            │  │     │  │
│  │  │  │  • GET  /api/users                                     │  │     │  │
│  │  │  │  • POST /api/users                                     │  │     │  │
│  │  │  │  • GET  /api/stats                                     │  │     │  │
│  │  │  │  • GET  /health                                        │  │     │  │
│  │  │  └────────────────────────────────────────────────────────┘  │     │  │
│  │  └────────────────────────┬─────────────────────────────────────┘     │  │
│  │                           │                                           │  │
│  │                           │ SQL Queries (Port 3306)                   │  │
│  │                           │                                           │  │
│  │  ┌────────────────────────▼─────────────────────────────────────┐     │  │
│  │  │  📦 Container: web-database                                  │     │  │
│  │  │  ┌────────────────────────────────────────────────────────┐  │     │  │
│  │  │  │  🗄️  MySQL 8.0                                         │  │     │  │
│  │  │  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  │     │  │
│  │  │  │  • Base de datos relacional                            │  │     │  │
│  │  │  │  • Tablas: users, activity_logs                        │  │     │  │
│  │  │  │  • Datos de ejemplo precargados                        │  │     │  │
│  │  │  │  • Health checks con mysqladmin                        │  │     │  │
│  │  │  │                                                        │  │     │  │
│  │  │  │  📍 Port: 3306 (internal)                              │  │     │  │
│  │  │  │  💾 Volume: mysql-data → /var/lib/mysql                │  │     │  │
│  │  │  │  📜 Init script: init.sql                              │  │     │  │
│  │  │  │                                                        │  │     │  │
│  │  │  │  🔒 Credentials:                                       │  │     │  │
│  │  │  │     DB: appdb                                          │  │     │  │
│  │  │  │     User: appuser                                      │  │     │  │
│  │  │  └────────────────────────────────────────────────────────┘  │     │  │
│  │  └──────────────────────────────────────────────────────────────┘     │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  💾 Named Volumes                                                     │  │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  │
│  │  • mysql-data: Persistencia de datos de MySQL                         │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

📊 Flujo de Datos:
1. Usuario accede a http://localhost
2. Nginx sirve index.html, styles.css, app.js
3. JavaScript hace fetch a /api/users
4. Nginx proxy la petición a backend:3000
5. Node.js consulta MySQL
6. MySQL retorna datos
7. Node.js formatea respuesta JSON
8. Nginx retorna al cliente
9. JavaScript renderiza en el DOM
```

## Diagrama 2: Arquitectura de Microservicios (Ejemplo 2)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          🌐 INTERNET / CLIENTE                              │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   │ HTTPS (443) / HTTP (80)
                                   │
┌──────────────────────────────────▼──────────────────────────────────────────┐
│                            DOCKER HOST                                      │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                  🌐 Network: public-network                           │  │
│  │                                                                       │  │
│  │  ┌──────────────────────────────────────────────────────────────┐     │  │
│  │  │  📦 nginx-proxy                                              │     │  │
│  │  │  ┌────────────────────────────────────────────────────────┐  │     │  │
│  │  │  │  🔒 Nginx + SSL/TLS                                    │  │     │  │
│  │  │  │  • Load Balancer                                       │  │     │  │
│  │  │  │  • Reverse Proxy                                       │  │     │  │
│  │  │  │  • SSL Termination                                     │  │     │  │
│  │  │  │  📍 Ports: 80, 443                                     │  │     │  │
│  │  │  └────────────────────────────────────────────────────────┘  │     │  │
│  │  └────────────────┬───────────────────┬─────────────────────────┘     │  │
│  │                   │                   │                               │  │
│  │         ┌─────────▼─────────┐  ┌──────▼──────────┐                    │  │
│  │         │  frontend-app     │  │  api-gateway    │                    │  │
│  │         │  React SPA        │  │  Node.js        │                    │  │
│  │         │  Port: 3000       │  │  Port: 4000     │                    │  │
│  │         └───────────────────┘  └─────────────────┘                    │  │
│  └───────────────────────────────────────┬───────────────────────────────┘  │
│                                          │                                  │
│  ┌───────────────────────────────────────▼───────────────────────────────┐  │
│  │                  🌐 Network: app-network (internal)                   │  │
│  │                                                                       │  │
│  │         ┌────────────────┬────────────────┬────────────────┐          │  │
│  │         │                │                │                │          │  │
│  │    ┌────▼─────┐   ┌──────▼──────┐  ┌──────▼──────┐  ┌─────▼─────┐     │  │
│  │    │  auth-   │   │   users-    │  │  products-  │  │   redis   │     │  │
│  │    │ service  │   │  service    │  │   service   │  │   cache   │     │  │
│  │    │ Port:4001│   │  Port:4002  │  │  Port:4003  │  │ Port:6379 │     │  │
│  │    │          │   │             │  │             │  │           │     │  │
│  │    │ • JWT    │   │ • CRUD      │  │ • CRUD      │  │ • Session │     │  │
│  │    │ • Login  │   │ • Users     │  │ • Products  │  │ • Cache   │     │  │
│  │    │ • Verify │   │             │  │             │  │ • Pub/Sub │     │  │
│  │    └──────────┘   └──────┬──────┘  └──────┬──────┘  └───────────┘     │  │
│  │                          │                │                           │  │
│  └──────────────────────────┼────────────────┼─────────────────────────┘    │
│                             │                │                              │
│  ┌──────────────────────────▼────────────────▼─────────────────────────┐    │
│  │                  🌐 Network: db-network (internal)                   │    │
│  │                                                                      │    │
│  │              ┌──────────────────┐      ┌──────────────────┐          │    │
│  │              │                  │      │                  │          │    │
│  │         ┌────▼─────┐       ┌────▼──────▼────┐                        │    │
│  │         │  mysql   │       │    mongodb      │                        │    │
│  │         │  Port:   │       │    Port:        │                        │    │
│  │         │  3306    │       │    27017        │                        │    │
│  │         │          │       │                 │                        │    │
│  │         │ • Users  │       │  • Products     │                        │    │
│  │         │   DB     │       │    (Documents)  │                        │    │
│  │         └────┬─────┘       └────┬────────────┘                        │    │
│  │              │                  │                                     │    │
│  └──────────────┼──────────────────┼─────────────────────────────────────┘    │
│                 │                  │                                          │
│  ┌──────────────▼──────────────────▼─────────────────────────────────────┐    │
│  │  💾 Volumes                                                           │    │
│  │  • mysql-data                                                         │    │
│  │  • mongo-data                                                         │    │
│  │  • redis-data                                                         │    │
│  └───────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

🔄 Flujo de Autenticación:
1. Cliente → POST /api/auth/login → API Gateway
2. API Gateway → auth-service
3. auth-service verifica credenciales
4. auth-service genera JWT
5. JWT almacenado en Redis
6. Retorna token al cliente

🔄 Flujo de Petición Protegida:
1. Cliente → GET /api/users (con token)
2. API Gateway verifica token con auth-service
3. API Gateway consulta caché Redis
4. Si no hay caché: users-service → MySQL
5. Resultado guardado en Redis (TTL: 5min)
6. Respuesta al cliente
```

## Diagrama 3: Comparación Dev vs Prod (Ejemplo 3)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DESARROLLO                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🎯 Objetivo: Facilitar desarrollo y debugging                              │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  📦 Frontend Container                                                │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │  🔥 Hot Module Replacement (HMR)                                │  │  │
│  │  │  📂 Volume: ./src → /app/src (live reload)                      │  │  │
│  │  │  📍 Port: 3000 (EXPOSED)                                        │  │  │
│  │  │  🐛 Source maps enabled                                         │  │  │
│  │  │  ⚡ Dev server (webpack-dev-server)                             │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  📦 Backend Container                                                 │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │  🔄 Nodemon (auto-restart)                                      │  │  │
│  │  │  📂 Volume: ./src → /app/src                                    │  │  │
│  │  │  📍 Port: 4000 (EXPOSED)                                        │  │  │
│  │  │  📍 Port: 9229 (Debug port EXPOSED)                             │  │  │
│  │  │  📝 LOG_LEVEL=debug                                             │  │  │
│  │  │  🐛 Inspector enabled                                           │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  📦 Database Container                                                │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │  📍 Port: 3306 (EXPOSED para herramientas externas)             │  │  │
│  │  │  📊 Seed data cargada                                           │  │  │
│  │  │  🔍 Query logs enabled                                          │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  📦 Adminer (DB Admin Tool)                                           │  │
│  │  📍 Port: 8080 (EXPOSED)                                              │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ✅ Ventajas:                                                               │
│  • Cambios en código reflejados inmediatamente                              │
│  • Debugging fácil                                                          │
│  • Acceso directo a servicios                                               │
│  • Herramientas de desarrollo incluidas                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         PRODUCCIÓN                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🎯 Objetivo: Máximo rendimiento, seguridad y disponibilidad                │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  📦 Nginx Container                                                   │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │  🔒 SSL/TLS Certificates                                        │  │  │
│  │  │  📍 Ports: 80 (redirect), 443 (HTTPS)                           │  │  │
│  │  │  🗜️  Gzip compression                                            │  │  │
│  │  │  🛡️  Security headers                                            │  │  │
│  │  │  ⚡ Static file caching                                          │  │  │
│  │  │  🔄 Load balancing                                              │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  📦 Frontend Container                                                │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │  📦 Built image (NO volume mounts)                              │  │  │
│  │  │  🗜️  Minified & optimized                                        │  │  │
│  │  │  🚫 NO source maps                                              │  │  │
│  │  │  ⚡ Production build                                            │  │  │
│  │  │  🔒 Internal network only                                       │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  📦 Backend Container (x2 replicas)                                   │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │  📦 Built image (NO volume mounts)                              │  │  │
│  │  │  🔒 Internal network only                                       │  │  │
│  │  │  📝 LOG_LEVEL=info (structured JSON)                            │  │  │
│  │  │  ❤️  Health checks                                              │  │  │
│  │  │  🔄 Auto-restart                                                │  │  │
│  │  │  💾 Resource limits (CPU: 1, RAM: 512M)                         │  │  │
│  │  │  🚫 NO debug ports                                              │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  📦 Database Container                                                │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │  🔒 Internal network only (NO exposed ports)                    │  │  │
│  │  │  💾 Persistent volumes                                          │  │  │
│  │  │  🔄 Automated backups                                           │  │  │
│  │  │  💾 Resource limits (CPU: 2, RAM: 2G)                           │  │  │
│  │  │  ❤️  Health checks                                              │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  📦 Backup Container                                                  │  │
│  │  🔄 Automated MySQL backups                                           │  │
│  │  📅 Scheduled daily                                                   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ✅ Ventajas:                                                               │
│  • Máxima seguridad (redes internas, SSL)                                   │
│  • Alto rendimiento (optimizaciones, caché)                                 │
│  • Alta disponibilidad (réplicas, health checks)                            │
│  • Backups automatizados                                                    │
│  • Monitoreo y logging estructurado                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Leyenda de Símbolos

- 🌐 = Red / Network
- 📦 = Contenedor / Container
- 🖥️ = Frontend / Web Server
- ⚙️ = Backend / API
- 🗄️ = Base de Datos / Database
- 💾 = Volumen / Almacenamiento
- 📍 = Puerto / Port
- 📂 = Volume Mount
- 🔒 = Seguridad / SSL
- 🔥 = Hot Reload
- 🐛 = Debug Mode
- ⚡ = Optimizado
- 🔄 = Auto-restart / Replicación
- ❤️ = Health Check
- 🛡️ = Security Headers
- 🗜️ = Compresión
- 👤 = Usuario
- 🔧 = Configuración
- 📊 = Estadísticas / Monitoreo
- 🚫 = Deshabilitado
- ✅ = Habilitado / Ventaja
