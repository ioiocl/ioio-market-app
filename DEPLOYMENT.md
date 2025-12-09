# IOIO Deployment Guide

## Local Development with Docker

### Prerequisites
- Docker Desktop installed
- Docker Compose installed
- At least 4GB RAM available

### Quick Start

1. **Clone and Setup**:
   ```bash
   cd IOIO-app
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Run Setup Script**:
   
   **Linux/Mac**:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```
   
   **Windows**:
   ```cmd
   setup.bat
   ```

3. **Access the Application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Admin Panel: http://localhost:3000/admin

### Manual Setup

If you prefer manual setup:

```bash
# Create .env file
cp .env.example .env

# Start services
docker-compose up --build

# In another terminal, setup database
docker-compose exec backend npm run db:setup
```

### Stopping the Application

```bash
docker-compose down
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

## Production Deployment to Google Cloud

### Prerequisites
- Google Cloud Platform account
- gcloud CLI installed
- Terraform installed
- Service account with Editor role

### Steps

1. **Configure GCloud**:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **Create Service Account**:
   ```bash
   gcloud iam service-accounts create ioio-terraform
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:ioio-terraform@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/editor"
   gcloud iam service-accounts keys create terraform/key.json \
     --iam-account=ioio-terraform@YOUR_PROJECT_ID.iam.gserviceaccount.com
   ```

3. **Configure Terraform**:
   ```bash
   cd terraform
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values
   ```

4. **Deploy**:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/key.json"
   terraform init
   terraform plan
   terraform apply
   ```

5. **Get Deployment Info**:
   ```bash
   terraform output
   ```

### Environment Variables

Required environment variables (see `.env.example`):

- **Database**: `POSTGRES_*`
- **Backend**: `JWT_SECRET`, `PORT`
- **Payments**: `MERCADOPAGO_*`, `BTC_WALLET_ADDRESS`, `ETH_WALLET_ADDRESS`
- **GCloud**: `GCP_PROJECT_ID`, `GCP_REGION`

### Payment Integration

#### MercadoPago
1. Create account at https://www.mercadopago.com
2. Get credentials from Developer Dashboard
3. Add to `.env`:
   ```
   MERCADOPAGO_ACCESS_TOKEN=your_access_token
   MERCADOPAGO_PUBLIC_KEY=your_public_key
   ```

#### Cryptocurrency (BTC/ETH)
1. Create wallets for BTC and ETH
2. Add wallet addresses to `.env`:
   ```
   BTC_WALLET_ADDRESS=your_btc_address
   ETH_WALLET_ADDRESS=your_eth_address
   ```
3. Implement payment verification using blockchain APIs

### Database Migrations

The database schema is automatically created on first run. To reset:

```bash
# Backup first!
docker-compose exec postgres pg_dump -U ioio_user ioio_db > backup.sql

# Reset
docker-compose down -v
docker-compose up -d
docker-compose exec backend npm run db:setup
```

### Monitoring and Logs

#### Local Development
```bash
docker-compose logs -f
```

#### Google Cloud
```bash
# SSH into instances
gcloud compute ssh ioio-backend --zone=us-central1-a
gcloud compute ssh ioio-frontend --zone=us-central1-a

# View logs
sudo journalctl -u docker -f
```

### Backup and Restore

#### Database Backup
```bash
# Local
docker-compose exec postgres pg_dump -U ioio_user ioio_db > backup.sql

# Restore
docker-compose exec -T postgres psql -U ioio_user ioio_db < backup.sql
```

#### GCloud SQL Backup
Backups are automatically enabled in Terraform configuration.

### Security Checklist

- [ ] Change default admin password
- [ ] Update JWT_SECRET in production
- [ ] Use strong database passwords
- [ ] Enable HTTPS (use Cloud Load Balancer)
- [ ] Restrict database access
- [ ] Enable Cloud SQL SSL
- [ ] Set up monitoring and alerts
- [ ] Configure CORS properly
- [ ] Review firewall rules

### Troubleshooting

#### Database Connection Issues
```bash
# Check if database is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Verify connection
docker-compose exec backend npm run db:setup
```

#### Port Conflicts
If ports 3000, 5000, or 5432 are in use:
```bash
# Find process using port
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Linux/Mac

# Kill process or change ports in docker-compose.yml
```

#### Build Errors
```bash
# Clean rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Scaling

For production scaling:
1. Use Cloud Run instead of Compute Engine
2. Implement Cloud CDN for static assets
3. Use Cloud SQL read replicas
4. Add Redis for session management
5. Implement Cloud Load Balancer
6. Use Cloud Storage for uploads

### Cost Optimization

Current setup (e2-micro + db-f1-micro): ~$15-20/month

To reduce costs:
- Use Cloud Run (pay per use)
- Schedule instance stop/start
- Use preemptible instances for dev
- Optimize database queries
- Implement caching

## Support

For issues or questions:
- Check logs first
- Review environment variables
- Verify network connectivity
- Check firewall rules
