# IOIO V2 - Espacio de Trabajo Colaborativo

Modern landing page with slider, events, activities, and shop sections.

## Features

- 🎨 Modern, responsive design
- 🖼️ Hero slider with 3 slides (image + text + CTA)
- 📅 Events section (3 default events)
- 🎯 Activities section (3 default activities)
- 🛍️ Shop section (3 products with price, SKU, quantity)
- 🌐 Bilingual support (Spanish default, English)
- 🔐 Admin panel for content management

## Tech Stack

**Frontend:**
- React 18
- Vite
- TailwindCSS
- i18next (bilingual)
- Swiper (slider)

**Backend:**
- Node.js
- Express
- PostgreSQL

**Deployment:**
- GCP Compute Engine
- Terraform

## Structure

```
v2/
├── frontend/          # React app
├── backend/           # Node.js API
├── database/          # SQL schemas
└── terraform/         # GCP deployment
```

## Setup

```bash
# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Run frontend dev server
cd frontend && npm run dev

# Run backend dev server
cd backend && npm run dev
```

## Deploy

```bash
cd terraform
terraform init
terraform apply
```
