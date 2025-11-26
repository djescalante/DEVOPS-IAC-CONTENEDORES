# Ejemplo 3: Entorno de Desarrollo vs Producción

## Arquitectura Comparativa

### Desarrollo
```
┌─────────────────────────────────────────┐
│         Development Environment         │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  Frontend (Hot Reload)            │  │
│  │  - Volume mount: ./src → /app     │  │
│  │  - Port: 3000 (exposed)           │  │
│  │  - Dev server with HMR            │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  Backend (Nodemon)                │  │
│  │  - Volume mount: ./src → /app     │  │
│  │  - Port: 4000 (exposed)           │  │
│  │  - Debug mode enabled             │  │
│  │  - Verbose logging                │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  Database                         │  │
│  │  - Port: 3306 (exposed)           │  │
│  │  - Sample data loaded             │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Producción
```
┌─────────────────────────────────────────┐
│        Production Environment           │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  Nginx + SSL                      │  │
│  │  - Optimized static files         │  │
│  │  - Gzip compression               │  │
│  │  - Security headers               │  │
│  │  - Port: 80, 443                  │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  Backend (Clustered)              │  │
│  │  - Built image (no mounts)        │  │
│  │  - Internal network only          │  │
│  │  - Production optimizations       │  │
│  │  - Health checks                  │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  Database                         │  │
│  │  - Internal network only          │  │
│  │  - Automated backups              │  │
│  │  - Resource limits                │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Diferencias Clave

| Aspecto | Desarrollo | Producción |
|---------|-----------|------------|
| **Código** | Volume mounts | Built images |
| **Puertos** | Todos expuestos | Solo necesarios |
| **Redes** | Bridge simple | Múltiples redes |
| **Logs** | Verbose | Estructurados |
| **SSL** | No | Sí |
| **Caché** | Deshabilitado | Habilitado |
| **Minificación** | No | Sí |
| **Source Maps** | Sí | No |
| **Hot Reload** | Sí | No |
| **Debug Mode** | Sí | No |

## Uso

### Desarrollo
```bash
docker-compose -f docker-compose.dev.yml up
```

### Producción
```bash
docker-compose -f docker-compose.prod.yml up -d
```
