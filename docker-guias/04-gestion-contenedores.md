# 🎛️ Gestión de Contenedores Docker

> 🚀 **Control completo del ciclo de vida de contenedores**

---

## 📋 Tabla de Contenidos
- [Ciclo de Vida](#ciclo-de-vida)
- [Crear y Ejecutar](#crear-y-ejecutar)
- [Estado y Control](#estado-y-control)
- [Interactuar con Contenedores](#interactuar-con-contenedores)
- [Monitoreo y Logs](#monitoreo-y-logs)
- [Configuración Avanzada](#configuración-avanzada)
- [Solución de Problemas](#solución-de-problemas)

---

## 🔄 Ciclo de Vida

### Estados de un contenedor

```
┌─────────────────────────────────────────────┐
│                CICLO DE VIDA                │
└─────────────────────────────────────────────┘

    docker create          docker start
         │                      │
         ▼                      ▼
    ┌─────────┐          ┌──────────┐
    │ CREATED │─────────▶│ RUNNING  │
    └─────────┘          └──────────┘
                              │  │
                 docker pause │  │ docker stop
                              │  │
                         ┌────▼──▼───┐
                         │  PAUSED   │
                         │  EXITED   │
                         └───────────┘
                              │
                              │ docker rm
                              ▼
                         [ DELETED ]
```

### Comandos del ciclo de vida

```bash
# Crear contenedor (sin iniciarlo)
docker create <imagen>

# Crear e iniciar
docker run <imagen>

# Iniciar contenedor detenido
docker start <contenedor>

# Detener contenedor
docker stop <contenedor>

# Pausar (congelar procesos)
docker pause <contenedor>

# Reanudar
docker unpause <contenedor>

# Reiniciar
docker restart <contenedor>

# Matar (forzar detención)
docker kill <contenedor>

# Eliminar
docker rm <contenedor>
```

---

## 🚀 Crear y Ejecutar

### docker run - Sintaxis completa

```bash
docker run [OPTIONS] <imagen> [COMANDO] [ARGS]
```

### Opciones básicas

```bash
# Ejecución simple
docker run nginx

# En segundo plano (detached)
docker run -d nginx

# Con nombre personalizado
docker run --name mi-nginx nginx

# Modo interactivo con terminal
docker run -it ubuntu bash

# Eliminar automáticamente al salir
docker run --rm ubuntu echo "Hola"
```

### Mapeo de puertos

```bash
# Puerto específico: Host:Contenedor
docker run -p 8080:80 nginx

# Puerto aleatorio en host
docker run -p 80 nginx

# Múltiples puertos
docker run -p 8080:80 -p 8443:443 nginx

# Todos los puertos expuestos
docker run -P nginx

# Especificar interfaz
docker run -p 127.0.0.1:8080:80 nginx

# UDP en lugar de TCP
docker run -p 8080:80/udp nginx
```

### Variables de entorno

```bash
# Variable simple
docker run -e "NODE_ENV=production" node-app

# Múltiples variables
docker run -e "DB_HOST=mysql" \
           -e "DB_PORT=3306" \
           -e "DB_NAME=mydb" \
           mysql-app

# Desde archivo
docker run --env-file .env node-app

# .env contenido:
# NODE_ENV=production
# PORT=3000
# DB_HOST=localhost
```

### Volúmenes y montajes

```bash
# Volumen nombrado
docker run -v mi-volumen:/app/data nginx

# Bind mount (ruta absoluta)
docker run -v /ruta/host:/ruta/contenedor nginx

# Solo lectura
docker run -v /ruta/host:/ruta/contenedor:ro nginx

# Múltiples volúmenes
docker run -v vol1:/data1 -v vol2:/data2 nginx

# tmpfs (en memoria)
docker run --tmpfs /tmp nginx
```

### Límites de recursos

```bash
# Limitar memoria
docker run -m 512m nginx
docker run --memory 512m nginx

# Límite de CPU
docker run --cpus 2 nginx
docker run --cpus 0.5 nginx  # 50% de un CPU

# CPU shares (prioridad relativa)
docker run --cpu-shares 512 nginx

# Límite de PIDs
docker run --pids-limit 100 nginx

# Límite de I/O
docker run --device-read-bps /dev/sda:1mb nginx
```

### Configuración de red

```bash
# Red específica
docker run --network mi-red nginx

# Sin red (aislado)
docker run --network none nginx

# Usar red del host
docker run --network host nginx

# Hostname personalizado
docker run --hostname mi-servidor nginx

# DNS personalizado
docker run --dns 8.8.8.8 nginx

# Agregar host al /etc/hosts
docker run --add-host db:192.168.1.100 nginx
```

### Políticas de reinicio

```bash
# Sin reinicio automático (default)
docker run --restart no nginx

# Siempre reiniciar
docker run --restart always nginx

# Reiniciar solo si falla
docker run --restart on-failure nginx

# Reiniciar hasta 5 veces
docker run --restart on-failure:5 nginx

# Reiniciar a menos que se detenga manualmente
docker run --restart unless-stopped nginx
```

### Ejemplos completos

```bash
# Servidor web completo
docker run -d \
  --name web-server \
  --restart unless-stopped \
  -p 80:80 \
  -p 443:443 \
  -v web-content:/usr/share/nginx/html \
  -v nginx-logs:/var/log/nginx \
  -e "TZ=America/Bogota" \
  nginx:alpine

# Aplicación Node.js
docker run -d \
  --name node-app \
  --restart on-failure:3 \
  -p 3000:3000 \
  -v $(pwd):/app \
  -w /app \
  -e "NODE_ENV=production" \
  --env-file .env \
  -m 512m \
  --cpus 1 \
  node:18-alpine \
  node server.js

# Base de datos MySQL
docker run -d \
  --name mysql-db \
  --restart always \
  -p 3306:3306 \
  -v mysql-data:/var/lib/mysql \
  -v mysql-config:/etc/mysql/conf.d \
  -e "MYSQL_ROOT_PASSWORD=secreto" \
  -e "MYSQL_DATABASE=miapp" \
  -e "MYSQL_USER=usuario" \
  -e "MYSQL_PASSWORD=password" \
  --health-cmd='mysqladmin ping -h localhost' \
  --health-interval=10s \
  --health-timeout=5s \
  --health-retries=3 \
  mysql:8.0
```

---

## 📊 Estado y Control

### Listar contenedores

```bash
# Contenedores en ejecución
docker ps

# Todos los contenedores
docker ps -a

# Solo IDs
docker ps -q

# Últimos N contenedores
docker ps -n 5

# Último contenedor creado
docker ps -l

# Con tamaños
docker ps -s

# Formato personalizado
docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### Formato de salida personalizado

```bash
# Formato JSON
docker ps --format json

# Tabla personalizada
docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Image}}"

# Solo nombres
docker ps --format "{{.Names}}"

# Con colores (usando printf)
docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "Up|Down"
```

### Filtros

```bash
# Por estado
docker ps -a --filter status=running
docker ps -a --filter status=exited
docker ps -a --filter status=paused

# Por nombre
docker ps --filter name=web

# Por ID
docker ps --filter id=abc123

# Por imagen
docker ps --filter ancestor=nginx:latest

# Por red
docker ps --filter network=mi-red

# Por volumen
docker ps --filter volume=mi-volumen

# Por label
docker ps --filter label=env=prod

# Múltiples filtros
docker ps --filter name=web --filter status=running

# Por tiempo
docker ps --filter before=contenedor1
docker ps --filter since=contenedor2

# Salud del contenedor
docker ps --filter health=healthy
docker ps --filter health=unhealthy
```

### Control de contenedores

```bash
# Iniciar
docker start mi-contenedor

# Iniciar y adjuntar
docker start -a mi-contenedor

# Iniciar modo interactivo
docker start -i mi-contenedor

# Detener (graceful, 10s timeout)
docker stop mi-contenedor

# Detener con timeout personalizado
docker stop -t 30 mi-contenedor

# Matar inmediatamente (SIGKILL)
docker kill mi-contenedor

# Enviar señal específica
docker kill --signal SIGUSR1 mi-contenedor

# Reiniciar
docker restart mi-contenedor

# Reiniciar con timeout
docker restart -t 30 mi-contenedor

# Pausar (congela procesos)
docker pause mi-contenedor

# Reanudar
docker unpause mi-contenedor
```

### Operaciones masivas

```bash
# Detener todos los contenedores
docker stop $(docker ps -q)

# Iniciar todos los contenedores detenidos
docker start $(docker ps -a -q -f status=exited)

# Reiniciar todos
docker restart $(docker ps -q)

# Eliminar todos los contenedores detenidos
docker container prune

# Eliminar todos los contenedores (forzar)
docker rm -f $(docker ps -a -q)

# Detener y eliminar todos
docker stop $(docker ps -q) && docker rm $(docker ps -a -q)
```

---

## 🔍 Interactuar con Contenedores

### Ejecutar comandos

```bash
# Comando simple
docker exec mi-contenedor ls -la

# Comando interactivo
docker exec -it mi-contenedor bash

# Con usuario específico
docker exec -u root -it mi-contenedor bash

# Con variables de entorno
docker exec -e "VAR=valor" mi-contenedor env

# En directorio específico
docker exec -w /app mi-contenedor pwd

# Con privilegios
docker exec --privileged mi-contenedor comando
```

### Shell interactivo

```bash
# Bash (si está disponible)
docker exec -it mi-contenedor bash

# sh (más universal)
docker exec -it mi-contenedor sh

# Con usuario root
docker exec -u 0 -it mi-contenedor bash

# PowerShell (Windows containers)
docker exec -it mi-contenedor powershell

# Python interactivo
docker exec -it mi-contenedor python
```

### Adjuntar a contenedor

```bash
# Adjuntar a STDOUT/STDERR
docker attach mi-contenedor

# Adjuntar sin señales (no mata con Ctrl+C)
docker attach --no-stdin mi-contenedor

# Detach con: Ctrl+P, Ctrl+Q (sin detener contenedor)
```

### Copiar archivos

```bash
# Del host al contenedor
docker cp archivo.txt mi-contenedor:/ruta/destino/
docker cp directorio/ mi-contenedor:/app/

# Del contenedor al host
docker cp mi-contenedor:/app/logs/app.log ./
docker cp mi-contenedor:/app/data/ ./backup/

# Preservar permisos y propietarios
docker cp -a mi-contenedor:/app ./backup

# Seguir enlaces simbólicos
docker cp -L mi-contenedor:/link ./
```

### Exportar filesystem

```bash
# Exportar contenedor completo
docker export mi-contenedor > contenedor-backup.tar

# Exportar y comprimir
docker export mi-contenedor | gzip > contenedor-backup.tar.gz

# Exportar a archivo directamente
docker export -o backup.tar mi-contenedor
```

---

## 📈 Monitoreo y Logs

### Ver logs

```bash
# Ver todos los logs
docker logs mi-contenedor

# Seguir logs en tiempo real
docker logs -f mi-contenedor

# Últimas N líneas
docker logs --tail 100 mi-contenedor

# Desde hace X tiempo
docker logs --since 10m mi-contenedor
docker logs --since 2h mi-contenedor
docker logs --since 2024-01-01 mi-contenedor

# Hasta un tiempo específico
docker logs --until 2024-01-01T10:00:00 mi-contenedor

# Con timestamps
docker logs -t mi-contenedor

# Sin timestamps pero con seguimiento
docker logs -f --tail 50 mi-contenedor

# Rango de tiempo
docker logs --since 2024-01-01 --until 2024-01-02 mi-contenedor

# Guardar logs en archivo
docker logs mi-contenedor > logs.txt 2>&1
```

### Estadísticas en tiempo real

```bash
# Todos los contenedores
docker stats

# Contenedor específico
docker stats mi-contenedor

# Múltiples contenedores
docker stats contenedor1 contenedor2

# Una sola muestra (sin stream)
docker stats --no-stream

# Sin truncar nombres
docker stats --no-trunc

# Formato personalizado
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

**Salida de `docker stats`:**
```
CONTAINER ID   NAME        CPU %   MEM USAGE / LIMIT   MEM %   NET I/O          BLOCK I/O
abc123         web-server  0.50%   256MiB / 2GiB      12.8%   1.2MB / 500KB    10MB / 5MB
```

### Ver procesos

```bash
# Listar procesos del contenedor
docker top mi-contenedor

# Con argumentos ps personalizados
docker top mi-contenedor aux

# Formato personalizado
docker top mi-contenedor -eo pid,user,args
```

### Información detallada

```bash
# Inspeccionar contenedor completo
docker inspect mi-contenedor

# Formato JSON bonito
docker inspect mi-contenedor | jq

# Obtener valor específico
docker inspect -f '{{.State.Status}}' mi-contenedor
docker inspect -f '{{.NetworkSettings.IPAddress}}' mi-contenedor
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' mi-contenedor

# Múltiples valores
docker inspect -f '{{.Name}} - {{.State.Status}}' mi-contenedor

# Ver variables de entorno
docker inspect -f '{{.Config.Env}}' mi-contenedor

# Ver volúmenes montados
docker inspect -f '{{.Mounts}}' mi-contenedor

# Ver puertos mapeados
docker inspect -f '{{.NetworkSettings.Ports}}' mi-contenedor
docker port mi-contenedor
```

### Eventos en tiempo real

```bash
# Ver todos los eventos
docker events

# Filtrar por contenedor
docker events --filter container=mi-contenedor

# Filtrar por evento
docker events --filter event=start
docker events --filter event=stop
docker events --filter event=die

# Filtrar por imagen
docker events --filter image=nginx

# Rango de tiempo
docker events --since 1h
docker events --until 2024-01-01

# Formato
docker events --format '{{.Time}} - {{.Action}} - {{.Actor.ID}}'
```

### Diff del filesystem

```bash
# Ver archivos modificados desde la creación
docker diff mi-contenedor

# Salida:
# A /app/nuevo-archivo.txt      (Added)
# C /app/config.json            (Changed)
# D /app/temp.log              (Deleted)
```

---

## ⚙️ Configuración Avanzada

### Capacidades de Linux

```bash
# Agregar capacidades
docker run --cap-add NET_ADMIN nginx

# Quitar capacidades
docker run --cap-drop ALL --cap-add NET_BIND_SERVICE nginx

# Todas las capacidades
docker run --privileged nginx
```

### Seguridad

```bash
# Usuario no-root
docker run -u 1000:1000 nginx

# Solo lectura
docker run --read-only nginx

# Tmpfs para escrituras temporales
docker run --read-only --tmpfs /tmp nginx

# Security options
docker run --security-opt no-new-privileges nginx

# AppArmor profile
docker run --security-opt apparmor=docker-default nginx

# SELinux label
docker run --security-opt label=level:s0:c100,c200 nginx
```

### Devices

```bash
# Acceso a dispositivo
docker run --device /dev/sda:/dev/xvda nginx

# Con permisos específicos
docker run --device /dev/sda:/dev/xvda:rwm nginx

# GPU
docker run --gpus all nvidia/cuda

# USB device
docker run --device /dev/bus/usb nginx
```

### Límites avanzados

```bash
# Memory swap
docker run -m 512m --memory-swap 1g nginx

# Memory reservation (soft limit)
docker run --memory-reservation 256m nginx

# Kernel memory
docker run --kernel-memory 100m nginx

# OOM kill disable
docker run -m 512m --oom-kill-disable nginx

# CPU period y quota
docker run --cpu-period 100000 --cpu-quota 50000 nginx

# CPU set (CPUs específicos)
docker run --cpuset-cpus 0,1 nginx

# Block I/O weight
docker run --blkio-weight 500 nginx
```

### Healthchecks

```bash
# Con healthcheck
docker run --health-cmd='curl -f http://localhost/ || exit 1' \
           --health-interval=30s \
           --health-timeout=3s \
           --health-retries=3 \
           --health-start-period=40s \
           nginx

# Ver estado de salud
docker inspect --format='{{.State.Health.Status}}' mi-contenedor

# Ver historial de health checks
docker inspect --format='{{json .State.Health}}' mi-contenedor | jq
```

### Labels

```bash
# Agregar labels al crear
docker run --label env=prod --label version=1.0 nginx

# Ver labels
docker inspect -f '{{.Config.Labels}}' mi-contenedor

# Filtrar por label
docker ps --filter label=env=prod
```

---

## 🔧 Solución de Problemas

### Contenedor no inicia

```bash
# Ver logs de error
docker logs mi-contenedor

# Inspeccionar estado
docker inspect -f '{{.State}}' mi-contenedor

# Ver último error
docker inspect -f '{{.State.Error}}' mi-contenedor

# Ejecutar en modo interactivo para debug
docker run -it --entrypoint /bin/bash imagen

# Ver eventos
docker events --filter container=mi-contenedor
```

### Contenedor consume muchos recursos

```bash
# Ver stats en tiempo real
docker stats mi-contenedor

# Ver procesos
docker top mi-contenedor

# Limitar recursos
docker update --cpus 1 --memory 512m mi-contenedor

# Reiniciar con nuevos límites
docker stop mi-contenedor
docker run -d --name mi-contenedor \
  -m 512m --cpus 1 \
  imagen
```

### Problemas de red

```bash
# Ver IP del contenedor
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' mi-contenedor

# Ver puertos
docker port mi-contenedor

# Probar conectividad
docker exec mi-contenedor ping google.com

# Ver interfaces de red
docker exec mi-contenedor ip addr

# Verificar DNS
docker exec mi-contenedor nslookup google.com

# Probar desde host
curl localhost:puerto
telnet localhost puerto
```

### Limpiar contenedores problemáticos

```bash
# Forzar detención
docker kill mi-contenedor

# Eliminar forzadamente
docker rm -f mi-contenedor

# Limpiar todos los contenedores detenidos
docker container prune

# Limpiar con filtro
docker container prune --filter "until=24h"

# Ver qué se eliminaría
docker container prune --dry-run
```

### Debug avanzado

```bash
# Ejecutar con strace
docker run --cap-add SYS_PTRACE imagen strace comando

# Acceder como root aunque el contenedor use otro usuario
docker exec -u 0 -it mi-contenedor bash

# Ver filesystem del contenedor desde host
docker export mi-contenedor | tar -C /tmp/contenedor-fs -xf -

# Copiar binarios para análisis
docker cp mi-contenedor:/usr/bin/app ./
```

---

## 📊 Comandos de Mantenimiento

### Actualizar configuración

```bash
# Actualizar recursos sin reiniciar
docker update --cpus 2 --memory 1g mi-contenedor

# Actualizar política de reinicio
docker update --restart unless-stopped mi-contenedor

# Actualizar múltiples contenedores
docker update --memory 512m contenedor1 contenedor2
```

### Renombrar

```bash
# Renombrar contenedor
docker rename viejo-nombre nuevo-nombre
```

### Commit (crear imagen desde contenedor)

```bash
# Crear imagen desde contenedor en ejecución
docker commit mi-contenedor mi-nueva-imagen:v1

# Con mensaje y autor
docker commit -m "Agregado nginx" -a "Tu Nombre" mi-contenedor mi-imagen:v1

# Con cambios en la configuración
docker commit --change='CMD ["nginx", "-g", "daemon off;"]' mi-contenedor mi-nginx:v1
```

---

## 📚 Referencia Rápida

```bash
# CREAR Y EJECUTAR
docker run -d --name nombre -p 8080:80 imagen    # Crear y ejecutar
docker create --name nombre imagen               # Solo crear
docker start nombre                              # Iniciar

# CONTROL
docker stop nombre         # Detener
docker restart nombre      # Reiniciar
docker pause nombre        # Pausar
docker unpause nombre      # Reanudar
docker kill nombre         # Matar

# LISTAR
docker ps                 # En ejecución
docker ps -a              # Todos
docker ps -q              # Solo IDs

# INTERACTUAR
docker exec -it nombre bash           # Abrir shell
docker exec nombre comando            # Ejecutar comando
docker cp archivo nombre:/ruta        # Copiar archivo
docker attach nombre                  # Adjuntar

# MONITOREO
docker logs -f nombre                # Ver logs
docker stats nombre                  # Estadísticas
docker top nombre                    # Procesos
docker inspect nombre                # Información completa
docker port nombre                   # Ver puertos

# LIMPIEZA
docker rm nombre                     # Eliminar
docker rm -f nombre                  # Forzar eliminación
docker container prune               # Limpiar detenidos
```

---

## 💡 Tips Prácticos

### Alias útiles

```bash
# .bashrc o .zshrc
alias dps='docker ps'
alias dpsa='docker ps -a'
alias dstop='docker stop'
alias drm='docker rm'
alias dlog='docker logs -f'
alias dex='docker exec -it'
alias din='docker inspect'
alias dstats='docker stats --no-stream'
```

### Scripts útiles

```bash
# cleanup-containers.sh
#!/bin/bash
echo "Deteniendo todos los contenedores..."
docker stop $(docker ps -q) 2>/dev/null
echo "Eliminando contenedores detenidos..."
docker container prune -f
echo "Listo!"

# restart-container.sh
#!/bin/bash
CONTAINER=$1
echo "Deteniendo $CONTAINER..."
docker stop $CONTAINER
echo "Eliminando $CONTAINER..."
docker rm $CONTAINER
echo "Recreando $CONTAINER..."
docker-compose up -d $CONTAINER
```

---

## 📖 Recursos Adicionales

- 🔗 [Docker Run Reference](https://docs.docker.com/engine/reference/run/)
- 🔗 [Container Runtime Options](https://docs.docker.com/config/containers/resource_constraints/)
- 🔗 [Docker Security](https://docs.docker.com/engine/security/)

---

**💡 Recuerda:** Siempre usa nombres descriptivos para tus contenedores y etiquetas apropiadas para facilitar la gestión.
