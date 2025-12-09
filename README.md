# IOIO E-Commerce Platform

A cyberpunk/makerspace styled e-commerce platform for selling clothes and merchandising, with event and experiment showcases.

## Features

- 🛍️ Product gallery with categories (Clothes & Merchandising)
- 🛒 Shopping cart functionality
- 💳 Multiple payment methods (MercadoPago, BTC, ETH)
- 🌐 Bilingual support (English/Spanish)
- 🎨 Cyberpunk/Makerspace aesthetic
- 👨‍💼 Admin panel for product and user management
- 📰 Events and experiments sections
- 🎠 Rotating banner carousel (3 images)

## Tech Stack

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Containerization**: Docker + Docker Compose
- **Deployment**: Terraform + Google Cloud Platform

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Google Cloud account (for deployment)

## Quick Start

### Local Development with Docker

1. Clone the repository
2. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

3. Fill in the required environment variables in `.env`

4. Start the application:
   ```bash
   docker-compose up --build
   ```

5. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Admin Panel: http://localhost:3000/admin

### Database Setup

The database will be automatically initialized with the schema and seed data on first run.

To manually run the setup:
```bash
docker-compose exec backend npm run db:setup
```

## Environment Variables

See `.env.example` for all required environment variables:

- Database configuration
- JWT secrets
- Payment gateway credentials (MercadoPago, BTC, ETH)
- Google Cloud credentials (for deployment)

## Deployment to Google Cloud

1. Configure your GCloud credentials
2. Update `terraform/variables.tf` with your project details
3. Run Terraform:
   ```bash
   cd terraform
   terraform init
   terraform plan
   terraform apply
   ```

## Project Structure

```
IOIO-app/
├── backend/           # Node.js Express API
├── frontend/          # React application
├── database/          # SQL scripts and migrations
├── terraform/         # Infrastructure as Code
├── docker-compose.yml # Local development setup
└── .env.example       # Environment variables template
```

## Default Admin Credentials

- Email: admin@ioio.com
- Password: admin123

**⚠️ Change these credentials immediately after first login!**

## License

MIT
