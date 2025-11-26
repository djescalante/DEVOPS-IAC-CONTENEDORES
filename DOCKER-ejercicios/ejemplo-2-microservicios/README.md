# Ejemplo 2: Arquitectura de Microservicios

## Arquitectura

```
┌────────────────────────────────────────────────────────────────────────┐
│                           Docker Host                                   │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │                    Public Network                                 │ │
│  │                                                                    │ │
│  │              ┌─────────────────────────┐                          │ │
│  │              │   Reverse Proxy/LB      │                          │ │
│  │              │      (Nginx)            │                          │ │
│  │              │     Port: 80, 443       │                          │ │
│  │              └──────────┬──────────────┘                          │ │
│  └─────────────────────────┼─────────────────────────────────────────┘ │
│                            │                                            │
│  ┌─────────────────────────┼─────────────────────────────────────────┐ │
│  │              Application Network                                  │ │
│  │                         │                                          │ │
│  │      ┌──────────────────┼──────────────────┐                      │ │
│  │      │                  │                  │                      │ │
│  │  ┌───▼────┐      ┌──────▼─────┐    ┌──────▼─────┐                │ │
│  │  │Frontend│      │   API      │    │   Auth     │                │ │
│  │  │ (SPA)  │      │  Gateway   │    │  Service   │                │ │
│  │  │React   │      │  Node.js   │    │  Node.js   │                │ │
│  │  └────────┘      └──────┬─────┘    └──────┬─────┘                │ │
│  │                         │                  │                      │ │
│  │                  ┌──────┴──────┬───────────┘                      │ │
│  │                  │             │                                  │ │
│  │           ┌──────▼─────┐ ┌────▼──────┐                           │ │
│  │           │   Users    │ │ Products  │                           │ │
│  │           │  Service   │ │  Service  │                           │ │
│  │           │  Node.js   │ │  Node.js  │                           │ │
│  │           └──────┬─────┘ └────┬──────┘                           │ │
│  └──────────────────┼────────────┼──────────────────────────────────┘ │
│                     │            │                                     │
│  ┌──────────────────┼────────────┼──────────────────────────────────┐ │
│  │              Database Network │                                   │ │
│  │                  │            │                                   │ │
│  │           ┌──────▼─────┐ ┌───▼───────┐      ┌────────────┐      │ │
│  │           │   MySQL    │ │  MongoDB  │      │   Redis    │      │ │
│  │           │  (Users)   │ │(Products) │      │  (Cache)   │      │ │
│  │           │ Port: 3306 │ │Port: 27017│      │Port: 6379  │      │ │
│  │           └────────────┘ └───────────┘      └────────────┘      │ │
│  │                 │               │                   │            │ │
│  │           ┌─────▼─────┐   ┌─────▼─────┐      ┌─────▼─────┐     │ │
│  │           │  Volume   │   │  Volume   │      │  Volume   │     │ │
│  │           │mysql-data │   │mongo-data │      │redis-data │     │ │
│  │           └───────────┘   └───────────┘      └───────────┘     │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## Servicios

### Frontend
- **Tecnología**: React SPA
- **Puerto**: 3000
- **Función**: Interfaz de usuario

### API Gateway
- **Tecnología**: Node.js/Express
- **Puerto**: 4000
- **Función**: Punto de entrada único, enrutamiento, rate limiting

### Auth Service
- **Tecnología**: Node.js/Express + JWT
- **Puerto**: 4001
- **Función**: Autenticación y autorización

### Users Service
- **Tecnología**: Node.js/Express
- **Puerto**: 4002
- **Base de Datos**: MySQL
- **Función**: Gestión de usuarios

### Products Service
- **Tecnología**: Node.js/Express
- **Puerto**: 4003
- **Base de Datos**: MongoDB
- **Función**: Gestión de productos

### Redis Cache
- **Función**: Caché distribuido, sesiones

## Redes Docker

1. **public-network**: Nginx ↔ Frontend/Gateway
2. **app-network**: Comunicación entre microservicios
3. **db-network**: Microservicios ↔ Bases de datos

## Buenas Prácticas Implementadas

1. ✅ **Separación de responsabilidades**: Cada servicio tiene una función específica
2. ✅ **API Gateway**: Punto de entrada único
3. ✅ **Múltiples redes**: Aislamiento de tráfico
4. ✅ **Bases de datos especializadas**: MySQL para datos relacionales, MongoDB para documentos
5. ✅ **Caché distribuido**: Redis para mejorar rendimiento
6. ✅ **Health checks**: Monitoreo de salud de servicios
7. ✅ **Escalabilidad horizontal**: Servicios independientes
8. ✅ **Service discovery**: Comunicación por nombres de servicio
9. ✅ **Logging centralizado**: Volúmenes para logs
10. ✅ **Secrets management**: Variables de entorno

## Uso

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs de un servicio específico
docker-compose logs -f api-gateway

# Escalar un servicio
docker-compose up -d --scale users-service=3

# Detener servicios
docker-compose down

# Reconstruir imágenes
docker-compose build --no-cache
```

## Endpoints

- Frontend: http://localhost
- API Gateway: http://localhost:4000
- Auth Service: http://localhost:4001 (interno)
- Users Service: http://localhost:4002 (interno)
- Products Service: http://localhost:4003 (interno)
