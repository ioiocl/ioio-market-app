# IOIO E-Commerce Platform - Getting Started

## 🎯 Overview

IOIO is a full-stack e-commerce platform with a cyberpunk/makerspace aesthetic, built with:
- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Node.js + Express (Hexagonal Architecture)
- **Database**: PostgreSQL
- **Deployment**: Docker + Terraform + Google Cloud

## 🚀 Quick Start (5 minutes)

### 1. Prerequisites
- Docker Desktop installed and running
- 4GB RAM available
- Ports 3000, 5000, 5432 available

### 2. Setup

**Windows**:
```cmd
cd IOIO-app
copy .env.example .env
setup.bat
```

**Linux/Mac**:
```bash
cd IOIO-app
cp .env.example .env
chmod +x setup.sh
./setup.sh
```

### 3. Access

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Admin Panel**: http://localhost:3000/admin

**Default Admin Login**:
- Email: `admin@ioio.com`
- Password: `admin123`

## 📁 Project Structure

```
IOIO-app/
├── backend/                 # Node.js API (Hexagonal Architecture)
│   ├── src/
│   │   ├── domain/         # Business logic & entities
│   │   │   ├── entities/   # Domain models
│   │   │   └── ports/      # Interfaces (repositories, services)
│   │   ├── application/    # Use cases
│   │   └── infrastructure/ # Adapters (DB, HTTP, external services)
│   │       ├── database/   # PostgreSQL connection
│   │       ├── repositories/ # Data access implementations
│   │       └── http/       # Controllers, routes, middleware
│   ├── Dockerfile
│   └── package.json
│
├── frontend/               # React application
│   ├── src/
│   │   ├── api/           # API client & services
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand state management
│   │   ├── i18n/          # Translations (EN/ES)
│   │   └── App.jsx
│   ├── public/            # Static assets
│   ├── Dockerfile
│   └── package.json
│
├── database/              # SQL scripts
│   ├── init.sql          # Schema creation
│   └── seed.sql          # Sample data (12 products, events, experiments)
│
├── terraform/             # Infrastructure as Code
│   ├── main.tf           # GCP resources
│   ├── variables.tf
│   └── outputs.tf
│
├── docker-compose.yml     # Local development
├── .env.example          # Environment template
└── README.md
```

## 🎨 Features

### Customer Features
- ✅ Product gallery with categories (Clothes & Merchandising)
- ✅ Product detail pages
- ✅ Shopping cart
- ✅ Checkout with multiple payment methods
- ✅ Events showcase
- ✅ Experiments/blog section
- ✅ Bilingual support (English/Spanish)
- ✅ Cyberpunk/Makerspace themed UI

### Admin Features
- ✅ Product management (CRUD)
- ✅ Order management
- ✅ Banner management (3 rotating images)
- ✅ Event management
- ✅ Experiment management
- ✅ User management

### Payment Methods
- 💳 MercadoPago (requires credentials)
- ₿ Bitcoin (BTC)
- Ξ Ethereum (ETH)

## 🔧 Configuration

### Required Environment Variables

Edit `.env` file with your values:

```env
# Database
POSTGRES_PASSWORD=your_secure_password

# Backend
JWT_SECRET=your_jwt_secret_change_in_production

# Payments (optional for testing)
MERCADOPAGO_ACCESS_TOKEN=your_token
MERCADOPAGO_PUBLIC_KEY=your_key
BTC_WALLET_ADDRESS=your_btc_address
ETH_WALLET_ADDRESS=your_eth_address
```

## 📦 Sample Data

The database is pre-seeded with:
- **12 Products**: 6 clothes + 6 merchandising items
- **2 Categories**: Clothes & Merchandising
- **2 Events**: Fashion show & LED workshop
- **2 Experiments**: Smart fabrics & sustainable materials
- **3 Banners**: Rotating homepage images
- **1 Admin user**: admin@ioio.com / admin123

## 🎯 Key Technologies

### Backend (Hexagonal Architecture)
- **Domain Layer**: Pure business logic
- **Application Layer**: Use cases
- **Infrastructure Layer**: Adapters for DB, HTTP, external services
- **Benefits**: Testable, maintainable, framework-independent

### Frontend
- **React 18**: Modern hooks & components
- **Vite**: Fast build tool
- **TailwindCSS**: Utility-first styling
- **Zustand**: Lightweight state management
- **i18next**: Internationalization
- **Axios**: HTTP client

### Database
- **PostgreSQL 15**: Relational database
- **UUID**: Primary keys
- **JSONB**: Flexible data storage
- **Triggers**: Auto-update timestamps

## 🌐 API Endpoints

### Public
- `GET /api/products` - List products
- `GET /api/categories` - List categories
- `GET /api/events` - List events
- `GET /api/experiments` - List experiments
- `GET /api/banners` - Get banners
- `GET /api/company-info` - Company information

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Cart (session-based)
- `GET /api/cart` - Get cart
- `POST /api/cart/items` - Add item
- `PUT /api/cart/items/:id` - Update quantity
- `DELETE /api/cart/items/:id` - Remove item

### Orders (authenticated)
- `POST /api/orders` - Create order
- `GET /api/orders/my` - My orders
- `GET /api/orders/:id` - Order details

### Admin (admin role required)
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/orders` - All orders
- `PATCH /api/orders/:id/status` - Update order status

## 🚢 Deployment

### Local Development
```bash
docker-compose up
```

### Google Cloud Platform
```bash
cd terraform
terraform init
terraform apply
```

See `DEPLOYMENT.md` for detailed instructions.

## 🔒 Security Notes

⚠️ **Important**: Before going to production:

1. Change admin password immediately
2. Update `JWT_SECRET` to a strong random value
3. Use strong database passwords
4. Enable HTTPS
5. Configure CORS properly
6. Review firewall rules
7. Enable Cloud SQL SSL

## 🐛 Troubleshooting

### Database won't start
```bash
docker-compose down -v
docker-compose up -d postgres
```

### Port already in use
```bash
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000
```

### Frontend can't connect to backend
Check `VITE_API_URL` in `.env` and restart:
```bash
docker-compose restart frontend
```

## 📚 Next Steps

1. **Add your logo**: Replace `frontend/public/logo.png` with your company logo
2. **Configure payments**: Add MercadoPago credentials to `.env`
3. **Customize products**: Use admin panel to add/edit products
4. **Update company info**: Edit via admin panel or database
5. **Deploy to cloud**: Follow `DEPLOYMENT.md`

## 🤝 Development Workflow

### Adding a new feature

1. **Backend** (Hexagonal Architecture):
   - Create entity in `domain/entities/`
   - Define port in `domain/ports/`
   - Implement use case in `application/use-cases/`
   - Create repository in `infrastructure/repositories/`
   - Add controller in `infrastructure/http/controllers/`
   - Register routes in `infrastructure/http/routes/`

2. **Frontend**:
   - Add API service in `api/services.js`
   - Create page component in `pages/`
   - Add route in `App.jsx`
   - Update translations in `i18n/locales/`

### Running tests
```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📞 Support

- Check `DEPLOYMENT.md` for deployment issues
- Review `README.md` for general information
- Check Docker logs: `docker-compose logs -f`

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ using Hexagonal Architecture and Cyberpunk aesthetics**
