# 🐳 Comandos Básicos de Docker

> 📌 **Referencia rápida de comandos esenciales**

---

## 📋 Tabla de Contenidos
- [Información del Sistema](#información-del-sistema)
- [Gestión de Contenedores](#gestión-de-contenedores)
- [Gestión de Imágenes](#gestión-de-imágenes)
- [Logs y Debug](#logs-y-debug)
- [Limpieza](#limpieza)

---

## 🔍 Información del Sistema

### Ver versión de Docker
```bash
docker --version
docker version
docker info
```

### Ver uso de recursos en tiempo real
```bash
docker stats
```

### Ver información del sistema Docker
```bash
docker system df
```

**Salida ejemplo:**
```
TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
Images          10        5         2.5GB     1.2GB (48%)
Containers      15        3         100MB     50MB (50%)
Local Volumes   8         4         500MB     200MB (40%)
```

---

## 🎮 Gestión de Contenedores

### ▶️ Crear y ejecutar contenedores

#### Ejecutar contenedor básico
```bash
docker run <imagen>
```

#### Ejecutar en segundo plano (detached)
```bash
docker run -d <imagen>
```

#### Ejecutar con nombre personalizado
```bash
docker run --name mi-contenedor <imagen>
```

#### Ejecutar con puerto mapeado
```bash
docker run -p 8080:80 <imagen>
# Host:Contenedor
```

#### Ejecutar con variables de entorno
```bash
docker run -e "VAR=valor" <imagen>
```

#### Ejecutar con volumen
```bash
docker run -v /ruta/host:/ruta/contenedor <imagen>
```

### 📊 Listar contenedores

```bash
# Contenedores activos
docker ps

# Todos los contenedores (incluso detenidos)
docker ps -a

# Solo IDs
docker ps -q

# Con formato personalizado
docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Status}}"
```

### ⏸️ Control de contenedores

```bash
# Detener contenedor
docker stop <nombre-o-id>

# Detener con timeout personalizado (segundos)
docker stop -t 30 <nombre-o-id>

# Iniciar contenedor detenido
docker start <nombre-o-id>

# Reiniciar contenedor
docker restart <nombre-o-id>

# Pausar contenedor (congela procesos)
docker pause <nombre-o-id>

# Reanudar contenedor pausado
docker unpause <nombre-o-id>

# Matar contenedor (fuerza detención)
docker kill <nombre-o-id>
```

### 🗑️ Eliminar contenedores

```bash
# Eliminar contenedor detenido
docker rm <nombre-o-id>

# Eliminar contenedor activo (forzar)
docker rm -f <nombre-o-id>

# Eliminar múltiples contenedores
docker rm <id1> <id2> <id3>

# Eliminar todos los contenedores detenidos
docker container prune
```

### 🔄 Acciones masivas

```bash
# Detener todos los contenedores
docker stop $(docker ps -aq)

# Eliminar todos los contenedores
docker rm $(docker ps -aq)

# Detener y eliminar todos
docker stop $(docker ps -aq) && docker rm $(docker ps -aq)
```

---

## 🖼️ Gestión de Imágenes

### 📥 Descargar imágenes

```bash
# Descargar última versión
docker pull <imagen>

# Descargar versión específica
docker pull <imagen>:<tag>

# Ejemplo
docker pull nginx:latest
docker pull mysql:8.0
```

### 📝 Listar imágenes

```bash
# Todas las imágenes
docker images

# Solo IDs
docker images -q

# Con filtros
docker images --filter "dangling=true"
```

### 🗑️ Eliminar imágenes

```bash
# Eliminar imagen
docker rmi <imagen>:<tag>

# Forzar eliminación
docker rmi -f <imagen>:<tag>

# Eliminar imágenes sin usar
docker image prune

# Eliminar todas las imágenes sin usar (incluso con tags)
docker image prune -a
```

---

## 📊 Logs y Debug

### 📖 Ver logs

```bash
# Ver logs de contenedor
docker logs <nombre-o-id>

# Seguir logs en tiempo real
docker logs -f <nombre-o-id>

# Últimas N líneas
docker logs --tail 100 <nombre-o-id>

# Logs con timestamp
docker logs -t <nombre-o-id>

# Logs desde hace X tiempo
docker logs --since 5m <nombre-o-id>
docker logs --since 2h <nombre-o-id>
```

### 🔍 Inspeccionar contenedor

```bash
# Ver toda la configuración
docker inspect <nombre-o-id>

# Ver IP del contenedor
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' <nombre-o-id>

# Ver puerto mapeado
docker port <nombre-o-id>
```

### 💻 Ejecutar comandos en contenedor

```bash
# Ejecutar comando
docker exec <nombre-o-id> <comando>

# Abrir bash interactivo
docker exec -it <nombre-o-id> bash

# O sh si no tiene bash
docker exec -it <nombre-o-id> sh

# Ejecutar como root
docker exec -u root -it <nombre-o-id> bash
```

### 📊 Ver procesos del contenedor

```bash
docker top <nombre-o-id>
```

### 📈 Ver estadísticas en tiempo real

```bash
# Todos los contenedores
docker stats

# Contenedor específico
docker stats <nombre-o-id>

# Sin streaming (una sola vez)
docker stats --no-stream
```

---

## 🧹 Limpieza

### 🗑️ Limpiar recursos sin usar

```bash
# Eliminar contenedores detenidos
docker container prune

# Eliminar imágenes sin usar
docker image prune

# Eliminar volúmenes sin usar
docker volume prune

# Eliminar redes sin usar
docker network prune

# LIMPIEZA COMPLETA (⚠️ CUIDADO)
docker system prune

# Limpieza agresiva (incluye imágenes con tags)
docker system prune -a

# Limpieza total (incluye volúmenes)
docker system prune -a --volumes
```

---

## 🎯 Comandos Combinados Útiles

### Patrón común: Detener, eliminar y recrear
```bash
docker stop mi-app && docker rm mi-app && docker run -d --name mi-app -p 8080:80 nginx
```

### Ver último contenedor creado
```bash
docker ps -l
```

### Copiar archivos entre host y contenedor
```bash
# Del host al contenedor
docker cp archivo.txt <contenedor>:/ruta/destino/

# Del contenedor al host
docker cp <contenedor>:/ruta/archivo.txt ./
```

### Guardar logs en archivo
```bash
docker logs <contenedor> > logs.txt 2>&1
```

---

## 📌 Atajos y Alias Recomendados

Agrega a tu `.bashrc` o `.zshrc`:

```bash
# Alias útiles de Docker
alias dps='docker ps'
alias dpsa='docker ps -a'
alias di='docker images'
alias dstop='docker stop $(docker ps -aq)'
alias drm='docker rm $(docker ps -aq)'
alias dprune='docker system prune -a'
alias dlogs='docker logs -f'
alias dexec='docker exec -it'
alias dstats='docker stats --no-stream'
```

---

## 🎨 Formato de Salida Personalizado

### Contenedores con formato custom
```bash
docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### Imágenes con tamaño
```bash
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
```

---

## ⚡ Comandos de Emergencia

```bash
# 🔴 DETENER TODO
docker stop $(docker ps -aq)

# 🗑️ ELIMINAR TODO (contenedores)
docker rm -f $(docker ps -aq)

# 🧹 LIMPIEZA PROFUNDA
docker system prune -a --volumes -f

# 🔄 REINICIAR DOCKER (Linux)
sudo systemctl restart docker

# 🔄 REINICIAR DOCKER (Windows)
# Restart-Service docker (en PowerShell como admin)
```

---

## 📚 Recursos Adicionales

- 🔗 [Documentación oficial de Docker](https://docs.docker.com/)
- 🔗 [Docker Hub](https://hub.docker.com/)
- 🔗 [Cheat Sheet oficial](https://docs.docker.com/get-started/docker_cheatsheet.pdf)

---

**💡 Tip:** Usa `docker <comando> --help` para ver todas las opciones disponibles de cualquier comando.
