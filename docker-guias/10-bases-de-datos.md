# 💾 Bases de Datos con Docker

> 🗄️ **Despliegue rápido de MySQL, PostgreSQL, MongoDB y más**

---

## 🟢 MySQL

### Docker Run
```bash
docker run -d \
  --name mysql \
  -e MYSQL_ROOT_PASSWORD=root123 \
  -e MYSQL_DATABASE=myapp \
  -e MYSQL_USER=user \
  -e MYSQL_PASSWORD=pass123 \
  -p 3306:3306 \
  -v mysql_data:/var/lib/mysql \
  mysql:8.0
```

### Docker Compose
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root123
      MYSQL_DATABASE: myapp
      MYSQL_USER: user
      MYSQL_PASSWORD: pass123
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql

volumes:
  mysql_data:
```

### Conectar desde host
```bash
mysql -h 127.0.0.1 -P 3306 -u user -p
```

### Backup
```bash
# Exportar
docker exec mysql mysqldump -u root -proot123 myapp > backup.sql

# Importar
docker exec -i mysql mysql -u root -proot123 myapp < backup.sql
```

---

## 🟦 PostgreSQL

### Docker Run
```bash
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=postgres123 \
  -e POSTGRES_USER=user \
  -e POSTGRES_DB=myapp \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine
```

### Docker Compose
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: postgres
    restart: always
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: postgres123
      POSTGRES_DB: myapp
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql

volumes:
  postgres_data:
```

### Con pgAdmin
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: postgres123
      POSTGRES_DB: myapp
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  pgadmin:
    image: dpage/pgadmin4
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@admin.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

Acceso: http://localhost:5050

---

## 🟩 MongoDB

### Docker Run
```bash
docker run -d \
  --name mongodb \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  -p 27017:27017 \
  -v mongo_data:/data/db \
  mongo:7
```

### Docker Compose
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    container_name: mongodb
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin123
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

### Con Mongo Express (Admin UI)
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin123
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  mongo-express:
    image: mongo-express
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: admin
      ME_CONFIG_MONGODB_ADMINPASSWORD: admin123
      ME_CONFIG_MONGODB_URL: mongodb://admin:admin123@mongodb:27017/
    ports:
      - "8081:8081"
    depends_on:
      - mongodb

volumes:
  mongo_data:
```

Acceso: http://localhost:8081

---

## 🔴 Redis

### Docker Run
```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  -v redis_data:/data \
  redis:7-alpine redis-server --appendonly yes
```

### Docker Compose
```yaml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    container_name: redis
    restart: always
    command: redis-server --appendonly yes --requirepass redis123
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

### Con Redis Commander (Admin UI)
```yaml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    command: redis-server --requirepass redis123
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  redis-commander:
    image: rediscommander/redis-commander:latest
    environment:
      REDIS_HOSTS: local:redis:6379:0:redis123
    ports:
      - "8081:8081"
    depends_on:
      - redis

volumes:
  redis_data:
```

---

## 📊 Stack Completo (Multi-DB)

```yaml
version: '3.8'

services:
  # MySQL
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root123
      MYSQL_DATABASE: myapp
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  # PostgreSQL
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: postgres123
      POSTGRES_DB: myapp
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # MongoDB
  mongodb:
    image: mongo:7
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin123
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  # Redis
  redis:
    image: redis:7-alpine
    command: redis-server --requirepass redis123
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  mysql_data:
  postgres_data:
  mongo_data:
  redis_data:
```

---

## 🔧 Comandos Útiles

### MySQL
```bash
# Entrar a MySQL
docker exec -it mysql mysql -u root -p

# Backup
docker exec mysql mysqldump -u root -proot123 myapp > backup.sql

# Restore
docker exec -i mysql mysql -u root -proot123 myapp < backup.sql
```

### PostgreSQL
```bash
# Entrar a psql
docker exec -it postgres psql -U user -d myapp

# Backup
docker exec postgres pg_dump -U user myapp > backup.sql

# Restore
docker exec -i postgres psql -U user myapp < backup.sql
```

### MongoDB
```bash
# Entrar a mongo shell
docker exec -it mongodb mongosh -u admin -p admin123

# Backup
docker exec mongodb mongodump --username admin --password admin123 --out /backup

# Restore
docker exec mongodb mongorestore --username admin --password admin123 /backup
```

### Redis
```bash
# Entrar a redis-cli
docker exec -it redis redis-cli -a redis123

# Ver todas las keys
docker exec redis redis-cli -a redis123 KEYS "*"

# Backup
docker exec redis redis-cli -a redis123 --rdb /data/backup.rdb
```

---

## 💡 Tips

### ✅ Siempre usa volúmenes para datos
```yaml
volumes:
  - db_data:/var/lib/mysql  # ✅ Persiste datos
```

### ✅ Configura contraseñas seguras
```yaml
environment:
  MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}  # Desde .env
```

### ✅ Usa healthchecks
```yaml
healthcheck:
  test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
  interval: 10s
  timeout: 5s
  retries: 5
```

---

**💾 Recuerda:** Los datos en volúmenes persisten incluso después de `docker-compose down`
