# 🐳 Ejemplos de Infraestructura con Docker

Colección de ejemplos de arquitecturas de aplicaciones web con Docker, implementando buenas prácticas y patrones modernos.

## 📚 Índice de Ejemplos

### [Ejemplo 1: Aplicación Web Básica](./ejemplo-1-web-basica/)
**Arquitectura**: Frontend (Nginx) + Backend (Node.js) + MySQL

```
Frontend (Nginx) → Backend (Node.js) → MySQL
     ↓                  ↓                ↓
  Port 80           Port 3000        Port 3306
```

**Características**:
- ✅ Separación de servicios en 3 contenedores
- ✅ Red bridge personalizada
- ✅ Volúmenes para persistencia
- ✅ Health checks
- ✅ Variables de entorno
- ✅ Interfaz web funcional

**Ideal para**: Aprender conceptos básicos de Docker Compose

---

### [Ejemplo 2: Arquitectura de Microservicios](./ejemplo-2-microservicios/)
**Arquitectura**: Nginx + Frontend + API Gateway + Microservicios + Múltiples BD

```
                    Nginx (LB)
                        ↓
        ┌───────────────┼───────────────┐
        ↓               ↓               ↓
    Frontend      API Gateway      Auth Service
                        ↓
        ┌───────────────┼───────────────┐
        ↓               ↓               ↓
  Users Service   Products Service   Redis
        ↓               ↓
      MySQL          MongoDB
```

**Características**:
- ✅ Múltiples microservicios independientes
- ✅ API Gateway con rate limiting
- ✅ Caché distribuido (Redis)
- ✅ Múltiples bases de datos (MySQL + MongoDB)
- ✅ 3 redes separadas (public, app, db)
- ✅ Service discovery
- ✅ Escalabilidad horizontal

**Ideal para**: Arquitecturas empresariales y sistemas distribuidos

---

### [Ejemplo 3: Desarrollo vs Producción](./ejemplo-3-dev-vs-prod/)
**Arquitectura**: Comparación de configuraciones para diferentes entornos

**Desarrollo**:
- Volume mounts para hot reload
- Puertos expuestos para debugging
- Herramientas de desarrollo (Adminer)
- Logs verbosos

**Producción**:
- Imágenes optimizadas
- Redes internas
- SSL/TLS
- Backups automatizados
- Límites de recursos
- Réplicas de servicios

**Ideal para**: Entender diferencias entre entornos y CI/CD

---

## 📊 Diagramas de Arquitectura

### [Diagramas de Flujo](./DIAGRAMAS-FLUJO.md)
- Flujo de peticiones HTTP
- Escalabilidad horizontal
- Patrón Circuit Breaker
- Service mesh

---

## 📖 Documentación

### [Buenas Prácticas](./BUENAS-PRACTICAS.md)
Guía completa de buenas prácticas incluyendo:
- Diseño de contenedores
- Seguridad
- Redes
- Volúmenes
- Health checks
- Logging
- Optimización de imágenes
- Monitoreo

---

## 🚀 Inicio Rápido

### Ejemplo 1 - Aplicación Web Básica
```bash
cd ejemplo-1-web-basica
docker-compose up -d
```
Acceder a: http://localhost

### Ejemplo 2 - Microservicios
```bash
cd ejemplo-2-microservicios
docker-compose up -d
```
Acceder a: http://localhost:4000

### Ejemplo 3 - Desarrollo
```bash
cd ejemplo-3-dev-vs-prod
docker-compose -f docker-compose.dev.yml up
```

