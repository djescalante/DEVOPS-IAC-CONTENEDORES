# 📘 Guía Detallada: Arquitectura de Microservicios

## 🎯 Descripción del Proyecto
Este ejemplo demuestra una arquitectura avanzada de **Microservicios**. En lugar de una sola aplicación monolítica, tenemos múltiples servicios pequeños y especializados que se comunican entre sí.

### 🏗️ Arquitectura
- **API Gateway**: Punto de entrada único. Maneja enrutamiento, autenticación y rate limiting.
- **Microservicios**:
  - **Auth Service**: Maneja login y tokens JWT.
  - **Users Service**: CRUD de usuarios (MySQL).
  - **Products Service**: CRUD de productos (MongoDB).
- **Capa de Datos**: MySQL, MongoDB y Redis (Caché).

---

## 🐳 Análisis de `docker-compose.yml`

Este archivo es más complejo debido a las múltiples redes y dependencias.

### 1. Redes (Networking Avanzado)
En este ejemplo usamos **Segmentación de Red** para seguridad:

```yaml
networks:
  public-network:  # Red pública: Tráfico externo -> Nginx -> Gateway
    driver: bridge
  app-network:     # Red de aplicación: Gateway <-> Microservicios
    driver: bridge
    internal: true # ¡IMPORTANTE! Sin acceso a internet, solo interna
  db-network:      # Red de datos: Microservicios <-> Bases de Datos
    driver: bridge
    internal: true # Máxima seguridad, solo accesible por servicios autorizados
```

### 2. API Gateway (El Director de Orquesta)
```yaml
  api-gateway:
    build:
      context: ./api-gateway
    ports:
      - "4000:4000"           # Puerto expuesto al mundo (o al Nginx)
    environment:
      - AUTH_SERVICE_URL=http://auth-service:4001     # Service Discovery por nombre DNS
      - USERS_SERVICE_URL=http://users-service:4002
      - PRODUCTS_SERVICE_URL=http://products-service:4003
      - REDIS_HOST=redis
    networks:
      - public-network        # Recibe tráfico del exterior
      - app-network           # Habla con los microservicios
```
**Nota**: El Gateway es el único componente (además de Nginx) que conecta la red pública con la privada. Actúa como un puente seguro.

### 3. Microservicios (Ej: Users Service)
```yaml
  users-service:
    container_name: users-service
    environment:
      - DB_HOST=mysql         # Conecta a la BD
    networks:
      - app-network           # Recibe peticiones del Gateway
      - db-network            # Conecta a la Base de Datos
    depends_on:
      mysql:
        condition: service_healthy
```
**Seguridad**: Este servicio NO tiene puertos expuestos (`ports`) al host. Solo es accesible dentro de la red Docker.

### 4. Bases de Datos Heterogéneas
Este proyecto usa persistencia políglota (usar la mejor BD para cada tarea):

- **MySQL**: Para datos relacionales (Usuarios).
- **MongoDB**: Para datos flexibles/documentos (Productos).
- **Redis**: Para caché de alta velocidad y sesiones.

```yaml
  redis:
    image: redis:alpine
    networks:
      - app-network           # Accesible por Gateway y Auth Service
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
```

---

## 🔑 Conceptos Clave Aprendidos

1. **Service Discovery**:
   - No configuramos IPs. Docker DNS resuelve `http://users-service` a la IP interna correcta automáticamente.

2. **Aislamiento de Red**:
   - La base de datos está en `db-network`.
   - El frontend está en `public-network`.
   - **El frontend NO puede llegar a la base de datos directamente**. Esto previene ataques si el frontend es comprometido.

3. **Escalabilidad**:
   - Podrías escalar un servicio específico: `docker-compose up -d --scale users-service=3`.
   - El Gateway necesitaría un balanceador de carga interno (o configuración extra) para aprovechar esto, pero la infraestructura Docker ya lo soporta.

4. **Internal Networks**:
   - `internal: true` deshabilita el acceso a internet saliente y entrante para esa red. Es una capa extra de seguridad para tus datos.

## 🚀 Flujo de una Petición
1. **Cliente** llama a `POST /api/auth/login`.
2. **Nginx** recibe y pasa a **API Gateway**.
3. **API Gateway** enruta a **Auth Service**.
4. **Auth Service** verifica en **MySQL** (vía Users Service) y genera token.
5. Token se guarda en **Redis**.
6. Respuesta vuelve por la cadena inversa.
