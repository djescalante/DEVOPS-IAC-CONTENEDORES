# 📚 Guías Rápidas de Docker y Docker Compose

> 🚀 **Referencia rápida para despliegue de contenedores**

---

## 📖 Índice de Guías

### 🐳 Fundamentos de Docker
- [01 - Comandos Básicos Docker](01-comandos-basicos-docker.md)
- [02 - Dockerfile](02-dockerfile.md)
- [03 - Gestión de Imágenes](03-gestion-imagenes.md)
- [04 - Gestión de Contenedores](04-gestion-contenedores.md)
- [05 - Volúmenes y Persistencia](05-volumenes-persistencia.md)
- [06 - Redes en Docker](06-redes-docker.md)

### 🎼 Docker Compose
- [07 - Docker Compose Básico](07-docker-compose-basico.md)
- [08 - Docker Compose Avanzado](08-docker-compose-avanzado.md)
- [09 - Ejemplos Prácticos](09-ejemplos-practicos.md)

### 🛠️ Casos de Uso Comunes
- [10 - Base de Datos (MySQL, PostgreSQL, MongoDB)](10-bases-de-datos.md)
- [11 - Servidores Web (Nginx, Apache)](11-servidores-web.md)
- [12 - Aplicaciones Web Completas](12-aplicaciones-web.md)

### 🔧 Troubleshooting
- [13 - Solución de Problemas Comunes](13-troubleshooting.md)
- [14 - Tips y Mejores Prácticas](14-tips-mejores-practicas.md)

---

## 🎯 Inicio Rápido

### Verificar instalación
```bash
docker --version
docker-compose --version
```

### Comando más usado (recordatorio rápido)
```bash
# Ver contenedores activos
docker ps

# Levantar stack completo
docker-compose up -d

# Ver logs
docker-compose logs -f
```

---

## 🆘 Emergencias

### 🔴 Detener todo
```bash
docker stop $(docker ps -aq)
```

### 🧹 Limpiar todo
```bash
docker system prune -a --volumes
```

### 📊 Ver uso de recursos
```bash
docker stats
```

---

**Última actualización:** Noviembre 2025
