# 💡 Ejemplos Prácticos con Docker Compose

> 🎯 **Stacks completos listos para usar**

---

## 📋 Tabla de Contenidos
- [Stack LAMP](#stack-lamp)
- [Stack MEAN](#stack-mean)
- [Stack ELK](#stack-elk)
- [WordPress + MySQL](#wordpress--mysql)
- [GitLab CE](#gitlab-ce)
- [Nextcloud](#nextcloud)
- [Monitoring Stack](#monitoring-stack)
- [CI/CD Stack](#cicd-stack)

---

## 🔥 Stack LAMP

### Linux + Apache + MySQL + PHP

```yaml
# docker-compose.yml
version: '3.8'

services:
  apache-php:
    build:
      context: ./php
      dockerfile: Dockerfile
    container_name: lamp-web
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./www:/var/www/html
      - ./apache/sites-enabled:/etc/apache2/sites-enabled
      - ./apache/ssl:/etc/apache2/ssl
    networks:
      - lamp-network
    depends_on:
      - mysql
    restart: unless-stopped

  mysql:
    image: mysql:8.0
    container_name: lamp-mysql
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: myapp
      MYSQL_USER: appuser
      MYSQL_PASSWORD: apppassword
    volumes:
      - mysql-data:/var/lib/mysql
      - ./mysql/init:/docker-entrypoint-initdb.d
    networks:
      - lamp-network
    restart: unless-stopped

  phpmyadmin:
    image: phpmyadmin:latest
    container_name: lamp-phpmyadmin
    ports:
      - "8080:80"
    environment:
      PMA_HOST: mysql
      MYSQL_ROOT_PASSWORD: rootpassword
    networks:
      - lamp-network
    depends_on:
      - mysql
    restart: unless-stopped

networks:
  lamp-network:
    driver: bridge

volumes:
  mysql-data:
```

```dockerfile
# php/Dockerfile
FROM php:8.2-apache

# Instalar extensiones PHP
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip \
    unzip \
    git \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd mysqli pdo pdo_mysql \
    && a2enmod rewrite ssl

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Permisos
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80 443

CMD ["apache2-foreground"]
```

```bash
# Comandos útiles
docker-compose up -d
docker-compose logs -f apache-php
docker-compose exec apache-php bash
```

---

## 🟢 Stack MEAN

### MongoDB + Express + Angular + Node.js

```yaml
version: '3.8'

services:
  mongo:
    image: mongo:7
    container_name: mean-mongo
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
      MONGO_INITDB_DATABASE: meanapp
    volumes:
      - mongo-data:/data/db
      - ./mongo-init:/docker-entrypoint-initdb.d:ro
    networks:
      - mean-network
    restart: unless-stopped

  backend:
    build:
      context: ./backend
    container_name: mean-backend
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      MONGO_URI: mongodb://admin:password123@mongo:27017/meanapp?authSource=admin
      JWT_SECRET: your-secret-key
    volumes:
      - ./backend:/app
      - /app/node_modules
    networks:
      - mean-network
    depends_on:
      - mongo
    command: npm run dev
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
    container_name: mean-frontend
    ports:
      - "4200:4200"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    networks:
      - mean-network
    depends_on:
      - backend
    command: npm start
    restart: unless-stopped

networks:
  mean-network:
    driver: bridge

volumes:
  mongo-data:
```

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

RUN npm install -g @angular/cli

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4200

CMD ["ng", "serve", "--host", "0.0.0.0"]
```

---

## 📊 Stack ELK

### Elasticsearch + Logstash + Kibana

```yaml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    container_name: elk-elasticsearch
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - es-data:/usr/share/elasticsearch/data
    networks:
      - elk-network
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:9200/_cluster/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 5
    restart: unless-stopped

  logstash:
    image: docker.elastic.co/logstash/logstash:8.11.0
    container_name: elk-logstash
    ports:
      - "5044:5044"
      - "9600:9600"
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline:ro
      - ./logstash/config:/usr/share/logstash/config:ro
    networks:
      - elk-network
    depends_on:
      - elasticsearch
    restart: unless-stopped

  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    container_name: elk-kibana
    ports:
      - "5601:5601"
    environment:
      ELASTICSEARCH_HOSTS: http://elasticsearch:9200
    networks:
      - elk-network
    depends_on:
      - elasticsearch
    restart: unless-stopped

  filebeat:
    image: docker.elastic.co/beats/filebeat:8.11.0
    container_name: elk-filebeat
    user: root
    volumes:
      - ./filebeat/filebeat.yml:/usr/share/filebeat/filebeat.yml:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
    networks:
      - elk-network
    depends_on:
      - elasticsearch
      - logstash
    restart: unless-stopped

networks:
  elk-network:
    driver: bridge

volumes:
  es-data:
```

```yaml
# logstash/pipeline/logstash.conf
input {
  beats {
    port => 5044
  }
}

filter {
  if [docker][container][name] {
    grok {
      match => { "message" => "%{COMBINEDAPACHELOG}" }
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "logs-%{+YYYY.MM.dd}"
  }
  stdout { codec => rubydebug }
}
```

---

## 📝 WordPress + MySQL

```yaml
version: '3.8'

services:
  db:
    image: mysql:8.0
    container_name: wp-mysql
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wpuser
      MYSQL_PASSWORD: wppassword
    volumes:
      - db-data:/var/lib/mysql
    networks:
      - wp-network
    restart: unless-stopped

  wordpress:
    image: wordpress:latest
    container_name: wp-site
    ports:
      - "8000:80"
    environment:
      WORDPRESS_DB_HOST: db:3306
      WORDPRESS_DB_USER: wpuser
      WORDPRESS_DB_PASSWORD: wppassword
      WORDPRESS_DB_NAME: wordpress
      WORDPRESS_TABLE_PREFIX: wp_
      WORDPRESS_DEBUG: 1
    volumes:
      - wp-content:/var/www/html/wp-content
      - ./uploads.ini:/usr/local/etc/php/conf.d/uploads.ini
    networks:
      - wp-network
    depends_on:
      - db
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: wp-redis
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    networks:
      - wp-network
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: wp-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - wp-content:/var/www/html/wp-content:ro
    networks:
      - wp-network
    depends_on:
      - wordpress
    restart: unless-stopped

networks:
  wp-network:
    driver: bridge

volumes:
  db-data:
  wp-content:
  redis-data:
```

```ini
# uploads.ini
file_uploads = On
memory_limit = 256M
upload_max_filesize = 64M
post_max_size = 64M
max_execution_time = 600
```

---

## 🦊 GitLab CE

```yaml
version: '3.8'

services:
  gitlab:
    image: gitlab/gitlab-ce:latest
    container_name: gitlab
    hostname: gitlab.ejemplo.com
    ports:
      - "80:80"
      - "443:443"
      - "22:22"
    environment:
      GITLAB_OMNIBUS_CONFIG: |
        external_url 'http://gitlab.ejemplo.com'
        gitlab_rails['gitlab_shell_ssh_port'] = 22
        gitlab_rails['time_zone'] = 'America/Bogota'
        gitlab_rails['backup_keep_time'] = 604800
        gitlab_rails['smtp_enable'] = false
    volumes:
      - gitlab-config:/etc/gitlab
      - gitlab-logs:/var/log/gitlab
      - gitlab-data:/var/opt/gitlab
    networks:
      - gitlab-network
    shm_size: '256m'
    restart: unless-stopped

  gitlab-runner:
    image: gitlab/gitlab-runner:latest
    container_name: gitlab-runner
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - gitlab-runner-config:/etc/gitlab-runner
    networks:
      - gitlab-network
    depends_on:
      - gitlab
    restart: unless-stopped

networks:
  gitlab-network:
    driver: bridge

volumes:
  gitlab-config:
  gitlab-logs:
  gitlab-data:
  gitlab-runner-config:
```

```bash
# Obtener password inicial
docker exec -it gitlab grep 'Password:' /etc/gitlab/initial_root_password

# Registrar runner
docker exec -it gitlab-runner gitlab-runner register
```

---

## ☁️ Nextcloud

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: nextcloud-db
    environment:
      POSTGRES_DB: nextcloud
      POSTGRES_USER: nextcloud
      POSTGRES_PASSWORD: dbpassword
    volumes:
      - db-data:/var/lib/postgresql/data
    networks:
      - nextcloud-network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: nextcloud-redis
    command: redis-server --requirepass redispassword
    networks:
      - nextcloud-network
    restart: unless-stopped

  nextcloud:
    image: nextcloud:latest
    container_name: nextcloud-app
    ports:
      - "8080:80"
    environment:
      POSTGRES_HOST: db
      POSTGRES_DB: nextcloud
      POSTGRES_USER: nextcloud
      POSTGRES_PASSWORD: dbpassword
      REDIS_HOST: redis
      REDIS_HOST_PASSWORD: redispassword
      NEXTCLOUD_ADMIN_USER: admin
      NEXTCLOUD_ADMIN_PASSWORD: adminpassword
      NEXTCLOUD_TRUSTED_DOMAINS: localhost nextcloud.ejemplo.com
      OVERWRITEPROTOCOL: https
    volumes:
      - nextcloud-data:/var/www/html
      - ./custom-apps:/var/www/html/custom_apps
      - ./config:/var/www/html/config
    networks:
      - nextcloud-network
    depends_on:
      - db
      - redis
    restart: unless-stopped

  cron:
    image: nextcloud:latest
    container_name: nextcloud-cron
    entrypoint: /cron.sh
    volumes:
      - nextcloud-data:/var/www/html
    networks:
      - nextcloud-network
    depends_on:
      - nextcloud
    restart: unless-stopped

networks:
  nextcloud-network:
    driver: bridge

volumes:
  db-data:
  nextcloud-data:
```

---

## 📈 Monitoring Stack

```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus-data:/prometheus
    networks:
      - monitoring
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_USER: admin
      GF_SECURITY_ADMIN_PASSWORD: admin123
      GF_INSTALL_PLUGINS: grafana-clock-panel,grafana-simple-json-datasource
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning:ro
    networks:
      - monitoring
    depends_on:
      - prometheus
    restart: unless-stopped

  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    networks:
      - monitoring
    restart: unless-stopped

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    container_name: cadvisor
    ports:
      - "8080:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    networks:
      - monitoring
    restart: unless-stopped

  alertmanager:
    image: prom/alertmanager:latest
    container_name: alertmanager
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager/alertmanager.yml:/etc/alertmanager/alertmanager.yml:ro
      - alertmanager-data:/alertmanager
    networks:
      - monitoring
    restart: unless-stopped

networks:
  monitoring:
    driver: bridge

volumes:
  prometheus-data:
  grafana-data:
  alertmanager-data:
```

```yaml
# prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']
```

---

## 🔄 CI/CD Stack

```yaml
version: '3.8'

services:
  jenkins:
    image: jenkins/jenkins:lts
    container_name: jenkins
    user: root
    ports:
      - "8080:8080"
      - "50000:50000"
    environment:
      JAVA_OPTS: '-Djenkins.install.runSetupWizard=false'
    volumes:
      - jenkins-data:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock
    networks:
      - cicd-network
    restart: unless-stopped

  sonarqube:
    image: sonarqube:community
    container_name: sonarqube
    ports:
      - "9000:9000"
    environment:
      SONAR_JDBC_URL: jdbc:postgresql://postgres:5432/sonarqube
      SONAR_JDBC_USERNAME: sonar
      SONAR_JDBC_PASSWORD: sonarpassword
    volumes:
      - sonarqube-data:/opt/sonarqube/data
      - sonarqube-extensions:/opt/sonarqube/extensions
      - sonarqube-logs:/opt/sonarqube/logs
    networks:
      - cicd-network
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    container_name: sonar-postgres
    environment:
      POSTGRES_USER: sonar
      POSTGRES_PASSWORD: sonarpassword
      POSTGRES_DB: sonarqube
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - cicd-network
    restart: unless-stopped

  nexus:
    image: sonatype/nexus3:latest
    container_name: nexus
    ports:
      - "8081:8081"
      - "8082:8082"
    volumes:
      - nexus-data:/nexus-data
    networks:
      - cicd-network
    restart: unless-stopped

  registry:
    image: registry:2
    container_name: docker-registry
    ports:
      - "5000:5000"
    environment:
      REGISTRY_STORAGE_FILESYSTEM_ROOTDIRECTORY: /data
    volumes:
      - registry-data:/data
    networks:
      - cicd-network
    restart: unless-stopped

networks:
  cicd-network:
    driver: bridge

volumes:
  jenkins-data:
  sonarqube-data:
  sonarqube-extensions:
  sonarqube-logs:
  postgres-data:
  nexus-data:
  registry-data:
```

---

## 🚀 Comandos Rápidos

```bash
# Iniciar cualquier stack
docker-compose up -d

# Ver logs
docker-compose logs -f [servicio]

# Detener
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v

# Recrear contenedores
docker-compose up -d --force-recreate

# Escalar servicios
docker-compose up -d --scale worker=3

# Ver estado
docker-compose ps

# Ejecutar comando
docker-compose exec [servicio] bash
```

---

## 📚 Tips de Uso

### Variables de entorno

Crea un archivo `.env` en la misma carpeta:

```env
# .env
DB_PASSWORD=mi-password-secreto
API_PORT=3000
VERSION=latest
```

Y úsalo en el compose:

```yaml
services:
  api:
    image: myapi:${VERSION}
    ports:
      - "${API_PORT}:3000"
    environment:
      DB_PASSWORD: ${DB_PASSWORD}
```

### Backups automáticos

```yaml
services:
  backup:
    image: postgres:15-alpine
    volumes:
      - ./backups:/backups
    command: >
      sh -c '
      while true; do
        sleep 86400;
        pg_dump -h db -U user database > /backups/backup-$$(date +%Y%m%d).sql;
        find /backups -name "backup-*.sql" -mtime +7 -delete;
      done
      '
```

### Healthchecks

```yaml
services:
  api:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

---

## 📖 Recursos Adicionales

- 🔗 [Docker Samples](https://github.com/docker/awesome-compose)
- 🔗 [Compose Examples](https://docs.docker.com/compose/samples-for-compose/)
- 🔗 [Docker Hub](https://hub.docker.com/)

---

**💡 Tip:** Siempre revisa la documentación oficial de cada imagen para configuraciones específicas y mejores prácticas.
