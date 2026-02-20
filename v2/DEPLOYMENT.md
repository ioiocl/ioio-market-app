# IOIO V2 - Deployment Guide

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Git

### Setup

1. **Clone and navigate:**
```bash
cd v2
```

2. **Start with Docker Compose:**
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 5000
- Frontend on port 3000

3. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Admin Panel: http://localhost:3000/admin (password: admin123)

---

## 🌐 GCP Deployment with Terraform

### Prerequisites
- GCP account with billing enabled
- Terraform installed
- gcloud CLI configured

### Deploy to GCP

1. **Navigate to terraform directory:**
```bash
cd terraform
```

2. **Initialize Terraform:**
```bash
terraform init
```

3. **Review and apply:**
```bash
terraform plan
terraform apply
```

4. **Get the public IP:**
```bash
terraform output frontend_ip
```

5. **Access your site:**
```
http://<frontend_ip>
```

---

## 📝 Admin Panel

**URL:** `/admin`  
**Password:** `admin123` (change in production!)

### Features:
- ✅ Manage slider images (add, edit, delete)
- ✅ Manage events (add, edit, delete)
- ✅ Manage activities (add, edit, delete)
- ✅ Manage products (add, edit, delete with price, SKU, quantity)

---

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ioio_v2
DB_USER=postgres
DB_PASSWORD=postgres
ADMIN_PASSWORD=admin123
```

**Frontend:**
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🗄️ Database

### Default Data

The database is seeded with:
- **3 slider images** with CTA buttons
- **3 events** with dates and locations
- **3 activities** with durations
- **3 products** with prices, SKUs, and quantities

### Manual Database Access

```bash
docker-compose exec postgres psql -U postgres -d ioio_v2
```

---

## 🌍 Bilingual Support

- **Default language:** Spanish (ES)
- **Available languages:** Spanish, English
- **Switch language:** Click the language toggle in the header

---

## 📦 Tech Stack

- **Frontend:** React 18, Vite, TailwindCSS, i18next
- **Backend:** Node.js, Express, PostgreSQL
- **Deployment:** Docker, GCP Compute Engine, Terraform
- **State Management:** Zustand

---

## 🛠️ Development

### Run frontend only:
```bash
cd frontend
npm install
npm run dev
```

### Run backend only:
```bash
cd backend
npm install
npm run dev
```

---

## 🔒 Security Notes

**⚠️ IMPORTANT for Production:**

1. Change admin password in backend/.env
2. Use environment-specific database credentials
3. Enable HTTPS with SSL certificates
4. Configure CORS properly
5. Use secure session management

---

## 📞 Support

For issues or questions, contact the IOIO team.
