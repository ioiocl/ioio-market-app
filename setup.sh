#!/bin/bash

echo "🚀 Setting up IOIO E-Commerce Platform..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before continuing!"
    exit 1
fi

# Create uploads directory
mkdir -p backend/uploads
touch backend/uploads/.gitkeep

# Build and start containers
echo "🐳 Building Docker containers..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database setup
echo "📊 Setting up database..."
docker-compose exec backend npm run db:setup

echo "✅ Setup complete!"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo "   Admin Panel: http://localhost:3000/admin"
echo ""
echo "👤 Default admin credentials:"
echo "   Email: admin@ioio.com"
echo "   Password: admin123"
echo ""
echo "⚠️  Remember to change the admin password after first login!"
