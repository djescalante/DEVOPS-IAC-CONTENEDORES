# 🚨 Troubleshooting Docker

> 🔧 **Solución rápida a problemas comunes**

---

## 🔴 Problemas Comunes

### ❌ Error: "Cannot connect to Docker daemon"

**Causa:** Docker no está corriendo

**Solución Windows:**
```powershell
# Verificar servicio
Get-Service docker

# Iniciar Docker Desktop
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

**Solución Linux:**
```bash
# Verificar estado
sudo systemctl status docker

# Iniciar Docker
sudo systemctl start docker

# Habilitar en boot
sudo systemctl enable docker
```

---

### ❌ Error: "Port is already allocated"

**Causa:** El puerto ya está en uso

**Solución:**
```bash
# Ver qué proceso usa el puerto (Windows)
netstat -ano | findstr :8080

# Ver qué proceso usa el puerto (Linux)
sudo lsof -i :8080

# Matar proceso (Windows)
taskkill /PID <PID> /F

# Matar proceso (Linux)
sudo kill -9 <PID>

# O cambiar el puerto en docker
docker run -p 8081:80 imagen
```

---

### ❌ Error: "No space left on device"

**Causa:** Docker se quedó sin espacio

**Solución:**
```bash
# Ver uso de espacio
docker system df

# Limpiar imágenes sin usar
docker image prune -a

# Limpiar contenedores detenidos
docker container prune

# Limpiar volúmenes sin usar
docker volume prune

# LIMPIEZA COMPLETA ⚠️
docker system prune -a --volumes
```

---

### ❌ Contenedor se detiene inmediatamente

**Diagnóstico:**
```bash
# Ver logs del contenedor
docker logs <nombre-contenedor>

# Ver logs completos
docker logs --tail 100 <nombre-contenedor>

# Ver por qué salió
docker inspect <nombre-contenedor> | grep "ExitCode"
```

**Causas comunes:**
1. **Comando principal termina:** El contenedor necesita un proceso que siga corriendo
2. **Error en configuración:** Revisar variables de entorno
3. **Falta dependencia:** Revisar logs

---

### ❌ "Cannot remove container: container is running"

**Solución:**
```bash
# Detener primero
docker stop <nombre>
docker rm <nombre>

# O forzar eliminación
docker rm -f <nombre>
```

---

### ❌ Contenedor no puede conectar a otro contenedor

**Diagnóstico:**
```bash
# Ver redes
docker network ls

# Inspeccionar red
docker network inspect <red>

# Ver configuración de red del contenedor
docker inspect <contenedor> | grep -A 20 "Networks"
```

**Solución:**
```bash
# Asegúrate que estén en la misma red
docker network connect <red> <contenedor>

# O usa docker-compose con networks definidas
```

---

### ❌ Error: "Permission denied" al montar volumen

**Causa:** Problemas de permisos en el directorio

**Solución Linux:**
```bash
# Cambiar permisos del directorio
chmod -R 755 ./mi-directorio

# O cambiar propietario
sudo chown -R $USER:$USER ./mi-directorio

# Ver UID del usuario en el contenedor
docker exec <contenedor> id

# Ajustar permisos según UID
sudo chown -R 1000:1000 ./mi-directorio
```

**Solución Windows:**
```powershell
# Verificar que Docker Desktop tenga acceso al drive
# Settings > Resources > File Sharing
```

---

### ❌ "Container name already in use"

**Solución:**
```bash
# Ver contenedores (incluso detenidos)
docker ps -a

# Eliminar contenedor viejo
docker rm <nombre>

# O usar --rm para auto-eliminar
docker run --rm --name <nombre> imagen
```

---

### ❌ Imagen no se puede descargar

**Diagnóstico:**
```bash
# Probar conectividad
ping registry-1.docker.io

# Ver logs de Docker
journalctl -u docker

# Verificar configuración de proxy si aplica
```

**Solución:**
```bash
# Especificar registry completo
docker pull docker.io/library/nginx:latest

# Limpiar cache de DNS
sudo systemd-resolve --flush-caches
```

---

### ❌ Contenedor muy lento

**Diagnóstico:**
```bash
# Ver uso de recursos
docker stats

