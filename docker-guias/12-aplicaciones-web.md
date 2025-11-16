# 🚀 Aplicaciones Web Completas con Docker

> 🎯 **Stacks de aplicaciones web modernas**

---

## 📋 Tabla de Contenidos
- [Aplicación Node.js + MongoDB](#aplicación-nodejs--mongodb)
- [Aplicación Python Flask + PostgreSQL](#aplicación-python-flask--postgresql)
- [Aplicación Django](#aplicación-django)
- [Aplicación React + API + DB](#aplicación-react--api--db)
- [Aplicación Full-Stack MERN](#aplicación-full-stack-mern)
- [Aplicación con Microservicios](#aplicación-con-microservicios)

---

## 🟢 Aplicación Node.js + MongoDB

### Estructura del proyecto

```
proyecto/
├── docker-compose.yml
├── .env
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   └── src/
└── mongo-init/
    └── init-db.js
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    container_name: nodejs-mongo
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
      MONGO_INITDB_DATABASE: ${MONGO_DB_NAME}
    volumes:
      - mongo-data:/data/db
      - ./mongo-init:/docker-entrypoint-initdb.d:ro
    networks:
      - app-network
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: nodejs-api
    ports:
      - "${API_PORT}:3000"
    environment:
      NODE_ENV: ${NODE_ENV}
      PORT: 3000
      MONGO_URI: mongodb://${MONGO_ROOT_USER}:${MONGO_ROOT_PASSWORD}@mongodb:27017/${MONGO_DB_NAME}?authSource=admin
      JWT_SECRET: ${JWT_SECRET}
    volumes:
      - ./backend:/app
      - /app/node_modules
    networks:
      - app-network
    depends_on:
      mongodb:
        condition: service_healthy
    command: npm run dev
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: nodejs-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    networks:
      - app-network
    depends_on:
      - backend
    restart: unless-stopped

networks:
  app-network:
    driver: bridge

volumes:
  mongo-data:
```

### .env

```env
# MongoDB
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=secretPassword123
MONGO_DB_NAME=myapp

# API
NODE_ENV=development
API_PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this

# App
APP_NAME=MyNodeApp
```

### backend/Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar código
COPY . .

# Usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

# Development
CMD ["npm", "run", "dev"]

# Production (descomentar)
# RUN npm run build
# CMD ["node", "dist/server.js"]
```

### backend/server.js

```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB conectado'))
.catch(err => console.error('❌ Error MongoDB:', err));

// Schema ejemplo
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

---

## 🐍 Aplicación Python Flask + PostgreSQL

### Estructura del proyecto

```
proyecto/
├── docker-compose.yml
├── .env
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── app.py
│   └── config.py
└── postgres-init/
    └── init.sql
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: flask-postgres
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./postgres-init:/docker-entrypoint-initdb.d:ro
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: flask-api
    ports:
      - "${API_PORT}:5000"
    environment:
      FLASK_APP: app.py
      FLASK_ENV: ${FLASK_ENV}
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      SECRET_KEY: ${SECRET_KEY}
    volumes:
      - ./backend:/app
    networks:
      - app-network
    depends_on:
      postgres:
        condition: service_healthy
    command: flask run --host=0.0.0.0
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: flask-redis
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    networks:
      - app-network
    restart: unless-stopped

networks:
  app-network:
    driver: bridge

volumes:
  postgres-data:
  redis-data:
```

### backend/Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Dependencias Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar aplicación
COPY . .

# Usuario no-root
RUN useradd -m -u 1000 flask && \
    chown -R flask:flask /app
USER flask

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "app:app"]
```

### backend/requirements.txt

```txt
Flask==3.0.0
Flask-SQLAlchemy==3.1.1
Flask-Migrate==4.0.5
Flask-CORS==4.0.0
psycopg2-binary==2.9.9
redis==5.0.1
gunicorn==21.2.0
python-dotenv==1.0.0
```

### backend/app.py

```python
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Configuración
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

db = SQLAlchemy(app)

# Modelo
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'created_at': self.created_at.isoformat()
        }

# Crear tablas
with app.app_context():
    db.create_all()

# Routes
@app.route('/health')
def health():
    return jsonify({'status': 'OK', 'service': 'Flask API'})

@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.get_json()
    user = User(name=data['name'], email=data['email'])
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

---

## ⚛️ Aplicación React + API + DB

### docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - backend-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin"]
      interval: 10s
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      target: development
    ports:
      - "8080:8080"
    environment:
      NODE_ENV: development
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: myapp
      DB_USER: admin
      DB_PASSWORD: password
    volumes:
      - ./backend:/app
      - /app/node_modules
    networks:
      - backend-network
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      target: development
    ports:
      - "3000:3000"
    environment:
      REACT_APP_API_URL: http://localhost:8080/api
    volumes:
      - ./frontend:/app
      - /app/node_modules
    networks:
      - frontend-network
    depends_on:
      - backend
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    networks:
      - frontend-network
      - backend-network
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

networks:
  frontend-network:
    driver: bridge
  backend-network:
    driver: bridge

volumes:
  postgres-data:
```

### frontend/Dockerfile

```dockerfile
# Development stage
FROM node:18-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]

# Build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine AS production

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### nginx/nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:3000;
    }

    upstream backend {
        server backend:8080;
    }

    server {
        listen 80;
        server_name localhost;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
        }

        # API
        location /api/ {
            proxy_pass http://backend/api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }
}
```

---

## 🔥 Aplicación Full-Stack MERN

### docker-compose.yml completo

```yaml
version: '3.8'

x-common-variables: &common-env
  NODE_ENV: ${NODE_ENV:-development}
  JWT_SECRET: ${JWT_SECRET}
  
services:
  mongo:
    image: mongo:7
    container_name: mern-mongo
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
      MONGO_INITDB_DATABASE: ${MONGO_DB}
    volumes:
      - mongo-data:/data/db
      - ./mongo-init:/docker-entrypoint-initdb.d:ro
    networks:
      - backend
    ports:
      - "27017:27017"
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      target: ${NODE_ENV:-development}
    container_name: mern-backend
    ports:
      - "${API_PORT:-5000}:5000"
    environment:
      <<: *common-env
      MONGO_URI: mongodb://${MONGO_USER}:${MONGO_PASSWORD}@mongo:27017/${MONGO_DB}?authSource=admin
      CLIENT_URL: http://localhost:${FRONTEND_PORT:-3000}
    volumes:
      - ./backend:/app
      - /app/node_modules
      - backend-uploads:/app/uploads
    networks:
      - backend
      - frontend
    depends_on:
      mongo:
        condition: service_healthy
    command: npm run dev
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      target: ${NODE_ENV:-development}
      args:
        REACT_APP_API_URL: http://localhost:${API_PORT:-5000}
    container_name: mern-frontend
    ports:
      - "${FRONTEND_PORT:-3000}:3000"
    environment:
      <<: *common-env
      REACT_APP_API_URL: http://localhost:${API_PORT:-5000}
    volumes:
      - ./frontend:/app
      - /app/node_modules
    networks:
      - frontend
    depends_on:
      - backend
    command: npm start
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: mern-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - backend-uploads:/usr/share/nginx/uploads:ro
    networks:
      - frontend
      - backend
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: mern-redis
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis-data:/data
    networks:
      - backend
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
    restart: unless-stopped

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge

volumes:
  mongo-data:
  redis-data:
  backend-uploads:
```

### .env

```env
# Environment
NODE_ENV=development

# MongoDB
MONGO_USER=admin
MONGO_PASSWORD=mongoPassword123
MONGO_DB=mernapp

# Redis
REDIS_PASSWORD=redisPassword123

# API
API_PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend
FRONTEND_PORT=3000
```

---

## 🎯 Aplicación con Microservicios

```yaml
version: '3.8'

services:
  # API Gateway
  gateway:
    build: ./gateway
    container_name: api-gateway
    ports:
      - "80:80"
    environment:
      AUTH_SERVICE_URL: http://auth-service:3001
      USER_SERVICE_URL: http://user-service:3002
      PRODUCT_SERVICE_URL: http://product-service:3003
      ORDER_SERVICE_URL: http://order-service:3004
    networks:
      - frontend
      - backend
    restart: unless-stopped

  # Auth Service
  auth-service:
    build: ./services/auth
    container_name: auth-service
    environment:
      DB_HOST: auth-db
      REDIS_HOST: redis
      JWT_SECRET: ${JWT_SECRET}
    networks:
      - backend
    depends_on:
      - auth-db
      - redis
    restart: unless-stopped

  auth-db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: auth
      POSTGRES_USER: auth
      POSTGRES_PASSWORD: ${AUTH_DB_PASSWORD}
    volumes:
      - auth-db-data:/var/lib/postgresql/data
    networks:
      - backend

  # User Service
  user-service:
    build: ./services/user
    container_name: user-service
    environment:
      DB_HOST: user-db
    networks:
      - backend
    depends_on:
      - user-db
    restart: unless-stopped

  user-db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: users
      POSTGRES_USER: users
      POSTGRES_PASSWORD: ${USER_DB_PASSWORD}
    volumes:
      - user-db-data:/var/lib/postgresql/data
    networks:
      - backend

  # Product Service
  product-service:
    build: ./services/product
    container_name: product-service
    environment:
      MONGO_URI: mongodb://product-db:27017/products
    networks:
      - backend
    depends_on:
      - product-db
    restart: unless-stopped

  product-db:
    image: mongo:7
    volumes:
      - product-db-data:/data/db
    networks:
      - backend

  # Order Service
  order-service:
    build: ./services/order
    container_name: order-service
    environment:
      DB_HOST: order-db
      RABBITMQ_URL: amqp://rabbitmq:5672
    networks:
      - backend
    depends_on:
      - order-db
      - rabbitmq
    restart: unless-stopped

  order-db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: orders
      POSTGRES_USER: orders
      POSTGRES_PASSWORD: ${ORDER_DB_PASSWORD}
    volumes:
      - order-db-data:/var/lib/postgresql/data
    networks:
      - backend

  # Message Broker
  rabbitmq:
    image: rabbitmq:3-management-alpine
    container_name: rabbitmq
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: ${RABBITMQ_USER}
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASSWORD}
    volumes:
      - rabbitmq-data:/var/lib/rabbitmq
    networks:
      - backend
    restart: unless-stopped

  # Cache
  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis-data:/data
    networks:
      - backend
    restart: unless-stopped

  # Frontend
  frontend:
    build: ./frontend
    container_name: frontend
    environment:
      REACT_APP_API_URL: http://localhost/api
    networks:
      - frontend
    restart: unless-stopped

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true

volumes:
  auth-db-data:
  user-db-data:
  product-db-data:
  order-db-data:
  rabbitmq-data:
  redis-data:
```

---

## 📚 Scripts Útiles

### start.sh

```bash
#!/bin/bash

echo "🚀 Iniciando aplicación..."

# Crear directorios necesarios
mkdir -p logs data backups

# Verificar .env
if [ ! -f .env ]; then
    echo "❌ Error: No se encontró .env"
    exit 1
fi

# Construir y levantar
docker-compose build
docker-compose up -d

# Esperar a que servicios estén listos
echo "⏳ Esperando servicios..."
sleep 10

# Verificar salud
docker-compose ps

echo "✅ Aplicación iniciada!"
echo "📊 Frontend: http://localhost:3000"
echo "🔌 API: http://localhost:8080"
```

### stop.sh

```bash
#!/bin/bash

echo "🛑 Deteniendo aplicación..."

docker-compose down

echo "✅ Aplicación detenida"
```

### backup.sh

```bash
#!/bin/bash

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d-%H%M%S)

echo "💾 Iniciando backup..."

# Backup de volúmenes
docker run --rm \
    -v $(docker volume ls -q | grep postgres):/source:ro \
    -v $BACKUP_DIR:/backup \
    alpine \
    tar czf /backup/postgres-$DATE.tar.gz -C /source .

echo "✅ Backup completado: postgres-$DATE.tar.gz"
```

---

## 📖 Recursos Adicionales

- 🔗 [Docker Compose Documentation](https://docs.docker.com/compose/)
- 🔗 [Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- 🔗 [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

---

**💡 Tip:** Siempre usa variables de entorno para configuraciones sensibles y documenta tu setup en un README.md.
