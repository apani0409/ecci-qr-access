# ECCI Control - Production Deployment Guide

## 🚀 Pre-requisites

- Docker & Docker Compose installed
- Domain name configured (e.g., ecci-control.com)
- SSL certificates (Let's Encrypt recommended)
- SMTP credentials for email service

---

## 📋 Deployment Steps

### 1. Clone Repository
```bash
git clone <repository-url>
cd ecci-control
```

### 2. Configure Environment Variables
```bash
# Copy example file
cp .env.prod.example .env.prod

# Edit with your values
nano .env.prod
```

**Required variables:**
- `DB_PASSWORD` - Strong database password
- `SECRET_KEY` - Generate with: `openssl rand -hex 32`
- `SMTP_USER` and `SMTP_PASSWORD` - Email credentials
- `GRAFANA_PASSWORD` - Monitoring dashboard password

### 3. SSL Certificates

#### Option A: Let's Encrypt (Recommended)
```bash
# Install certbot
sudo apt install certbot

# Generate certificate
sudo certbot certonly --standalone -d ecci-control.com -d www.ecci-control.com

# Copy certificates
sudo mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/ecci-control.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/ecci-control.com/privkey.pem nginx/ssl/key.pem
```

#### Option B: Self-Signed (Development)
```bash
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem
```

### 4. Initialize Database
```bash
# Start only database first
docker compose -f docker-compose.prod.yml up -d db

# Wait for database to be ready
sleep 10

# Run migrations
docker compose -f docker-compose.prod.yml run --rm backend alembic upgrade head

# Create demo users (optional)
docker compose -f docker-compose.prod.yml run --rm backend python init_db.py
```

### 5. Start All Services
```bash
docker compose -f docker-compose.prod.yml up -d
```

### 6. Verify Deployment
```bash
# Check service status
docker compose -f docker-compose.prod.yml ps

# Check logs
docker compose -f docker-compose.prod.yml logs -f

# Test health endpoint
curl https://ecci-control.com/health
```

---

## 🔧 Service Configuration

### Services Running:
- **nginx**: Reverse proxy with SSL (ports 80, 443)
- **backend**: FastAPI application
- **frontend**: React web application
- **db**: PostgreSQL database
- **backup**: Automated daily backups (2 AM)
- **prometheus**: Metrics collection (port 9090)
- **grafana**: Metrics visualization (port 3001)

### Access Points:
- **Main App**: https://ecci-control.com
- **API Docs**: https://ecci-control.com/docs
- **Health Check**: https://ecci-control.com/health
- **Grafana**: http://localhost:3001
- **Prometheus**: http://localhost:9090

---

## 💾 Backup & Restore

### Automatic Backups
Backups run daily at 2 AM and are stored in `./backups/`

Retention: 7 days (configurable via `BACKUP_RETENTION_DAYS`)

### Manual Backup
```bash
docker compose -f docker-compose.prod.yml exec db pg_dump -U ecci_user ecci_control | gzip > backup_manual_$(date +%Y%m%d).sql.gz
```

### Restore from Backup
```bash
# Stop services
docker compose -f docker-compose.prod.yml stop backend

# Restore
gunzip -c backup_20260120_020000.sql.gz | \
  docker compose -f docker-compose.prod.yml exec -T db psql -U ecci_user ecci_control

# Restart services
docker compose -f docker-compose.prod.yml start backend
```

Or use the provided script:
```bash
./scripts/restore.sh /backups/backup_ecci_control_20260120_020000.sql.gz
```

---

## 📊 Monitoring

### Grafana Setup
1. Access: http://your-server:3001
2. Login: admin / (password from .env.prod)
3. Add Prometheus data source: http://prometheus:9090
4. Import dashboards for API metrics

### Prometheus Metrics
- API request rates
- Response times
- Error rates
- Database connections
- System resources

### Logs
```bash
# View all logs
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f backend

# Nginx access logs
tail -f nginx/logs/access.log

# Nginx error logs
tail -f nginx/logs/error.log
```

---

## 🔒 Security Checklist

- [ ] Change all default passwords
- [ ] Generate strong SECRET_KEY
- [ ] Configure proper CORS origins
- [ ] Enable SSL/HTTPS
- [ ] Setup firewall (allow only 80, 443, 22)
- [ ] Configure rate limiting
- [ ] Regular security updates
- [ ] Backup encryption (optional)
- [ ] Setup monitoring alerts

### Firewall Configuration (UFW)
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

## 🔄 Updates & Maintenance

### Update Application
```bash
# Pull latest code
git pull

# Rebuild and restart
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

### Update Dependencies
```bash
# Backend
docker compose -f docker-compose.prod.yml exec backend pip install --upgrade -r requirements.txt

# Frontend
docker compose -f docker-compose.prod.yml exec frontend npm update
```

### Database Migrations
```bash
# Create new migration
docker compose -f docker-compose.prod.yml exec backend alembic revision --autogenerate -m "description"

# Apply migrations
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

---

## 🚨 Troubleshooting

### Service Won't Start
```bash
# Check logs
docker compose -f docker-compose.prod.yml logs [service-name]

# Restart specific service
docker compose -f docker-compose.prod.yml restart [service-name]

# Full restart
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

### Database Connection Issues
```bash
# Check database is running
docker compose -f docker-compose.prod.yml ps db

# Test connection
docker compose -f docker-compose.prod.yml exec db psql -U ecci_user -d ecci_control -c "SELECT 1;"
```

### SSL Certificate Issues
```bash
# Verify certificate
openssl x509 -in nginx/ssl/cert.pem -text -noout

# Test SSL
curl -vI https://ecci-control.com
```

### Email Not Sending
1. Verify SMTP credentials in .env.prod
2. Check backend logs: `docker compose logs backend | grep -i email`
3. Test with Gmail App Password (not regular password)

---

## 📞 Support

For issues or questions:
1. Check logs: `docker compose -f docker-compose.prod.yml logs`
2. Verify health: `curl https://ecci-control.com/health`
3. Review environment variables in .env.prod

---

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/getting-started/)
- [PostgreSQL Backup](https://www.postgresql.org/docs/current/backup.html)
