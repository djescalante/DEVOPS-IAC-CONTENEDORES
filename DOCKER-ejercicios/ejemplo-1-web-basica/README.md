# Ejemplo 1: Aplicación Web Básica con Node.js y MySQL

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Host                               │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Network: app-network                       │  │
│  │                                                        │  │
│  │  ┌─────────────┐      ┌─────────────┐    ┌─────────┐│  │
│  │  │  Frontend   │      │   Backend   │    │  MySQL  ││  │
│  │  │  (Nginx)    │─────▶│  (Node.js)  │───▶│   DB    ││  │
│  │  │  Port: 80   │      │  Port: 3000 │    │Port:3306││  │
│  │  └─────────────┘      └─────────────┘    └─────────┘│  │
│  │       │                     │                  │     │  │
│  │       │                     │                  │     │  │
│  │  ┌────▼────┐           ┌───▼────┐        ┌────▼───┐│  │
│  │  │ Volume  │           │ Volume │        │ Volume ││  │
│  │  │  /html  │           │  /logs │        │ /data  ││  │
│  │  └─────────┘           └────────┘        └────────┘│  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

## Características

- **Frontend**: Servidor Nginx sirviendo archivos estáticos
- **Backend**: API REST en Node.js/Express
- **Base de Datos**: MySQL 8.0 con persistencia de datos
- **Red**: Red bridge personalizada para comunicación entre contenedores
- **Volúmenes**: Persistencia de datos para la base de datos

## Buenas Prácticas Implementadas

1. ✅ Separación de servicios en contenedores independientes
2. ✅ Red personalizada para aislamiento
3. ✅ Variables de entorno para configuración
4. ✅ Volúmenes nombrados para persistencia
5. ✅ Health checks para monitoreo
6. ✅ Límites de recursos
7. ✅ Restart policies

## Uso

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v
```

## Acceso

- Frontend: http://localhost
- Backend API: http://localhost:3000
- MySQL: localhost:3306
