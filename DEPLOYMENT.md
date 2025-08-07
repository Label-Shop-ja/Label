# 🚀 DEPLOYMENT GUIDE - LABEL

## 📋 Pre-requisitos

### Servidor
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Windows Server 2019+
- **RAM**: Mínimo 2GB, recomendado 4GB
- **Storage**: Mínimo 20GB SSD
- **Node.js**: v18+
- **MongoDB**: v5.0+ (local o Atlas)
- **Nginx**: v1.18+ (recomendado)

### Dominio y SSL
- Dominio configurado (ej: `label.com`)
- Certificado SSL (Let's Encrypt recomendado)

## 🔧 Deployment Automático

### 1. Verificación Pre-Deploy
```bash
# Ejecutar verificaciones
node scripts/preDeployCheck.js

# Debe mostrar: "🎉 ALL CHECKS PASSED!"
```

### 2. Deploy Completo
```bash
# Deployment automático
node scripts/deploy.js

# Genera:
# - frontend/dist/ (build optimizado)
# - deployment-info.json (info del deploy)
# - Verificaciones completas
```

## 🐳 Deployment con Docker

### Dockerfile
```dockerfile
# Multi-stage build
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build:prod

FROM node:18-alpine AS backend
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ ./
COPY --from=frontend-build /app/frontend/dist ./public

EXPOSE 5000
CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  label-app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongo:27017/label_production
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:5.0
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - label-app
    restart: unless-stopped

volumes:
  mongo_data:
```

## ⚙️ Configuración del Servidor

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name label.com www.label.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name label.com www.label.com;

    ssl_certificate /etc/nginx/ssl/label.com.crt;
    ssl_certificate_key /etc/nginx/ssl/label.com.key;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Frontend (SPA)
    location / {
        try_files $uri $uri/ /index.html;
        root /var/www/label/frontend/dist;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health checks
    location /health {
        proxy_pass http://localhost:5000;
        access_log off;
    }
}
```

### PM2 Configuration
```json
{
  "name": "label-backend",
  "script": "server.js",
  "cwd": "/var/www/label/backend",
  "instances": "max",
  "exec_mode": "cluster",
  "env": {
    "NODE_ENV": "production",
    "PORT": 5000
  },
  "log_file": "/var/log/pm2/label.log",
  "error_file": "/var/log/pm2/label-error.log",
  "out_file": "/var/log/pm2/label-out.log",
  "max_memory_restart": "1G"
}
```

## 📊 Variables de Entorno de Producción

### Backend (.env.production)
```bash
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/label_production
JWT_SECRET=your-super-secure-jwt-secret-min-32-chars
JWT_ACCESS_SECRET=production-access-secret-very-long
JWT_REFRESH_SECRET=production-refresh-secret-very-long
EXCHANGE_RATE_API_KEY=your-api-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=https://label.com
CORS_ORIGIN=https://label.com,https://www.label.com
SESSION_SECRET=your-session-secret
```

### Frontend (.env.production)
```bash
VITE_BACKEND_URL=https://label.com/api
VITE_APP_ENV=production
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GA4_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

## 🔄 Deployment Steps

### 1. Preparar Servidor
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Instalar Nginx
sudo apt install nginx -y
```

### 2. Subir Código
```bash
# Clonar repositorio
git clone <your-repo> /var/www/label
cd /var/www/label

# Ejecutar deployment
node scripts/deploy.js
```

### 3. Configurar Servicios
```bash
# Copiar archivos de configuración
sudo cp nginx.conf /etc/nginx/sites-available/label
sudo ln -s /etc/nginx/sites-available/label /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Iniciar aplicación con PM2
cd backend
pm2 start ecosystem.config.json
pm2 save
pm2 startup
```

### 4. SSL con Let's Encrypt
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado
sudo certbot --nginx -d label.com -d www.label.com

# Auto-renovación
sudo crontab -e
# Añadir: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📈 Monitoreo Post-Deploy

### Health Checks
```bash
# Verificar servicios
curl https://label.com/health
curl https://label.com/ping

# Logs en tiempo real
pm2 logs label-backend
tail -f /var/log/nginx/access.log
```

### Métricas
- **Uptime**: https://label.com/health
- **Performance**: https://label.com/metrics
- **Logs**: PM2 dashboard o archivos de log

## 🆘 Troubleshooting

### Problemas Comunes
1. **502 Bad Gateway**: Backend no está corriendo
   ```bash
   pm2 restart label-backend
   ```

2. **CORS Errors**: Verificar CORS_ORIGIN en .env
3. **Database Connection**: Verificar MONGO_URI
4. **SSL Issues**: Renovar certificado con certbot

### Rollback
```bash
# Volver a versión anterior
git checkout <previous-commit>
node scripts/deploy.js
pm2 restart label-backend
```

## 📞 Soporte

- **Logs**: `/var/log/pm2/` y `backend/logs/`
- **Monitoring**: Health endpoints y métricas
- **Backup**: Configurar backup automático de MongoDB

---

**🎉 ¡Label está listo para producción!** 🎉