### Ejemplo 3 - Producción
```bash
cd ejemplo-3-dev-vs-prod
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📋 Comparación de Ejemplos

| Característica | Ejemplo 1 | Ejemplo 2 | Ejemplo 3 |
|---------------|-----------|-----------|-----------|
| **Complejidad** | Básica | Avanzada | Media |
| **Servicios** | 3 | 8+ | 3-4 |
| **Redes** | 1 | 3 | 1-3 |
| **Bases de Datos** | MySQL | MySQL + MongoDB | MySQL |
| **Caché** | No | Redis | Opcional |
| **Load Balancer** | No | Nginx | Nginx (prod) |
| **Microservicios** | No | Sí | No |
| **Entornos** | Único | Producción | Dev + Prod |

---

## 🛠️ Comandos Útiles

### Ver logs
```bash
docker-compose logs -f [servicio]
```

### Reconstruir imágenes
```bash
docker-compose build --no-cache
```

### Escalar servicios
```bash
docker-compose up -d --scale backend=3
```

### Ver estado de servicios
```bash
docker-compose ps
```

### Detener y limpiar
```bash
docker-compose down -v
```

### Ejecutar comandos en contenedor
```bash
docker-compose exec [servicio] sh
```

---

## 🔧 Requisitos

- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB RAM mínimo (8GB recomendado para Ejemplo 2)
- Puertos disponibles: 80, 3000, 3306, 4000-4003, 8080

---

## 📝 Estructura de Archivos

```
DOCKER/
├── README.md (este archivo)
├── BUENAS-PRACTICAS.md
├── DIAGRAMAS-FLUJO.md
│
├── ejemplo-1-web-basica/
│   ├── README.md
│   ├── docker-compose.yml
│   ├── nginx.conf
│   ├── .env.example
│   ├── frontend/
│   │   ├── index.html
│   │   ├── styles.css
│   │   └── app.js
│   ├── backend/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── server.js
│   └── database/
│       └── init.sql
│
├── ejemplo-2-microservicios/
│   ├── README.md
│   ├── docker-compose.yml
│   ├── nginx/
│   ├── frontend/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── users-service/
│   └── products-service/
│
└── ejemplo-3-dev-vs-prod/
    ├── README.md
    ├── docker-compose.dev.yml
    ├── docker-compose.prod.yml
    ├── frontend/
    ├── backend/
    └── database/
```

---

## 🎯 Casos de Uso

### Ejemplo 1 - Usar cuando:
- Estás aprendiendo Docker
- Necesitas una aplicación monolítica simple
- Proyecto pequeño o MVP
- Equipo pequeño

### Ejemplo 2 - Usar cuando:
- Aplicación empresarial
- Necesitas escalabilidad
- Múltiples equipos trabajando
- Diferentes tecnologías por servicio
- Alta disponibilidad requerida

### Ejemplo 3 - Usar cuando:
- Necesitas configuraciones diferentes por entorno
- Implementando CI/CD
- Optimizando para producción
- Debugging en desarrollo

---

## 🔒 Seguridad

**IMPORTANTE**: Los ejemplos usan contraseñas de demostración. En producción:

1. Usa variables de entorno desde archivos `.env` (no versionados)
2. Implementa Docker Secrets
3. Usa certificados SSL/TLS
4. Configura firewalls
5. Actualiza imágenes regularmente
6. Escanea vulnerabilidades con `docker scan`

---

## 📚 Recursos Adicionales

- [Documentación oficial de Docker](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Best Practices for Writing Dockerfiles](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Security](https://docs.docker.com/engine/security/)

---

## 🤝 Contribuciones

Estos ejemplos son educativos. Siéntete libre de:
- Modificarlos según tus necesidades
- Agregar nuevos servicios
- Experimentar con diferentes configuraciones
- Compartir mejoras

---

## 📄 Licencia

Ejemplos educativos de uso libre.

---

## ✨ Características Destacadas

### Ejemplo 1
- 🎨 Interfaz web moderna con gradientes
- 📊 Dashboard con estadísticas en tiempo real
- ➕ Formulario para agregar usuarios
- 🔄 Actualización automática de datos
- 🎯 API REST completa

### Ejemplo 2
- 🚀 API Gateway con rate limiting
- 🔐 Servicio de autenticación JWT
- 💾 Caché distribuido con Redis
- 📦 Múltiples bases de datos
- 🔄 Service discovery automático

### Ejemplo 3
- 🛠️ Hot reload en desarrollo
- 🔒 SSL/TLS en producción
- 📦 Backups automatizados
- 📊 Herramientas de administración
- ⚡ Optimizaciones de producción

---

**¡Feliz Dockerización! 🐳**
