# 🎼 Docker Compose - Guía Básica

> 🚀 **Orquesta múltiples contenedores fácilmente**

---

## 📋 Tabla de Contenidos
- [¿Qué es Docker Compose?](#qué-es-docker-compose)
- [Estructura del docker-compose.yml](#estructura-del-docker-composeyml)
- [Comandos Básicos](#comandos-básicos)
- [Ejemplos Prácticos](#ejemplos-prácticos)

---

## 🤔 ¿Qué es Docker Compose?

**Docker Compose** es una herramienta para definir y ejecutar aplicaciones Docker multi-contenedor.

**Ventajas:**
- ✅ Un solo archivo para toda la configuración
- ✅ Levanta múltiples contenedores con un comando
- ✅ Gestión simplificada de redes y volúmenes
- ✅ Reproducible en cualquier entorno

---

## 🎮 Comandos Básicos

### 🚀 Levantar servicios

```bash
# Levantar todos los servicios en segundo plano
docker-compose up -d

# Levantar sin modo detached (ver logs)
docker-compose up

# Levantar servicios específicos
docker-compose up -d web database

# Forzar recreación de contenedores
docker-compose up -d --force-recreate

# Reconstruir imágenes y levantar
docker-compose up -d --build
```

### ⏹️ Detener servicios

```bash
# Detener servicios (mantiene contenedores)
docker-compose stop

# Detener y eliminar contenedores
docker-compose down

# Detener, eliminar contenedores y volúmenes
docker-compose down -v

# Detener, eliminar todo (incluyendo imágenes)
docker-compose down --rmi all -v
```

---

**💡 Tip Final:** Siempre usa `docker-compose config` para validar tu archivo antes de ejecutarlo.
