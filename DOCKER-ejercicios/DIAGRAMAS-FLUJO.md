# Diagrama de Flujo de Datos

## Flujo de una Petición HTTP

```
┌─────────┐
│ Cliente │
└────┬────┘
     │ 1. HTTP Request
     ▼
┌─────────────────┐
│  Load Balancer  │
│    (Nginx)      │
└────┬────────────┘
     │ 2. Forward
     ▼
┌─────────────────┐
│  API Gateway    │◄──────┐
│  - Rate Limit   │       │ 6. Cache Hit
│  - Auth Check   │       │
└────┬────────────┘       │
     │ 3. Route      ┌────┴────┐
     ▼               │  Redis  │
┌─────────────────┐  │  Cache  │
│  Microservice   │  └─────────┘
│  (Users/Prods)  │
└────┬────────────┘
     │ 4. Query
     ▼
┌─────────────────┐
│    Database     │
│  (MySQL/Mongo)  │
└────┬────────────┘
     │ 5. Response
     ▼
┌─────────────────┐
│  API Gateway    │
│  - Cache Store  │
└────┬────────────┘
     │ 7. HTTP Response
     ▼
┌─────────┐
│ Cliente │
└─────────┘
```

## Escalabilidad Horizontal

```
                    ┌──────────────┐
                    │Load Balancer │
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐        ┌────▼────┐       ┌────▼────┐
   │Service 1│        │Service 2│       │Service 3│
   │Instance │        │Instance │       │Instance │
   └────┬────┘        └────┬────┘       └────┬────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────▼───────┐
                    │   Database   │
                    │   (Shared)   │
                    └──────────────┘
```

## Patrón de Circuit Breaker

```
┌─────────────────────────────────────────┐
│          Service A                      │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  Circuit Breaker                  │  │
│  │                                   │  │
│  │  States:                          │  │
│  │  ┌────────┐  Failures  ┌────────┐ │  │
│  │  └───┬────┘            └───┬────┘ │  │
│  │      │                     │      │  │
│  │      │ Success      Timeout│      │  │
│  │      │                     │      │  │
│  │      │    ┌──────────┐     │      │  │
│  │      └───►│Half-Open │◄────┘      │  │
│  │           └──────────┘            │  │
│  └───────────────────────────────────┘  │
│                  │                      │
└──────────────────┼────────────── ───────┘
                   │
                   ▼
          ┌────────────────┐
          │   Service B    │
          └────────────────┘
```
