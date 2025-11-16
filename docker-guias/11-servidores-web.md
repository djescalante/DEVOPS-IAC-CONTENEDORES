# 🌐 Servidores Web con Docker

> 🚀 **Nginx, Apache y configuraciones avanzadas**

---

## 📋 Tabla de Contenidos
- [Nginx](#nginx)
- [Apache](#apache)
- [Nginx como Reverse Proxy](#nginx-como-reverse-proxy)
- [Load Balancing](#load-balancing)
- [SSL/HTTPS](#sslhttps)
- [Casos de Uso](#casos-de-uso)

---

## 🔵 Nginx

### Nginx básico

```yaml
# docker-compose.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    container_name: web-server
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./html:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    restart: unless-stopped
```

```nginx
# nginx.conf - Configuración básica
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss;

    include /etc/nginx/conf.d/*.conf;
}
```

### Nginx con sitios múltiples

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    container_name: nginx-multi
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./sites-enabled:/etc/nginx/sites-enabled:ro
      - ./site1:/usr/share/nginx/site1:ro
      - ./site2:/usr/share/nginx/site2:ro
      - ./logs:/var/log/nginx
      - ./ssl:/etc/nginx/ssl:ro
    restart: unless-stopped
```

```nginx
# sites-enabled/site1.conf
server {
    listen 80;
    server_name site1.ejemplo.com www.site1.ejemplo.com;

    root /usr/share/nginx/site1;
    index index.html index.htm;

    location / {
        try_files $uri $uri/ =404;
    }

    # Cache estático
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Logs
    access_log /var/log/nginx/site1-access.log;
    error_log /var/log/nginx/site1-error.log;
}
```

```nginx
# sites-enabled/site2.conf
server {
    listen 80;
    server_name site2.ejemplo.com;

    root /usr/share/nginx/site2;
    index index.html;

    # Redireccionar www a no-www
    if ($host = 'www.site2.ejemplo.com') {
        return 301 $scheme://site2.ejemplo.com$request_uri;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    access_log /var/log/nginx/site2-access.log;
    error_log /var/log/nginx/site2-error.log;
}
```

### Nginx con PHP-FPM

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    container_name: nginx-php
    ports:
      - "80:80"
    volumes:
      - ./www:/var/www/html
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
    networks:
      - web-network
    depends_on:
      - php
    restart: unless-stopped

  php:
    image: php:8.2-fpm-alpine
    container_name: php-fpm
    volumes:
      - ./www:/var/www/html
    networks:
      - web-network
    restart: unless-stopped

networks:
  web-network:
    driver: bridge
```

```nginx
# nginx/default.conf
server {
    listen 80;
    server_name localhost;
    root /var/www/html;
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass php:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

---

## 🔴 Apache

### Apache básico

```yaml
version: '3.8'

services:
  apache:
    image: httpd:2.4-alpine
    container_name: apache-web
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/local/apache2/htdocs:ro
      - ./httpd.conf:/usr/local/apache2/conf/httpd.conf:ro
    restart: unless-stopped
```

### Apache con PHP

```yaml
version: '3.8'

services:
  apache-php:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: apache-php
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./www:/var/www/html
      - ./apache/sites-enabled:/etc/apache2/sites-enabled:ro
    restart: unless-stopped
```

```dockerfile
# Dockerfile
FROM php:8.2-apache

# Instalar extensiones
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd mysqli pdo pdo_mysql zip

# Habilitar módulos Apache
RUN a2enmod rewrite ssl headers

# Permisos
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80 443
```

### Apache Virtual Hosts

```apache
# sites-enabled/site1.conf
<VirtualHost *:80>
    ServerName site1.ejemplo.com
    ServerAlias www.site1.ejemplo.com
    DocumentRoot /var/www/html/site1

    <Directory /var/www/html/site1>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/site1-error.log
    CustomLog ${APACHE_LOG_DIR}/site1-access.log combined
</VirtualHost>
```

---

## 🔄 Nginx como Reverse Proxy

### Proxy básico

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    container_name: reverse-proxy
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    networks:
      - web-network
    depends_on:
      - app1
      - app2
    restart: unless-stopped

  app1:
    image: node:18-alpine
    container_name: app1
    command: sh -c "echo 'Server 1' > index.html && npx http-server -p 3000"
    networks:
      - web-network

  app2:
    image: node:18-alpine
    container_name: app2
    command: sh -c "echo 'Server 2' > index.html && npx http-server -p 3000"
    networks:
      - web-network

networks:
  web-network:
    driver: bridge
```

```nginx
# nginx.conf
http {
    upstream backend {
        server app1:3000;
        server app2:3000;
    }

    server {
        listen 80;
        server_name ejemplo.com;

        location / {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### Reverse Proxy con rutas

```nginx
# nginx.conf
http {
    server {
        listen 80;
        server_name api.ejemplo.com;

        # API v1
        location /api/v1/ {
            proxy_pass http://api-v1:8080/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # API v2
        location /api/v2/ {
            proxy_pass http://api-v2:8080/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # Admin panel
        location /admin/ {
            proxy_pass http://admin:3000/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            
            # Autenticación básica
            auth_basic "Restricted";
            auth_basic_user_file /etc/nginx/.htpasswd;
        }

        # WebSocket support
        location /ws/ {
            proxy_pass http://websocket-server:3001/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
        }
    }
}
```

### Proxy con caché

```nginx
http {
    # Configurar caché
    proxy_cache_path /var/cache/nginx levels=1:2 
                     keys_zone=my_cache:10m 
                     max_size=1g 
                     inactive=60m 
                     use_temp_path=off;

    upstream backend {
        server app:3000;
    }

    server {
        listen 80;
        
        location / {
            proxy_cache my_cache;
            proxy_cache_valid 200 60m;
            proxy_cache_valid 404 1m;
            proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
            proxy_cache_background_update on;
            proxy_cache_lock on;
            
            add_header X-Cache-Status $upstream_cache_status;
            
            proxy_pass http://backend;
            proxy_set_header Host $host;
        }

        # No cachear API
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
        }
    }
}
```

---

## ⚖️ Load Balancing

### Round Robin (default)

```nginx
http {
    upstream backend {
        server app1:3000;
        server app2:3000;
        server app3:3000;
    }

    server {
        listen 80;
        location / {
            proxy_pass http://backend;
        }
    }
}
```

### Least Connections

```nginx
upstream backend {
    least_conn;
    server app1:3000;
    server app2:3000;
    server app3:3000;
}
```

### IP Hash (sticky sessions)

```nginx
upstream backend {
    ip_hash;
    server app1:3000;
    server app2:3000;
    server app3:3000;
}
```

### Con pesos

```nginx
upstream backend {
    server app1:3000 weight=3;  # 60% del tráfico
    server app2:3000 weight=2;  # 40% del tráfico
}
```

### Con backup

```nginx
upstream backend {
    server app1:3000;
    server app2:3000;
    server app3:3000 backup;  # Solo si otros fallan
}
```

### Con health checks

```nginx
upstream backend {
    server app1:3000 max_fails=3 fail_timeout=30s;
    server app2:3000 max_fails=3 fail_timeout=30s;
    server app3:3000 max_fails=3 fail_timeout=30s;
}
```

### Ejemplo completo

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    container_name: load-balancer
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    networks:
      - web-network
    depends_on:
      - app
    restart: unless-stopped

  app:
    image: node:18-alpine
    command: sh -c "
      PORT=3000 node -e \"
        require('http').createServer((req,res) => {
          res.end('Server: ' + require('os').hostname())
        }).listen(3000)
      \"
    "
    networks:
      - web-network
    deploy:
      replicas: 3

networks:
  web-network:
    driver: bridge
```

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream app_servers {
        least_conn;
        server app:3000 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    server {
        listen 80;
        
        location / {
            proxy_pass http://app_servers;
            proxy_http_version 1.1;
            proxy_set_header Connection "";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            
            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "OK\n";
            add_header Content-Type text/plain;
        }
    }
}
```

---

## 🔒 SSL/HTTPS

### Con Let's Encrypt (Certbot)

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    container_name: nginx-ssl
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
    networks:
      - web-network
    restart: unless-stopped

  certbot:
    image: certbot/certbot
    container_name: certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    command: certonly --webroot --webroot-path=/var/www/certbot 
             --email tu@email.com --agree-tos --no-eff-email 
             -d ejemplo.com -d www.ejemplo.com

networks:
  web-network:
    driver: bridge
```

```nginx
# nginx.conf
http {
    # Redireccionar HTTP a HTTPS
    server {
        listen 80;
        server_name ejemplo.com www.ejemplo.com;
        
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        
        location / {
            return 301 https://$host$request_uri;
        }
    }

    # HTTPS
    server {
        listen 443 ssl http2;
        server_name ejemplo.com www.ejemplo.com;

        ssl_certificate /etc/letsencrypt/live/ejemplo.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/ejemplo.com/privkey.pem;
        
        # SSL settings (Mozilla Modern)
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
        ssl_prefer_server_ciphers off;
        
        # HSTS
        add_header Strict-Transport-Security "max-age=63072000" always;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        location / {
            root /usr/share/nginx/html;
            index index.html;
        }
    }
}
```

### Renovación automática

```yaml
# docker-compose.yml
services:
  # ... nginx ...

  certbot-renew:
    image: certbot/certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
```

### Con certificado autofirmado (desarrollo)

```bash
# Generar certificado
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/nginx.key \
  -out ssl/nginx.crt \
  -subj "/CN=localhost"
```

```nginx
server {
    listen 443 ssl;
    server_name localhost;

    ssl_certificate /etc/nginx/ssl/nginx.crt;
    ssl_certificate_key /etc/nginx/ssl/nginx.key;

    location / {
        root /usr/share/nginx/html;
    }
}
```

---

## 💼 Casos de Uso

### 1. Sitio estático simple

```yaml
version: '3.8'

services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./public:/usr/share/nginx/html:ro
```

### 2. SPA (React/Vue/Angular)

```yaml
version: '3.8'

services:
  frontend:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./dist:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
```

```nginx
# nginx.conf para SPA
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. API Gateway

```yaml
version: '3.8'

services:
  gateway:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    networks:
      - api-network

  auth-service:
    image: auth-api:latest
    networks:
      - api-network

  user-service:
    image: user-api:latest
    networks:
      - api-network

  product-service:
    image: product-api:latest
    networks:
      - api-network

networks:
  api-network:
    driver: bridge
```

```nginx
http {
    upstream auth {
        server auth-service:3000;
    }
    upstream users {
        server user-service:3001;
    }
    upstream products {
        server product-service:3002;
    }

    server {
        listen 80;

        location /api/auth/ {
            proxy_pass http://auth/;
        }

        location /api/users/ {
            proxy_pass http://users/;
        }

        location /api/products/ {
            proxy_pass http://products/;
        }
    }
}
```

---

## 📚 Referencia Rápida

```bash
# NGINX
docker run -d -p 80:80 -v $(pwd)/html:/usr/share/nginx/html:ro nginx:alpine

# APACHE
docker run -d -p 80:80 -v $(pwd)/html:/usr/local/apache2/htdocs:ro httpd:2.4

# Recargar configuración Nginx
docker exec nginx nginx -s reload

# Verificar configuración
docker exec nginx nginx -t

# Recargar Apache
docker exec apache apachectl graceful

# Ver logs
docker logs -f nginx
```

---

## 📖 Recursos Adicionales

- 🔗 [Nginx Documentation](https://nginx.org/en/docs/)
- 🔗 [Apache Documentation](https://httpd.apache.org/docs/)
- 🔗 [Mozilla SSL Config](https://ssl-config.mozilla.org/)
- 🔗 [Let's Encrypt](https://letsencrypt.org/)

---

**💡 Tip:** Usa `nginx -t` para verificar la sintaxis de tu configuración antes de aplicarla.
