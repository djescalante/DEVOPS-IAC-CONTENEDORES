# 🌐 Redes en Docker

> 🔌 **Conectividad y comunicación entre contenedores**

---

## 📋 Tabla de Contenidos
- [Conceptos Básicos](#conceptos-básicos)
- [Tipos de Redes](#tipos-de-redes)
- [Gestión de Redes](#gestión-de-redes)
- [Conectar Contenedores](#conectar-contenedores)
- [DNS y Resolución de Nombres](#dns-y-resolución-de-nombres)
- [Casos de Uso](#casos-de-uso)
- [Troubleshooting](#troubleshooting)
- [Mejores Prácticas](#mejores-prácticas)

---

## 🎓 Conceptos Básicos

### Networking en Docker

Docker crea redes virtuales que permiten:
- ✅ Comunicación entre contenedores
- ✅ Aislamiento de tráfico
- ✅ Resolución DNS automática
- ✅ Publicación de puertos al host

```
┌─────────────────────────────────────────────────┐
│                  Docker Host                    │
│                                                  │
│  ┌────────────────────────────────────────┐    │
│  │         Red: app-network               │    │
│  │  ┌──────────┐        ┌──────────┐     │    │
│  │  │   Web    │◄──────►│   API    │     │    │
│  │  │  nginx   │        │  node    │     │    │
│  │  └────┬─────┘        └──────────┘     │    │
│  └───────┼──────────────────────────────── │   │
│          │                                      │
│          │ :80 (publicado)                      │
│          ▼                                      │
│    [ Internet ]                                 │
└─────────────────────────────────────────────────┘
```

### Conceptos clave

- **Bridge Network**: Red por defecto, para un solo host
- **Host Network**: Usa la red del host directamente
- **Overlay Network**: Para Docker Swarm (multi-host)
- **Macvlan**: Asigna MAC address a contenedores
- **None**: Sin red

---

## 🔌 Tipos de Redes

### 1. Bridge (Default)

La red por defecto para contenedores en un solo host.

```bash
# Docker crea red bridge por defecto
docker network ls
# NETWORK ID     NAME      DRIVER    SCOPE
# abcd1234       bridge    bridge    local
```

**Características:**
- ✅ Contenedores en la misma red pueden comunicarse
- ✅ Aislamiento de otras redes
- ✅ DNS automático con nombres de contenedor
- ❌ No recomendado para producción (usar bridge personalizada)

### 2. Host

El contenedor usa directamente la red del host.

```bash
docker run --network host nginx
```

**Características:**
- ✅ Máximo rendimiento (sin NAT)
- ✅ Acceso directo a puertos del host
- ❌ Sin aislamiento de red
- ❌ Conflictos de puerto posibles
- ⚠️ Solo funciona en Linux

**Cuándo usar:**
- Alto rendimiento requerido
- Necesitas acceso directo a interfaces del host

### 3. None

Contenedor sin red (completamente aislado).

```bash
docker run --network none alpine
```

**Características:**
- ✅ Máxima seguridad (sin conectividad)
- ✅ Útil para procesos que no necesitan red
- ❌ No puede comunicarse con nada

**Cuándo usar:**
- Procesamiento de datos local
- Máxima seguridad

### 4. Overlay

Para clusters Docker Swarm (multi-host).

```bash
docker network create --driver overlay mi-overlay
```

**Características:**
- ✅ Contenedores en diferentes hosts pueden comunicarse
- ✅ Encriptación opcional
- ✅ Para Docker Swarm
- ❌ Requiere key-value store

### 5. Macvlan

Asigna dirección MAC a contenedores.

```bash
docker network create -d macvlan \
  --subnet=192.168.1.0/24 \
  --gateway=192.168.1.1 \
  -o parent=eth0 \
  mi-macvlan
```

**Características:**
- ✅ Contenedor aparece como dispositivo físico en red
- ✅ Útil para aplicaciones legacy
- ❌ Requiere modo promiscuo en interfaz

---

## 🛠️ Gestión de Redes

### Crear redes

```bash
# Red bridge básica
docker network create mi-red

# Con driver específico
docker network create --driver bridge mi-red

# Con subnet personalizada
docker network create \
  --driver bridge \
  --subnet 172.20.0.0/16 \
  --gateway 172.20.0.1 \
  mi-red

# Con rango de IPs
docker network create \
  --driver bridge \
  --subnet 172.20.0.0/16 \
  --ip-range 172.20.10.0/24 \
  mi-red

# Con DNS personalizado
docker network create \
  --driver bridge \
  --opt com.docker.network.bridge.name=docker1 \
  --opt com.docker.network.driver.mtu=1450 \
  mi-red

# Con labels
docker network create \
  --label env=prod \
  --label app=web \
  mi-red
```

### Listar redes

```bash
# Todas las redes
docker network ls

# Con filtros
docker network ls --filter driver=bridge
docker network ls --filter label=env=prod
docker network ls --filter name=app

# Formato personalizado
docker network ls --format "table {{.Name}}\t{{.Driver}}\t{{.Scope}}"
```

### Inspeccionar redes

```bash
# Ver detalles completos
docker network inspect mi-red

# Ver contenedores conectados
docker network inspect mi-red --format '{{range .Containers}}{{.Name}} {{end}}'

# Ver subnet
docker network inspect mi-red --format '{{range .IPAM.Config}}{{.Subnet}}{{end}}'

# Ver gateway
docker network inspect mi-red --format '{{range .IPAM.Config}}{{.Gateway}}{{end}}'
```

**Salida ejemplo:**
```json
[
    {
        "Name": "mi-red",
        "Driver": "bridge",
        "Scope": "local",
        "IPAM": {
            "Config": [
                {
                    "Subnet": "172.20.0.0/16",
                    "Gateway": "172.20.0.1"
                }
            ]
        },
        "Containers": {
            "abc123": {
                "Name": "web-server",
                "IPv4Address": "172.20.0.2/16"
            }
        }
    }
]
```

### Eliminar redes

```bash
# Eliminar red específica
docker network rm mi-red

# Eliminar múltiples
docker network rm red1 red2 red3

# Eliminar redes sin usar
docker network prune

# Sin confirmación
docker network prune -f

# Con filtro
docker network prune --filter label=temp=true
```

---

## 🔗 Conectar Contenedores

### Conectar al crear

```bash
# Conectar a red al ejecutar
docker run -d --name web --network mi-red nginx

# Conectar a múltiples redes
docker run -d --name app \
  --network red1 \
  --network red2 \
  nginx
```

### Conectar/Desconectar después

```bash
# Conectar contenedor existente
docker network connect mi-red mi-contenedor

# Con IP estática
docker network connect --ip 172.20.0.10 mi-red mi-contenedor

# Con alias
docker network connect --alias api mi-red mi-contenedor

# Desconectar
docker network disconnect mi-red mi-contenedor

# Forzar desconexión
docker network disconnect -f mi-red mi-contenedor
```

### Publicar puertos

```bash
# Puerto específico: Host:Contenedor
docker run -d -p 8080:80 --network mi-red nginx

# Puerto aleatorio en host
docker run -d -p 80 --network mi-red nginx

# Múltiples puertos
docker run -d -p 8080:80 -p 8443:443 --network mi-red nginx

# Todos los puertos expuestos
docker run -d -P --network mi-red nginx

# IP específica del host
docker run -d -p 192.168.1.100:8080:80 --network mi-red nginx

# UDP
docker run -d -p 8080:80/udp --network mi-red nginx
```

### Ver puertos

```bash
# Ver puertos de un contenedor
docker port mi-contenedor

# Ver puerto específico
docker port mi-contenedor 80

# Salida:
# 80/tcp -> 0.0.0.0:8080
```

---

## 🏷️ DNS y Resolución de Nombres

### DNS automático

Docker proporciona DNS automático en redes personalizadas:

```bash
# Crear red
docker network create app-network

# Crear contenedores
docker run -d --name db --network app-network mysql
docker run -d --name api --network app-network node-app

# Desde 'api' puedes acceder a 'db' por nombre:
docker exec api ping db
# ✅ Funciona!
```

### Alias de red

```bash
# Conectar con alias
docker network connect --alias database mi-red mysql-container

# Ahora puedes acceder como 'database'
docker exec app ping database
```

### DNS personalizado

```bash
# DNS al crear contenedor
docker run -d \
  --dns 8.8.8.8 \
  --dns 8.8.4.4 \
  --dns-search ejemplo.com \
  nginx

# Agregar entrada al /etc/hosts
docker run -d \
  --add-host db.local:192.168.1.100 \
  --add-host cache.local:192.168.1.101 \
  nginx
```

### Link (deprecado, usar redes)

```bash
# ❌ Forma antigua (deprecada)
docker run -d --name db mysql
docker run -d --link db:database app

# ✅ Forma moderna
docker network create app-net
docker run -d --name db --network app-net mysql
docker run -d --name app --network app-net app-image
```

---

## 💼 Casos de Uso

### 1. Aplicación web con base de datos

```bash
# Crear red
docker network create app-network

# Base de datos
docker run -d \
  --name mysql-db \
  --network app-network \
  -e MYSQL_ROOT_PASSWORD=secreto \
  -e MYSQL_DATABASE=miapp \
  mysql:8.0

# API Backend
docker run -d \
  --name backend \
  --network app-network \
  -e DB_HOST=mysql-db \
  -e DB_NAME=miapp \
  mi-api:latest

# Frontend
docker run -d \
  --name frontend \
  --network app-network \
  -p 3000:3000 \
  -e API_URL=http://backend:8080 \
  mi-frontend:latest

# Nginx reverse proxy
docker run -d \
  --name nginx \
  --network app-network \
  -p 80:80 \
  -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro \
  nginx:alpine
```

### 2. Microservicios

```bash
# Red para servicios
docker network create microservices

# Servicio de usuarios
docker run -d \
  --name user-service \
  --network microservices \
  user-service:latest

# Servicio de productos
docker run -d \
  --name product-service \
  --network microservices \
  product-service:latest

# Servicio de pedidos (conecta con otros)
docker run -d \
  --name order-service \
  --network microservices \
  -e USER_SERVICE_URL=http://user-service:8080 \
  -e PRODUCT_SERVICE_URL=http://product-service:8080 \
  order-service:latest

# API Gateway (expuesto públicamente)
docker run -d \
  --name api-gateway \
  --network microservices \
  -p 80:80 \
  api-gateway:latest
```

### 3. Múltiples redes (aislamiento)

```bash
# Red frontend (pública)
docker network create frontend-net

# Red backend (privada)
docker network create backend-net

# Base de datos (solo backend)
docker run -d \
  --name db \
  --network backend-net \
  postgres:15

# API (ambas redes)
docker run -d \
  --name api \
  --network backend-net \
  my-api:latest

docker network connect frontend-net api

# Web (solo frontend)
docker run -d \
  --name web \
  --network frontend-net \
  -p 80:80 \
  nginx

# web puede hablar con api
# web NO puede hablar directamente con db
# api puede hablar con db
```

### 4. Red host para rendimiento

```bash
# Para aplicaciones que requieren máximo rendimiento
docker run -d \
  --name high-perf-app \
  --network host \
  -e PORT=8080 \
  my-app:latest

# App escucha directamente en puerto 8080 del host
curl localhost:8080
```

### 5. Contenedor aislado (procesamiento)

```bash
# Contenedor sin red para procesamiento de datos
docker run -d \
  --name data-processor \
  --network none \
  -v $(pwd)/data:/data \
  data-processor:latest
```

---

## 🔍 Troubleshooting

### Contenedores no se comunican

```bash
# 1. Verificar que están en la misma red
docker network inspect mi-red

# 2. Ver redes del contenedor
docker inspect contenedor --format '{{json .NetworkSettings.Networks}}'

# 3. Probar conectividad
docker exec contenedor1 ping contenedor2

# 4. Verificar DNS
docker exec contenedor1 nslookup contenedor2

# 5. Ver reglas de firewall
docker exec contenedor1 iptables -L
```

### Puerto no accesible

```bash
# 1. Verificar puerto publicado
docker ps
docker port contenedor

# 2. Verificar que app escucha en 0.0.0.0
docker exec contenedor netstat -tlnp

# 3. Probar desde host
curl localhost:puerto

# 4. Ver logs
docker logs contenedor

# 5. Firewall del host
sudo ufw status
sudo iptables -L
```

### Problemas de DNS

```bash
# 1. Verificar resolución DNS
docker exec contenedor nslookup google.com

# 2. Ver configuración DNS
docker exec contenedor cat /etc/resolv.conf

# 3. Usar DNS personalizado
docker run --dns 8.8.8.8 imagen

# 4. Verificar en red personalizada (bridge default no tiene DNS)
docker network create --driver bridge mi-red
```

### Ver tráfico de red

```bash
# Con tcpdump
docker run --rm --net container:contenedor \
  nicolaka/netshoot tcpdump -i any

# Con nmap
docker run --rm --net container:contenedor \
  nicolaka/netshoot nmap -p- localhost
```

### Reiniciar networking

```bash
# Reiniciar Docker
sudo systemctl restart docker

# Recrear red
docker network rm mi-red
docker network create mi-red

# Reconectar contenedores
docker network connect mi-red contenedor
```

---

## ✅ Mejores Prácticas

### 1. Usar redes personalizadas

```bash
# ❌ Malo: red bridge default
docker run -d nginx

# ✅ Bueno: red personalizada
docker network create app-net
docker run -d --network app-net nginx
```

**Por qué:**
- DNS automático
- Mejor aislamiento
- Control de subnet

### 2. Segmentar por función

```bash
# Red para frontend
docker network create frontend

# Red para backend
docker network create backend

# Red para datos
docker network create data

# API en frontend y backend
docker run -d --name api --network frontend my-api
docker network connect backend api
```

### 3. No exponer puertos innecesarios

```bash
# ❌ Malo: exponer base de datos
docker run -d -p 5432:5432 postgres

# ✅ Bueno: solo red interna
docker run -d --network backend postgres
```

### 4. Usar nombres descriptivos

```bash
# ✅ Buenos nombres
docker network create production-web
docker network create staging-api
docker network create dev-database
```

### 5. Documentar con labels

```bash
docker network create \
  --label env=production \
  --label tier=frontend \
  --label project=myapp \
  prod-web
```

### 6. Limitar conectividad

```bash
# Principio de mínimo privilegio
# Solo conectar lo necesario

# Base de datos solo con backend
docker run -d --network backend-only postgres

# Cache solo con API
docker run -d --network api-cache redis
```

### 7. Monitorear redes

```bash
# Ver uso de redes
docker network ls

# Ver contenedores por red
docker network inspect red --format '{{range .Containers}}{{.Name}} {{end}}'

# Limpiar redes no usadas
docker network prune
```

### 8. Usar Docker Compose para definir

```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    image: nginx
    networks:
      - frontend
  
  api:
    image: my-api
    networks:
      - frontend
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
    internal: true  # No acceso a internet
```

### 9. IPv6 si es necesario

```bash
docker network create \
  --ipv6 \
  --subnet 2001:db8:1::/64 \
  mi-red-ipv6
```

### 10. Seguridad

```bash
# Red interna (sin acceso a internet)
docker network create --internal secure-network

# Con encriptación (Swarm)
docker network create --opt encrypted overlay-secure
```

---

## 📊 Comandos de Diagnóstico

```bash
# Ver todas las redes
docker network ls

# Detalles de red
docker network inspect mi-red

# Ver redes de un contenedor
docker inspect contenedor --format '{{json .NetworkSettings.Networks}}'

# Ver IP de contenedor
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' contenedor

# Ver puertos
docker port contenedor

# Probar conectividad
docker exec contenedor ping otro-contenedor
docker exec contenedor curl http://otro-contenedor:80

# Ver interfaces de red
docker exec contenedor ip addr
docker exec contenedor ifconfig

# Ver tabla de rutas
docker exec contenedor ip route

# Ver conexiones activas
docker exec contenedor netstat -tulpn
docker exec contenedor ss -tulpn

# DNS lookup
docker exec contenedor nslookup dominio
docker exec contenedor dig dominio

# Ver tráfico (requiere cap_net_admin)
docker exec contenedor tcpdump -i any
```

---

## 📚 Referencia Rápida

```bash
# CREAR
docker network create mi-red                              # Bridge básica
docker network create --driver host mi-red                # Host network
docker network create --subnet 172.20.0.0/16 mi-red      # Con subnet

# LISTAR
docker network ls                                         # Todas
docker network ls --filter driver=bridge                  # Filtradas

# CONECTAR
docker network connect mi-red contenedor                  # Conectar
docker network connect --ip 172.20.0.10 mi-red contenedor  # Con IP
docker network disconnect mi-red contenedor               # Desconectar

# INSPECCIONAR
docker network inspect mi-red                             # Detalles
docker port contenedor                                    # Ver puertos

# ELIMINAR
docker network rm mi-red                                  # Eliminar red
docker network prune                                      # Limpiar sin usar

# AL EJECUTAR
docker run --network mi-red imagen                        # Con red
docker run --network host imagen                          # Red host
docker run --network none imagen                          # Sin red
docker run -p 8080:80 --network mi-red imagen            # Con puerto
docker run --dns 8.8.8.8 --network mi-red imagen         # DNS custom
```

---

## 🎯 Patrones Comunes

### Patrón: API + DB

```bash
docker network create backend
docker run -d --name db --network backend postgres
docker run -d --name api --network backend -e DB_HOST=db my-api
```

### Patrón: Reverse Proxy

```bash
docker network create web
docker run -d --name app1 --network web app1:latest
docker run -d --name app2 --network web app2:latest
docker run -d --name nginx --network web -p 80:80 nginx
```

### Patrón: Microservicios

```bash
docker network create services
docker run -d --name svc1 --network services service1
docker run -d --name svc2 --network services service2
docker run -d --name gateway --network services -p 80:80 gateway
```

---

## 📖 Recursos Adicionales

- 🔗 [Docker Networking](https://docs.docker.com/network/)
- 🔗 [Network Drivers](https://docs.docker.com/network/drivers/)
- 🔗 [Networking Tutorial](https://docs.docker.com/network/network-tutorial-standalone/)
- 🔗 [Bridge Networks](https://docs.docker.com/network/bridge/)

---

**💡 Recuerda:** En redes personalizadas, los contenedores pueden comunicarse por nombre. ¡Úsalo!