# Ver procesos del contenedor
docker top <contenedor>
```

**Soluciones:**
```bash
# Limitar CPU
docker run --cpus="1.5" imagen

# Limitar memoria
docker run --memory="512m" imagen

# Verificar si hay I/O intensivo
docker stats --no-stream
```

---

### ❌ Variables de entorno no funcionan

**Verificar:**
```bash
# Ver variables dentro del contenedor
docker exec <contenedor> env

# Verificar en docker-compose
docker-compose config

# Ver cómo se pasaron
docker inspect <contenedor> | grep -A 20 "Env"
```

---

### ❌ Volumen no persiste datos

**Verificar:**
```bash
# Listar volúmenes
docker volume ls

# Inspeccionar volumen
docker volume inspect <volumen>

# Ver punto de montaje
docker inspect <contenedor> | grep -A 20 "Mounts"
```

**Solución:**
```yaml
# Usar volumen nombrado (persiste)
volumes:
  - db_data:/var/lib/mysql  # ✅

# NO usar volumen anónimo para datos importantes
volumes:
  - /var/lib/mysql  # ❌ Se pierde con docker-compose down -v
```

---

## 🔍 Comandos de Debug

### Ver configuración completa
```bash
docker inspect <contenedor> | less
```

### Ver logs en tiempo real
```bash
docker logs -f --tail 100 <contenedor>
```

### Ejecutar shell en contenedor
```bash
# Bash
docker exec -it <contenedor> bash

# Si no tiene bash
docker exec -it <contenedor> sh

# Como root
docker exec -it -u root <contenedor> bash
```

### Ver procesos
```bash
docker top <contenedor>
```

### Ver estadísticas en tiempo real
```bash
docker stats <contenedor>
```

### Ver cambios en filesystem
```bash
docker diff <contenedor>
```

### Ver eventos de Docker
```bash
docker events --since 1h
```

---

## 🆘 Comandos de Emergencia

### Detener todo
```bash
docker stop $(docker ps -aq)
```

### Eliminar todo
```bash
# Detener y eliminar contenedores
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)

# Eliminar imágenes
docker rmi $(docker images -q)

# Limpiar todo
docker system prune -a --volumes
```

### Reiniciar Docker
```bash
# Linux
sudo systemctl restart docker

# Windows (PowerShell como admin)
Restart-Service docker
```

### Reset completo (Windows)
```
Docker Desktop > Troubleshoot > Reset to factory defaults
```

---

## 🎯 Checklist de Troubleshooting

Cuando algo no funciona, verifica en orden:

1. **¿Docker está corriendo?**
   ```bash
   docker ps
   ```

2. **¿El contenedor está corriendo?**
   ```bash
   docker ps -a | grep <nombre>
   ```

3. **¿Hay errores en los logs?**
   ```bash
   docker logs <nombre>
   ```

4. **¿La configuración es correcta?**
   ```bash
   docker inspect <nombre>
   ```

5. **¿Hay problemas de red?**
   ```bash
   docker network inspect <red>
   ```

6. **¿Hay problemas de permisos?**
   ```bash
   docker exec <nombre> ls -la /ruta
   ```

7. **¿Hay suficiente espacio?**
   ```bash
   docker system df
   df -h
   ```

---

## 💡 Tips de Prevención

### ✅ Usa restart policies
```yaml
services:
  app:
    restart: unless-stopped
```

### ✅ Implementa healthchecks
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost/health"]
  interval: 30s
```

### ✅ Limita recursos
```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

### ✅ Usa volúmenes nombrados
```yaml
volumes:
  - db_data:/var/lib/mysql
```

### ✅ Revisa logs regularmente
```bash
docker-compose logs --tail=50
```

---

## 📚 Recursos Útiles

- 🔗 [Docker Troubleshooting Guide](https://docs.docker.com/config/daemon/troubleshoot/)
- 🔗 [Common Issues](https://docs.docker.com/desktop/troubleshoot/overview/)

---

**🆘 Si nada funciona:** Prueba reiniciar Docker o consulta los logs del daemon en `/var/log/docker.log`
